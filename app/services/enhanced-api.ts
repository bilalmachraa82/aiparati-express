import { ProcessRequest, ProcessResponse, TaskStatus, AnalysisResult, UploadProgress } from '@/types/api';

// Enhanced error types for better error handling
export class ApiError extends Error {
  public status: number;
  public code?: string;
  public retryable: boolean;
  public details?: any;

  constructor(
    message: string,
    status: number = 0,
    code?: string,
    retryable: boolean = false,
    details?: any
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.retryable = retryable;
    this.details = details;
  }
}

// Configuration for retry logic
export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
  retryableStatuses: number[];
  retryableErrors: string[];
}

// Request/Response interceptor interface
export interface ApiInterceptor {
  onRequest?(config: RequestConfig): Promise<RequestConfig>;
  onResponse?(response: Response, config: RequestConfig): Promise<Response>;
  onError?(error: ApiError, config: RequestConfig): Promise<ApiError | Response>;
}

export interface RequestConfig {
  url: string;
  method: string;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
  metadata?: Record<string, any>;
}

// Default configuration
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  backoffFactor: 2,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
  retryableErrors: ['NETWORK_ERROR', 'TIMEOUT', 'CONNECTION_ERROR']
};

export class EnhancedApiService {
  private baseURL: string;
  private authToken: string;
  private retryConfig: RetryConfig;
  private interceptors: ApiInterceptor[] = [];
  private offlineQueue: Array<{ config: RequestConfig; resolve: Function; reject: Function }> = [];
  private isOnline: boolean = true;
  private requestCache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  constructor(options: {
    baseURL?: string;
    authToken?: string;
    retryConfig?: Partial<RetryConfig>;
  } = {}) {
    this.baseURL = options.baseURL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8000');
    this.authToken = options.authToken || 'Bearer testtoken123';
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...options.retryConfig };

