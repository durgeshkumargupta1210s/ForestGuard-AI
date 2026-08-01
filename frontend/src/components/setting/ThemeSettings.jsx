import { useEffect, useState } from "react";

import { Moon, Sun, Monitor } from "lucide-react";

function ThemeSettings() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const applyTheme = (selectedTheme) => {
    localStorage.setItem(
      "theme",

      selectedTheme,
    );

    const html = document.documentElement;

    html.classList.remove(
      "light",

      "dark",
    );

    if (selectedTheme === "system") {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;

      html.classList.add(prefersDark ? "dark" : "light");
    } else {
      html.classList.add(selectedTheme);
    }
  };

  const options = [
    {
      title: "Dark",

      value: "dark",

      icon: Moon,
    },

    {
      title: "Light",

      value: "light",

      icon: Sun,
    },

    {
      title: "System",

      value: "system",

      icon: Monitor,
    },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 mt-8">
      <h2 className="text-2xl font-bold mb-6">Theme Settings</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {options.map((item) => (
          <button
            key={item.value}
            onClick={() => setTheme(item.value)}
            className={`

                border

                rounded-2xl

                p-6

                transition

                flex

                flex-col

                items-center

                gap-4

                ${
                  theme === item.value
                    ? "border-green-500 bg-green-600/20"
                    : "border-slate-700 hover:border-green-500"
                }

              `}
          >
            <item.icon size={36} />

            <span className="font-semibold">{item.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default ThemeSettings;
