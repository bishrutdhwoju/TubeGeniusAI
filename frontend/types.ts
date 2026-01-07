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
  Achernar = "achernar",
  Achird = "achird",
  Algenib = "algenib",
  Algieba = "algieba",
  Alnilam = "alnilam",
  Aoede = "aoede",
  Autonoe = "autonoe",
  Callirrhoe = "callirrhoe",
  Charon = "charon",
  Despina = "despina",
  Enceladus = "enceladus",
  Erinome = "erinome",
  Fenrir = "fenrir",
  Gacrux = "gacrux",
  Iapetus = "iapetus",
  Kore = "kore",
  Laomedeia = "laomedeia",
  Leda = "leda",
  Orus = "orus",
  Puck = "puck",
  Pulcherrima = "pulcherrima",
  Rasalgethi = "rasalgethi",
  Sadachbia = "sadachbia",
  Sadaltager = "sadaltager",
  Schedar = "schedar",
  Sulafat = "sulafat",
  Umbriel = "umbriel",
  Vindemiatrix = "vindemiatrix",
  Zephyr = "zephyr",
  Zubenelgenubi = "zubenelgenubi",
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
