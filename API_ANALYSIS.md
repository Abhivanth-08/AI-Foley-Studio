# AI Foley Studio - Backend & Frontend API Analysis

## 📋 Overview
This document provides a comprehensive analysis of the backend API endpoints and their integration with the frontend components.

---

## 🔧 Backend Architecture (FastAPI - main.py)

### **Base URL**: `http://localhost:8000`

### Core Components

#### 1. **Detection Pipeline**
- **HybridFootstepDetectionPipeline**: Combines YOLO (object detection) + MediaPipe (pose estimation)
- **PersonTracker**: Tracks person across video frames using IoU (Intersection over Union)
- **AudioGenerator**: Generates footstep audio synchronized with detected events

#### 2. **Storage**
- `tasks_storage`: In-memory dict for task tracking
- `video_storage`: In-memory dict for video file paths
- **Note**: For production, migrate to Redis/Database

---

## 🌐 API Endpoints

### 1. Health Check
```
GET /
```
**Response:**
```json
{
  "status": "online",
  "service": "Footstep Detection API",
  "version": "1.0.0"
}
```

---

### 2. Upload Video
```
POST /api/upload-video
```
**Parameters:**
- `file` (UploadFile): Video file
- `config` (string, optional): JSON configuration

**Configuration Options:**
```typescript
{
  sensitivity: "low" | "medium" | "high",  // default: "medium"
  yolo_conf: 0.0 - 1.0,                    // default: 0.5
  use_hybrid: boolean,                      // default: true
  create_annotated: boolean,                // default: true
  add_audio: boolean,                       // default: true
  surface_type: string                      // default: "concrete"
}
```

**Response:**
```json
{
  "task_id": "task_20251021_143022_abc123",
  "status": "uploaded",
  "message": "Video uploaded successfully. Use /api/process/{task_id} to start processing."
}
```

---

### 3. Process Video
```
POST /api/process/{task_id}
```
**Description:** Starts background processing of uploaded video

**Response:**
```json
{
  "task_id": "task_20251021_143022_abc123",
  "status": "processing",
  "message": "Video processing started"
}
```

**Processing Steps:**
1. YOLO detects person bounding boxes (confidence threshold: 0.5)
2. MediaPipe estimates pose within detected boxes
3. Tracks heel landmarks (LEFT_HEEL: 29, RIGHT_HEEL: 30)
4. Applies Savitzky-Golay filter for smoothing
5. Detects heel strikes using peak detection
6. Generates footstep events with timestamps

---

### 4. Get Task Status
```
GET /api/status/{task_id}
```
**Response (Processing):**
```json
{
  "task_id": "task_20251021_143022_abc123",
  "status": "processing",
  "progress": 0.45
}
```

**Response (Completed):**
```json
{
  "task_id": "task_20251021_143022_abc123",
  "status": "completed",
  "progress": 1.0,
  "results": {
    "events": [...],
    "fps": 30.0,
    "total_frames": 250,
    "width": 1920,
    "height": 1080,
    "detection_stats": {
      "yolo_detections": 238,
      "pose_detections": 245,
      "total_frames": 250
    }
  }
}
```

---

### 5. Get Results
```
GET /api/results/{task_id}
```
**Response:**
```json
{
  "events": [
    {
      "frame": 15,
      "timecode": "00:00:00:15",
      "foot": "LEFT",
      "event": "HEEL_STRIKE",
      "time_seconds": 0.5,
      "confidence": 0.89
    },
    {
      "frame": 28,
      "timecode": "00:00:00:28",
      "foot": "RIGHT",
      "event": "HEEL_STRIKE",
      "time_seconds": 0.93,
      "confidence": 0.92
    }
  ],
  "fps": 30.0,
  "total_frames": 250,
  "detection_stats": {...}
}
```

---

### 6. Export Results
```
GET /api/export/{task_id}/csv
GET /api/export/{task_id}/json
```
**Description:** Download results in CSV or JSON format

**CSV Format:**
```csv
frame,timecode,foot,event,time_seconds,confidence
15,00:00:00:15,LEFT,HEEL_STRIKE,0.5,0.89
28,00:00:00:28,RIGHT,HEEL_STRIKE,0.93,0.92
```

---

### 7. Generate Annotated Video
```
POST /api/generate-video/{task_id}
```
**Description:** Creates video with visual annotations showing detected footsteps

**Response:**
```json
{
  "message": "Video generation started",
  "task_id": "task_20251021_143022_abc123"
}
```

