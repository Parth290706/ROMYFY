import { motion } from 'framer-motion';
import { Home, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const StepProcessing = () => {
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
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="w-24 h-24 mx-auto mb-8 rounded-2xl roomyfy-gradient flex items-center justify-center"
          >
            <Sparkles className="h-12 w-12 text-primary-foreground" />
          </motion.div>

          <h1 className="text-2xl font-bold mb-4">Creating Your Design</h1>
          
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 15, ease: 'linear' }}
            className="h-2 bg-primary rounded-full max-w-xs mx-auto mb-4"
          />

          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-muted-foreground"
          >
            AI is analyzing your room and generating suggestions...
          </motion.p>

          <div className="mt-8 space-y-2 text-sm text-muted-foreground">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              ✓ Analyzing room dimensions
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3 }}
            >
              ✓ Applying style preferences
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 5 }}
            >
              ✓ Generating design suggestions
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 7 }}
            >
              ✓ Creating redesigned room image
            </motion.p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepProcessing;
