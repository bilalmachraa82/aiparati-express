'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface DarkModeContextType {
  isDark: boolean
  toggle: () => void
  setDarkMode: (isDark: boolean) => void
}

const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined)

export function DarkModeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(() => {
    // Check system preference on mount
    if (typeof window !== 'undefined') {
      const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches
      const savedPreference = localStorage.getItem('darkMode')

      if (savedPreference !== null) {
        return savedPreference === 'true'
      }

      return systemPreference
    }
    return false
  })

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(isDark ? 'dark' : 'light')

    // Save to localStorage
    localStorage.setItem('darkMode', isDark.toString())
  }, [isDark])

  useEffect(() => {
    // Listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      if (localStorage.getItem('darkMode') === null) {
        setIsDark(e.matches)
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const toggle = () => {
    setIsDark(prev => !prev)
  }

  const setDarkMode = (darkMode: boolean) => {
    setIsDark(darkMode)
  }

  return (
    <DarkModeContext.Provider value={{ isDark, toggle, setDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  )
}

export function useDarkMode() {
  const context = useContext(DarkModeContext)
  if (context === undefined) {
    throw new Error('useDarkMode must be used within a DarkModeProvider')
  }
  return context
}