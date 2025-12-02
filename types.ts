export interface CaricatureRequest {
  image: File;
}

export interface CaricatureResult {
  styleName: string;
  imageBase64: string;
  id: string;
}

export interface StyleOption {
  id: string;
  name: string;
  prompt: string;
}

export enum LoadingState {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  GENERATING = 'GENERATING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR',
}