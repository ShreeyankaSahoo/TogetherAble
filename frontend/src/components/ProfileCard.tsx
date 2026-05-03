import { ThumbsUp, Heart, ThumbsDown, MessageCircle, Info, Crown } from "lucide-react";

interface ProfileCardProps {
  name: string;
  distance: string;
  image: string;
  compatibility?: number;
  isPremium?: boolean;
}

const ProfileCard = ({ name, distance, image, compatibility, isPremium }: ProfileCardProps) => {
  return (
    <div className="bg-card rounded-2xl shadow-card overflow-hidden max-w-sm mx-auto">
      {isPremium && (
        <div className="flex items-center justify-center gap-1 bg-premium/10 text-premium py-1.5 text-xs font-semibold font-heading">
          <Crown className="w-3.5 h-3.5" />
          Premium Match
        </div>
      )}

      <div className="relative p-6 flex flex-col items-center">
        <div className="w-44 h-44 rounded-full overflow-hidden border-4 border-secondary shadow-warm">
          <img src={image} alt={`${name}'s profile`} className="w-full h-full object-cover" />
        </div>

        {compatibility && (
          <div className="absolute top-4 right-4 bg-success/10 text-success text-xs font-bold px-2.5 py-1 rounded-full">
            {compatibility}% Match
          </div>
        )}

        <h3 className="font-heading text-xl font-bold mt-4 text-card-foreground">{name}</h3>
        <p className="text-sm text-muted-foreground">{distance}</p>

        <div className="flex items-center gap-3 mt-5">
          <button aria-label="Like" className="p-3 rounded-full bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
            <ThumbsUp className="w-5 h-5" />
          </button>
          <button aria-label="Super Like" className="p-3 rounded-full bg-secondary text-heart hover:bg-heart hover:text-primary-foreground transition-colors">
            <Heart className="w-5 h-5" />
          </button>
          <button aria-label="Pass" className="p-3 rounded-full bg-secondary text-muted-foreground hover:bg-destructive hover:text-primary-foreground transition-colors">
            <ThumbsDown className="w-5 h-5" />
          </button>
          <button aria-label="Message" className="p-3 rounded-full bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
            <MessageCircle className="w-5 h-5" />
          </button>
          <button aria-label="Info" className="p-3 rounded-full bg-secondary text-secondary-foreground hover:bg-muted transition-colors">
            <Info className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-1.5 mt-4">
          <span className="w-2 h-2 rounded-full bg-primary" />
          <span className="w-2 h-2 rounded-full bg-primary/30" />
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