    // Initialize online/offline detection
    this.initializeConnectivityDetection();
  }

  // Add interceptor for request/response handling
  addInterceptor(interceptor: ApiInterceptor): void {
    this.interceptors.push(interceptor);
  }

  // Remove interceptor
  removeInterceptor(interceptor: ApiInterceptor): void {
    const index = this.interceptors.indexOf(interceptor);
    if (index > -1) {
      this.interceptors.splice(index, 1);
    }
  }

  // Initialize online/offline detection
  private initializeConnectivityDetection(): void {
    this.isOnline = navigator.onLine;

    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processOfflineQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  // Process queued requests when coming back online
  private async processOfflineQueue(): Promise<void> {
    const queue = [...this.offlineQueue];
    this.offlineQueue = [];

    for (const { config, resolve, reject } of queue) {
      try {
        const response = await this.executeRequest(config);
        resolve(response);
      } catch (error) {
        reject(error);
      }
    }
  }

  // Calculate exponential backoff delay
  private calculateDelay(attempt: number): number {
    const delay = this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffFactor, attempt);
    const jitter = Math.random() * 0.3 * delay; // Add 30% jitter to prevent thundering herd
    return Math.min(delay + jitter, this.retryConfig.maxDelay);
  }

  // Check if error is retryable
  private isRetryableError(error: any, attempt: number): boolean {
    if (attempt >= this.retryConfig.maxRetries) {
      return false;
    }

    if (error instanceof ApiError) {
      return this.retryConfig.retryableStatuses.includes(error.status) ||
             this.retryConfig.retryableErrors.includes(error.code || '');
    }

    return false;
  }

  // Execute request with retry logic
  private async executeRequestWithRetry(config: RequestConfig, attempt: number = 0): Promise<Response> {
    try {
      const response = await this.executeRequest(config);

      // Successful response
      if (response.ok) {
        return response;
      }

      // Create error for non-2xx responses
      const errorData = await response.json().catch(() => null);
      throw new ApiError(
        errorData?.detail || errorData?.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData?.code,
        this.isRetryableError({ status: response.status }, attempt),
        errorData
      );

    } catch (error) {
      // Check if we should retry
      if (this.isRetryableError(error, attempt)) {
        const delay = this.calculateDelay(attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.executeRequestWithRetry(config, attempt + 1);
      }

      // Re-throw non-retryable errors
      throw error;
    }
  }

  // Execute single request
  private async executeRequest(config: RequestConfig): Promise<Response> {
    // Apply request interceptors
    let processedConfig = { ...config };
    for (const interceptor of this.interceptors) {
      if (interceptor.onRequest) {
        processedConfig = await interceptor.onRequest(processedConfig);
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), processedConfig.timeout || 30000);

    try {
      const response = await fetch(`${this.baseURL}${processedConfig.url}`, {
        method: processedConfig.method,
        headers: {
          'Authorization': this.authToken,
          'Content-Type': 'application/json',
          'X-Client-Version': '1.0.0',
          ...processedConfig.headers,
        },
        body: processedConfig.body,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Apply response interceptors
      let processedResponse = response;
      for (const interceptor of this.interceptors) {
        if (interceptor.onResponse) {
          processedResponse = await interceptor.onResponse(processedResponse, processedConfig);
        }
      }

      return processedResponse;

    } catch (error) {
      clearTimeout(timeoutId);

      let apiError: ApiError;

      if (error.name === 'AbortError') {
        apiError = new ApiError('Request timeout', 408, 'TIMEOUT', true);
      } else if (error instanceof TypeError && error.message.includes('fetch')) {
        apiError = new ApiError('Network connection failed', 0, 'NETWORK_ERROR', true);
      } else if (error instanceof ApiError) {
        apiError = error;
      } else {
        apiError = new ApiError('Unexpected error occurred', 0, 'UNKNOWN_ERROR', false);
      }

      // Apply error interceptors
      for (const interceptor of this.interceptors) {
        if (interceptor.onError) {
          const result = await interceptor.onError(apiError, processedConfig);
          if (result instanceof Response) {
            return result;
          }
          apiError = result;
        }
      }

      throw apiError;
    }
  }

  // Handle offline scenarios
  private async handleOfflineRequest(config: RequestConfig): Promise<any> {
    if (!this.isOnline && config.method === 'GET') {
      // Try to return cached data for GET requests
      const cached = this.requestCache.get(config.url);
      if (cached && Date.now() - cached.timestamp < cached.ttl) {
        return cached.data;
      }
    }

    if (!this.isOnline) {
      // Queue the request for when we come back online
      return new Promise((resolve, reject) => {
        this.offlineQueue.push({ config, resolve, reject });
      });
    }

    return null;
  }

  // Generic request method
  private async request<T>(config: RequestConfig): Promise<T> {
    // Handle offline scenarios
    const offlineResult = await this.handleOfflineRequest(config);
    if (offlineResult) {
      return offlineResult;
    }

    const response = await this.executeRequestWithRetry(config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.detail || errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status
      );
    }

    const data = await response.json();

    // Cache successful GET requests
    if (config.method === 'GET') {
      this.requestCache.set(config.url, {
        data,
        timestamp: Date.now(),
        ttl: 60000 // 1 minute cache
      });
    }

    return data;
  }

  // Enhanced file upload with progress tracking and retry logic
  async uploadFile(
    file: File,
    data: ProcessRequest,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<ProcessResponse> {
    return new Promise((resolve, reject) => {
      const attemptUpload = async (attempt: number = 0): Promise<void> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('nif', data.nif);
        formData.append('ano_exercicio', data.ano_exercicio);
        formData.append('designacao_social', data.designacao_social);
        formData.append('email', data.email);
        if (data.context) {
          formData.append('context', data.context);
        }

        const xhr = new XMLHttpRequest();

        // Progress tracking
        if (onProgress) {
          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const progress: UploadProgress = {
                loaded: event.loaded,
                total: event.total,
                percentage: (event.loaded / event.total) * 100
              };
              onProgress(progress);
            }
          });
        }

        xhr.addEventListener('load', async () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response);
            } catch (error) {
              reject(new ApiError('Invalid response format', 0, 'PARSE_ERROR', true));
            }
          } else {
            const errorData = await this.parseErrorResponse(xhr.responseText);
            const apiError = new ApiError(
              errorData?.detail || errorData?.message || `Upload failed with status ${xhr.status}`,
              xhr.status,
              errorData?.code,
              this.isRetryableError({ status: xhr.status }, attempt),
              errorData
            );

            if (this.isRetryableError(apiError, attempt)) {
              const delay = this.calculateDelay(attempt);
              setTimeout(() => attemptUpload(attempt + 1), delay);
            } else {
              reject(apiError);
            }
          }
        });

        xhr.addEventListener('error', async () => {
          const apiError = new ApiError('Network error during upload', 0, 'NETWORK_ERROR', true);

          if (this.isRetryableError(apiError, attempt)) {
            const delay = this.calculateDelay(attempt);
            setTimeout(() => attemptUpload(attempt + 1), delay);
          } else {
            reject(apiError);
          }
        });

        xhr.addEventListener('timeout', () => {
          const apiError = new ApiError('Upload timeout', 408, 'TIMEOUT', true);

          if (this.isRetryableError(apiError, attempt)) {
            const delay = this.calculateDelay(attempt);
            setTimeout(() => attemptUpload(attempt + 1), delay);
          } else {
            reject(apiError);
          }
        });

        xhr.timeout = 60000; // 60 seconds timeout
        xhr.open('POST', `${this.baseURL}/api/upload`);
        xhr.setRequestHeader('Authorization', this.authToken);
        xhr.send(formData);
      };

      attemptUpload();
    });
  }

  private async parseErrorResponse(responseText: string): Promise<any> {
    try {
      return JSON.parse(responseText);
    } catch {
      return {};
    }
  }

  async getTaskStatus(taskId: string): Promise<TaskStatus> {
    return this.request<TaskStatus>({
      url: `/api/status/${taskId}`,
      method: 'GET',
    });
  }

  async getTaskResult(taskId: string): Promise<AnalysisResult> {
    return this.request<AnalysisResult>({
      url: `/api/result/${taskId}`,
      method: 'GET',
    });
  }

  async downloadFile(taskId: string, fileType: 'excel' | 'json'): Promise<Blob> {
    const response = await this.executeRequestWithRetry({
      url: `/api/download/${taskId}/${fileType}`,
      method: 'GET',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.detail || errorData.message || `Download failed with status ${response.status}`,
        response.status
      );
    }

    return response.blob();
  }

  async pollTaskStatus(
    taskId: string,
    onUpdate: (status: TaskStatus) => void,
    interval: number = 2000
  ): Promise<void> {
    const poll = async (attempt: number = 0): Promise<void> => {
      try {
        const status = await this.getTaskStatus(taskId);
        onUpdate(status);

        // Stop polling if task is completed or failed
        if (status.status === 'completed' || status.status === 'error') {
          return;
        }

        // Continue polling with exponential backoff on errors
        const delay = attempt > 0 ? Math.min(interval * Math.pow(1.5, attempt), 30000) : interval;
        setTimeout(() => poll(0), delay);
      } catch (error) {
        console.error('Polling error:', error);

        // Continue polling with exponential backoff, but with a limit
        if (attempt < 5) {
          const delay = Math.min(interval * Math.pow(2, attempt), 30000);
          setTimeout(() => poll(attempt + 1), delay);
        } else {
          // Max retry attempts reached, stop polling
          const errorStatus: TaskStatus = {
            task_id: taskId,
            status: 'error',
            created_at: new Date().toISOString(),
            error: 'Failed to poll for status updates'
          };
          onUpdate(errorStatus);
        }
      }
    };

    poll();
  }

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request<{ status: string; timestamp: string }>({
      url: '/health',
      method: 'GET',
    });
  }

  // Clear cache
  clearCache(): void {
    this.requestCache.clear();
  }

  // Get connectivity status
  isOnlineStatus(): boolean {
    return this.isOnline;
  }

  // Get offline queue length
  getOfflineQueueLength(): number {
    return this.offlineQueue.length;
  }
}

