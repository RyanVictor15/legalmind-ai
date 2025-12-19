import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // Garante que o servidor escute corretamente
  },
  esbuild: {
    loader: 'jsx', // Força o esbuild a entender JSX
    include: /src\/.*\.jsx?$/,
    exclude: [],
  },
})