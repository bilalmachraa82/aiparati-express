'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface UploadAreaProps {
  onFileUploaded: (taskId: string) => void;
}

export function UploadArea({ onFileUploaded }: UploadAreaProps) {
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setError(null);
    setUploadedFile(file);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('context', ''); // Contexto adicional opcional

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer temp-token-${Date.now()}`, // Token temporário para MVP
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erro ao fazer upload');
      }

      const data = await response.json();
      setUploaded(true);
      setTimeout(() => onFileUploaded(data.task_id), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setUploading(false);
    }
  }, [onFileUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto"
    >
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Upload da sua IES
        </h1>
        <p className="text-lg text-gray-600">
          Carregue o ficheiro PDF da Informação Empresarial Simplificada
        </p>
      </div>

      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : error
            ? 'border-red-300 bg-red-50'
            : uploaded
            ? 'border-green-500 bg-green-50'
            : 'border-gray-300 bg-white hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />

        {uploading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            <p className="text-lg font-medium text-gray-700">A processar...</p>
            <p className="text-sm text-gray-500">Isto pode demorar até 90 segundos</p>
          </motion.div>
        ) : uploaded ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <CheckCircle className="w-12 h-12 text-green-600" />
            <p className="text-lg font-medium text-green-700">
              Ficheiro recebido com sucesso!
            </p>
            <p className="text-sm text-green-600">
              {uploadedFile?.name}
            </p>
            <p className="text-sm text-gray-500">
              A iniciar análise...
            </p>
          </motion.div>
        ) : (
          <>
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            {isDragActive ? (
              <p className="text-lg font-medium text-blue-600">
                Solte o ficheiro aqui...
              </p>
            ) : (
              <>
                <p className="text-lg font-medium text-gray-700 mb-2">
                  Arraste e solte o ficheiro IES aqui
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  ou clique para selecionar
                </p>
                <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-full hover:shadow-lg transition-all">
                  Selecionar Ficheiro
                </button>
              </>
            )}
          </>
        )}
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <p className="font-medium text-red-800">Erro no upload</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </motion.div>
      )}

      <div className="mt-8 text-center">
        <h3 className="font-semibold text-gray-900 mb-4">O que acontece a seguir?</h3>
        <div className="grid md:grid-cols-3 gap-6 text-sm">
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold">1</span>
            </div>
            <p className="font-medium">Extração de Dados</p>
            <p className="text-gray-600">IA extrai todos os valores financeiros</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 font-bold">2</span>
            </div>
            <p className="font-medium">Análise de Risco</p>
            <p className="text-gray-600">Avaliação automática da viabilidade</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-bold">3</span>
            </div>
            <p className="font-medium">Excel IAPMEI</p>
            <p className="text-gray-600">Template preenchido automaticamente</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}