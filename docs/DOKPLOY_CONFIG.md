# Dokploy Configuration - Inventory To CSV

## Dokploy setup steps

### 1. Create new application

```
Type: Docker
Name: inventory-to-csv
Mode: Pull Image
```

### 2. Configure image

```
Registry: ghcr.io
Image: ghcr.io/YOURUSERNAME/inventory-to-csv:main-abc1234
Pull Policy: Always
```

### 3. Configure port

```
Container port: 80
Public port: (your choice or automatic)
```

### 4. Environment variables

**NO need to configure environment variables in Dokploy.**

Variables are already compiled in the Docker image during the build in GitHub Actions.

If you need to change a variable:

1. Update the corresponding secret in GitHub
2. Make a new push to `main` to rebuild
3. The new image will deploy automatically

### 5. Configure Registry Authentication (if private)

If your GHCR repository is private:

```
Registry URL: ghcr.io
Username: your-github-username
Password: [GitHub Personal Access Token]
```

**Create GitHub token:**

1. GitHub → Settings → Developer settings
2. Personal access tokens → Tokens (classic)
3. Generate new token
4. Select scope: `read:packages`
5. Copy the token and use as password

### 6. Get Webhook URL

1. In your Dokploy application, find the **Webhooks** or **Deploy** section
2. Copy the webhook URL (something like: `https://your-dokploy.com/api/webhook/deploy/abc123`)
3. Save it to configure in GitHub

### 7. Health Check (optional)

If Dokploy supports it:

```
Path: /
Interval: 30s
Timeout: 10s
Retries: 3
```

### 8. Deployment

- **Strategy**: Rolling update
- **Restart Policy**: Unless stopped

### 9. Custom domain (optional)

If you want a custom domain:

1. Configure your DNS pointing to your Dokploy server
2. In Dokploy, add the domain to your application
3. Dokploy will handle the SSL certificate automatically

## Useful commands

### View logs in real-time

If you have SSH access to the server:

```bash
# View container logs
docker logs -f inventory-to-csv

# View last 100 lines
docker logs --tail 100 inventory-to-csv
```

### Manual deploy

If the webhook fails, you can deploy manually:

```bash
# On the server with Dokploy
docker pull ghcr.io/yourusername/inventory-to-csv:latest
docker stop inventory-to-csv
docker rm inventory-to-csv
docker run -d \
  --name inventory-to-csv \
  -p 80:80 \
  --restart unless-stopped \
  ghcr.io/yourusername/inventory-to-csv:latest
```

**Note:** No need to pass environment variables, they are already in the image.

## Troubleshooting

### Error: "Cannot pull image"

**Solution:**

- Verify the registry credentials in Dokploy
- Make sure the GitHub token has `read:packages` permissions
- Verify the image exists: `docker pull ghcr.io/yourusername/inventory-to-csv:latest`

### Error: "Application not starting"

**Solution:**

1. Check the logs in Dokploy
2. Verify that port 80 is exposed correctly
3. Verify that the environment variables are configured

### Error: "Environment variables not applying"

**Solution:**

- Variables must be configured as **Secrets in GitHub**, not in Dokploy
- Verify that the secrets are spelled correctly (no typos)
- Make a new build (push to main) after changing secrets
- Check the build logs in GitHub Actions

### Application shows blank screen

**Solution:**

- Verify that nginx is serving correctly: `curl http://localhost`
- Check the browser console for JavaScript errors
- Verify that the Angular build completed correctly

## Monitoring

### Recommended metrics

- CPU usage
- Memory usage
- Request count
- Response time
- Error rate

### Recommended alerts

- Container down
- CPU > 80%
- Memory > 80%
- Error rate > 5%

## Backup

### Backup image

```bash
# Export image
docker save ghcr.io/yourusername/inventory-to-csv:latest > inventory-backup.tar

# Import image
docker load < inventory-backup.tar
```

### Rollback

If you need to go back to a previous version:

1. In Dokploy, go to deployment history
2. Select the previous version
3. Click "Rollback"

Or manually:

```bash
# Pull a specific version
docker pull ghcr.io/yourusername/inventory-to-csv:main-abc1234

# Update the configuration in Dokploy to use that tag
```

## Post-deploy verification checklist

- [ ] Application loads correctly
- [ ] Login works
- [ ] Images upload to Supabase
- [ ] AI processes images
- [ ] Products save to database
- [ ] Dark/light theme works
- [ ] Excel export works
- [ ] Barcodes download
- [ ] No errors in browser console
- [ ] Container logs show no errors

## Additional resources

- [Dokploy Documentation](https://dokploy.com/docs)
- [GitHub Container Registry Docs](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [Supabase Documentation](https://supabase.com/docs)

---

**Last updated:** 2025-01-20
