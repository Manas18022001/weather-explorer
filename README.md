# Full Stack Weather Explorer

A minimal full-stack weather explorer application built for the InRisk Labs Full-Stack Engineer Case Study.

## Architecture

*   **Frontend**: Next.js (App Router), React, Tailwind CSS, Recharts.
*   **Backend**: Python, FastAPI, Pydantic, Boto3, httpx.
*   **Storage**: AWS S3 (Standard Tier)

## Setup & Local Development

### 1. AWS Credentials
To run this project, you need an AWS S3 bucket and credentials with permissions to `s3:PutObject`, `s3:ListBucket`, and `s3:GetObject`.

Create a `.env` file in the `backend` directory (copy from `.env.example`):
```env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-bucket-name
```

### 2. Backend (FastAPI)
1. Navigate to the backend directory: `cd backend`
2. Create and activate a virtual environment:
   - Windows: `python -m venv venv` and `.\venv\Scripts\activate`
   - Mac/Linux: `python3 -m venv venv` and `source venv/bin/activate`
3. Install dependencies: `pip install -r requirements.txt`
4. Run the server: `uvicorn main:app --reload --port 8000`
   The backend API will be running at `http://localhost:8000`.

### 3. Frontend (Next.js)
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
   The frontend will be running at `http://localhost:3000`.

## Features
- **Data Ingestion**: Submits a latitude, longitude, and date range to the backend, which pulls daily historical weather data from the Open-Meteo API.
- **Object Storage**: The backend strictly validates the payload and stores the exact raw JSON from Open-Meteo into an AWS S3 bucket.
- **File Explorer**: A sidebar efficiently lists all JSON objects stored in the bucket (without downloading their contents upfront).
- **Data Visualization**: Selecting a file retrieves the JSON object and visualizes the daily `temperature_2m_max` and `temperature_2m_min` using a Recharts line chart, alongside a paginated data table for precise reading.

## Design Decisions
- **FastAPI**: Chosen for its robust async performance, auto-generated Swagger documentation (available at `/docs`), and out-of-the-box payload validation via Pydantic.
- **Next.js & Tailwind**: Next.js provides simple routing and a great developer experience. Tailwind allows for rapid, consistent UI prototyping.
- **AWS S3 over GCS**: AWS S3 has a generous free tier (5GB) and the `boto3` SDK is standard in the Python ecosystem.
- **Pagination**: The frontend handles pagination of the table component-side (client-side) to ensure snappiness and avoid repeatedly hitting the S3 bucket to grab chunks of the identical JSON file.

## Deployment Strategy
- **Frontend**: Deployable seamlessly on **Vercel** with zero-configuration needed for Next.js apps.
- **Backend**: Deployable on **Render Web Services** or **Railway**. Requires setting the Environment Variables (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, etc.) in the deployment dashboard.
