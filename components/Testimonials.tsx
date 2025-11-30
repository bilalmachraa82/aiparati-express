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
    <section id="depoimentos" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            O que dizem os nossos clientes
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Mais de 500 empresas já confiam no AiparatiExpress
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-shadow"
            >
              <Quote className="w-8 h-8 text-blue-600 mb-4" />
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>
              <div>
                <p className="font-semibold text-gray-900">{testimonial.name}</p>
                <p className="text-sm text-gray-600">{testimonial.role}</p>
                <p className="text-sm text-blue-600">{testimonial.company}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
        >
          {[
            { value: '500+', label: 'Empresas Atendidas' },
            { value: '87%', label: 'Taxa de Aprovação' },
            { value: '60h', label: 'Tempo Economizado' },
            { value: '4.9', label: 'Rating Médio' },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}