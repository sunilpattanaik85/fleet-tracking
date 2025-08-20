# Vehicle Analytics Dashboard

## Overview

This is a full-stack Vehicle Analytics Dashboard application built for real-time fleet monitoring and analytics. The application provides comprehensive tracking of vehicle locations, performance metrics, and fleet utilization through an interactive web interface. It features live vehicle tracking on maps, corridor-based analytics, performance monitoring, and alert management for fleet operations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: Shadcn/ui component library with Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack React Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Charts**: Recharts library for data visualization and analytics dashboards
- **Real-time Updates**: WebSocket client for live vehicle tracking and status updates

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for type safety across the stack
- **API Design**: RESTful API with WebSocket support for real-time features
- **Development**: Hot reloading with Vite middleware integration
- **Error Handling**: Centralized error middleware with structured responses

### Data Storage Solutions
- **Database**: PostgreSQL using Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Connection**: Neon Database serverless PostgreSQL hosting
- **Storage Pattern**: In-memory storage interface with plans for database persistence

### Authentication and Authorization
- **Session Management**: Express sessions with PostgreSQL session store
- **Security**: CORS configuration and request logging middleware
- **Development**: No authentication required for dashboard access (suitable for internal fleet management)

### External Dependencies
- **Database Hosting**: Neon Database serverless PostgreSQL
- **Font Services**: Google Fonts integration for typography
- **Development Tools**: Replit integration for cloud development environment
- **Real-time Communication**: Native WebSocket API for live updates

The application follows a monorepo structure with shared TypeScript schemas between frontend and backend, ensuring type safety across the entire stack. The dashboard is designed for internal fleet management with features like vehicle tracking, corridor analytics, performance metrics, and alert systems.