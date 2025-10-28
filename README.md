# Speedtest Clone - speedtst.online

A fully functional internet speed testing website that measures download/upload speeds and ping.

## Local Development

To test the application locally:

1. **Using Python (recommended)**:
   ```bash
   cd public
   python -m http.server 8000
   ```
   Then open: http://localhost:8000

2. **Using Node.js**:
   ```bash
   npx http-server public -p 8000
   ```
   Then open: http://localhost:8000

3. **Or simply open the file**:
   - Navigate to `public/index.html`
   - Double-click to open in your browser

## Project Structure

```
speedtest/
├── public/
│   ├── index.html          # Main page
│   ├── css/
│   │   └── styles.css      # Styling
│   ├── js/
│   │   └── speedtest.js    # Speed test logic
│   ├── images/             # Images (future)
│   └── blog/               # Blog articles (future)
├── CLAUDE.md               # Development guide
├── prd.md                  # Product requirements
└── Task Lis.md             # Task list
```

## Features Implemented

- [x] UI/UX matching Speedtest.net design
- [x] Animated speed gauge with progress indicator
- [x] Real ping/latency test (to Cloudflare)
- [x] Real download speed test (multi-connection support)
- [x] Real upload speed test (multi-connection support)
- [x] IP and ISP detection (ipapi.co API)
- [x] Test history (localStorage)
- [x] Multi/Single connection toggle
- [x] Responsive design
- [x] History modal with clear function
- [x] Vercel serverless function for uploads

## How It Works

### Speed Tests
- **Ping Test**: Measures latency to Cloudflare CDN (5 samples, averaged)
- **Download Test**: Downloads 10MB files from OVH test servers
  - Multi mode: 4 parallel connections
  - Single mode: 1 connection
  - Test duration: ~5 seconds
- **Upload Test**: Uploads data in 512KB chunks
  - Pre-generates data using crypto.getRandomValues for speed
  - Uses Vercel serverless function in production
  - Fallback to httpbin.org for local testing
  - Multi mode: 4 parallel connections
  - Test duration: ~5 seconds

### IP Detection
- Primary: ipapi.co (30k requests/month free)
- Fallback: ipify.org (unlimited, IP only)
- Displays: IP address, ISP name, city, country

## Deployment

### Deploy to Vercel

1. **Install Vercel CLI** (first time only):
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   # Login to Vercel
   vercel login

   # Deploy to production
   vercel --prod
   ```

3. **Configure custom domain**:
   - Go to Vercel dashboard
   - Project settings → Domains
   - Add domain: **speedtst.online**
   - Update DNS records as instructed

## Domain

Production URL: **speedtst.online**