---

### 8. Download Video
```
GET /api/download-video/{task_id}
```
**Response:** Video file stream (video/mp4)

---

### 9. Live Mode - Capture Floor
```
POST /api/live/capture-floor
```
**Parameters:**
- `file` (UploadFile): Image of floor surface

**Response:**
```json
{
  "session_id": "live_20251021_143500_def456",
  "status": "floor_captured",
  "message": "Floor frame captured successfully"
}
```

---

### 10. Live Mode - Generate Audio
```
POST /api/live/generate-audio/{session_id}
```
**Description:** Analyzes floor surface and generates appropriate audio samples

**Process:**
1. Uses `process_video_for_footstep_audio()` from `agent.py`
2. Calls `main_sound()` from `sound_agent.py` to fetch audio
3. Stores audio path for real-time playback

**Response:**
```json
{
  "session_id": "live_20251021_143500_def456",
  "message": "Audio generation started"
}
```

---

### 11. Live Mode - Detect Frame
```
POST /api/live/detect-frame/{session_id}
```
**Parameters:**
- `file` (UploadFile): Current frame from webcam
- `config` (string, optional): Detection configuration

**Response:**
```json
{
  "session_id": "live_20251021_143500_def456",
  "detected": true,
  "foot": "LEFT"
}
```

---

### 12. Cleanup Task
```
DELETE /api/cleanup/{task_id}
```
**Description:** Removes task from storage and deletes associated files

**Response:**
```json
{
  "message": "Task cleaned up successfully"
}
```

---

### 13. List All Tasks
```
GET /api/tasks
```
**Response:**
```json
{
  "tasks": [
    {
      "task_id": "task_20251021_143022_abc123",
      "status": "completed",
      "created_at": "2025-10-21T14:30:22.123456",
      "type": "video"
    },
    {
      "task_id": "live_20251021_143500_def456",
      "status": "audio_ready",
      "created_at": "2025-10-21T14:35:00.789012",
      "type": "live"
    }
  ]
}
```

---

## 🎨 Frontend Integration

### Current Implementation Status

#### VideoUpload.tsx
**Current State:** ⚠️ **Simulated (No API Calls)**

The component currently uses mock data with `setTimeout` to simulate:
- Video processing (250 frames)
- Progress updates
- Footstep detection (47 events found)
- Statistics (YOLO: 238/250, Pose: 245/250)

**Required Integration:**
```typescript
// 1. Upload video
const formData = new FormData();
formData.append('file', file);
const uploadRes = await fetch('http://localhost:8000/api/upload-video', {
  method: 'POST',
  body: formData
});
const { task_id } = await uploadRes.json();

// 2. Start processing
await fetch(`http://localhost:8000/api/process/${task_id}`, {
  method: 'POST'
});

// 3. Poll for status
const pollInterval = setInterval(async () => {
  const statusRes = await fetch(`http://localhost:8000/api/status/${task_id}`);
  const status = await statusRes.json();
  setProgress(status.progress * 100);
  
  if (status.status === 'completed') {
    clearInterval(pollInterval);
    // Display results
  }
}, 1000);

// 4. Get results
const resultsRes = await fetch(`http://localhost:8000/api/results/${task_id}`);
const results = await resultsRes.json();
```

---

#### LiveStreaming.tsx
**Current State:** ⚠️ **Simulated (No API Calls)**

The component currently uses mock implementations for:
- Floor capture (uses placeholder image)
- Audio generation (simulated delay)
- Live detection (random footstep generation)

**Required Integration:**
```typescript
// 1. Capture floor
const captureFloor = async (imageBlob: Blob) => {
  const formData = new FormData();
  formData.append('file', imageBlob);
  const res = await fetch('http://localhost:8000/api/live/capture-floor', {
    method: 'POST',
    body: formData
  });
  const { session_id } = await res.json();
  return session_id;
};

// 2. Generate audio
await fetch(`http://localhost:8000/api/live/generate-audio/${session_id}`, {
  method: 'POST'
});

// 3. Real-time detection
const detectFrame = async (frameBlob: Blob) => {
  const formData = new FormData();
  formData.append('file', frameBlob);
  const res = await fetch(`http://localhost:8000/api/live/detect-frame/${session_id}`, {
    method: 'POST',
    body: formData
  });
  const detection = await res.json();
  
  if (detection.detected) {
    // Play audio for detected foot
    playFootstepSound(detection.foot);
  }
};
```

---

## 🔄 Recommended Frontend Changes

### 1. Create API Service Layer
Create `src/services/api.ts`:

```typescript
const API_BASE_URL = 'http://localhost:8000';

