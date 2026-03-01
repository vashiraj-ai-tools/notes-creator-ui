'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Lottie to prevent SSR issues (Lottie requires window)
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

const LOADING_MESSAGES = [
  "Initializing AI Core...",
  "Watching the video (at 100x speed)...",
  "Extracting core concepts...",
  "Synthesizing knowledge...",
  "Cross-referencing details...",
  "Formatting beautiful Markdown...",
  "Applying final polish..."
];

export default function DynamicLoader({ jobStatus }) {
  const [messageIndex, setMessageIndex] = useState(0);

  // Custom message if it's pending vs running
  const isPending = jobStatus === 'pending';

  useEffect(() => {
    if (isPending) return;
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2800); // Change message every 2.8 seconds
    return () => clearInterval(interval);
  }, [isPending]);

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-surface/40 backdrop-blur-md border border-border/50 rounded-2xl mt-8 shadow-2xl animate-in fade-in zoom-in-95 duration-700 max-w-lg mx-auto w-full relative overflow-hidden group">
      {/* Cool background glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary/20 blur-[80px] rounded-full pointer-events-none group-hover:bg-primary/30 transition-colors duration-1000"></div>

      {/* Lottie Animation container */}
      <div className="w-48 h-48 relative z-10 -mt-6">
        <Lottie
          animationData={null}
          onDOMLoaded={() => console.log('Lottie loaded')}
          path="https://assets3.lottiefiles.com/packages/lf20_q7uarxsb.json"
          loop={true}
          autoplay={true}
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* Rotating statuses */}
      <div className="relative h-8 w-full text-center z-10 mt-2 overflow-hidden">
        <p
          key={isPending ? 'pending' : messageIndex}
          className="text-lg font-medium text-foreground/90 animate-in slide-in-from-bottom-3 fade-in duration-500 absolute w-full"
        >
          {isPending ? 'Queued for processing...' : LOADING_MESSAGES[messageIndex]}
        </p>
      </div>

      {/* Progress indicator */}
      <div className="w-48 h-1.5 bg-border/50 rounded-full mt-6 overflow-hidden relative z-10">
        <div className="absolute top-0 h-full w-1/3 bg-gradient-to-r from-primary to-indigo-500 rounded-full animate-[pulse_1s_ease-in-out_infinite_alternate]" style={{ left: '0%', animation: 'slideRight 2s ease-in-out infinite alternate' }}></div>
        <style jsx>{`
            @keyframes slideRight {
              0% { left: -10%; width: 20%; }
              50% { width: 50%; left: 25%; }
              100% { left: 90%; width: 20%; }
            }
         `}</style>
      </div>

      <p className="text-sm text-foreground/50 mt-5 z-10 text-center">
        {isPending ? "Hold tight! We'll start generating as soon as possible." : "This usually takes about 15-30 seconds. Sit back and relax."}
      </p>
    </div>
  );
}
