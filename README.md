# Timelyr - Timezone Link Sharing App

A production-ready web application that eliminates timezone confusion by generating shareable links that automatically display the correct time in each viewer's timezone.

## Features

### Core Functionality
- **Smart Time Input**: Natural language parsing ("Tomorrow 2 PM PST") and guided selection
- **Automatic Timezone Detection**: No manual timezone selection needed for viewers
- **Clean Link Generation**: shareable URLs like `timelyr.com/meeting-jan-15`
- **Business Hours Intelligence**: Visual indicators for optimal meeting times across regions
- **Mobile-First Design**: Responsive interface optimized for all devices

### User Management
- **Supabase Authentication**: Email/password signup and login
- **User Dashboard**: Link management with analytics
- **Profile System**: Custom usernames and profile pictures
- **Pricing Tiers**: Free (50 links/month) and Pro ($12/month) plans

### Design System
- **Notion-Inspired UI**: Clean, minimal interface with subtle animations
- **Card-Based Layout**: Consistent spacing and visual hierarchy
- **Interactive Components**: Hover states, smooth transitions, and micro-interactions
- **Accessibility**: Proper focus states and keyboard navigation

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom design system
- **Backend**: Supabase (Database + Auth + Edge Functions)
- **Routing**: React Router DOM
- **Date/Time**: date-fns with timezone support
- **Icons**: Lucide React
- **Deployment**: Netlify ready

## Getting Started

### Prerequisites
- Node.js 18+ 
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/timelyr.git
cd timelyr
```

2. Install dependencies:
```bash
npm install
```

3. Set up Supabase:
- Create a new Supabase project
- Update `.env` with your Supabase URL and anon key
- Run the database migrations (see Database Setup)

4. Start development server:
```bash
npm run dev
```

### Database Setup

Connect to Supabase and run these SQL commands to set up the database schema:

```sql
-- Create timezone_links table
CREATE TABLE IF NOT EXISTS timezone_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id),
  title text NOT NULL,
  description text,
  scheduled_time timestamptz NOT NULL,
  timezone text NOT NULL,
  slug text UNIQUE NOT NULL,
  expires_at timestamptz,
  view_count integer DEFAULT 0,
  is_active boolean DEFAULT true
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  email text NOT NULL,
  full_name text,
  username text UNIQUE,
  avatar_url text,
  plan text DEFAULT 'starter' CHECK (plan IN ('starter', 'pro')),
  links_created_this_month integer DEFAULT 0
);

-- Enable Row Level Security
ALTER TABLE timezone_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public links are viewable by everyone"
  ON timezone_links FOR SELECT
  USING (is_active = true);

CREATE POLICY "Users can insert their own links"
  ON timezone_links FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can view their own links"
  ON timezone_links FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own links"
  ON timezone_links FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (Button, Input, Card)
│   ├── Auth/           # Authentication components
│   ├── WorldClock.tsx  # Live timezone display
│   ├── TimeInput.tsx   # Smart time input system
│   └── Navbar.tsx      # Navigation component
├── pages/              # Route components
│   ├── HomePage.tsx    # Landing page with world clock
│   ├── LinkViewPage.tsx # Individual link viewing
│   ├── PricingPage.tsx # Pricing plans
│   ├── AboutPage.tsx   # Company information
│   └── HowItWorksPage.tsx # Feature explanations
├── lib/                # Utility functions
│   ├── supabase.ts     # Database client and types
│   └── timezone.ts     # Timezone conversion utilities
└── App.tsx             # Main application component
```

## Key Features Implemented

### 1. Smart Time Input System
- Natural language parsing with real-time feedback
- Guided selection with date/time pickers
- Timezone selection with common presets
- Quick preset buttons for common times

### 2. Interactive World Clock
- Live updates every second across 8 major cities
- Visual demonstration of timezone differences
- Icons and country labels for each location

### 3. Business Hours Intelligence
- Color-coded indicators for business hours compliance
- Multi-region analysis (US East/West, Europe, Asia Pacific)
- Smart scheduling suggestions for global teams

### 4. User Authentication & Profiles
- Email/password authentication via Supabase
- User dashboard with link management
- Profile customization with avatars
- Plan-based feature access (Free vs Pro)

### 5. Link Generation & Sharing
- Clean, readable URLs with automatic slug generation
- One-click copy to clipboard with success feedback
- Calendar export (.ics file generation)
- QR code generation for mobile sharing

### 6. Mobile-Optimized Design
- Touch-friendly interface with 44px minimum touch targets
- Responsive breakpoints for mobile, tablet, and desktop
- Swipe gestures and native sharing integration
- Progressive Web App capabilities

## Environment Variables

Required environment variables in `.env`:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Deployment

The application is ready for deployment on Netlify:

1. Connect your GitHub repository to Netlify
2. Set environment variables in Netlify dashboard
3. Deploy with build command: `npm run build`
4. Set up custom domain (optional)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- Email: hello@timelyr.com
- Documentation: [docs.timelyr.com](https://docs.timelyr.com)
- Twitter: [@timelyr](https://twitter.com/timelyr)