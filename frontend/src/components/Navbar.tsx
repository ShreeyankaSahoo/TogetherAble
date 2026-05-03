import { Link, useLocation, useNavigate } from "react-router-dom";
import { Heart, Menu, X, LogOut, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const navItems = [
  { label: "Home", path: "/" },
  { label: "Find Your Match", path: "/matching" },
  { label: "Messages", path: "/messages" },
  { label: "About Us", path: "/about" },
  { label: "Community", path: "/community" },
  { label: "Subscription", path: "/subscription" },
  { label: "Anonymous Dating", path: "/anonymous-dating" },
];

interface StoredUser {
  _id: string;
  name?: string;
  email?: string;
}

const getStoredUser = (): StoredUser | null => {
  try {
    const rawUser = localStorage.getItem("user");
    if (!rawUser) return null;

    const parsedUser = JSON.parse(rawUser) as Partial<StoredUser>;
    if (!parsedUser?._id) return null;

    return {
      _id: parsedUser._id,
      name: parsedUser.name,
      email: parsedUser.email,
    };
  } catch (err) {
    console.log("Failed to read user from localStorage:", err);
    return null;
  }
};

const getUserLabel = (user: StoredUser) => user.name || user.email || "User";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<StoredUser | null>(() => getStoredUser());

  useEffect(() => {
    const syncUser = () => setUser(getStoredUser());

    syncUser();
    window.addEventListener("storage", syncUser);
    window.addEventListener("auth-change", syncUser);

    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("auth-change", syncUser);
    };
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setMobileOpen(false);
    window.dispatchEvent(new Event("auth-change"));
    toast.success("Signed out");
    navigate("/login");
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
              <span className="text-sm font-medium text-foreground">
                Hi, {getUserLabel(user)}
              </span>
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
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-4 py-2 text-sm font-medium">
                  <UserCircle className="w-4 h-4" />
                  Hi, {getUserLabel(user)}
                </div>
                <Button variant="ghost" className="w-full" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </div>
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
