// Theme utilities

import { ThemeConfig } from "../types/theme";

/**
 * Apply theme styles to an element
 */
export const applyThemeStyles = (
  elementId: string,
  theme: ThemeConfig
): React.CSSProperties => {
  const elementStyle = theme.elements[elementId];
  
  if (!elementStyle) {
    return {};
  }

  return {
    backgroundColor: elementStyle.backgroundColor,
    color: elementStyle.color,
    fontSize: elementStyle.fontSize,
  };
};

/**
 * Export current theme configuration as JSON
 */
export const exportTheme = (theme: ThemeConfig): string => {
  return JSON.stringify(theme, null, 2);
};

/**
 * Import theme configuration from JSON string
 */
export const importTheme = (jsonString: string): ThemeConfig | null => {
  try {
    const parsed = JSON.parse(jsonString);
    // Validate the structure
    if (parsed.elements && typeof parsed.backgroundColor === "string") {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
};

/**
 * Generate CSS class from theme (for static styles)
 */
export const generateThemeCSS = (theme: ThemeConfig): string => {
  let css = `:root {
  --theme-bg-color: ${theme.backgroundColor};
}

.theme-main {
  background-color: ${theme.backgroundColor};
}
`;

  Object.entries(theme.elements).forEach(([elementId, style]) => {
    css += `
.theme-${elementId} {
  background-color: ${style.backgroundColor};
  color: ${style.color};
  font-size: ${style.fontSize};
}
`;
  });

  return css;
};
