# 📌 API Endpoints

## ➕ Add School
**POST** `/addschool`  
Add a new school to the database.

**Request Body (JSON):**
```json
{
  "name": "ABC Public School",
  "address": "123 Main St, Delhi",
  "latitude": 28.6139,
  "longitude": 77.2090
}
```

## 📍 List Schools  
**GET** `/listSchools`  
Fetches all schools from the database, sorted by proximity to the user’s location.  

**Query Parameters:**  
- `latitude` (number) – User’s current latitude  
- `longitude` (number) – User’s current longitude  

**Example Request:**  
/listSchools?latitude=22.7041&longitude=72.1025


**Example Response:**  
```json
{
    "success": true,
    "count": 4,
    "schools": [
        {
            "id": 3,
            "name": "St. Peter's Convent",
            "address": "89 Baker Street, London W1U 6RQ, UK",
            "latitude": 51.5205,
            "longitude": -0.1559,
            "distance_km": 6839.144135910857
        },
        {
            "id": 4,
            "name": "St. Peter's Convent,jdcbjd",
            "address": "89 Baker Street, London W1U 6RQ, UK",
            "latitude": 51.5205,
            "longitude": -0.1559,
            "distance_km": 6839.144135910857
        },
        {
            "id": 2,
            "name": "Green Valley High School",
            "address": "123 Maple Street, Springfield, IL 62704, USA",
            "latitude": 39.7817,
            "longitude": -89.6501,
            "distance_km": 12813.451291238776
        },
        {
            "id": 1,
            "name": "Bright Future Elementary",
            "address": "221 Pine Street, San Francisco, CA 94111, USA",
            "latitude": 37.7955,
            "longitude": -122.3992,
            "distance_km": 13119.076530968441
        }
    ]
}
```