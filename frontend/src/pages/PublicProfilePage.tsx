import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { createConversation } from "@/hooks/useMessaging";
import { Button } from "@/components/ui/button";
import { User, MessageCircle, Loader2, ArrowLeft, Accessibility, Mic, Heart } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import type { Database } from "@/integrations/supabase/types";

type PublicProfile = Database["public"]["Functions"]["get_public_profiles"]["Returns"][number];

const PublicProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [messaging, setMessaging] = useState(false);

  useEffect(() => {
    if (!userId) return;
    supabase
      .rpc("get_public_profiles", { _ids: [userId] })
      .then(({ data }) => {
        setProfile(data?.[0] ?? null);
        setLoading(false);
      });
  }, [userId]);

  const handleMessage = async () => {
    if (!user || !profile) return;
    if (user.id === profile.id) {
      toast.info("That's your own profile!");
      return;
    }
    setMessaging(true);
    try {
      await createConversation(user.id, profile.id);
      toast.success("Conversation started");
      navigate("/messages");
    } catch {
      toast.error("Could not start conversation");
    }
    setMessaging(false);
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground font-heading text-lg">Profile not found</p>
          <Button variant="ghost" asChild>
            <Link to="/matching"><ArrowLeft className="w-4 h-4 mr-1" /> Back to Matching</Link>
          </Button>
        </div>
      </div>
    );
  }

  const commLabel = profile.communication_style === "aac" ? "AAC Tools" : profile.communication_style ? profile.communication_style.charAt(0).toUpperCase() + profile.communication_style.slice(1) : "Text";
  const isOwn = user?.id === profile.id;

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8">
      <div className="container max-w-2xl">
        <Link to="/matching" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Matching
        </Link>

        <div className="bg-card rounded-2xl shadow-card overflow-hidden">
          {/* Hero banner */}
          <div className="h-32 bg-gradient-to-r from-primary/30 to-accent/30" />

          {/* Avatar + name */}
          <div className="px-6 md:px-8 -mt-14">
            <div className="flex items-end gap-4">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.display_name || "User"}
                  className="w-28 h-28 rounded-full object-cover border-4 border-card shadow-warm"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-primary/10 border-4 border-card flex items-center justify-center shadow-warm">
                  <User className="w-12 h-12 text-primary" />
                </div>
              )}
              <div className="pb-2">
                <h1 className="font-heading text-2xl font-extrabold">{profile.display_name || "Anonymous"}</h1>
              </div>
            </div>
          </div>

          <div className="px-6 md:px-8 py-6 space-y-6">
            {/* Bio */}
            {profile.bio && (
              <div>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">About</h2>
                <p className="text-foreground leading-relaxed">{profile.bio}</p>
              </div>
            )}

            {/* Info badges */}
            <div className="flex flex-wrap gap-3">
              {profile.disability_type && profile.disability_type !== "Prefer not to say" && (
                <Badge icon={<Accessibility className="w-3.5 h-3.5" />} label={profile.disability_type} />
              )}
              <Badge icon={<Mic className="w-3.5 h-3.5" />} label={`Prefers ${commLabel}`} />
              {profile.mobility_aids && (
                <Badge icon={<Heart className="w-3.5 h-3.5" />} label={profile.mobility_aids} />
              )}
            </div>

            {/* Support needs */}
            {profile.support_needs && (
              <div>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Support Needs</h2>
                <p className="text-foreground">{profile.support_needs}</p>
              </div>
            )}

            {/* Interests */}
            {profile.interests && profile.interests.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Interests</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest) => (
                    <span
                      key={interest}
                      className="px-3 py-1.5 rounded-full text-sm bg-accent/10 text-accent-foreground border border-accent/20"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 flex gap-3">
              {isOwn ? (
                <Button variant="hero" className="w-full" asChild>
                  <Link to="/profile">Edit Your Profile</Link>
                </Button>
              ) : user ? (
                <Button variant="hero" className="w-full" onClick={handleMessage} disabled={messaging}>
                  {messaging ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <MessageCircle className="w-4 h-4 mr-2" />}
                  Send Message
                </Button>
              ) : (
                <Button variant="hero" className="w-full" asChild>
                  <Link to="/login">Log in to message</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Badge = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-secondary text-secondary-foreground border border-border">
    {icon}
    {label}
  </span>
);

export default PublicProfilePage;
