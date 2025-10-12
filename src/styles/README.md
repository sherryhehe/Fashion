# Styles Directory

This directory contains all global styles and CSS files for the application.

## File Structure

- **globals.css** - Global styles and Tailwind directives
- **app.css** - Main application styles from the template
- **app.min.css** - Minified version
- **icons.css** - Icon library styles
- **vendor.min.css** - Third-party vendor styles
- **Mobile-specific styles:**
  - `burger-menu-mobile.css` - Mobile burger menu styles
  - `header-mobile.css` - Mobile header styles
  - `layout-mobile.css` - Mobile layout styles
  - `sidebar-mobile.css` - Mobile sidebar styles

## Usage

Import global styles in the root layout:

```tsx
import '@/styles/globals.css';
```

The template CSS files are linked directly in the HTML head for optimal performance.

## Best Practices

- Keep global styles minimal
- Use Tailwind utility classes where possible
- Component-specific styles should use CSS modules
- Mobile-first responsive design approach

