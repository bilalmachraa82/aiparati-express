'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Download,
  FileSpreadsheet,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Star,
  Shield,
  ArrowRight,
  Calendar,
  Building,
  Mail
} from 'lucide-react';

// Define type inline to avoid import issues
interface AnalysisResult {
  metadata: {
    nif: string;
    ano_exercicio: string;
    designacao_social: string;
    email: string;
    data_processamento: string;
  };
  dados_financeiros: {
    ativo_total?: number;
    passivo_total?: number;
    capital_proprio?: number;
    volume_negocios: number;
    ebitda: number;
    autonomia_financeira: number;
    liquidez_geral: number;
    margem_ebitda: number;
  };
  analise: {
    rating: 'BAIXO' | 'MÉDIO' | 'ALTO' | 'CRÍTICO';
    score?: number;
    recomendacoes: string[];
  };
  ficheiros_gerados: {
    excel: string;
    json: string;
  };
  download_urls: {
    excel: string;
    json: string;
  };
}

interface PremiumResultsViewProps {
  resultData: AnalysisResult;
  onDownload: (fileType: 'excel' | 'json') => void;
  onNewAnalysis: () => void;
}

export function PremiumResultsView({
  resultData,
  onDownload,
  onNewAnalysis
}: PremiumResultsViewProps) {
  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'BAIXO': return 'bg-green-100 text-green-800 border-green-200';
      case 'MÉDIO': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ALTO': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'CRÍTICO': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskLevelIcon = (level: string) => {
    switch (level) {
      case 'BAIXO': return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'MÉDIO': return <AlertTriangle className="w-6 h-6 text-yellow-600" />;
      case 'ALTO': return <AlertTriangle className="w-6 h-6 text-orange-600" />;
      case 'CRÍTICO': return <TrendingDown className="w-6 h-6 text-red-600" />;
      default: return <AlertTriangle className="w-6 h-6 text-gray-600" />;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    // If value is already a decimal (0.45), multiply by 100
    // If value is already a percentage (45), use as is
    const percentage = value > 1 ? value : value * 100;
    return `${percentage.toFixed(1)}%`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Success Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Análise Completa!
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Excel IAPMEI preenchido e pronto para download
        </p>
      </motion.div>

      {/* Company Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
          <h3 className="text-xl font-semibold text-white flex items-center gap-3">
            <Building className="w-6 h-6" />
            Informações da Empresa
          </h3>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Empresa</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {resultData.metadata.designacao_social}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">NIF</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {resultData.metadata.nif}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Ano Exercício</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {resultData.metadata.ano_exercicio}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Data Processamento</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {new Date(resultData.metadata.data_processamento).toLocaleDateString('pt-PT')}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Financial Indicators */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-6">
          <h3 className="text-xl font-semibold text-white flex items-center gap-3">
            <TrendingUp className="w-6 h-6" />
            Indicadores Financeiros
          </h3>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Volume Negócios</span>
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(resultData.dados_financeiros.volume_negocios)}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">EBITDA</span>
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(resultData.dados_financeiros.ebitda)}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Autonomia Financeira</span>
                <Shield className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatPercentage(resultData.dados_financeiros.autonomia_financeira * 100)}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Margem EBITDA</span>
                <Star className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatPercentage(resultData.dados_financeiros.margem_ebitda * 100)}
              </p>
            </div>
          </div>

          {resultData.dados_financeiros.ativo_total && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="bg-blue-50 dark:bg-blue-950 rounded-xl p-4">
                <span className="text-sm text-blue-600 dark:text-blue-400">Ativo Total</span>
                <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
                  {formatCurrency(resultData.dados_financeiros.ativo_total)}
                </p>
              </div>
              <div className="bg-red-50 dark:bg-red-950 rounded-xl p-4">
                <span className="text-sm text-red-600 dark:text-red-400">Passivo Total</span>
                <p className="text-xl font-bold text-red-900 dark:text-red-100">
                  {formatCurrency(resultData.dados_financeiros.passivo_total!)}
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-950 rounded-xl p-4">
                <span className="text-sm text-green-600 dark:text-green-400">Capital Próprio</span>
                <p className="text-xl font-bold text-green-900 dark:text-green-100">
                  {formatCurrency(resultData.dados_financeiros.capital_proprio!)}
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Risk Assessment */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        <div className="bg-gradient-to-r from-red-600 to-pink-600 p-6">
          <h3 className="text-xl font-semibold text-white flex items-center gap-3">
            <Shield className="w-6 h-6" />
            Avaliação de Risco
          </h3>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-2xl ${getRiskLevelColor(resultData.analise.rating)}`}>
                {getRiskLevelIcon(resultData.analise.rating)}
              </div>
              <div>
                <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Nível de Risco: {resultData.analise.rating}
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Score: {resultData.analise.score}/100
                </p>
              </div>
            </div>

            <div className={`px-6 py-3 rounded-full border-2 ${getRiskLevelColor(resultData.analise.rating)}`}>
              <span className="text-lg font-bold">
                {resultData.analise.rating}
              </span>
            </div>
          </div>

          {/* Recommendations */}
          <div className="mt-8">
            <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recomendações Financeiras
            </h5>
            <div className="space-y-3">
              {resultData.analise.recomendacoes.map((recommendation, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl"
                >
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700 dark:text-gray-300">{recommendation}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Download Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center shadow-xl"
      >
        <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-4">
          <FileSpreadsheet className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-4">
          Excel IAPMEI Disponível
        </h3>
        <p className="text-blue-100 mb-8">
          Template oficial preenchido automaticamente com todos os dados financeiros
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => onDownload('excel')}
            className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 group"
          >
            <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
            Download Excel
            <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={() => onDownload('json')}
            className="px-8 py-4 bg-white/20 backdrop-blur text-white font-semibold rounded-xl hover:bg-white/30 transition-colors border border-white/30"
          >
            Download JSON
          </button>
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex justify-center"
      >
        <button
          onClick={onNewAnalysis}
          className="px-8 py-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
        >
          Nova Análise
          <ArrowRight className="w-5 h-5" />
        </button>
      </motion.div>
    </div>
  );
}