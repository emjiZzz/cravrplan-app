// Demo Setup Utility
// Creates demo users for testing the application

import { userDatabase } from './userDatabase';

export const setupDemoUsers = () => {
  // Create admin user
  const adminResult = userDatabase.registerUser({
    fullName: 'Admin User',
    email: 'admin@cravrplan.com',
    password: 'admin123'
  });

  if (adminResult.success) {
    console.log('✅ Admin user created successfully');
  } else {
    console.log('⚠️ Admin user already exists or creation failed:', adminResult.error);
  }

  // Create demo user
  const demoResult = userDatabase.registerUser({
    fullName: 'Demo User',
    email: 'demo@cravrplan.com',
    password: 'demo123'
  });

  if (demoResult.success) {
    console.log('✅ Demo user created successfully');
  } else {
    console.log('⚠️ Demo user already exists or creation failed:', demoResult.error);
  }

  // Create test user
  const testResult = userDatabase.registerUser({
    fullName: 'Test User',
    email: 'test@cravrplan.com',
    password: 'test123'
  });

  if (testResult.success) {
    console.log('✅ Test user created successfully');
  } else {
    console.log('⚠️ Test user already exists or creation failed:', testResult.error);
  }

  console.log('🎉 Demo setup completed!');
  console.log('📧 Available demo accounts:');
  console.log('   Admin: admin@cravrplan.com / admin123');
  console.log('   Demo:  demo@cravrplan.com / demo123');
  console.log('   Test:  test@cravrplan.com / test123');
};

// Function to clear all demo data
export const clearDemoData = () => {
  userDatabase.clearAllData();
  console.log('🗑️ All demo data cleared');
};

// Function to get demo user credentials
export const getDemoCredentials = () => {
  return {
    admin: { email: 'admin@cravrplan.com', password: 'admin123' },
    demo: { email: 'demo@cravrplan.com', password: 'demo123' },
    test: { email: 'test@cravrplan.com', password: 'test123' }
  };
};

// Auto-setup demo users when this module is imported
if (typeof window !== 'undefined') {
  // Only run in browser environment
  setupDemoUsers();
}
