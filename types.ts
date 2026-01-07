export enum WorkflowType {
  TOPIC_TO_VIDEO = 'TOPIC_TO_VIDEO',
  TRANSCRIPT_TO_AUDIO = 'TRANSCRIPT_TO_AUDIO',
}

export enum ProjectStatus {
  IDLE = 'IDLE',
  GENERATING_SCRIPT = 'GENERATING_SCRIPT',
  GENERATING_AUDIO = 'GENERATING_AUDIO',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

export enum VoiceName {
  Puck = 'Puck',
  Charon = 'Charon',
  Kore = 'Kore',
  Fenrir = 'Fenrir',
  Zephyr = 'Zephyr',
}

export interface SEOMetadata {
  title: string;
  description: string;
  tags: string[];
  pinnedComment: string;
}

export interface Project {
  id: string;
  name: string;
  type: WorkflowType;
  createdAt: number;
  status: ProjectStatus;
  
  // Input
  topic?: string;
  originalTranscript?: string;

  // Output - Script
  script: string;
  seoMetadata?: SEOMetadata;

  // Output - Audio
  audioBlob?: Blob;
  audioUrl?: string;
  selectedVoice: VoiceName;

  // Error handling
  error?: string;
}

export interface ScriptGenerationResponse {
  script: string;
  seo: SEOMetadata;
}
