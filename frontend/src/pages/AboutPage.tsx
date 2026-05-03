import { Heart, Users, Shield, Sparkles, Target } from "lucide-react";
import teamAasha from "@/assets/team-aasha.jpeg";

const values = [
  { icon: Heart, title: "Inclusion First", desc: "We believe everyone deserves love and connection, regardless of ability." },
  { icon: Users, title: "Community Driven", desc: "Built with input from disability advocates and community leaders." },
  { icon: Shield, title: "Safety & Trust", desc: "Trained moderators and robust safety tools protect our community." },
  { icon: Sparkles, title: "Innovation", desc: "AI-powered matching that understands accessibility needs and lifestyle alignment." },
];

const teamMembers = [
  { name: "Atreyee Das", role: "CTO (Chief Technology Officer)" },
  { name: "Ankita Singh", role: "Community Manager" },
  { name: "Shreeyanka Sahoo", role: "Marketing Lead" },
  { name: "Anwesha Mitra", role: "Founder & CEO" },
];

const AboutPage = () => (
  <div className="min-h-screen">
    <section className="bg-gradient-hero py-20">
      <div className="container text-center max-w-3xl">
        <h1 className="font-heading text-4xl md:text-5xl font-extrabold">About <span className="text-gradient-primary">TogetherAble</span></h1>
        <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
          We are a passionate and multidisciplinary team of four women, united by a common goal — creating meaningful social impact through inclusive design and ethical technology.
        </p>
      </div>
    </section>

    {/* Team Aasha Section */}
    <section className="py-20">
      <div className="container grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-2">
          <div className="rounded-3xl overflow-hidden shadow-warm">
            <img src={teamAasha} alt="Team Aasha — the founding team of TogetherAble" className="w-full h-auto" />
          </div>
          <div className="flex flex-wrap gap-2 justify-center pt-3">
            {teamMembers.map((m) => (
              <span key={m.name} className="inline-flex flex-col items-center bg-secondary text-secondary-foreground rounded-xl px-3 py-2 text-center">
                <span className="text-sm font-bold font-heading">{m.name}</span>
                <span className="text-xs text-muted-foreground">{m.role}</span>
              </span>
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div>
            <h2 className="font-heading text-3xl font-bold">Meet <span className="text-gradient-primary">Team Aasha</span></h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              At TogetherAble, we are a passionate and multidisciplinary team of four women, each contributing unique skills and perspectives to drive innovation and inclusivity. From technology to community building, marketing to leadership, we are united by a common goal — creating a meaningful social impact through inclusive design and ethical technology.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Our diverse expertise allows us to approach challenges holistically and craft solutions that empower all individuals, especially those often underrepresented in tech spaces.
            </p>
          </div>
          <div className="bg-card rounded-2xl p-6 shadow-card border-l-4 border-primary">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-primary" />
              <h3 className="font-heading text-lg font-bold">Our Mission</h3>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              To create inclusive, accessible tech solutions that empower communities and promote digital equity for all.
            </p>
          </div>
        </div>
      </div>
    </section>

    <section className="py-20 bg-gradient-hero">
      <div className="container">
        <h2 className="font-heading text-3xl font-bold text-center mb-12">Our Values</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v) => (
            <div key={v.title} className="bg-card rounded-2xl p-6 shadow-card text-center">
              <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                <v.icon className="w-7 h-7 text-secondary-foreground" />
              </div>
              <h3 className="font-heading text-lg font-bold">{v.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  </div>
);

export default AboutPage;
