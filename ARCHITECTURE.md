# 🎯 Backend-Frontend Integration Architecture

## System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                         │
│                    http://localhost:8080                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────┐         ┌─────────────────────┐       │
│  │  VideoUpload.tsx    │         │ LiveStreaming.tsx    │       │
│  │  ─────────────────  │         │ ──────────────────   │       │
│  │  • Upload video     │         │ • Capture floor      │       │
│  │  • Poll progress    │         │ • Get webcam feed    │       │
│  │  • Display results  │         │ • Detect in real-time│       │
│  │  • Export CSV/JSON  │         │ • Show statistics    │       │
│  └──────────┬──────────┘         └──────────┬──────────┘       │
│             │                               │                    │
│             └───────────┬───────────────────┘                    │
│                         │                                        │
│                         ▼                                        │
│              ┌─────────────────────┐                            │
│              │   src/services/     │                            │
│              │      api.ts         │                            │
│              │  ─────────────────  │                            │
│              │  • API calls        │                            │
│              │  • Error handling   │                            │
│              │  • Type safety      │                            │
│              └──────────┬──────────┘                            │
│                         │                                        │
└─────────────────────────┼────────────────────────────────────────┘
                          │
                          │ HTTP REST API
                          │
┌─────────────────────────▼────────────────────────────────────────┐
│                      BACKEND (FastAPI)                            │
│                    http://localhost:8000                          │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              API ENDPOINTS (main.py)                     │    │
│  │  ─────────────────────────────────────────────────────  │    │
│  │                                                           │    │
│  │  VIDEO MODE:                   LIVE MODE:                │    │
│  │  ├─ POST /api/upload-video    ├─ POST /api/live/capture-│    │
│  │  ├─ POST /api/process/{id}    │         floor            │    │
│  │  ├─ GET  /api/status/{id}     ├─ POST /api/live/generate│    │
│  │  ├─ GET  /api/results/{id}    │         -audio/{id}      │    │
│  │  ├─ GET  /api/export/{id}/csv └─ POST /api/live/detect- │    │
│  │  └─ GET  /api/export/{id}/json        frame/{id}         │    │
│  │                                                           │    │
│  └───────────────────────┬───────────────────────────────────    │
│                          │                                        │
│                          ▼                                        │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │         DETECTION PIPELINE                               │    │
│  │  ────────────────────────────────────────────────────   │    │
│  │                                                           │    │
│  │  ┌──────────────┐    ┌──────────────┐    ┌───────────┐ │    │
│  │  │     YOLO     │───▶│  MediaPipe   │───▶│  Signal   │ │    │
│  │  │   (Person    │    │   (Pose      │    │ Processing│ │    │
│  │  │  Detection)  │    │  Estimation) │    │  (Peaks)  │ │    │
│  │  └──────────────┘    └──────────────┘    └───────────┘ │    │
│  │         │                    │                   │       │    │
│  │         └────────────────────┴───────────────────┘       │    │
│  │                              │                            │    │
│  │                              ▼                            │    │
│  │                    ┌─────────────────┐                   │    │
│  │                    │  Footstep Events│                   │    │
│  │                    │  ──────────────  │                   │    │
│  │                    │  • Timestamp     │                   │    │
│  │                    │  • Foot (L/R)    │                   │    │
│  │                    │  • Confidence    │                   │    │
│  │                    └─────────────────┘                   │    │
│  │                                                           │    │
│  └───────────────────────────────────────────────────────────    │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │         AUDIO GENERATION                                 │    │
│  │  ────────────────────────────────────────────────────   │    │
│  │                                                           │    │
│  │  agent.py → sound_agent.py → YouTube Audio Search       │    │
│  │     ↓                                                     │    │
│  │  qsec.py → Extract audio samples                        │    │
│  │     ↓                                                     │    │
│  │  Generate footstep audio track                          │    │
│  │                                                           │    │
│  └───────────────────────────────────────────────────────────    │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### Video Upload Mode

```
1. User uploads video (MP4/MOV/AVI)
   │
   ▼
2. Frontend: api.uploadVideo(file)
   │
   ▼
3. Backend: POST /api/upload-video
   │   • Saves file temporarily
   │   • Generates task_id
   │   • Returns task_id
   ▼
4. Frontend: api.processVideo(task_id)
   │
   ▼
5. Backend: POST /api/process/{task_id}
   │   • Starts background processing
   │   • YOLO detects person
   │   • MediaPipe tracks heels (landmarks 29, 30)
   │   • Signal processing finds peaks
   │   • Generates footstep events
   ▼
6. Frontend: Polls api.getTaskStatus(task_id) every 1 sec
   │   • Shows progress (0-100%)
   │   • Updates console logs
   ▼
7. Backend: Returns status="completed" with results
   │   • events: [{frame, foot, time, confidence}, ...]
   │   • fps, total_frames
   │   • detection_stats
   ▼
8. Frontend: Displays results
   │   • Total events found
   │   • Left/Right foot counts
   │   • Average confidence
   │   • Download buttons for CSV/JSON
   ▼
9. User downloads results
```

---

### Live Streaming Mode

