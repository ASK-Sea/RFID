# RFID Dashboard Theming System

## Overview

The RFID Dashboard now includes a comprehensive theming subsystem that allows you to customize the appearance of your dashboard without modifying the component code. Users can customize backgrounds, colors, font sizes, and more through an intuitive interface.

## Features

### 1. **Background Customization**
- **Upload Custom Images**: Upload any image file to set as the dashboard background
- **Background Color**: Choose any color to complement or replace the background image
- Images are stored as base64 data URIs for portability

### 2. **Element Styling**
Customize the following page elements:
- **Title**: Main headings on the dashboard
- **Subtitle**: Secondary headings and descriptions
- **Card**: Content cards and containers
- **Content**: General body text and content areas

Each element supports:
- **Background Color**: Any hex color or CSS color value
- **Text Color**: Control text color for readability
- **Font Size**: Choose from 9 predefined sizes (0.75rem to 3rem)

### 3. **Persistent Storage**
- All theme configurations are saved to `localStorage` as `rfid_theme_config`
- Settings persist across browser sessions
- Easy reset to default theme available

## Project Structure

```
src/
├── contexts/
│   └── ThemeContext.tsx          # Theme context provider and hook
├── types/
│   └── theme.ts                   # Theme configuration types
├── utils/
│   └── themeUtils.ts              # Helper utilities for theme operations
└── views/
    └── admin/
        ├── Themes.tsx             # Theme customization interface
        ├── Dashboard.tsx           # Dashboard with theme support
        └── TagManagement.tsx       # Tag management with theme support
```

## Usage

### For End Users

1. **Access the Themes Page**: Navigate to the Themes section in the sidebar
2. **Customize Background**:
   - Click "Upload Background Image" to select an image file
   - Use the color picker to set a background color
3. **Customize Elements**:
   - Switch to "Element Styles" tab
   - Select an element from the list
   - Adjust background color, text color, and font size
   - Preview changes in real-time
4. **Save**: Changes are automatically saved to browser storage
5. **Reset**: Click "Reset to Default Theme" to restore original styling

### For Developers

#### Using the Theme Context

```tsx
import { useTheme } from "../../contexts/ThemeContext";

const MyComponent: React.FC = () => {
  const { theme, updateTheme, updateElementStyle, resetTheme } = useTheme();

  // Apply theme styles to an element
  return (
    <div style={{
      backgroundColor: theme.elements.title.backgroundColor,
      color: theme.elements.title.color,
      fontSize: theme.elements.title.fontSize,
    }}>
      Themed Content
    </div>
  );
};
```

#### Adding New Themed Elements

1. Update `DEFAULT_THEME` in [src/types/theme.ts](src/types/theme.ts):
```typescript
export const DEFAULT_THEME: ThemeConfig = {
  // ... existing config
  elements: {
    // ... existing elements
    "myNewElement": {
      backgroundColor: "#ffffff",
      color: "#000000",
      fontSize: "1rem",
    },
  },
};
```

2. Use the element in your component:
```tsx
const { theme } = useTheme();

<div style={theme.elements.myNewElement}>
  My Content
</div>
```

3. The new element will automatically appear in the Themes customization interface.

#### Theme Structure

```typescript
interface ThemeConfig {
  // Main background settings
  backgroundImage: string | null;      // Base64 encoded image or null
  backgroundColor: string;              // Hex color or CSS color value
  
  // Element specific styling
  elements: Record<string, ElementStyle>;
}

interface ElementStyle {
  backgroundColor: string;
  color: string;
  fontSize: string;
}
```

#### Available Theme Hooks and Utilities

```typescript
// Get theme context and utilities
const {
  theme,                          // Current theme configuration
  updateTheme,                    // Update full theme or partial theme
  updateElementStyle,             // Update specific element style
  resetTheme,                     // Reset to default theme
  uploadBackgroundImage,          // Upload and store image as base64
} = useTheme();
```

#### Utility Functions

