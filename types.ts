export interface FillerBreakdown {
  word: string;
  count: number;
}

export interface SpeechAnalysisResult {
  totalFillerWords: number;
  fillerWordBreakdown: FillerBreakdown[];
  transcriptionSnippet: string;
  feedback: string;
  score: number; // 0-100
}

export enum AppState {
  IDLE = 'IDLE',
  RECORDING = 'RECORDING',
  ANALYZING = 'ANALYZING',
  RESULTS = 'RESULTS',
  ERROR = 'ERROR'
}

export interface AudioState {
  isRecording: boolean;
  recordingTime: number; // in seconds
  audioBlob: Blob | null;
}
