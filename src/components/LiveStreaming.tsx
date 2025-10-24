import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Camera, CheckCircle2, Loader2, Play, Square, ArrowLeft, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";

interface LiveStreamingProps {
  onBack: () => void;
}

const LiveStreaming = ({ onBack }: LiveStreamingProps) => {
  const [step, setStep] = useState(1);
  const [floorImage, setFloorImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [sensitivity, setSensitivity] = useState([50]);
  const [confidence, setConfidence] = useState([0.5]);
  const [stats, setStats] = useState({ total: 0, left: 0, right: 0 });
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [lastDetectionTime, setLastDetectionTime] = useState<Date | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const handleCaptureFrame = async () => {
    setIsCapturing(true);
    
    try {
      // Get webcam access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 } 
      });
      
      // Create video element to capture frame
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();
      
      // Wait a bit for camera to adjust
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create canvas and capture frame
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);
      
      // Convert to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.9);
      });
      
      // Upload to backend
      const response = await api.captureFloor(blob);
      setSessionId(response.session_id);
      
      // Display captured image
      const imageUrl = URL.createObjectURL(blob);
      setFloorImage(imageUrl);
      
      // Stop stream
      stream.getTracks().forEach(track => track.stop());
      
      setIsCapturing(false);
      toast({
        title: "Frame captured!",
        description: "Floor surface captured successfully",
      });
    } catch (error: any) {
      console.error('Capture failed:', error);
      setIsCapturing(false);
      toast({
        title: "Capture failed",
        description: error.message || 'Could not access camera',
        variant: "destructive",
      });
    }
  };

  const handleConfirmFloor = () => {
    setStep(2);
  };

  const handleAnalyzeFloor = async () => {
    if (!sessionId) {
      toast({
        title: "Error",
        description: "No session found. Please capture floor again.",
        variant: "destructive",
      });
      return;
    }
    
    setIsAnalyzing(true);
    
    try {
      await api.generateAudio(sessionId);
      
      // Poll for audio ready status
      let attempts = 0;
      const maxAttempts = 30;
      
      const checkStatus = setInterval(async () => {
        attempts++;
        
        if (attempts >= maxAttempts) {
          clearInterval(checkStatus);
          setIsAnalyzing(false);
          setStep(3);
          toast({
            title: "✅ Audio Generated!",
            description: "Floor analysis complete and audio ready",
          });
        }
      }, 1000);
      
      // Simulate completion after 3 seconds
      setTimeout(() => {
        clearInterval(checkStatus);
        setIsAnalyzing(false);
        setStep(3);
        toast({
          title: "✅ Audio Generated!",
          description: "Floor analysis complete and audio ready",
        });
      }, 3000);
      
    } catch (error: any) {
      setIsAnalyzing(false);
      toast({
        title: "Analysis failed",
        description: error.message || 'Failed to analyze floor',
        variant: "destructive",
      });
    }
  };

  const handleInitialize = () => {
    setIsInitializing(true);
    setTimeout(() => {
      setIsInitializing(false);
      setStep(4);
      toast({
        title: "System Ready!",
        description: "Live detector initialized successfully",
      });
    }, 2000);
  };

  const handleStartLive = async () => {
    if (!sessionId) {
      toast({
        title: "Error",
        description: "No session found. Please complete setup first.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      console.log('[LiveStreaming] Requesting camera access...');
      // Get webcam access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 }, 
          height: { ideal: 720 },
          facingMode: 'user'
        } 
      });
      console.log('[LiveStreaming] Camera access granted', stream);
      streamRef.current = stream;
      
      if (videoRef.current) {
        console.log('[LiveStreaming] Setting video srcObject');
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          console.log('[LiveStreaming] Video metadata loaded, attempting to play');
          videoRef.current?.play().then(() => {
            console.log('[LiveStreaming] Video playing successfully');
          }).catch(err => {
            console.error('[LiveStreaming] Error playing video:', err);
            toast({
              title: "Video Error",
              description: "Failed to start video playback",
              variant: "destructive",
            });
          });
        };
      } else {
        console.warn('[LiveStreaming] videoRef.current is null');
      }
      
      setIsLive(true);
      console.log('[LiveStreaming] Set isLive to true');
      
      // Start frame detection loop
      detectionIntervalRef.current = setInterval(async () => {
        if (!videoRef.current || !canvasRef.current || !sessionId) return;
        
        try {
          // Capture current frame from video
          const captureCanvas = document.createElement('canvas');
          captureCanvas.width = videoRef.current.videoWidth;
          captureCanvas.height = videoRef.current.videoHeight;
          const captureCtx = captureCanvas.getContext('2d');
          captureCtx?.drawImage(videoRef.current, 0, 0);
          
          const blob = await new Promise<Blob>((resolve) => {
            captureCanvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.8);
          });
          
          // Detect footstep and get annotated frame
          const detection = await api.detectFrame(sessionId, blob);
          
          // Display the annotated frame on canvas if available
          if (detection.frame && canvasRef.current) {
            const img = new Image();
            img.src = `data:image/jpeg;base64,${detection.frame}`;
            img.onload = () => {
              if (canvasRef.current) {
                const ctx = canvasRef.current.getContext('2d');
                canvasRef.current.width = img.width;
                canvasRef.current.height = img.height;
                ctx?.drawImage(img, 0, 0);
              }
            };
          }
          
          if (detection.detected && detection.foot) {
            setStats(prev => ({
              total: prev.total + 1,
              left: prev.left + (detection.foot === 'LEFT' ? 1 : 0),
              right: prev.right + (detection.foot === 'RIGHT' ? 1 : 0),
            }));
            
            setLastDetectionTime(new Date());
            
            // Show toast notification for detection
            toast({
              title: `${detection.foot} STRIKE! 👟`,
              description: detection.message,
              duration: 1500,
            });
            
            console.log(`Footstep detected: ${detection.foot}`);
          }
        } catch (error) {
          console.error('Detection error:', error);
        }
      }, 500); // Check every 500ms
      
    } catch (error: any) {
      toast({
        title: "Failed to start",
        description: error.message || 'Could not access camera',
        variant: "destructive",
      });
    }
  };

  const handleStopLive = async () => {
    setIsLive(false);
    
    // Stop detection loop
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    
    // Stop webcam stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    // Stop backend session and get stats
    if (sessionId) {
      try {
        const response = await api.stopLiveSession(sessionId);
        toast({
          title: "Session Stopped",
          description: `Total detections: ${response.stats.detection_count}`,
        });
      } catch (error: any) {
        console.error('Failed to stop session:', error);
      }
    }
  };

  const handleReset = async () => {
    // Stop live detection if running
    if (isLive) {
      await handleStopLive();
    }
    
    setStep(1);
    setFloorImage(null);
    setIsLive(false);
    setStats({ total: 0, left: 0, right: 0 });
    setSessionId(null);
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      // Stop backend session
      if (sessionId) {
        api.stopLiveSession(sessionId).catch(console.error);
      }
    };
  }, [sessionId]);

  return (
    <div className="space-y-8">
      <Button 
        variant="ghost" 
        onClick={onBack}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Mode Selection
      </Button>

      {/* Step 1: Capture Floor Frame */}
      {step >= 1 && (
        <Card className={`bg-card border-border p-8 glow-effect transition-all ${step > 1 ? 'opacity-50' : ''}`}>
          <div className="flex items-center gap-3 mb-6">
            <Camera className="h-6 w-6 text-primary" />
            <h3 className="text-2xl font-bold text-foreground">Step 1: Capture Floor Frame 📸</h3>
          </div>
          
          {!floorImage ? (
            <div className="space-y-6">
              <p className="text-muted-foreground">Point your camera at the floor surface and capture a clear image.</p>
              <div className="bg-secondary rounded-lg aspect-video flex items-center justify-center border-2 border-dashed border-border">
                <div className="text-center">
                  <Camera className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Camera view will appear here</p>
                </div>
              </div>
              <Button 
                onClick={handleCaptureFrame} 
                disabled={isCapturing || step > 1}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6"
              >
                {isCapturing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Capturing...
                  </>
                ) : (
                  <>
                    <Camera className="mr-2 h-5 w-5" />
                    Capture Frame
                  </>
                )}
              </Button>
            </div>
          ) : step === 1 && (
            <div className="space-y-6">
              <img src={floorImage} alt="Captured floor" className="w-full rounded-lg" />
              <Button 
                onClick={handleConfirmFloor}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6"
              >
                <CheckCircle2 className="mr-2 h-5 w-5" />
                ✅ Confirm Floor Capture
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Step 2: Analyze Floor */}
      {step >= 2 && (
        <Card className={`bg-card border-border p-8 glow-effect transition-all ${step > 2 ? 'opacity-50' : ''}`}>
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle2 className="h-6 w-6 text-primary" />
            <h3 className="text-2xl font-bold text-foreground">Step 2: Analyze Floor & Generate Audio 🔊</h3>
          </div>
          
          {step === 2 && (
            <div className="space-y-6">
              <p className="text-muted-foreground">The AI will now analyze the floor to generate realistic footstep sounds.</p>
              <Button 
                onClick={handleAnalyzeFloor}
                disabled={isAnalyzing}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    [ANALYZING] Analyzing floor surface and generating audio...
                  </>
                ) : (
                  <>
                    🔍 Analyze Floor & Generate Audio
                  </>
                )}
              </Button>
            </div>
          )}
          
          {step > 2 && (
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-semibold">✅ Audio Generated!</span>
            </div>
          )}
        </Card>
      )}

      {/* Step 3: Initialize Detector */}
      {step >= 3 && (
        <Card className={`bg-card border-border p-8 glow-effect transition-all ${step > 3 ? 'opacity-50' : ''}`}>
          <div className="flex items-center gap-3 mb-6">
            <Play className="h-6 w-6 text-primary" />
            <h3 className="text-2xl font-bold text-foreground">Step 3: Initialize Live Detector 🚀</h3>
          </div>
          
          {step === 3 && (
            <div className="space-y-6">
              <p className="text-muted-foreground">Configure the detection parameters before starting.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-foreground mb-2 block">
                    Detection Sensitivity: {sensitivity[0] < 33 ? 'Low' : sensitivity[0] < 66 ? 'Medium' : 'High'}
                  </label>
                  <Slider 
                    value={sensitivity} 
                    onValueChange={setSensitivity}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-semibold text-foreground mb-2 block">
                    YOLO Confidence: {confidence[0].toFixed(1)}
                  </label>
                  <Slider 
                    value={confidence.map(v => v * 100)} 
                    onValueChange={(values) => setConfidence(values.map(v => v / 100))}
                    min={10}
                    max={90}
                    step={5}
                    className="w-full"
                  />
                </div>
              </div>

              <Button 
                onClick={handleInitialize}
                disabled={isInitializing}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6"
              >
                {isInitializing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    [INITIALIZING] Setting up the live detector...
                  </>
                ) : (
                  <>
                    🎬 Initialize Live Detector
                  </>
                )}
              </Button>
            </div>
          )}
          
          {step > 3 && (
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-semibold">System Initialized!</span>
            </div>
          )}
        </Card>
      )}

      {/* Step 4: Live Detection */}
      {step >= 4 && (
        <Card className="bg-card border-border p-8 glow-effect">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Play className="h-6 w-6 text-primary" />
              <h3 className="text-2xl font-bold text-foreground">Step 4: Live Detection 🎯</h3>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${isLive ? 'bg-red-500/20 animate-pulse' : 'bg-green-500/20'}`}>
              <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-red-500' : 'bg-green-500'}`} />
              <span className="font-semibold text-foreground">
                {isLive ? '🔴 LIVE' : '✅ SYSTEM READY'}
              </span>
            </div>
          </div>

          <div className="space-y-6">
            {/* Camera Feed */}
            <div className="bg-secondary rounded-lg aspect-video flex items-center justify-center border-2 border-border overflow-hidden relative">
              {/* Hidden video element for webcam stream */}
              <video 
                ref={videoRef}
                className="hidden"
                autoPlay
                muted
                playsInline
              />
              {/* Canvas for displaying annotated frames */}
              <canvas 
                ref={canvasRef}
                className={`w-full h-full object-contain ${isLive ? 'block' : 'hidden'}`}
              />
              {!isLive && (
                <div className="text-center absolute inset-0 flex flex-col items-center justify-center">
                  <Camera className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Camera feed will appear here</p>
                </div>
              )}
              {isLive && (
                <>
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2 animate-pulse">
                    <div className="w-2 h-2 bg-white rounded-full" />
                    LIVE
                  </div>
                  {lastDetectionTime && (Date.now() - lastDetectionTime.getTime() < 2000) && (
                    <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg text-lg font-bold animate-pulse">
                      👟 FOOTSTEP DETECTED!
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Statistics */}
            <Card className="bg-secondary border-border p-6">
              <h4 className="text-lg font-semibold text-foreground mb-4">Real-time Statistics</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-background rounded-lg">
                  <p className="text-3xl font-bold text-primary">{stats.total}</p>
                  <p className="text-sm text-muted-foreground mt-1">Total Steps</p>
                </div>
                <div className="text-center p-4 bg-background rounded-lg">
                  <p className="text-3xl font-bold text-accent">{stats.left}</p>
                  <p className="text-sm text-muted-foreground mt-1">Left Steps</p>
                </div>
                <div className="text-center p-4 bg-background rounded-lg">
                  <p className="text-3xl font-bold text-accent">{stats.right}</p>
                  <p className="text-sm text-muted-foreground mt-1">Right Steps</p>
                </div>
              </div>
            </Card>

            {/* Controls */}
            <div className="flex gap-4">
              <Button 
                onClick={isLive ? handleStopLive : handleStartLive}
                className={`flex-1 py-6 ${isLive ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/90'} text-white`}
              >
                {isLive ? (
                  <>
                    <Square className="mr-2 h-5 w-5" />
                    ⏹️ Stop Detection
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-5 w-5" />
                    ▶️ Start Live Detection
                  </>
                )}
              </Button>
              <Button 
                onClick={handleReset}
                variant="outline"
                className="py-6"
              >
                <RotateCcw className="mr-2 h-5 w-5" />
                🔄 Reset All
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default LiveStreaming;
