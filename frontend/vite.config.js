import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    host: true, // Разрешить доступ с внешних хостов
    allowedHosts: [
      'unjudicative-hilton-spatially.ngrok-free.dev',
      '.ngrok-free.dev', // Разрешить все ngrok домены
      '.ngrok.io',
      'localhost'
    ]
  }
})
