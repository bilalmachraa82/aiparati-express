import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import {
  enhancedApiService,
  optimisticUpdateManager,
  ApiError
} from '@/app/services/enhanced-api';
import {
  TaskStatus,
  AnalysisResult,
  UploadRequest,
  UploadProgress,
  ProcessResponse,
  FileDownloadType,
  ProcessingStage,
  ApplicationState,
  UserPreferences
} from '@/types/generated-api';

// Hook for file upload with optimistic updates
export function useFileUpload() {
  const [uploadState, setUploadState] = useState<TaskStatus>({
    taskId: null,
    status: 'idle',
    progress: { loaded: 0, total: 0, percentage: 0 },
    error: null
  });

  const [optimisticTask, setOptimisticTask] = useState<TaskStatus | null>(null);

  const uploadFile = useCallback(async (
    file: File,
    requestData: UploadRequest,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string> => {
    setUploadState({
      taskId: null,
      status: 'uploading',
      progress: { loaded: 0, total: file.size, percentage: 0 },
      error: null
    });

    try {
      // Optimistic update: assume upload will succeed
      const optimisticTaskId = `temp_${Date.now()}`;
      const optimisticStatus: TaskStatus = {
        task_id: optimisticTaskId,
        status: 'processing',
        created_at: new Date().toISOString()
      };

      optimisticUpdateManager.addUpdate(optimisticTaskId, optimisticStatus);
      setOptimisticTask(optimisticStatus);

      const response = await enhancedApiService.uploadFile(file, requestData, (progress) => {
        setUploadState(prev => ({
          ...prev,
          progress
        }));
        onProgress?.(progress);
      });

      // Confirm optimistic update
      if (optimisticTaskId) {
        optimisticUpdateManager.confirmUpdate(optimisticTaskId);
      }

      setUploadState({
        taskId: response.task_id,
        status: 'processing',
        progress: { loaded: file.size, total: file.size, percentage: 100 },
        error: null
      });

      return response.task_id;

    } catch (error) {
      // Rollback optimistic update
      if (optimisticTask?.task_id) {
        optimisticUpdateManager.rollbackUpdate(optimisticTask.task_id);
      }

      const errorMessage = error instanceof ApiError ? error.message : 'Upload failed';
      setUploadState({
        taskId: null,
        status: 'error',
        progress: { loaded: 0, total: 0, percentage: 0 },
        error: errorMessage
      });

      throw error;
    }
  }, []);

  const resetUpload = useCallback(() => {
    setUploadState({
      taskId: null,
      status: 'idle',
      progress: { loaded: 0, total: 0, percentage: 0 },
      error: null
    });
    setOptimisticTask(null);
  }, []);

  return {
    uploadState,
    optimisticTask,
    uploadFile,
    resetUpload,
    isUploading: uploadState.status === 'uploading' || uploadState.status === 'processing'
  };
}

// Hook for task status polling with optimistic updates
export function useTaskStatus(taskId: string | null) {
  const [taskStatus, setTaskStatus] = useState<TaskStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const [pollingCount, setPollingCount] = useState(0);

  const startPolling = useCallback(() => {
    if (!taskId) return;

    setIsLoading(true);
    setError(null);

    enhancedApiService.pollTaskStatus(
      taskId,
      (status) => {
        setTaskStatus(status);
        setIsLoading(false);
        setError(null);

        // Stop polling if task is completed or failed
        if (status.status === 'completed' || status.status === 'error') {
          if (pollingRef.current) {
            clearTimeout(pollingRef.current);
            pollingRef.current = null;
          }
        }

        setPollingCount(prev => prev + 1);
      },
      2000 // 2 second interval
    );
  }, [taskId]);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearTimeout(pollingRef.current);
      pollingRef.current = null;
    }
    setIsLoading(false);
  }, []);

  const getTaskStatus = useCallback(async () => {
    if (!taskId) return null;

    try {
      setIsLoading(true);
      const status = await enhancedApiService.getTaskStatus(taskId);
      setTaskStatus(status);
      setError(null);
      return status;
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Failed to get task status';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [taskId]);

  // Optimistic update helpers
  const updateStatusOptimistically = useCallback((newStatus: Partial<TaskStatus>) => {
    if (!taskStatus) return;

    const optimisticUpdate = { ...taskStatus, ...newStatus };
    optimisticUpdateManager.addUpdate(taskStatus.task_id, optimisticUpdate);
    setTaskStatus(optimisticUpdate);
  }, [taskStatus]);

  const confirmStatusUpdate = useCallback(() => {
    if (taskStatus) {
      optimisticUpdateManager.confirmUpdate(taskStatus.task_id);
    }
  }, [taskStatus]);

  const rollbackStatusUpdate = useCallback(() => {
    if (taskStatus) {
      const rollbackData = optimisticUpdateManager.rollbackUpdate(taskStatus.task_id);
      if (rollbackData) {
        setTaskStatus(rollbackData);
      }
    }
  }, [taskStatus]);

  useEffect(() => {
    if (taskId) {
      startPolling();
    } else {
      stopPolling();
      setTaskStatus(null);
      setError(null);
      setPollingCount(0);
    }

    return () => {
      stopPolling();
    };
  }, [taskId, startPolling, stopPolling]);

  return {
    taskStatus,
    isLoading,
    error,
    pollingCount,
    getTaskStatus,
    startPolling,
    stopPolling,
    updateStatusOptimistically,
    confirmStatusUpdate,
    rollbackStatusUpdate
  };
}

// Hook for task result with caching
export function useTaskResult(taskId: string | null) {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const getTaskResult = useCallback(async (forceRefresh: boolean = false) => {
    if (!taskId) return null;

    try {
      setIsLoading(true);
      setError(null);

      // Check cache first unless force refresh
      if (!forceRefresh) {
        const cached = optimisticUpdateManager.getPendingUpdate(`result_${taskId}`);
        if (cached) {
          setResult(cached);
          setIsLoading(false);
          return cached;
        }
      }

      const taskResult = await enhancedApiService.getTaskResult(taskId);
      setResult(taskResult);
      setLastUpdated(new Date());

      // Cache the result
      optimisticUpdateManager.addUpdate(`result_${taskId}`, taskResult);

      return taskResult;
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Failed to get task result';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [taskId]);

  // Auto-refresh result when task is completed
  useEffect(() => {
    if (taskId) {
      getTaskResult();
    } else {
      setResult(null);
      setLastUpdated(null);
    }
  }, [taskId, getTaskResult]);

  return {
    result,
    isLoading,
    error,
    lastUpdated,
    getTaskResult,
    refreshResult: () => getTaskResult(true)
  };
}

// Hook for file downloads
export function useFileDownload() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<Record<string, number>>({});

  const downloadFile = useCallback(async (
    taskId: string,
    fileType: FileDownloadType,
    filename?: string
  ): Promise<void> => {
    const downloadKey = `${taskId}_${fileType}`;

    try {
      setIsDownloading(true);
      setDownloadProgress(prev => ({ ...prev, [downloadKey]: 0 }));

      const blob = await enhancedApiService.downloadFile(taskId, fileType);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `autofund_${taskId}.${fileType}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setDownloadProgress(prev => ({ ...prev, [downloadKey]: 100 }));
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Download failed';
      throw new Error(errorMessage);
    } finally {
      setIsDownloading(false);
      // Clear progress after a delay
      setTimeout(() => {
        setDownloadProgress(prev => {
          const { [downloadKey]: _, ...rest } = prev;
          return rest;
        });
      }, 2000);
    }
  }, []);

  return {
    isDownloading,
    downloadProgress,
    downloadFile
  };
}

// Hook for connectivity status
export function useConnectivity() {
  const [isOnline, setIsOnline] = useState(enhancedApiService.isOnlineStatus());
  const [offlineQueueLength, setOfflineQueueLength] = useState(0);

  useEffect(() => {
    const checkStatus = () => {
      const online = enhancedApiService.isOnlineStatus();
      setIsOnline(online);
      setOfflineQueueLength(enhancedApiService.getOfflineQueueLength());
    };

    checkStatus();

    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  return {
    isOnline,
    offlineQueueLength,
    retryOfflineOperations: () => enhancedApiService.processOfflineQueue()
  };
}

// Hook for API health check
export function useApiHealth() {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = useCallback(async () => {
    try {
      setError(null);
      const health = await enhancedApiService.healthCheck();
      setIsHealthy(health.status === 'healthy');
      setLastChecked(new Date());
    } catch (error) {
      setIsHealthy(false);
      setError(error instanceof ApiError ? error.message : 'Health check failed');
      setLastChecked(new Date());
    }
  }, []);

  useEffect(() => {
    checkHealth();

    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [checkHealth]);

  return {
    isHealthy,
    lastChecked,
    error,
    checkHealth
  };
}

// Hook for user preferences with optimistic updates
export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>({
    autoDownload: false,
    emailNotifications: true,
    language: 'pt',
    theme: 'auto'
  });

  const updatePreferences = useCallback((newPrefs: Partial<UserPreferences>) => {
    // Optimistic update
    const updatedPrefs = { ...preferences, ...newPrefs };
    optimisticUpdateManager.addUpdate('user_preferences', updatedPrefs);
    setPreferences(updatedPrefs);

    // Here you would typically make an API call to save preferences
    // For now, we'll just keep the optimistic update
  }, [preferences]);

  const resetPreferences = useCallback(() => {
    optimisticUpdateManager.addUpdate('user_preferences', preferences);
    setPreferences(preferences);
  }, [preferences]);

  return {
    preferences,
    updatePreferences,
    resetPreferences
  };
}

// Hook for global application state
export function useApplicationState(): ApplicationState {
  const [state, setState] = useState<ApplicationState>({
    user: {
      isAuthenticated: true, // For MVP, assume authenticated
      preferences: {
        autoDownload: false,
        emailNotifications: true,
        language: 'pt',
        theme: 'auto'
      }
    },
    currentTask: {
      taskId: null,
      status: 'idle',
      progress: { loaded: 0, total: 0, percentage: 0 },
      error: null
    },
    taskHistory: [],
    connectivity: {
      isOnline: true
    }
  });

  const updateState = useCallback((updates: Partial<ApplicationState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const clearTaskHistory = useCallback(() => {
    updateState({ taskHistory: [] });
  }, [updateState]);

  return {
    state,
    updateState,
    clearTaskHistory
  };
}

// Hook for API error handling with user-friendly messages
export function useErrorHandler() {
  const handleError = useCallback((error: any): string => {
    if (error instanceof ApiError) {
      switch (error.status) {
        case 401:
          return 'Por favor, faça login para continuar.';
        case 403:
          return 'Não tem permissão para realizar esta operação.';
        case 404:
          return 'O recurso solicitado não foi encontrado.';
        case 413:
          return 'O ficheiro é demasiado grande. Tamanho máximo: 10MB.';
        case 422:
          return 'Os dados fornecidos são inválidos. Por favor, verifique e tente novamente.';
        case 429:
          return 'Muitas tentativas. Por favor, aguarde alguns segundos antes de tentar novamente.';
        case 500:
        case 502:
        case 503:
        case 504:
          return 'O serviço está temporariamente indisponível. Por favor, tente novamente mais tarde.';
        case 0:
          if (error.code === 'NETWORK_ERROR') {
            return 'Sem conexão à internet. Por favor, verifique a sua ligação.';
          }
          if (error.code === 'TIMEOUT') {
            return 'A operação demorou demasiado tempo. Por favor, tente novamente.';
          }
          return 'Erro de conexão. Por favor, verifique a sua internet e tente novamente.';
        default:
          return error.message || 'Ocorreu um erro inesperado.';
      }
    }

    return error?.message || 'Ocorreu um erro inesperado.';
  }, []);

  const isRetryableError = useCallback((error: any): boolean => {
    if (error instanceof ApiError) {
      return error.retryable;
    }
    return false;
  }, []);

  return {
    handleError,
    isRetryableError
  };
}