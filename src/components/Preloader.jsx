import { useEffect, useState, useRef } from "react";

const Preloader = ({ onFinished }) => {
  const [fadeOut, setFadeOut] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentLine, setCurrentLine] = useState(0);
  const containerRef = useRef(null);
  
  // Text lines that will appear one by one
  const lines = [
    "INITIALIZING",
    "WELCOME TO",
    "VIBEZ"
  ];
  
  useEffect(() => {
    // Line animation sequence
    const lineInterval = setInterval(() => {
      if (currentLine < lines.length - 1) {
        setCurrentLine(prev => prev + 1);
      } else {
        clearInterval(lineInterval);
      }
    }, 800);
    
    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const next = prev + 1;
        return next <= 100 ? next : 100;
      });
    }, 30);
    
    // Start fade out animation after all lines appear
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 3500);
    
    // Complete the loading after fade animation
    const completeTimer = setTimeout(() => {
      onFinished();
    }, 4000);
    
    return () => {
      clearInterval(lineInterval);
      clearInterval(progressInterval);
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onFinished, currentLine, lines.length]);
  
  // Random glitch effect
  useEffect(() => {
    if (!containerRef.current) return;
    
    const glitchInterval = setInterval(() => {
      const element = containerRef.current;
      if (Math.random() > 0.8 && element) {
        element.classList.add("glitch-effect");
        setTimeout(() => {
          if (element) element.classList.remove("glitch-effect");
        }, 150);
      }
    }, 500);
    
    return () => clearInterval(glitchInterval);
  }, []);
  
  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black z-50 transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <div 
        ref={containerRef}
        className="flex flex-col items-center justify-center w-full h-full relative overflow-hidden"
      >
        {/* Vertical lines decoration */}
        <div className="absolute inset-0 w-full h-full overflow-hidden opacity-10">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-white"
              style={{
                width: '1px',
                height: '100%',
                left: `${i * 5}%`,
                opacity: Math.random() * 0.5 + 0.2,
              }}
            ></div>
          ))}
        </div>
        
        {/* Horizontal scan line */}
        <div 
          className="absolute w-full h-px bg-white opacity-50"
          style={{
            top: `${progress}%`,
            boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)',
            transition: 'top 0.1s linear'
          }}
        ></div>
        
        {/* Main content container */}
        <div className="relative flex flex-col items-center space-y-6 px-8 max-w-md w-full">
          {/* Text lines container */}
          <div className="h-32 flex flex-col items-center justify-center w-full">
            {lines.map((line, index) => (
              <div 
                key={index}
                className={`font-mono text-center transition-all duration-500 w-full ${
                  index === currentLine ? "text-4xl font-bold text-white" : 
                  index < currentLine ? "text-sm text-gray-500 -mb-1" : "opacity-0 absolute"
                }`}
              >
                {line}
              </div>
            ))}
          </div>
          
          {/* Vertical progress bar */}
          <div className="w-1 h-32 bg-gray-800 relative overflow-hidden mx-auto my-4">
            <div 
              className="absolute bottom-0 w-full bg-white"
              style={{ 
                height: `${progress}%`,
                boxShadow: '0 0 8px rgba(255, 255, 255, 0.8)'
              }}
            ></div>
          </div>
          
          {/* Progress percentage */}
          <div className="font-mono text-white text-xl w-full text-center">
            {progress}%
          </div>
          
          {/* Abstract geometric design */}
          <div className="relative w-32 h-32 mt-8">
            <div className="absolute inset-0 border border-white opacity-30"></div>
            <div 
              className="absolute" 
              style={{ 
                top: '50%', 
                left: '50%', 
                width: '60%', 
                height: '60%', 
                transform: 'translate(-50%, -50%) rotate(45deg)',
                border: '1px solid white',
                opacity: 0.6
              }}
            ></div>
            <div 
              className="absolute" 
              style={{ 
                top: '50%', 
                left: '50%', 
                width: '30%', 
                height: '30%', 
                transform: `translate(-50%, -50%) rotate(${progress * 3.6}deg)`,
                borderRight: '2px solid white',
                borderBottom: '2px solid white',
                opacity: 0.8
              }}
            ></div>
          </div>
        </div>
        
        {/* Credits line */}
        <div className="absolute bottom-8 font-mono text-xs text-gray-600">
          SHARE YOUR THOUGHTS
        </div>
      </div>
    </div>
  );
};

export default Preloader;