# Overview

This is a comprehensive ticketing system built with React and Express.js that provides a full-featured help desk and IT service management solution. The application enables organizations to manage support tickets, track SLA compliance, organize queues, and maintain inventory while providing detailed analytics and reporting capabilities.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client-side is built using React with TypeScript and follows a component-based architecture:
- **UI Framework**: React with TypeScript for type safety
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design
- **Form Handling**: React Hook Form with Zod validation for robust form management
- **Build Tool**: Vite for fast development and optimized production builds

## Backend Architecture
The server follows a RESTful API design pattern:
- **Runtime**: Node.js with Express.js framework
- **Database ORM**: Drizzle ORM for type-safe database operations
- **API Design**: RESTful endpoints with standardized error handling
- **Middleware**: Custom logging middleware for API request tracking
- **Build Process**: ESBuild for server-side bundling

## Database Schema Design
The system uses PostgreSQL with a comprehensive schema supporting:
- **User Management**: Users with role-based access control
- **Ticket Management**: Tickets with hierarchical relationships, custom fields, and SLA tracking
- **Organization**: Queues for departmental organization and labels for categorization
- **Scheduling**: Work schedules with timezone support for SLA calculations
- **Asset Tracking**: Inventory management with custom fields and assignment tracking
- **Audit Trail**: Comprehensive tracking of ticket changes and time spent

## Key Features Architecture
- **SLA Management**: Automated deadline calculation and compliance monitoring
- **Hierarchical Tickets**: Parent-child relationships for complex issue tracking
- **Custom Fields**: Flexible form configuration for different ticket types
- **Analytics Dashboard**: Real-time statistics and performance metrics
- **Export System**: Multiple format support (CSV, Excel, PDF, JSON) with filtering
- **Calendar Integration**: Visual scheduling and deadline management

## Development Environment
- **Hot Reload**: Vite HMR for fast development cycles
- **Type Safety**: Full TypeScript coverage across frontend and backend
- **Code Quality**: ESLint and Prettier for consistent code formatting
- **Path Aliases**: Organized import structure with @ aliases for better maintainability

# External Dependencies

## Database
- **PostgreSQL**: Primary database using Neon Database serverless driver
- **Drizzle ORM**: Type-safe database operations with schema migrations
- **Session Storage**: PostgreSQL-based session management with connect-pg-simple

## UI Components
- **Radix UI**: Headless component primitives for accessibility
- **shadcn/ui**: Pre-built component library built on Radix UI
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library for consistent iconography

## Development Tools
- **Vite**: Build tool with React plugin and development server
- **TypeScript**: Static type checking
- **React Hook Form**: Form state management and validation
- **Zod**: Runtime type validation and schema definition
- **date-fns**: Date manipulation and formatting utilities

## Replit Integration
- **Development Banner**: Replit-specific development environment indicator
- **Error Overlay**: Runtime error display for development
- **Cartographer**: Replit's code mapping tool for enhanced debugging