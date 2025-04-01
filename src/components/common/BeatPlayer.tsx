"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface BeatPlayerProps {
  audioUrl: string;
  waveformUrl?: string;
}

export function BeatPlayer({ audioUrl, waveformUrl }: BeatPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const playPromiseRef = useRef<Promise<void> | undefined>(undefined);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    setIsLoading(true);
    setError(null);
    audio.load();

    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      audio.currentTime = 0;
    };

    const handleError = (e: Event) => {
      const target = e.target as HTMLAudioElement;
      console.error("Audio error details:", {
        error: target.error,
        src: target.src,
        readyState: target.readyState,
        networkState: target.networkState
      });
      
      setError("Failed to load audio. Please try again.");
      setIsPlaying(false);
      setIsLoading(false);
      
      // If the error is due to no source or network issues, try reloading
      if (target.error?.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED ||
          target.error?.code === MediaError.MEDIA_ERR_NETWORK) {
        // Add a retry parameter to bust cache
        const currentSrc = new URL(target.src);
        if (!currentSrc.searchParams.has('retry')) {
          currentSrc.searchParams.set('retry', 'true');
          currentSrc.searchParams.set('t', Date.now().toString());
          target.src = currentSrc.toString();
          target.load();
        }
      }
    };

    const handleLoadStart = () => {
      setIsLoading(true);
      setError(null);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
      setError(null);
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);
    audio.addEventListener("loadstart", handleLoadStart);
    audio.addEventListener("canplay", handleCanPlay);

    return () => {
      if (playPromiseRef.current !== undefined) {
        playPromiseRef.current
          .then(() => {
            audio.pause();
          })
          .catch(() => {
            // Play was already interrupted or failed, no need to pause
          });
      } else {
        audio.pause();
      }

      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("loadstart", handleLoadStart);
      audio.removeEventListener("canplay", handleCanPlay);
    };
  }, [audioRef, audioUrl]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      playPromiseRef.current = undefined;
    } else {
      playPromiseRef.current = audio.play();
      
      if (playPromiseRef.current !== undefined) {
        playPromiseRef.current
          .then(() => {
            setIsPlaying(true);
          })
          .catch(error => {
            console.error("Error playing audio:", error);
            setIsPlaying(false);
            playPromiseRef.current = undefined;
            
            if (error.name === "AbortError" || String(error).includes("interrupted")) {
              setTimeout(() => {
                if (audioRef.current) {
                  const retryPromise = audioRef.current.play();
                  playPromiseRef.current = retryPromise;
                  
                  retryPromise
                    .then(() => setIsPlaying(true))
                    .catch(e => {
                      console.error("Retry failed:", e);
                      playPromiseRef.current = undefined;
                    });
                }
              }, 300);
            }
          });
      }
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;
    
    audio.currentTime = clickPosition * audio.duration;
    setProgress(clickPosition * 100);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="flex flex-col w-full p-4 space-y-2 border rounded-md bg-card">
      <audio 
        ref={audioRef} 
        src={audioUrl} 
        preload="metadata"
      />
      
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={togglePlayPause}
          className="h-8 w-8 rounded-full"
          disabled={isLoading || !!error}
        >
          {isPlaying ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          )}
        </Button>
        
        <div
          className="relative flex-1 h-2 overflow-hidden cursor-pointer bg-secondary rounded-full"
          onClick={handleProgressClick}
        >
          <div
            className="absolute h-full bg-primary"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="text-xs text-muted-foreground w-12 text-right">
          {audioRef.current ? formatTime(audioRef.current.currentTime) : "0:00"} /{" "}
          {formatTime(duration)}
        </div>
      </div>
      
      {error && (
        <div className="text-sm text-destructive mt-2">
          {error}
        </div>
      )}
      
      {isLoading && (
        <div className="text-sm text-muted-foreground mt-2">
          Loading audio...
        </div>
      )}
      
      {waveformUrl && (
        <div className="h-16 mt-2 overflow-hidden rounded-md bg-muted">
          <img
            src={waveformUrl}
            alt="Audio waveform"
            className="object-cover w-full h-full"
          />
        </div>
      )}
    </div>
  );
} 