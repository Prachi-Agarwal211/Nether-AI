This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## AI Configuration (Gemini)

Set the following environment variables in a `.env.local` file at the project root:

```
# Required (server-preferred)
GOOGLE_GEMINI_API_KEY=your_api_key_here

# Optional overrides
GOOGLE_GEMINI_MODEL=gemini-2.0-flash
GOOGLE_GEMINI_TIMEOUT_MS=30000
```

Notes:

- The app uses a centralized config in `src/core/ai-config.js` for model, endpoint, headers, and timeouts.
- `GOOGLE_GEMINI_API_KEY` is preferred. `NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY` is read only as a fallback.
- API calls are made via the REST endpoint `https://generativelanguage.googleapis.com/v1beta`.
- Consumer modules should import from `src/core/ai-config.js` rather than reading `process.env` directly.

## Presentation Engine v2

### Key Features
- **Master Layouts**: Hero, Split, Grid, Quote, Dashboard
- **Design Brief Schema**: Type-safe slide definitions
- **Streaming Generation**: Progressive deck building
- **Brand Synapse**: Automatic theme extraction

### Usage
```javascript
// Create a Design Brief
const brief = {
  slideId: 'hero1',
  layout: 'MasterHero',
  content: {
    title: 'Welcome'
  }
};

// Render in SlideRenderer
<SlideRenderer brief={brief} />
```

### Migration Guide
- Use `ai-contract.v2.js` for new development
- Legacy recipes still supported via auto-conversion