// Create enhanced instance with default interceptors
export const enhancedApiService = new EnhancedApiService();

// Add default logging interceptor
enhancedApiService.addInterceptor({
  onRequest: async (config) => {
    console.log(`🚀 API Request: ${config.method} ${config.url}`);
    return config;
  },
  onResponse: async (response, config) => {
    console.log(`✅ API Response: ${config.method} ${config.url} - ${response.status}`);
    return response;
  },
  onError: async (error, config) => {
    console.error(`❌ API Error: ${config.method} ${config.url} - ${error.message}`, error);
    return error;
  },
});

// Optimistic update helper
export class OptimisticUpdateManager {
  private pendingUpdates = new Map<string, any>();

  // Add optimistic update
  addUpdate<T>(key: string, data: T): T {
    this.pendingUpdates.set(key, data);
    return data;
  }

  // Confirm optimistic update
  confirmUpdate(key: string): void {
    this.pendingUpdates.delete(key);
  }

  // Rollback optimistic update
  rollbackUpdate(key: string): any {
    const data = this.pendingUpdates.get(key);
    this.pendingUpdates.delete(key);
    return data;
  }

  // Get pending update
  getPendingUpdate<T>(key: string): T | undefined {
    return this.pendingUpdates.get(key);
  }

  // Clear all pending updates
  clearAll(): void {
    this.pendingUpdates.clear();
  }
}

export const optimisticUpdateManager = new OptimisticUpdateManager();