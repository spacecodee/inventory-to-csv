#!/bin/bash

set -a
source .env.local
set +a

echo "$GOOGLE_GEMINI_API_KEY" > /tmp/google_gemini_api_key
echo "$SUPABASE_URL" > /tmp/supabase_url
echo "$SUPABASE_ANON_KEY" > /tmp/supabase_anon_key

DOCKER_BUILDKIT=1 docker build -t inventory-to-csv:local \
  --secret id=google_gemini_api_key,src=/tmp/google_gemini_api_key \
  --secret id=supabase_url,src=/tmp/supabase_url \
  --secret id=supabase_anon_key,src=/tmp/supabase_anon_key \
  .

rm /tmp/google_gemini_api_key /tmp/supabase_url /tmp/supabase_anon_key

echo "✅ Build done: inventory-to-csv:local"
echo "to execute: docker run -p 8080:80 inventory-to-csv:local"
