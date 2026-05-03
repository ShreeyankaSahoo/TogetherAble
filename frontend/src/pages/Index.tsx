import ProfileCard from "@/components/ProfileCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Heart, Shield, Users, Sparkles, Eye, Mic } from "lucide-react";
import profile1 from "@/assets/profile1.jpg";
import profile2 from "@/assets/profile2.jpg";
import profile3 from "@/assets/profile3.jpg";
import profile4 from "@/assets/profile4.jpg";
import heroCommunity from "@/assets/hero-community.jpg";

const features = [
  { icon: Eye, title: "High Contrast UI", desc: "Designed for visual accessibility with adjustable text sizes and contrast modes." },
  { icon: Mic, title: "Voice Interaction", desc: "Navigate and interact using voice commands and screen reader support." },
  { icon: Sparkles, title: "AI Matching", desc: "Smart compatibility based on lifestyle, communication style, and accessibility needs." },
  { icon: Shield, title: "Safe Spaces", desc: "Trained moderators and mental health resources to support every user." },
  { icon: Users, title: "Community Forums", desc: "Connect through group chats, forums, and support channels." },
  { icon: Heart, title: "Inclusive by Design", desc: "Built for everyone — disabilities, neurodivergence, and all abilities." },
];

const sampleProfiles = [
  { name: "Sarah Mitchell", distance: "2.3 km away", image: profile1, compatibility: 92 },
  { name: "James Rivera", distance: "1.5 km away", image: profile2, compatibility: 87, isPremium: true },
  { name: "Maya Johnson", distance: "3.1 km away", image: profile3, compatibility: 78 },
  { name: "Alex Thompson", distance: "0.8 km away", image: profile4, compatibility: 95 },
];

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-gradient-hero overflow-hidden">
        <div className="container py-20 md:py-28">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
                Connection Without <span className="text-gradient-primary">Barriers.</span>
              </h1>
              <p className="mt-5 text-lg text-muted-foreground max-w-lg leading-relaxed">
                A safe and inclusive place for everyone to meet, talk, and belong — discovering real compatibility before revealing who you are.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button variant="hero" size="lg" asChild>
                  <Link to="/signup">Get Started Free</Link>
                </Button>
                <Button variant="outline" size="lg" className="rounded-full" asChild>
                  <Link to="/matching">Find Your Match</Link>
                </Button>
              </div>
            </div>
            <div className="relative flex justify-center">
              <div className="rounded-3xl overflow-hidden shadow-warm max-w-md">
                <img src={heroCommunity} alt="Diverse community together" className="w-full h-auto" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="font-heading text-3xl md:text-4xl font-bold">Built for <span className="text-gradient-primary">Everyone</span></h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Every feature is designed with accessibility and inclusion at its core.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-card rounded-2xl p-6 shadow-card hover:shadow-warm transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4">
                  <f.icon className="w-6 h-6 text-secondary-foreground" />
                </div>
                <h3 className="font-heading text-lg font-bold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Profile Feed */}
      <section className="py-20 bg-gradient-hero">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold">Discover People Near You</h2>
            <p className="mt-3 text-muted-foreground">Browse profiles and find someone special.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {sampleProfiles.map((p) => (
              <ProfileCard key={p.name} {...p} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold">Ready to Find Your Match?</h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Join thousands of users who have found meaningful connections through TogetherAble.
          </p>
          <Button variant="hero" size="lg" className="mt-8" asChild>
            <Link to="/signup">Join TogetherAble Today</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
