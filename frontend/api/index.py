import os
import json
import httpx
import boto3
from datetime import datetime
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field, field_validator
from botocore.exceptions import ClientError
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Weather Explorer API")

# Configuration for AWS S3
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME")

# Initialize S3 client (if credentials aren't provided, it might fail on usage)
s3_client = boto3.client(
    's3',
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    region_name=AWS_REGION
) if AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY else boto3.client('s3')


class WeatherRequest(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    start_date: str
    end_date: str

    @field_validator('end_date')
    def check_dates(cls, end_date, info):
        start_date = info.data.get('start_date')
        if not start_date:
            raise ValueError("start_date is required")
        
        try:
            start_dt = datetime.strptime(start_date, "%Y-%m-%d")
            end_dt = datetime.strptime(end_date, "%Y-%m-%d")
        except ValueError:
            raise ValueError("Dates must be in YYYY-MM-DD format")

        if start_dt > end_dt:
            raise ValueError("start_date cannot be after end_date")
        
        delta = (end_dt - start_dt).days
        if delta > 31:
            raise ValueError("Date range cannot exceed 31 days")
        
        return end_date

@app.post("/api/store-weather-data")
async def store_weather_data(req: WeatherRequest):
    if not S3_BUCKET_NAME:
        raise HTTPException(status_code=500, detail="S3_BUCKET_NAME is not configured")

    # Fetch from Open-Meteo
    url = "https://archive-api.open-meteo.com/v1/archive"
    params = {
        "latitude": req.latitude,
        "longitude": req.longitude,
        "start_date": req.start_date,
        "end_date": req.end_date,
        "daily": "temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min",
        "timezone": "auto"
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)
        
    if response.status_code != 200:
        raise HTTPException(status_code=502, detail="Failed to fetch data from Open-Meteo API")
        
    weather_data = response.json()
    
    # Store to S3
    timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    file_name = f"weather_{req.latitude}_{req.longitude}_{req.start_date}_{req.end_date}_{timestamp}.json"
    
    try:
        s3_client.put_object(
            Bucket=S3_BUCKET_NAME,
            Key=file_name,
            Body=json.dumps(weather_data),
            ContentType="application/json"
        )
    except ClientError as e:
        raise HTTPException(status_code=500, detail=f"S3 upload failed: {str(e)}")

    return {"status": "ok", "file": file_name}

@app.get("/api/list-weather-files")
def list_weather_files():
    if not S3_BUCKET_NAME:
        raise HTTPException(status_code=500, detail="S3_BUCKET_NAME is not configured")

    try:
        response = s3_client.list_objects_v2(Bucket=S3_BUCKET_NAME)
        files = []
        if 'Contents' in response:
            for obj in response['Contents']:
                files.append({
                    "name": obj['Key'],
                    "size": obj['Size'],
                    "created_at": obj['LastModified'].isoformat()
                })
        
        # Sort by most recent first
        files.sort(key=lambda x: x['created_at'], reverse=True)
        return {"files": files}
    except ClientError as e:
        raise HTTPException(status_code=500, detail=f"Failed to list S3 objects: {str(e)}")

@app.get("/api/weather-file-content/{file}")
def get_weather_file_content(file: str):
    if not S3_BUCKET_NAME:
        raise HTTPException(status_code=500, detail="S3_BUCKET_NAME is not configured")

    try:
        response = s3_client.get_object(Bucket=S3_BUCKET_NAME, Key=file)
        content = json.loads(response['Body'].read().decode('utf-8'))
        return content
    except ClientError as e:
        error_code = e.response['Error']['Code']
        if error_code == 'NoSuchKey':
            raise HTTPException(status_code=404, detail={"status": "error", "message": "not found"})
        raise HTTPException(status_code=500, detail=f"Failed to fetch S3 object: {str(e)}")
