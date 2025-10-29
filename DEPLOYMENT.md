# Deployment Guide - speedtst.online

## Prerequisites

1. **Vercel Account**: Sign up at https://vercel.com
2. **Domain Ready**: Have speedtst.online domain configured
3. **Git Repository**: Code should be in a Git repository (GitHub recommended)

## Step 1: Prepare Repository

1. Initialize Git (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Speedtest app ready for deployment"
   ```

2. Create GitHub repository and push:
   ```bash
   git remote add origin <your-github-repo-url>
   git branch -M main
   git push -u origin main
   ```

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Other
   - **Root Directory**: `./`
   - **Build Command**: Leave empty (static site)
   - **Output Directory**: `public`
5. Click "Deploy"
6. Wait for deployment to complete

### Option B: Deploy via CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel --prod
   ```

4. Follow prompts:
   - Link to existing project? No
   - Project name: speedtst-online
   - Directory: `./`
   - Override settings? No

## Step 3: Configure Custom Domain

1. In Vercel Dashboard, go to your project
2. Navigate to "Settings" → "Domains"
3. Click "Add Domain"
4. Enter: `speedtst.online`
5. Vercel will provide DNS records:
   - **Type A**: Point to Vercel IP
   - **Type CNAME**: Point www subdomain to cname.vercel-dns.com

6. Update DNS at your domain registrar:
   - Add the A record for root domain
   - Add CNAME for www subdomain

7. Wait for DNS propagation (up to 48 hours, usually ~1 hour)
8. Vercel will automatically provision SSL certificate

## Step 4: Verify Deployment

1. Visit your deployed URL (provided by Vercel)
2. Test all functionality:
   - [ ] Click GO button
   - [ ] Watch ping test complete
   - [ ] Watch download test (5 seconds)
   - [ ] Watch upload test (5 seconds)
   - [ ] Verify results display
   - [ ] Check history modal works
   - [ ] Verify IP detection shows your info
   - [ ] Test on mobile device

## Step 5: Post-Deployment

### Monitor Performance

1. Check Vercel Analytics (if enabled)
2. Monitor serverless function usage
3. Check API quota for ipapi.co (30k/month free)

### SSL Certificate

- Vercel automatically provisions SSL via Let's Encrypt
- Certificate auto-renews
- HTTPS redirect is automatic

### Environment Variables (if needed)

If you need to add API keys later:
1. Go to Project Settings → Environment Variables
2. Add variables (e.g., API keys)
3. Redeploy to apply changes

## Troubleshooting

### Issue: Domain not connecting

**Solution**:
- Verify DNS records are correct
- Wait for DNS propagation (use https://dnschecker.org)
- Ensure domain is unlocked at registrar

### Issue: 404 errors on refresh

**Solution**:
- This shouldn't happen with static site
- Verify `vercel.json` routes are correct

### Issue: Serverless function errors

**Solution**:
- Check function logs in Vercel dashboard
- Verify `/api/upload.js` is deployed
- Test endpoint directly: `https://speedtst.online/api/upload`

### Issue: Slow API responses

**Solution**:
- ipapi.co free tier may be rate-limited
- Consider upgrading or switching to ipify.org for IP only
- Add error handling and fallbacks

### Issue: ads.txt or robots.txt not deploying (404 error)

**Symptoms**:
- File exists in Git repository
- GitHub shows the file is committed
- Other files (like sitemap.xml, robots.txt) work fine
- Vercel returns 404 for ads.txt even after multiple deployments
- Long wait times (10+ minutes) don't resolve the issue

**Root Cause**:
GitHub → Vercel automatic deployment may not always immediately recognize new text files in the `/public` directory, especially for critical files like ads.txt.

**Solution - Use Vercel CLI Direct Deployment**:

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```
   Follow the browser authentication flow.

3. **Deploy directly from local directory**:
   ```bash
   cd "C:\Users\User\Dropbox\Yaniv - Personal\cursor projects\speedtest"
   vercel --prod
   ```

4. **Verify deployment**:
   ```bash
   curl https://speedtst.online/ads.txt
   ```

**Why this works**:
- `vercel --prod` deploys directly from your local filesystem to Vercel production
- Bypasses the GitHub integration entirely
- Deployment completes in ~10-30 seconds instead of waiting for GitHub webhook
- Immediately pushes all files including newly added text files

**Prevention for future deployments**:
- For critical files (ads.txt, robots.txt, etc.), use `vercel --prod` CLI deployment
- Alternatively, create these files BEFORE initial deployment
- GitHub auto-deployment works well for code changes, but CLI is more reliable for infrastructure files

**Verification checklist**:
```bash
# Check ads.txt is accessible
curl https://speedtst.online/ads.txt

# Check with headers
curl -I https://speedtst.online/ads.txt

# Expected response:
# HTTP/1.1 200 OK
# Content-Type: text/plain; charset=utf-8
# Content-Length: 59
```

## Continuous Deployment

Once connected to GitHub, Vercel will automatically:
- Deploy on every push to `main` branch
- Create preview deployments for PRs
- Run deployment checks

To deploy updates:
```bash
git add .
git commit -m "Your update message"
git push
```

Vercel will automatically deploy the changes.

## Performance Tips

1. **Enable Vercel Analytics**: Free tier available
2. **Monitor Core Web Vitals**: Check performance scores
3. **Optimize images**: Compress all images before deployment
4. **CDN caching**: Vercel automatically caches static assets

## Cost Monitoring

Current free tier limits:
- **Bandwidth**: 100 GB/month
- **Serverless Function Executions**: 100k/month
- **Build time**: 100 hours/month
- **Team members**: 1

Monitor usage in Vercel dashboard under "Usage"

## Backup & Recovery

1. **Code**: Always in Git repository
2. **Test History**: Stored in localStorage (client-side only)
3. **Configuration**: In `vercel.json` (version controlled)

## Quick Reference: Vercel CLI Commands

### Essential Commands

```bash
# Login to Vercel
vercel login

# Deploy to production (bypasses GitHub)
vercel --prod

# Deploy to preview/staging
vercel

# Check deployment logs
vercel logs <deployment-url>

# List all deployments
vercel ls

# Redeploy a specific deployment
vercel redeploy <deployment-url>

# Remove a deployment
vercel rm <deployment-url>

# Link local project to Vercel project
vercel link

# Check current Vercel user
vercel whoami

# Logout
vercel logout
```

### When to use Vercel CLI vs GitHub Auto-Deploy

**Use Vercel CLI (`vercel --prod`)** when:
- Adding critical infrastructure files (ads.txt, robots.txt, security.txt)
- Need immediate deployment (< 30 seconds)
- Troubleshooting GitHub webhook issues
- Testing configuration changes quickly
- Deploying hotfixes

**Use GitHub Auto-Deploy** when:
- Making regular code changes
- Want deployment history tracked in GitHub
- Need preview deployments for PRs
- Working in a team with code review process
- Want CI/CD integration

### Deployment Workflow Best Practice

For regular updates:
```bash
# 1. Make changes locally
git add .
git commit -m "Update content"
git push

# 2. Wait for GitHub auto-deploy (usually 1-2 minutes)
# Check status at: https://vercel.com/dashboard
```

For urgent infrastructure files:
```bash
# 1. Create/update the file
# 2. Commit to Git (for version control)
git add public/ads.txt
git commit -m "Add ads.txt for AdSense"
git push

# 3. Deploy immediately via CLI
vercel --prod

# 4. Verify
curl https://speedtst.online/ads.txt
```

## Next Steps After Deployment

1. [ ] Test from multiple locations
2. [ ] Verify mobile responsiveness
3. [ ] Submit to search engines (Google Search Console)
4. [ ] Create sitemap.xml
5. [ ] Add Google Analytics (optional)
6. [ ] Start creating blog content for AdSense
7. [ ] Apply for Google AdSense (after content is ready)

---

**Deployment Checklist**:
- [ ] Code committed to Git
- [ ] Pushed to GitHub
- [ ] Deployed to Vercel
- [ ] Custom domain configured
- [ ] DNS records updated
- [ ] SSL certificate active
- [ ] All tests working on production
- [ ] Mobile tested
- [ ] Performance verified
- [ ] ads.txt accessible (if using AdSense)