```
1. User allows camera access
   │
   ▼
2. Frontend: Captures floor frame from webcam
   │   • getUserMedia({ video: true })
   │   • Captures canvas snapshot
   │   • Converts to JPEG blob
   ▼
3. Frontend: api.captureFloor(blob)
   │
   ▼
4. Backend: POST /api/live/capture-floor
   │   • Saves floor image
   │   • Generates session_id
   │   • Returns session_id
   ▼
5. Frontend: api.generateAudio(session_id)
   │
   ▼
6. Backend: POST /api/live/generate-audio/{session_id}
   │   • Analyzes floor surface
   │   • Calls agent.py → sound_agent.py
   │   • Searches YouTube for footstep sounds
   │   • Extracts audio samples
   │   • Stores audio path
   ▼
7. Frontend: Starts webcam stream
   │   • Displays live video feed
   │   • Sends frames every 500ms
   ▼
8. Loop: Frame Detection
   │   ├─ Capture current frame
   │   ├─ Convert to JPEG blob
   │   ├─ api.detectFrame(session_id, blob)
   │   │   │
   │   │   ▼
   │   ├─ Backend: POST /api/live/detect-frame/{session_id}
   │   │   │   • YOLO detects person
   │   │   │   • MediaPipe tracks heels
   │   │   │   • Detects heel strike
   │   │   │   • Returns { detected: true, foot: "LEFT/RIGHT" }
   │   │   ▼
   │   └─ Frontend: Updates statistics
   │       • Increment total/left/right counters
   │       • Play audio (to be implemented)
   ▼
9. User stops detection
   │   • Stops webcam stream
   │   • Clears interval
   │   • Releases resources
```

---

## Component Architecture

```
App.tsx
  │
  ├─ pages/Index.tsx
  │    │
  │    ├─ Hero
  │    ├─ Features
  │    └─ Mode Selection
  │         │
  │         ├─ VideoUpload ──┐
  │         │                 │
  │         └─ LiveStreaming ─┤
  │                           │
  └─────────────────────────┬─┘
                            │
                            ▼
                   services/api.ts
                            │
                            ▼
                   Backend API (FastAPI)
```

---

## State Management

### VideoUpload Component State:
```typescript
- file: File | null                     // Uploaded video file
- processing: boolean                   // Is processing?
- processed: boolean                    // Processing complete?
- logs: string[]                        // Console logs
- progress: number                      // 0-100
- stage: 'idle' | 'detecting' | ...    // Current stage
- taskId: string | null                 // Backend task ID
- results: ProcessingResult | null      // Detection results
```

### LiveStreaming Component State:
```typescript
- step: 1 | 2 | 3 | 4                   // Current step
- floorImage: string | null             // Captured floor image
- sessionId: string | null              // Backend session ID
- isCapturing: boolean                  // Capturing floor?
- isAnalyzing: boolean                  // Analyzing floor?
- isLive: boolean                       // Live detection active?
- stats: { total, left, right }         // Detection statistics
- videoRef: HTMLVideoElement            // Video element ref
- streamRef: MediaStream                // Webcam stream
```

---

## API Request/Response Examples

### Upload Video
```typescript
// Request
POST /api/upload-video
FormData: {
  file: <video file>
  config: {
    sensitivity: "medium",
    yolo_conf: 0.5,
    use_hybrid: true
  }
}

// Response
{
  task_id: "task_20251021_143022_abc123",
  status: "uploaded",
  message: "Video uploaded successfully"
}
```

### Get Status
```typescript
// Request
GET /api/status/task_20251021_143022_abc123

// Response (processing)
{
  task_id: "task_20251021_143022_abc123",
  status: "processing",
  progress: 0.45
}

// Response (completed)
{
  task_id: "task_20251021_143022_abc123",
  status: "completed",
  progress: 1.0,
  results: {
    events: [
      {
        frame: 15,
        timecode: "00:00:00:15",
        foot: "LEFT",
        event: "HEEL_STRIKE",
        time_seconds: 0.5,
        confidence: 0.89
      }
    ],
    fps: 30.0,
    total_frames: 250,
    detection_stats: {
      yolo_detections: 238,
      pose_detections: 245,
      total_frames: 250
    }
  }
}
```

---

## Technology Stack

### Frontend:
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Components**: shadcn/ui + Tailwind CSS
- **State**: React Hooks (useState, useRef, useEffect)
- **HTTP**: Fetch API
- **Media**: getUserMedia API (WebRTC)

### Backend:
- **Framework**: FastAPI (Python)
- **Computer Vision**: 
  - YOLO v8 (person detection)
  - MediaPipe (pose estimation)
- **Signal Processing**: SciPy (peak detection)
- **Video**: OpenCV
- **Audio**: soundfile, librosa
- **Server**: Uvicorn (ASGI)

---

## Performance Considerations

### Video Upload Mode:
- **Polling Interval**: 1 second (adjustable)
- **Background Processing**: Multi-threaded
- **Memory**: Videos stored temporarily, cleaned up after

### Live Mode:
- **Frame Rate**: 2 FPS (500ms interval)
- **Video Resolution**: 1280x720 (adjustable)
- **JPEG Quality**: 80% (trade-off size/quality)
- **Detection Latency**: ~500ms per frame

---

**Last Updated**: October 21, 2025
**Status**: ✅ Fully Integrated
