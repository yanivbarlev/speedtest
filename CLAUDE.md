# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Speedtest.net clone - an internet speed testing web application optimized for Google AdSense approval and monetization. The application will measure download/upload speeds and ping, with a visually appealing UI matching Speedtest.net's design language.

## Technical Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Hosting**: Vercel (static hosting)
- **Speed Test**: WebSocket connections or HTTP-based speed testing
- **Data Storage**: localStorage (for test history, user preferences)
- **Backend** (future): Serverless functions on Vercel for upload tests and server selection

## Project Structure

```
speedtest/
├── public/                 # Static assets (to be created)
│   ├── index.html         # Main speed test page
│   ├── about.html         # About page
│   ├── privacy.html       # Privacy policy
│   ├── terms.html         # Terms of service
│   ├── faq.html           # FAQ page
│   ├── contact.html       # Contact page
│   ├── css/
│   │   └── styles.css     # Main stylesheet
│   ├── js/
│   │   └── speedtest.js   # Speed test engine logic
│   ├── images/            # Images and icons
│   └── blog/              # Blog articles (required for AdSense)
├── api/                   # Vercel serverless functions (future)
│   ├── test-server.js     # Upload test endpoint
│   └── servers.js         # Server selection endpoint
├── vercel.json            # Vercel configuration (to be created)
├── template.html          # UI template reference
├── prd.md                 # Product requirements document
└── Task Lis.md            # Development task list
```

## Development Commands

Since this is a static site project, there are no build commands. Development workflow:

1. **Local Development**: Open HTML files directly in browser or use a simple HTTP server:
   ```bash
   # Using Python
   python -m http.server 8000

   # Using Node.js (if http-server is installed)
   npx http-server public -p 8000
   ```

2. **Deploy to Vercel**:
   ```bash
   # Install Vercel CLI (first time only)
   npm i -g vercel

   # Deploy to production
   vercel --prod

   # Deploy to preview
   vercel
   ```

3. **Testing**: Open browser and manually test speed test functionality across browsers (Chrome, Firefox, Safari, Edge)

## Architecture & Key Components

### Speed Test Engine (`public/js/speedtest.js`)

The core speed testing logic consists of three sequential phases:

1. **Ping/Latency Test**
   - Sends multiple HTTP requests to test server
   - Measures round-trip time
   - Calculates average, min, max latency
   - Updates UI in real-time

2. **Download Speed Test**
   - Fetches test files from CDN (CloudFlare, LibreSpeed, or similar)
   - Supports multi-connection testing (4-8 parallel connections for accuracy)
   - Calculates speed in Mbps from bytes transferred / time elapsed
   - Handles errors and timeouts gracefully

3. **Upload Speed Test**
   - Generates random data to upload
   - POSTs data to test endpoint (serverless function or external service)
   - Calculates upload speed in Mbps
   - Updates UI with real-time progress

### State Management

The speed test uses a simple state machine:
- `IDLE` - Waiting for user to start test
- `TESTING_PING` - Measuring latency
- `TESTING_DOWNLOAD` - Measuring download speed
- `TESTING_UPLOAD` - Measuring upload speed
- `COMPLETE` - Test finished, showing results

UI updates are tied to state transitions.

### Server Selection

- Auto-detects user location via IP geolocation API (ipapi.co or ip-api.com)
- Auto-selects nearest/fastest server based on location and ping
- Allows manual server override
- Maintains list of test servers across 5+ geographic regions
- Caches selection in sessionStorage

### Test History

- Stores last 10-20 test results in localStorage
- Each result includes: timestamp, download speed, upload speed, ping, server info, IP address
- Provides export functionality (CSV)
- Optional: Backend database integration (future enhancement)

## External Services & APIs

### Free APIs Used

1. **IP Geolocation**:
   - ipapi.co (free tier: 30,000 requests/month)
   - ip-api.com (free for non-commercial use)

2. **User IP Detection**:
   - ipify.org API: `https://api.ipify.org?format=json`

3. **Test Files**:
   - CloudFlare CDN endpoints
   - LibreSpeed test files
   - DigitalOcean spaces (public)

### AdSense Integration (Phase 6)

