import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, Play, Loader2, CheckCircle2, Video, Music, Download, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api, ProcessingResult } from "@/services/api";

interface VideoUploadProps {
  onBack: () => void;
}

const VideoUpload = ({ onBack }: VideoUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processed, setProcessed] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<'idle' | 'detecting' | 'annotating' | 'audio'>('idle');
  const [taskId, setTaskId] = useState<string | null>(null);
  const [results, setResults] = useState<ProcessingResult | null>(null);
  const [annotatedVideoReady, setAnnotatedVideoReady] = useState(false);
  const [audioVideoReady, setAudioVideoReady] = useState(false);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const addLog = (message: string) => {
    setLogs(prev => [...prev, message]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type.startsWith('video/')) {
      setFile(selectedFile);
      setProcessed(false);
      setLogs([]);
      setProgress(0);
      toast({
        title: "Video uploaded",
        description: `${selectedFile.name} is ready to process`,
      });
    } else {
      toast({
        title: "Invalid file",
        description: "Please upload a video file",
        variant: "destructive",
      });
    }
  };

  const handleProcess = async () => {
    if (!file) return;
    
    setProcessing(true);
    setStage('detecting');
    setLogs([]);
    setProgress(0);
    
    try {
      addLog("[INFO] Uploading video to server...");
      
      // Upload video
      const uploadResponse = await api.uploadVideo(file, {
        sensitivity: 'medium',
        yolo_conf: 0.5,
        use_hybrid: true,
        create_annotated: true,
        add_audio: true,
        surface_type: 'concrete'
      });
      
      const newTaskId = uploadResponse.task_id;
      setTaskId(newTaskId);
      
      addLog(`[INFO] Video uploaded successfully. Task ID: ${newTaskId}`);
      addLog("[INFO] Running Hybrid YOLO-MediaPipe Pipeline...");
      
      // Start processing
      await api.processVideo(newTaskId);
      addLog("[INFO] Processing started...");
      addLog("[INFO] YOLO detector loading...");
      addLog("[INFO] MediaPipe pose estimator loading...");
      
      // Poll for status
      let lastProgress = 0;
      pollIntervalRef.current = setInterval(async () => {
        try {
          const status = await api.getTaskStatus(newTaskId);
          const currentProgress = Math.round(status.progress * 100);
          
          if (currentProgress > lastProgress) {
            setProgress(currentProgress);
            lastProgress = currentProgress;
            
            if (currentProgress < 100) {
              addLog(`[INFO] Processing... ${currentProgress}% complete`);
            }
          }
          
          if (status.status === 'completed') {
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
            
            setProgress(100);
            setProcessing(false);
            setProcessed(true);
            setStage('idle');
            setResults(status.results || null);
            
            if (status.results) {
              addLog(`[SUCCESS] Footstep detection complete! Found ${status.results.events.length} events.`);
              addLog(`[STATS] YOLO Detections: ${status.results.detection_stats.yolo_detections}/${status.results.detection_stats.total_frames}`);
              addLog(`[STATS] Pose Detections: ${status.results.detection_stats.pose_detections}/${status.results.detection_stats.total_frames}`);
              addLog(`[INFO] Video FPS: ${status.results.fps.toFixed(2)}`);
              addLog(`[INFO] Total Frames: ${status.results.total_frames}`);
            }
            
            toast({
              title: "Detection complete!",
              description: `Found ${status.results?.events.length || 0} footstep events`,
            });
          } else if (status.status === 'failed') {
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
            
            addLog(`[ERROR] Processing failed: ${status.error || 'Unknown error'}`);
            setProcessing(false);
            
            toast({
              title: "Processing failed",
              description: status.error || 'Unknown error occurred',
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error('Status poll error:', error);
        }
      }, 1000);
      
    } catch (error: any) {
      addLog(`[ERROR] ${error.message || 'Failed to process video'}`);
      setProcessing(false);
      
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      
      toast({
        title: "Error",
        description: error.message || 'Failed to process video',
        variant: "destructive",
      });
    }
  };

  const handleAnnotate = async () => {
    if (!taskId) return;
    
    setStage('annotating');
    setProgress(0);
    addLog("[PROCESSING] Generating annotated video... Please wait.");
    
    try {
      await api.generateVideo(taskId);
      
      // Poll for video status
      const pollInterval = setInterval(async () => {
        try {
          const videoStatus = await api.getVideoStatus(taskId);
          
          // Use actual progress from backend
          if (videoStatus.video_progress !== undefined) {
            const progressPercent = Math.round(videoStatus.video_progress * 100);
            setProgress(progressPercent);
            
            if (progressPercent > 0 && progressPercent < 100 && progressPercent % 10 === 0) {
              addLog(`[PROCESSING] Video generation: ${progressPercent}% complete`);
            }
          }
          
          if (videoStatus.video_ready) {
            clearInterval(pollInterval);
            setProgress(100);
            addLog("[SUCCESS] Annotated video is ready for viewing and download.");
            setAnnotatedVideoReady(true);
            setStage('idle');
            toast({
              title: "Video ready!",
              description: "Annotated video is ready to download",
            });
          } else if (videoStatus.video_error) {
            clearInterval(pollInterval);
            addLog(`[ERROR] ${videoStatus.video_error}`);
            setStage('idle');
            toast({
              title: "Error",
              description: videoStatus.video_error,
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error('Video status poll error:', error);
        }
      }, 500);
      
    } catch (error: any) {
      addLog(`[ERROR] ${error.message || 'Failed to generate video'}`);
      setStage('idle');
      toast({
        title: "Error",
        description: error.message || 'Failed to generate annotated video',
        variant: "destructive",
      });
    }
  };

  const handleGenerateAudio = async () => {
    if (!taskId) return;
    
    setStage('audio');
    setProgress(0);
    addLog("[PROCESSING] Generating footstep audio based on surface analysis...");
    
    try {
      await api.generateAudioVideo(taskId);
      
      // Poll for audio video status
      const pollInterval = setInterval(async () => {
        try {
          const audioVideoStatus = await api.getAudioVideoStatus(taskId);
          
          // Use actual progress from backend
          if (audioVideoStatus.audio_video_progress !== undefined) {
            const progressPercent = Math.round(audioVideoStatus.audio_video_progress * 100);
            setProgress(progressPercent);
            
            if (progressPercent === 30) {
              addLog("[PROCESSING] Audio track generated...");
            } else if (progressPercent === 70) {
              addLog("[PROCESSING] Merging audio with video...");
            }
          }
          
          if (audioVideoStatus.audio_video_ready) {
            clearInterval(pollInterval);
            setProgress(100);
            addLog("[SUCCESS] Final video with audio is ready!");
            setAudioVideoReady(true);
            setStage('idle');
            toast({
              title: "Audio video ready!",
              description: "Your video now has realistic footstep sounds",
            });
          } else if (audioVideoStatus.audio_video_error) {
            clearInterval(pollInterval);
            addLog(`[ERROR] ${audioVideoStatus.audio_video_error}`);
            setStage('idle');
            toast({
              title: "Error",
              description: audioVideoStatus.audio_video_error,
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error('Audio video status poll error:', error);
        }
      }, 1000);  // Poll every 1 second
      
    } catch (error: any) {
      addLog(`[ERROR] ${error.message || 'Failed to generate audio'}`);
      setStage('idle');
      toast({
        title: "Error",
        description: error.message || 'Failed to generate audio video',
        variant: "destructive",
      });
    }
  };

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

      <Card className="bg-card border-border p-8 sm:p-12 glow-effect">
        <div className="space-y-8">
          {/* Upload Area */}
          <div className="relative">
            <input
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              className="hidden"
              id="video-upload"
            />
            <label
              htmlFor="video-upload"
              className="flex flex-col items-center justify-center border-2 border-dashed border-border hover:border-primary/50 rounded-2xl p-12 cursor-pointer transition-all group hover:bg-secondary/50"
            >
              <Upload className="w-16 h-16 text-muted-foreground group-hover:text-primary transition-colors mb-4" />
              <p className="text-lg font-semibold text-foreground mb-2">
                {file ? file.name : "Click to upload video"}
              </p>
              <p className="text-sm text-muted-foreground">
                Supports MP4, MOV, AVI formats
              </p>
            </label>
          </div>

          {/* Process Button */}
          {file && !processed && (
            <Button
              onClick={handleProcess}
              disabled={processing}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg font-semibold"
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-5 w-5" />
                  🚀 Process Video
                </>
              )}
            </Button>
          )}

          {/* Status Console */}
          {logs.length > 0 && (
            <Card className="bg-secondary border-border p-6 animate-fade-in">
              <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Status Console
              </h3>
              <div className="space-y-2 font-mono text-sm max-h-64 overflow-y-auto">
                {logs.map((log, i) => (
                  <div 
                    key={i} 
                    className={`${
                      log.includes('SUCCESS') ? 'text-green-400' : 
                      log.includes('ERROR') ? 'text-red-400' : 
                      log.includes('STATS') ? 'text-blue-400' : 
                      'text-muted-foreground'
                    }`}
                  >
                    {log}
                  </div>
                ))}
              </div>
              {stage !== 'idle' && (
                <div className="mt-4">
                  <Progress value={progress} className="h-2" />
                </div>
              )}
            </Card>
          )}

          {/* Results Actions */}
          {processed && stage === 'idle' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
              <Button
                onClick={handleAnnotate}
                disabled={annotatedVideoReady}
                className="bg-primary hover:bg-primary/90 text-primary-foreground py-6"
              >
                {annotatedVideoReady ? (
                  <>
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    ✅ Annotated Video Ready
                  </>
                ) : (
                  <>
                    <Video className="mr-2 h-5 w-5" />
                    Create Annotated Video
                  </>
                )}
              </Button>
              <Button
                onClick={handleGenerateAudio}
                disabled={audioVideoReady}
                className="bg-accent hover:bg-accent/90 text-accent-foreground py-6"
              >
                {audioVideoReady ? (
                  <>
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    ✅ Audio Video Ready
                  </>
                ) : (
                  <>
                    <Music className="mr-2 h-5 w-5" />
                    Generate with Audio
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Download Section */}
          {processed && (
            <Card className="bg-secondary border-border p-6 animate-fade-in">
              <h3 className="text-lg font-semibold mb-4 text-foreground">Download Results</h3>
              <div className="space-y-3">
                {/* Detection Data CSV */}
                <div className="flex items-center justify-between p-4 bg-background rounded-lg">
                  <div>
                    <p className="font-semibold text-foreground">Detection Data (CSV)</p>
                    <p className="text-sm text-muted-foreground">CSV format with timestamps</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => taskId && api.exportCSV(taskId)}
                    disabled={!taskId}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>

                {/* Detection Data JSON */}
                <div className="flex items-center justify-between p-4 bg-background rounded-lg">
                  <div>
                    <p className="font-semibold text-foreground">Detection Data (JSON)</p>
                    <p className="text-sm text-muted-foreground">JSON format with all details</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => taskId && api.exportJSON(taskId)}
                    disabled={!taskId}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>

                {/* Annotated Video Download */}
                {annotatedVideoReady && (
                  <div className="flex items-center justify-between p-4 bg-background rounded-lg border-2 border-primary/50 animate-fade-in">
                    <div>
                      <p className="font-semibold text-foreground flex items-center gap-2">
                        <Video className="h-4 w-4 text-primary" />
                        Annotated Video
                      </p>
                      <p className="text-sm text-muted-foreground">Video with footstep markers and labels</p>
                    </div>
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => taskId && api.downloadVideo(taskId)}
                      disabled={!taskId}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Video
                    </Button>
                  </div>
                )}

                {/* Audio Video Download */}
                {audioVideoReady && (
                  <div className="flex items-center justify-between p-4 bg-background rounded-lg border-2 border-accent/50 animate-fade-in">
                    <div>
                      <p className="font-semibold text-foreground flex items-center gap-2">
                        <Music className="h-4 w-4 text-accent" />
                        Video with Audio
                      </p>
                      <p className="text-sm text-muted-foreground">Video with generated footstep sounds</p>
                    </div>
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => taskId && api.downloadAudioVideo(taskId)}
                      disabled={!taskId}
                      className="bg-accent hover:bg-accent/90"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Video with Audio
                    </Button>
                  </div>
                )}

                {/* Detection Summary */}
                {results && (
                  <div className="p-4 bg-background rounded-lg">
                    <p className="font-semibold text-foreground mb-2">Detection Summary</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Total Events:</span>
                        <span className="ml-2 font-semibold text-foreground">{results.events.length}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Left Foot:</span>
                        <span className="ml-2 font-semibold text-foreground">
                          {results.events.filter(e => e.foot === 'LEFT').length}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Right Foot:</span>
                        <span className="ml-2 font-semibold text-foreground">
                          {results.events.filter(e => e.foot === 'RIGHT').length}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Avg Confidence:</span>
                        <span className="ml-2 font-semibold text-foreground">
                          {(results.events.reduce((sum, e) => sum + e.confidence, 0) / results.events.length * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </Card>
    </div>
  );
};

export default VideoUpload;
