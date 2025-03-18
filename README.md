# Beatmaking Madness

Beatmaking Madness is a professional e-commerce platform for music producers to sell beats directly to artists. Built with modern technologies and best practices, it provides a seamless experience for both producers and customers.

## Features

- 🎵 **Beat Catalog**: Browse and preview beats with a custom audio player
- 💲 **Multiple License Tiers**: Basic, Premium, and Exclusive licensing options
- 🛒 **Shopping Cart**: Add beats to cart and checkout securely
- 👨‍💻 **Producer Dashboard**: Upload and manage beats
- 💾 **File Storage**: Secure audio and image file storage with Supabase
- 🔒 **Secure Payments**: Integrated with Stripe for secure payments

## Tech Stack

- **Frontend**: Next.js 15.2, React 19, TypeScript 5
- **Styling**: Tailwind CSS 4, shadcn/ui
- **Database**: PostgreSQL with Prisma 6 ORM
- **Storage**: Supabase Storage
- **Authentication**: @auth/nextjs
- **Payments**: Stripe 17
- **State Management**: Zustand 5
- **Form Handling**: React Hook Form 7, Zod 3
- **Data Fetching**: TanStack React Query 5

## Getting Started

### Prerequisites

- Node.js 20.0.0 or later
- npm or yarn
- A Supabase account
- A Stripe account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/beatmaking-madness.git
   cd beatmaking-madness
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your environment variables:
   ```
   # Authentication
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-nextauth-secret

   # Database (Supabase)
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

   # Stripe
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
   STRIPE_SECRET_KEY=your-stripe-secret-key
   STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
   ```

4. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

5. Push the database schema to Supabase:
   ```bash
   npx prisma db push
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
beatmaking-madness/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Authentication routes
│   │   ├── (dashboard)/        # Producer dashboard
│   │   ├── (marketing)/        # Landing and marketing pages
│   │   ├── (shop)/             # Store front
│   │   └── api/                # API routes
│   ├── components/
│   │   ├── ui/                 # shadcn UI components
│   │   ├── common/             # Shared components
│   │   ├── forms/              # Form components
│   │   └── sections/           # Page sections
│   ├── lib/
│   │   ├── utils/              # Utility functions
│   │   ├── hooks/              # Custom hooks
│   │   ├── services/           # External services
│   │   ├── store/              # Zustand stores
│   │   └── config/             # Configuration
│   └── types/                  # TypeScript types
├── prisma/
│   └── schema.prisma           # Database schema
└── public/                     # Static assets
```

## Development Workflow

- **Feature Branches**: Create a new branch for each feature
- **TypeScript**: Use TypeScript for all new files
- **Styling**: Use Tailwind CSS for styling
- **Components**: Use shadcn/ui for UI components
- **Database**: Use Prisma for database access
- **API Routes**: Create API routes in `app/api`
- **Development**: Uses Turbopack for improved dev performance

## Deployment

1. Create a production build:
   ```bash
   npm run build
   ```

2. Deploy to your hosting provider of choice (Vercel recommended for Next.js apps).

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Prisma](https://www.prisma.io/)
- [Supabase](https://supabase.io/)
- [Stripe](https://stripe.com/)
- [TanStack React Query](https://tanstack.com/query/latest)
- [Zustand](https://github.com/pmndrs/zustand)
