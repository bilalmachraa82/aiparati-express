'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2, Clock, Brain, FileText } from 'lucide-react';

interface UploadAreaProps {
  onFileUploaded: (taskId: string) => void;
}

export function UploadArea({ onFileUploaded }: UploadAreaProps) {
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    nif: '',
    ano_exercicio: '',
    designacao_social: '',
    email: '',
    context: ''
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setError(null);
    setUploadedFile(file);
    setUploading(true);

    try {
      const requestFormData = new FormData();
      requestFormData.append('file', file);
      requestFormData.append('context', formData.context || '');
      requestFormData.append('nif', formData.nif || '123456789'); // Default para MVP
      requestFormData.append('ano_exercicio', formData.ano_exercicio || '2023'); // Default para MVP
      requestFormData.append('designacao_social', formData.designacao_social || 'Empresa Demo Lda.'); // Default para MVP
      requestFormData.append('email', formData.email || 'demo@exemplo.com'); // Default para MVP

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer temp-token-${Date.now()}`, // Token temporário para MVP
        },
        body: requestFormData,
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-5xl mx-auto"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-center mb-12"
      >
        <h1 className="text-h1 text-gray-900 mb-4">
          Upload da sua IES
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Carregue o ficheiro PDF da Informação Empresarial Simplificada e receba sua candidatura Portugal 2030 otimizada em minutos
        </p>
      </motion.div>

      {/* Upload Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div
          {...getRootProps()}
          className={`relative border-2 border-dashed rounded-3xl p-16 text-center cursor-pointer transition-all duration-300 ${
            isDragActive
              ? 'border-blue-500 bg-blue-50 scale-[1.02]'
              : error
              ? 'border-red-300 bg-red-50'
              : uploaded
              ? 'border-green-500 bg-green-50'
              : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50/50 hover:scale-[1.01]'
          }`}
        >
          <input {...getInputProps()} />

          {uploading ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-6"
            >
              <div className="relative">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                  <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                </div>
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-blue-200"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 mb-2">A processar...</p>
                <p className="text-gray-600 mb-1">Análise inteligente em curso</p>
                <p className="text-sm text-gray-500">Isto pode demorar até 90 segundos</p>
              </div>

              {/* Progress steps */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-600">Upload</span>
                </div>
                <div className="w-8 h-0.5 bg-gray-300" />
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  </div>
                  <span className="text-blue-600 font-medium">Análise</span>
                </div>
                <div className="w-8 h-0.5 bg-gray-300" />
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-gray-500 text-xs">3</span>
                  </div>
                  <span className="text-gray-400">Resultado</span>
                </div>
              </div>
            </motion.div>
          ) : uploaded ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center"
              >
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </motion.div>
              <div>
                <p className="text-2xl font-bold text-green-700 mb-2">
                  Ficheiro recebido com sucesso!
                </p>
                <p className="text-green-600 font-medium mb-1">{uploadedFile?.name}</p>
                <p className="text-gray-500">A iniciar análise inteligente...</p>
              </div>
            </motion.div>
          ) : (
            <>
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="w-24 h-24 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Upload className="w-12 h-12 text-blue-600" />
              </motion.div>

              <div>
                {isDragActive ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <p className="text-3xl font-bold gradient-text mb-2">
                      Solte o ficheiro aqui...
                    </p>
                    <p className="text-gray-600">Processamento automático iniciará</p>
                  </motion.div>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-gray-700 mb-2">
                      Arraste e solte o ficheiro IES aqui
                    </p>
                    <p className="text-gray-500 mb-8">ou clique para selecionar</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="btn-primary"
                    >
                      <Upload className="w-5 h-5" />
                      Selecionar Ficheiro PDF
                    </motion.button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-4"
        >
          <AlertCircle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-bold text-red-800">Erro no upload</p>
            <p className="text-red-700">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Process Steps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-16"
      >
        <h3 className="text-h2 text-center text-gray-900 mb-12">O que acontece a seguir?</h3>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: FileText,
              title: 'Extração de Dados',
              description: 'IA extrai todos os valores financeiros da sua IES com 99.2% de precisão',
              time: '~30s',
              color: 'blue'
            },
            {
              icon: Brain,
              title: 'Análise de Risco',
              description: 'Avaliação automática da viabilidade e validação de equações contabilísticas',
              time: '~45s',
              color: 'purple'
            },
            {
              icon: FileSpreadsheet,
              title: 'Excel IAPMEI',
              description: 'Template preenchido automaticamente, pronto para submissão',
              time: '~15s',
              color: 'green'
            }
          ].map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="text-center group"
            >
              <div className="relative mb-6">
                <div className={`w-20 h-20 bg-${step.color}-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  <step.icon className={`w-10 h-10 text-${step.color}-600`} />
                </div>
                <div className="absolute -top-2 -right-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-sm font-bold text-white">
                    {index + 1}
                  </span>
                </div>
              </div>

              <h4 className="text-lg font-bold text-gray-900 mb-3">{step.title}</h4>
              <p className="text-gray-600 mb-3 leading-relaxed">{step.description}</p>
              <div className="flex items-center justify-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className={`text-sm font-bold text-${step.color}-600`}>{step.time}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Security Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-16 p-6 bg-gray-50 rounded-2xl border border-gray-100"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          </div>
          <h4 className="font-bold text-gray-900">Segurança e Privacidade</h4>
        </div>
        <ul className="grid md:grid-cols-2 gap-3 text-sm text-gray-600">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            Processamento seguro com criptografia
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            Ficheiros eliminados após 24h
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            Conformidade com GDPR
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            Servidores em Portugal
          </li>
        </ul>
      </motion.div>
    </motion.div>
  );
}