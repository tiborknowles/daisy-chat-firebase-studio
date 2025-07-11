# DaisyAI Chat - Firebase Studio Template

A modern AI-powered chat interface for the music industry, built with Firebase Studio best practices.

## Features

- 🔐 Firebase Authentication with Google Sign-in
- 💬 Real-time chat interface
- 🤖 Powered by Google's Gemini AI via Genkit
- ⚡ Built with React, TypeScript, and Vite
- 🎨 Tailwind CSS for styling
- 🔥 Firebase Hosting ready

## Getting Started in Firebase Studio

1. **Open in Firebase Studio**:
   - Go to [Firebase Studio](https://firebase.google.com/studio)
   - Click "Import from GitHub"
   - Enter: `https://github.com/yourusername/daisy-chat-firebase-studio`

2. **Firebase Studio will automatically**:
   - Set up authentication
   - Configure environment variables
   - Handle IAM permissions
   - Provide development environment

3. **Start developing**:
   ```bash
   cd app
   npm install
   npm run dev
   ```

## Project Structure

```
daisy-chat-firebase-studio/
├── app/                    # React application
│   ├── src/
│   │   ├── lib/           # Firebase configuration
│   │   ├── components/    # React components
│   │   └── services/      # Genkit chat service
│   └── package.json
├── firebase.json          # Firebase configuration
├── .firebaserc           # Firebase project settings
└── idx-template.json     # Firebase Studio template
```

## Key Technologies

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **AI**: Google Genkit with Gemini 1.5 Flash
- **Authentication**: Firebase Auth
- **Hosting**: Firebase Hosting
- **Development**: Firebase Studio

## Configuration

The app uses environment variables for configuration. Firebase Studio will set these automatically, but for local development, create an `app/.env` file:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_GEMINI_API_KEY=your-gemini-api-key
```

## Deployment

In Firebase Studio:
1. Click "Deploy" button
2. Firebase Studio handles everything automatically

For manual deployment:
```bash
cd app
npm run build
firebase deploy --only hosting
```

## Why Firebase Studio?

- **No IAM headaches**: Automatic permission handling
- **Integrated development**: Everything in one place
- **Preview deployments**: Test before going live
- **Built-in authentication**: No manual setup needed
- **Genkit integration**: AI features out of the box

## License

MIT