// Simple User Database System
// Handles user registration, authentication, and data persistence

export interface User {
  id: string;
  email: string;
  fullName: string;
  passwordHash: string;
  createdAt: number;
  lastLogin: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  fullName: string;
  email: string;
  password: string;
}

class UserDatabase {
  private static instance: UserDatabase;
  private users: Map<string, User> = new Map();
  private readonly STORAGE_KEY = 'cravrplan_users_db';

  private constructor() {
    this.loadUsers();
  }

  static getInstance(): UserDatabase {
    if (!UserDatabase.instance) {
      UserDatabase.instance = new UserDatabase();
    }
    return UserDatabase.instance;
  }

  // Simple password hashing (in production, use bcrypt or similar)
  private hashPassword(password: string): string {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  // Validate password
  private validatePassword(password: string, hash: string): boolean {
    return this.hashPassword(password) === hash;
  }

  // Load users from localStorage
  private loadUsers(): void {
    try {
      const savedUsers = localStorage.getItem(this.STORAGE_KEY);
      if (savedUsers) {
        const usersArray = JSON.parse(savedUsers);
        this.users = new Map(usersArray);
      }
    } catch (error) {
      console.error('Error loading users from database:', error);
      this.users = new Map();
    }
  }

  // Save users to localStorage
  private saveUsers(): void {
    try {
      const usersArray = Array.from(this.users.entries());
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(usersArray));
    } catch (error) {
      console.error('Error saving users to database:', error);
    }
  }