export const api = {
  // Video Upload Mode
  uploadVideo: async (file: File, config?: ProcessingConfig) => {
    const formData = new FormData();
    formData.append('file', file);
    if (config) formData.append('config', JSON.stringify(config));
    
    const res = await fetch(`${API_BASE_URL}/api/upload-video`, {
      method: 'POST',
      body: formData,
    });
    return res.json();
  },
  
  processVideo: async (taskId: string) => {
    const res = await fetch(`${API_BASE_URL}/api/process/${taskId}`, {
      method: 'POST',
    });
    return res.json();
  },
  
  getTaskStatus: async (taskId: string) => {
    const res = await fetch(`${API_BASE_URL}/api/status/${taskId}`);
    return res.json();
  },
  
  getResults: async (taskId: string) => {
    const res = await fetch(`${API_BASE_URL}/api/results/${taskId}`);
    return res.json();
  },
  
  exportCSV: (taskId: string) => {
    window.open(`${API_BASE_URL}/api/export/${taskId}/csv`, '_blank');
  },
  
  exportJSON: (taskId: string) => {
    window.open(`${API_BASE_URL}/api/export/${taskId}/json`, '_blank');
  },
  
  generateVideo: async (taskId: string) => {
    const res = await fetch(`${API_BASE_URL}/api/generate-video/${taskId}`, {
      method: 'POST',
    });
    return res.json();
  },
  
  downloadVideo: (taskId: string) => {
    window.open(`${API_BASE_URL}/api/download-video/${taskId}`, '_blank');
  },
  
  // Live Mode
  captureFloor: async (imageBlob: Blob) => {
    const formData = new FormData();
    formData.append('file', imageBlob);
    
    const res = await fetch(`${API_BASE_URL}/api/live/capture-floor`, {
      method: 'POST',
      body: formData,
    });
    return res.json();
  },
  
  generateAudio: async (sessionId: string) => {
    const res = await fetch(`${API_BASE_URL}/api/live/generate-audio/${sessionId}`, {
      method: 'POST',
    });
    return res.json();
  },
  
  detectFrame: async (sessionId: string, frameBlob: Blob) => {
    const formData = new FormData();
    formData.append('file', frameBlob);
    
    const res = await fetch(`${API_BASE_URL}/api/live/detect-frame/${sessionId}`, {
      method: 'POST',
      body: formData,
    });
    return res.json();
  },
  
  cleanup: async (taskId: string) => {
    const res = await fetch(`${API_BASE_URL}/api/cleanup/${taskId}`, {
      method: 'DELETE',
    });
    return res.json();
  },
  
  listTasks: async () => {
    const res = await fetch(`${API_BASE_URL}/api/tasks`);
    return res.json();
  },
};
```

### 2. Update VideoUpload.tsx
Replace simulation code with real API calls:

```typescript
const handleProcess = async () => {
  if (!file) return;
  
  try {
    setProcessing(true);
    setStage('detecting');
    addLog("[INFO] Uploading video...");
    
    // Upload
    const { task_id } = await api.uploadVideo(file, {
      sensitivity: 'medium',
      yolo_conf: 0.5,
      use_hybrid: true
    });
    
    addLog("[INFO] Video uploaded. Starting processing...");
    
    // Start processing
    await api.processVideo(task_id);
    
    // Poll for status
    const pollInterval = setInterval(async () => {
      const status = await api.getTaskStatus(task_id);
      setProgress(status.progress * 100);
      
      if (status.status === 'completed') {
        clearInterval(pollInterval);
        setProcessing(false);
        setProcessed(true);
        
        const results = status.results;
        addLog(`[SUCCESS] Detection complete! Found ${results.events.length} events.`);
        addLog(`[STATS] YOLO Detections: ${results.detection_stats.yolo_detections}/${results.detection_stats.total_frames}`);
        addLog(`[STATS] Pose Detections: ${results.detection_stats.pose_detections}/${results.detection_stats.total_frames}`);
      } else if (status.status === 'failed') {
        clearInterval(pollInterval);
        addLog(`[ERROR] Processing failed: ${status.error}`);
        setProcessing(false);
      }
    }, 1000);
    
  } catch (error) {
    addLog(`[ERROR] ${error.message}`);
    setProcessing(false);
  }
};
```

### 3. Update LiveStreaming.tsx
Implement real webcam integration:

```typescript
const handleCaptureFrame = async () => {
  setIsCapturing(true);
  
  try {
    // Capture from webcam
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    const video = document.createElement('video');
    video.srcObject = stream;
    await video.play();
    
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg'));
    
    // Upload to backend
    const { session_id } = await api.captureFloor(blob);
    setSessionId(session_id);
    
    // Display image
    const imageUrl = URL.createObjectURL(blob);
    setFloorImage(imageUrl);
    
    // Stop stream
    stream.getTracks().forEach(track => track.stop());
    
    setIsCapturing(false);
    toast({ title: "Frame captured!", description: "Floor surface captured successfully" });
    
  } catch (error) {
    console.error('Capture failed:', error);
    setIsCapturing(false);
  }
};
```

---

## 🚀 Getting Started

### Backend Setup
```bash
cd backend

