import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Sparkles, ScanSearch, Palette, Lightbulb, Image, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const steps = [
  { icon: ScanSearch, label: 'Analyzing room dimensions & layout', duration: 3000 },
  { icon: Palette, label: 'Applying your style preferences', duration: 5000 },
  { icon: Lightbulb, label: 'Generating design suggestions', duration: 8000 },
  { icon: Image, label: 'Creating redesigned room image', duration: 12000 },
];

const tips = [
  'Tip: Higher budget options unlock premium furniture suggestions',
  'Tip: Try "custom" style type to describe your exact vision',
  'Tip: Better lighting in your photo = better AI results',
  'Tip: You can retry generation if the first result isn\'t perfect',
  'Tip: Upload photos from multiple angles for best results',
];

const StepProcessing = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);

  // Progress through steps
  useEffect(() => {
    const timers = steps.map((step, i) =>
      setTimeout(() => setActiveStep(i), step.duration)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  // Elapsed time counter
  useEffect(() => {
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // Rotate tips
  useEffect(() => {
    const interval = setInterval(() => setTipIndex((i) => (i + 1) % tips.length), 5000);
    return () => clearInterval(interval);
  }, []);

  const progressPercent = Math.min(((elapsed / 60) * 100), 95);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b">
        <div className="container mx-auto px-6 py-4">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl roomyfy-gradient flex items-center justify-center">
              <Home className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">ROOMYFY</span>
          </Link>
        </div>
      </header>

      {/* Processing Animation */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md w-full">
          {/* Animated Icon */}
          <motion.div
            animate={{
              scale: [1, 1.08, 1],
              rotate: [0, 180, 360],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 rounded-2xl roomyfy-gradient flex items-center justify-center shadow-lg"
          >
            <Sparkles className="h-10 w-10 sm:h-12 sm:w-12 text-primary-foreground" />
          </motion.div>

          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Creating Your Design</h1>

          {/* Elapsed time */}
          <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground mb-6">
            <Clock className="h-3.5 w-3.5" />
            <span>{elapsed < 60 ? `${elapsed}s` : `${Math.floor(elapsed / 60)}m ${elapsed % 60}s`} elapsed</span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-muted rounded-full h-2.5 mb-8 overflow-hidden">
            <motion.div
              className="h-full rounded-full roomyfy-gradient"
              initial={{ width: '0%' }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>

          {/* Step checklist */}
          <div className="space-y-3 mb-8 text-left">
            {steps.map((step, i) => {
              const StepIcon = step.icon;
              const isActive = i === activeStep;
              const isDone = i < activeStep;

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.3, duration: 0.4 }}
                  className={`flex items-center gap-3 rounded-lg px-4 py-2.5 transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary font-medium'
                      : isDone
                        ? 'text-primary/70'
                        : 'text-muted-foreground/50'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    {isDone ? (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-primary text-lg"
                      >
                        ✓
                      </motion.span>
                    ) : isActive ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      >
                        <StepIcon className="h-5 w-5" />
                      </motion.div>
                    ) : (
                      <StepIcon className="h-5 w-5" />
                    )}
                  </div>
                  <span className="text-sm">{step.label}</span>
                </motion.div>
              );
            })}
          </div>

          {/* Rotating tips */}
          <div className="h-12">
            <AnimatePresence mode="wait">
              <motion.p
                key={tipIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="text-sm text-muted-foreground"
              >
                {tips[tipIndex]}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Long wait message */}
          {elapsed > 30 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-xs text-muted-foreground/70"
            >
              AI image generation can take up to 2 minutes. Please don't close this page.
            </motion.p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StepProcessing;
