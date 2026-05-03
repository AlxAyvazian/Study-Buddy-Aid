import { Link, useLocation } from "wouter";
import {
  BookOpen, Home, BarChart2, Library, HelpCircle, Sparkles,
  Layers3, ClipboardList, Accessibility, Briefcase, FileText, Search, Calculator, Brain, Timer
} from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navGroups = [
    {
      label: "Study",
      items: [
        { href: "/", label: "Dashboard", icon: Home },
        { href: "/study", label: "Study", icon: BookOpen },
        { href: "/cards", label: "Cards", icon: Library },
        { href: "/progress", label: "Progress", icon: BarChart2 },
        { href: "/help", label: "Help", icon: HelpCircle },
        { href: "/media", label: "Media", icon: Sparkles },
        { href: "/analyze", label: "Analyze", icon: Layers3 },
        { href: "/research", label: "Topic Explorer", icon: Search },
        { href: "/pomodoro", label: "Focus Timer", icon: Timer },
      ],
    },
    {
      label: "Application",
      items: [
        { href: "/premed", label: "Pre-Med Vault", icon: ClipboardList },
        { href: "/career", label: "Career History", icon: Briefcase },
        { href: "/letters", label: "Letter Writer", icon: FileText },
        { href: "/disability", label: "Disability Hub", icon: Accessibility },
        { href: "/calculator-guide", label: "Calculator Strategy", icon: Calculator },
        { href: "/memorization", label: "What to Memorize", icon: Brain },
      ],
    },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row w-full bg-background">
      <nav className="w-full md:w-64 border-b md:border-r border-border bg-card p-5 flex flex-col gap-6 shrink-0">
        <div className="font-serif text-xl font-bold text-primary flex items-center gap-2.5">
          <BookOpen className="w-7 h-7" />
          MCAT Haven
        </div>

        {/* Mobile: flat scrollable row */}
        <div className="flex md:hidden gap-1 overflow-x-auto pb-1">
          {navGroups.flatMap(g => g.items).map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-150 text-sm whitespace-nowrap shrink-0 ${isActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"}`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Desktop: grouped vertical nav */}
        <div className="hidden md:flex flex-col gap-5">
          {navGroups.map(group => (
            <div key={group.label} className="space-y-1">
              <div className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-widest px-3 mb-2">
                {group.label}
              </div>
              {group.items.map((item) => {
                const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-sm ${isActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"}`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </nav>

      <main className="flex-1 p-5 md:p-10 overflow-y-auto w-full max-w-6xl mx-auto">
        {children}
      </main>
    </div>
  );
}