- Ad placement zones defined in PRD (lines 143-161)
- Must have 15+ quality blog articles (500+ words each) before application
- Requires Privacy Policy, Terms of Service, About, Contact pages
- Site should be live 1-6 months before application

## Design System

### Colors
- Background gradient: `#1a1d2e` to `#0f1118`
- Accent color: `#00d4ff` (cyan/blue)
- Text: `#ffffff` (white)
- Secondary text: `rgba(255, 255, 255, 0.6)`

### Typography
- Font stack: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif`
- Responsive design: mobile-first approach
- Touch-friendly buttons: minimum 44x44px

### Animations
- Smooth transitions (0.3s default)
- Animated circular gauge during testing
- Number count-up animations for results
- Loading states and progress indicators

## Important Constraints & Requirements

### Performance Targets
- Initial page load: < 3 seconds
- Time to interactive: < 5 seconds
- Lighthouse performance score: > 90
- Speed test completion time: 30-60 seconds
- Test accuracy: within 10% of reference tests

### Browser Support
- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

### Accessibility
- WCAG 2.1 AA compliance required
- Keyboard navigation support
- Screen reader compatibility
- Sufficient color contrast (4.5:1 minimum)
- ARIA labels where needed

### SEO Requirements
- Semantic HTML structure
- Unique meta tags per page (title, description, OG tags)
- Schema.org markup for speed test
- sitemap.xml and robots.txt
- Fast Core Web Vitals (LCP < 2.5s, FID < 100ms, CLS < 0.1)

## Vercel Configuration

The `vercel.json` file should include:
- Security headers (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection)
- CSP headers for XSS protection
- Output directory set to `public/`
- Serverless function configuration (when backend is added)

Refer to Task Lis.md lines 341-369 for example configuration.

## Development Phases

The project follows a 5-phase development plan:

1. **Phase 1-2 (Weeks 1-3)**: Core speed test functionality and enhanced features
2. **Phase 3 (Weeks 3-4)**: Content pages for AdSense (about, privacy, terms, FAQ, blog articles)
3. **Phase 4 (Week 4)**: SEO and performance optimization
4. **Phase 5 (Week 5)**: Vercel deployment and final testing
5. **Phase 6 (Week 5+)**: AdSense application and integration

Detailed task breakdown available in `Task Lis.md`.

## Critical Implementation Notes

### Speed Test Accuracy
- Use multiple parallel connections for realistic multi-threaded testing
- Implement proper error handling and retry logic
- Test against reference sources (Speedtest.net, Fast.com) to validate accuracy
- Handle network interruptions gracefully with timeout limits (max 60 seconds)

### AdSense Approval Requirements
- Site must have substantial original content (15+ articles, 500+ words each)
- All policy pages must be present and linked in footer
- Site should have organic traffic (500-1000 visits recommended)
- Domain should be at least 6 months old (for new domains, expect delays)
- No copyright violations or prohibited content
- Working contact information required

### Multi vs Single Connection Testing
- Multi-threaded (default): Uses 4-8 parallel connections for realistic speed measurement
- Single-threaded: Uses 1 connection for testing specific scenarios
- User preference saved in localStorage
- UI toggle clearly explains difference to users

## Content Strategy

Blog articles must cover topics like:
- Understanding speed test results
- Internet speed requirements for different activities
- WiFi optimization tips
- ISP comparison and selection
- Network troubleshooting guides

See prd.md lines 350-365 for full content ideas list.

## Domain

Production domain: **speedtst.online**

## Development Workflow - IMPORTANT

**INCREMENTAL TESTING REQUIREMENT**: When developing features, stop at every testable checkpoint to allow user verification. For each checkpoint:
1. Clearly state what was just implemented
2. Provide exact instructions on how to test it
3. Explain what the user should expect to see/experience
4. Wait for user confirmation before proceeding to next feature

This ensures quality at each step and prevents building on broken foundations.

## Testing Checklist

Before deploying to production:
- Test speed test completes successfully (> 95% completion rate)
- Verify results accuracy (compare against Speedtest.net)
- Test on all major browsers and mobile devices
- Verify responsive design at various screen sizes
- Check console for errors
- Run Lighthouse audit (all scores > 90)
- Test all internal links work correctly
- Verify sitemap.xml and robots.txt are accessible
- Confirm analytics tracking is working
