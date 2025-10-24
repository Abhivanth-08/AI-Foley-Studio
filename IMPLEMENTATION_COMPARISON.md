# Implementation Comparison: real.py vs main.py

## Overview
This document compares the implementation between `real.py` (Streamlit app) and `main.py` (FastAPI server) to identify any missing features.

---

## ✅ FULLY IMPLEMENTED Features

### 1. HybridFootstepDetectionPipeline Class
| Feature | real.py | main.py | Status |
|---------|---------|---------|--------|
| YOLO person detection | ✅ | ✅ | **MATCH** |
| MediaPipe pose estimation | ✅ | ✅ | **MATCH** |
| Person tracking (PersonTracker) | ✅ | ✅ | **MATCH** |
| Heel landmark detection (29, 30) | ✅ | ✅ | **MATCH** |
| Sensitivity thresholds (low/medium/high) | ✅ | ✅ | **MATCH** |
| Savgol filter smoothing | ✅ | ✅ | **MATCH** |
| Peak detection (find_peaks) | ✅ | ✅ | **MATCH** |
| SMPTE timecode conversion | ✅ | ✅ | **MATCH** |
| Event detection (LEFT/RIGHT) | ✅ | ✅ | **MATCH** |
| Progress callbacks | ✅ | ✅ | **MATCH** |

### 2. create_annotated_video Function
| Feature | real.py | main.py | Status |
|---------|---------|---------|--------|
| VideoCapture input | ✅ | ✅ | **MATCH** |
| VideoWriter output (mp4v) | ✅ | ✅ | **MATCH** |
| YOLO bounding boxes | ✅ | ✅ | **MATCH** |
| MediaPipe skeleton drawing | ✅ | ✅ | **MATCH** |
| Heel strike banners | ✅ | ✅ | **MATCH** |
| Confidence scores | ✅ | ✅ | **MATCH** |
| Indicator circles | ✅ | ✅ | **MATCH** |
| Hybrid mode badge | ✅ | ✅ | **MATCH** |
| Timecode display (HH:MM:SS:FF) | ✅ | ✅ | **MATCH** |
| Frame counter | ✅ | ✅ | **MATCH** |
| Progress callbacks | ✅ | ✅ | **MATCH** |
| Error handling | ✅ | ✅ | **MATCH** |

### 3. API Endpoints
| Feature | real.py | main.py | Status |
|---------|---------|---------|--------|
| Video upload | ✅ (Streamlit uploader) | ✅ (/api/upload-video) | **IMPLEMENTED** |
| Process video | ✅ (button click) | ✅ (/api/process/{task_id}) | **IMPLEMENTED** |
| Get status | ✅ (session_state) | ✅ (/api/status/{task_id}) | **IMPLEMENTED** |
| Generate annotated video | ✅ (button click) | ✅ (/api/generate-video/{task_id}) | **IMPLEMENTED** |
| Video status check | ✅ (session_state) | ✅ (/api/video-status/{task_id}) | **IMPLEMENTED** |
| Download video | ✅ (Streamlit download) | ✅ (/api/download-video/{task_id}) | **IMPLEMENTED** |
| Export CSV | ✅ (download_button) | ✅ (/api/export-csv/{task_id}) | **IMPLEMENTED** |
| Export JSON | ✅ (download_button) | ✅ (/api/export-json/{task_id}) | **IMPLEMENTED** |

---

## ⚠️ PARTIALLY IMPLEMENTED Features

### 1. Audio Generation & Merging
| Feature | real.py | main.py | Status |
|---------|---------|---------|--------|
| AudioGenerator class | ✅ | ✅ | **EXISTS** |
| create_audio_track() | ✅ | ✅ | **EXISTS** |
| merge_audio_with_video() | ✅ | ❌ | **MISSING IN MAIN.PY** |
| FFmpeg integration | ✅ | ✅ (path detection) | **PARTIAL** |
| Audio + video merge endpoint | ✅ (button) | ❌ | **NOT EXPOSED AS API** |

**Impact**: Users cannot generate video with footstep audio in the FastAPI version

