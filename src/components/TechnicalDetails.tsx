import { Card } from "@/components/ui/card";
import { Code2, Database, Cpu, Network, GitBranch, Zap } from "lucide-react";

const TechnicalDetails = () => {
  return (
    <section className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-secondary/30">
      <div className="container relative z-10 max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-20 animate-fade-in-up">
          <h2 className="text-5xl sm:text-6xl font-bold">
            <span className="text-gradient">Technical Deep Dive</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Understanding the technology behind AI-powered foley synchronization
          </p>
        </div>

        {/* YOLO + MediaPipe Detection Pipeline */}
        <div className="mb-20 animate-fade-in">
          <Card className="bg-card border-border p-10">
            <div className="flex items-start gap-6 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                <Network className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-foreground mb-4">
                  YOLO + MediaPipe Detection Pipeline
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="relative">
                <Card className="bg-secondary/50 border-border p-6 h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <Network className="w-6 h-6 text-primary" />
                    <h4 className="text-lg font-semibold text-primary">YOLO ROI Detection</h4>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">Frame Extraction</p>
                    <p className="font-medium text-foreground">Object Detection</p>
                    <p className="font-medium text-foreground">ROI Extraction</p>
                  </div>
                </Card>
                <div className="absolute -right-3 top-1/2 -translate-y-1/2 text-primary hidden md:block">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>

              <div className="relative">
                <Card className="bg-secondary/50 border-border p-6 h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <GitBranch className="w-6 h-6 text-primary" />
                    <h4 className="text-lg font-semibold text-primary">MediaPipe Pose Landmarks</h4>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">ROI Processing</p>
                    <p className="font-medium text-foreground">33 Landmark Points</p>
                    <p className="font-medium text-foreground">3D Coordinates</p>
                  </div>
                </Card>
                <div className="absolute -right-3 top-1/2 -translate-y-1/2 text-primary hidden md:block">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>

              <div>
                <Card className="bg-secondary/50 border-border p-6 h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <Cpu className="w-6 h-6 text-primary" />
                    <h4 className="text-lg font-semibold text-primary">Heel Position Tracking</h4>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">Landmark 29 & 30</p>
                    <p className="font-medium text-foreground">Velocity Calculation</p>
                    <p className="font-medium text-foreground">Contact Detection</p>
                  </div>
                </Card>
              </div>
            </div>
          </Card>
        </div>

        {/* Backend Architecture Section */}
        <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
          <Card className="bg-card border-border p-10">
            <div className="flex items-start gap-6 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center flex-shrink-0">
                <Database className="w-8 h-8 text-accent" />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-foreground mb-4">
                  Backend Processing Architecture
                </h3>
              </div>
            </div>

            <div className="space-y-8 mt-8">
              {/* Processing Pipeline */}
              <div className="space-y-4">
                <h4 className="text-2xl font-semibold text-foreground">Processing Pipeline</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { step: "1. Video Ingestion", items: ["Multipart Upload", "4K Support", "FFmpeg Decoding"] },
                    { step: "2. Frame Analysis", items: ["Parallel Processing", "LLM Vision Model", "Context Extraction"] },
                    { step: "3. Audio Retrieval", items: ["Audio Array", "Save the Array as .wav", "Audio processing"] },
                    { step: "4. Synchronization", items: ["FFmpeg Slicing", "Sub-frame Precision", "Video Rendering"] }
                  ].map((item, i) => (
                    <div key={i} className="relative">
                      <Card className="bg-secondary/50 border-border p-6 h-full">
                        <div className="text-primary font-bold text-lg mb-4">{item.step}</div>
                        <div className="space-y-2">
                          {item.items.map((subItem, j) => (
                            <p key={j} className="text-sm text-muted-foreground font-medium">{subItem}</p>
                          ))}
                        </div>
                      </Card>
                      {i < 3 && (
                        <div className="absolute -right-2 top-1/2 -translate-y-1/2 text-primary hidden md:block">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* System Components */}
              <div className="space-y-6 pt-8">
                <h4 className="text-2xl font-semibold text-foreground">System Components</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="bg-secondary/30 border-border p-6">
                    <h5 className="text-lg font-semibold text-primary mb-4">LLM Vision Service</h5>
                    <div className="space-y-2 text-sm">
                      <p className="text-foreground font-medium">LLAMA Vision</p>
                      <p className="text-foreground font-medium">Frame Analysis</p>
                      <p className="text-foreground font-medium">Surface Detection</p>
                      <p className="text-foreground font-medium">JSON Output</p>
                    </div>
                  </Card>

                  <Card className="bg-secondary/30 border-border p-6">
                    <h5 className="text-lg font-semibold text-primary mb-4">Audio Processing</h5>
                    <div className="space-y-2 text-sm">
                      <p className="text-foreground font-medium">FFmpeg + Pydub</p>
                      <p className="text-foreground font-medium">Audio Extraction</p>
                      <p className="text-foreground font-medium">Normalization</p>
                      <p className="text-foreground font-medium">48kHz Output</p>
                    </div>
                  </Card>

                  <Card className="bg-secondary/30 border-border p-6">
                    <h5 className="text-lg font-semibold text-primary mb-4">LLM Based Audio Fetcher</h5>
                    <div className="space-y-2 text-sm">
                      <p className="text-foreground font-medium">LLM Integration to get audio array</p>
                      <p className="text-foreground font-medium">Search & Filter</p>
                      <p className="text-foreground font-medium">Audio Download</p>
                      <p className="text-foreground font-medium">24h Cache</p>
                    </div>
                  </Card>

                  <Card className="bg-secondary/30 border-border p-6">
                    <h5 className="text-lg font-semibold text-primary mb-4">YOLO + MediaPipe</h5>
                    <div className="space-y-2 text-sm">
                      <p className="text-foreground font-medium">YOLOv8 Detection</p>
                      <p className="text-foreground font-medium">ROI Strategy</p>
                      <p className="text-foreground font-medium">BlazePose 3D</p>
                      <p className="text-foreground font-medium">GPU Accelerated</p>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Tech Stack */}
        <div className="mt-16 text-center animate-fade-in" style={{ animationDelay: '400ms' }}>
          <h4 className="text-xl font-semibold text-foreground mb-6">Technology Stack</h4>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              "Python 3.11",
              "YOLOv8",
              "MediaPipe",
              "FFmpeg",
              "LLAMA Vision",
              "OpenCV",
              "NumPy",
              "Pydub",
              "FastAPI",
              "Docker",
            ].map((tech, i) => (
              <span
                key={i}
                className="px-5 py-2 rounded-full bg-secondary border border-border text-foreground text-sm font-medium hover:border-primary/50 hover:bg-secondary/80 transition-all"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TechnicalDetails;
