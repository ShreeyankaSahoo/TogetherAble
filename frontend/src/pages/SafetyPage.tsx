import { Shield, Phone, BookOpen, AlertTriangle, Heart, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

const resources = [
  { icon: Shield, title: "Report & Block", desc: "Instantly report or block any user who makes you uncomfortable. Our team reviews reports within 24 hours." },
  { icon: Phone, title: "Emergency Contacts", desc: "Set up trusted emergency contacts who can be alerted with one tap during a date." },
  { icon: BookOpen, title: "Safety Guides", desc: "Comprehensive guides on safe dating, meeting in public, and protecting your personal information." },
  { icon: Heart, title: "Mental Health Resources", desc: "Access to counseling services, helplines, and mental health articles curated for our community." },
  { icon: AlertTriangle, title: "Scam Prevention", desc: "AI-powered scam detection and tips to identify red flags in conversations." },
  { icon: MessageSquare, title: "Support Chat", desc: "24/7 live support chat with trained moderators who understand accessibility needs." },
];

const SafetyPage = () => (
  <div className="min-h-screen py-10">
    <div className="container max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="font-heading text-3xl md:text-4xl font-bold">Safety & <span className="text-gradient-primary">Support Center</span></h1>
        <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
          Your safety is our priority. We provide robust tools and resources to ensure a secure experience.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {resources.map((r) => (
          <div key={r.title} className="bg-card rounded-2xl shadow-card p-6">
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4">
              <r.icon className="w-6 h-6 text-secondary-foreground" />
            </div>
            <h3 className="font-heading text-lg font-bold">{r.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{r.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-primary/5 rounded-2xl p-8 text-center">
        <h3 className="font-heading text-xl font-bold">Need Immediate Help?</h3>
        <p className="text-sm text-muted-foreground mt-2">Our support team is available 24/7.</p>
        <Button variant="hero" className="mt-4">Contact Support</Button>
      </div>
    </div>
  </div>
);

export default SafetyPage;
