"use client";

import { Beat } from "@/types";
import { useState, useEffect, useRef } from "react";
import { 
  PlayIcon, 
  PauseIcon, 
  SkipBackIcon, 
  SkipForwardIcon, 
  Volume2Icon,
  VolumeXIcon
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { getSecureMediaUrl } from "@/lib/utils/media";

interface AudioPlayerProps {
  currentBeat: Beat | null;
  beats: Beat[];
  onPlayNext: (beat: Beat) => void;
  onPlayPrevious: (beat: Beat) => void;
  onStop: () => void;
}

export function AudioPlayer({ 
  currentBeat, 
  beats, 
  onPlayNext, 
  onPlayPrevious, 
  onStop 
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prevVolumeRef = useRef(volume);

  // Create audio element on first render
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    
    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Handle beat change
  useEffect(() => {
    if (!audioRef.current || !currentBeat) return;
    
    const audioEl = audioRef.current;
    
    // Set loading state to prevent multiple play attempts
    setIsPlaying(false);
    
    // Store the URL before setting it to prevent race conditions
    const mediaUrl = getSecureMediaUrl(currentBeat.audioUrl);
    audioEl.src = mediaUrl;
    audioEl.volume = isMuted ? 0 : volume;
    
    // Use a small delay to let the browser process the new source
    const playTimer = setTimeout(() => {
      audioEl.play().then(() => {
        setIsPlaying(true);
      }).catch(error => {
        console.error("Error playing audio:", error);
        // If we get the interrupted error, try again once after a short delay
        if (error.name === "AbortError" || String(error).includes("interrupted")) {
          setTimeout(() => {
            audioEl.play()
              .then(() => setIsPlaying(true))
              .catch(e => console.error("Retry failed:", e));
          }, 500);
        }
      });
    }, 100);
    
    // Event listeners
    const handleTimeUpdate = () => {
      setCurrentTime(audioEl.currentTime);
    };
    
    const handleLoadedMetadata = () => {
      setDuration(audioEl.duration);
    };
    
    const handleEnded = () => {
      // Play next beat if available
      const currentIndex = beats.findIndex(beat => beat.id === currentBeat.id);
      if (currentIndex < beats.length - 1) {
        onPlayNext(beats[currentIndex + 1]);
      } else {
        setIsPlaying(false);
        setCurrentTime(0);
      }
    };
    
    audioEl.addEventListener('timeupdate', handleTimeUpdate);
    audioEl.addEventListener('loadedmetadata', handleLoadedMetadata);
    audioEl.addEventListener('ended', handleEnded);
    
    return () => {
      clearTimeout(playTimer);
      audioEl.removeEventListener('timeupdate', handleTimeUpdate);
      audioEl.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audioEl.removeEventListener('ended', handleEnded);
    };
  }, [currentBeat, beats, isMuted, volume, onPlayNext]);

  // Format time in MM:SS
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handlePlayPause = () => {
    if (!audioRef.current || !currentBeat) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(error => {
        console.error("Play error:", error);
        // If we get the interrupted error, try again once
        if (error.name === "AbortError" || String(error).includes("interrupted")) {
          setTimeout(() => {
            if (audioRef.current) {
              audioRef.current.play()
                .then(() => setIsPlaying(true))
                .catch(e => console.error("Retry failed:", e));
            }
          }, 500);
        }
      });
    }
  };

  const handleStop = () => {
    if (!audioRef.current) return;
    
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
    setCurrentTime(0);
    onStop();
  };

  const handleNext = () => {
    const currentIndex = currentBeat 
      ? beats.findIndex(beat => beat.id === currentBeat.id)
      : -1;
    
    if (currentIndex < beats.length - 1) {
      onPlayNext(beats[currentIndex + 1]);
    }
  };

  const handlePrevious = () => {
    const currentIndex = currentBeat 
      ? beats.findIndex(beat => beat.id === currentBeat.id)
      : -1;
    
    if (currentIndex > 0) {
      onPlayPrevious(beats[currentIndex - 1]);
    }
  };

  const handleSeek = (value: number[]) => {
    if (!audioRef.current) return;
    
    const newTime = value[0];
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (value: number[]) => {
    if (!audioRef.current) return;
    
    const newVolume = value[0];
    setVolume(newVolume);
    prevVolumeRef.current = newVolume;
    
    if (isMuted) {
      setIsMuted(false);
    }
    
    audioRef.current.volume = newVolume;
  };

  const handleMuteToggle = () => {
    if (!audioRef.current) return;
    
    setIsMuted(!isMuted);
    audioRef.current.volume = !isMuted ? 0 : prevVolumeRef.current;
  };

  if (!currentBeat) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 px-4 py-2 shadow-lg">
      <div className="container flex items-center gap-4">
        <div className="flex items-center gap-2 min-w-[180px]">
          <div className="h-12 w-12 bg-muted overflow-hidden rounded">
            {currentBeat.imageUrl ? (
              <img 
                src={getSecureMediaUrl(currentBeat.imageUrl)} 
                alt={currentBeat.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-r from-indigo-500 to-purple-600" />
            )}
          </div>
          <div className="overflow-hidden">
            <h4 className="font-medium text-sm truncate">{currentBeat.title}</h4>
            <p className="text-xs text-muted-foreground truncate">{currentBeat.producer}</p>
          </div>
        </div>
        
        <div className="flex flex-col flex-grow gap-1 max-w-3xl">
          <div className="flex items-center justify-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handlePrevious}
              disabled={beats.findIndex(beat => beat.id === currentBeat.id) === 0}
              className="h-8 w-8"
            >
              <SkipBackIcon size={16} />
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={handlePlayPause}
              className="h-9 w-9 rounded-full"
            >
              {isPlaying ? <PauseIcon size={16} /> : <PlayIcon size={16} />}
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleNext}
              disabled={beats.findIndex(beat => beat.id === currentBeat.id) === beats.length - 1}
              className="h-8 w-8"
            >
              <SkipForwardIcon size={16} />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs tabular-nums">{formatTime(currentTime)}</span>
            <Slider
              min={0}
              max={duration || 100}
              step={0.1}
              value={[currentTime]}
              onValueChange={handleSeek}
              className="flex-grow"
            />
            <span className="text-xs tabular-nums">{formatTime(duration)}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 min-w-[140px] justify-end">
          <Button variant="ghost" size="icon" onClick={handleMuteToggle} className="h-8 w-8">
            {isMuted ? <VolumeXIcon size={16} /> : <Volume2Icon size={16} />}
          </Button>
          <Slider
            min={0}
            max={1}
            step={0.01}
            value={[isMuted ? 0 : volume]}
            onValueChange={handleVolumeChange}
            className="w-24"
          />
        </div>
      </div>
    </div>
  );
} 