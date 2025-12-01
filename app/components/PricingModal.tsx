'use client';

import { motion } from 'framer-motion';
import { X, Check, Star, Zap } from 'lucide-react';

interface PricingModalProps {
  onClose: () => void;
}

export function PricingModal({ onClose }: PricingModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="p-8 border-b border-gray-200 relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Star className="w-4 h-4" />
              Preços Transparentes
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Escolha o plano ideal para si
            </h2>
            <p className="text-gray-600">
              Sem surpresas, sem custos escondidos
            </p>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="p-8">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Single Analysis */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Análise Única
              </h3>
              <p className="text-gray-600 mb-6">
                Para quem precisa de uma análise rápida
              </p>
              <div className="mb-6">
                <span className="text-4xl font-bold">€299</span>
                <span className="text-gray-600">/candidatura</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Extração automática de dados',
                  'Validação de equações',
                  'Análise de risco',
                  'Excel IAPMEI preenchido',
                  'Suporte por email',
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <button className="w-full py-3 border border-gray-300 text-gray-700 font-semibold rounded-full hover:bg-gray-50 transition-colors">
                Começar
              </button>
            </motion.div>

            {/* Professional (Popular) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="border-2 border-blue-600 rounded-2xl p-6 relative hover:shadow-xl transition-shadow"
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Mais Popular
                </span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-bold text-gray-900">
                  Profissional
                </h3>
                <Zap className="w-5 h-5 text-yellow-500" />
              </div>
              <p className="text-gray-600 mb-6">
                Para consultores e contabilistas
              </p>
              <div className="mb-6">
                <span className="text-4xl font-bold">€199</span>
                <span className="text-gray-600">/candidatura</span>
                <div className="text-sm text-green-600 font-medium mt-1">
                  Economize 33% no pack de 10
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Tudo do plano Único',
                  '10 candidaturas',
                  'Prioridade no processamento',
                  'Relatórios detalhados',
                  'Suporte prioritário',
                  'API access (brevemente)',
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full hover:shadow-lg transition-all">
                Escolher Plano
              </button>
            </motion.div>

            {/* Enterprise */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Enterprise
              </h3>
              <p className="text-gray-600 mb-6">
                Para grandes volumes
              </p>
              <div className="mb-6">
                <span className="text-4xl font-bold">Custom</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Candidaturas ilimitadas',
                  'Integração personalizada',
                  'Dedicated account manager',
                  'SLA garantido',
                  'Formação personalizada',
                  'White label option',
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <button className="w-full py-3 border border-gray-300 text-gray-700 font-semibold rounded-full hover:bg-gray-50 transition-colors">
                Contactar Vendas
              </button>
            </motion.div>
          </div>

          {/* Trust Badges */}
          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">
              Aprovado por centenas de empresas
            </p>
            <div className="flex justify-center items-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Garantia 7 dias</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Cancelamento a qualquer momento</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Sem custos escondidos</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}