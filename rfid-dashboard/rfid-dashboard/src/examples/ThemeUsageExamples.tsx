// Example: How to Use the Theming System in Your Components

import React from "react";
import { useTheme } from "../contexts/ThemeContext";
import type { ThemeConfig } from "../types/theme";

/**
 * Example 1: Using theme styles directly
 */
export const SimpleThemedComponent = () => {
  const { theme } = useTheme();

  return (
    <div style={theme.elements.welcome}>
      This div will use the welcome theme styling
    </div>
  );
};

/**
 * Example 2: Creating a reusable themed component
 */
interface ThemedContainerProps {
  elementType: keyof ThemeConfig["elements"];
  children: React.ReactNode;
  className?: string;
}

export const ThemedContainer: React.FC<ThemedContainerProps> = ({
  elementType,
  children,
  className = "",
}) => {
  const { theme } = useTheme();

  return (
    <div style={theme.elements[elementType]} className={className}>
      {children}
    </div>
  );
};

// Usage:
// <ThemedContainer elementType="title">My Title</ThemedContainer>
// <ThemedContainer elementType="card">Card content</ThemedContainer>

/**
 * Example 3: Mixing theme styles with Tailwind classes
 */
export const HybridThemedComponent = () => {
  const { theme } = useTheme();

  return (
    <div
      style={theme.elements.welcome}
      className="p-4 rounded-lg shadow-lg" // Tailwind classes still work
    >
      <h2 style={{ fontSize: theme.elements.title.fontSize }}>
        Hybrid Styling Example
      </h2>
      <p style={{ color: theme.elements.date.color }}>
        Mix theme properties with Tailwind classes
      </p>
    </div>
  );
};

/**
 * Example 4: Using updateTheme to modify theme
 */
export const ThemeCustomizationComponent = () => {
  const { theme, updateTheme, updateElementStyle } = useTheme();

  const handleChangeTitleColor = () => {
    updateElementStyle("title", {
      color: "#ff0000", // Red
    });
  };

  const handleChangeBackgroundColor = () => {
    updateTheme({
      backgroundColor: "#f0f0f0",
    });
  };

  return (
    <div>
      <button onClick={handleChangeTitleColor}>Change Title to Red</button>
      <button onClick={handleChangeBackgroundColor}>Change BG to Light Gray</button>
    </div>
  );
};

/**
 * Example 5: Adding a new element to the theme
 * 
 * Step 1: Update DEFAULT_THEME in src/types/theme.ts
 * 
 * export const DEFAULT_THEME: ThemeConfig = {
 *   // ... existing config
 *   elements: {
 *     // ... existing elements
 *     "button": {
 *       backgroundColor: "#3b82f6",
 *       color: "#ffffff",
 *       fontSize: "1rem",
 *     },
 *   },
 * };
 * 
 * Step 2: Use it in your component
 */
export const ButtonWithTheme = () => {
  const { theme } = useTheme();

  return (
    <button style={theme.elements.button || { backgroundColor: "#3b82f6", color: "#ffffff", fontSize: "1rem" }}>
      Themed Button
    </button>
  );
};

/**
 * Example 6: Creating conditional theme styles
 */
export const ConditionalThemedComponent = ({
  isHighlight,
}: {
  isHighlight: boolean;
}) => {
  const { theme } = useTheme();

  return (
    <div
      style={{
        ...theme.elements.welcome,
        backgroundColor: isHighlight
          ? "#fef08a" // Light yellow highlight
          : theme.elements.welcome.backgroundColor,
      }}
    >
      Content with conditional highlighting
    </div>
  );
};

/**
 * Example 7: Using theme in DataTable or List components
 */
interface Item {
  id: string;
  name: string;
  description: string;
}

export const ThemedList: React.FC<{ items: Item[] }> = ({ items }) => {
  const { theme } = useTheme();

  return (
    <div>
      {items.map((item) => (
        <div
          key={item.id}
          style={{
            backgroundColor: theme.elements.welcome.backgroundColor,
            borderBottom: `1px solid ${theme.elements.date.color}`,
            padding: "16px",
          }}
        >
          <h3 style={{ fontSize: theme.elements.subtitle.fontSize }}>
            {item.name}
          </h3>
          <p
            style={{
              color: theme.elements.date.color,
              fontSize: theme.elements.date.fontSize,
            }}
          >
            {item.description}
          </p>
        </div>
      ))}
    </div>
  );
};

/**
 * Example 8: Using theme utilities
 */
import {
  applyThemeStyles,
  generateThemeCSS,
  exportTheme,
} from "../utils/themeUtils";

export const UtilitiesExample = () => {
  const { theme } = useTheme();

  // Get styles as React.CSSProperties
  const titleStyles = applyThemeStyles("title", theme);

  // Export current theme as JSON
  const handleExport = () => {
    const themeJSON = exportTheme(theme);
    console.log("Current theme:", themeJSON);
  };

  return (
    <div>
      <div style={titleStyles}>Using applyThemeStyles utility</div>
      <button onClick={handleExport}>Export Theme as JSON</button>
    </div>
  );
};

/**
 * Example 9: Complete dashboard-like component
 */
export const ThemedDashboard = () => {
  const { theme } = useTheme();

  return (
    <div style={{ backgroundColor: theme.backgroundColor }}>
      {/* Header */}
      <header style={theme.elements.title} className="p-4">
        <h1>Dashboard Title</h1>
      </header>

      {/* Content Grid */}
      <div className="grid grid-cols-2 gap-4 p-4">
        {/* Card 1 */}
        <div style={theme.elements.welcome} className="p-4 rounded-lg">
          <h2 style={{ fontSize: theme.elements.subtitle.fontSize }}>Card 1</h2>
          <p style={{ color: theme.elements.date.color }}>
            Content goes here
          </p>
        </div>

        {/* Card 2 */}
        <div style={theme.elements.welcome} className="p-4 rounded-lg">
          <h2 style={{ fontSize: theme.elements.subtitle.fontSize }}>Card 2</h2>
          <p style={{ color: theme.elements.date.color }}>
            Content goes here
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Example 10: Accessing theme in useEffect
 */
export const ThemeAwareComponent = () => {
  const { theme } = useTheme();

  React.useEffect(() => {
    // This will run whenever theme changes
    console.log("Theme updated:", theme);

    // You can update DOM directly if needed
    document.documentElement.style.setProperty(
      "--theme-primary-color",
      theme.elements.welcome.backgroundColor
    );
  }, [theme]);

  return (
    <div>
      <p>Check console for theme changes</p>
    </div>
  );
};
