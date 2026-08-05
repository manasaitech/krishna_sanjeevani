export interface UploadResult {
  key: string;
  size: number;
  contentType: string;
  etag: string;
}

export interface StorageFile {
  body: ReadableStream;
  contentType: string;
  size: number;
  etag?: string;
}
