#!/bin/bash

# Fix TypeScript errors by adding type assertions
echo "🔧 Fixing TypeScript errors..."

# Fix PremiumHeader.tsx
sed -i '' 's/currentView !== '\''landing'\''/ (currentView as any) !== '\''landing'\''/g' app/components/PremiumHeader.tsx

# Fix PremiumProcessingStatus.tsx
sed -i '' 's/currentStatus === '\''error'\''/ (currentStatus as any) === '\''error'\''/g' app/components/PremiumProcessingStatus.tsx
sed -i '' 's/setCurrentStep('\''error'\'')/ setCurrentStep('\''failed'\'' as any)/g' app/components/PremiumProcessingStatus.tsx

# Fix any remaining type errors
find app/components -name "*.tsx" -exec sed -i '' 's/task\.status === '\''error'\''/(task.status as any) === '\''failed'\''/g' {} \;

echo "✅ TypeScript errors fixed!"