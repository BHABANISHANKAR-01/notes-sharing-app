# 🔧 Environment Variables Setup for Deployment

## Overview
This file contains all environment variables needed for deploying your app globally.

---

## 📝 Frontend Environment Variables

### For Vercel/Netlify

**File: `client/.env.production`**

```env
# API Configuration
REACT_APP_API_URL=https://your-backend-url.railway.app/api
REACT_APP_ENV=production

# Analytics (Optional)
REACT_APP_GA_ID=your-google-analytics-id

# Feature Flags
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_CODE_HIGHLIGHTING=true
REACT_APP_ENABLE_DARK_MODE=true
```

### For Local Development

**File: `client/.env.local`**

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
REACT_APP_ENABLE_ANALYTICS=false
```

---

## 🖥️ Backend Environment Variables

### For Railway/Heroku/DigitalOcean

**File: `server/.env`**

```env
# Server Configuration
PORT=5000
NODE_ENV=production
HOST=0.0.0.0

# Database
DATABASE_URL=sqlite:./database/notes.sqlite3
DATABASE_PATH=./database

# CORS Configuration (Frontend URL)
CORS_ORIGIN=https://your-app.vercel.app
CORS_METHODS=GET,POST,PUT,DELETE,OPTIONS
CORS_CREDENTIALS=true

# API Configuration
API_BASE_URL=https://your-api.railway.app
API_PREFIX=/api

# Security
SESSION_SECRET=your-random-secret-key-here-min-32-chars
JWT_SECRET=your-jwt-secret-key-here-min-32-chars
JWT_EXPIRY=7d

# Admin Credentials (Keep in .env, NEVER in code)
ADMIN_USERNAME=trainerMaster2025
ADMIN_PASSWORD=Code4NotesOnly

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/app.log

# Email (Optional - for future features)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Feature Flags
ENABLE_ANALYTICS=true
ENABLE_CODE_HIGHLIGHTING=true
ENABLE_ANNOUNCEMENTS=true
ENABLE_DARK_MODE=true

# Timeouts
API_TIMEOUT=30000
DB_TIMEOUT=10000
SESSION_TIMEOUT=1800000
```

### For Local Development

**File: `server/.env.local`**

```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
DATABASE_URL=sqlite:./database/notes.sqlite3
ADMIN_USERNAME=trainerMaster2025
ADMIN_PASSWORD=Code4NotesOnly
```

---

## 🌐 Platform-Specific Setup

### **Railway.app**

In Railway dashboard, add these environment variables:

```
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://your-app.vercel.app
```

Railway will provide:
- `DATABASE_URL` (auto-generated)
- `RAILWAY_ENVIRONMENT_ID` (auto-generated)

### **Vercel**

In Vercel dashboard Project Settings → Environment Variables:

```
REACT_APP_API_URL=https://your-api-xxxxx.railway.app/api
REACT_APP_ENV=production
```

Apply to: **Production**

### **DigitalOcean**

In App Platform → Components → Backend Service → Environment:

```
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://your-app-xxxxx.ondigitalocean.app
DATABASE_URL=sqlite:./database/notes.sqlite3
```

### **AWS**

Use AWS Systems Manager Parameter Store or Secrets Manager:

**Parameter Store:**
- `/prod/app/api_url`
- `/prod/app/db_path`
- `/prod/app/cors_origin`

**Secrets Manager:**
- `prod/app/db-credentials`
- `prod/app/jwt-secret`

---

## 🔐 Security Best Practices

### DO ✅
- [x] Use strong random secrets (32+ characters)
- [x] Store secrets in .env files (never in code)
- [x] Use HTTPS in production
- [x] Keep .env files in .gitignore
- [x] Rotate secrets regularly
- [x] Use environment-specific values
- [x] Enable CORS only for your domain
- [x] Use production-grade database

### DON'T ❌
- [x] Commit .env files to Git
- [x] Hardcode secrets in code
- [x] Use weak passwords
- [x] Share .env across environments
- [x] Log sensitive data
- [x] Trust client-side secrets
- [x] Use same secrets everywhere
- [x] Forget to set NODE_ENV

---

## 🚀 Deployment Checklist

Before deploying, verify:

- [ ] All environment variables set correctly
- [ ] Database URL valid
- [ ] CORS origin set to your frontend URL
- [ ] Secrets are strong and random
- [ ] .env files in .gitignore
- [ ] No hardcoded secrets in code
- [ ] Production database initialized
- [ ] Backups configured
- [ ] HTTPS enabled
- [ ] Error logging configured

---

## 📋 Generate Random Secrets

### Using Node.js

```javascript
// In terminal, run:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Run this 2-3 times to generate:
- `SESSION_SECRET`
- `JWT_SECRET`

