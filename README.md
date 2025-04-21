# Next.js App with Google Authentication

A modern Next.js application featuring Google authentication using NextAuth.js.

## Features

- Google OAuth authentication
- Modern UI with Tailwind CSS
- TypeScript support
- ESLint configuration for code quality
- Responsive design

## Prerequisites

- Node.js 18.x or later
- npm or yarn
- Google Cloud Console account for OAuth credentials

## Getting Started

1. Clone the repository:
```bash
git clone <your-repo-url>
cd <your-repo-name>
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory with the following variables:
```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
NEXTAUTH_SECRET=your_random_secret_here
NEXTAUTH_URL=http://localhost:3000
```

4. Set up Google OAuth:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select an existing one
   - Enable the Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Deployment

### Deploying to Vercel

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Add environment variables in Vercel dashboard
5. Deploy!

### Environment Variables for Production

When deploying to production, update these environment variables:
```env
NEXTAUTH_URL=https://your-production-domain.com
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
NEXTAUTH_SECRET=your_random_secret
```

Don't forget to add your production domain to the authorized redirect URIs in Google Cloud Console:
```
https://your-production-domain.com/api/auth/callback/google
```

## Code Quality

This project uses ESLint with the following configurations:
- TypeScript support
- React Hooks rules
- Unused variables detection
- Console warnings
- Debugger statements prevention

## License

MIT
