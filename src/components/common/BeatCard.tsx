import { Beat, LicenseType } from "@/types";
import { 
  Card, 
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store/cart";
import { BEAT_LICENSES } from "@/lib/config/constants";
import { getSecureMediaUrl } from "@/lib/utils/media";
import { useState } from "react";
import { 
  PlayCircleIcon, 
  PauseCircleIcon, 
  InfoIcon, 
  ShoppingCartIcon 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Link from "next/link";

interface BeatCardProps {
  beat: Beat;
  isPlaying?: boolean;
  onPlay?: (beat: Beat) => void;
  onPause?: () => void;
}

export function BeatCard({ beat, isPlaying = false, onPlay, onPause }: BeatCardProps) {
  const { addItem } = useCartStore();
  const [selectedLicense, setSelectedLicense] = useState<LicenseType>("basic");
  const [isHovered, setIsHovered] = useState(false);

  const handleAddToCart = () => {
    addItem({
      beatId: beat.id,
      licenseType: selectedLicense,
      price: BEAT_LICENSES[selectedLicense].price,
    });
  };

  const handlePlayToggle = () => {
    if (isPlaying) {
      onPause?.();
    } else {
      onPlay?.(beat);
    }
  };

  return (
    <Card 
      className="overflow-hidden transition-all duration-300 hover:shadow-lg group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-48 bg-muted">
        {beat.imageUrl ? (
          <div className="h-full w-full relative">
            <img
              src={getSecureMediaUrl(beat.imageUrl)}
              alt={beat.title}
              className="object-cover absolute inset-0 w-full h-full transition-transform duration-500 group-hover:scale-105"
            />
            <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
              <button 
                onClick={handlePlayToggle}
                className="text-white transform transition-transform duration-300 hover:scale-110"
              >
                {isPlaying ? (
                  <PauseCircleIcon size={64} className="drop-shadow-lg" />
                ) : (
                  <PlayCircleIcon size={64} className="drop-shadow-lg" />
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-r from-indigo-500 to-purple-600 relative">
            <span className="text-2xl font-bold text-white">{beat.title}</span>
            <div className={`absolute inset-0 bg-black/20 flex items-center justify-center transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
              <button 
                onClick={handlePlayToggle}
                className="text-white transform transition-transform duration-300 hover:scale-110"
              >
                {isPlaying ? (
                  <PauseCircleIcon size={64} className="drop-shadow-lg" />
                ) : (
                  <PlayCircleIcon size={64} className="drop-shadow-lg" />
                )}
              </button>
            </div>
          </div>
        )}
        <div className="absolute top-2 right-2 flex gap-1">
          <Badge variant="secondary" className="rounded-full font-medium">
            {beat.bpm} BPM
          </Badge>
          <Badge variant="secondary" className="rounded-full font-medium">
            {beat.key}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-bold line-clamp-1">{beat.title}</h3>
            <p className="text-sm text-muted-foreground">by {beat.producer}</p>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href={`/beats/${beat.id}`} className="text-muted-foreground hover:text-primary">
                  <InfoIcon size={18} />
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>View beat details</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="flex flex-wrap gap-1 my-2">
          {beat.tags.slice(0, 3).map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="px-2 py-1 text-xs rounded-full"
            >
              {tag}
            </Badge>
          ))}
          {beat.tags.length > 3 && (
            <Badge
              variant="outline"
              className="px-2 py-1 text-xs rounded-full"
            >
              +{beat.tags.length - 3}
            </Badge>
          )}
        </div>
        
        <div className="flex gap-2 mt-3">
          {(Object.keys(BEAT_LICENSES) as LicenseType[]).map((licenseType) => (
            <Button
              key={licenseType}
              variant={selectedLicense === licenseType ? "default" : "outline"}
              size="sm"
              className="flex-1 text-xs"
              onClick={() => setSelectedLicense(licenseType)}
            >
              {BEAT_LICENSES[licenseType].name}
            </Button>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="px-4 pb-4 pt-0 flex justify-between">
        <div className="text-lg font-bold">
          ${BEAT_LICENSES[selectedLicense].price.toFixed(2)}
        </div>
        <Button 
          onClick={handleAddToCart}
          className="gap-1"
        >
          <ShoppingCartIcon size={16} />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
} 