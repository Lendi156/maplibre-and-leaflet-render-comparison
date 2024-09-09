import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import Inspect from 'vite-plugin-inspect'
import { visualizer } from "rollup-plugin-visualizer"


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    Inspect({
      build: true,
      outputDir: '.vite-inspect'
    }),
    visualizer({
      emitFile: true,
      filename: "stats.html",
    })
  ],
})
