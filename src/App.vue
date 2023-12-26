
<template>
	<div class="card p-fluid">
    <Toolbar class="p-mb-4">
      <template #start>
        <Button label="Add" 
          icon="pi pi-plus" 
          class="p-button-success p-mr-2" 
          @click="openNew" />

        <Button label="Delete" 
          icon="pi pi-trash" 
          class="p-button-danger" 
          @click="confirmDeleteSelected" 
          :disabled="!selectedlineItems || !selectedlineItems.length" />
      </template>
    </Toolbar>
    <DataTable :value="lineItems" lazy paginator :first="first" :rows="10" ref="dt" dataKey="id"
      :totalRecords="totalRecords" :loading="loading" @page="onPage($event)" @sort="onSort($event)" 
      v-model:selection="selectedlineItems" :selectAll="selectAll" @select-all-change="onSelectAllChange" 
      @row-select="onRowSelect" @row-unselect="onRowUnselect" tableStyle="min-width: 75rem"
      editMode="cell" @cell-edit-complete="onCellEditComplete"
      showGridlines
      >
      <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
      <Column v-for="col of columns" :key="col.field" :field="col.field" :header="col.header" style="width: 25%" sortable>
          <template #editor="{ data, field }">
              <InputText v-model="data[field]" autofocus />
          </template>
      </Column>
      <Column :exportable="false" style="white-space: nowrap;">
        <template #body="slotProps">
            <Button icon="pi pi-pencil" 
            class="p-button-rounded p-button-success p-mr-2" 
            @click="editLineItem(slotProps.data)" />

            <Button icon="pi pi-trash" 
            class="p-button-rounded p-button-danger" 
            @click="confirmDeleteLineItem(slotProps.data)" />
        </template>
      </Column>
    </DataTable>
    <Dialog v-model:visible="lineItemDialog" 
      :style="{width: '450px'}" 
      header="Line Item Details" 
      :modal="true" 
      class="p-fluid" >
      
      <template v-for="col of columns">
        <div class="p-field">
            <label for="{{ col.field }}">{{ col.header }}</label>
            <InputText id="{{ col.field }}" v-model.trim="lineItem[col.field]" required="false" autofocus :class="{'p-invalid': submitted && !lineItem[col.field]}" />
            <small class="p-error" v-if="submitted && !lineItem[col.field]">{{ col.header }} is required.</small>
        </div>
      </template>

      <template #footer>
          <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideDialog"/>
          <Button label="Save" icon="pi pi-check" class="p-button-text" @click="saveLineItem" />
      </template>
    </Dialog>

    <Dialog v-model:visible="deleteLineItemDialog" :style="{width: '450px'}" header="Confirm" :modal="true">
      <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle p-mr-3" style="font-size: 2rem" />
        <span v-if="lineItem">Are you sure you want to delete this line?</span>
      </div>

      <template #footer>
        <Button label="No" icon="pi pi-times" class="p-button-text" @click="deleteLineItemDialog = false"/>
        <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteLineItem" />
      </template>
    </Dialog>

    <Dialog v-model:visible="deleteLineItemsDialog" :style="{width: '450px'}" header="Confirm" :modal="true">
      <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle p-mr-3" style="font-size: 2rem" />
        <span v-if="lineItem">Are you sure you want to delete the selected line items?</span>
      </div>

      <template #footer>
        <Button label="No" icon="pi pi-times" class="p-button-text" @click="deleteLineItemsDialog = false"/>
        <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteSelectedLineItems" />
      </template>
    </Dialog>
	</div>
</template>

