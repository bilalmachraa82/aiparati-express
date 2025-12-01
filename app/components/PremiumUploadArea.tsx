'use client';

import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, File, X, CheckCircle, AlertCircle, Shield, Zap } from 'lucide-react';
import { FormData, UploadProgress } from '@/types/api';

interface PremiumUploadAreaProps {
  formData: FormData;
  onFormDataChange: (data: FormData) => void;
  onFileSelect: (file: File) => void;
  isUploading: boolean;
  uploadProgress?: UploadProgress;
  error: string | null;
}

export function PremiumUploadArea({
  formData,
  onFormDataChange,
  onFileSelect,
  isUploading,
  uploadProgress,
  error
}: PremiumUploadAreaProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isFormValid, setIsFormValid] = useState(false);

  // Validate form
  React.useEffect(() => {
    const valid = formData.nif.length === 9 &&
                  formData.ano_exercicio.length === 4 &&
                  formData.designacao_social.trim().length > 0 &&
                  formData.email.includes('@');
    setIsFormValid(valid);
  }, [formData]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (isUploading) return;

    const files = Array.from(e.dataTransfer.files);
    const file = files[0];

    if (file && file.type === 'application/pdf') {
      if (!isFormValid) {
        return;
      }
      setSelectedFile(file);
      onFileSelect(file);
    } else if (file) {
      // Wrong file type
    }
  }, [isUploading, isFormValid, onFileSelect]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || isUploading) return;

    if (file.type !== 'application/pdf') {
      return;
    }

    setSelectedFile(file);
    onFileSelect(file);
  }, [isUploading, onFileSelect]);

  const removeFile = useCallback(() => {
    setSelectedFile(null);
    const input = document.getElementById('file-upload') as HTMLInputElement;
    if (input) input.value = '';
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Form Fields */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
          <div className="flex items-center gap-3 text-white">
            <Shield className="w-6 h-6" />
            <h3 className="font-semibold">Dados da Empresa</h3>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                NIF
                {formData.nif.length === 9 && (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
              </label>
              <input
                type="text"
                value={formData.nif}
                onChange={(e) => onFormDataChange({ ...formData, nif: e.target.value.replace(/\D/g, '') })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                placeholder="123456789"
                maxLength={9}
                disabled={isUploading}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">9 dígitos</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                Ano de Exercício
                {formData.ano_exercicio.length === 4 && (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
              </label>
              <input
                type="text"
                value={formData.ano_exercicio}
                onChange={(e) => onFormDataChange({ ...formData, ano_exercicio: e.target.value.replace(/\D/g, '') })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                placeholder="2023"
                maxLength={4}
                disabled={isUploading}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">Ano fiscal</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              Designação Social
              {formData.designacao_social.trim().length > 0 && (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
            </label>
            <input
              type="text"
              value={formData.designacao_social}
              onChange={(e) => onFormDataChange({ ...formData, designacao_social: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
              placeholder="Empresa S.A."
              disabled={isUploading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              Email
              {formData.email.includes('@') && formData.email.includes('.') && (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => onFormDataChange({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
              placeholder="empresa@exemplo.pt"
              disabled={isUploading}
            />
          </div>
        </div>
      </motion.div>

      {/* File Upload Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div
          className={`relative border-3 border-dashed rounded-2xl p-8 transition-all duration-300 ${
            dragActive
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 scale-102'
              : selectedFile
              ? 'border-green-500 bg-green-50 dark:bg-green-950'
              : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500'
          } ${!isFormValid && !selectedFile ? 'opacity-50 cursor-not-allowed' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileInputChange}
            className="hidden"
            id="file-upload"
            disabled={isUploading || !isFormValid}
          />

          {!selectedFile ? (
            <label htmlFor="file-upload" className={`cursor-pointer text-center ${!isFormValid ? 'cursor-not-allowed' : ''}`}>
              <motion.div
                animate={{ scale: dragActive ? 1.1 : 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <Upload className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {dragActive ? 'Solte o ficheiro aqui' : 'Arraste e solte o PDF da IES'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  ou clique para selecionar o ficheiro
                </p>
                {!isFormValid && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center justify-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Preencha todos os campos primeiro
                  </p>
                )}
              </motion.div>
            </label>
          ) : (
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <File className="h-12 w-12 text-green-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                {!isUploading && (
                  <button
                    onClick={removeFile}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {isUploading && uploadProgress && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>A processar...</span>
                    <span>{uploadProgress.percentage.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress.percentage}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Premium Features Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-center gap-4"
      >
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
          <Zap className="w-6 h-6" />
          <Shield className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
            Processamento Premium Seguro
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-300">
            Extração por Claude 3.5 Sonnet • Validação automática • Excel IAPMEI preenchido
          </p>
        </div>
      </motion.div>
    </div>
  );
}