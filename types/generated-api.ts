// Auto-generated TypeScript types from OpenAPI 3.1.0 specification
// Generated from: http://localhost:8000/openapi.json

// ============================================================================
// COMMON INTERFACES
// ============================================================================

export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface HTTPValidationError {
  detail: ValidationError[];
}

export interface HealthCheckResponse {
  service: string;
  status: string;
  version: string;
  timestamp: string;
}

export interface DetailedHealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  version: string;
  active_tasks: number;
  api_key_configured: boolean;
}

// ============================================================================
// REQUEST INTERFACES
// ============================================================================

export interface UploadRequest {
  file: File;
  nif: string;
  ano_exercicio: string;
  designacao_social: string;
  email: string;
  context?: string;
}

export interface UploadRequestFormData {
  file: File;
  nif: string;
  ano_exercicio: string;
  designacao_social: string;
  email: string;
  context?: string;
}

// ============================================================================
// RESPONSE INTERFACES
// ============================================================================

export interface ProcessResponse {
  task_id: string;
  status: 'processing' | 'uploading' | 'extracting' | 'analyzing' | 'generating' | 'completed' | 'error';
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
  metadata: AnalysisMetadata;
  dados_financeiros: FinancialData;
  analise: FinancialAnalysis;
  ficheiros_gerados: GeneratedFiles;
  download_urls: DownloadUrls;
}

export interface AnalysisMetadata {
  nif: string;
  ano_exercicio: string;
  designacao_social: string;
  email: string;
  data_processamento: string;
}

export interface FinancialData {
  ativo_total?: number;
  passivo_total?: number;
  capital_proprio?: number;
  volume_negocios: number;
  ebitda: number;
  autonomia_financeira: number;
  liquidez_geral: number;
  margem_ebitda: number;
}

export interface FinancialAnalysis {
  rating: 'BAIXO' | 'MÉDIO' | 'ALTO' | 'CRÍTICO';
  score?: number;
  recomendacoes: string[];
  risk_factors?: string[];
  strengths?: string[];
  opportunities?: string[];
}

export interface GeneratedFiles {
  excel: string;
  json: string;
}

export interface DownloadUrls {
  excel: string;
  json: string;
}

export interface TaskListResponse {
  tasks: TaskSummary[];
}

export interface TaskSummary {
  task_id: string;
  status: 'uploading' | 'extracting' | 'analyzing' | 'generating' | 'completed' | 'error';
  created_at: string;
  completed_at?: string;
}

export interface DeleteTaskResponse {
  message: string;
}

export interface RootResponse {
  service: string;
  status: string;
  version: string;
  timestamp: string;
}

// ============================================================================
// UPLOAD PROGRESS INTERFACES
// ============================================================================

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadState {
  taskId: string | null;
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'error';
  progress: UploadProgress;
  error: string | null;
}

// ============================================================================
// ERROR INTERFACES
// ============================================================================

export interface ApiErrorResponse {
  detail: string;
  message?: string;
  code?: string;
  status_code?: number;
  timestamp?: string;
  path?: string;
}

export interface ValidationErrorDetail {
  field: string;
  message: string;
  value?: any;
}

// ============================================================================
// CONFIGURATION INTERFACES
// ============================================================================

export interface ApiConfiguration {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  authToken: string;
  headers?: Record<string, string>;
}

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
  retryableStatuses: number[];
  retryableErrors: string[];
}

// ============================================================================
// BUSINESS LOGIC INTERFACES
// ============================================================================

export interface CompanyData {
  nif: string;
  designacao_social: string;
  ano_exercicio: string;
  email: string;
  context?: string;
}

export interface ProcessingMetrics {
  uploadStartTime: number;
  uploadEndTime?: number;
  processingStartTime?: number;
  processingEndTime?: number;
  totalProcessingTime?: number;
  uploadSpeed?: number; // bytes per second
}

export interface UserPreferences {
  autoDownload?: boolean;
  emailNotifications?: boolean;
  language?: 'pt' | 'en';
  theme?: 'light' | 'dark' | 'auto';
}

export interface ApplicationState {
  user: {
    isAuthenticated: boolean;
    preferences: UserPreferences;
  };
  currentTask: TaskState;
  taskHistory: TaskSummary[];
  connectivity: {
    isOnline: boolean;
    lastConnected?: string;
  };
}

// ============================================================================
// EXTENDED TYPES FOR ENHANCED FUNCTIONALITY
// ============================================================================

export type TaskStatusEvent = TaskStatus & {
  type: 'status_update';
  timestamp: string;
};

export type ErrorEvent = {
  type: 'error';
  error: ApiErrorResponse;
  timestamp: string;
  taskId?: string;
};

export type ApiEvent = TaskStatusEvent | ErrorEvent;

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

export type FileDownloadType = 'excel' | 'json';

export type ProcessingStage = 'uploading' | 'extracting' | 'analyzing' | 'generating' | 'completed' | 'error';

