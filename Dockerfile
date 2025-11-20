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

RUN chmod +x generate-env.sh && ./generate-env.sh

RUN pnpm run build --configuration=production

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

COPY --from=builder /app/dist/inventory-to-csv/browser /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
