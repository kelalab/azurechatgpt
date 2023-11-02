//import { defineConfig } from 'vite';
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080,
    //base: '/ui/',
    proxy: {
      "/message": "http://127.0.0.1:8000",
    },
  },
  build: {
    outDir: "../backend/static",
  },
});