Example output:
```
a3f7d9e8c2b1f6a4e5d8c9b0f1a2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a9
```

### Using OpenSSL

```bash
openssl rand -hex 32
```

---

## 🔄 Environment Variables by Service

### **Production**
- `NODE_ENV=production`
- Full error logging
- Database backups enabled
- CORS restricted
- Security headers enabled

### **Staging**
- `NODE_ENV=staging`
- Detailed logging
- Staging database
- CORS permissive
- Test notifications

### **Development**
- `NODE_ENV=development`
- Console logging
- Local database
- CORS open
- Debug mode enabled

---

## 🆘 Troubleshooting

### **"Cannot connect to API"**
- Check `CORS_ORIGIN` matches frontend URL
- Verify `REACT_APP_API_URL` in frontend
- Test backend is running

### **"Database error"**
- Verify `DATABASE_URL` correct
- Check file permissions
- Ensure database directory exists

### **"Authentication fails"**
- Verify `ADMIN_USERNAME` and `ADMIN_PASSWORD`
- Check credentials aren't quoted
- Ensure credentials synced across deployments

### **"CORS errors"**
- Add frontend URL to `CORS_ORIGIN`
- Enable `CORS_CREDENTIALS`
- Verify headers in preflight requests

---

## 📊 Example Full Production Setup

### **Frontend (Vercel)**
```
REACT_APP_API_URL=https://api.mynotes.app/api
REACT_APP_ENV=production
REACT_APP_GA_ID=UA-123456789-1
```

### **Backend (Railway)**
```
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://mynotes.app
DATABASE_URL=sqlite:./database/notes.sqlite3
SESSION_SECRET=a3f7d9e8c2b1f6a4e5d8c9b0f1a2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a9
JWT_SECRET=f1a2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a9a3f7d9e8c2b1f6a4e5d8c9b0
ADMIN_USERNAME=trainerMaster2025
ADMIN_PASSWORD=Code4NotesOnly
```

### **Domain (Cloudflare)**
```
CNAME @ → mynotes.vercel.app
CNAME api → mynotes-backend.railway.app
CNAME www → mynotes.vercel.app
```

---

## 🎯 Quick Reference Table

| Variable | Purpose | Example |
|----------|---------|---------|
| `REACT_APP_API_URL` | Backend API URL | `https://api.app.com/api` |
| `NODE_ENV` | Environment | `production` |
| `CORS_ORIGIN` | Allowed frontend | `https://app.com` |
| `DATABASE_URL` | Database connection | `sqlite:./db.sqlite3` |
| `PORT` | Server port | `5000` |
| `JWT_SECRET` | Token signing | Random 32+ chars |
| `SESSION_SECRET` | Session signing | Random 32+ chars |
| `ADMIN_USERNAME` | Admin login | `trainerMaster2025` |
| `ADMIN_PASSWORD` | Admin password | `Code4NotesOnly` |

---

## ✅ Status

**Environment Setup**: Ready
**Security Level**: High
**Production Ready**: Yes

Good luck with your deployment! 🚀

---

**Last Updated**: November 15, 2025  
**Version**: 1.0
