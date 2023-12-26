import { defineConfig , loadEnv} from 'vite'
import vue from '@vitejs/plugin-vue'
import {parse, resolve} from 'path'
import { fileURLToPath } from 'url'
import external_packages from './external_packages.json' with { "type": "json" }

// https://vitejs.dev/config/
export default defineConfig(async ({mode})=>{
    process.env = {...process.env,...loadEnv(mode, './')}
    
    return {
        appType: 'custom',
        base: mode == 'production' ? process.env.VITE_APP_BASE_URL : '/',
        publicDir: false,
        server:{
            host: false,
            port: +process.env.VITE_APP_PORT,
            cors: true,
            origin: `${process.env.VITE_APP_PROTOCOL}://${process.env.VITE_APP_HOST}:${process.env.VITE_APP_PORT}`
        },
        build: {
            manifest: false,
            copyPublicDir: false,
            minify: true,
            modulePreload: false,
            emptyOutDir: true,
            assetsDir: '',
            cssCodeSplit: true,
            outDir: process.env.VITE_APP_OUTPUT_DIR,
            rollupOptions: {
                external: ['vue','primevue', ...external_packages],
                // plugins: [ {
                //     name: 'replace-importer', 
                //     renderChunk(code) {
                //       // add esm cdn link
                //       code = code.replace(/from.*("|'vue"|')/g, 'from "/assets/components/gtsapi/js/web/vue.global.prod.js"')
                //       return { code, map: null }
                //     }
                // }],
                input: {
                    main: resolve(__dirname,'src/main.js')
                },
                output: {
                    assetFileNames: ({name}) => {
                        const {ext} = parse(name)
                        switch(ext){
                            case '.css':
                                return `css/web/primeicons/[name][extname]`
                            case '.jpg':
                            case '.png':
                            case '.webp':
                            case '.avif':
                            case '.svg':
                                return `css/web/primeicons/img/[name]-[hash][extname]`
                            default:
                                return `css/web/primeicons/[ext]/[name]-[hash][extname]`
                        }
                    },
                    chunkFileNames: 'js/chunks/[name]-[hash].js',
                    entryFileNames: 'js/[name].js',
                    globals: {
                        vue: 'Vue'
                    }
                }
            }
        },
        plugins: [vue()],
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src',import.meta.url))
            }
        }
    }
})
