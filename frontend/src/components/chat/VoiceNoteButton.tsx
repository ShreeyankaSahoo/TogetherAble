import { Mic, Square } from "lucide-react";
import { useState, useRef } from "react";

interface VoiceNoteButtonProps {
  onSend: (duration: number) => void;
}

const VoiceNoteButton = ({ onSend }: VoiceNoteButtonProps) => {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = () => {
    setRecording(true);
    setSeconds(0);
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
  };

  const stop = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    const dur = seconds || 1;
    setRecording(false);
    setSeconds(0);
    onSend(dur);
  };

  if (recording) {
    return (
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
        <span className="text-xs font-medium text-destructive tabular-nums">{seconds}s</span>
        <button
          onClick={stop}
          className="p-2.5 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
          aria-label="Stop recording"
        >
          <Square className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={start}
      className="p-2.5 rounded-full hover:bg-muted text-muted-foreground transition-colors"
      aria-label="Record voice note"
      title="Hold to record a voice note"
    >
      <Mic className="w-5 h-5" />
    </button>
  );
};

export default VoiceNoteButton;
