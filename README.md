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

#### Demo Account
- Pre-configured account with sample data
- Email: `demo@cravrplan.com`
- Password: `demo123`

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

3. Set up Firebase:
   - Create a Firebase project
   - Enable Authentication and Firestore
   - Update `src/services/firebase.ts` with your Firebase config
   - See `FIREBASE_SETUP.md` for detailed instructions

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

### Firebase Setup

For detailed Firebase configuration instructions, see [FIREBASE_SETUP.md](./FIREBASE_SETUP.md).

## Usage

### For New Users
1. **Try as Guest**: Click "Continue as Guest" to explore the app
2. **Create Account**: Sign up for full access to all features
3. **Use Demo**: Login with demo credentials to see sample data

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
