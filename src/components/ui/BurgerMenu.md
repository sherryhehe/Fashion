# BurgerMenu Component

A universal, reusable burger menu component that provides consistent sidebar toggle functionality across the entire application.

## Features

- ✅ **Universal Usage**: Works consistently across all pages
- ✅ **Mobile Responsive**: Optimized for touch interactions
- ✅ **Accessibility**: ARIA labels and keyboard support (Escape key)
- ✅ **Backdrop Support**: Click outside to close
- ✅ **Context-Based**: Uses React Context for state management
- ✅ **Auto-Close**: Automatically closes on window resize

## Usage

### Basic Usage
```tsx
import BurgerMenu from '@/components/ui/BurgerMenu';

// Simple usage
<BurgerMenu />

// With custom styling
<BurgerMenu 
  className="custom-class" 
  iconClassName="custom-icon-class" 
/>
```

### With Sidebar Context
```tsx
import { useSidebar } from '@/contexts/SidebarContext';

function MyComponent() {
  const { isOpen, toggleSidebar, openSidebar, closeSidebar } = useSidebar();
  
  return (
    <div>
      <p>Sidebar is {isOpen ? 'open' : 'closed'}</p>
      <button onClick={toggleSidebar}>Toggle Sidebar</button>
    </div>
  );
}
```

## Implementation Details

### Context Provider
The component relies on the `SidebarProvider` context which should wrap your entire application layout:

```tsx
import { SidebarProvider } from '@/contexts/SidebarContext';

function App() {
  return (
    <SidebarProvider>
      {/* Your app content */}
    </SidebarProvider>
  );
}
```

### CSS Classes
The component applies the following CSS classes:
- `button-toggle-menu`: Base button styling
- `offcanvas-backdrop`: Backdrop overlay
- `sidebar-enable`: Applied to html element when sidebar is open

### Mobile Behavior
- On mobile (≤1140px): Sidebar slides in as overlay
- On desktop (>1140px): Sidebar toggles between condensed/default
- Touch-friendly: 44px minimum touch target
- Auto-close on window resize

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `''` | Additional CSS classes for the button |
| `iconClassName` | `string` | `'fs-24 align-middle'` | CSS classes for the icon |

## Context API

### `useSidebar()` Hook

Returns an object with:

| Property | Type | Description |
|----------|------|-------------|
| `isOpen` | `boolean` | Current sidebar state |
| `toggleSidebar` | `() => void` | Toggle sidebar open/closed |
| `openSidebar` | `() => void` | Open sidebar |
| `closeSidebar` | `() => void` | Close sidebar |

## Browser Support

- ✅ Chrome/Edge 88+
- ✅ Firefox 85+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### Sidebar Not Toggling
1. Ensure `SidebarProvider` wraps your app
2. Check that CSS is loaded properly
3. Verify no JavaScript errors in console

### Mobile Issues
1. Check viewport meta tag: `<meta name="viewport" content="width=device-width, initial-scale=1">`
2. Ensure CSS media queries are working
3. Test touch events on actual device

### Accessibility Issues
1. Ensure proper ARIA labels are applied
2. Test keyboard navigation (Tab, Enter, Escape)
3. Verify screen reader compatibility

