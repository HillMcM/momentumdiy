export interface ImageAsset {
  mimeType: string;
  data: string; // Base64 string
}

export interface BrandSettings {
  colors: [string, string, string, string];
  logo: ImageAsset | null;
  icon: ImageAsset | null;
  font1: string;
  font2: string;
  postText: string;
}

export interface GeneratedImage {
  id: string;
  imageData: string; // Base64 string
  createdAt: number; // Timestamp
}

export interface AspectRatio {
  name: string;
  value: string; // e.g., '1:1', '9:16'
  label: string;
}

export interface BrandPreset {
  id: string;
  name: string;
  settings: BrandSettings;
}