import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, ChevronRight, ChevronLeft, Plus, X, Shield, Sparkles, Users } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const TOTAL_STEPS = 4;

const GENDER_OPTIONS = [
  "Female",
  "Male",
  "Non-binary",
  "Transgender",
  "Prefer to self-describe",
  "Prefer not to say",
];

const PRONOUN_OPTIONS = ["She/Her", "He/Him", "They/Them", "Custom"];

const INTEREST_CATEGORIES: Record<string, string[]> = {
  "🎨 Creative Activities": ["Drawing", "Painting", "Photography", "Writing", "Singing", "Playing Instruments"],
  "🎮 Entertainment": ["Gaming", "Watching Movies", "Listening to Music", "Anime", "Content Creation"],
  "⚽ Sports & Physical Activities": ["Football", "Cricket", "Basketball", "Swimming", "Yoga", "Athletics"],
  "📚 Learning & Lifestyle": ["Cooking", "Reading", "Traveling", "Language Learning", "Technology", "Science", "Environmental Activism"],
  "🤝 Community Activities": ["Volunteering", "Disability Advocacy", "LGBTQIA+ Community Events", "Cultural Events"],
};

const ACCESSIBILITY_PREFS = [
  { id: "text-to-speech", label: "Text-to-Speech", desc: "Screen reader & voice output support" },
  { id: "simplified-ui", label: "Simplified UI", desc: "Cleaner, less cluttered interface" },
  { id: "high-contrast", label: "High Contrast Mode", desc: "Enhanced color contrast for readability" },
  { id: "large-text", label: "Large Text", desc: "Bigger fonts throughout the app" },
];

const COMMUNITY_TAGS = [
  "Disability Support",
  "LGBTQIA+ Safe Spaces",
  "Hobby Groups",
  "Mental Health Support",
  "Neurodivergent Community",
];