<script setup>
  import { ref, onMounted } from 'vue';
  import DataTable from 'primevue/datatable'
  import Column from 'primevue/column'
  import InputText from 'primevue/inputtext'
  import Button from 'primevue/button';
  import Toolbar from 'primevue/toolbar';
  import Dialog from 'primevue/dialog';
  import axios from 'axios'
  // import { lineItemservice } from '@/service/lineItemservice';

  onMounted(() => {
    loading.value = true;

    lazyParams.value = {
      first: dt.value.first,
      rows: dt.value.rows,
      sortField: null,
      sortOrder: null,
      // filters: filters.value
    };

    loadLazyData();
  });
  const point = '/api/modprimevueextra_items'
  const dt = ref();
  const loading = ref(false);
  const totalRecords = ref(0);
  const lineItems = ref();
  const selectedlineItems = ref();
  const selectAll = ref(false);
  const first = ref(0);
  // const filters = ref({
  //     'name': {value: '', matchMode: 'contains'},
  //     'country.name': {value: '', matchMode: 'contains'},
  //     'company': {value: '', matchMode: 'contains'},
  //     'representative.name': {value: '', matchMode: 'contains'},
  // });

  const lazyParams = ref({});
  const columns = ref([
    {field: 'name', header: 'name'},
    {field: 'action', header: 'action'},
    {field: 'desc', header: 'desc'},

  ]);
  
  //add row
  const lineItem = ref({});
  const submitted = ref(false);
  const lineItemDialog = ref(false);
  // const lineItems = ref([]);

  const openNew = () => 
  {
    lineItem.value = {};
    submitted.value = false;
    lineItemDialog.value = true;
  };
  const hideDialog = () => 
  {
    lineItemDialog.value = false;
    submitted.value = false;
  };
  const saveLineItem = () => 
  {
    submitted.value = true;

    if (lineItem.value.id) 
    {
      // lineItems.value[findIndexById(lineItem.value.id)] = lineItem.value;
      axios.patch(point+'/'+lineItem.value.id, lineItem.value)
      .then(response => lineItems.value[findIndexById(lineItem.value.id)] = lineItem.value);
      // toast.add({severity:'success', summary: 'Successful', detail: 'Raw Material Request Updated', life: 3000});
    }
    else 
    {
      // lineItem.value.id = 9999;
      axios.put(point, lineItem.value)
      .then((response) =>{ 
        loading.value = true;

        lazyParams.value = {
          first: dt.value.first,
          rows: dt.value.rows,
          sortField: null,
          sortOrder: null,
          // filters: filters.value
        };

        loadLazyData();
      });
      //lineItems.value.push(lineItem.value);
      // toast.add({severity:'success', summary: 'Successful', detail: 'Raw Material Request Created', life: 3000});
    }

    lineItemDialog.value = false;
    lineItem.value = {};
  };
  //add row end
  //edit row in dialog
  const editLineItem = (item) => 
  {
    lineItem.value = {...item};
    lineItemDialog.value = true;
  };
  const findIndexById = (id) => 
  {
    
    let index = -1;
    for (let i = 0; i < lineItems.value.length; i++) 
    {
      if (lineItems.value[i].id === id) 
      {
          index = i;
          break;
      }
    }
    return index;
  };
  //delete row
  const deleteLineItemDialog = ref(false);
  const deleteLineItemsDialog = ref(false);
  const confirmDeleteLineItem = (item) => 
  {
    lineItem.value = item;
    deleteLineItemDialog.value = true;
  };
  const deleteLineItem = () => 
  {
    axios.delete(point+'/'+lineItem.value.id)
      .then((response) => {
        lineItems.value = lineItems.value.filter(val => 
          val.id !== lineItem.value.id);

        deleteLineItemDialog.value = false;
        lineItem.value = {};
        // toast.add(
        //     {
        //         severity:'success', 
        //         summary: 'Successful', 
        //         detail: 'Line Item Deleted', 
        //         life: 3000
        //     });
      });
  };
  const confirmDeleteSelected = () => 
  {
      deleteLineItemsDialog.value = true;
  };
  const deleteSelectedLineItems = () => 
  {
    let ids = [];
    selectedlineItems.value.forEach(function(entry) {
      ids.push(entry.id)
      // console.log(entry);
    });
    axios.delete(point + '?ids=' + ids.join(','))
      .then((response) => {
        lineItems.value = lineItems.value.filter(val => !selectedlineItems.value.includes(val));
        deleteLineItemsDialog.value = false;
        selectedlineItems.value = null;
        // toast.add({severity:'success', summary: 'Successful', detail: 'Line Items Deleted', life: 3000});
      });
    
  };
  const onCellEditComplete = (event) => {
    let { data, newValue, field } = event;
    // console.log('onCellEditComplete',data)
    // console.log('data.id',data.id)
    if (newValue.trim().length > 0){
      axios.patch(point+'/'+data.id, {[field]: newValue})
      .then(response => data[field] = newValue);
      // data[field] = newValue;
    }else event.preventDefault();
  };
  const loadLazyData = (event) => {
    loading.value = true;
    lazyParams.value = { ...lazyParams.value, first: event?.first || first.value };
    // console.log('lazyParams.value',lazyParams.value)
    // console.log('event',event)
    let params = { 
      limit: 10, 
      setTotal: 1, 
      offset:lazyParams.value.first,
      sortField:lazyParams.value.sortField,
      sortOrder:lazyParams.value.sortOrder,
    }
    axios.get(point,{ params: params})
    .then(function (response) {
      // console.log(response.data);
      // console.log(response.status);
      // console.log(response.statusText);
      // console.log(response.headers);
      // console.log(response.config);
      lineItems.value = response.data.rows;
      totalRecords.value = response.data.total;
      loading.value = false;
    });
  };
  const onPage = (event) => {
    lazyParams.value = event;
    loadLazyData(event);
  };
  const onSort = (event) => {
    lazyParams.value = event;
    loadLazyData(event);
  };
  // const onFilter = (event) => {
  //     lazyParams.value.filters = filters.value ;
  //     loadLazyData(event);
  // };
  const onSelectAllChange = (event) => {
    selectAll.value = event.checked;
    
    if (selectAll.value) {
      // lineItemservice.getlineItems().then(data => {
      //     selectAll.value = true;
      //     selectedlineItems.value = data.lineItems;
      // });
      selectAll.value = true;
      selectedlineItems.value = lineItems.value;
    }
    else {
      selectAll.value = false;
      selectedlineItems.value = [];
    }
  };
  const onRowSelect = () => {
    selectAll.value = selectedlineItems.value.length === totalRecords.value;
  };
  const onRowUnselect = () => {
    selectAll.value = false;
  };

</script>
