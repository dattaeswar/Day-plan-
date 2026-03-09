# DayPlan AI

A smart daily planner powered by Gemini AI.

## Features
- AI-powered task scheduling
- Local storage persistence
- Category-based organization
- Modern, responsive UI with Tailwind CSS

## Deployment to Vercel

1. **Push to GitHub**: Create a new repository on GitHub and push your code.
2. **Connect to Vercel**:
   - Go to [Vercel](https://vercel.com) and click "Add New" -> "Project".
   - Import your GitHub repository.
3. **Configure Environment Variables**:
   - In the Vercel project settings, go to "Environment Variables".
   - Add `VITE_GEMINI_API_KEY` with your Google AI Studio API key.
4. **Build Settings**: Vercel should automatically detect Vite. If not, ensure:
   - Build Command: `npm run build`
   - Output Directory: `dist`

## Security Note

This application currently calls the Gemini API directly from the client side for demonstration purposes. For a production-grade application, it is highly recommended to move these API calls to a backend server (e.g., Vercel Serverless Functions) to keep your API key hidden from the browser.

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file and add your API key:
   ```
   VITE_GEMINI_API_KEY=your_api_key_here
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
