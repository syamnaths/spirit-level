# Spirit Level PWA

A professional-grade spirit level Progressive Web Application (PWA) that transforms your mobile device into a precision leveling tool.

## Features

### Three Operating Modes

1. **Horizontal Vial** - Level surfaces using your phone's long edge
2. **Vertical Vial** - Check plumb walls and vertical surfaces using your phone's short edge
3. **Angle Finder (Protractor)** - Measure precise angles using your phone's back surface

### Core Functionality

- Real-time bubble movement with smooth 30+ FPS animation
- Numerical angle readout with ±0.1° precision
- User-initiated calibration (set any surface as 0.0° baseline)
- Hold/Lock feature to freeze readings
- Audio and haptic feedback when level (within ±0.2°)
- Low-pass filtering for stable, noise-free readings
- High-contrast color scheme for visibility in all lighting conditions
- **Fully responsive design** - optimized for all screen sizes and orientations

### PWA Capabilities

- Installable on mobile devices
- Works completely offline once installed
- Fullscreen mode for distraction-free use
- No app store required
- Adaptive UI that adjusts to device size and orientation

## Installation

### Using a Web Server

1. Clone or download this repository
2. Serve the files using any web server (e.g., `python -m http.server` or `npx serve`)
3. Open the app in a mobile browser (Chrome, Safari, Firefox)
4. Install the PWA:
   - **iOS**: Tap Share → Add to Home Screen
   - **Android**: Tap Menu → Install App

### Generate Icons

Before deploying, generate the required PWA icons:

1. Open `generate-icons.html` in a web browser
2. Click "Generate All Icons"
3. Icons will be downloaded automatically
4. Place the downloaded icons in the project root directory

## Usage

### Getting Started

1. Open the app on your mobile device
2. Grant sensor access when prompted (required for functionality)
3. Select your desired mode (Horizontal, Vertical, or Angle)

### Calibration

The app works best when calibrated:

1. Place your device on a known level surface
2. Tap the "Calibrate" button
3. The current surface is now set as 0.0°

### Feedback Controls

- **Hold Button**: Freeze the current reading for easier viewing
- **Feedback Toggle**: Enable/disable audio and haptic feedback

## Technical Specifications

### Sensor Technology

- Uses Device Orientation API (alpha/beta/gamma angles)
- **Automatic orientation detection** - Adjusts sensor axes for portrait/landscape
- Low-pass filter with α = 0.2 for noise reduction
- Real-time processing using `requestAnimationFrame`
- ±0.2° accuracy after calibration
- Smart axis mapping ensures correct bubble movement in all orientations

### Performance

- Minimum 30 FPS animation refresh rate
- Battery optimized (sensors pause when app is in background)
- Smooth CSS transitions and GPU-accelerated animations
- Responsive design with optimized breakpoints for all devices

### Responsive Design

The app features comprehensive responsive design optimizations:

- **Portrait & Landscape Support** - Seamless switching between orientations with automatic sensor axis adjustment
- **Screen Size Adaptations**:
  - Desktop/Tablet: Full-size interface with large, clear displays
  - Small screens (< 480px): Optimized layouts with adjusted font sizes
  - Extra small (< 360px): Compact design maintaining readability
  - Very small (< 320px): Two-row button layout for optimal space usage
- **Height Constraints** - Special optimizations for short screens (< 600px)
- **Vertical Mode** - Dynamic vial sizing based on viewport dimensions
- **Angle Finder** - Scales protractor and degree marks for smaller displays
- **Flexible Footer** - Wraps buttons on narrow screens, prevents overflow
- **Adaptive Typography** - Font sizes scale appropriately across all breakpoints

### Browser Support

- Chrome/Edge (Android, Desktop)
- Safari (iOS, macOS)
- Firefox (Android, Desktop)

**Requirements:**
- Device with accelerometer/gyroscope
- Modern browser with Device Orientation API support
- HTTPS (required for sensor access on most browsers)

## File Structure

```
spiritLevel/
├── index.html              # Main HTML structure
├── styles.css              # Styling with high-contrast theme
├── app.js                  # Core application logic
├── manifest.json           # PWA manifest
├── service-worker.js       # Offline functionality
├── generate-icons.html     # Icon generator tool
├── req.json               # Requirements specification
└── README.md              # This file
```

## Requirements Fulfilled

This implementation satisfies all requirements from `req.json`:

