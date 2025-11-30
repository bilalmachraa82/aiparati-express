'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

interface ProcessingStatusProps {
  taskId: string | null;
  onComplete: (result: any) => void;
  onBack: () => void;
}

const PROCESSING_STAGES = [
  { id: 'uploading', label: 'A receber ficheiro...', duration: 2000 },
  { id: 'extracting', label: 'A extrair dados financeiros...', duration: 30000 },
  { id: 'analyzing', label: 'A analisar viabilidade...', duration: 45000 },
  { id: 'generating', label: 'A gerar Excel IAPMEI...', duration: 10000 },
  { id: 'finalizing', label: 'A finalizar...', duration: 3000 },
];

export function ProcessingStatus({ taskId, onComplete, onBack }: ProcessingStatusProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [status, setStatus] = useState<'processing' | 'completed' | 'error'>('processing');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (!taskId) return;

    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/status/${taskId}`, {
          headers: {
            'Authorization': `Bearer temp-token-${Date.now()}`,
          },
        });

        if (!response.ok) throw new Error('Erro ao verificar status');

        const data = await response.json();

        if (data.status === 'completed') {
          setStatus('completed');
          setResult(data.result);
          setTimeout(() => onComplete(data.result), 1000);
        } else if (data.status === 'error') {
          setStatus('error');
          setError(data.error || 'Erro desconhecido');
        } else {
          // Update stage based on backend status
          const stageIndex = PROCESSING_STAGES.findIndex(s => s.id === data.status);
          if (stageIndex > -1) {
            setCurrentStage(stageIndex);
          }
        }
      } catch (err) {
        console.error('Status check error:', err);
      }
    };

    const interval = setInterval(checkStatus, 2000);
    checkStatus(); // Initial check

    return () => clearInterval(interval);
  }, [taskId, onComplete]);

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          {status === 'processing' && (
            <>
              <div className="text-center mb-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <Loader2 className="w-8 h-8 text-white" />
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  A processar sua candidatura
                </h2>
                <p className="text-gray-600">
                  Isto normalmente demora 60-90 segundos
                </p>
              </div>

              {/* Progress Stages */}
              <div className="space-y-4">
                {PROCESSING_STAGES.map((stage, index) => (
                  <motion.div
                    key={stage.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center gap-4 p-3 rounded-lg transition-all ${
                      index <= currentStage
                        ? index < currentStage
                          ? 'bg-green-50'
                          : 'bg-blue-50'
                        : 'bg-gray-50'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        index < currentStage
                          ? 'bg-green-600 text-white'
                          : index === currentStage
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-300 text-gray-600'
                      }`}
                    >
                      {index < currentStage ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : index === currentStage ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        >
                          <Loader2 className="w-5 h-5" />
                        </motion.div>
                      ) : (
                        <span className="text-sm font-bold">{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${
                        index <= currentStage ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {stage.label}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Loading Bar */}
              <div className="mt-8">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
                    initial={{ width: '0%' }}
                    animate={{ width: `${((currentStage + 1) / PROCESSING_STAGES.length) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="text-center text-sm text-gray-500 mt-2">
                  {Math.round(((currentStage + 1) / PROCESSING_STAGES.length) * 100)}% completo
                </p>
              </div>
            </>
          )}

          {status === 'error' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Ocorreu um erro
              </h2>
              <p className="text-gray-600 mb-6">
                {error || 'Não foi possível processar o seu ficheiro'}
              </p>
              <button
                onClick={onBack}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-full hover:shadow-lg transition-all"
              >
                Tentar Novamente
              </button>
            </motion.div>
          )}

          {status === 'completed' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Análise concluída!
              </h2>
              <p className="text-gray-600">
                A preparar resultados...
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Tips */}
        {status === 'processing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 p-6 bg-blue-50 rounded-xl"
          >
            <h3 className="font-semibold text-blue-900 mb-2">Sabia que?</h3>
            <p className="text-blue-700 text-sm">
              A nossa IA valida mais de 50 pontos de verificação para garantir que a sua candidatura
              tem o máximo de probabilidade de aprovação.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}