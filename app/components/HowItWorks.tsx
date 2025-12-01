'use client';

import { motion } from 'framer-motion';
import { Upload, Brain, FileText, TrendingUp, ArrowRight } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      icon: Upload,
      title: '1. Upload Seguro',
      description: 'Carregue o ficheiro PDF da Informação Empresarial Simplificada na nossa plataforma encriptada.',
    },
    {
      icon: Brain,
      title: '2. Análise IA',
      description: 'A nossa IA proprietária extrai, valida e cruza dezenas de pontos de dados financeiros em segundos.',
    },
    {
      icon: TrendingUp,
      title: '3. Avaliação de Risco',
      description: 'Receba uma análise de viabilidade com recomendações para otimizar a sua candidatura antes de submeter.',
    },
    {
      icon: FileText,
      title: '4. Excel IAPMEI',
      description: 'Obtenha o template oficial preenchido, validado e pronto para submissão no portal Portugal 2030.',
    },
  ];

  return (
    <section id="como-funciona" className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Um Processo Inteligente em 4 Passos
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Transformamos um processo manual e demorado numa experiência rápida, segura e transparente. Veja como a sua candidatura ganha vida.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-8 max-w-7xl mx-auto">
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
                <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20" />
              )}

              {/* Step Card */}
              <div className="bg-gray-800 rounded-2xl p-8 h-full transition-all duration-300 hover:border-blue-400/50">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <step.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-400">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 text-center p-10 bg-gray-800 rounded-2xl max-w-4xl mx-auto"
        >
          <h3 className="text-2xl font-bold text-white mb-4">
            Pronto para sentir a diferença na sua próxima candidatura?
          </h3>
          <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
            Junte-se a centenas de consultores e empresas que já estão a submeter candidaturas de forma mais inteligente.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-full hover:shadow-xl transition-transform transform hover:scale-105 flex items-center justify-center gap-2">
              Experimentar o Simulador
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}