// src/types/env.d.ts
declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_BACKEND_URL: string;
    // Add other environment variables here
  }
}

// For Vite projects
interface ImportMetaEnv {
  readonly VITE_BACKEND_URL: string;
  // Add other Vite environment variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}