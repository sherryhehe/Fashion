# Larkon Admin Dashboard

A modern, fully-featured admin dashboard built with Next.js 15, TypeScript, and Bootstrap 5. Features a clean, modular architecture following atomic design principles.

## ✨ Features

- 🎨 **Modern UI**: Beautiful, responsive design with Bootstrap 5
- 📱 **Mobile-First**: Fully responsive with optimized mobile experience  
- 🔧 **TypeScript**: Full type safety across the application
- ⚡ **Next.js 15**: Latest features including App Router and Server Components
- 🎭 **Atomic Design**: Organized component structure (atoms, molecules, organisms)
- 🔌 **API Integration**: Type-safe API client with error handling
- 🎯 **Clean Architecture**: Scalable, maintainable codebase
- 🌙 **Dark Mode**: Built-in theme switching
- 📊 **Rich Components**: Interactive tables, charts, forms, and more

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## 📁 Project Structure

```
src/
├── app/                  # Next.js App Router pages
├── components/           # React components
│   ├── atoms/           # Basic UI elements
│   ├── molecules/       # Compound components
│   ├── organisms/       # Complex UI sections
│   └── layout/          # Layout components
├── lib/                 # Utilities and API
│   ├── api/            # API client and endpoints
│   ├── config.ts       # Configuration
│   ├── constants.ts    # Constants
│   └── utils.ts        # Helper functions
├── hooks/              # Custom React hooks
├── contexts/           # React Context providers
├── styles/             # Global styles
└── types/              # TypeScript definitions
```

## 🔧 Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Bootstrap 5 + Custom CSS
- **UI Components**: Custom atomic design components
- **Icons**: Iconify
- **Charts**: ApexCharts
- **State Management**: React Context + Custom Hooks

## 📚 Documentation

- [Architecture Guide](./ARCHITECTURE.md) - Detailed architecture documentation
- [Deployment Guide](./DEPLOYMENT.md) - Deployment instructions
- [Component Docs](./src/components/README.md) - Component usage guide

## 🎨 Key Features

### Dashboard Pages
- Main Analytics Dashboard
- Finance Dashboard
- Sales Dashboard
- User Location Dashboard

### Product Management
- Product List & Grid Views
- Product Details
- Add/Edit Products
- Featured Products

### Order Management
- Orders List
- Order Details
- Order Cart & Checkout
- Recent Orders

### Customer Management
- Customer List
- Customer Details

### Brand Management
- Brand List & Details
- Top & Featured Brands
- Banner Control

### Category & Style Management
- Category Management
- Style Management

### Notifications
- Notification System
- Notification History
- Create Notifications

## 🛠️ Development

### Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

### Code Style

- Follow TypeScript best practices
- Use atomic design patterns
- Keep components small and focused
- Write type-safe code
- Document complex logic

## 🤝 Contributing

1. Follow the existing code style
2. Maintain type safety
3. Update documentation for new features
4. Test thoroughly before committing

## 📄 License

[Your License Here]

## 🆘 Support

For issues and questions, please refer to the documentation or create an issue in the repository.
