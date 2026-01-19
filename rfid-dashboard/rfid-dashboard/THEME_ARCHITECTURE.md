# Theme System Architecture & Visual Guide

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        App.tsx                              │
│                  (Wrapped with ThemeProvider)               │
└──────────────────────────┬──────────────────────────────────┘
                           │
        ┌──────────────────┴──────────────────┐
        │                                     │
        ▼                                     ▼
┌──────────────────┐              ┌──────────────────┐
│  Dashboard.tsx   │              │  TagManagement   │
│  (uses theme)    │              │   .tsx (uses     │
└────────┬─────────┘              │    theme)        │
         │                        └────────┬─────────┘
         │                                 │
         │    ┌────────────────────────────┤
         │    │                            │
         ▼    ▼                            ▼
    ┌──────────────────┐      ┌──────────────────┐
    │   Themes.tsx     │      │   Setting.tsx    │
    │  (customization) │      │   (if themed)    │
    └────────┬─────────┘      └──────────────────┘
             │
             │ Updates via
             ▼
    ┌──────────────────────────┐
    │    ThemeContext.tsx      │
    │  ┌────────────────────┐  │
    │  │  theme state       │  │
    │  │  updateTheme()     │  │
    │  │  updateElement     │  │
    │  │  resetTheme()      │  │
    │  │  uploadBgImage()   │  │
    │  └────────────────────┘  │
    └─────────┬────────────────┘
              │
              ▼
    ┌──────────────────────────┐
    │  localStorage            │
    │ "rfid_theme_config"      │
    └──────────────────────────┘
```

## Data Flow Diagram

```
User Action in Themes.tsx
        │
        ├─ Upload Image → FileReader → base64 → uploadBackgroundImage()
        │                                            │
        ├─ Select Color → updateTheme()             │
        │                       │                   │
        ├─ Change Font Size → updateElementStyle()  │
        │                            │              │
        └─────────────────────┬──────┴──────┬───────┘
                              │
                              ▼
                    ThemeContext.tsx
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
                 Update                Save to
               state in               localStorage
               React                      │
                    │                     ▼
                    │            "rfid_theme_config"
                    │                 (JSON)
                    │
        ┌───────────┴─────────────────────────────┐
        │                                         │
        ▼                                         ▼
    Dashboard.tsx                          TagManagement.tsx
    (reads theme & applies)                (reads theme & applies)
        │                                         │
        ├─> theme.elements.title                 ├─> theme.elements.welcome
        ├─> theme.elements.subtitle              └─> theme.backgroundColor
        ├─> theme.elements.welcome
        ├─> theme.backgroundColor
        └─> theme.backgroundImage
```

## File Organization

```
src/
│
├── contexts/
│   └── ThemeContext.tsx
│       ├── ThemeProvider component
│       └── useTheme() hook
│
├── types/
│   └── theme.ts
│       ├── ThemeConfig interface
│       ├── ElementStyle interface
│       ├── ThemeContextType interface
│       └── DEFAULT_THEME constant
│
├── utils/
│   └── themeUtils.ts
│       ├── applyThemeStyles()
│       ├── exportTheme()
│       ├── importTheme()
│       └── generateThemeCSS()
│
├── views/admin/
│   ├── Themes.tsx (CUSTOMIZATION UI)
│   │   ├── Background Settings Tab
│   │   │   ├── Image Upload
│   │   │   └── Color Picker
│   │   └── Element Styles Tab
│   │       ├── Element Selector
│   │       └── Style Controls
│   │
│   ├── Dashboard.tsx (USES THEME)
│   ├── TagManagement.tsx (USES THEME)
│   └── Setting.tsx (Optional)
│
├── examples/
│   └── ThemeUsageExamples.tsx
│
├── App.tsx (WRAPPED WITH THEMEPROVIDER)
├── THEME_IMPLEMENTATION_SUMMARY.md
├── THEMING_GUIDE.md
└── THEME_ARCHITECTURE.md (this file)
```

## Component Interaction Flow

### 1. Initialization
```
App.tsx loads
    │
    ├─> ThemeProvider wraps application
    │        │
    │        ├─> Loads from localStorage (key: "rfid_theme_config")
    │        └─> Falls back to DEFAULT_THEME
    │
    └─> Child components receive context
         │
         ├─> Dashboard.tsx reads theme
         ├─> TagManagement.tsx reads theme
         └─> Themes.tsx can modify theme
```

### 2. User Customization
```
User opens Themes.tsx
    │
    ├─> Background Settings Tab
    │        │
    │        ├─> Upload Image
    │        │    └─> uploadBackgroundImage() → updateTheme()
    │        │
    │        └─> Color Picker
    │             └─> updateTheme({ backgroundColor: ... })
    │
    └─> Element Styles Tab
         │
         ├─> Select Element (title, subtitle, card, content)
         │
         └─> Modify Style
              │
              ├─> Background Color → updateElementStyle()
              ├─> Text Color → updateElementStyle()
              └─> Font Size → updateElementStyle()
                   │
                   └─> Saved to localStorage immediately
                        │
                        └─> All components using useTheme() re-render
                             with new styles