```typescript
import {
  applyThemeStyles,              // Apply element styles as React.CSSProperties
  exportTheme,                   // Export theme as JSON string
  importTheme,                   // Import theme from JSON string
  generateThemeCSS,              // Generate CSS string from theme
} from "../../utils/themeUtils";
```

## API Reference

### ThemeContext.tsx

#### `ThemeProvider` Component
Wraps the application to provide theme context to all child components.

```tsx
<ThemeProvider>
  <AppContent />
</ThemeProvider>
```

#### `useTheme()` Hook
Returns the theme context and utilities.

```typescript
const context = useTheme();
// {
//   theme: ThemeConfig,
//   updateTheme: (newTheme: Partial<ThemeConfig>) => void,
//   updateElementStyle: (elementId: string, style: Partial<ElementStyle>) => void,
//   resetTheme: () => void,
//   uploadBackgroundImage: (file: File) => Promise<void>,
// }
```

### Theme Types (theme.ts)

- **ThemeConfig**: Main theme configuration object
- **ElementStyle**: Individual element styling properties
- **ThemeContextType**: Type definition for the context
- **DEFAULT_THEME**: Default theme configuration

## Default Theme

The default theme includes preset configurations for:
- **Title**: Large white text (1.875rem) on semi-transparent white background
- **Subtitle**: Medium gray text (1.25rem) on lighter semi-transparent background
- **Card**: Medium text on semi-transparent white container
- **Content**: Regular text on transparent background

## Storage

Theme configuration is stored in the browser's `localStorage` under the key `rfid_theme_config`. The data is stored as a JSON string representing the complete `ThemeConfig` object.

### Example Stored Data
```json
{
  "backgroundImage": "data:image/png;base64,...",
  "backgroundColor": "#f3f4f6",
  "elements": {
    "title": {
      "backgroundColor": "rgba(255, 255, 255, 0.4)",
      "color": "#111827",
      "fontSize": "1.875rem"
    },
    ...
  }
}
```

## Performance Considerations

1. **Base64 Images**: Large images converted to base64 may impact storage space and load time. Keep images reasonably sized.
2. **CSS-in-JS**: Theme styles are applied inline using React's style prop. For heavy customization, consider using CSS classes.
3. **Storage Limits**: Browser localStorage typically has a 5-10MB limit. Theme data usually uses minimal space (<1MB).

## Extending the System

### Adding Export/Import Functionality

```tsx
const { theme } = useTheme();

// Export theme
const themeJSON = exportTheme(theme);
downloadAsJSON(themeJSON, 'theme-config.json');

// Import theme
const file = selectedFile;
const themeJSON = await file.text();
const importedTheme = importTheme(themeJSON);
if (importedTheme) {
  updateTheme(importedTheme);
}
```

### Creating Theme Presets

Create predefined themes for quick selection:

```typescript
const PRESET_THEMES = {
  light: { /* light theme config */ },
  dark: { /* dark theme config */ },
  highContrast: { /* high contrast theme config */ },
};
```

## Troubleshooting

### Changes Not Persisting
- Clear browser cache and localStorage
- Check if browser allows localStorage
- Verify theme is wrapped with `ThemeProvider`

### Styling Not Applied
- Ensure component uses `useTheme()` hook
- Check that element IDs match those in `DEFAULT_THEME`
- Verify inline styles don't have conflicting Tailwind classes

### Large Images Causing Performance Issues
- Use compressed images
- Resize images before uploading
- Consider limiting file size in upload handler

## Browser Compatibility

The theming system works in all modern browsers that support:
- React Context API
- File API (for image uploads)
- localStorage
- CSS custom properties (CSS variables)

## Future Enhancements

Potential improvements for the theming system:
1. **Theme Presets**: Pre-built color schemes
2. **Dark Mode Support**: Automatic dark mode detection
3. **Export/Import**: Save and load theme configurations as files
4. **Theme Sharing**: Share themes across team members
5. **Animation Support**: Add transition and animation customization
6. **Advanced Typography**: Support for custom fonts and font weights
7. **Responsive Themes**: Different styles for different screen sizes