// ============================================================================
// VALIDATION INTERFACES
// ============================================================================

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationErrorDetail[];
  warnings: string[];
}

export interface FileValidationResult extends ValidationResult {
  fileInfo?: {
    name: string;
    size: number;
    type: string;
    lastModified: number;
  };
}

export interface CompanyValidationResult extends ValidationResult {
  companyData?: CompanyData;
}

// ============================================================================
// CACHE AND OFFLINE INTERFACES
// ============================================================================

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  version: string;
}

export interface OfflineOperation {
  id: string;
  type: 'upload' | 'download' | 'status_check';
  data: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

export interface SyncStatus {
  pendingOperations: number;
  lastSync: string;
  isOnline: boolean;
  syncInProgress: boolean;
}

// ============================================================================
// WEBSOCKET INTERFACES (for future implementation)
// ============================================================================

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
  taskId?: string;
}

export interface WebSocketConnection {
  isConnected: boolean;
  reconnectAttempts: number;
  lastConnected?: string;
  subscriptions: Set<string>;
}

// ============================================================================
// ANALYTICS INTERFACES
// ============================================================================

export interface ProcessingAnalytics {
  totalTasks: number;
  successfulTasks: number;
  failedTasks: number;
  averageProcessingTime: number;
  successRate: number;
  errorDistribution: Record<string, number>;
  processingStages: Record<ProcessingStage, number>;
}

export interface UserAnalytics {
  tasksProcessed: number;
  totalProcessingTime: number;
  averageFileSize: number;
  preferredFileType: string;
  peakUsageHours: number[];
  errorRate: number;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type ApiErrorResponseWithData<T = any> = ApiErrorResponse & {
  data?: T;
  details?: T;
};

export type ApiResponse<T = any> = {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  timestamp: string;
};

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isTaskStatus(obj: any): obj is TaskStatus {
  return obj &&
         typeof obj.task_id === 'string' &&
         typeof obj.status === 'string' &&
         typeof obj.created_at === 'string' &&
         ['uploading', 'extracting', 'analyzing', 'generating', 'completed', 'error'].includes(obj.status);
}

export function isAnalysisResult(obj: any): obj is AnalysisResult {
  return obj &&
         typeof obj.metadata === 'object' &&
         typeof obj.dados_financeiros === 'object' &&
         typeof obj.analise === 'object' &&
         typeof obj.ficheiros_gerados === 'object' &&
         typeof obj.download_urls === 'object';
}

export function isValidationError(obj: any): obj is ValidationError {
  return obj &&
         Array.isArray(obj.loc) &&
         typeof obj.msg === 'string' &&
         typeof obj.type === 'string';
}

export function isApiError(obj: any): obj is ApiErrorResponse {
  return obj &&
         typeof obj.detail === 'string';
}

// ============================================================================
// ENUMS
// ============================================================================

export enum TaskStatusEnum {
  UPLOADING = 'uploading',
  EXTRACTING = 'extracting',
  ANALYZING = 'analyzing',
  GENERATING = 'generating',
  COMPLETED = 'completed',
  ERROR = 'error'
}

export enum RiskRating {
  BAIXO = 'BAIXO',
  MEDIO = 'MÉDIO',
  ALTO = 'ALTO',
  CRITICO = 'CRÍTICO'
}

export enum FileDownloadType {
  EXCEL = 'excel',
  JSON = 'json'
}

export enum ErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  PROCESSING_ERROR = 'PROCESSING_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// ============================================================================
// DEFAULT VALUES
// ============================================================================

export const DEFAULT_API_CONFIG: ApiConfiguration = {
  baseURL: process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8000',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
  authToken: 'Bearer testtoken123'
};

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  backoffFactor: 2,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
  retryableErrors: [
    ErrorCode.NETWORK_ERROR,
    ErrorCode.TIMEOUT,
    ErrorCode.CONNECTION_ERROR
  ]
};

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  autoDownload: false,
  emailNotifications: true,
  language: 'pt',
  theme: 'auto'
};

// ============================================================================
// CONSTANTS
// ============================================================================

export const API_ENDPOINTS = {
  ROOT: '/',
  HEALTH: '/health',
  UPLOAD: '/api/upload',
  STATUS: '/api/status',
  RESULT: '/api/result',
  DOWNLOAD: '/api/download',
  TASKS: '/api/tasks'
} as const;

export const FILE_CONSTRAINTS = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['application/pdf'],
  ALLOWED_EXTENSIONS: ['.pdf']
} as const;

export const TASK_TIMEOUTS = {
  UPLOAD: 60000,        // 60 seconds
  PROCESSING: 300000,   // 5 minutes
  POLLING_INTERVAL: 2000, // 2 seconds
  MAX_POLLING_ATTEMPTS: 150 // 5 minutes max
} as const;

export const CACHE_DURATIONS = {
  TASK_STATUS: 5000,    // 5 seconds
  USER_PREFERENCES: 300000, // 5 minutes
  HEALTH_CHECK: 60000   // 1 minute
} as const;