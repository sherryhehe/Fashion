# Components Documentation

This directory contains all React components organized following atomic design principles.

## 📁 Directory Structure

```
components/
├── atoms/              # Basic building blocks
├── molecules/          # Simple component combinations
├── organisms/          # Complex UI sections
├── layout/             # Layout components
├── ErrorBoundary.tsx   # Error boundary component
├── Loading.tsx         # Loading component
├── ThemeProvider.tsx   # Theme provider
└── index.ts            # Barrel exports
```

## 🎨 Atomic Design Principles

### Atoms (`/atoms`)

Basic building blocks that can't be broken down further.

**Examples:**
- `Button.tsx` - Basic button component
- `Input.tsx` - Input field component
- `Card.tsx` - Card container
- `InteractiveButton.tsx` - Enhanced button with interactions

**Usage:**
```tsx
import { Button, InteractiveButton } from '@/components/atoms';

<InteractiveButton 
  variant="primary" 
  size="lg" 
  onClick={handleClick}
>
  Click Me
</InteractiveButton>
```

### Molecules (`/molecules`)

Simple combinations of atoms that work together as a unit.

**Examples:**
- `BurgerMenu.tsx` - Mobile menu toggle
- `TimeFilter.tsx` - Time period filter selector
- `InteractiveDropdown.tsx` - Enhanced dropdown
- `InteractiveForm.tsx` - Form with built-in state

**Usage:**
```tsx
import { TimeFilter } from '@/components/molecules';

<TimeFilter 
  defaultValue="1Y"
  onFilterChange={handleChange}
/>
```

### Organisms (`/organisms`)

Complex UI sections composed of molecules and atoms.

**Examples:**
- `InteractiveTable.tsx` - Full-featured data table
- `AddReviewModal.tsx` - Review submission modal
- `NotificationSystem.tsx` - Notification display system

**Usage:**
```tsx
import { InteractiveTable } from '@/components/organisms';

<InteractiveTable
  data={products}
  columns={columns}
  searchFields={['name', 'category']}
  onEdit={handleEdit}
  onDelete={handleDelete}
  showActions={true}
/>
```

### Layout Components (`/layout`)

**Components:**
- `Layout.tsx` - Main layout wrapper
- `Header.tsx` - Top navigation header
- `Sidebar.tsx` - Side navigation menu

**Usage:**
```tsx
import { Layout } from '@/components';

<Layout pageTitle="Dashboard">
  {/* Your page content */}
</Layout>
```

## 🔧 Component Patterns

### 1. Props Interface

Always define TypeScript interfaces for props:

```tsx
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export default function Button({ 
  children, 
  onClick, 
  variant = 'primary',
  disabled = false 
}: ButtonProps) {
  // Component logic
}
```

### 2. Default Props

Use default values in destructuring:

```tsx
function Component({
  size = 'md',
  color = 'primary',
  disabled = false
}: ComponentProps) {
  // ...
}
```

### 3. Event Handlers

Name event handlers with `handle` prefix:

```tsx
const handleClick = () => {
  // Handle click
};

const handleChange = (value: string) => {
  // Handle change
};
```

### 4. Conditional Rendering

Use early returns for cleaner code:

```tsx
if (loading) {
  return <Loading />;
}

if (error) {
  return <ErrorMessage error={error} />;
}

return <MainContent />;
```

## 📦 Importing Components

### Individual Imports
```tsx
import { Button } from '@/components/atoms';
import { TimeFilter } from '@/components/molecules';
import { InteractiveTable } from '@/components/organisms';
import { Layout } from '@/components/layout';
```

### Grouped Imports
```tsx
import { 
  Layout, 
  InteractiveTable, 
  InteractiveButton 
} from '@/components';
```

## 🎯 Best Practices

### 1. Component Size
- Keep components under 300 lines
- Extract complex logic into hooks
- Split large components into smaller ones

### 2. Reusability
- Make components configurable through props
- Avoid hard-coding values
- Use composition over inheritance

### 3. Type Safety
- Define interfaces for all props
- Use TypeScript's type system
- Avoid `any` type

### 4. Performance
- Use `React.memo` for expensive renders
- Implement proper key props in lists
- Avoid inline function definitions

### 5. Accessibility
- Use semantic HTML
- Add ARIA labels where needed
- Ensure keyboard navigation works

## 🔍 Component Examples

### Basic Button
```tsx
import { InteractiveButton } from '@/components/atoms';

<InteractiveButton
  variant="primary"
  size="lg"
  onClick={() => console.log('Clicked')}
  loading={isLoading}
  disabled={isDisabled}
>
  Save Changes
</InteractiveButton>
```

### Data Table
```tsx
import { InteractiveTable } from '@/components/organisms';

const columns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { 
    key: 'status', 
    label: 'Status',
    render: (value) => <Badge>{value}</Badge>
  },
];

<InteractiveTable
  data={users}
  columns={columns}
  searchFields={['name', 'email']}
  itemsPerPage={10}
  onEdit={handleEdit}
  onDelete={handleDelete}
  showActions={true}
  showSearch={true}
  showPagination={true}
/>
```

### Form with State
```tsx
import { InteractiveForm } from '@/components/molecules';

<InteractiveForm
  initialValues={{ name: '', email: '' }}
  onSubmit={handleSubmit}
  validationSchema={schema}
>
  {({ values, errors, handleChange }) => (
    <>
      <Input
        name="name"
        value={values.name}
        onChange={handleChange}
        error={errors.name}
      />
      <Input
        name="email"
        type="email"
        value={values.email}
        onChange={handleChange}
        error={errors.email}
      />
      <Button type="submit">Submit</Button>
    </>
  )}
</InteractiveForm>
```

## 🚨 Common Pitfalls

### ❌ Don't
```tsx
// Hard-coded values
<Button style={{ color: '#007bff' }}>Click</Button>

// Missing types
function Component(props: any) { }

// Inline functions in render
<Button onClick={() => handleClick(id)}>Click</Button>
```

### ✅ Do
```tsx
// Use theme/props
<Button variant="primary">Click</Button>

// Proper typing
function Component({ title, onClick }: ComponentProps) { }

// Memoized callbacks
const handleClick = useCallback(() => {
  // Handle click
}, [dependencies]);
```

## 📝 Adding New Components

1. Create component file in appropriate directory
2. Define TypeScript interface for props
3. Implement component with proper types
4. Export from directory's index.ts
5. Add usage examples in comments
6. Test the component

## 🔗 Related Documentation

- [Architecture Guide](../../ARCHITECTURE.md)
- [TypeScript Guide](../../docs/typescript.md)
- [Hooks Documentation](../hooks/README.md)

## 🆘 Need Help?

- Check existing components for patterns
- Refer to the architecture documentation
- Ask in the team chat
- Review TypeScript errors carefully

