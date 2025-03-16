import { Beat } from "@/types";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useCartStore } from "@/lib/store/cart";
import { BEAT_LICENSES } from "@/lib/config/constants";

interface BeatCardProps {
  beat: Beat;
}

export function BeatCard({ beat }: BeatCardProps) {
  const { addItem } = useCartStore();

  const handleAddToCart = () => {
    addItem({
      beatId: beat.id,
      licenseType: "basic",
      price: beat.price,
    });
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="relative h-48 bg-muted">
        {beat.imageUrl ? (
          <Image
            src={beat.imageUrl}
            alt={beat.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-r from-purple-400 to-indigo-500">
            <span className="text-2xl font-bold text-white">{beat.title}</span>
          </div>
        )}
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">{beat.title}</CardTitle>
        <CardDescription>
          Produced by {beat.producer} • {beat.bpm} BPM • {beat.key}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex flex-wrap gap-1">
          {beat.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 text-xs rounded-full bg-muted"
            >
              {tag}
            </span>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-lg font-bold">
          ${beat.price.toFixed(2)}
        </div>
        <Button onClick={handleAddToCart}>Add to Cart</Button>
      </CardFooter>
    </Card>
  );
} 