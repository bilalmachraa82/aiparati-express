'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Menu, X, FileText } from 'lucide-react';

interface HeaderProps {
  onUploadClick: () => void;
  showBackButton?: boolean;
  setCurrentView?: (view: 'landing' | 'upload' | 'processing' | 'results') => void;
}

export function Header({ onUploadClick, showBackButton = false, setCurrentView }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">AiparatiExpress</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#como-funciona" className="text-gray-600 hover:text-gray-900 transition-colors">
              Como Funciona
            </a>
            <a href="#depoimentos" className="text-gray-600 hover:text-gray-900 transition-colors">
              Depoimentos
            </a>
            <button
              onClick={onUploadClick}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-full hover:shadow-lg transition-all"
            >
              Começar
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden py-4 border-t border-gray-200"
          >
            <nav className="flex flex-col gap-4">
              <a
                href="#como-funciona"
                className="text-gray-600 hover:text-gray-900 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Como Funciona
              </a>
              <a
                href="#depoimentos"
                className="text-gray-600 hover:text-gray-900 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Depoimentos
              </a>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onUploadClick();
                }}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-full"
              >
                Começar
              </button>
            </nav>
          </motion.div>
        )}

        {/* Back Button (for inner pages) */}
        {showBackButton && (
          <button
            onClick={() => setCurrentView?.('landing')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
        )}
      </div>
    </motion.header>
  );
}