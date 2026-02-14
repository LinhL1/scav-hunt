import { motion } from "framer-motion";
import { NavLink, useLocation } from "react-router-dom";
import { Map, Users, Camera, ChartBar, Settings } from "lucide-react";

const tabs = [
  { path: "/", label: "Map", icon: Map  },
  { path: "/friends", label: "Feed", icon: Users },
  { path: "/profile", label: "Stats", icon: ChartBar },
  { path: "/settings", label: "Settings", icon: Settings },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/80 backdrop-blur-xl safe-bottom"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const Icon = tab.icon;

          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className="relative flex flex-col items-center gap-0.5 px-4 py-1.5 outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
              aria-label={tab.label}
              aria-current={isActive ? "page" : undefined}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-2.5 h-1 w-8 rounded-full gradient-warm"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                className={`h-5 w-5 transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className={`text-[10px] font-medium transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {tab.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
