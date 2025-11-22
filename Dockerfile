# Stage 1: Build the Angular application
FROM node:22-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm@10.22.0

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN --mount=type=secret,id=google_gemini_api_key \
    --mount=type=secret,id=supabase_url \
    --mount=type=secret,id=supabase_anon_key \
    GEMINI_KEY="$(cat /run/secrets/google_gemini_api_key 2>/dev/null || echo '')" && \
    SUPABASE_URL_VALUE="$(cat /run/secrets/supabase_url 2>/dev/null || echo '')" && \
    SUPABASE_KEY="$(cat /run/secrets/supabase_anon_key 2>/dev/null || echo '')" && \
    if [ -z "$GEMINI_KEY" ]; then echo "ERROR: GOOGLE_GEMINI_API_KEY is required"; exit 1; fi && \
    if [ -z "$SUPABASE_URL_VALUE" ]; then echo "ERROR: SUPABASE_URL is required"; exit 1; fi && \
    if [ -z "$SUPABASE_KEY" ]; then echo "ERROR: SUPABASE_ANON_KEY is required"; exit 1; fi && \
    sed -i "s|__GOOGLE_GEMINI_API_KEY_PLACEHOLDER__|${GEMINI_KEY}|g" src/environments/environment.prod.ts && \
    sed -i "s|__SUPABASE_URL_PLACEHOLDER__|${SUPABASE_URL_VALUE}|g" src/environments/environment.prod.ts && \
    sed -i "s|__SUPABASE_ANON_KEY_PLACEHOLDER__|${SUPABASE_KEY}|g" src/environments/environment.prod.ts

RUN pnpm run build --configuration=production

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

COPY --from=builder /app/dist/inventory-to-csv/browser /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
