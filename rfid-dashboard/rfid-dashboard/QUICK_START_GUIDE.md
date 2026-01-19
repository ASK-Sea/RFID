# Quick Start Guide - Theme System

## 🚀 For Users

### How to Access Themes
1. Run your dashboard application
2. Click **"Themes"** in the sidebar
3. You'll see two tabs: **"Background Settings"** and **"Element Styles"**

### Customizing Background
1. Click **"Upload Background Image"** to add a custom background image
2. Use the **color picker** to set a background color
3. Changes apply instantly!

### Customizing Elements
1. Go to **"Element Styles"** tab
2. Select an element from the list:
   - **Title** - Main headings
   - **Subtitle** - Secondary text
   - **Card** - Content containers
   - **Content** - Body text
3. Customize:
   - **Background Color** - Use color picker or type hex value
   - **Text Color** - Use color picker or type hex value
   - **Font Size** - Select from dropdown (9 sizes available)
4. See live preview below
5. All changes are saved automatically!

### Reset to Default
- Click **"Reset to Default Theme"** button to undo all customizations

---

## 💻 For Developers

### Quick Integration
```tsx
import { useTheme } from "../../contexts/ThemeContext";

const MyComponent = () => {
  const { theme } = useTheme();
  
  return <div style={theme.elements.title}>My Content</div>;
};
```

### Available Theme Elements
- `theme.elements.title` - Large headings
- `theme.elements.subtitle` - Medium text
- `theme.elements.welcome` - Container backgrounds
- `theme.elements.date` - Regular text
- `theme.backgroundColor` - Main page background
- `theme.backgroundImage` - Background image (base64)

### All Hook Functions
```tsx
const {
  theme,                    // Current theme config
  updateTheme,              // Update full or partial theme
  updateElementStyle,       // Update specific element
  resetTheme,               // Reset to defaults
  uploadBackgroundImage,    // Upload & convert image
} = useTheme();

// Examples
updateTheme({ backgroundColor: "#f0f0f0" });
updateElementStyle("title", { color: "#ff0000" });
await uploadBackgroundImage(file);
```

### Adding New Themed Elements
1. Open `src/types/theme.ts`
2. Add to `DEFAULT_THEME.elements`:
```typescript
"button": {
  backgroundColor: "#3b82f6",
  color: "#ffffff",
  fontSize: "1rem",
}
```
3. Use in component:
```tsx
const { theme } = useTheme();
<button style={theme.elements.button}>Click me</button>
```
4. **That's it!** The element automatically appears in Themes UI

### Helper Utilities
```tsx
import {
  applyThemeStyles,     // Get styles as object
  exportTheme,          // Export as JSON string
  importTheme,          // Import from JSON string
  generateThemeCSS,     // Generate CSS string
} from "../../utils/themeUtils";
```

---

## 📁 File Structure

```
Created Files:
✓ src/contexts/ThemeContext.tsx      - Main context provider
✓ src/types/theme.ts                 - Type definitions
✓ src/utils/themeUtils.ts            - Helper functions
✓ src/views/admin/Themes.tsx         - Customization UI (updated)
✓ src/examples/ThemeUsageExamples.tsx - Code examples
✓ Documentation files                 - Guides and references

Modified Files:
✓ src/App.tsx                        - Wrapped with ThemeProvider
✓ src/views/admin/Dashboard.tsx      - Uses theme
✓ src/views/admin/TagManagement.tsx  - Uses theme
```

---

## 🎨 Default Colors & Sizes

### Element Defaults
| Element  | BG Color           | Text Color | Font Size |
|----------|-------------------|-----------|-----------|
| title    | rgba(255,255,255,.4) | #111827  | 1.875rem  |
| subtitle | rgba(255,255,255,.3) | #1f2937  | 1.25rem   |
| card     | rgba(255,255,255,.3) | #1f2937  | 1.25rem   |
| content  | transparent         | #1f2937  | 1rem      |

### Font Size Options
- 0.75rem  (Small)
- 0.875rem (Default) 
- 1rem     (Medium)
- 1.125rem (Large)
- 1.25rem  (Extra Large)
- 1.5rem   (2XL)
- 1.875rem (3XL)
- 2.25rem  (4XL)
- 3rem     (5XL)

---

## 🔄 Data Persistence

- **Stored in:** Browser's localStorage
- **Key:** `rfid_theme_config`
- **Format:** JSON
- **Persists:** Across browser sessions
- **Size:** ~1-2 KB (unless large image)

To clear theme manually:
```javascript
localStorage.removeItem("rfid_theme_config");
```

---

## 🐛 Troubleshooting

### Changes not appearing?
- ✓ Make sure you're using `useTheme()` hook
- ✓ Check element ID matches DEFAULT_THEME keys
- ✓ Ensure component is inside `<ThemeProvider>`

### Image too large?
- ✓ Compress images before uploading
- ✓ Resize to ~1920x1080 max
- ✓ Use formats: JPG, PNG, WebP

### Styling conflicts?
- ✓ Theme styles use inline styles (higher specificity)
- ✓ Tailwind classes won't override theme colors
- ✓ Use `!important` sparingly if needed

---

## 📚 Documentation Files

1. **THEMING_GUIDE.md** - Complete user & developer guide
2. **THEME_ARCHITECTURE.md** - System design & data flow
3. **THEME_IMPLEMENTATION_SUMMARY.md** - What was created & why
4. **ThemeUsageExamples.tsx** - 10 code examples
5. **QUICK_START_GUIDE.md** - This file!

---

## ✅ Checklist for Setup

- [x] ThemeProvider wraps App
- [x] Themes.tsx has customization UI
- [x] Dashboard.tsx uses theme
- [x] TagManagement.tsx uses theme
- [x] LocalStorage persistence works
- [x] No TypeScript errors
- [x] Documentation complete

---

## 🎯 Next Steps

1. **Test the theme system**
   - Navigate to Themes page
   - Upload an image
   - Change colors
   - Verify Dashboard reflects changes

2. **Add more themed elements**
   - Follow "Adding New Themed Elements" section above
   - Add your custom element to DEFAULT_THEME

3. **Extend functionality**
   - Export/import themes
   - Create theme presets
   - Add animations
   - See THEMING_GUIDE.md for ideas

---

## 📞 Need Help?

Refer to these files in order:
1. QUICK_START_GUIDE.md (this file) - Get started quickly
2. THEMING_GUIDE.md - Detailed documentation
3. THEME_ARCHITECTURE.md - Understand the design
4. ThemeUsageExamples.tsx - See real code examples

---

**Ready to go!** Start by visiting the Themes page in your dashboard. 🎨