const SignupPage = () => {
  const [step, setStep] = useState(1);
  // Step 1
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  // Step 2
  const [genderIdentity, setGenderIdentity] = useState("");
  const [customGender, setCustomGender] = useState("");
  const [pronouns, setPronouns] = useState("");
  const [customPronouns, setCustomPronouns] = useState("");
  const [disabilityType, setDisabilityType] = useState("Prefer not to say");
  const [disabilityPercentage, setDisabilityPercentage] = useState("");
  const [commStyle, setCommStyle] = useState("Text");
  // Step 3
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [customInterest, setCustomInterest] = useState("");
  // Step 4
  const [accessibilityPrefs, setAccessibilityPrefs] = useState<string[]>([]);
  const [communityTags, setCommunityTags] = useState<string[]>([]);
  const [country, setCountry] = useState("");
  const [location, setLocation] = useState("");

  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const addCustomInterest = () => {
    const trimmed = customInterest.trim();
    if (trimmed && !selectedInterests.includes(trimmed)) {
      setSelectedInterests((prev) => [...prev, trimmed]);
      setCustomInterest("");
    }
  };

  const toggleAccessibility = (id: string) => {
    setAccessibilityPrefs((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleCommunityTag = (tag: string) => {
    setCommunityTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    const displayName = `${firstName} ${lastName}`.trim();
    const finalGender = genderIdentity === "Prefer to self-describe" ? customGender : genderIdentity;
    const finalPronouns = pronouns === "Custom" ? customPronouns : pronouns;

    const { error } = await signUp(email, password, {
      display_name: displayName,
      disability_type: disabilityType,
      communication_style: commStyle.toLowerCase(),
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    // Store only non-sensitive preferences in localStorage for post-confirmation profile update
    // Sensitive fields (contact_number, disability_percentage, gender_identity, pronouns)
    // will be collected on the profile page after login
    const onboardingData = {
      country,
      location,
      interests: [...selectedInterests, ...communityTags],
      accessibility_preferences: accessibilityPrefs,
      onboarding_completed: true,
    };
    localStorage.setItem("togetherable_onboarding", JSON.stringify(onboardingData));

    setLoading(false);
    toast.success("Account created! Please check your email to confirm.");
    navigate("/login");
  };

  const canProceed = () => {
    switch (step) {
      case 1: return firstName.trim() && email.trim() && password.length >= 6;
      case 2: return true; // all optional
      case 3: return true;
      case 4: return true;
      default: return false;
    }
  };

  const progressPercent = (step / TOTAL_STEPS) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center py-10 px-4" role="main">
      <div className="w-full max-w-lg bg-card rounded-2xl shadow-card p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="font-heading text-2xl font-extrabold text-primary">TogetherAble</span>
            <Heart className="w-5 h-5 text-heart fill-heart" aria-hidden="true" />
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
            A safe and inclusive space where people of all abilities, identities, and backgrounds can connect, collaborate, and build meaningful friendships.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={TOTAL_STEPS} aria-label={`Step ${step} of ${TOTAL_STEPS}`}>
          <div className="flex justify-between text-xs text-muted-foreground mb-2 font-medium">
            {["Create Account", "Your Identity", "Interests", "Preferences"].map((label, i) => (
              <span key={label} className={i + 1 <= step ? "text-primary font-semibold" : ""}>{label}</span>
            ))}
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Step 1: Account */}
        {step === 1 && (
          <fieldset className="space-y-4">
            <legend className="sr-only">Create your account</legend>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium mb-1">Your First Name</label>
                <input id="firstName" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="input-field" placeholder="Enter your first name" required aria-required="true" />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium mb-1">Last Name</label>
                <input id="lastName" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="input-field" placeholder="Enter your last name" />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">Email ID</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="Enter your email" required aria-required="true" />
            </div>
            <div>
              <label htmlFor="contactNumber" className="block text-sm font-medium mb-1">Contact Number <span className="text-muted-foreground">(optional)</span></label>
              <input id="contactNumber" type="tel" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} className="input-field" placeholder="Enter your contact number" />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" placeholder="Create a password (min 6 chars)" required minLength={6} aria-required="true" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="country" className="block text-sm font-medium mb-1">Your Country</label>
                <input id="country" type="text" value={country} onChange={(e) => setCountry(e.target.value)} className="input-field" placeholder="Enter your country" />
              </div>
              <div>
                <label htmlFor="location" className="block text-sm font-medium mb-1">Your Location</label>
                <input id="location" type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="input-field" placeholder="Enter your city" />
              </div>
            </div>
          </fieldset>
        )}

        {/* Step 2: Identity */}
        {step === 2 && (
          <fieldset className="space-y-5">
            <legend className="sr-only">Tell us about your identity</legend>
            <div className="bg-secondary/50 rounded-xl p-4 text-sm text-secondary-foreground flex gap-2 items-start">
              <Users className="w-5 h-5 mt-0.5 shrink-0" aria-hidden="true" />
              <span>All fields here are optional. Share only what you're comfortable with — this helps us create a better experience for you.</span>
            </div>

            <div>
              <label htmlFor="genderIdentity" className="block text-sm font-medium mb-1">Gender Identity</label>
              <select id="genderIdentity" value={genderIdentity} onChange={(e) => setGenderIdentity(e.target.value)} className="input-field appearance-none" aria-describedby="genderHelp">
                <option value="">Select if you'd like</option>
                {GENDER_OPTIONS.map((g) => <option key={g}>{g}</option>)}
              </select>
              {genderIdentity === "Prefer to self-describe" && (
                <input type="text" value={customGender} onChange={(e) => setCustomGender(e.target.value)} className="input-field mt-2" placeholder="How do you identify?" aria-label="Custom gender identity" />
              )}
            </div>

            <div>
              <label htmlFor="pronouns" className="block text-sm font-medium mb-1">Pronouns</label>
              <select id="pronouns" value={pronouns} onChange={(e) => setPronouns(e.target.value)} className="input-field appearance-none">
                <option value="">Select if you'd like</option>
                {PRONOUN_OPTIONS.map((p) => <option key={p}>{p}</option>)}
              </select>
              {pronouns === "Custom" && (
                <input type="text" value={customPronouns} onChange={(e) => setCustomPronouns(e.target.value)} className="input-field mt-2" placeholder="Enter your pronouns" aria-label="Custom pronouns" />
              )}
            </div>

            <div>
              <label htmlFor="disabilityType" className="block text-sm font-medium mb-1">Disability Type</label>
              <p id="disabilityHelp" className="text-xs text-muted-foreground mb-2">Sharing disability information helps us improve accessibility and connect you with supportive communities. This is completely optional.</p>
              <select id="disabilityType" value={disabilityType} onChange={(e) => setDisabilityType(e.target.value)} className="input-field appearance-none" aria-describedby="disabilityHelp">
                <option>Prefer not to say</option>
                <option>Mobility Impairment</option>
                <option>Visual Impairment</option>
                <option>Hearing Impairment</option>
                <option>Neurodivergent</option>
                <option>Chronic Illness</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="disabilityPercentage" className="block text-sm font-medium mb-1">Percentage of Disability <span className="text-muted-foreground">(optional)</span></label>
              <p id="disPercentHelp" className="text-xs text-muted-foreground mb-2">If you have a certified disability percentage, you may share it. This is only used to personalize accessibility features.</p>
              <input id="disabilityPercentage" type="text" value={disabilityPercentage} onChange={(e) => setDisabilityPercentage(e.target.value)} className="input-field" placeholder="e.g. 40%" aria-describedby="disPercentHelp" />
            </div>

            <div>
              <label htmlFor="commStyle" className="block text-sm font-medium mb-1">Preferred Communication</label>
              <select id="commStyle" value={commStyle} onChange={(e) => setCommStyle(e.target.value)} className="input-field appearance-none">
                <option>Text</option>
                <option>Voice</option>
                <option>Video</option>
                <option>AAC Tools</option>
              </select>
            </div>
          </fieldset>
        )}

        {/* Step 3: Interests */}
        {step === 3 && (
          <fieldset className="space-y-5">
            <legend className="sr-only">Choose your interests</legend>
            <div className="bg-secondary/50 rounded-xl p-4 text-sm text-secondary-foreground flex gap-2 items-start">
              <Sparkles className="w-5 h-5 mt-0.5 shrink-0" aria-hidden="true" />
              <span>Pick interests to connect with like-minded people. You can always update these later!</span>
            </div>

            <div className="max-h-72 overflow-y-auto pr-1 space-y-4" tabIndex={0} role="group" aria-label="Interest categories">
              {Object.entries(INTEREST_CATEGORIES).map(([category, interests]) => (
                <div key={category}>
                  <h3 className="text-sm font-semibold mb-2 font-heading">{category}</h3>
                  <div className="flex flex-wrap gap-2">
                    {interests.map((interest) => {
                      const selected = selectedInterests.includes(interest);
                      return (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => toggleInterest(interest)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                            selected
                              ? "bg-primary text-primary-foreground border-primary shadow-warm"
                              : "bg-muted text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                          }`}
                          aria-pressed={selected}
                        >
                          {interest}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Custom interest */}
            <div className="flex gap-2">
              <input
                type="text"
                value={customInterest}
                onChange={(e) => setCustomInterest(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomInterest())}
                className="input-field flex-1"
                placeholder="Add a custom interest..."
                aria-label="Add a custom interest"
              />
              <Button type="button" size="sm" variant="outline" onClick={addCustomInterest} aria-label="Add custom interest">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Selected summary */}
            {selectedInterests.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">{selectedInterests.length} selected</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedInterests.map((i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      {i}
                      <button type="button" onClick={() => toggleInterest(i)} aria-label={`Remove ${i}`}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </fieldset>
        )}

        {/* Step 4: Preferences & Privacy */}
        {step === 4 && (
          <fieldset className="space-y-5">
            <legend className="sr-only">Accessibility preferences and privacy</legend>

            <div>
              <h3 className="text-sm font-semibold mb-3 font-heading">Accessibility Preferences</h3>
              <div className="space-y-2">
                {ACCESSIBILITY_PREFS.map((pref) => {
                  const checked = accessibilityPrefs.includes(pref.id);
                  return (
                    <label
                      key={pref.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        checked ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleAccessibility(pref.id)}
                        className="sr-only"
                        aria-label={pref.label}
                      />
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${checked ? "bg-primary border-primary" : "border-input"}`}>
                        {checked && <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{pref.label}</p>
                        <p className="text-xs text-muted-foreground">{pref.desc}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-3 font-heading">Community Tags</h3>
              <p className="text-xs text-muted-foreground mb-2">Choose communities you'd like to be part of:</p>
              <div className="flex flex-wrap gap-2">
                {COMMUNITY_TAGS.map((tag) => {
                  const selected = communityTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleCommunityTag(tag)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                        selected
                          ? "bg-accent text-accent-foreground border-accent"
                          : "bg-muted text-muted-foreground border-border hover:border-accent/50"
                      }`}
                      aria-pressed={selected}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Privacy notice */}
            <div className="bg-secondary/50 rounded-xl p-4 text-sm text-secondary-foreground flex gap-2 items-start">
              <Shield className="w-5 h-5 mt-0.5 shrink-0" aria-hidden="true" />
              <span>Your identity, accessibility needs, and interests are private and only used to improve your experience and help you connect safely with others.</span>
            </div>
          </fieldset>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3 mt-6">
          {step > 1 && (
            <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(step - 1)}>
              <ChevronLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          )}
          {step < TOTAL_STEPS ? (
            <Button
              type="button"
              variant="hero"
              className="flex-1"
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
            >
              Continue <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="hero"
              className="flex-1"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create Account 🎉"}
            </Button>
          )}
        </div>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline font-medium">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
