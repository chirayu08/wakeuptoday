import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    const shouldUseDark = savedTheme === "dark" || (!savedTheme && systemPrefersDark);
    setIsDark(shouldUseDark);
    
    // Apply theme to document
    if (shouldUseDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    
    // Save to localStorage
    localStorage.setItem("theme", newTheme ? "dark" : "light");
    
    // Apply to document
    if (newTheme) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="fixed top-4 left-4 z-50 h-12 w-12 rounded-full bg-card/80 backdrop-blur-sm border-2 border-primary/20 hover:bg-primary/10 hover:border-primary/40 transition-all duration-300 shadow-lg"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <Sun size={22} className="text-primary animate-in spin-in-180 duration-300" />
      ) : (
        <Moon size={22} className="text-primary animate-in spin-in-180 duration-300" />
      )}
    </Button>
  );
};

export default ThemeToggle;