# Install dependencies
pip install fastapi uvicorn opencv-python mediapipe ultralytics scipy pandas soundfile python-multipart

# Run server
python main.py
# or
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup
```bash
# Install dependencies (if needed)
npm install

# Run dev server
npm run dev
```

### CORS Configuration
The backend allows all origins (`allow_origins=["*"]`). For production, update to:
```python
allow_origins=["http://localhost:8080", "https://yourdomain.com"]
```

---

## 📊 Detection Algorithm Details

### Sensitivity Settings
| Level | Prominence | Min Interval | Use Case |
|-------|-----------|--------------|----------|
| Low | 0.02 | 0.4s | Walking, fewer false positives |
| Medium | 0.015 | 0.3s | Normal footsteps |
| High | 0.01 | 0.25s | Running, more detections |

### MediaPipe Landmarks
- **LEFT_HEEL**: Index 29
- **RIGHT_HEEL**: Index 30

### Peak Detection
- Uses `scipy.signal.find_peaks`
- Applies Savitzky-Golay filter for smoothing
- Parameters: `prominence`, `distance`, `height`

---

## 🐛 Known Issues & TODOs

### Backend
- [ ] Video generation task (`generate_video_task`) is incomplete
- [ ] Live frame detection (`detect_live_frame`) needs implementation
- [ ] Replace in-memory storage with Redis/Database
- [ ] Add authentication/authorization
- [ ] Implement rate limiting
- [ ] Add proper error handling for FFmpeg operations

### Frontend
- [ ] Replace all simulated data with real API calls
- [ ] Implement WebSocket for real-time updates (optional)
- [ ] Add proper error boundaries
- [ ] Implement video player with annotations overlay
- [ ] Add audio visualization
- [ ] Implement webcam access for live mode
- [ ] Add download functionality for results

---

## 📝 Environment Variables

Create `.env` file in backend:
```env
FFMPEG_PATH=C:\\path\\to\\ffmpeg.exe
YOLO_MODEL_PATH=./yolov8n.pt
AUDIO_SAMPLE_RATE=44100
MAX_UPLOAD_SIZE=500000000  # 500MB
TASK_CLEANUP_HOURS=24
```

---

## 🔒 Security Recommendations

1. **File Upload**: Add file size limits and virus scanning
2. **CORS**: Restrict origins in production
3. **Rate Limiting**: Implement per-IP rate limiting
4. **Authentication**: Add JWT or OAuth2
5. **Input Validation**: Validate all file uploads
6. **HTTPS**: Use HTTPS in production
7. **Secrets**: Store API keys in environment variables

---

## 📈 Performance Optimization

1. **Video Processing**: Use GPU acceleration for YOLO/MediaPipe
2. **Caching**: Cache processed results
3. **Queue System**: Use Celery or RQ for background tasks
4. **CDN**: Serve static assets via CDN
5. **Database**: Use PostgreSQL + Redis for production
6. **Compression**: Compress video outputs
7. **Streaming**: Stream large video files instead of loading fully

---

## 📚 Dependencies

### Backend (Python)
```
fastapi==0.104.1
uvicorn==0.24.0
opencv-python==4.8.1
mediapipe==0.10.7
ultralytics==8.0.200
scipy==1.11.3
pandas==2.1.2
soundfile==0.12.1
python-multipart==0.0.6
```

### Frontend (Node.js)
Already defined in `package.json`

---

**Last Updated**: October 21, 2025
**Version**: 1.0.0
**Author**: AI Foley Studio Team