### 2. Live Streaming Mode
| Feature | real.py | main.py | Status |
|---------|---------|---------|--------|
| LiveFootstepDetector class | ✅ | ❌ | **NOT NEEDED (Streamlit-specific)** |
| Webcam capture | ✅ | ✅ (via /api/live endpoints) | **DIFFERENT APPROACH** |
| Real-time audio playback | ✅ | ❌ | **NOT IMPLEMENTED** |

**Impact**: Live mode exists in main.py but doesn't have audio playback

---

## ❌ NOT IMPLEMENTED (But Not Critical)

### 1. Streamlit-Specific Features
- Session state management (replaced with tasks_storage dict)
- Streamlit UI components (st.info, st.error, etc.)
- Download buttons (replaced with file download endpoints)
- Progress bars (replaced with polling)
- Streamlit metrics display (replaced with JSON responses)

**Impact**: None - These are UI-specific and properly replaced with API equivalents

---

## 🔍 KEY DIFFERENCES

### Error Handling
| Aspect | real.py | main.py |
|--------|---------|---------|
| UI feedback | st.error(), st.warning() | HTTP exceptions, console logging |
| User notifications | Toast messages via Streamlit | Frontend toast (React) |
| Stack traces | Shown in Streamlit | Printed to console |

### Video Generation Flow
| Step | real.py | main.py |
|------|---------|---------|
| Trigger | Button click | POST /api/generate-video/{task_id} |
| Progress | Streamlit progress bar | Polling /api/video-status/{task_id} |
| Completion | Session state update | task['video_ready'] = True |
| Download | Streamlit download button | GET /api/download-video/{task_id} |

---

## 📋 MISSING FEATURES TO IMPLEMENT

### Priority 1: Audio Merging (High Impact)
```python
# real.py has this (line ~900)
def merge_audio_with_video(video_path, audio_track, sample_rate, output_path):
    """Merge audio with video using FFmpeg"""
    temp_audio = tempfile.mktemp(suffix='.wav')
    sf.write(temp_audio, audio_track, sample_rate)
    
    ffmpeg_cmd = FFMPEG_PATH if FFMPEG_PATH else "ffmpeg"
    
    cmd = [
        ffmpeg_cmd, '-y',
        '-i', str(video_path),
        '-i', temp_audio,
        '-map', '0:v', '-map', '1:a',
        '-c:v', 'libx264', '-preset', 'medium',
        '-c:a', 'aac', '-b:a', '192k',
        '-shortest',
        str(output_path)
    ]
    
    subprocess.run(cmd, check=True, capture_output=True, text=True, timeout=30)
```

**Needed in main.py**:
1. Add `merge_audio_with_video()` function
2. Add endpoint: POST /api/generate-audio-video/{task_id}
3. Update frontend to support audio video generation

### Priority 2: Additional Return Fields
real.py's `process_video()` returns extra fields:
```python
return {
    'events': events,
    'fps': fps,
    'total_frames': total_frames,
    'width': width,
    'height': height,
    'left_positions': left_positions.tolist(),      # EXTRA
    'right_positions': right_positions.tolist(),    # EXTRA
    'detection_stats': {
        'yolo_detections': yolo_detections,
        'pose_detections': pose_detections,
        'total_frames': total_frames
    }
}
```

**Impact**: Minimal - These are used for visualization/debugging in Streamlit

---

## ✅ CONCLUSION

### What IS Fully Implemented:
1. ✅ Video upload and processing
2. ✅ YOLO + MediaPipe hybrid detection
3. ✅ Footstep event detection
4. ✅ Annotated video generation with all overlays
5. ✅ Video download
6. ✅ CSV/JSON export
7. ✅ Progress tracking
8. ✅ Person tracking across frames

### What is NOT Implemented:
1. ❌ **Audio + Video merging** (real.py line ~900-950)
2. ❌ **Generate with Audio button** equivalent API endpoint
3. ❌ Extra data fields (left_positions, right_positions) - not critical

### Recommendation:
The **core video annotation workflow** from real.py **IS fully implemented** in main.py. The only missing feature is **audio merging**, which is a separate optional feature. 

If users are experiencing issues, it's likely:
1. Model loading problems (YOLO not found)
2. Video codec issues (input video format)
3. Memory constraints (large videos)
4. Python dependencies missing

**The video generation implementation is complete and matches real.py.**
