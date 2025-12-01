export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface UploadResponse {
  task_id: string
  message: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
}

export interface TaskStatus {
  task_id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  message?: string
  result?: TaskResult
  error?: string
  created_at: string
  updated_at: string
}

export interface TaskResult {
  analysis_url?: string
  excel_url?: string
  json_data?: any
  metadata?: {
    company_name: string
    nif: string
    period: string
    processing_time: number
  }
}

export interface HealthStatus {
  status: 'healthy' | 'unhealthy'
  timestamp: string
  version: string
  active_tasks: number
  api_key_configured: boolean
}

export type ViewState = 'upload' | 'processing' | 'results' | 'error'

export interface FormData {
  nif: string
  ano_exercicio: string
  designacao_social: string
  email: string
}

export interface UploadProgress {
  percentage: number
  status: string
  message?: string
}

export interface FinancialData {
  nome_empresa: string
  nif: string
  periodo: string
  cae?: string
  volume_negocios: number
  custo_mercadorias: number
  custo_materias: number
  fornecimento_servicos: number
  custos_pessoal: number
  depreciacoes: number
  resultados_operacionais: number
  resultados_financeiros: number
  resultados_antes_imposto: number
  imposto_periodo: number
  resultado_liquido: number
  ativo_corrente: number
  ativo_nao_corrente: number
  total_ativo: number
  passivo_corrente: number
  passivo_nao_corrente: number
  total_passivo: number
  capital_proprio: number
}

export interface FinancialAnalysis {
  autonomia_financeira: number
  liquidez_geral: number
  margem_ebitda: number
  rentabilidade_ativos: number
  endividamento: number
  nivel_risco: 'BAIXO' | 'MÉDIO' | 'ALTO' | 'CRÍTICO'
  pontos_fortes: string[]
  pontos_fracos: string[]
  recomendacoes: string[]
  memoria_descritiva: string
}