// Theme configuration types

export interface ElementStyle {
  backgroundColor: string;
  color: string;
  fontSize: string;
}

export interface ThemeConfig {
  // Main background settings
  backgroundImage: string | null;
  backgroundColor: string;
  
  // Element specific styling
  elements: Record<string, ElementStyle>;
}

export interface ThemeContextType {
  theme: ThemeConfig;
  updateTheme: (newTheme: Partial<ThemeConfig>) => void;
  updateElementStyle: (elementId: string, style: Partial<ElementStyle>) => void;
  resetTheme: () => void;
  uploadBackgroundImage: (file: File) => Promise<void>;
}

// Default theme
export const DEFAULT_THEME: ThemeConfig = {
  backgroundImage: null,
  backgroundColor: "#ffffff",
  elements: {
    "title": {
      backgroundColor: "rgba(255, 255, 255, 0.4)",
      color: "#111827",
      fontSize: "1.875rem",
    },
    "subtitle": {
      backgroundColor: "rgba(255, 255, 255, 0.3)",
      color: "#1f2937",
      fontSize: "1.25rem",
    },
    "welcome": {
      backgroundColor: "rgba(255, 255, 255, 0.3)",
      color: "#1f2937",
      fontSize: "1.25rem",
    },
    "date": {
      backgroundColor: "transparent",
      color: "#1f2937",
      fontSize: "1rem",
    },
  },
};
