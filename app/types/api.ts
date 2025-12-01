// API Types matching backend response format

export interface ProcessRequest {
  nif: string;
  ano_exercicio: string;
  designacao_social: string;
  email: string;
  context?: string;
}

export interface ProcessResponse {
  task_id: string;
  status: string;
  message: string;
}

export interface TaskStatus {
  task_id: string;
  status: 'uploading' | 'extracting' | 'analyzing' | 'generating' | 'completed' | 'error';
  created_at: string;
  completed_at?: string;
  result?: AnalysisResult;
  error?: string;
}

export interface AnalysisResult {
  metadata: {
    nif: string;
    ano_exercicio: string;
    designacao_social: string;
    email: string;
    data_processamento: string;
  };
  dados_financeiros: {
    ativo_total?: number;
    passivo_total?: number;
    capital_proprio?: number;
    volume_negocios: number;
    ebitda: number;
    autonomia_financeira: number;
    liquidez_geral: number;
    margem_ebitda: number;
  };
  analise: {
    rating: 'BAIXO' | 'MÉDIO' | 'ALTO' | 'CRÍTICO';
    score?: number;
    recomendacoes: string[];
  };
  ficheiros_gerados: {
    excel: string;
    json: string;
  };
  download_urls: {
    excel: string;
    json: string;
  };
}

export interface FormData {
  nif: string;
  ano_exercicio: string;
  designacao_social: string;
  email: string;
  context?: string;
}

export type ViewState = 'landing' | 'upload' | 'processing' | 'results';

export interface DarkModeContextType {
  isDark: boolean;
  toggleDarkMode: () => void;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}