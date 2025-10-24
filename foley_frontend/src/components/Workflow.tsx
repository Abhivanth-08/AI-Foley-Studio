import { Brain, Video, Music, Wand2 } from "lucide-react";
import { Card } from "@/components/ui/card";

const Workflow = () => {
  const steps = [
    {
      icon: Video,
      title: "Video Input",
      description: "Upload your video footage. Our system extracts frames for analysis.",
      color: "from-primary/20 to-primary/5"
    },
    {
      icon: Brain,
      title: "AI Analysis",
      description: "LLM analyzes surfaces and environments. MediaPipe detects footstep positions with heel tracking.",
      color: "from-accent/20 to-accent/5"
    },
    {
      icon: Music,
      title: "Audio Matching",
      description: "Smart search finds perfect footstep sounds. Automatically downloads and processes audio clips.",
      color: "from-primary/20 to-primary/5"
    },
    {
      icon: Wand2,
      title: "Real-time Sync",
      description: "Mathematical precision syncs audio with detected footsteps. Perfect timing, every step.",
      color: "from-accent/20 to-accent/5"
    }
  ];

  return (
    <section id="workflow" className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/50 to-background" />
      
      <div className="container relative z-10 max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-20 animate-fade-in-up">
          <h2 className="text-5xl sm:text-6xl font-bold">
            <span className="text-gradient">How It Works</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Four intelligent steps to perfect foley audio synchronization
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <Card className="relative h-full bg-card border-border hover:border-primary/50 transition-all duration-500 p-8 group hover:scale-105">
                {/* Step number */}
                <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <step.icon className="w-8 h-8 text-primary" />
                </div>

                {/* Content */}
                <h3 className="text-2xl font-semibold mb-4 text-foreground">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>

                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
                )}
              </Card>
            </div>
          ))}
        </div>

        {/* Technology badges */}
        <div className="mt-20 flex flex-wrap justify-center gap-4 animate-fade-in">
          {["MediaPipe", "LLM Analysis", "YouTube Audio API", "Real-time Processing"].map((tech, i) => (
            <div
              key={i}
              className="px-6 py-3 rounded-full bg-secondary border border-border text-muted-foreground text-sm font-medium hover:border-primary/50 hover:text-foreground transition-all"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {tech}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Workflow;
