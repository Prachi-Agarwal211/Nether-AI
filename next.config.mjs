
/** @type {import('next').NextConfig} */
const nextConfig = {
  headers: async () => [
    {
      source: '/api/:path*',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Cache-Control', value: 'no-store' },
      ],
    },
  ],
  // Suppress known benign warning from @supabase/realtime-js websocket-factory
  webpack: (config) => {
    const matcher = /[\\\/]@supabase[\\\/]realtime-js[\\\/]dist[\\\/]module[\\\/]lib[\\\/]websocket-factory\.js$/;
    const criticalMsg = 'Critical dependency: the request of a dependency is an expression';
    config.ignoreWarnings = config.ignoreWarnings || [];
    config.ignoreWarnings.push((warning) => {
      try {
        const msg = typeof warning.message === 'string' ? warning.message : '';
        const resource = warning?.module?.resource || '';
        return msg.includes(criticalMsg) && matcher.test(resource);
      } catch (_) {
        return false;
      }
    });
    return config;
  },
};

export default nextConfig;