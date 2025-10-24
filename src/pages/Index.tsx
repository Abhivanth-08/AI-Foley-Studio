import Hero from "@/components/Hero";
import Workflow from "@/components/Workflow";
import TechnicalDetails from "@/components/TechnicalDetails";
import Demo from "@/components/Demo";
import Features from "@/components/Features";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <Workflow />
      <TechnicalDetails />
      <Demo />
      <Features />
      <Footer />
    </div>
  );
};

export default Index;
