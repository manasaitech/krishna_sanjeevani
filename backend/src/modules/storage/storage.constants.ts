export const STORAGE_CONSTANTS = {
  AUDIO_SIZE_LIMIT: 50 * 1024 * 1024, // 50MB
  IMAGE_SIZE_LIMIT: 5 * 1024 * 1024,  // 5MB
  AUDIO_MIME_TYPES: [
    "audio/mpeg",
    "audio/mp3",
    "audio/x-mpeg",
    "audio/x-mp3",
    "audio/mpeg3",
    "audio/x-mpeg3",
  ],
  IMAGE_MIME_TYPES: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ],
  PATHS: {
    AUDIO_UPLOADS: "songs/uploads",
    AUDIO_PROCESSED: "songs/processed",
    IMAGES: "images",
    THUMBNAILS: "images/thumbnails",
    AVATARS: "images/avatars",
  },
};
