'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import * as LoadingJson from "./loading.json";

// Dynamically import Lottie to prevent SSR issues (Lottie requires window)
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

const VIDEO_MESSAGES = [
  "Initializing YouTube Transcriber...",
  "Watching the video content...",
  "Extracting core concepts from audio...",
  "Summarizing video segments...",
  "Formatting structure for notes...",
  "Finalizing your revision guide..."
];

const BLOG_MESSAGES = [
  "Initializing Article Reader...",
  "Analyzing blog post structure...",
  "Extracting key insights from text...",
  "Synthesizing blog content...",
  "Structuring revision notes...",
  "Polishing final takeaways..."
];

export default function DynamicLoader({ jobStatus, sourceType = 'youtube' }) {
  const [messageIndex, setMessageIndex] = useState(0);
  const messages = sourceType === 'youtube' ? VIDEO_MESSAGES : BLOG_MESSAGES;

  // Custom message if it's pending vs running
  const isPending = jobStatus === 'pending';

  useEffect(() => {
    if (isPending) return;
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2500); // Change message every 2.5 seconds
    return () => clearInterval(interval);
  }, [isPending, messages.length]);

  return (
    <div className="flex flex-col items-center justify-center p-10 bg-surface/40 backdrop-blur-md border border-border/50 rounded-3xl mt-8 shadow-2xl animate-in fade-in zoom-in-95 duration-700 max-w-lg mx-auto w-full relative overflow-hidden group">
      {/* Cool background glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 blur-[100px] rounded-full pointer-events-none group-hover:bg-primary/30 transition-colors duration-1000"></div>

      {/* Lottie Animation container */}
      <div className="w-56 h-56 relative z-10 -mt-10 mb-2">
        <Lottie
          animationData={LoadingJson.default}
          loop={true}
          autoplay={true}
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* Rotating statuses */}
      <div className="relative h-10 w-full text-center z-10 overflow-hidden">
        <p
          key={isPending ? 'pending' : `${sourceType}-${messageIndex}`}
          className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent animate-in slide-in-from-bottom-4 fade-in duration-500 absolute w-full"
        >
          {isPending ? 'Queued for processing...' : messages[messageIndex]}
        </p>
      </div>

      {/* Progress indicator */}
      <div className="w-56 h-2 bg-border/40 rounded-full mt-8 overflow-hidden relative z-10">
        <div className="absolute top-0 h-full w-1/4 bg-gradient-to-r from-primary via-indigo-400 to-blue-400 rounded-full" style={{ left: '0%', animation: 'slideRight 2s cubic-bezier(0.4, 0, 0.2, 1) infinite' }}></div>
        <style jsx>{`
            @keyframes slideRight {
              0% { left: -25%; width: 25%; }
              50% { width: 40%; }
              100% { left: 100%; width: 25%; }
            }
         `}</style>
      </div>

      <p className="text-sm text-foreground/50 mt-6 z-10 text-center font-medium">
        {isPending ? "Our AI is preparing your workspace..." : `Sit tight, our AI is carefully ${sourceType === 'youtube' ? 'summarizing the video' : 'reading the article'} for you.`}
      </p>
    </div>
  );
}
