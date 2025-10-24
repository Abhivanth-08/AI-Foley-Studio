import { Card } from "@/components/ui/card";
import { Zap, Target, Cpu, Gauge } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Process videos in real-time with sub-2-second latency. No more waiting hours for manual foley work.",
      stats: "10x faster than traditional methods"
    },
    {
      icon: Target,
      title: "Pixel-Perfect Sync",
      description: "Mathematical precision using MediaPipe heel tracking ensures every footstep is perfectly timed.",
      stats: "Precision timing"
    },
    {
      icon: Cpu,
      title: "Smart Surface Detection",
      description: "Advanced LLM analyzes environments to match the perfect audio for concrete, wood, gravel, and 100+ surfaces.",
      stats: "Autonomous surface selection"
    },
    {
      icon: Gauge,
      title: "Production Ready",
      description: "Professional-grade output ready for cinema, TV, and streaming. Supports all major video formats.",
      stats: "Cinema-quality audio"
    }
  ];

  return (
    <section className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary to-background" />
      
      <div className="container relative z-10 max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-20 animate-fade-in-up">
          <h2 className="text-5xl sm:text-6xl font-bold">
            <span className="text-gradient">Powerful Features</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Built for professionals, optimized for perfection
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="bg-card border-border p-10 group hover:border-primary/50 transition-all duration-500 hover:scale-[1.02] animate-fade-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="space-y-6">
                {/* Icon */}
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <feature.icon className="w-10 h-10 text-primary" />
                  </div>
                  <div className="absolute inset-0 w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 blur-xl opacity-0 group-hover:opacity-50 transition-opacity" />
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="pt-4">
                    <span className="inline-block px-4 py-2 rounded-full bg-secondary text-primary text-sm font-semibold">
                      {feature.stats}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
