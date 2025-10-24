const Footer = () => {
  return (
    <footer className="relative py-16 px-4 sm:px-6 lg:px-8 border-t border-border">
      <div className="container max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gradient">AI Foley Studio</h3>
            <p className="text-muted-foreground">
              Revolutionary AI-powered audio syncing for the future of cinema production.
            </p>
          </div>

          {/* Technology */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Technology</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li className="hover:text-primary transition-colors cursor-pointer">MediaPipe Integration</li>
              <li className="hover:text-primary transition-colors cursor-pointer">LLM Analysis</li>
              <li className="hover:text-primary transition-colors cursor-pointer">Real-time Processing</li>
              <li className="hover:text-primary transition-colors cursor-pointer">Audio Synthesis</li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Resources</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li className="hover:text-primary transition-colors cursor-pointer">Documentation</li>
              <li className="hover:text-primary transition-colors cursor-pointer">API Reference</li>
              <li className="hover:text-primary transition-colors cursor-pointer">Support</li>
              <li className="hover:text-primary transition-colors cursor-pointer">Contact</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border text-center text-muted-foreground">
          <p>© 2024 AI Foley Studio. Revolutionizing foley audio production.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
