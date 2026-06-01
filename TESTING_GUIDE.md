# 🧪 Testing the Publications Feed

## Quick Start

### 1. Mock Data Testing (No Backend Required)

If your backend isn't ready, you can test with mock data:

```typescript
// In services/api.ts, add this before the exports:

const MOCK_PUBLICATIONS = [
  {
    _id: '1',
    movieName: 'Echoes Tomorrow',
    category: 'Discusión',
    text: '¡Acabo de terminar de ver esta obra maestra! El giro de la trama final dejó alucinado. La cinematografía es simplemente hermosa.',
    userId: 'user1',
    username: 'Sarah Martinez',
    likes: 243,
    replies: 45,
    views: 1200,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
  {
    _id: '2',
    movieName: 'Neon Dreams',
    category: 'Crítica',
    text: 'Una película mediocre con buenos efectos visuales pero una trama confusa.',
    userId: 'user2',
    username: 'Juan Carlos',
    likes: 56,
    replies: 12,
    views: 340,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
  },
];

const MOCK_TOP_MOVIES = [
  { movieName: 'Echoes Tomorrow', count: 1234, icon: '🎬' },
  { movieName: 'Neon Dreams', count: 987, icon: '🌌' },
  { movieName: 'Last Hope', count: 654, icon: '🏆' },
  { movieName: 'City Lights', count: 432, icon: '🌃' },
  { movieName: 'Silent Shadows', count: 321, icon: '🎭' },
];
```

Then update the API methods to use mock data:

```typescript
// In publicationAPI object:

// For testing without backend
const USE_MOCK_DATA = false; // Set to true to use mock data

export const publicationAPI = {
  getAll: async (page = 1, limit = 20) => {
    if (USE_MOCK_DATA) {
      return Promise.resolve({
        data: MOCK_PUBLICATIONS,
      });
    }
    return apiClient.get('/publications', { params: { page, limit } });
  },

  getTopMovies: async (limit = 10) => {
    if (USE_MOCK_DATA) {
      return Promise.resolve({
        data: MOCK_TOP_MOVIES.slice(0, limit),
      });
    }
    return apiClient.get('/publications/top-movies', { params: { limit } });
  },

  // ... other methods
};
```

### 2. Test with Demo User

Update `app/(tabs)/feed.tsx` to auto-login a demo user:

```typescript
// Add this useEffect at the top of FeedScreen component

useEffect(() => {
  // Auto-login demo user for testing
  if (!isSignedIn && !authLoading) {
    const { login } = useAuth();
    login(
      { id: 'demo-user-123', username: 'Demo User' },
      'demo-token'
    ).catch(err => console.error('Demo login failed:', err));
  }
}, [isSignedIn, authLoading, useAuth]);
```

### 3. Test API Directly

In your terminal, test the backend API:

```bash
# Test getting all publications
curl http://localhost:3000/api/publications

# Test getting top movies
curl http://localhost:3000/api/publications/top-movies

# Test creating publication
curl -X POST http://localhost:3000/api/publications \
  -H "Content-Type: application/json" \
  -d '{
    "movieName": "Test Movie",
    "category": "Discusión",
    "text": "This is a test publication",
    "userId": "user123"
  }'
```

## Feature Testing Checklist

### ✅ Publications Feed

- [ ] Feed loads without errors
- [ ] Publication cards display correctly
- [ ] User avatars show first letter of username
- [ ] Timestamps display in relative format (e.g., "2h ago")
- [ ] Category badges show with correct colors
- [ ] Movie names display with star icon

### ✅ Create Publication

- [ ] "Crear Publicación" button is visible
- [ ] Modal opens when button is tapped
- [ ] Can enter movie name
- [ ] Can select different categories
- [ ] Can write comment text
- [ ] Submit button is disabled if fields are empty
- [ ] Publication appears in feed after creation
- [ ] Success notification shows
- [ ] Modal closes after submission

### ✅ Like Functionality

