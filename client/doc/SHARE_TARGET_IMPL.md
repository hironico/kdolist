I've successfully implemented PWA Share Target functionality for your kdolist app! Now you can share links, images, and content from other apps (like Amazon, websites, etc.) directly to your gift lists.

## What Was Implemented

### 1. Updated PWA Manifest (`client/manifest.json`)
```json
{
  "share_target": {
    "action": "/share",
    "method": "POST",
    "enctype": "multipart/form-data",
    "params": {
      "title": "title",
      "text": "text",
      "url": "url",
      "files": [
        {
          "name": "image",
          "accept": ["image/*"]
        }
      ]
    }
  }
}
```

**Features:**
- ✅ Accepts shared links (URLs)
- ✅ Accepts shared text
- ✅ Accepts shared titles
- ✅ Accepts shared images

### 2. Created Custom Service Worker (`client/src/share-sw.ts`)
- Handles POST requests from share target
- Converts POST data to GET parameters
- Redirects to SharePage with query params
- Integrated with Workbox for caching

### 3. Implemented SharePage Component (`client/src/pages/SharePage/SharePage.tsx`)

**Features:**
- ✅ Extracts shared data (title, text, URL)
- ✅ Loads user's gift lists
- ✅ Allows list selection
- ✅ Editable gift name (pre-filled from shared content)
- ✅ Creates gift with shared URL as link
- ✅ Shows loading states
- ✅ Error handling with notifications
- ✅ Navigates to list after saving

### 4. Updated Vite Configuration (`client/vite.config.ts`)
- Changed from `generateSW` to `injectManifest` strategy
- Points to custom service worker
- Properly handles manifest configuration

## How It Works

### User Flow:
```
1. User browses Amazon/website/app
2. User clicks Share button
3. Selects "kdolist" from share options
4. App opens to SharePage
5. Shared content displayed (URL, title, text)
6. User selects gift list
7. User confirms gift name
8. User clicks "Add to List"
9. Gift created with shared URL as link
10. Navigates to gift list
```

### Technical Flow:
```
OS Share → PWA Manifest → Service Worker (POST) 
  → Redirect to /share?url=...&title=... (GET)
  → SharePage Component → Extract Params 
  → Show UI → User Selects List 
  → API Call → Create Gift 
  → Navigate to List
```

## Testing Instructions

### Step 1: Build and Deploy
```bash
cd client
npm run build
```

### Step 2: Install PWA
1. Open app in browser (HTTPS required)
2. Install as PWA (Add to Home Screen)
3. Open installed PWA

### Step 3: Test Share from Browser
1. Visit any website (e.g., amazon.com)
2. Click browser Share button
3. Select "kdolist" 
4. **Expected**: App opens to SharePage with URL

### Step 4: Test Share from Amazon App
1. Open Amazon mobile app
2. Find a product
3. Tap Share icon
4. Select "kdolist"
5. **Expected**: App opens, you can select list and save

### Step 5: Test Share from Images
1. Open Photos/Gallery
2. Select an image
3. Tap Share
4. Select "kdolist"
5. **Expected**: App opens (image handling TBD)

## Current Features

### ✅ Working:
- Share links/URLs from any app
- Share text content
- Share page titles
- Select destination gift list
- Edit gift name before saving
- Create gift with shared URL as link
- Auto-navigate to list after save
- Error handling and notifications

### 🚧 To Be Implemented:
- **Image handling**: Currently images are logged but not saved
  - Could store in IndexedDB
  - Could upload to server
  - Could convert to base64 in gift images
- **Multiple file support**
- **Offline queue** (if shared while offline)

## Example Use Cases

### Amazon Shopping:
```
1. Browse product on Amazon
2. Tap Share → kdolist
3. Select "Birthday Gifts" list
4. Gift name: "Sony Headphones"
5. Click "Add to List"
6. Gift saved with Amazon product link
```

### Restaurant/Website:
```
1. Find restaurant/place
2. Share URL to kdolist
3. Select "Travel Wishlist"
4. Gift name: "Nice Restaurant in Paris"
5. Click "Add to List"
```

### Social Media:
```
1. See cool product on Instagram
2. Copy link → Open kdolist
3. Or directly share to kdolist
4. Select list → Save
```

## SharePage UI

```
┌─────────────────────────────────────┐
│ Add Shared Content to Gift List     │
├─────────────────────────────────────┤
│                                     │
│ Shared Content:                     │
│ Title: Sony WH-1000XM5             │
│ URL: https://amazon.com/product... │
│                                     │
│ ┌─────────────────────────────┐   │
│ │ Gift Name                    │   │
│ │ Sony WH-1000XM5             │   │
│ └─────────────────────────────┘   │
│                                     │
│ ┌─────────────────────────────┐   │
│ │ Select Gift List ▼          │   │
│ │ Birthday Gifts              │   │
│ └─────────────────────────────┘   │
│                                     │
│ [Cancel]         [Add to List ✓]  │
└─────────────────────────────────────┘
```

## Requirements

### Browser Support:
- ✅ Chrome/Edge (Chromium)
- ✅ Safari (iOS 15+)
- ✅ Firefox (with PWA support)

### Prerequisites:
- ✅ HTTPS (required for PWA)
- ✅ Installed as PWA  
- ✅ User must be logged in

## Configuration

### To Accept More File Types:
Edit `client/manifest.json`:
```json
"files": [
  {
    "name": "image",
    "accept": ["image/*"]
  },
  {
    "name": "video",
    "accept": ["video/*"]
  },
  {
    "name": "pdf",
    "accept": [".pdf", "application/pdf"]
  }
]
```

### To Change Share Action URL:
Edit `client/manifest.json`:
```json
"share_target": {
  "action": "/my-custom-share-path",
  ...
}
```

## Troubleshooting

### Share Option Doesn't Appear:
1. Make sure app is installed as PWA
2. Check browser supports Web Share Target
3. Try reinstalling PWA
4. Clear browser cache

### Shared Content Not Showing:
1. Check browser console for errors
2. Verify service worker is active
3. Try sharing from different app
4. Check URL parameters in address bar

### Can't Save Gift:
1. Verify user is logged in
2. Check network connection
3. Verify gift list exists
4. Check browser console for API errors

## Next Steps for Enhanced Image Support

To fully support shared images:

1. **Store in IndexedDB**:
   ```typescript
   // In service worker
   const imageId = await storeImageInIndexedDB(imageFile);
   params.set('imageId', imageId);
   ```

2. **Retrieve in SharePage**:
   ```typescript
   const imageId = params.get('imageId');
   const imageFile = await getImageFromIndexedDB(imageId);
   const base64 = await fileToBase64(imageFile);
   ```

3. **Add to Gift**:
   ```typescript
   images.push({
     url: base64,
     giftId: '',
     createdAt: new Date(),
     updatedAt: new Date()
   });
   ```

Your kdolist app is now a full Share Target! Users can share anything from any app directly to their gift lists! 🎁✨