# Firebase Environment Variables Setup

## Create .env File

Create a `.env` file in your project root with the following content:

```env
# Firebase Configuration
# Replace these placeholder values with your actual Firebase project credentials
# Get these from: Firebase Console > Project Settings > General > Your Apps

VITE_FIREBASE_API_KEY=your_actual_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Example Configuration

Here's an example of what your `.env` file should look like (replace with your actual values):

```env
VITE_FIREBASE_API_KEY=AIzaSyC1234567890abcdefghijklmnopqrstuvwxyz
VITE_FIREBASE_AUTH_DOMAIN=my-cravrplan-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=my-cravrplan-app
VITE_FIREBASE_STORAGE_BUCKET=my-cravrplan-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdefghijklmnop
```

## How to Get Your Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select your existing project
3. Click the gear icon ⚙️ next to "Project Overview"
4. Select "Project settings"
5. Scroll down to "Your apps" section
6. Click the web icon (</>) to add a web app
7. Register your app with a nickname (e.g., "cravrplan-web")
8. Copy the configuration object and use those values in your `.env` file

## Important Notes

- The `.env` file should be in your project root (same level as `package.json`)
- Never commit your `.env` file to version control (it should be in `.gitignore`)
- All environment variables must start with `VITE_` to be accessible in your React app
- After creating the `.env` file, restart your development server

## Troubleshooting

If you still see TypeScript errors after setting up the `.env` file:

1. Make sure you've installed Firebase: `npm install firebase`
2. Restart your development server: `npm run dev`
3. Check that the `.env` file is in the correct location
4. Verify that all environment variable names start with `VITE_`
