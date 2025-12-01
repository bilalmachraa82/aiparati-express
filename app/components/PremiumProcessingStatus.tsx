'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Loader2, FileText, Brain, Table, Download } from 'lucide-react';
import { TaskStatus } from '@/types/api';

interface ProcessingStep {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  status: 'pending' | 'active' | 'completed';
  duration?: number;
}

interface PremiumProcessingStatusProps {
  taskStatus: TaskStatus | null;
}

export function PremiumProcessingStatus({ taskStatus }: PremiumProcessingStatusProps) {
  const [currentStep, setCurrentStep] = useState<string>('');
  const [progressPercentage, setProgressPercentage] = useState(0);

  const steps: ProcessingStep[] = [
    {
      id: 'uploading',
      label: 'Upload',
      description: 'Carregando ficheiro IES',
      icon: <FileText className="w-5 h-5" />,
      status: 'pending'
    },
    {
      id: 'extracting',
      label: 'Extração',
      description: 'Claude 3.5 a extrair dados',
      icon: <Brain className="w-5 h-5" />,
      status: 'pending'
    },
    {
      id: 'analyzing',
      label: 'Análise',
      description: 'Validação de rácios financeiros',
      icon: <Brain className="w-5 h-5" />,
      status: 'pending'
    },
    {
      id: 'generating',
      label: 'Geração Excel',
      description: 'Preenchendo template IAPMEI',
      icon: <Table className="w-5 h-5" />,
      status: 'pending'
    },
    {
      id: 'completed',
      label: 'Concluído',
      description: 'Download disponível',
      icon: <Download className="w-5 h-5" />,
      status: 'pending'
    }
  ];

  // Update step statuses based on task status
  useEffect(() => {
    if (!taskStatus) return;

    const currentStatus = taskStatus.status;
    let updatedSteps = [...steps];
    let foundCurrent = false;

    for (let i = 0; i < updatedSteps.length; i++) {
      if (updatedSteps[i].id === currentStatus) {
        updatedSteps[i].status = currentStatus === 'completed' ? 'completed' : 'active';
        setCurrentStep(updatedSteps[i].id);
        foundCurrent = true;
      } else if (foundCurrent) {
        updatedSteps[i].status = 'pending';
      } else {
        updatedSteps[i].status = 'completed';
      }
    }

    // Calculate progress percentage
    const completedSteps = updatedSteps.filter(step => step.status === 'completed').length;
    const totalSteps = updatedSteps.length;
    const progress = (completedSteps / totalSteps) * 100;
    setProgressPercentage(progress);

    // Special case for error status
    if ( (currentStatus as any) === 'error') {
       setCurrentStep('failed' as any);
    }
  }, [taskStatus]);

  const getStatusIcon = (status: ProcessingStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-6 h-6 text-green-600" />;
      case 'active':
        return <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />;
      default:
        return <Circle className="w-6 h-6 text-gray-300" />;
    }
  };

  const getStepColor = (status: ProcessingStep['status']) => {
    switch (status) {
      case 'completed':
        return 'border-green-500 bg-green-50 dark:bg-green-950';
      case 'active':
        return 'border-blue-500 bg-blue-50 dark:bg-blue-950';
      default:
        return 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800';
    }
  };

  const getTextColor = (status: ProcessingStep['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-700 dark:text-green-300';
      case 'active':
        return 'text-blue-700 dark:text-blue-300';
      default:
        return 'text-gray-500 dark:text-gray-400';
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          A Processar sua Candidatura
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Utilizando IA avançada para análise financeira automática
        </p>
      </motion.div>

      {/* Progress Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Progresso Total
            </span>
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
              {progressPercentage.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <motion.div
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>
        </div>
      </motion.div>

      {/* Processing Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className={`relative border-2 rounded-2xl p-6 transition-all duration-300 ${getStepColor(step.status)}`}
          >
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                {getStatusIcon(step.status)}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`font-semibold text-lg ${getTextColor(step.status)}`}>
                      {step.label}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {step.description}
                    </p>
                  </div>

                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${getTextColor(step.status)} bg-opacity-20 ${
                    step.status === 'completed' ? 'bg-green-600' :
                    step.status === 'active' ? 'bg-blue-600' :
                    'bg-gray-600'
                  }`}>
                    {step.status === 'completed' ? 'Concluído' :
                     step.status === 'active' ? 'Em curso...' : 'Aguardando'}
                  </div>
                </div>
              </div>

              {/* Step Icon */}
              <div className={`p-3 rounded-xl ${
                step.status === 'completed' ? 'bg-green-100 dark:bg-green-900 text-green-600' :
                step.status === 'active' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600' :
                'bg-gray-100 dark:bg-gray-700 text-gray-400'
              }`}>
                {step.icon}
              </div>
            </div>

            {/* Connecting Line */}
            {index < steps.length - 1 && (
              <div className="absolute left-8 top-full w-0.5 h-4 bg-gray-300 dark:bg-gray-600" />
            )}
          </motion.div>
        ))}
      </div>

      {/* Current Status Message */}
      <AnimatePresence>
        {taskStatus?.message && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-center"
          >
            <p className="text-blue-700 dark:text-blue-300 text-sm italic">
              {taskStatus.message}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Premium Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-center">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">Claude 3.5 Sonnet</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Extração precisa</p>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-center">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">50+ Validações</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Rácios automáticos</p>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-center">
          <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Download className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">Excel IAPMEI</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Template preenchido</p>
        </div>
      </motion.div>

      {/* Error State */}
      <AnimatePresence>
        {(taskStatus?.status as any) === 'error' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-red-50 dark:bg-red-950 border-2 border-red-200 dark:border-red-800 rounded-2xl p-6 text-center"
          >
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Circle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
              Ocorreu um erro
            </h3>
            <p className="text-red-600 dark:text-red-300">
              {taskStatus?.error || 'Ocorreu um erro durante o processamento. Por favor, tente novamente.'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}