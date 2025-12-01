'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export function Skeleton({
  className = '',
  variant = 'text',
  width,
  height,
  lines = 1,
}: SkeletonProps) {
  const baseClasses = 'bg-gray-200 dark:bg-gray-700 rounded animate-pulse';

  const variantClasses = {
    text: 'h-4 rounded',
    rectangular: 'rounded-lg',
    circular: 'rounded-full',
  };

  const style = {
    width: width || undefined,
    height: height || undefined,
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }, (_, i) => (
          <div
            key={i}
            className={`${baseClasses} ${variantClasses[variant]}`}
            style={{
              ...style,
              width: i === lines - 1 ? '70%' : '100%',
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
}

// Predefined skeleton components
export function CardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4"
    >
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1 space-y-2">
          <Skeleton width="60%" />
          <Skeleton width="40%" />
        </div>
      </div>
      <Skeleton lines={3} />
    </motion.div>
  );
}

export function FormSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6">
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-8" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton width="30%" height={16} />
            <Skeleton height={48} />
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <Skeleton width="40%" height={16} />
        <Skeleton height={48} />
      </div>

      <Skeleton height={200} variant="rectangular" />
    </div>
  );
}

export function ResultsSkeleton() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <Skeleton variant="circular" width={80} height={80} className="mx-auto" />
        <Skeleton width="60%" height={32} className="mx-auto" />
        <Skeleton width="40%" height={20} className="mx-auto" />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 space-y-6">
        <Skeleton width="30%" height={24} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton width="80%" height={14} />
              <Skeleton width="60%" height={20} />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 space-y-6">
        <Skeleton width="30%" height={24} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <Skeleton width="70%" height={16} />
              <Skeleton width="50%" height={24} className="mt-2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProcessingSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <Skeleton width="50%" height={36} className="mx-auto" />
        <Skeleton width="60%" height={20} className="mx-auto" />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 space-y-4">
        <div className="flex justify-between items-center mb-4">
          <Skeleton width="30%" height={16} />
          <Skeleton width="20%" height={16} />
        </div>
        <Skeleton height={12} variant="rectangular" />
      </div>

      <div className="space-y-4">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <Skeleton variant="circular" width={24} height={24} />
              <div className="flex-1 space-y-2">
                <Skeleton width="20%" height={16} />
                <Skeleton width="40%" height={14} />
              </div>
              <Skeleton variant="circular" width={48} height={48} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Loading overlay component
export function LoadingOverlay({ message = 'A carregar...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-sm mx-4 text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-900 dark:text-white font-medium">{message}</p>
      </div>
    </div>
  );
}

// Pulse animation wrapper
export function PulseWrapper({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0.6 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        repeatType: 'reverse',
      }}
    >
      {children}
    </motion.div>
  );
}