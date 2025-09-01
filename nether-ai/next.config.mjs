import withPWA from 'next-pwa';

const pwaConfig = {
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
};

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
  webpack: (config, { isServer }) => {
    // Add fallbacks for Node.js core modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        stream: false,
        zlib: false,
        http: false,
        https: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false
      };
      
      // Exclude Jimp from client-side bundle
      config.externals = config.externals || [];
      config.externals.push('jimp');
    }

    // In dev, avoid fetching external TS sources from node_modules sourcemaps
    if (process.env.NODE_ENV === 'development') {
      config.devtool = 'eval-cheap-module-source-map';
    }

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

export default withPWA(pwaConfig)(nextConfig);