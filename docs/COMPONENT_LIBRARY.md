# AutoFund AI Component Library Documentation

<div align="center">

[![Storybook](https://img.shields.io/badge/Storybook-7.0-FF4785?style=for-the-badge&logo=storybook&logoColor=white)](http://localhost:6006)
[![React](https://img.shields.io/badge/React-19.2.0-61dafb?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38b2ac?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

**🎨 Interactive Component Library with Live Documentation**

[🎮 Launch Storybook](http://localhost:6006) • [📖 Usage Guide](#usage-guide) • [🎨 Theming](#theming) • [🧪 Testing](#testing)

</div>

---

## 📋 Table of Contents

- [🏁 Overview](#-overview)
- [🚀 Getting Started](#-getting-started)
- [📦 Components](#-components)
- [🎨 Theming](#-theming)
- [🧪 Testing](#-testing)
- [📚 Best Practices](#-best-practices)
- [🔧 Development](#-development)

---

## 🏁 Overview

The AutoFund AI Component Library is a collection of premium, reusable React components built with TypeScript and Tailwind CSS. These components are designed to provide a consistent user experience across the AutoFund AI application and can be easily integrated into other projects.

### Key Features

- 🎨 **Beautiful Design**: Modern, clean UI with premium animations
- 🔒 **Type Safe**: Full TypeScript support with comprehensive type definitions
- 📱 **Responsive**: Mobile-first responsive design
- 🌙 **Dark Mode**: Built-in dark theme support
- ♿ **Accessible**: WCAG 2.1 AA compliance
- 🧪 **Well Tested**: Comprehensive test coverage
- 📖 **Well Documented**: Interactive documentation with Storybook
- 🎭 **Animated**: Smooth Framer Motion animations

### Technology Stack

- **React 19.2.0**: Modern React with concurrent features
- **TypeScript 5.7+**: Full type safety and IntelliSense
- **Tailwind CSS 4.0**: Utility-first CSS framework
- **Framer Motion 12**: Production-ready animations
- **Lucide React**: Consistent icon system
- **Storybook 7**: Component documentation and testing

---

## 🚀 Getting Started

### Prerequisites

```bash
# Required dependencies
npm install react@^19.2.0
npm install typescript@^5
npm install tailwindcss@^4
npm install framer-motion@^12
npm install lucide-react@^0.555
```

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/autofund-ai/autofund-ai.git
   cd autofund-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start Storybook**
   ```bash
   npm run storybook
   ```
   This opens Storybook at `http://localhost:6006`

### Component Usage

```typescript
import { PremiumUploadArea } from '@/app/components/PremiumUploadArea';
import { FormData } from '@/types/api';

function MyComponent() {
  const [formData, setFormData] = useState<FormData>({
    nif: '',
    ano_exercicio: '',
    designacao_social: '',
    email: '',
    context: '',
  });

  return (
    <PremiumUploadArea
      formData={formData}
      onFormDataChange={setFormData}
      onFileSelect={(file) => console.log('File selected:', file)}
      isUploading={false}
      error={null}
    />
  );
}
```

---

## 📦 Components

### Core Components

#### PremiumUploadArea

Advanced drag-and-drop file upload component with form validation and progress tracking.

**Features:**
- 🎯 Drag-and-drop file upload
- 📝 Integrated form validation
- 📊 Real-time upload progress
- 🎨 Beautiful animations
- 📱 Mobile responsive
- ♿ Accessibility compliant

**Props:**
```typescript
interface PremiumUploadAreaProps {
  formData: FormData;
  onFormDataChange: (data: FormData) => void;
  onFileSelect: (file: File) => void;
  isUploading: boolean;
  uploadProgress?: UploadProgress;
  error: string | null;
}
```

**Example Usage:**
```tsx
<PremiumUploadArea
  formData={{
    nif: '508195673',
    ano_exercicio: '2023',
    designacao_social: 'AutoFund AI',
    email: 'contato@autofund.ai',
    context: ''
  }}
  onFormDataChange={setFormData}
  onFileSelect={handleFileSelect}
  isUploading={false}
  error={null}
/>
```

#### PremiumResultsView

Comprehensive results display component for financial analysis results.

**Features:**
- 📊 Financial data visualization
- 🎯 Risk assessment display
- 💡 Recommendations section
- 📥 Download functionality
- 🎨 Animated transitions
- 📱 Responsive layout

**Props:**
```typescript
interface PremiumResultsViewProps {
  resultData: AnalysisResult;
  onDownload: (fileType: 'excel' | 'json') => void;
  onNewAnalysis: () => void;
}
```

**Example Usage:**
```tsx
<PremiumResultsView
  resultData={analysisResult}
  onDownload={(type) => downloadFile(type)}
  onNewAnalysis={() => resetForm()}
/>
```

#### PremiumProcessingStatus

Real-time processing status component with animated progress indicators.

**Features:**
- ⏳ Multi-stage progress tracking
- 🎨 Animated status indicators
- 📊 Percentage display
- 🔄 Real-time updates
- 📱 Mobile optimized

#### PremiumHeader

Modern header component with navigation and user authentication.

**Features:**
- 🧭 Responsive navigation
- 👤 User authentication UI
- 🌙 Dark mode toggle
- 📱 Mobile menu
- 🎨 Smooth animations

### Utility Components

#### ErrorBoundary

React Error Boundary component for graceful error handling.

**Features:**
- 🚨 Graceful error catching
- 📝 Error reporting
- 🔄 Recovery options
- 🎨 Styled error display

#### LoadingSkeleton

Skeleton loading component for better perceived performance.

**Features:**
- 🦴 Customizable skeleton shapes
- 🎨 Animated loading states
- 📱 Responsive design
- ♿ Accessibility support

#### AnimatedTitle

Animated title component with typewriter effect.

**Features:**
- ⌨️ Typewriter animation
- 🎨 Customizable styling
- 🔄 Loop option
- 📱 Mobile friendly

---

## 🎨 Theming

### Theme Configuration

The component library supports light and dark themes with customizable color schemes.

#### CSS Variables

```css
:root {
  /* Primary colors */
  --color-primary: #3b82f6;
  --color-primary-dark: #2563eb;
  --color-primary-light: #60a5fa;

  /* Secondary colors */
  --color-secondary: #6366f1;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;

  /* Neutral colors */
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-900: #111827;

  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;

  /* Border radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
}
```

#### Dark Theme

```css
.dark {
  --color-primary: #60a5fa;
  --color-secondary: #818cf8;
  --color-gray-50: #111827;
  --color-gray-100: #1f2937;
  --color-gray-900: #f9fafb;
}
```

### Theme Provider

```tsx
import { createContext, useContext, useState, useEffect } from 'react';

interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
```

---

## 🧪 Testing

### Component Testing with Storybook

Each component includes comprehensive Storybook stories for testing different states and variations.

```bash
# Run Storybook
npm run storybook

# Run Storybook tests
npm run test-storybook
```

### Unit Testing with React Testing Library

```typescript
// Example test for PremiumUploadArea
import { render, screen, fireEvent } from '@testing-library/react';
import { PremiumUploadArea } from './PremiumUploadArea';

describe('PremiumUploadArea', () => {
  it('renders upload area correctly', () => {
    const mockProps = {
      formData: { nif: '', ano_exercicio: '', designacao_social: '', email: '', context: '' },
      onFormDataChange: jest.fn(),
      onFileSelect: jest.fn(),
      isUploading: false,
      error: null,
    };

    render(<PremiumUploadArea {...mockProps} />);

    expect(screen.getByText('Arraste o seu ficheiro IES')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('NIF (9 dígitos)')).toBeInTheDocument();
  });

  it('validates form correctly', () => {
    const mockProps = {
      formData: { nif: '', ano_exercicio: '', designacao_social: '', email: '', context: '' },
      onFormDataChange: jest.fn(),
      onFileSelect: jest.fn(),
      isUploading: false,
      error: null,
    };

    render(<PremiumUploadArea {...mockProps} />);

    const uploadButton = screen.getByRole('button', { name: /analisar/i });
    expect(uploadButton).toBeDisabled();
  });
});
```

### E2E Testing with Playwright

```typescript
// Example E2E test
import { test, expect } from '@playwright/test';

test('Complete IES upload flow', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Fill form
  await page.fill('input[name="nif"]', '508195673');
  await page.fill('input[name="ano_exercicio"]', '2023');
  await page.fill('input[name="designacao_social"]', 'Test Company');
  await page.fill('input[name="email"]', 'test@example.com');

  // Upload file
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles('test-files/IES-2023.pdf');

  // Submit form
  await page.click('button[type="submit"]');

  // Verify upload started
  await expect(page.locator('[data-testid="upload-progress"]')).toBeVisible();

  // Wait for results
  await expect(page.locator('[data-testid="results-view"]')).toBeVisible({ timeout: 120000 });
});
```

---

## 📚 Best Practices

### Component Development Guidelines

1. **TypeScript First**: Always define interfaces and types
2. **Props Design**: Keep props simple and well-documented
3. **Accessibility**: Include proper ARIA labels and keyboard navigation
4. **Responsive**: Design mobile-first
5. **Performance**: Use React.memo and useMemo appropriately
6. **Testing**: Write comprehensive tests for all components

### Code Style

```typescript
// ✅ Good component structure
import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface ComponentProps {
  /** Description of the prop */
  propName: string;
  /** Optional prop with default value */
  optionalProp?: number;
}

/**
 * Brief description of what the component does
 */
export function Component({
  propName,
  optionalProp = 0
}: ComponentProps) {
  const [state, setState] = useState(initialValue);

  const handleCallback = useCallback((param: string) => {
    // Implementation
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="proper-tailwind-classes"
    >
      {/* Component content */}
    </motion.div>
  );
}
```

### Naming Conventions

- **Components**: PascalCase (e.g., `PremiumUploadArea`)
- **Props**: camelCase (e.g., `onFileSelect`)
- **Files**: ComponentName.stories.tsx for stories
- **CSS Classes**: kebab-case with Tailwind utilities

### Performance Optimization

```typescript
// ✅ Use React.memo for expensive components
export const ExpensiveComponent = React.memo(function ExpensiveComponent({
  data,
  onAction
}: Props) {
  const processedData = useMemo(() => {
    return data.map(item => expensiveOperation(item));
  }, [data]);

  return <div>{/* Render processed data */}</div>;
});

// ✅ Use useCallback for stable function references
const handleClick = useCallback((id: string) => {
  onAction(id);
}, [onAction]);
```

---

## 🔧 Development

### Running Storybook

```bash
# Start development server
npm run storybook

# Build static version
npm run build-storybook

# Run tests
npm run test-storybook
```

### Adding New Components

1. **Create Component File**
   ```bash
   # Create new component
   touch app/components/NewComponent.tsx
   touch app/components/NewComponent.stories.tsx
   ```

2. **Component Template**
   ```typescript
   'use client';

   import React from 'react';
   import { motion } from 'framer-motion';

   interface NewComponentProps {
     /** Component prop description */
     title: string;
   }

   export function NewComponent({ title }: NewComponentProps) {
     return (
       <motion.div
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         className="p-4"
       >
         <h2>{title}</h2>
       </motion.div>
     );
   }
   ```

3. **Stories Template**
   ```typescript
   import type { Meta, StoryObj } from '@storybook/react';
   import { NewComponent } from './NewComponent';

   const meta: Meta<typeof NewComponent> = {
     title: 'Components/NewComponent',
     component: NewComponent,
     parameters: {
       layout: 'centered',
     },
   };

   export default meta;
   type Story = StoryObj<typeof meta>;

   export const Default: Story = {
     args: {
       title: 'Hello World',
     },
   };
   ```

### Custom Hooks

Create reusable hooks in `hooks/` directory:

```typescript
// hooks/useFileUpload.ts
import { useState, useCallback } from 'react';

export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadFile = useCallback(async (file: File) => {
    setIsUploading(true);
    setProgress(0);

    try {
      // Upload logic here
      for (let i = 0; i <= 100; i++) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    } finally {
      setIsUploading(false);
    }
  }, []);

  return { isUploading, progress, uploadFile };
}
```

---

## 📞 Support

### Getting Help

- **Documentation**: [Component Docs](http://localhost:6006)
- **Issues**: [GitHub Issues](https://github.com/autofund-ai/issues)
- **Discussions**: [GitHub Discussions](https://github.com/autofund-ai/discussions)
- **Email**: [components@autofund.ai](mailto:components@autofund.ai)

### Contributing

We welcome contributions! Please see our [Contributing Guide](../CONTRIBUTING.md) for details.

### License

This component library is licensed under the MIT License. See [LICENSE](../LICENSE) for details.

---

<div align="center">

[![Built with ❤️ in Portugal](https://img.shields.io/badge/Built%20with%20❤️%20in%20Portugal-00205B?style=for-the-badge)](https://autofund.ai)

**🎨 Build beautiful UI components with AutoFund AI**

[🎮 Launch Storybook](http://localhost:6006) • [📖 Documentation](#overview) • [🔧 Contributing](#contributing)

</div>