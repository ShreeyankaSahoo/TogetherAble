import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Camera, Save, User, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

const DISABILITY_OPTIONS = [
  "Prefer not to say",
  "Mobility Impairment",
  "Visual Impairment",
  "Hearing Impairment",
  "Neurodivergent",
  "Chronic Illness",
  "Other",
];

const COMM_OPTIONS = ["text", "voice", "video", "aac"];
const INTEREST_OPTIONS = [
  "Accessible Hiking", "Board Games", "Music", "Cooking", "Art",
  "Movies", "Reading", "Travel", "Gaming", "Yoga",
  "Photography", "Dancing", "Crafts", "Volunteering",
];

const ProfilePage = () => {
  const { user, loading: authLoading } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [disabilityType, setDisabilityType] = useState("");
  const [mobilityAids, setMobilityAids] = useState("");
  const [communicationStyle, setCommunicationStyle] = useState("text");
  const [supportNeeds, setSupportNeeds] = useState("");
  const [interests, setInterests] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (data) {
      setDisplayName(data.display_name || "");
      setBio(data.bio || "");
      setAvatarUrl(data.avatar_url || "");
      setDisabilityType(data.disability_type || "Prefer not to say");
      setMobilityAids(data.mobility_aids || "");
      setCommunicationStyle(data.communication_style || "text");
      setSupportNeeds(data.support_needs || "");
      setInterests(data.interests || []);
    }
    setLoading(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      toast.error("Upload failed: " + uploadError.message);
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
    setAvatarUrl(publicUrl + "?t=" + Date.now());
    setUploading(false);
    toast.success("Photo uploaded!");
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName,
        bio,
        avatar_url: avatarUrl.split("?")[0],
        disability_type: disabilityType,
        mobility_aids: mobilityAids,
        communication_style: communicationStyle,
        support_needs: supportNeeds,
        interests,
      })
      .eq("id", user.id);

    setSaving(false);
    if (error) {
      toast.error("Failed to save: " + error.message);
    } else {
      toast.success("Profile saved!");
    }
  };

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground font-heading text-lg">Please log in to edit your profile</p>
          <Button variant="hero" asChild>
            <Link to="/login">Log In</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8">
      <div className="container max-w-2xl">
        <h1 className="font-heading text-3xl font-extrabold mb-6">Your Profile</h1>

        <div className="bg-card rounded-2xl shadow-card p-6 md:p-8 space-y-8">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative group">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Your avatar"
                  className="w-28 h-28 rounded-full object-cover border-4 border-border"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-primary/10 border-4 border-border flex items-center justify-center">
                  <User className="w-12 h-12 text-primary" />
                </div>
              )}
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground shadow-warm hover:bg-primary/90 transition-colors"
                aria-label="Change photo"
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>
            <p className="text-xs text-muted-foreground">Tap to change your photo</p>
          </div>

          {/* Display Name */}
          <Section label="Display Name">
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="input-field"
              placeholder="Your name"
            />
          </Section>

          {/* Bio */}
          <Section label="About You">
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="input-field min-h-[100px] resize-none"
              placeholder="Tell others about yourself, your hobbies, what you're looking for..."
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1">{bio.length}/500</p>
          </Section>

          {/* Disability Type */}
          <Section label="Disability Type" hint="Optional — share what you're comfortable with">
            <select
              value={disabilityType}
              onChange={(e) => setDisabilityType(e.target.value)}
              className="input-field appearance-none"
            >
              {DISABILITY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </Section>

          {/* Mobility Aids */}
          <Section label="Mobility Aids / Assistive Tech" hint="e.g., wheelchair, screen reader, hearing aid">
            <input
              type="text"
              value={mobilityAids}
              onChange={(e) => setMobilityAids(e.target.value)}
              className="input-field"
              placeholder="List any aids you use..."
            />
          </Section>

          {/* Support Needs */}
          <Section label="Support Needs" hint="e.g., caregiver assistance, guide dog, interpreter">
            <input
              type="text"
              value={supportNeeds}
              onChange={(e) => setSupportNeeds(e.target.value)}
              className="input-field"
              placeholder="Describe any support needs..."
            />
          </Section>

          {/* Communication Style */}
          <Section label="Preferred Communication">
            <div className="flex flex-wrap gap-2">
              {COMM_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setCommunicationStyle(opt)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                    communicationStyle === opt
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground border-input hover:bg-muted"
                  }`}
                >
                  {opt === "aac" ? "AAC Tools" : opt.charAt(0).toUpperCase() + opt.slice(1)}
                </button>
              ))}
            </div>
          </Section>

          {/* Interests */}
          <Section label="Interests" hint="Select all that apply">
            <div className="flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map((interest) => (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    interests.includes(interest)
                      ? "bg-accent text-accent-foreground border-accent"
                      : "bg-background text-foreground border-input hover:bg-muted"
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </Section>

          {/* Save */}
          <Button
            variant="hero"
            size="lg"
            className="w-full"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
            ) : (
              <><Save className="w-4 h-4 mr-2" /> Save Profile</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

const Section = ({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) => (
  <div>
    <label className="block text-sm font-semibold mb-1">{label}</label>
    {hint && <p className="text-xs text-muted-foreground mb-2">{hint}</p>}
    {children}
  </div>
);

export default ProfilePage;
