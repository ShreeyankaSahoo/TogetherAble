import { Accessibility, Hand, Heart, HelpCircle, Smile, ThumbsUp } from "lucide-react";

interface AACToolbarProps {
  onSelect: (phrase: string) => void;
}

const categories = [
  {
    label: "Greetings",
    icon: Hand,
    phrases: ["👋 Hello!", "Hi there!", "Good morning!", "How are you?"],
  },
  {
    label: "Feelings",
    icon: Heart,
    phrases: ["😊 I'm happy", "I'm excited!", "I feel comfortable", "I need a moment"],
  },
  {
    label: "Responses",
    icon: ThumbsUp,
    phrases: ["Yes!", "No, thank you", "Maybe later", "Sounds great!"],
  },
  {
    label: "Needs",
    icon: Accessibility,
    phrases: ["Can you type slower?", "I prefer voice notes", "Let's video chat", "I need accessibility help"],
  },
  {
    label: "Questions",
    icon: HelpCircle,
    phrases: ["Tell me about yourself", "What do you enjoy?", "Where shall we meet?", "What's your schedule?"],
  },
  {
    label: "Fun",
    icon: Smile,
    phrases: ["😂 That's funny!", "❤️ Love that!", "🎉 Amazing!", "☕ Coffee date?"],
  },
];

const AACToolbar = ({ onSelect }: AACToolbarProps) => {
  return (
    <div className="border-t border-border bg-card">
      <div className="px-3 py-2 overflow-x-auto">
        <p className="text-xs font-semibold text-muted-foreground mb-2 font-heading">AAC Quick Phrases</p>
        <div className="flex gap-4 pb-1">
          {categories.map((cat) => (
            <div key={cat.label} className="shrink-0">
              <div className="flex items-center gap-1 mb-1.5">
                <cat.icon className="w-3.5 h-3.5 text-secondary-foreground" />
                <span className="text-xs font-medium text-muted-foreground">{cat.label}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {cat.phrases.map((phrase) => (
                  <button
                    key={phrase}
                    onClick={() => onSelect(phrase)}
                    className="px-2.5 py-1.5 text-xs bg-secondary text-secondary-foreground rounded-full hover:bg-primary hover:text-primary-foreground transition-colors whitespace-nowrap"
                  >
                    {phrase}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AACToolbar;
