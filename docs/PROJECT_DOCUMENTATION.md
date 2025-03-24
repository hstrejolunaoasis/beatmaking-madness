# Beatmaking Madness - Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technical Architecture](#technical-architecture)
3. [Data Models](#data-models)
4. [Directory Structure](#directory-structure)
5. [Feature Documentation](#feature-documentation)
6. [Development Guidelines](#development-guidelines)
7. [API Reference](#api-reference)
8. [Environment Configuration](#environment-configuration)
9. [Deployment Procedures](#deployment-procedures)
10. [Performance Considerations](#performance-considerations)
11. [Security Considerations](#security-considerations)
12. [Project Status](#project-status)
13. [Roadmap](#roadmap)
14. [Contributing](#contributing)

## Project Overview

Beatmaking Madness is a professional e-commerce platform that connects music producers with artists. The platform enables producers to upload, manage, and sell beats with multiple licensing options while providing artists with an interface to browse, preview, and purchase beats.

**Current Version:** 0.1.0

**Target Audience:**
- Music producers looking to sell beats online
- Artists seeking to purchase high-quality beats with clear licensing

**Core Features:**
- Beat catalog with audio preview functionality
- Multiple license tiers (Basic, Premium, Exclusive)
- Producer dashboard for beat management
- Secure payment processing
- User authentication and authorization
- Responsive design with dark mode support

## Technical Architecture

### Tech Stack

- **Frontend Framework:** Next.js 15.2 with App Router
- **UI Library:** React 19
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4, shadcn/ui, Radix UI
- **State Management:** Zustand 5, React Query 5
- **Database:** PostgreSQL with Prisma 6 ORM
- **Storage:** Supabase Storage
- **Authentication:** @auth/nextjs
- **Payment Processing:** Stripe 17
- **Form Handling:** React Hook Form 7, Zod 3
- **Build Tool:** Turbopack for development

### System Architecture

The application follows a modern architecture leveraging Next.js App Router with React Server Components:

1. **Server Components:** Majority of UI components are server components, reducing client-side JavaScript
2. **Client Components:** Interactive elements that require client-side state or browser APIs
3. **API Routes:** Server-side endpoints for data operations
4. **Database Layer:** Prisma ORM for type-safe database access
5. **Authentication:** NextAuth.js for secure authentication
6. **File Storage:** Supabase for secure file storage
7. **Payment Integration:** Stripe for payment processing

## Data Models

The application's data schema is defined in Prisma and consists of the following models:

### User
- Core user information including roles (USER/ADMIN)
- Relation to Orders

### Beat
- Represents a music beat with metadata (title, producer, BPM, etc.)
- Audio and image file references
- Available licenses
- Relation to orders

### License
- License configuration with pricing and features
- Relation to license types
- Many-to-many relationship with beats

### LicenseType
- Categories of licenses (Basic, Premium, Exclusive)
- Contains license templates

### Order
- Represents a purchase transaction
- Contains order items
- Relation to user

### OrderItem
- Individual beat purchase with specific license
- Relations to beat, order, and license

### BeatLicense
- Many-to-many relationship between beats and licenses
- Tracks which licenses are available for each beat

## Directory Structure

```
beatmaking-madness/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Authentication routes
│   │   ├── auth/               # Auth-related pages
│   │   ├── (dashboard)/        # Producer dashboard
│   │   ├── (marketing)/        # Landing and marketing pages
│   │   ├── (shop)/             # Store front
│   │   ├── api/                # API routes
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Home page
│   ├── components/
│   │   ├── ui/                 # shadcn UI components
│   │   ├── common/             # Shared components
│   │   ├── forms/              # Form components
│   │   └── auth/               # Authentication components
│   ├── lib/
│   │   ├── utils/              # Utility functions
│   │   ├── hooks/              # Custom hooks
│   │   ├── services/           # External services
│   │   ├── store/              # Zustand stores
│   │   └── config/             # Configuration
│   ├── types/                  # TypeScript types
│   └── middleware.ts           # Next.js middleware
├── prisma/
│   └── schema.prisma           # Database schema
├── public/                     # Static assets
├── docs/                       # Project documentation
└── next.config.ts              # Next.js configuration
```

## Feature Documentation

### Authentication System

The authentication system uses @auth/nextjs to provide secure user authentication:

- Email/password authentication
- Role-based access control (User vs Admin)
- Protected routes requiring authentication
- Session management

### Beat Catalog

The beat catalog allows artists to browse and preview beats:

- Filterable grid view of available beats
- Search functionality by genre, mood, BPM, and keywords
- Audio preview with waveform visualization
- License information and pricing

### License Management

The platform offers a flexible license management system:

- **License Tiers:**
  - Basic: Limited rights, MP3 format
  - Premium: Extended rights, WAV format
  - Exclusive: Full rights transfer, all formats including stems

- **Producer Controls:**
  - Create custom license agreements
  - Set pricing for each license tier
  - Define usage limitations

### Audio Player

Custom audio player with the following features:

- Waveform visualization
- Continuous playback across page navigation
- Playlist functionality
- Mobile-responsive controls

### Shopping Cart & Checkout

- Add beats with specific licenses to cart
- Review cart contents
- Secure checkout using Stripe
- Order confirmation and delivery system

### Producer Dashboard

- Upload and manage beats
- Track sales and analytics
- License management interface
- Profile settings

## Development Guidelines

### Code Style and Structure

- **TypeScript:** Use TypeScript for all new code
- **Component Structure:**
  - Use React Server Components (RSC) by default
  - Add 'use client' directive only when necessary
  - Structure components with exports at top, state/hooks next, handlers, helpers, JSX, and types at bottom

### State Management

- **Server State:** Use React Query for data fetching and caching
- **Client State:** Use Zustand for global UI state
- **Form State:** Use React Hook Form with Zod validation
- **URL State:** Use URL parameters for shareable UI state

### UI/UX Standards

- **UI Components:** Use shadcn/ui and Radix UI components
- **Styling:** Use Tailwind CSS with consistent spacing, color system
- **Responsiveness:** Design for mobile-first, ensure all features work across devices
- **Accessibility:** Follow WCAG 2.1 AA standards, properly labeled inputs, keyboard navigation

### Testing Strategy

- Unit tests for utility functions
- Component tests for UI components
- Integration tests for feature flows
- End-to-end tests for critical paths

## API Reference

The application provides the following API endpoints:

### Authentication

- `POST /api/auth/login`: Authenticate user
- `POST /api/auth/register`: Register new user
- `GET /api/auth/me`: Get current user information

### Beats

- `GET /api/beats`: List beats with filtering
- `GET /api/beats/{id}`: Get beat details
- `POST /api/beats`: Create new beat (producer only)
- `PUT /api/beats/{id}`: Update beat (producer only)
- `DELETE /api/beats/{id}`: Delete beat (producer only)

### Licenses

- `GET /api/licenses`: List licenses
- `GET /api/beats/{beatId}/licenses`: Get licenses for a beat

### Orders

- `POST /api/orders`: Create new order
- `GET /api/orders`: List user orders
- `GET /api/orders/{id}`: Get order details

## Environment Configuration

The application requires the following environment variables:

```
# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret

# Database (Supabase)
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
```

## Deployment Procedures

### Production Deployment (Vercel)

1. Push changes to the main branch
2. Vercel automatically builds and deploys the application
3. Verify the deployment in the Vercel dashboard
4. Run any necessary database migrations

### Staging Deployment

1. Push changes to the development branch
2. Deploy to staging environment
3. Run test suite on staging
4. Verify functionality

### Database Migrations

1. Create migration: `npx prisma migrate dev --name your-migration-name`
2. Apply migration: `npx prisma migrate deploy`

## Performance Considerations

- Use React Server Components (RSC) to reduce client-side JavaScript
- Implement proper image optimization with Next.js Image component
- Use streaming and Suspense for improved loading states
- Implement proper caching strategies
- Optimize bundle size using dynamic imports
- Implement partial prerendering where appropriate

## Security Considerations

- All API routes are protected with proper authentication
- Database access is restricted through Prisma
- Environment variables are properly secured
- File uploads are validated and restricted
- Payment information is handled securely through Stripe
- CSRF protection is implemented

## Project Status

**Current Status:** Development

**Key Metrics:**
- Version: 0.1.0
- Features Implemented: 70%
- Test Coverage: 60%
- Known Issues: 5

## Roadmap

### Short-term (1-3 months)
- Complete producer dashboard
- Implement advanced search features
- Add social sharing for beats
- Improve analytics dashboard

### Mid-term (3-6 months)
- Implement subscription model
- Add beat collaboration features
- Develop mobile app
- Expand payment options

### Long-term (6+ months)
- Implement AI-powered beat recommendations
- Add marketplace for sample packs
- Develop distribution partnerships
- Expand to international markets

## Contributing

### Development Workflow

1. Create a feature branch from `develop`
2. Implement changes following project guidelines
3. Write tests for new functionality
4. Create pull request to `develop`
5. Code review process
6. Merge to `develop` after approval
7. Regular releases from `develop` to `main`

### Pull Request Guidelines

- Include a clear description of changes
- Reference any related issues
- Ensure all tests pass
- Maintain or improve code coverage
- Follow coding standards

---

Last Updated: 2024-03-24 