  // Register a new user
  registerUser(signupData: SignupData): { success: boolean; user?: User; error?: string } {
    try {
      // Validate input
      if (!signupData.email || !signupData.password || !signupData.fullName) {
        return { success: false, error: 'All fields are required' };
      }

      if (signupData.password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters long' };
      }

      if (!this.isValidEmail(signupData.email)) {
        return { success: false, error: 'Please enter a valid email address' };
      }

      // Check if user already exists
      const existingUser = this.findUserByEmail(signupData.email);
      if (existingUser) {
        return { success: false, error: 'User with this email already exists' };
      }

      // Create new user
      const newUser: User = {
        id: Date.now().toString(),
        email: signupData.email.toLowerCase(),
        fullName: signupData.fullName.trim(),
        passwordHash: this.hashPassword(signupData.password),
        createdAt: Date.now(),
        lastLogin: Date.now()
      };

      // Save user to database
      this.users.set(newUser.id, newUser);
      this.saveUsers();

      // Return user without password hash
      const { passwordHash, ...userWithoutPassword } = newUser;
      return { success: true, user: userWithoutPassword as User };
    } catch (error) {
      console.error('Error registering user:', error);
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  }

  // Authenticate user
  authenticateUser(credentials: LoginCredentials): { success: boolean; user?: User; error?: string } {
    try {
      // Validate input
      if (!credentials.email || !credentials.password) {
        return { success: false, error: 'Email and password are required' };
      }

      // Find user by email
      const user = this.findUserByEmail(credentials.email);
      if (!user) {
        return { success: false, error: 'Invalid email or password' };
      }

      // Validate password
      if (!this.validatePassword(credentials.password, user.passwordHash)) {
        return { success: false, error: 'Invalid email or password' };
      }

      // Update last login
      user.lastLogin = Date.now();
      this.users.set(user.id, user);
      this.saveUsers();

      // Return user without password hash
      const { passwordHash, ...userWithoutPassword } = user;
      return { success: true, user: userWithoutPassword as User };
    } catch (error) {
      console.error('Error authenticating user:', error);
      return { success: false, error: 'Authentication failed. Please try again.' };
    }
  }

  // Find user by email
  private findUserByEmail(email: string): User | undefined {
    const normalizedEmail = email.toLowerCase();
    for (const user of this.users.values()) {
      if (user.email === normalizedEmail) {
        return user;
      }
    }
    return undefined;
  }

  // Get user by ID
  getUserById(id: string): User | undefined {
    const user = this.users.get(id);
    if (user) {
      const { passwordHash, ...userWithoutPassword } = user;
      return userWithoutPassword as User;
    }
    return undefined;
  }

  // Update user profile
  updateUserProfile(userId: string, updates: Partial<Pick<User, 'fullName' | 'email'>>): { success: boolean; user?: User; error?: string } {
    try {
      const user = this.users.get(userId);
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      // Validate email if being updated
      if (updates.email && !this.isValidEmail(updates.email)) {
        return { success: false, error: 'Please enter a valid email address' };
      }

      // Check if email is already taken by another user
      if (updates.email && updates.email.toLowerCase() !== user.email) {
        const existingUser = this.findUserByEmail(updates.email);
        if (existingUser && existingUser.id !== userId) {
          return { success: false, error: 'Email is already taken' };
        }
      }

      // Update user
      const updatedUser = {
        ...user,
        ...updates,
        email: updates.email ? updates.email.toLowerCase() : user.email
      };

      this.users.set(userId, updatedUser);
      this.saveUsers();

      // Return user without password hash
      const { passwordHash, ...userWithoutPassword } = updatedUser;
      return { success: true, user: userWithoutPassword as User };
    } catch (error) {
      console.error('Error updating user profile:', error);
      return { success: false, error: 'Profile update failed. Please try again.' };
    }
  }

  // Change password
  changePassword(userId: string, currentPassword: string, newPassword: string): { success: boolean; error?: string } {
    try {
      const user = this.users.get(userId);
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      // Validate current password
      if (!this.validatePassword(currentPassword, user.passwordHash)) {
        return { success: false, error: 'Current password is incorrect' };
      }

      // Validate new password
      if (newPassword.length < 6) {
        return { success: false, error: 'New password must be at least 6 characters long' };
      }

      // Update password
      user.passwordHash = this.hashPassword(newPassword);
      this.users.set(userId, user);
      this.saveUsers();

      return { success: true };
    } catch (error) {
      console.error('Error changing password:', error);
      return { success: false, error: 'Password change failed. Please try again.' };
    }
  }

  // Delete user account
  deleteUser(userId: string, password: string): { success: boolean; error?: string } {
    try {
      const user = this.users.get(userId);
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      // Validate password
      if (!this.validatePassword(password, user.passwordHash)) {
        return { success: false, error: 'Password is incorrect' };
      }

      // Delete user
      this.users.delete(userId);
      this.saveUsers();

      return { success: true };
    } catch (error) {
      console.error('Error deleting user:', error);
      return { success: false, error: 'Account deletion failed. Please try again.' };
    }
  }

  // Get all users (for admin purposes)
  getAllUsers(): User[] {
    return Array.from(this.users.values()).map(user => {
      const { passwordHash, ...userWithoutPassword } = user;
      return userWithoutPassword as User;
    });
  }

  // Get user statistics
  getUserStats(): { totalUsers: number; activeUsers: number } {
    const now = Date.now();
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);

    const totalUsers = this.users.size;
    const activeUsers = Array.from(this.users.values()).filter(user => user.lastLogin > thirtyDaysAgo).length;

    return { totalUsers, activeUsers };
  }

  // Email validation
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Clear all data (for testing/reset)
  clearAllData(): void {
    this.users.clear();
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // Export database (for backup)
  exportDatabase(): string {
    const usersArray = Array.from(this.users.entries());
    return JSON.stringify(usersArray, null, 2);
  }

  // Import database (for restore)
  importDatabase(data: string): { success: boolean; error?: string } {
    try {
      const usersArray = JSON.parse(data);
      this.users = new Map(usersArray);
      this.saveUsers();
      return { success: true };
    } catch (error) {
      console.error('Error importing database:', error);
      return { success: false, error: 'Invalid database format' };
    }
  }
}

// Export singleton instance
export const userDatabase = UserDatabase.getInstance();

// Convenience functions
export const registerUser = (signupData: SignupData) => userDatabase.registerUser(signupData);
export const authenticateUser = (credentials: LoginCredentials) => userDatabase.authenticateUser(credentials);
export const getUserById = (id: string) => userDatabase.getUserById(id);
export const updateUserProfile = (userId: string, updates: Partial<Pick<User, 'fullName' | 'email'>>) => userDatabase.updateUserProfile(userId, updates);
export const changePassword = (userId: string, currentPassword: string, newPassword: string) => userDatabase.changePassword(userId, currentPassword, newPassword);
export const deleteUser = (userId: string, password: string) => userDatabase.deleteUser(userId, password);
