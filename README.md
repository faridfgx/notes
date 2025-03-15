# MemoVault PWA

MemoVault is a Progressive Web App for professional note-taking that works entirely offline after the first run.

## Features

- **Secure Local Authentication**: Password protection for your notes
- **Rich Text Editing**: Format your notes with headings, lists, and text styling
- **Offline First**: Works without internet connection after initial load
- **Responsive Design**: Works on desktops, tablets, and phones
- **Dark/Light Mode**: Switch between themes based on your preference
- **Local Storage**: All data is stored on your device
- **Installable**: Can be added to your home screen like a native app

## Installation

### As a PWA on Mobile or Desktop

1. Visit the MemoVault website
2. On Chrome/Edge:
   - Click the install icon (⊕) in the address bar
   - Or click the three-dot menu and select "Install MemoVault"
3. On Safari (iOS):
   - Tap the share button
   - Select "Add to Home Screen"

### Manual Setup

1. Clone this repository
2. Create an `icons` directory and place the app icons there
3. Serve the files using a web server (e.g., `python -m http.server` or any other server)
4. Access through localhost

## PWA Files Structure

- `index.html` - Main HTML file
- `styles.css` - CSS styles
- `script.js` - Application logic
- `manifest.json` - Web app manifest for PWA
- `sw.js` - Service worker for offline caching
- `offline.html` - Fallback page when offline
- `icons/` - Directory containing app icons in various sizes

## Icon Sizes Needed

For a minimal but complete PWA experience, the following icon sizes are required:

- favicon.ico (16x16, 32x32) - For browser tabs and bookmarks
- icon-192x192.png - For most home screens
- icon-512x512.png - Required by some app stores and platforms
- maskable-icon.png (512x512 with padding) - For adaptive icon support

## Browser Support

- Chrome (Android, desktop)
- Edge
- Firefox
- Safari (iOS, macOS)
- Samsung Internet

## Privacy

All data is stored locally on your device using the browser's localStorage. 
No data is ever sent to any server.

## License

MIT