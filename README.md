# Weather Explorer (InRisk Labs Case Study)

A full-stack climate data explorer application built to simulate data engineering pipelines. This project features a unified architecture deployed seamlessly on Vercel, integrating a Python backend directly into a React frontend.

## 🚀 Features

- **Interactive Map Selection**: Uses `react-leaflet` to drop pins on an interactive globe, instantly auto-filling Latitude and Longitude coordinates.
- **Data Ingestion**: A Python API fetches historical daily weather data from the Open-Meteo API.
- **Cloud Object Storage**: The backend strictly validates the payload (max 31 days) and stores the exact raw JSON directly into an **AWS S3 bucket**.
- **Data Visualization**: A responsive Next.js dashboard uses Recharts to plot temperature trends, paired with a paginated data table.
- **API Rate Limiting**: Protects against abuse and upstream quota exhaustion using a Fixed Window algorithm via `slowapi` (5 req/min for data ingestion, 15 req/min for S3 queries).
- **Unified Vercel Deployment**: The FastAPI backend is configured as Vercel Serverless Functions, allowing both the frontend and backend to live on the exact same domain with zero CORS issues!

## 🏗️ Architecture Stack

- **Frontend**: Next.js (React), Tailwind CSS, Recharts, Leaflet.
- **Backend**: Python, FastAPI, Pydantic, Boto3 (AWS SDK), slowapi (Rate Limiting).
- **Storage**: AWS S3.
- **Deployment**: Vercel (Next.js Edge + Python Serverless).

---

## 💻 Local Development

Because the backend is configured to run as Vercel Serverless Functions, local development uses a Next.js proxy to connect the two environments seamlessly.

### 1. Environment Setup
Create a `.env` file in the root directory with your AWS credentials:
```env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-bucket-name
```

### 2. Start the Backend
Open a terminal in the `frontend` directory, activate your Python virtual environment, and run:
```bash
pip install -r requirements.txt
python -m uvicorn api.index:app --reload --port 8000
```

### 3. Start the Frontend
Open a *second* terminal in the `frontend` directory and run:
```bash
npm install
npm run dev
```
The Next.js app will be running at `http://localhost:3000`. (The `next.config.ts` file is configured to automatically proxy all `/api` requests to your Python backend running on port 8000).

---

## 🌐 Deployment to Vercel

This repository is pre-configured to deploy as a unified full-stack application on Vercel.

### Step 1: Push to GitHub
Run the following commands in the root of your project:
```bash
git add .
git commit -m "Deploy Full Stack App"
git push
```

### Step 2: Configure Vercel
1. Log into Vercel and click **Add New -> Project**.
2. Import this repository from GitHub.
3. In the configuration screen, click Edit next to **Root Directory** and select `frontend`.
4. In the **Environment Variables** section, add your 4 AWS secrets from your `.env` file.
5. Click **Deploy**.

Vercel will automatically build the Next.js frontend and convert the Python FastAPI code inside `frontend/api/index.py` into Serverless Functions!
