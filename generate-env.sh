#!/bin/bash

set -e

echo "🔧 Generating production environment file..."

if [ -z "$GOOGLE_GEMINI_API_KEY" ]; then
  echo "⚠️  Warning: GOOGLE_GEMINI_API_KEY environment variable is not set"
fi

if [ -z "$SUPABASE_URL" ]; then
  echo "⚠️  Warning: SUPABASE_URL environment variable is not set"
fi

if [ -z "$SUPABASE_ANON_KEY" ]; then
  echo "⚠️  Warning: SUPABASE_ANON_KEY environment variable is not set"
fi

cat > src/environments/environment.prod.ts << EOF
export const environment = {
  production: true,
  googleGeminiApiKey: '${GOOGLE_GEMINI_API_KEY}',
  supabase: {
    url: '${SUPABASE_URL}',
    anonKey: '${SUPABASE_ANON_KEY}',
  },
};
EOF

echo "✅ Production environment file created successfully"
