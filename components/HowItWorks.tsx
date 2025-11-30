'use client';

import { motion } from 'framer-motion';
import { Upload, Brain, FileText, TrendingUp } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      icon: Upload,
      title: '1. Upload do IES',
      description: 'Carregue o ficheiro PDF da Informação Empresarial Simplificada',
      details: 'Formato PDF • Até 10MB • Processamento seguro',
    },
    {
      icon: Brain,
      title: '2. Análise IA',
      description: 'Nossa IA extrai e valida todos os dados financeiros automaticamente',
      details: 'Claude 3.5 • Validação • Verificação de equações',
    },
    {
      icon: TrendingUp,
      title: '3. Avaliação de Risco',
      description: 'Análise inteligente da viabilidade e recomendações personalizadas',
      details: 'Rácios financeiros • Indicadores • Recomendações',
    },
    {
      icon: FileText,
      title: '4. Excel IAPMEI',
      description: 'Template preenchido automaticamente, pronto para submissão',
      details: 'Formato oficial • 100% preenchido • Download imediato',
    },
  ];

  return (
    <section id="como-funciona" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Como funciona em 4 passos simples
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            De 2 horas para 2 minutos. Sem complicações, sem dor de cabeça.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-blue-200 to-purple-200" />
              )}

              {/* Step Card */}
              <div className="bg-white border-2 border-gray-100 rounded-2xl p-8 hover:border-blue-200 hover:shadow-lg transition-all h-full">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                  <step.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {step.description}
                </p>
                <p className="text-sm text-gray-500">
                  {step.details}
                </p>
              </div>

              {/* Step Number */}
              <div className="absolute -top-3 -right-3 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                {index + 1}
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center p-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Pronto para transformar as suas candidaturas?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Junte-se a centenas de empresas que já aprovaram suas candidaturas Portugal 2030
            com a ajuda da nossa IA.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full hover:shadow-xl transition-all">
              Começar Agora
            </button>
            <button className="px-8 py-4 bg-white text-gray-700 font-semibold rounded-full hover:shadow-lg transition-all border border-gray-200">
              Ver Demo
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}