# Todo App

A production-ready Todo Application built with Expo (React Native) and Supabase.

## Architecture

- **Frontend**: Expo, React Native, NativeWind (Tailwind CSS)
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)

## Getting Started

### Prerequisites
- Node.js
- npm or yarn
- Expo CLI
- Supabase account & CLI

### Installation

1. Clone the repository
2. Install frontend dependencies:
   ```bash
   cd fe
   npm install
   ```

### Configuration

#### Frontend
Create a `.env` file in the `fe` directory and add your Supabase keys:
```
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

#### Backend (Supabase)
Deploy the Supabase schema from the `be/supabase` folder.
```bash
cd be/supabase
supabase link --project-ref your-project-ref
supabase db push
```

### Running the App

Start the Expo development server:
```bash
cd fe
npx expo start
```

## License
MIT License
