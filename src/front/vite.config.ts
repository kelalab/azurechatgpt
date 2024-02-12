import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    //base: '/ui/',
    proxy: {
      "/message": "http://127.0.0.1:8080",
      "/messages": "http://127.0.0.1:8080",
      "/get_source": "http://127.0.0.1:8080",
      "/thumb": "http://127.0.0.1:8080",
      "/add_document": "http://127.0.0.1:8080",
      "/bot": "http://127.0.0.1:8080",
    },
  },
  build: {
    //outDir: "../backend/static",
    outDir: "./server/static",
    cssCodeSplit: false,
  },
});