### Functional Requirements
- ✅ FR001: Horizontal vial display
- ✅ FR002: Vertical vial display
- ✅ FR003: Angle finder (protractor) mode
- ✅ FR004: Real-time bubble animation
- ✅ FR005: Numerical readout (0.1° precision)
- ✅ FR006: Calibration feature
- ✅ FR007: Audio/haptic feedback
- ✅ FR008: Hold/Lock button
- ✅ FR009: Sensor permission requests
- ✅ FR010: PWA installability
- ✅ FR011: Offline functionality

### Non-Functional Requirements
- ✅ NFR001: 30+ FPS performance
- ✅ NFR002: ±0.2° accuracy
- ✅ NFR003: Low-pass filter implementation
- ✅ NFR004: High-contrast color scheme
- ✅ NFR005: Battery optimization
- ✅ NFR006: Browser compatibility fallbacks

### UI/UX Requirements
- ✅ UIX001: Traditional spirit level appearance
- ✅ UIX002: Large, clear angle display
- ✅ UIX003: Portrait/landscape support

## Responsive Design Features

The Spirit Level PWA includes extensive responsive design implementation:

### Orientation Handling

**Automatic Portrait/Landscape Detection:**
- The app detects screen orientation in real-time using window dimensions
- Automatically swaps sensor axes when switching between portrait and landscape
- In **portrait mode**: Beta (front-back) and Gamma (left-right) map normally
- In **landscape mode**: Axes are intelligently swapped so bubble movement matches screen orientation
- Listens to both `orientationchange` and `resize` events for instant adaptation
- Ensures accurate leveling regardless of how the device is held

### Breakpoints & Optimizations

- **Default (Desktop/Tablet)**: Full-featured interface with 64px angle display
- **480px and below**: Compact mode with 48px angle display, smaller vials
- **360px and below**: Extra-compact mode with 40px display, minimal spacing
- **320px and below**: Ultra-compact with wrapping footer buttons
- **600px height**: Height-constrained optimizations for landscape phones
- **500px landscape height**: Special adjustments for small landscape devices

### Mode-Specific Responsiveness

**Horizontal Mode:**
- Vial width: 90% container, max 600px
- Auto-scales height: 120px → 100px → 80px based on screen
- Bubble size adjusts: 80px → 60px → 50px → 45px

**Vertical Mode:**
- Dynamic width calculation based on viewport height (max 80vh)
- Responsive sizing: 400px → 300px → 250px for smaller screens
- Proper centering with flexbox to prevent overflow
- Maintains aspect ratio when rotated 90°

**Angle Finder (Protractor):**
- Scales from 400px → 350px → 320px → 280px → 250px
- Degree mark text: 10px → 8px → 7px for readability
- SVG scales proportionally with container

### Footer Controls

- Flexible wrapping layout prevents horizontal overflow
- Button sizing: 14px → 12px → 11px → 10px font
- Two-row layout on very narrow screens (< 320px)
- Min/max width constraints for optimal touch targets
- Gap and padding scale with screen size

## Development

### Testing Locally

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your mobile browser.

### HTTPS Requirement

For sensor access, the app must be served over HTTPS. Options:

1. Use a tunneling service (ngrok, localtunnel)
2. Deploy to a hosting service with HTTPS
3. Use browser dev tools to override (Chrome: enable sensor emulation)

### Deployment

The app can be deployed to any static hosting service:
- GitHub Pages
- Netlify
- Vercel
- Firebase Hosting
- AWS S3 + CloudFront

## Browser Permissions

### iOS (Safari)
- Requires explicit permission request (iOS 13+)
- Must be served over HTTPS
- User gesture required before requesting permission

### Android (Chrome)
- Automatic permission grant on HTTPS
- Works on HTTP for localhost only

## Troubleshooting

### Sensors Not Working

1. Ensure HTTPS connection
2. Check browser compatibility
3. Grant sensor permissions when prompted
4. Try refreshing the page

### Inaccurate Readings

1. Use the calibration feature
2. Ensure device case/accessories aren't interfering
3. Place device flat on stable surface during calibration

### PWA Not Installing

1. Ensure all icon files are present
2. Check manifest.json is being served correctly
3. Verify HTTPS connection
4. Try clearing browser cache

### UI Layout Issues

1. **Footer buttons overlapping**: Clear browser cache and reload
2. **Vertical mode overflow**: Rotate device or adjust screen orientation
3. **Small text**: The app auto-scales - check if browser zoom is enabled
4. **Protractor too small**: The app adapts to screen size - this is normal on very small devices

## License

This project is provided as-is for educational and personal use.

## Credits

Built with vanilla HTML, CSS, and JavaScript - no frameworks required!
