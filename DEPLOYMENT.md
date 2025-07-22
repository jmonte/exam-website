# 🚀 GitHub Pages Deployment Guide

## Step 1: Push to GitHub Repository

### Option A: Create New Repository
```bash
# 1. Create repository on GitHub.com
# 2. Clone this code to the new repository
git remote add origin https://github.com/YOUR_USERNAME/exam-website.git
git push -u origin main
```

### Option B: Fork This Repository  
1. Fork this repository on GitHub
2. Clone your fork locally
3. Make any customizations
4. Push changes to your fork

## Step 2: Enable GitHub Pages

1. **Go to Repository Settings**
   - Navigate to your repository on GitHub
   - Click on the "Settings" tab

2. **Configure Pages Settings**
   - Scroll down to "Pages" section
   - Under "Source", select "GitHub Actions"
   - This will use the automated workflow

3. **Verify Deployment**
   - Go to "Actions" tab to see the deployment progress
   - Once complete, your site will be live at:
   - `https://YOUR_USERNAME.github.io/exam-website`

## Step 3: Automatic Deployment

The GitHub Actions workflow (`.github/workflows/deploy.yml`) will automatically:
- ✅ Deploy on every push to `main` branch
- ✅ Build and upload the site files
- ✅ Update the live site within minutes
- ✅ Show deployment status in the Actions tab

## Step 4: Custom Domain (Optional)

To use a custom domain like `exam.yourdomain.com`:

1. **Add CNAME file:**
```bash
echo "exam.yourdomain.com" > CNAME
git add CNAME && git commit -m "Add custom domain"
git push
```

2. **Configure DNS:**
   - Add CNAME record: `exam` → `YOUR_USERNAME.github.io`
   - Or A records pointing to GitHub's IPs

3. **Enable HTTPS:**
   - GitHub Pages automatically provides SSL certificates
   - Check "Enforce HTTPS" in repository settings

## 🛠️ Local Development

Test locally before pushing:

```bash
# Simple local server
python3 -m http.server 8000
# OR
npx serve .
# OR
php -S localhost:8000

# Then open: http://localhost:8000
```

## 📱 Fullscreen Features

The app now includes:
- **Fullscreen Button**: Toggle fullscreen mode
- **Immersive Experience**: Hidden browser UI for distraction-free exams
- **Touch-Optimized**: Perfect for tablets in fullscreen
- **Responsive Layout**: Adapts to any screen size

## 🔧 Troubleshooting Deployment

### Common Issues:

1. **Pages not updating:**
   - Check Actions tab for failed builds
   - Ensure repository is public (or you have GitHub Pro)
   - Verify Pages is enabled in Settings

2. **404 Error:**
   - Confirm the repository name matches the URL
   - Check if index.html exists in root directory
   - Verify GitHub Actions completed successfully

3. **JavaScript errors:**
   - Open browser console to see errors
   - Check if all files are uploaded correctly
   - Verify relative paths in the code

### Force Redeploy:
```bash
# Make empty commit to trigger redeploy
git commit --allow-empty -m "Trigger redeploy"
git push
```

## 📊 Repository Structure for Pages

```
exam-website/
├── .github/workflows/deploy.yml  # Auto-deployment
├── index.html                    # Entry point
├── css/styles.css               # Styling
├── js/                          # JavaScript files
├── README.md                    # Documentation
└── CNAME                        # Custom domain (optional)
```

## 🌐 Access Your Deployed Site

After successful deployment:
- **GitHub Pages URL**: `https://YOUR_USERNAME.github.io/exam-website`
- **Custom Domain**: `https://your-custom-domain.com` (if configured)
- **Status**: Check in repository "Environments" section

## 🔄 Updating Your Site

To update the live site:
1. Make changes locally
2. Commit and push to main branch
3. GitHub Actions automatically redeploys
4. Changes live within 2-5 minutes

---

**Your exam website will be live and ready for students to use! 📚✨**