# Quick Test Guide - Video Generation Fix

## 🚀 Quick Start

### 1. Start Backend
```bash
cd backend
python main.py
```
Expected output: `Uvicorn running on http://127.0.0.1:8000`

### 2. Start Frontend
Open new terminal:
```bash
cd c:\Users\abhiv\OneDrive\Desktop\sonic-footsteps-ai-main
npm run dev
```
Expected output: `Local: http://localhost:8080/`

### 3. Test Video Upload Flow

#### Step 1: Upload Video
1. Open http://localhost:8080
2. Click "Video Upload" button
3. Select a video file (MP4 recommended)
4. Video should upload successfully

#### Step 2: Process Video
1. Click "Process Video" button
2. Watch logs for:
   - `[INFO] Uploading video to server...`
   - `[INFO] YOLO detector loading...`
   - `[INFO] MediaPipe pose estimator loading...`
   - `[INFO] Processing... X% complete`
   - `[SUCCESS] Video processed successfully!`
3. CSV results should appear

#### Step 3: Generate Annotated Video
1. Click "Create Annotated Video" button
2. Watch logs for:
   - `[PROCESSING] Generating annotated video... Please wait.`
   - `[PROCESSING] Video generation: 10% complete`
   - `[PROCESSING] Video generation: 20% complete`
   - ... (updates every 10%)
   - `[SUCCESS] Annotated video is ready for viewing and download.`
3. "Download Video" button should appear

#### Step 4: Download Video
1. Click "Download Video" button
2. Video file should download: `annotated_[task_id].mp4`
3. Open downloaded video and verify:
   - ✅ YOLO boxes around person (yellow)
   - ✅ Green pose skeleton
   - ✅ Heel strike banners appear at event frames
   - ✅ Timecode at bottom left
   - ✅ Frame counter
   - ✅ "HYBRID MODE" badge at top right

---

## 🐛 Troubleshooting

### Issue: "Video not ready" error
**Solution**: Wait for video generation to complete (check progress in logs)

### Issue: Video generation stuck at 0%
**Check backend terminal for errors**:
- YOLO model file missing → Ensure `yolov8n.pt` exists in backend/
- OpenCV error → Check video codec compatibility
- Memory error → Try with shorter/lower resolution video

### Issue: Downloaded video has no annotations
**Possible causes**:
- No footstep events detected → Try lowering sensitivity
- Video codec issue → Try different input video format
- Backend error → Check backend terminal for exceptions

### Issue: Backend crash during generation
**Check for**:
- Sufficient disk space for temp files
- YOLO model loaded successfully
- MediaPipe installed correctly: `pip install mediapipe`

---

## 📊 Expected Backend Logs

### During Video Generation:
```
[DEBUG] Starting video generation for task_20240124_123456_abc123
[DEBUG] Creating annotated video for task_20240124_123456_abc123
[DEBUG] Processing 1500 frames...
[DEBUG] Video generation progress: 10.0%
[DEBUG] Video generation progress: 20.0%
...
[DEBUG] Video generation progress: 100.0%
[DEBUG] Video generation completed for task_20240124_123456_abc123
[DEBUG] Annotated video path: C:\Users\...\tmp\tmpXYZ_annotated.mp4
[DEBUG] Video ready: True
```

### During Download:
```
[DEBUG] Download request for task_20240124_123456_abc123
[DEBUG] Video ready: True
[DEBUG] Video generating: False
[DEBUG] Annotated video path: C:\Users\...\tmp\tmpXYZ_annotated.mp4
```

---

## 🎯 Key Indicators of Success

| Step | Success Indicator |
|------|------------------|
| Upload | Toast: "Video uploaded" |
| Processing | Progress bar reaches 100% |
| Detection Complete | "Create Annotated Video" button appears |
| Video Generation | Progress logs every 10% |
| Video Ready | "Download Video" button appears |
| Download | File downloads successfully |
| Playback | All annotations visible in video |

---

## ⏱️ Expected Timing

| Operation | Typical Duration |
|-----------|-----------------|
| Video Upload | 2-5 seconds (depends on file size) |
| Detection Processing | 30-60 seconds (depends on video length) |
| Video Generation | 1-2 minutes (depends on video length) |
| Download | 2-5 seconds (depends on file size) |

*Note: Times vary based on video resolution, length, and system performance*

---

## 📝 Test Checklist

- [ ] Backend starts without errors
- [ ] Frontend loads at localhost:8080
- [ ] Can upload video file
- [ ] Processing completes with events detected
- [ ] CSV export works
- [ ] Can click "Create Annotated Video"
- [ ] Progress updates appear in logs
- [ ] "Download Video" button appears
- [ ] Video downloads successfully
- [ ] Annotations visible in downloaded video:
  - [ ] YOLO bounding boxes
  - [ ] Pose skeleton
  - [ ] Heel strike banners
  - [ ] Timecode display
  - [ ] Frame counter
  - [ ] Hybrid mode badge

---

## 🔧 Configuration Options

### Backend (main.py)
```python
# Default processing config
sensitivity: "medium"  # low, medium, high
yolo_conf: 0.5        # 0.0 to 1.0
use_hybrid: True      # True/False - enables YOLO
```

### Frontend Upload Options
Located in VideoUpload.tsx `handleProcess()`:
```typescript
{
  sensitivity: 'medium',
  yolo_conf: 0.5,
  use_hybrid: true,
  create_annotated: true,
  add_audio: true,
  surface_type: 'concrete'
}
```

---

## 📞 Getting Help

If issues persist:

1. **Check Backend Logs**: Look for ERROR or WARNING messages
2. **Check Browser Console**: Look for network errors or failed requests
3. **Verify Dependencies**: 
   - `pip list | grep -E "opencv|mediapipe|ultralytics"`
   - Ensure all required packages installed
4. **Test with Sample Video**: Use a short, simple video first (10-30 seconds)

---

## ✨ What Changed

This fix implements **real video annotation** (not placeholder). The workflow now matches `real.py`:

- ✅ Actual video processing with OpenCV
- ✅ YOLO person detection overlay
- ✅ MediaPipe pose visualization
- ✅ Event annotations with banners
- ✅ Progress tracking with real percentages
- ✅ Proper file creation and download

Previous version just returned the original video unchanged!
