import { Button } from "@/commons/components/button.tsx";
import { Card } from "@/commons/components/card.tsx";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const NotFoundPage = () => {
  const navigate = useNavigate();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const floatingVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-background via-background/90 to-primary/20">
      {/* Animated background bubbles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-primary/5"
          style={{
            width: Math.random() * 100 + 50,
            height: Math.random() * 100 + 50,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            scale: [1, 1.1, 1],
            rotate: [0, 360],
          }}
          transition={{
            duration: Math.random() * 5 + 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 2,
          }}
        />
      ))}

      {/* Main content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-0 flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12"
      >
        <AnimatePresence>
          <motion.div
            className="text-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* 404 Text with gradient */}
            <motion.h1
              className="text-[6rem] sm:text-[8rem] md:text-[10rem] lg:text-[12rem] xl:text-[14rem] font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/50 to-primary mb-2"
              animate={{
                textShadow: ['0 0 20px rgba(var(--primary), 0.3)', '0 0 40px rgba(var(--primary), 0.6)', '0 0 20px rgba(var(--primary), 0.3)']
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              404
            </motion.h1>

            {/* Decorative line */}
            <motion.div
              className="h-1 w-20 sm:w-40 md:w-60 lg:w-80 xl:w-96 mx-auto rounded-full bg-gradient-to-r from-transparent via-primary to-transparent mb-8"
              animate={{
                scaleX: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />

            {/* Glass card effect */}
            <Card className="max-w-lg mx-auto p-8 backdrop-blur-xl bg-background/40 border-primary/20 shadow-lg shadow-primary/10">
              <motion.div variants={floatingVariants}>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-foreground/90">
                  Page Not Found
                </h2>
                <p className="text-sm sm:text-lg md:text-xl text-muted-foreground mb-8">
                  The page you're looking for seems to have vanished into the digital void...
                </p>
                <Button
                  onClick={() => navigate("/")}
                  className="min-w-[150px] sm:min-w-[200px] bg-primary/90 hover:bg-primary transition-all duration-300"
                  size="lg"
                >
                  Return to Safety
                </Button>
              </motion.div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;