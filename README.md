# CravrPlan - Meal Planning App

A modern meal planning application built with React, TypeScript, and Firebase. CravrPlan helps users discover recipes, plan meals, and manage their kitchen inventory.

## Features

### 🍽️ Recipe Management
- Browse thousands of recipes from Spoonacular API
- Search and filter recipes by ingredients, cuisine, diet, and more
- Save favorite recipes for quick access
- View detailed recipe information including nutrition facts

### 📅 Meal Planning
- Interactive calendar-based meal planning
- Drag and drop recipe scheduling
- Multiple meal types (breakfast, lunch, dinner, snacks)
- Nutrition tracking and meal balance

### 🥬 Fridge Management
- Track ingredients in your fridge
- Set expiration dates and quantities
- Reduce food waste with smart inventory management
- Generate shopping lists based on meal plans

### 👥 User Modes

#### Guest Mode
- Try the app without registration
- Browse recipes and create temporary meal plans
- Data is not saved permanently
- Limited access to advanced features

#### Member Mode
- Full access to all features
- Data persistence across sessions
- Custom recipe creation
- Advanced meal planning tools
- Cross-device synchronization

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: CSS Modules
- **Authentication**: Firebase Authentication
- **Database**: Firestore
- **Calendar**: FullCalendar
- **API**: Spoonacular Recipe API

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase account

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

3. Set up environment variables:
   - Create a `.env` file in the root directory
   - Add your Spoonacular API key: `VITE_SPOONACULAR_API_KEY=your-api-key-here`
   - Get a free API key from: https://spoonacular.com/food-api
   - The app will use mock data if no valid API key is provided

4. Set up Firebase (optional for full features):
   - Create a Firebase project
   - Enable Authentication and Firestore
   - Update `src/services/firebase.ts` with your Firebase config
   - See `FIREBASE_SETUP.md` for detailed instructions

5. Start the development server:
```bash
npm run dev
```

6. Open your browser and navigate to `http://localhost:5173`

### API Configuration

The app uses the Spoonacular API for recipe data. To use real API data:

1. Sign up for a free account at [Spoonacular](https://spoonacular.com/food-api)
2. Get your API key from your account dashboard
3. Add it to your `.env` file: `VITE_SPOONACULAR_API_KEY=your-actual-api-key`
4. Restart the development server

**Note**: The app includes comprehensive mock data and will work perfectly without an API key. The mock data includes a variety of recipes with full details, ingredients, and nutritional information.

### Firebase Setup

For detailed Firebase configuration instructions, see [FIREBASE_SETUP.md](./FIREBASE_SETUP.md).

## Usage

### For New Users
1. **Try as Guest**: Click "Continue as Guest" to explore the app
2. **Create Account**: Sign up for full access to all features

### For Registered Users
1. **Browse Recipes**: Search and discover new recipes
2. **Plan Meals**: Use the calendar to schedule your meals
3. **Manage Fridge**: Track your ingredients and expiration dates
4. **Save Favorites**: Build your personal recipe collection

## Project Structure

```
src/
├── components/          # Reusable UI components
├── context/            # React context providers
├── pages/              # Page components
├── services/           # API and Firebase services
├── styles/             # Global styles
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── assets/             # Static assets
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.
