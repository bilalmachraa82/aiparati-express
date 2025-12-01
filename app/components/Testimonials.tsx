'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

export function Testimonials() {
  const testimonials = [
    {
      name: 'João Silva',
      role: 'Contabilista Certificado',
      company: 'FiscalContas',
      content: 'Reduzi o tempo de preparação de candidaturas de 2 horas para 5 minutos. Ferramenta revolucionária!',
      rating: 5,
    },
    {
      name: 'Maria Santos',
      role: 'Gestora de PME',
      company: 'InovaTech Lda.',
      content: 'A análise de risco ajudou-nos a identificar pontos críticos antes da submissão. Aprovado na primeira tentativa!',
      rating: 5,
    },
    {
      name: 'Pedro Costa',
      role: 'Consultor Financeiro',
      company: 'Strategy Partners',
      content: 'O ROI é incrível. O tempo poupado permite-me focar em mais clientes. Indispensável para qualquer consultor.',
      rating: 5,
    },
  ];

  return (
    <section id="depoimentos" className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            O que dizem os nossos clientes
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Junte-se a mais de 500 empresas que já confiam no AiparatiExpress para otimizar as suas candidaturas.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-gray-800 p-8 rounded-2xl h-full transition-all duration-300 hover:border-purple-400/50"
            >
              <Quote className="w-8 h-8 text-blue-400 mb-4" />
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>
              <div>
                <p className="font-semibold text-white">{testimonial.name}</p>
                <p className="text-sm text-gray-400">{testimonial.role}</p>
                <p className="text-sm text-blue-400">{testimonial.company}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
        >
          {[
            { value: '500+', label: 'Empresas Atendidas' },
            { value: '87%', label: 'Taxa de Aprovação' },
            { value: '12,000+', label: 'Horas Poupadass' },
            { value: '4.9/5', label: 'Rating Médio' },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-5xl font-bold gradient-text mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-gray-400 uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}