import { MessageSquare, Users, ShieldCheck, Heart, Mic, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

const forums = [
  { icon: Heart, title: "Dating Tips & Advice", members: 1243, posts: 456, color: "text-heart" },
  { icon: Users, title: "Accessibility & Relationships", members: 892, posts: 312, color: "text-primary" },
  { icon: Mic, title: "Voice Chat Lounge", members: 567, posts: 89, color: "text-accent" },
  { icon: BookOpen, title: "Success Stories", members: 2100, posts: 678, color: "text-success" },
  { icon: ShieldCheck, title: "Mental Health Support", members: 1567, posts: 234, color: "text-primary" },
  { icon: MessageSquare, title: "General Discussion", members: 3456, posts: 1203, color: "text-muted-foreground" },
];

const CommunityPage = () => (
  <div className="min-h-screen py-10">
    <div className="container max-w-4xl">
      <div className="text-center mb-10">
        <h1 className="font-heading text-3xl md:text-4xl font-bold">Community <span className="text-gradient-primary">Forums</span></h1>
        <p className="mt-2 text-muted-foreground">
          Safe spaces for conversation, support, and connection — moderated by trained administrators.
        </p>
      </div>

      <div className="grid gap-4">
        {forums.map((f) => (
          <div key={f.title} className="bg-card rounded-2xl shadow-card p-5 flex items-center gap-4 hover:shadow-warm transition-shadow cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center shrink-0">
              <f.icon className={`w-6 h-6 ${f.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-heading font-bold truncate">{f.title}</h3>
              <p className="text-xs text-muted-foreground">{f.members.toLocaleString()} members · {f.posts} posts</p>
            </div>
            <Button variant="secondary" size="sm">Join</Button>
          </div>
        ))}
      </div>

      <div className="mt-10 bg-card rounded-2xl shadow-card p-6 text-center">
        <h3 className="font-heading text-lg font-bold">Want to create a group?</h3>
        <p className="text-sm text-muted-foreground mt-1">Premium members can create custom forums and group chats.</p>
        <Button variant="premium" size="sm" className="mt-4">Upgrade to Premium</Button>
      </div>
    </div>
  </div>
);

export default CommunityPage;
