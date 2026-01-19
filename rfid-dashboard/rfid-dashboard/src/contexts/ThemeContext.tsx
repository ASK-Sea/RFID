import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { ThemeConfig, ThemeContextType, DEFAULT_THEME, ElementStyle } from "../types/theme";

// Create the context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Context Provider Component
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeConfig>(() => {
    const saved = localStorage.getItem("rfid_theme_config");
    return saved ? JSON.parse(saved) : DEFAULT_THEME;
  });

  // Update entire theme or partial theme
  const updateTheme = useCallback((newTheme: Partial<ThemeConfig>) => {
    setTheme((prev) => {
      const updated = { ...prev, ...newTheme };
      localStorage.setItem("rfid_theme_config", JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Update a specific element's style
  const updateElementStyle = useCallback(
    (elementId: string, style: Partial<ElementStyle>) => {
      setTheme((prev) => {
        const updated = {
          ...prev,
          elements: {
            ...prev.elements,
            [elementId]: {
              ...prev.elements[elementId],
              ...style,
            },
          },
        };
        localStorage.setItem("rfid_theme_config", JSON.stringify(updated));
        return updated;
      });
    },
    []
  );

  // Reset to default theme
  const resetTheme = useCallback(() => {
    setTheme(DEFAULT_THEME);
    localStorage.removeItem("rfid_theme_config");
  }, []);

  // Upload background image and convert to base64
  const uploadBackgroundImage = useCallback(async (file: File) => {
    return new Promise<void>((resolve, reject) => {
      // Validate file size (max 3.5MB)
      if (file.size > 3.5 * 1024 * 1024) {
        reject(new Error("Image file is too large. Please use an image smaller than 3.5MB."));
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        reject(new Error("Please select a valid image file."));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const result = e.target?.result as string;
          
          // Clear storage before uploading new image
          localStorage.removeItem("rfid_theme_config");
          
          // Try to store and check if it works
          try {
            updateTheme({ backgroundImage: result });
          } catch (storageError) {
            reject(new Error("Storage quota exceeded. Image is too large."));
            return;
          }
          resolve();
        } catch (error) {
          reject(new Error("Failed to process image"));
        }
      };
      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };
      reader.onabort = () => {
        reject(new Error("File reading was cancelled"));
      };
      reader.readAsDataURL(file);
    });
  }, [updateTheme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        updateTheme,
        updateElementStyle,
        resetTheme,
        uploadBackgroundImage,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// Hook to use the theme context
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
