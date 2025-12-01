'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, Shield, Zap, TrendingUp, Star, Users } from 'lucide-react';

// Components
import { DarkModeProvider } from './contexts/DarkModeContext';
import { PremiumHeader } from './components/PremiumHeader';
import { PremiumUploadArea } from './components/PremiumUploadArea';
import { PremiumProcessingStatus } from './components/PremiumProcessingStatus';
import { PremiumResultsView } from './components/PremiumResultsView';
import { HydrationScrubber } from './components/HydrationScrubber';
import { ErrorBoundary } from './components/ErrorBoundary';

// Services and Types
import { apiService } from './services/api';
import { ViewState, TaskStatus, AnalysisResult, FormData, UploadProgress } from './types/api';

function AppContent() {
  const [currentView, setCurrentView] = useState<ViewState>('landing');
  const [taskId, setTaskId] = useState<string | null>(null);
  const [taskStatus, setTaskStatus] = useState<TaskStatus | null>(null);
  const [resultData, setResultData] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Form data state
  const [formData, setFormData] = useState<FormData>({
    nif: '',
    ano_exercicio: '',
    designacao_social: '',
    email: '',
    context: ''
  });

  // Status polling effect
  useEffect(() => {
    if (!taskId || currentView !== 'processing') return;

    const pollStatus = async () => {
      try {
        const status = await apiService.getTaskStatus(taskId);
        setTaskStatus(status);

        if (status.status === 'completed' && status.result) {
          setResultData(status.result);
          setCurrentView('results');
        } else if (status.status === 'error') {
          setError(status.error || 'Processing failed');
          setCurrentView('upload');
        }
      } catch (error) {
        console.error('Status check error:', error);
        setError('Failed to check status');
      }
    };

    const interval = setInterval(pollStatus, 2000);
    return () => clearInterval(interval);
  }, [taskId, currentView]);

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(null);
    setError(null);

    try {
      const response = await apiService.uploadFile(
        file,
        formData,
        (progress) => setUploadProgress(progress)
      );

      setTaskId(response.task_id);
      setCurrentView('processing');
    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload file');
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  const handleDownload = async (fileType: 'excel' | 'json') => {
    if (!taskId) return;

    try {
      const blob = await apiService.downloadFile(taskId, fileType);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      const filename = fileType === 'excel'
        ? `autofund_${formData.nif}_${new Date().toISOString().split('T')[0]}.xlsx`
        : `autofund_${formData.nif}_${new Date().toISOString().split('T')[0]}.json`;

      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
      setError(error instanceof Error ? error.message : 'Failed to download file');
    }
  };

  const startUpload = () => {
    setCurrentView('upload');
  };

  const resetUpload = () => {
    setCurrentView('landing');
    setTaskId(null);
    setTaskStatus(null);
    setResultData(null);
    setError(null);
    setUploadProgress(null);
    setIsUploading(false);
    setFormData({
      nif: '',
      ano_exercicio: '',
      designacao_social: '',
      email: '',
      context: ''
    });
  };

  const handleBackClick = () => {
    if (currentView === 'processing') {
      // Allow canceling during processing
      resetUpload();
    } else {
      setCurrentView('landing');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-gray-900 dark:to-blue-900">
      <HydrationScrubber />

      {/* Header */}
      <PremiumHeader
        currentView={currentView}
        onBackClick={currentView !== 'landing' ? handleBackClick : undefined}
        onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      {/* Main Content */}
      <main className="pt-20 pb-12">
        <AnimatePresence mode="wait">
          {/* Landing Page */}
          {currentView === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="container mx-auto px-4 py-12"
            >
              {/* Hero Section */}
              <div className="text-center mb-16">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="mb-6"
                >
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full">
                    <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Potenciado por Claude AI
                    </span>
                  </div>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white leading-tight mb-6"
                >
                  Transforme o seu IES em uma
                  <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    candidatura Portugal 2030
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-8 leading-relaxed"
                >
                  Automação inteligente de candidaturas com extração precisa por IA,
                  validação automática de rácios financeiros e geração instantânea
                  do template Excel IAPMEI.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                >
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startUpload}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl hover:shadow-xl transition-all flex items-center gap-3 text-lg"
                  >
                    <Zap className="w-5 h-5" />
                    Começar Análise
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </motion.div>
              </div>

              {/* Features Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:shadow-xl transition-all"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl group-hover:scale-110 transition-transform">
                      <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Validação automática</p>
                      <p className="font-semibold text-gray-900 dark:text-white">50+ checkpoints</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:shadow-xl transition-all"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-green-100 dark:bg-green-900 rounded-xl group-hover:scale-110 transition-transform">
                      <Zap className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Tempo médio</p>
                      <p className="font-semibold text-gray-900 dark:text-white">90 segundos</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:shadow-xl transition-all"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-xl group-hover:scale-110 transition-transform">
                      <Star className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Extração Claude</p>
                      <p className="font-semibold text-gray-900 dark:text-white">Sonnet 3.5</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:shadow-xl transition-all"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-amber-100 dark:bg-amber-900 rounded-xl group-hover:scale-110 transition-transform">
                      <TrendingUp className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Precisão média</p>
                      <p className="font-semibold text-gray-900 dark:text-white">98.2%</p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Trust Indicators */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="mt-16 text-center"
              >
                <div className="inline-flex items-center gap-8 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span>GDPR Compliant</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>1000+ Análises</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-600" />
                    <span>4.9/5 Rating</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Upload View */}
          {currentView === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="container mx-auto px-4 py-12"
            >
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    Upload do IES
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Preencha os dados da empresa e carregue o ficheiro PDF da Informação Empresarial Simplificada
                  </p>
                </div>

                <PremiumUploadArea
                  formData={formData}
                  onFormDataChange={setFormData}
                  onFileSelect={handleFileUpload}
                  isUploading={isUploading}
                  uploadProgress={uploadProgress || undefined}
                  error={error}
                />
              </div>
            </motion.div>
          )}

          {/* Processing View */}
          {currentView === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="container mx-auto px-4 py-12"
            >
              <PremiumProcessingStatus taskStatus={taskStatus} />
            </motion.div>
          )}

          {/* Results View */}
          {currentView === 'results' && resultData && (
            <motion.div
              key="results"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="container mx-auto px-4 py-12"
            >
              <PremiumResultsView
                resultData={resultData}
                onDownload={handleDownload}
                onNewAnalysis={resetUpload}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function HomePage() {
  return (
    <ErrorBoundary>
      <DarkModeProvider>
        <AppContent />
      </DarkModeProvider>
    </ErrorBoundary>
  );
}