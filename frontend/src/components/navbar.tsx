import {
  UserButton,
  useUser
} from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Code2, Home, LayoutDashboard, Command } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

// Shadcn command palette
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

export function Navbar() {
  const location = useLocation();
  const { isSignedIn } = useUser();
  const navigate = useNavigate();

  // 🔑 Command palette state
  const [open, setOpen] = useState(false);

  // Toggle with Ctrl+K / Cmd+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      {/* Navbar */}
      <nav className="border-b bg-background/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex h-14 items-center justify-between">
            {/* Left Section */}
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2">
                <Code2 className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg tracking-tight">
                  OnCompiler
                </span>
              </Link>

              {/* Secondary Nav */}
              <div className="hidden md:flex items-center space-x-1">
                {location.pathname !== "/" && (
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/" className="flex items-center space-x-2">
                      <Home className="h-4 w-4" />
                      <span>Home</span>
                    </Link>
                  </Button>
                )}
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-2">
              {/* Command Palette Trigger */}
              <ThemeToggle/>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpen(true)}
                className="hidden md:flex items-center"
              >
                <span>Command</span>
                <kbd className="ml-2 hidden lg:inline-flex text-xs rounded border bg-muted px-1.5 py-0.5 font-mono">
                  ⌘K
                </kbd>
              </Button>

            

              {!isSignedIn ? (
                <Button variant="default" size="sm" asChild>
                  <Link to="/auth">Login</Link>
                </Button>
              ) : (
                <>
                  <Button
                    variant={
                      location.pathname === "/dashboard" ? "default" : "ghost"
                    }
                    size="sm"
                    className="sm:hidden"
                    asChild
                  >
                    <Link
                      to="/dashboard"
                      className="flex items-center space-x-2"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </Button>
                  <UserButton  />
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Command Palette Dialog */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => navigate("/")}>
              <Home className="mr-2 h-4 w-4" />
              <span>Compiler</span>
            </CommandItem>
            {isSignedIn && (
              <CommandItem onSelect={() => navigate("/dashboard")}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </CommandItem>
            )}
            {!isSignedIn && (
              <CommandItem onSelect={() => navigate("/auth")}>
                <span>Login</span>
              </CommandItem>
            )}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Actions">
            <CommandItem onSelect={() => setOpen(false)}>
              <ThemeToggle />
              <span className="ml-2">Toggle Theme</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
