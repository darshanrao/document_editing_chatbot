// Application configuration
export const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || '/api',
  },
  features: {
    enableEmail: process.env.NEXT_PUBLIC_ENABLE_EMAIL === 'true',
    enableDownload: process.env.NEXT_PUBLIC_ENABLE_DOWNLOAD === 'true',
  },
  upload: {
    maxFileSizeMB: parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB || '10'),
    allowedFileTypes: (process.env.NEXT_PUBLIC_ALLOWED_FILE_TYPES || '.docx').split(','),
  },
} as const;
