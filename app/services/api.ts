import { ProcessRequest, ProcessResponse, TaskStatus, AnalysisResult, UploadProgress } from '@/types/api';

const API_BASE = process.env.NODE_ENV === 'production'
  ? ''
  : 'http://localhost:8000';

const API_TOKEN = 'Bearer testtoken123';

class ApiService {
  private headers = {
    'Authorization': API_TOKEN,
    'Content-Type': 'application/json',
  };

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  async uploadFile(file: File, data: ProcessRequest, onProgress?: (progress: UploadProgress) => void): Promise<ProcessResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('nif', data.nif);
    formData.append('ano_exercicio', data.ano_exercicio);
    formData.append('designacao_social', data.designacao_social);
    formData.append('email', data.email);
    if (data.context) {
      formData.append('context', data.context);
    }

    return new Promise((resolve, reject) => {
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
            reject(new Error('Invalid response format'));
          }
        } else {
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            reject(new Error(errorResponse.detail || errorResponse.message || `Upload failed with status ${xhr.status}`));
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.addEventListener('timeout', () => {
        reject(new Error('Upload timeout'));
      });

      xhr.timeout = 60000; // 60 seconds timeout
      xhr.open('POST', `${API_BASE}/api/upload`);
      xhr.setRequestHeader('Authorization', API_TOKEN);
      xhr.send(formData);
    });
  }

  async getTaskStatus(taskId: string): Promise<TaskStatus> {
    const response = await fetch(`${API_BASE}/api/status/${taskId}`, {
      headers: this.headers,
    });

    return this.handleResponse<TaskStatus>(response);
  }

  async getTaskResult(taskId: string): Promise<AnalysisResult> {
    const response = await fetch(`${API_BASE}/api/result/${taskId}`, {
      headers: this.headers,
    });

    return this.handleResponse<AnalysisResult>(response);
  }

  async downloadFile(taskId: string, fileType: 'excel' | 'json'): Promise<Blob> {
    const response = await fetch(`${API_BASE}/api/download/${taskId}/${fileType}`, {
      headers: this.headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || `Download failed with status ${response.status}`);
    }

    return response.blob();
  }

  async pollTaskStatus(
    taskId: string,
    onUpdate: (status: TaskStatus) => void,
    interval: number = 2000
  ): Promise<void> {
    const poll = async () => {
      try {
        const status = await this.getTaskStatus(taskId);
        onUpdate(status);

        // Stop polling if task is completed or failed
        if (status.status === 'completed' || status.status === 'error') {
          return;
        }

        // Continue polling
        setTimeout(poll, interval);
      } catch (error) {
        console.error('Polling error:', error);
        // Continue polling on error, but with longer delay
        setTimeout(poll, interval * 2);
      }
    };

    poll();
  }

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await fetch(`${API_BASE}/health`);
    return this.handleResponse(response);
  }
}

// Singleton instance
export const apiService = new ApiService();

import React from 'react';

// React hook for polling task status
export function useTaskPolling(taskId: string | null, onUpdate: (status: TaskStatus) => void) {
  const [isPolling, setIsPolling] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!taskId) return;

    setIsPolling(true);
    setError(null);

    const stopPolling = apiService.pollTaskStatus(
      taskId,
      (status) => {
        onUpdate(status);
        if (status.status === 'completed' || status.status === 'error') {
          setIsPolling(false);
        }
      }
    );

    return () => {
      // Cleanup would go here if we had a way to stop polling
      setIsPolling(false);
    };
  }, [taskId, onUpdate]);

  return { isPolling, error };
}