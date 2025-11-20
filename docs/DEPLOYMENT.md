# 🚀 Production Deployment Guide

This guide will help you configure automatic deployment of **inventory-to-csv** to Dokploy using GitHub Actions.

---

## 📋 Index

1. [Deployment architecture](#deployment-architecture)
2. [GitHub configuration](#github-configuration)
3. [Dokploy configuration](#dokploy-configuration)
4. [Environment variables](#environment-variables)
5. [Local testing](#local-testing)
6. [Troubleshooting](#troubleshooting)

---

## 🏗️ Arquitectura del despliegue

```
┌─────────────────┐
│   GitHub Repo   │
│   (Push/main)   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│   GitHub Actions        │
│  - Generate env file    │
│  - Build Docker image   │
│  - Push to GHCR         │
└────────┬────────────────┘
         │
         ▼
┌─────────────────┐
│    Dokploy      │
│  - Pull image   │
│  - Deploy app   │
└─────────────────┘
```

**Nota:** Las variables de entorno se inyectan en **build time**, no en runtime.

---

## 🔧 Configuración de GitHub

### 1. Habilitar GitHub Container Registry (GHCR)

El workflow ya está configurado para usar GHCR. Solo necesitas:

1. Ve a tu repositorio en GitHub
2. Settings → Actions → General
3. En **Workflow permissions**, selecciona:

- ✅ **Read and write permissions**

4. Guarda los cambios

### 2. Configurar GitHub Secrets

Ve a tu repositorio → Settings → Secrets and variables → Actions → New repository secret

Agrega los siguientes secrets:

| Secret Name             | Descripción                 | Ejemplo                                  |
|-------------------------|-----------------------------|------------------------------------------|
| `GOOGLE_GEMINI_API_KEY` | API key de Google Gemini    | `AIzaSyD...`                             |
| `SUPABASE_URL`          | URL de tu proyecto Supabase | `https://xxx.supabase.co`                |
| `SUPABASE_ANON_KEY`     | Anon key de Supabase        | `eyJhbGci...`                            |
| `DOKPLOY_WEBHOOK_URL`   | URL del webhook de Dokploy  | `https://tu-dokploy.com/api/webhook/...` |

> **Nota:** El token de GitHub (`GITHUB_TOKEN`) se proporciona automáticamente por GitHub Actions.

---

## 🐳 Configuración de Dokploy

### 1. Crear la aplicación en Dokploy

1. Accede a tu panel de Dokploy
2. Crea una nueva aplicación tipo **Docker**
3. Configura los siguientes parámetros:

```yaml
Nombre: inventory-to-csv
Tipo: Docker
Imagen: ghcr.io/TUUSUARIO/inventory-to-csv:latest
Puerto: 80
```

**Nota:** No es necesario configurar variables de entorno en Dokploy ya que están compiladas en la imagen.

### 2. Obtener el Webhook URL

1. En tu aplicación de Dokploy, ve a la sección **Webhooks** o **Deployments**
2. Copia la URL del webhook de despliegue
3. Agrégala como secret en GitHub (paso anterior)

### 3. Configurar el Registry

Si usas GHCR (GitHub Container Registry):

1. En Dokploy, ve a **Registry Settings**
2. Agrega:
   ```
   Registry URL: ghcr.io
   Username: tu-usuario-github
   Password: [GitHub Personal Access Token con permisos read:packages]
   ```

Para crear el token:

- GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
- Crea un nuevo token con el scope `read:packages`

---

## 🔐 Variables de entorno

### ¿Dónde se configuran?

| Variable                | GitHub Secrets | Build Args | Propósito                         |
|-------------------------|----------------|------------|-----------------------------------|
| `GITHUB_TOKEN`          | ✅ Auto         | ❌          | Push de imágenes a GHCR           |
| `DOKPLOY_WEBHOOK_URL`   | ✅              | ❌          | Trigger del deploy                |
| `GOOGLE_GEMINI_API_KEY` | ✅              | ✅          | API key de Gemini (build time)    |
| `SUPABASE_URL`          | ✅              | ✅          | URL de Supabase (build time)      |
| `SUPABASE_ANON_KEY`     | ✅              | ✅          | Anon key de Supabase (build time) |

### ¿Por qué en build time?

- **Seguridad**: Las variables se compilan en el código durante el build
- **Simplicidad**: Dokploy solo hace pull y run, sin configuración extra
- **Inmutabilidad**: Cada imagen es una versión completa y autocontenida
- **Secrets seguros**: Solo GitHub Actions tiene acceso a las variables sensibles
- **Nota**: Cambiar configuraciones requiere un nuevo build (push a main)

---

## 🧪 Pruebas locales

### Probar el build de Docker localmente

```bash
# Construir la imagen con build args
docker build -t inventory-to-csv:local \
  --build-arg GOOGLE_GEMINI_API_KEY="tu_key" \
  --build-arg SUPABASE_URL="tu_url" \
  --build-arg SUPABASE_ANON_KEY="tu_key" \
  .

# Ejecutar
docker run -p 8080:80 inventory-to-csv:local

# Accede a: http://localhost:8080
```

---

## 🔄 Flujo de trabajo completo

1. **Desarrollas** en tu rama local
2. **Haces push** a `main`
3. **GitHub Actions** se ejecuta automáticamente:

- Construye la imagen Docker
- La sube a GHCR con tags: `latest`, `main-SHA`, `main`

4. **Notifica a Dokploy** via webhook
5. **Dokploy**:

- Pull de la nueva imagen
- Inyecta las variables de entorno
- Despliega la aplicación
- Hace rollout sin downtime

---

## 🐛 Troubleshooting

### Error: "Permission denied to push to GHCR"

**Solución:**

- Verifica que el repositorio tenga permisos de **Read and write** en Actions
- Settings → Actions → General → Workflow permissions

### Error: "Failed to trigger Dokploy webhook"

**Solución:**

- Verifica que `DOKPLOY_WEBHOOK_URL` esté correctamente configurado
- Prueba el webhook manualmente con curl:
  ```bash
  curl -X POST "https://tu-dokploy.com/webhook" \
    -H "Content-Type: application/json"
  ```

### Error: "Application shows empty environment variables"

**Solución:**

- Verifica que los secrets estén configurados en GitHub
- Revisa los logs del build en GitHub Actions
- El archivo `environment.prod.ts` debe generarse correctamente durante el build
- Verifica que el script `generate-env.sh` se ejecute correctamente

### Build falla con "pnpm: not found"

**Solución:**

- El Dockerfile ya instala pnpm globalmente
- Si aún falla, verifica la versión en `package.json` vs `Dockerfile`

### Nginx muestra 404 en rutas de Angular

**Solución:**

- Ya está configurado en `nginx.conf` con `try_files`
- Si persiste, verifica que el build esté en `/usr/share/nginx/html`

---

## 📊 Monitoreo

### Ver logs en Dokploy

```bash
# En el panel de Dokploy, ve a Logs
# O accede via SSH a tu servidor:
docker logs -f <container-name>
```

### Ver logs de GitHub Actions

1. Ve a tu repositorio → Actions
2. Selecciona el workflow ejecutado
3. Expande los steps para ver detalles

---

## 🎯 Checklist de configuración

Antes de hacer push a `main`, verifica:

- [ ] GitHub Actions tiene permisos de escritura
- [ ] `DOKPLOY_WEBHOOK_URL` está configurado en GitHub Secrets
- [ ] Aplicación creada en Dokploy
- [ ] Variables de entorno configuradas en Dokploy
- [ ] Registry credentials configurados en Dokploy (si usas GHCR privado)
- [ ] Webhook URL es accesible desde GitHub

---

## 🚀 ¡Listo para producción!

Una vez configurado todo, cada push a `main` desplegará automáticamente la nueva versión.

Para hacer un deploy manual:

1. Ve a Actions en GitHub
2. Selecciona "Build and Deploy to Dokploy"
3. Click en "Run workflow"
4. Selecciona la rama `main`
5. Click en "Run workflow"

---

## 📝 Notas adicionales

- Las imágenes antiguas en GHCR se pueden limpiar manualmente
- Dokploy mantiene un historial de deployments para rollbacks
- Los logs de nginx están disponibles en `/var/log/nginx/`
- Las variables de entorno **NUNCA** se incluyen en la imagen Docker
- Todas las variables sensibles se inyectan en runtime

---

¿Necesitas ayuda? Revisa la sección de [Troubleshooting](#troubleshooting) o abre un issue en el repositorio.
