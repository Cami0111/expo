# 🎬 Feed Integration Guide - Comunidad Section

## Current Status ✅

All feed components are ready and integrated:
- ✅ Publication creation modal
- ✅ Publication display cards
- ✅ Reply/comments system
- ✅ Top movies trending section
- ✅ Auth Context setup (ready for your auth token integration)
- ✅ AsyncStorage integration for token management
- ✅ API service with token interceptor

## Backend Configuration

### 1. Set Backend URL

Create a `.env.local` file in the `expo/` directory:

```bash
cd expo
cp .env.local.example .env.local
```

Edit `.env.local`:
```
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

For development on physical device:
```
EXPO_PUBLIC_API_URL=http://192.168.x.x:3000/api
```

## Authentication Integration

The app now uses an `AuthContext` that manages user state. When you complete your auth system, do this:

### Step 1: Update Your Login Screen

```typescript
import { useAuth } from '@/contexts/AuthContext';

export function LoginScreen() {
  const { login } = useAuth();

  const handleLogin = async (username: string, password: string) => {
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const { user, token } = await response.json();

      // Save user and token to context and AsyncStorage
      await login(user, token);

      // Now user can access the feed!
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    // Your login form...
  );
}
```

### Step 2: Access User Info in Feed

The feed automatically uses the authenticated user:

```typescript
import { useAuth } from '@/contexts/AuthContext';

export function MyComponent() {
  const { user, isSignedIn, logout } = useAuth();

  if (!isSignedIn) {
    return <Text>Please log in</Text>;
  }

  return (
    <View>
      <Text>Welcome, {user?.username}!</Text>
    </View>
  );
}
```

## Integrating Feed with Your Sidebar Navigation

You have a sidebar with sections: Principal, Buscar, Favorito, **Comunidad**, Perfil

### Option 1: Add Feed as a Tab in (tabs) Navigation

Since your app uses Expo Router, the feed is accessible at `/feed`. To add it to your sidebar:

1. **Update your navigation component** to include a link to the feed:

```typescript
import { Link } from 'expo-router';
import { TouchableOpacity, Text, View } from 'react-native';

export function Sidebar() {
  return (
    <View style={styles.sidebar}>
      <Link href="/" asChild>
        <TouchableOpacity>
          <Text>Principal</Text>
        </TouchableOpacity>
      </Link>

      <Link href="/explore" asChild>
        <TouchableOpacity>
          <Text>Buscar</Text>
        </TouchableOpacity>
      </Link>

      <Link href="/favorito" asChild>
        <TouchableOpacity>
          <Text>Favorito</Text>
        </TouchableOpacity>
      </Link>

      {/* Feed/Comunidad Section */}
      <Link href="/feed" asChild>
        <TouchableOpacity>
          <Text>Comunidad</Text>
        </TouchableOpacity>
      </Link>

      <Link href="/perfil" asChild>
        <TouchableOpacity>
          <Text>Perfil</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}
```

### Option 2: Replace Explore with Feed

If "Buscar" or another section should be the Comunidad/Feed section:

1. Rename or replace the screen:

```bash
# Option A: Use the existing explore.tsx and replace its content
# Option B: Create a new comunidad.tsx

# I recommend creating a new file for clarity:
cp expo/app/\(tabs\)/feed.tsx expo/app/\(tabs\)/comunidad.tsx
```

2. Update your navigation to point to `/comunidad` instead of `/feed`

## Quick Start: Using Demo User

For testing before auth is ready, the feed can work with a demo user:

```typescript
// In app/(tabs)/feed.tsx or your navigation setup

import { useAuth } from '@/contexts/AuthContext';

// On app startup, set a demo user:
useEffect(() => {
  const { login } = useAuth();
  login(
    { id: 'demo-user', username: 'Demo User' },
    'demo-token'
  );
}, []);
```

## API Endpoints Required

Your backend needs these endpoints:

```
POST /api/publications
GET /api/publications?page=1&limit=20
GET /api/publications/top-movies?limit=10
POST /api/publications/:id/like
POST /api/publications/:id/replies
GET /api/publications/:id/replies
```

## Testing the Feed

### 1. Start your backend:
```bash
cd your-backend-folder
npm run dev
# Should be running on http://localhost:3000
```

### 2. Run the Expo app:
```bash
cd expo
npm start
```

### 3. Open on device/emulator

### 4. Navigate to `/feed` or your Comunidad section

### 5. Test features:
- ✅ Create a publication
- ✅ Like a publication
- ✅ Reply to a publication
- ✅ View top movies

## Troubleshooting

### "API Connection Failed"
- Check backend is running: `curl http://localhost:3000/api/publications`
- Update `EXPO_PUBLIC_API_URL` in `.env.local`
- For physical device, use your machine's IP address

### "Please log in" always appears
- Set demo user or complete auth login flow
- Check `AsyncStorage` has `authToken` saved

### Publications not loading
- Check backend returns correct data format
- Verify API response structure matches `Publication` interface

### CORS errors (web only)
- Backend needs CORS headers: `Access-Control-Allow-Origin: *`

## File Locations

```
expo/
├── contexts/
│   └── AuthContext.tsx              ← User auth state
├── services/
│   └── api.ts                       ← API calls with token interceptor
├── components/publications/
│   ├── CreatePublicationModal.tsx   ← Create post form
│   ├── PublicationCard.tsx          ← Display posts
│   ├── ReplyModal.tsx               ← Reply form
│   └── TopMoviesList.tsx            ← Trending movies
├── hooks/
│   └── usePublications.ts           ← Feed state management
├── app/(tabs)/
│   └── feed.tsx                     ← Main feed screen
├── constants/
│   └── colors.ts                    ← Purple theme colors
└── PUBLICATIONS_SETUP.md            ← Detailed setup doc
```

## Next Steps

1. ✅ Backend running with API endpoints
2. ✅ `.env.local` configured with backend URL
3. ✅ Login flow integrated (uses AuthContext)
4. ✅ Feed accessible via `/feed` route
5. ⏭️ Add to your sidebar navigation (link to `/feed`)
6. ⏭️ Test with real data
7. ⏭️ Add additional features (edit, delete, search, etc.)

## Support

- Check console logs for API errors
- Verify `AsyncStorage` has token: `AsyncStorage.getItem('authToken')`
- Use React DevTools to inspect `AuthContext` value

Good luck! 🚀
