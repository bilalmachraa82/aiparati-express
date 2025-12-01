'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Menu, X, FileSpreadsheet, TrendingUp, Star } from 'lucide-react';

interface HeaderProps {
  onUploadClick: () => void;
  showBackButton?: boolean;
  setCurrentView?: (view: 'landing' | 'upload' | 'processing' | 'results') => void;
}

export function Header({ onUploadClick, showBackButton = false, setCurrentView }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-white/20"
      >
        <div className="container-wide">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.5 }}
                className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg"
              >
                <FileSpreadsheet className="w-7 h-7 text-white" />
              </motion.div>
              <div className="flex flex-col">
                <span className="font-bold text-xl text-gray-900 leading-tight">Aiparati</span>
                <span className="font-bold text-xl text-blue-600 leading-tight">Express</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              <a href="#features" className="nav-link">
                Funcionalidades
              </a>
              <a href="#como-funciona" className="nav-link">
                Como Funciona
              </a>
              <a href="#depoimentos" className="nav-link">
                Casos de Sucesso
              </a>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onUploadClick}
                className="btn-primary"
              >
                Começar Agora
              </motion.button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-3 rounded-xl hover:bg-gray-100 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6 text-gray-700" /> : <Menu className="w-6 h-6 text-gray-700" />}
            </button>

            {/* Back Button (for inner pages) */}
            {showBackButton && (
              <button
                onClick={() => setCurrentView?.('landing')}
                className="hidden md:flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </button>
            )}
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden lg:hidden border-t border-gray-100"
              >
                <nav className="py-6 space-y-4">
                  <a
                    href="#features"
                    className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Funcionalidades
                  </a>
                  <a
                    href="#como-funciona"
                    className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Como Funciona
                  </a>
                  <a
                    href="#depoimentos"
                    className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Casos de Sucesso
                  </a>

                  <div className="pt-4 border-t border-gray-100">
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onUploadClick();
                      }}
                      className="btn-primary w-full"
                    >
                      Começar Agora
                    </button>
                  </div>

                  {/* Trust indicators for mobile */}
                  <div className="px-4 py-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium text-gray-700">4.9/5</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-gray-700">94% Sucesso</span>
                      </div>
                    </div>
                  </div>
                </nav>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>

      {/* Back Button (for inner pages) - Mobile */}
      {showBackButton && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:hidden fixed top-24 left-6 z-40"
        >
          <button
            onClick={() => setCurrentView?.('landing')}
            className="flex items-center gap-2 px-4 py-2 bg-white shadow-lg rounded-full text-gray-600 hover:text-gray-900 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
        </motion.div>
      )}
    </>
  );
}