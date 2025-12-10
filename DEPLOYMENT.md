# Deployment Guide

This guide covers deploying the custom Company Research Agent fork optimized for labor union construction company research.

## Prerequisites

1. **API Keys Required:**
   - Tavily API Key
   - Google Gemini API Key  
   - OpenAI API Key
   - Google Maps API Key (optional, for location autocomplete)

2. **Environment Setup:**
   - Python 3.9+
   - Node.js 18+
   - Docker & Docker Compose (for containerized deployment)

## Quick Start with Docker

### 1. Set Up Environment Variables

**Backend `.env` file (root directory):**
```env
TAVILY_API_KEY=your_tavily_key
GEMINI_API_KEY=your_gemini_key
OPENAI_API_KEY=your_openai_key
MONGODB_URI=your_mongodb_uri  # Optional
```

**Frontend `.env` file (`ui/.env`):**
```env
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key  # Optional
```

### 2. Build and Run with Docker Compose

```bash
docker compose up --build
```

This will:
- Build the frontend (React app)
- Build the backend (FastAPI)
- Start both services:
  - Backend: `http://localhost:8000`
  - Frontend: `http://localhost:5174`

### 3. Production Docker Build

For production deployment:

```bash
# Build production image
docker build -t company-research-agent:latest .

# Run production container
docker run -p 8000:8000 \
  --env-file .env \
  -v $(pwd)/reports:/app/reports \
  -v $(pwd)/pdfs:/app/pdfs \
  company-research-agent:latest
```

The production build includes:
- Built frontend (served from `/`)
- Backend API (served from `/research/*`)
- Static file serving for SPA routing

## GitHub Deployment

### Setting Up Your Own Repository

Since this is a fork/clone, you'll want to push to your own repository:

1. **Create a new repository on GitHub** (or use existing)

2. **Update the remote:**
```bash
# Remove old remote
git remote remove origin

# Add your repository as origin
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to your repository
git push -u origin main
```

3. **Or keep both remotes:**
```bash
# Add your repository as a new remote
git remote add deploy https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to your deployment remote
git push deploy main
```

## Platform-Specific Deployment

### AWS Elastic Beanstalk

1. Install EB CLI:
```bash
pip install awsebcli
```

2. Initialize:
```bash
eb init -p python-3.9 company-research
```

3. Create and deploy:
```bash
eb create company-research-prod
eb deploy
```

### Google Cloud Run

1. Build and push container:
```bash
gcloud builds submit --tag gcr.io/PROJECT_ID/company-research
```

2. Deploy:
```bash
gcloud run deploy company-research \
  --image gcr.io/PROJECT_ID/company-research \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Heroku

1. Create `Procfile`:
```
web: uvicorn application:app --host 0.0.0.0 --port $PORT
```

2. Deploy:
```bash
heroku create your-app-name
git push heroku main
```

### Vercel (Frontend Only)

The frontend can be deployed separately to Vercel:

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
cd ui
vercel
```

Note: You'll need to configure `VITE_API_URL` to point to your backend API.

## Features

### Company Management
- **44 Pre-loaded Construction Companies**: Click "Load Construction Companies" to populate
- **Search**: Filter companies by name, location, or industry
- **Add Companies**: Add new companies with full details
- **Remove Companies**: Delete companies from your list
- **Auto-fill Form**: Click a company to auto-populate the research form
- **LocalStorage Persistence**: Your company list is saved locally

### Research Pipeline
- Multi-agent research system
- Real-time progress tracking
- PDF report generation
- Copy to clipboard functionality

## Troubleshooting

### Docker Issues

**Port already in use:**
```bash
# Change ports in docker-compose.yml
ports:
  - "8001:8000"  # Backend
  - "5175:5174"  # Frontend
```

**Build fails:**
- Ensure all environment variables are set
- Check Python/Node versions match Dockerfile requirements
- Clear Docker cache: `docker system prune -a`

### Frontend Not Loading

- Check `VITE_API_URL` points to correct backend
- Verify backend is running and accessible
- Check browser console for CORS errors

### Backend Errors

- Verify all API keys are set correctly
- Check logs: `docker compose logs backend`
- Ensure MongoDB URI is correct (if using persistence)

## Environment Variables Reference

### Backend (.env)
- `TAVILY_API_KEY` - Required: Tavily research API key
- `GEMINI_API_KEY` - Required: Google Gemini API key
- `OPENAI_API_KEY` - Required: OpenAI API key
- `MONGODB_URI` - Optional: MongoDB connection string

### Frontend (ui/.env)
- `VITE_API_URL` - Required: Backend API URL (e.g., `http://localhost:8000`)
- `VITE_GOOGLE_MAPS_API_KEY` - Optional: Google Maps API key for location autocomplete

## Support

For issues or questions:
1. Check the main README.md
2. Review Docker logs: `docker compose logs`
3. Verify environment variables are set correctly

