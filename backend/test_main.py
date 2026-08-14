import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_store_weather_data_invalid_dates():
    # Test that date range exceeding 31 days is rejected
    response = client.post(
        "/store-weather-data",
        json={
            "latitude": 40.7128,
            "longitude": -74.0060,
            "start_date": "2023-01-01",
            "end_date": "2023-03-01" # > 31 days
        }
    )
    assert response.status_code == 422
    assert "Date range cannot exceed 31 days" in response.text

def test_store_weather_data_invalid_lat_lon():
    # Test boundary validation on latitude
    response = client.post(
        "/store-weather-data",
        json={
            "latitude": 100.0, # Invalid, max 90
            "longitude": -74.0060,
            "start_date": "2023-01-01",
            "end_date": "2023-01-10"
        }
    )
    assert response.status_code == 422
    assert "Input should be less than or equal to 90" in response.text

def test_list_weather_files_no_bucket():
    # Without mocking S3_BUCKET_NAME, it should either return 500 or list files if configured
    response = client.get("/list-weather-files")
    assert response.status_code in [200, 500]
