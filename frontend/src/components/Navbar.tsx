import { Link, useLocation } from "react-router-dom";
import { Heart, Menu, X, MessageCircle, LogOut, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const navItems = [
  { label: "Home", path: "/" },
  { label: "Find Your Match", path: "/matching" },
  { label: "About Us", path: "/about" },
  { label: "Community", path: "/community" },
  { label: "Subscription", path: "/subscription" },
  { label: "Anonymous Dating", path: "/anonymous-dating" },
];

const Navbar = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
  };

  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-heading text-2xl font-extrabold text-primary">TogetherAble</span>
          <Heart className="w-5 h-5 text-heart animate-pulse-heart fill-heart" />
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                location.pathname === item.path
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              <Link
                to="/messages"
                className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors relative"
                aria-label="Messages"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-primary rounded-full border-2 border-card" />
              </Link>
              <Link
                to="/profile"
                className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
                aria-label="Profile"
              >
                <UserCircle className="w-5 h-5" />
              </Link>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-1" /> Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/signup">Sign Up</Link>
              </Button>
              <Button variant="hero" size="sm" asChild>
                <Link to="/login">Login</Link>
              </Button>
            </>
          )}
        </div>

        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileOpen && (
        <nav className="md:hidden border-t border-border bg-card p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === item.path
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <div className="flex gap-2 pt-2">
            {user ? (
              <Button variant="ghost" className="flex-1" onClick={() => { handleSignOut(); setMobileOpen(false); }}>
                Sign Out
              </Button>
            ) : (
              <>
                <Button variant="ghost" className="flex-1" asChild>
                  <Link to="/signup">Sign Up</Link>
                </Button>
                <Button variant="hero" className="flex-1" asChild>
                  <Link to="/login">Login</Link>
                </Button>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
};

export default Navbar;