- [ ] Like button (🤍) displays on each publication
- [ ] Clicking like changes icon to 👍
- [ ] Like count increases/decreases
- [ ] Like state persists after page refresh
- [ ] Multiple users can like same publication

### ✅ Replies/Comments

- [ ] Comment icon (💬) displays with count
- [ ] Tapping comment opens reply modal
- [ ] Can write reply text
- [ ] Submit button works
- [ ] Reply count increases after submission
- [ ] Success notification shows

### ✅ Top Movies Section

- [ ] Top movies list displays at top of feed
- [ ] Movies are horizontally scrollable
- [ ] Each movie shows name, icon, and post count
- [ ] Can tap on movie (ready for filtering)
- [ ] List loads and displays without errors

### ✅ Pull-to-Refresh

- [ ] Can pull down to refresh
- [ ] Loading indicator shows during refresh
- [ ] Feed updates with latest publications
- [ ] Works multiple times

### ✅ Error Handling

- [ ] No error if API is slow
- [ ] Error message shows if API fails
- [ ] Can retry after error
- [ ] No crash if publication data is malformed

## Test Scenarios

### Scenario 1: Happy Path
1. Open feed
2. View publications
3. Create new publication
4. Like a publication
5. Reply to a publication
6. Refresh feed
7. ✅ All working

### Scenario 2: Network Issues
1. Turn off internet
2. Try to create publication
3. Error message should show
4. Turn internet back on
5. Retry
6. ✅ Should work

### Scenario 3: Large Data
1. Ensure backend returns 20+ publications
2. Scroll through feed
3. Performance should be smooth
4. No lag or crashes
5. ✅ Smooth scrolling

### Scenario 4: Multiple Users
1. Create publication as user A
2. Log in as user B
3. Like publication from user A
4. Reply as user B
5. Log back in as A
6. See B's reply and like
7. ✅ All data synced

## Debug Tips

### Check AsyncStorage

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// In your component or console:
const token = await AsyncStorage.getItem('authToken');
const user = await AsyncStorage.getItem('user');

console.log('Token:', token);
console.log('User:', user);
```

### Check Network Requests

In your browser's network tab (web version):
- Look for `/api/publications` requests
- Check response status (200 = good)
- Check response body has correct data

### Enable API Logging

Add this to `services/api.ts`:

```typescript
apiClient.interceptors.response.use(
  response => {
    console.log('✅ API Response:', response.config.url, response.status);
    return response;
  },
  error => {
    console.error('❌ API Error:', error.config?.url, error.message);
    return Promise.reject(error);
  }
);
```

### Check Component State

Use React DevTools:
1. Install React DevTools browser extension
2. Connect to Expo web version
3. Inspect `usePublications` hook state
4. Verify publications array
5. Check loading state

## Known Issues & Solutions

### "Cannot read property 'authToken' of undefined"
**Solution:** Make sure `AuthProvider` wraps your app in `app/_layout.tsx`

### "API Base URL is not configured"
**Solution:** Check `.env.local` exists and has `EXPO_PUBLIC_API_URL`

### "Publications not showing"
**Solution:** 
- Check API returns data
- Verify response matches `Publication` interface
- Check console for errors
- Enable mock data for testing

### "Likes/replies not updating"
**Solution:**
- Check API endpoint is correct
- Verify response includes updated count
- Check API is returning 200 status

## Performance Tips

- Feed loads first 20 publications (paginated)
- Avatars use only first letter (no image requests)
- Relative timestamps calculated client-side
- Optimistic updates for likes (instant feedback)

## Next: Backend Requirements

Once API is working, backend should return publications like:

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "movieName": "Echoes Tomorrow",
  "category": "Discusión",
  "text": "Great movie!",
  "userId": "user123",
  "username": "Sarah Martinez",
  "likes": 243,
  "replies": 45,
  "views": 1200,
  "createdAt": "2024-05-19T14:30:00Z"
}
```

Good luck testing! 🚀
