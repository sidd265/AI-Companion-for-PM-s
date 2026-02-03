import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="notion-sidebar-item w-full"
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? (
        <Sun className="w-[18px] h-[18px] opacity-60" strokeWidth={2} />
      ) : (
        <Moon className="w-[18px] h-[18px] opacity-60" strokeWidth={2} />
      )}
      <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
    </button>
  );
}
