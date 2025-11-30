'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, CheckCircle, AlertTriangle, TrendingUp, ArrowRight, RefreshCw } from 'lucide-react';

interface ResultsViewProps {
  taskId: string | null;
  onNewAnalysis: () => void;
}

export function ResultsView({ taskId, onNewAnalysis }: ResultsViewProps) {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!taskId) return;

    const fetchResult = async () => {
      try {
        const response = await fetch(`/api/result/${taskId}`, {
          headers: {
            'Authorization': `Bearer temp-token-${Date.now()}`,
          },
        });

        if (!response.ok) throw new Error('Erro ao buscar resultado');

        const data = await response.json();
        setResult(data);
      } catch (err) {
        console.error('Error fetching result:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [taskId]);

  const handleDownload = async (type: 'excel' | 'json') => {
    if (!taskId) return;

    try {
      const response = await fetch(`/api/download/${taskId}/${type}`, {
        headers: {
          'Authorization': `Bearer temp-token-${Date.now()}`,
        },
      });

      if (!response.ok) throw new Error('Erro ao baixar arquivo');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aiparati-analysis-${type}.${type === 'excel' ? 'xlsx' : 'json'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">A carregar resultados...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <AlertTriangle className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Resultado não encontrado
          </h2>
          <button
            onClick={onNewAnalysis}
            className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-full hover:shadow-lg transition-all"
          >
            Nova Análise
          </button>
        </div>
      </div>
    );
  }

  const riskLevel = result.analise.nivel_risco;
  const riskColors = {
    'BAIXO': 'from-green-500 to-emerald-600',
    'MÉDIO': 'from-yellow-500 to-orange-600',
    'ALTO': 'from-orange-500 to-red-600',
    'CRÍTICO': 'from-red-500 to-rose-600',
  };

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Análise Concluída!
          </h1>
          <p className="text-xl text-gray-600">
            Sua candidatura está pronta para submissão
          </p>
        </motion.div>

        {/* Risk Level Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className={`mb-8 p-8 rounded-2xl bg-gradient-to-r ${riskColors[riskLevel]} text-white`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Nível de Risco</h2>
              <p className="text-3xl font-bold">{riskLevel}</p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">Empresa</p>
              <p className="text-xl font-semibold">{result.metadata.empresa}</p>
              <p className="text-sm opacity-90">NIF: {result.metadata.nif}</p>
            </div>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {[
            {
              label: 'Autonomia Financeira',
              value: `${(result.analise.autonomia_financeira * 100).toFixed(1)}%`,
              color: result.analise.autonomia_financeira > 0.3 ? 'text-green-600' : 'text-red-600',
            },
            {
              label: 'Liquidez Geral',
              value: result.analise.liquidez_geral.toFixed(2),
              color: result.analise.liquidez_geral > 1.5 ? 'text-green-600' : 'text-red-600',
            },
            {
              label: 'Margem EBITDA',
              value: `${(result.analise.margem_ebitda * 100).toFixed(1)}%`,
              color: result.analise.margem_ebitda > 0.05 ? 'text-green-600' : 'text-red-600',
            },
            {
              label: 'Volume Negócios',
              value: `€${result.dados_financeiros.volume_negocios.toLocaleString('pt-PT')}`,
              color: 'text-gray-900',
            },
          ].map((metric, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
              className="bg-white p-6 rounded-xl shadow-md"
            >
              <p className="text-sm text-gray-600 mb-2">{metric.label}</p>
              <p className={`text-2xl font-bold ${metric.color}`}>{metric.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Analysis Details */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Strengths */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-green-50 p-6 rounded-xl"
          >
            <h3 className="font-bold text-green-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Pontos Fortes
            </h3>
            <ul className="space-y-2">
              {result.analise.pontos_fortes.map((point: string, index: number) => (
                <li key={index} className="text-green-800 text-sm flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  {point}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Weaknesses */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-yellow-50 p-6 rounded-xl"
          >
            <h3 className="font-bold text-yellow-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Pontos a Melhorar
            </h3>
            <ul className="space-y-2">
              {result.analise.pontos_fracos.map((point: string, index: number) => (
                <li key={index} className="text-yellow-800 text-sm flex items-start gap-2">
                  <span className="text-yellow-600 mt-1">•</span>
                  {point}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Recommendations */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-blue-50 p-6 rounded-xl"
          >
            <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Recomendações
            </h3>
            <ul className="space-y-2">
              {result.analise.recomendacoes.map((rec: string, index: number) => (
                <li key={index} className="text-blue-800 text-sm flex items-start gap-2">
                  <span className="text-blue-600 mt-1">{index + 1}.</span>
                  {rec}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Download Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white p-8 rounded-2xl shadow-lg"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Download dos Ficheiros
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <button
              onClick={() => handleDownload('excel')}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
            >
              <FileText className="w-6 h-6" />
              <div className="text-left">
                <p>Excel IAPMEI</p>
                <p className="text-sm opacity-90">Template preenchido</p>
              </div>
              <Download className="w-5 h-5" />
            </button>

            <button
              onClick={() => handleDownload('json')}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-gray-900 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
            >
              <FileText className="w-6 h-6" />
              <div className="text-left">
                <p>Relatório JSON</p>
                <p className="text-sm opacity-90">Análise completa</p>
              </div>
              <Download className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8 text-center"
        >
          <button
            onClick={onNewAnalysis}
            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-full hover:shadow-xl transition-all mx-auto"
          >
            <RefreshCw className="w-5 h-5" />
            Analisar Outra Empresa
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}