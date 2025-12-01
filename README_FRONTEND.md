# AutoFund AI Frontend

Premium Next.js frontend for Portugal 2030 fund application automation.

## 🚀 Features

### Core Functionality
- **File Upload**: Drag-and-drop IES PDF upload with progress tracking
- **Real-time Processing**: Live status updates during AI analysis
- **Premium UI**: Modern, responsive design with dark mode
- **PWA Support**: Progressive Web App features for mobile experience
- **Error Handling**: Comprehensive error boundaries and user feedback

### Technical Features
- **TypeScript**: Full type safety with proper API integration
- **Tailwind CSS**: Utility-first styling with dark mode
- **Framer Motion**: Premium animations and micro-interactions
- **React Query**: Optimistic updates and caching
- **Error Boundaries**: Graceful error handling throughout

## 🛠 Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000  # Development backend
NEXT_PUBLIC_API_URL=  # Production (uses same origin)
```

## 🎨 Design System

### Color Palette
- **Primary**: Blue 600 (#2563eb)
- **Secondary**: Purple 600 (#9333ea)
- **Success**: Green 600 (#16a34a)
- **Warning**: Amber 600 (#d97706)
- **Error**: Red 600 (#dc2626)

### Typography
- **Font**: Inter (system-ui fallback)
- **Headings**: Bold, gradient text for main headings
- **Body**: Regular weight with proper line height

### Components

#### PremiumUploadArea
- Drag-and-drop file upload
- Form validation with real-time feedback
- Progress tracking with visual indicators
- Error handling with clear messages

#### PremiumProcessingStatus
- Real-time status updates
- Progress bar with percentage
- Step-by-step processing visualization
- Error states with retry options

#### PremiumResultsView
- Financial data visualization
- Risk assessment with color coding
- Download functionality for Excel/JSON
- Responsive grid layout

## 🔌 API Integration

### Authentication
- Bearer token authentication
- Automatic error handling
- Request/response interceptors

### Endpoints
- `POST /api/upload` - File upload
- `GET /api/status/{taskId}` - Status checking
- `GET /api/download/{taskId}/{fileType}` - File download

### Error Handling
- Network error detection
- Retry logic with exponential backoff
- User-friendly error messages
- Fallback states

## 📱 PWA Features

### Offline Support
- Service worker for offline caching
- Offline fallback pages
- Sync when back online

### App-like Experience
- Custom manifest.json
- App icons for all sizes
- Splash screens
- Standalone mode support

## 🎯 Performance

### Core Web Vitals
- **LCP**: < 2.5s (Largest Contentful Paint)
- **FID**: < 100ms (First Input Delay)
- **CLS**: < 0.1 (Cumulative Layout Shift)

### Optimizations
- Code splitting with dynamic imports
- Image optimization with Next.js Image
- Font optimization with Google Fonts
- Bundle size optimization

## 🌙 Dark Mode

### Implementation
- System preference detection
- Manual toggle with localStorage persistence
- Smooth transitions between themes
- Proper color contrast

### Usage
```tsx
import { useDarkMode } from '@/contexts/DarkModeContext';

const { isDark, toggleDarkMode } = useDarkMode();
```

## 🔧 Development

### File Structure
```
app/
├── components/          # Reusable UI components
├── contexts/           # React contexts
├── services/           # API services
├── types/              # TypeScript definitions
├── globals.css         # Global styles
├── layout.tsx          # Root layout
└── page.tsx            # Home page
```

### Code Quality
- ESLint configuration for Next.js
- TypeScript strict mode
- Prettier for code formatting
- Husky for git hooks

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Environment Setup
- Set `NEXT_PUBLIC_API_URL` to production backend
- Configure CORS on backend for production domain
- Set up proper SSL certificates

## 🧪 Testing

### Manual Testing
1. File upload with PDF
2. Form validation
3. Processing status updates
4. Results display
5. Download functionality
6. Dark mode toggle
7. Mobile responsiveness

### API Testing
```bash
# Health check
curl http://localhost:8000/

# Upload test
curl -X POST \
  -H "Authorization: Bearer testtoken123" \
  -F "file=@test.pdf" \
  -F "nif=123456789" \
  http://localhost:8000/api/upload
```

## 🔄 Backend Integration

The frontend is designed to work seamlessly with the FastAPI backend. Key integration points:

1. **API URL Configuration**: Automatically switches between development and production
2. **Authentication**: Bearer token handling with proper error states
3. **Data Validation**: TypeScript types match backend Pydantic models
4. **Error Handling**: Graceful degradation when backend is unavailable

## 📊 Analytics & Monitoring

### Recommended Tools
- **Vercel Analytics**: Performance monitoring
- **Sentry**: Error tracking and reporting
- **Hotjar**: User behavior analytics
- **Google Analytics**: Traffic and conversion tracking

## 🤝 Contributing

### Guidelines
1. Follow existing code style
2. Write TypeScript types for all new code
3. Test on multiple screen sizes
4. Ensure dark mode compatibility
5. Update documentation

### Pull Request Process
1. Create feature branch from `main`
2. Implement changes with tests
3. Update documentation
4. Submit PR with detailed description

## 📞 Support

For technical issues or questions:
- Check the GitHub Issues
- Review the API documentation
- Contact the development team

---

**Built with ❤️ using Next.js 16, TypeScript, and Tailwind CSS**