import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Home, Palette, Zap, Star, LogIn, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import logo from '@/assets/logo.png';

const Landing = () => {
  const { user, signOut } = useAuth();
  const navigate = (await import('react-router-dom')).useNavigate ? undefined : undefined;
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/50">
        <nav className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 sm:gap-3">
            <img src={logo} alt="ROOMYFY Logo" className="h-10 w-10 sm:h-12 sm:w-12 rounded-full" width={48} height={48} loading="eager" decoding="async" />
            <span className="text-lg sm:text-xl font-bold roomyfy-text-gradient">ROOMYFY</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <>
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm" className="text-sm">Dashboard</Button>
                </Link>
                <Button variant="outline" size="sm" className="text-sm" onClick={() => signOut()}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="text-sm gap-1">
                    <LogIn className="h-4 w-4" /> Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm" className="roomyfy-gradient text-primary-foreground text-sm gap-1">
                    <UserPlus className="h-4 w-4" /> Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 sm:pt-32 pb-12 sm:pb-20 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 w-48 sm:w-96 h-48 sm:h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-1/4 w-40 sm:w-80 h-40 sm:h-80 bg-accent/10 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-4 sm:mb-6"
              >
                <span className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-secondary text-primary text-xs sm:text-sm font-medium roomyfy-border-glow">
                  <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                  AI-Powered Interior Design
                </span>
              </motion.div>
              
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold leading-tight mb-4 sm:mb-6 text-foreground">
                Design Your{' '}
                <span className="roomyfy-text-gradient">Dream Room</span>{' '}
                in Seconds
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-lg mx-auto lg:mx-0">
                Transform your empty rooms into stunning living spaces with AI-powered design suggestions. Upload your photo, choose your style, and watch the magic happen.
              </p>
              <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center lg:justify-start">
                <Link to="/design/new" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto roomyfy-gradient text-primary-foreground text-base sm:text-lg px-6 sm:px-8 font-semibold roomyfy-glow hover:scale-105 transition-transform">
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 sm:h-5 w-4 sm:w-5" />
                  </Button>
                </Link>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 border-border hover:bg-secondary hover:text-primary"
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
              className="relative mt-8 lg:mt-0"
            >
              <div className="aspect-[4/3] rounded-2xl sm:rounded-3xl roomyfy-gradient-soft roomyfy-card-shadow roomyfy-border-glow overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center p-4 sm:p-8">
                    <motion.img 
                      src={logo} 
                      alt="ROOMYFY" 
                      className="w-24 h-24 sm:w-40 sm:h-40 mx-auto mb-4 sm:mb-6 roomyfy-glow rounded-full"
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
                    <p className="text-muted-foreground text-sm sm:text-lg">Design Your Room in Seconds</p>
                  </div>
                </div>
              </div>
              
              {/* Floating decorative elements - hidden on mobile */}
              <motion.div 
                className="hidden sm:block absolute -top-4 -right-4 w-20 h-20 rounded-2xl roomyfy-gradient opacity-80"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div 
                className="hidden sm:block absolute -bottom-6 -left-6 w-16 h-16 rounded-xl bg-accent/60"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="how-it-works" className="py-12 sm:py-20 bg-card/50">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-foreground">
              How It <span className="roomyfy-text-gradient">Works</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg px-4">
              Transform any room in just a few simple steps
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
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
                className="relative p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-card roomyfy-card-shadow roomyfy-border-glow text-center group hover:scale-105 transition-transform duration-300"
              >
                <div className="absolute -top-2 -left-2 sm:-top-3 sm:-left-3 w-8 h-8 sm:w-10 sm:h-10 rounded-full roomyfy-gradient flex items-center justify-center text-primary-foreground font-bold text-xs sm:text-sm">
                  {feature.step}
                </div>
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 rounded-xl sm:rounded-2xl roomyfy-gradient flex items-center justify-center group-hover:scale-110 transition-transform">
                  <feature.icon className="h-6 w-6 sm:h-8 sm:w-8 text-primary-foreground" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-foreground">{feature.title}</h3>
                <p className="text-sm sm:text-base text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-12 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-foreground">
              Loved by <span className="roomyfy-text-gradient">Users</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg">
              See what our community is saying about ROOMYFY
            </p>
          </motion.div>

          <div className="flex justify-center mb-8">
            <Link to="/reviews">
              <Button variant="outline" size="lg" className="gap-2">
                <Star className="h-5 w-5 text-primary" />
                View All Reviews & Share Yours
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative roomyfy-gradient rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center overflow-hidden"
          >
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-24 sm:w-40 h-24 sm:h-40 border border-primary-foreground/30 rounded-full -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-32 sm:w-60 h-32 sm:h-60 border border-primary-foreground/30 rounded-full translate-x-1/4 translate-y-1/4" />
            </div>
            
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-foreground mb-3 sm:mb-4">
                Ready to Transform Your Space?
              </h2>
              <p className="text-primary-foreground/80 mb-6 sm:mb-8 max-w-lg mx-auto text-base sm:text-lg px-4">
                Join thousands of users who have redesigned their homes with ROOMYFY
              </p>
              <Link to="/design/new">
                <Button size="lg" className="bg-background text-foreground hover:bg-background/90 text-base sm:text-lg px-6 sm:px-8 font-semibold">
                  Start Designing Now
                  <ArrowRight className="ml-2 h-4 sm:h-5 w-4 sm:w-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 sm:py-8 border-t border-border/50">
        <div className="container mx-auto px-4 sm:px-6 flex flex-col items-center justify-between gap-3 sm:gap-4 md:flex-row">
          <div className="flex items-center gap-2 sm:gap-3">
            <img src={logo} alt="ROOMYFY" className="h-6 w-6 sm:h-8 sm:w-8 rounded-full" width={32} height={32} loading="lazy" decoding="async" />
            <span className="text-xs sm:text-sm text-muted-foreground">© 2024 ROOMYFY. All rights reserved.</span>
          </div>
          <p className="text-xs sm:text-sm roomyfy-text-gradient font-medium">Design Your Room in Seconds</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
