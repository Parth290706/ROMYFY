import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Home, Palette, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import logo from '@/assets/logo.png';

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/50">
        <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="ROOMYFY Logo" className="h-12 w-12 rounded-full" width={48} height={48} loading="eager" decoding="async" />
            <span className="text-xl font-bold roomyfy-text-gradient">ROOMYFY</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" className="text-foreground hover:text-primary">Login</Button>
            </Link>
            <Link to="/signup">
              <Button className="roomyfy-gradient text-primary-foreground font-semibold">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-6"
              >
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-primary text-sm font-medium roomyfy-border-glow">
                  <Sparkles className="h-4 w-4" />
                  AI-Powered Interior Design
                </span>
              </motion.div>
              
              <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6 text-foreground">
                Design Your{' '}
                <span className="roomyfy-text-gradient">Dream Room</span>{' '}
                in Seconds
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-lg">
                Transform your empty rooms into stunning living spaces with AI-powered design suggestions. Upload your photo, choose your style, and watch the magic happen.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/signup">
                  <Button size="lg" className="roomyfy-gradient text-primary-foreground text-lg px-8 font-semibold roomyfy-glow hover:scale-105 transition-transform">
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-lg px-8 border-border hover:bg-secondary hover:text-primary"
                  onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Learn More
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="aspect-[4/3] rounded-3xl roomyfy-gradient-soft roomyfy-card-shadow roomyfy-border-glow overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center p-8">
                    <motion.img 
                      src={logo} 
                      alt="ROOMYFY" 
                      className="w-40 h-40 mx-auto mb-6 roomyfy-glow rounded-full"
                      width={160}
                      height={160}
                      loading="lazy"
                      decoding="async"
                      animate={{ 
                        boxShadow: [
                          "0 0 30px -5px hsl(35 75% 55% / 0.4)",
                          "0 0 50px -5px hsl(35 75% 55% / 0.6)",
                          "0 0 30px -5px hsl(35 75% 55% / 0.4)"
                        ]
                      }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <p className="text-muted-foreground text-lg">Design Your Room in Seconds</p>
                  </div>
                </div>
              </div>
              
              {/* Floating decorative elements */}
              <motion.div 
                className="absolute -top-4 -right-4 w-20 h-20 rounded-2xl roomyfy-gradient opacity-80"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div 
                className="absolute -bottom-6 -left-6 w-16 h-16 rounded-xl bg-accent/60"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="how-it-works" className="py-20 bg-card/50">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              How It <span className="roomyfy-text-gradient">Works</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Transform any room in just a few simple steps
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Home,
                title: 'Upload Your Room',
                description: 'Take a photo of your empty room and upload it to get started.',
                step: '01'
              },
              {
                icon: Palette,
                title: 'Choose Your Style',
                description: 'Select your preferred mood, design type, and budget range.',
                step: '02'
              },
              {
                icon: Zap,
                title: 'Get AI Designs',
                description: 'Our AI generates beautiful design suggestions tailored to your space.',
                step: '03'
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative p-8 rounded-3xl bg-card roomyfy-card-shadow roomyfy-border-glow text-center group hover:scale-105 transition-transform duration-300"
              >
                <div className="absolute -top-3 -left-3 w-10 h-10 rounded-full roomyfy-gradient flex items-center justify-center text-primary-foreground font-bold text-sm">
                  {feature.step}
                </div>
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl roomyfy-gradient flex items-center justify-center group-hover:scale-110 transition-transform">
                  <feature.icon className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative roomyfy-gradient rounded-3xl p-12 text-center overflow-hidden"
          >
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-40 h-40 border border-primary-foreground/30 rounded-full -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-60 h-60 border border-primary-foreground/30 rounded-full translate-x-1/4 translate-y-1/4" />
            </div>
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                Ready to Transform Your Space?
              </h2>
              <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto text-lg">
                Join thousands of users who have redesigned their homes with ROOMYFY
              </p>
              <Link to="/signup">
                <Button size="lg" className="bg-background text-foreground hover:bg-background/90 text-lg px-8 font-semibold">
                  Start Designing Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border/50">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="ROOMYFY" className="h-8 w-8 rounded-full" width={32} height={32} loading="lazy" decoding="async" />
            <span className="text-sm text-muted-foreground">© 2024 ROOMYFY. All rights reserved.</span>
          </div>
          <p className="text-sm roomyfy-text-gradient font-medium">Design Your Room in Seconds</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
