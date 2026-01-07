# MyKidDiary - Agent Notes

## Test Users

### User 1: aasseeeell
- **Username**: aasseeeell
- **Password**: 12345678
- **Status**: Active

### User 2: aaa
- **Username**: aaa
- **Password**: Xyz78900
- **Status**: Active

### User 3: ttt
- **Username**: ttt
- **Password**: Xyz78900
- **Status**: Active (may have password hash issue from old registration)

## Known Issues

### Authentication/Session Issues
- **Problem**: Users getting logged out unexpectedly, especially after posting
- **Status**: ✅ FIXED (Dec 11, 2025)
- **Root Cause**: All API error responses were being treated the same - any error would trigger logout or cause undefined behavior
- **Solution Applied**:
  1. Updated ALL API functions to distinguish between 401 (auth failure) and other errors
  2. Only 401 errors trigger logout, all other errors show appropriate messages
  3. Network errors are caught and logged without logging out the user
  4. Added comprehensive console.error logging for debugging
  5. Functions updated with proper 401 handling:
     - `fetchProfile()` - Logout on any error (stale tokens)
     - `loadFeed()` - Logout only on 401
     - `loadMyPosts()` - Logout only on 401
     - `handlePostSubmit()` - Logout only on 401 (fixes post creation logout bug)
     - `editPost()` - Logout only on 401
     - `deletePost()` - Logout only on 401
     - `loadProfile()` - Logout only on 401
     - `followUser()` - Logout only on 401
     - `unfollowUser()` - Logout only on 401
     - `loadConnections()` - Logout only on 401
     - `searchUsers()` - Logout only on 401

### Previous Solutions (Still Active)
1. ✅ Improved error handling to avoid automatic logout on network errors
2. ✅ Better token validation - only logout on actual auth failures (401)
3. ✅ Graceful handling of failed API requests
4. ✅ Connections page auto-refresh after follow/unfollow operations
5. ✅ Console logging for debugging network issues

## Features Tested

### ✅ Registration
- New user registration with validation
- Password hashing working correctly
- Duplicate username/email detection

### ✅ Login
- Username/password authentication
- JWT token generation (7-day expiration)
- Session persistence via localStorage

### ✅ Post/Secret Management
- Create new secrets
- Edit existing secrets
- Delete secrets
- Privacy settings (private, followers, specific, public)

### ✅ Connections Feature
- **Status**: Ready for testing
- **Features Implemented**:
  - View followers list with count
  - View following list with count
  - Unfollow users from Following list
  - Follow Back button for followers
  - Auto-refresh after follow/unfollow actions
  - Empty state messages
  - Responsive design (side-by-side on desktop, stacked on mobile)
- **Testing Required**: Test with multiple users (aaa, ttt, aasseeeell)

## Testing Instructions

### Test Connections Feature
1. Login as user `aaa` (password: Xyz78900)
2. Go to Profile section
3. Search for user `ttt` and follow them
4. Logout and login as `ttt`
5. Go to Connections tab
6. Verify `aaa` appears in Followers list
7. Click "Follow Back" button
8. Verify `aaa` appears in Following list
9. Go to Profile and search for `aasseeeell`
10. Follow `aasseeeell`
11. Logout and login as `aasseeeell`
12. Go to Connections tab
13. Verify followers and following lists work correctly

## Development Notes

### Docker Compose
- MongoDB running on port 27017
- App running on port 3000
- Volumes configured for hot-reload
- Restart policy: unless-stopped

### Database
- MongoDB 6.0
- Collections: users, posts
- No authentication (development only - enable for production!)

### Environment Variables
- `MONGODB_URI`: mongodb://mongo:27017/mykiddiary
- `JWT_SECRET`: your-secret-key-change-in-production (⚠️ CHANGE FOR PRODUCTION!)

## Next Steps
1. Test connections feature thoroughly
2. Fix any logout/session issues
3. Add better error messages for network failures
4. Consider adding token refresh mechanism
5. Enable MongoDB authentication for production
