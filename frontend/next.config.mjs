/** @type {import('next').NextConfig} */
const config = {
  // optimizeCss requires 'critters' package — removed to avoid Docker build failure.
  // CSS render-blocking is handled instead via font preload and preconnect in layout.tsx.

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.BACKEND_URL || 'http://localhost:8000'}/api/:path*`
      }
    ]
  }
}

export default config
