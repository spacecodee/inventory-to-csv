# Stage 1: Build the Angular application
FROM node:22-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm@10.22.0

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

ARG GOOGLE_GEMINI_API_KEY
ARG SUPABASE_URL
ARG SUPABASE_ANON_KEY

RUN test -n "$GOOGLE_GEMINI_API_KEY" || (echo "ERROR: GOOGLE_GEMINI_API_KEY build argument is required" && exit 1)
RUN test -n "$SUPABASE_URL" || (echo "ERROR: SUPABASE_URL build argument is required" && exit 1)
RUN test -n "$SUPABASE_ANON_KEY" || (echo "ERROR: SUPABASE_ANON_KEY build argument is required" && exit 1)

RUN sed -i "s|__GOOGLE_GEMINI_API_KEY_PLACEHOLDER__|${GOOGLE_GEMINI_API_KEY}|g" src/environments/environment.prod.ts && \
    sed -i "s|__SUPABASE_URL_PLACEHOLDER__|${SUPABASE_URL}|g" src/environments/environment.prod.ts && \
    sed -i "s|__SUPABASE_ANON_KEY_PLACEHOLDER__|${SUPABASE_ANON_KEY}|g" src/environments/environment.prod.ts

RUN pnpm run build --configuration=production

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

COPY --from=builder /app/dist/inventory-to-csv/browser /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
