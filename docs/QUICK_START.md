# 🚀 Quick Start - Production Deployment

This is a quick guide to deploy **inventory-to-csv** to production using Dokploy.

---

## ⚡ Setup in 5 minutes

### 1️⃣ GitHub (2 minutes)

```bash
# 1. Enable write permissions in GitHub Actions
# Go to: Settings → Actions → General → Workflow permissions
# Select: "Read and write permissions"

# 2. Add the required secrets
# Go to: Settings → Secrets and variables → Actions
# Create these 4 secrets:

GOOGLE_GEMINI_API_KEY=your_gemini_api_key
SUPABASE_URL=https://yourproject.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
DOKPLOY_WEBHOOK_URL=https://your-dokploy.com/api/webhook/...
```

### 2️⃣ Dokploy (1 minute)

```yaml
# Create application
Type: Docker
Image: ghcr.io/YOURUSERNAME/inventory-to-csv:main-abc1234
Port: 80

# NO need to configure environment variables
# (already compiled in the image)

# Registry (if your repo is private)
Registry: ghcr.io
Username: your-github-username
Password: [ GitHub Token with read:packages ]
```

**Copy the webhook URL** and add it as a secret in GitHub (step 1).

### 3️⃣ Deploy

```bash
# Push to main to deploy automatically
git add .
git commit -m "Configure production deployment"
git push origin main

# Or manually from GitHub:
# Actions → Build and Deploy to Dokploy → Run workflow
```

---

## 🧪 Test locally (optional)

```bash
# Manual build with your credentials
docker build -t inventory-to-csv:local \
  --build-arg GOOGLE_GEMINI_API_KEY="your_key" \
  --build-arg SUPABASE_URL="your_url" \
  --build-arg SUPABASE_ANON_KEY="your_key" \
  .

# Run
docker run -p 8080:80 inventory-to-csv:local

# Access at: http://localhost:8080
```

---

## 📝 Where do the variables go?

| Variable                | GitHub Secrets | Usage                          |
|-------------------------|----------------|--------------------------------|
| `GOOGLE_GEMINI_API_KEY` | ✅              | Build time (compiled in image) |
| `SUPABASE_URL`          | ✅              | Build time (compiled in image) |
| `SUPABASE_ANON_KEY`     | ✅              | Build time (compiled in image) |
| `DOKPLOY_WEBHOOK_URL`   | ✅              | Deploy trigger                 |

**Simple rule:**

- **All variables in GitHub Secrets**
- Injected during Docker image build
- Dokploy only pulls and runs (no extra configuration)

---

## ✅ Checklist

Before pushing to `main`:

- [ ] GitHub Actions has write permissions
- [ ] Secrets configured in GitHub (API keys + webhook URL)
- [ ] Application created in Dokploy
- [ ] Registry configured in Dokploy (if repo is private)

---

## 🎯 Complete workflow

```
Push to main
    ↓
GitHub Actions generates environment.prod.ts
    ↓
Builds Docker image with compiled vars
    ↓
Pushes to GHCR (ghcr.io)
    ↓
Notifies Dokploy via webhook
    ↓
Dokploy pulls image and deploys
    ↓
🎉 App in production!
```

---

## 🐛 Common issues

**Error: Permission denied to push**
→ Check GitHub Actions permissions

**Error: Webhook failed**
→ Verify `DOKPLOY_WEBHOOK_URL` is correct

**"Empty variables in app"**
→ Check secrets in GitHub, not Dokploy

**Build takes too long**
→ Normal on first build (cache helps after)

---

## 📚 Complete documentation

- **[DEPLOYMENT.md](DEPLOYMENT.md)**: Full deployment guide
- **[DOKPLOY_CONFIG.md](DOKPLOY_CONFIG.md)**: Detailed Dokploy configuration
- **[README.md](../README.md)**: Project documentation

---

## 🆘 Need help?

1. Check logs in GitHub Actions
2. Check logs in Dokploy
3. Review the [Troubleshooting section in DEPLOYMENT.md](DEPLOYMENT.md#troubleshooting)

---

**Ready! Your app will be in production in minutes** 🚀
