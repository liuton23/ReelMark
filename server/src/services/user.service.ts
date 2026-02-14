import { prisma } from '../config/database';

// Create a new user
export const createUser = async (username: string, email?: string) => {
  try {
    const user = await prisma.user.create({
      data: {
        username,
        email,
      },
    });
    return user;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// Get user by ID
export const getUserById = async (userId: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

// Get user by username
export const getUserByUsername = async (username: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });
    return user;
  } catch (error) {
    console.error('Error fetching user by username:', error);
    throw error;
  }
};

// Get or create default user (for single-user mode)
export const getOrCreateDefaultUser = async () => {
  const defaultUsername = 'default_user';
  
  let user = await getUserByUsername(defaultUsername);
  
  if (!user) {
    user = await createUser(defaultUsername);
    console.log('✨ Created default user:', user.id);
  }
  
  return user;
};

// Get all users (for future multi-user)
export const getAllUsers = async () => {
  try {
    const users = await prisma.user.findMany();
    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};