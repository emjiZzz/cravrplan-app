# CravrPlan - Recipe Planning App

A modern recipe planning application built with React, TypeScript, and Firebase. Plan your meals, discover recipes, and manage your cooking schedule with ease.

## Features

- **Recipe Discovery**: Search and filter recipes by cuisine, diet, cooking time, and ingredients
- **Meal Planning**: Create weekly meal plans with drag-and-drop functionality
- **Favorites Management**: Save and organize your favorite recipes
- **Ingredient-Based Search**: Find recipes based on ingredients you have
- **User Authentication**: Secure login and registration with Firebase
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Mock API Setup

The app includes a comprehensive mock API system for portfolio and development purposes:

### Enhanced Mock Data
- **20+ Curated Recipes**: Diverse recipes covering various cuisines, diets, and meal types
- **Complete Data Structure**: All fields your app uses including ID, title, image, ingredients, instructions, nutrition, meal type, cuisine, diet, time, and notes
- **Realistic Content**: Professional recipe descriptions and ingredient lists

### Fallback Mechanism
- **Automatic Fallback**: If Spoonacular API responds with 402 Payment Required or rate limit exceeded, automatically uses mock dataset
- **Subtle Console Warnings**: Non-blocking console messages when falling back to mock data
- **Seamless Experience**: No UI disruption when switching between real and mock data

### Instant Display / Speed Optimization
- **Progressive Loading**: Recipe lists render immediately when using mock data
- **No Unnecessary Delays**: Removed loading spinners and delays for mock data
- **Instant Navigation**: Recipe details, ingredients, instructions, and nutrition display instantly
- **Preloaded Data**: Mock data is preloaded on app start for instant first navigation

### Filter Persistence
- **Local Storage**: User-selected filters persist across page refreshes
- **Automatic Restoration**: Filters are automatically restored when returning to the app
- **Real-time Updates**: Changing filters immediately refreshes results using either API or mock data

### Optional Real API Integration
- **Demonstration Ready**: Real Spoonacular calls work when API key is valid and under limit
- **Portfolio Friendly**: App works fully for portfolio purposes without API dependencies
- **No Breaking Errors**: API errors or rate limits won't break the UI

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cravrplan-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (optional for mock data):
Create a `.env` file in the root directory:
```env
VITE_SPOONACULAR_API_KEY=your-api-key-here
```

4. Start the development server:
```bash
npm run dev
```

The app will run on `http://localhost:5173`

## Usage

### Without API Key (Mock Data Mode)
- The app works immediately with comprehensive mock data
- All features are fully functional
- Instant loading and responsive UI
- Perfect for portfolio demonstration

### With API Key (Real API Mode)
- Set your Spoonacular API key in the `.env` file
- Real recipe data from Spoonacular API
- Automatic fallback to mock data on API errors
- Seamless experience regardless of API status

## Project Structure

```
src/
├── components/          # Reusable UI components
├── context/            # React context providers
├── pages/              # Page components
├── services/           # API and Firebase services
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── styles/             # Global styles
```

## Technologies Used

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: CSS Modules
- **Authentication**: Firebase Auth
- **Database**: Firestore
- **Recipe API**: Spoonacular (with mock fallback)
- **State Management**: React Context API
- **Routing**: React Router

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
