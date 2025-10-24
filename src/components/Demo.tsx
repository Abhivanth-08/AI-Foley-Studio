import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Video, Webcam } from "lucide-react";
import VideoUpload from "./VideoUpload";
import LiveStreaming from "./LiveStreaming";

const Demo = () => {
  const [mode, setMode] = useState<'selection' | 'video' | 'live'>('selection');

  const handleModeSelect = (selectedMode: 'video' | 'live') => {
    setMode(selectedMode);
  };

  const handleBack = () => {
    setMode('selection');
  };

  return (
    <section id="demo" className="py-32 px-4 sm:px-6 lg:px-8 relative">
      <div className="container max-w-5xl mx-auto relative z-10">
        <div className="text-center space-y-4 mb-16 animate-fade-in-up">
          <h2 className="text-5xl sm:text-6xl font-bold">
            <span className="text-gradient">Try It Live</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {mode === 'selection' 
              ? 'Choose your detection mode and experience AI-powered footstep analysis'
              : mode === 'video'
              ? 'Upload your video and watch AI magic happen in real-time'
              : 'Real-time footstep detection using your webcam'}
          </p>
        </div>

        {mode === 'selection' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
            <Card 
              className="bg-card border-border p-12 glow-effect cursor-pointer transition-all hover:border-primary hover:scale-105 group"
              onClick={() => handleModeSelect('video')}
            >
              <div className="text-center space-y-6">
                <div className="mx-auto w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                  <Video className="w-12 h-12 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-3">Video Upload</h3>
                  <p className="text-muted-foreground">
                    Process pre-recorded video files with advanced AI detection and analysis
                  </p>
                </div>
                <div className="pt-4">
                  <div className="inline-flex items-center gap-2 text-primary font-semibold group-hover:gap-3 transition-all">
                    Get Started
                    <span className="text-xl">→</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card 
              className="bg-card border-border p-12 glow-effect cursor-pointer transition-all hover:border-primary hover:scale-105 group"
              onClick={() => handleModeSelect('live')}
            >
              <div className="text-center space-y-6">
                <div className="mx-auto w-24 h-24 rounded-full bg-accent/20 flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                  <Webcam className="w-12 h-12 text-accent" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-3">Live Streaming</h3>
                  <p className="text-muted-foreground">
                    Real-time detection using your webcam with instant footstep recognition
                  </p>
                </div>
                <div className="pt-4">
                  <div className="inline-flex items-center gap-2 text-accent font-semibold group-hover:gap-3 transition-all">
                    Get Started
                    <span className="text-xl">→</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        ) : mode === 'video' ? (
          <VideoUpload onBack={handleBack} />
        ) : (
          <LiveStreaming onBack={handleBack} />
        )}

        {/* Features Grid */}
        {mode === 'selection' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {[
              { title: "Instant Processing", desc: "Results in under 2 seconds" },
              { title: "High Accuracy", desc: "99% footstep detection rate" },
              { title: "Any Surface", desc: "100+ surface types supported" }
            ].map((feature, i) => (
              <Card 
                key={i} 
                className="bg-secondary border-border p-6 text-center animate-fade-in hover:border-primary/50 transition-all"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Demo;
