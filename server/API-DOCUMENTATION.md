# Certificate Verification API Documentation

## Overview

The Certificate Verification API provides AI-powered analysis of disability certificates for students. The system can:

1. Analyze medical certificates to identify disability types
2. Recommend appropriate accessibility features 
3. Provide confidence scores for verification
4. Toggle and manage accessibility features

## Tech Stack

- **AI Processing**: OpenAI API (gpt-4o model)
- **Backend**: Node.js with Express
- **Authentication**: JWT-based authentication
- **File Handling**: Multer middleware for certificate uploads

## API Endpoints

### Certificate Upload

**Endpoint**: `POST /api/certificate/upload`  
**Authentication**: Required (JWT token)  
**Content-Type**: `multipart/form-data`  

**Request Body**:
```
{
  "certificate": [File Upload],
  "userId": "user123"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Certificate uploaded successfully",
  "certificateId": "cert_123456",
  "status": "pending"
}
```

### Certificate Verification Status

**Endpoint**: `GET /api/certificate/status`  
**Authentication**: Required (JWT token)  

**Response**:
```json
{
  "status": "verified", // or "pending", "rejected"
  "certificateId": "cert_123456",
  "verifiedAt": "2023-08-15T10:30:45Z",
  "disability": {
    "type": "Dyslexia",
    "confidenceScore": 0.95
  },
  "recommendedFeatures": [
    {
      "id": "tts",
      "name": "Text to Speech",
      "description": "Reads text aloud to assist with reading",
      "enabled": true
    },
    {
      "id": "dyslexicFont",
      "name": "Dyslexic Font",
      "description": "Special font that makes text easier to read for people with dyslexia",
      "enabled": true
    }
  ]
}
```

### Get User Features

**Endpoint**: `GET /api/features/:userId`  
**Authentication**: Required (JWT token)  

**Response**:
```json
{
  "userId": "user123",
  "features": [
    {
      "id": "tts",
      "name": "Text to Speech",
      "description": "Reads text aloud to assist with reading",
      "enabled": true
    },
    {
      "id": "dyslexicFont",
      "name": "Dyslexic Font",
      "description": "Special font that makes text easier to read for people with dyslexia",
      "enabled": true
    }
  ]
}
```

### Update User Features

**Endpoint**: `PUT /api/features/:userId`  
**Authentication**: Required (JWT token)  
**Content-Type**: `application/json`

**Request Body**:
```json
{
  "features": [
    {
      "id": "tts",
      "enabled": false
    },
    {
      "id": "highContrast",
      "enabled": true
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "message": "Features updated successfully",
  "features": [
    {
      "id": "tts",
      "enabled": false
    },
    {
      "id": "dyslexicFont",
      "enabled": true
    },
    {
      "id": "highContrast",
      "enabled": true
    }
  ]
}
```

## AI Analysis Process

1. Certificate text is extracted from uploaded PDF or image
2. Text is analyzed by the OpenAI API (gpt-4o model)
3. If OpenAI API fails, system falls back to Groq API (llama-3.1-8b-instant model)
4. If both APIs fail, rule-based analysis is performed as a final fallback
5. Accessibility features are recommended based on the identified disability
6. Analysis results are stored and linked to the user profile

## Supported Accessibility Features

| Feature ID | Name | Description |
|------------|------|-------------|
| tts | Text to Speech | Reads text aloud |
| stt | Speech to Text | Converts spoken answers to text |
| dyslexicFont | Dyslexic Font | Font designed for dyslexic readers |
| highContrast | High Contrast | Enhances visual contrast |
| fontSize | Font Size Adjustment | Allows increasing text size |
| extraTime | Extra Time | Provides additional exam time |
| captions | Captions | Text captions for audio content |
| keyboardOnly | Keyboard Navigation | Full keyboard control without mouse |

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad request (invalid input) |
| 401 | Unauthorized (authentication required) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Resource not found |
| 500 | Server error |

## Testing

You can manually test certificate upload and status with curl or Postman.

### Upload certificate
```bash
curl -X POST \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: multipart/form-data" \
  -F "certificate=@/path/to/certificate.pdf" \
  http://localhost:3001/api/certificate/upload
```

### Get verification status
```bash
curl -H "Authorization: Bearer <JWT_TOKEN>" \
  http://localhost:3001/api/certificate/status
```

## Environment Variables

```
# API Keys
OPENAI_API_KEY=your_openai_api_key

# JWT Secret
JWT_SECRET=your_jwt_secret

# Other Config (server defaults to 3001 if not set)
PORT=3001
NODE_ENV=development
```

## Implementation Notes

- The system prioritizes the OpenAI API for better accuracy
- If the OpenAI API is unavailable, it falls back to the Groq API
- If both APIs fail, a rule-based analysis is performed
- All disability certificates and verification results are stored securely
- User features are saved to the user profile and can be toggled by the user