```

### 3. Theme Application
```
Components using useTheme()
    │
    ├─> const { theme } = useTheme()
    │
    └─> Apply theme styles:
         │
         ├─> Inline styles: style={theme.elements.title}
         │
         ├─> Mixed approach:
         │   style={{ ...theme.elements.welcome, customProp: value }}
         │
         └─> Via utilities:
             const styles = applyThemeStyles("title", theme)
             style={styles}
```

## State Management Flow

```
┌─────────────────────────────────────────────┐
│         ThemeContext State                  │
├─────────────────────────────────────────────┤
│                                             │
│  theme: {                                   │
│    backgroundImage: string | null          │
│    backgroundColor: string                 │
│    elements: {                              │
│      title: ElementStyle                    │
│      subtitle: ElementStyle                 │
│      card: ElementStyle                     │
│      content: ElementStyle                  │
│      [key: string]: ElementStyle            │
│    }                                        │
│  }                                          │
│                                             │
│  updateTheme: (partial: Partial<TC>) => {} │
│  updateElementStyle: (id, style) => {}     │
│  resetTheme: () => {}                      │
│  uploadBackgroundImage: (file) => {}       │
│                                             │
└─────────────────────────────────────────────┘
         ▲                      │
         │                      │
    Read by             Written by
    all components      Themes.tsx
    via useTheme()
         │                      │
         ├──────────┬───────────┘
                    │
                    ▼
         localStorage: "rfid_theme_config"
              (persistent storage)
```

## Element Styling Properties

```
Each element (title, subtitle, card, content) has:

├─ backgroundColor
│   ├─ Type: CSS color string
│   ├─ Format: hex (#ffffff), rgb, rgba, named colors
│   └─ Default: varies by element
│
├─ color (text color)
│   ├─ Type: CSS color string
│   ├─ Format: hex, rgb, rgba, named colors
│   └─ Default: varies by element
│
└─ fontSize
    ├─ Type: CSS font-size value
    ├─ Format: rem, px, em units
    └─ Default: 1rem (varies by element)

Available font sizes in UI:
  - 0.75rem  (Small)
  - 0.875rem (Default)
  - 1rem     (Medium)
  - 1.125rem (Large)
  - 1.25rem  (Extra Large)
  - 1.5rem   (2XL)
  - 1.875rem (3XL)
  - 2.25rem  (4XL)
  - 3rem     (5XL)
```

## Adding New Elements

```
Step 1: Update DEFAULT_THEME
────────────────────────────
src/types/theme.ts:

export const DEFAULT_THEME: ThemeConfig = {
  backgroundImage: null,
  backgroundColor: "#ffffff",
  elements: {
    // ... existing elements
    "badge": {                    // NEW
      backgroundColor: "#e0e7ff",
      color: "#4f46e5",
      fontSize: "0.875rem",
    },
  },
};


Step 2: Use in Component
──────────────────────────
src/views/admin/MyComponent.tsx:

const { theme } = useTheme();

<div style={theme.elements.badge}>
  New Themed Badge
</div>


Result:
───────
✓ Element appears in Element Styles selector
✓ User can customize it in Themes.tsx
✓ Changes persist in localStorage
✓ All instances update in real-time
```

## CSS Classes Generated (Optional)

```
If using generateThemeCSS() utility:

:root {
  --theme-bg-color: #ffffff;
}

.theme-main {
  background-color: #ffffff;
}

.theme-title {
  background-color: rgba(255, 255, 255, 0.4);
  color: #111827;
  font-size: 1.875rem;
}

.theme-subtitle {
  background-color: rgba(255, 255, 255, 0.3);
  color: #1f2937;
  font-size: 1.25rem;
}

.theme-card {
  background-color: rgba(255, 255, 255, 0.3);
  color: #1f2937;
  font-size: 1.25rem;
}

.theme-content {
  background-color: transparent;
  color: #1f2937;
  font-size: 1rem;
}
```

## Performance Metrics

```
Bundle Size Impact:
  - ThemeContext.tsx:     ~2 KB
  - theme.ts:             <1 KB
  - themeUtils.ts:        <1 KB
  - Total:                ~4 KB

Runtime Performance:
  - Context re-renders:   Only components using useTheme()
  - Storage writes:       Immediate (async)
  - Storage reads:        Single on app init
  - Memory usage:         Minimal (<100 KB for theme data)
```

## Validation Rules

```
Theme Configuration Validation:

1. backgroundImage
   ├─ Type: string | null
   ├─ Format: data URI (base64) when set
   └─ Max size: 5-10 MB (browser localStorage limit)

2. backgroundColor
   ├─ Type: string
   ├─ Must be valid CSS color
   └─ Examples: #fff, rgba(255,255,255,0.4), white

3. elements[key].backgroundColor
   ├─ Type: string
   ├─ Must be valid CSS color
   └─ Can be transparent, rgba, hex, etc.

4. elements[key].color
   ├─ Type: string
   ├─ Must be valid CSS color
   └─ Should contrast with background

5. elements[key].fontSize
   ├─ Type: string
   ├─ Must be valid CSS font-size
   └─ Recommended: rem units for scaling
```

---

**Last Updated**: January 19, 2026
**Version**: 1.0.0
**Status**: Production Ready
