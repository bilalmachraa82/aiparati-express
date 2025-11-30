'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Zap, Shield, TrendingUp, CheckCircle, AlertCircle, Clock, ArrowRight } from 'lucide-react';
import { UploadArea } from '@/components/UploadArea';
import { ProcessingStatus } from '@/components/ProcessingStatus';
import { ResultsView } from '@/components/ResultsView';
import { Header } from '@/components/Header';
import { PricingModal } from '@/components/PricingModal';
import { Testimonials } from '@/components/Testimonials';
import { HowItWorks } from '@/components/HowItWorks';

export default function Home() {
  const [currentView, setCurrentView] = useState<'landing' | 'upload' | 'processing' | 'results'>('landing');
  const [taskId, setTaskId] = useState<string | null>(null);
  const [showPricing, setShowPricing] = useState(false);

  const handleFileUploaded = (newTaskId: string) => {
    setTaskId(newTaskId);
    setCurrentView('processing');
  };

  const handleProcessingComplete = (result: any) => {
    setCurrentView('results');
  };

  if (currentView === 'upload') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header onUploadClick={() => {}} showBackButton setCurrentView={setCurrentView} />
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <UploadArea onFileUploaded={handleFileUploaded} />
          </motion.div>
        </div>
      </div>
    );
  }

  if (currentView === 'processing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header onUploadClick={() => {}} showBackButton setCurrentView={setCurrentView} />
        <ProcessingStatus
          taskId={taskId}
          onComplete={handleProcessingComplete}
          onBack={() => setCurrentView('upload')}
        />
      </div>
    );
  }

  if (currentView === 'results') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header onUploadClick={() => {}} showBackButton setCurrentView={setCurrentView} />
        <ResultsView
          taskId={taskId}
          onNewAnalysis={() => setCurrentView('upload')}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header onUploadClick={() => setCurrentView('upload')} />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 pt-20 pb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6"
            >
              <Zap className="w-4 h-4" />
              Economize 60 horas por candidatura
            </motion.div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Candidaturas Portugal 2030
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                2 horas → 2 minutos
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Upload do seu IES PDF. A nossa IA extrai dados, valida equações contabilísticas,
              gera análise de risco e preenche automaticamente o template IAPMEI.
            </p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            >
              <button
                onClick={() => setCurrentView('upload')}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-2 text-lg"
              >
                <FileText className="w-5 h-5" />
                Começar Agora
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => setShowPricing(true)}
                className="px-8 py-4 bg-white text-gray-700 font-semibold rounded-full hover:shadow-lg transition-all duration-300 border border-gray-200 text-lg"
              >
                Ver Preços
              </button>
            </motion.div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-500" />
                <span>Dados 100% seguros</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-500" />
                <span>Taxa de aprovação 87%</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-500" />
                <span>Economia de 60h</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Background Pattern */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full opacity-20 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full opacity-20 blur-3xl" />
        </div>
      </section>

      {/* How It Works */}
      <HowItWorks />

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Por que escolher AiparatiExpress?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A plataforma mais completa e eficiente para candidaturas Portugal 2030
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: Zap,
                title: '60x Mais Rápido',
                description: 'Reduza o tempo de processamento de 2 horas para apenas 2 minutos com IA avançada',
                color: 'from-yellow-400 to-orange-500'
              },
              {
                icon: Shield,
                title: 'Validação Automática',
                description: 'Verificação automática de equações contabilísticas e conformidade IAPMEI',
                color: 'from-green-400 to-emerald-500'
              },
              {
                icon: TrendingUp,
                title: 'Análise de Risco',
                description: 'Avaliação inteligente do nível de risco com recomendações personalizadas',
                color: 'from-blue-400 to-indigo-500'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-8 rounded-2xl hover:shadow-lg transition-shadow"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials />

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">
              Pronto para revolucionar as suas candidaturas?
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Junte-se a centenas de empresas que já aprovaram com o AiparatiExpress
            </p>
            <button
              onClick={() => setCurrentView('upload')}
              className="px-10 py-5 bg-white text-blue-600 font-bold rounded-full hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 text-lg"
            >
              Começar Minha Candidatura
            </button>
          </motion.div>
        </div>
      </section>

      {/* Pricing Modal */}
      <AnimatePresence>
        {showPricing && (
          <PricingModal onClose={() => setShowPricing(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}