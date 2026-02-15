import { prisma } from '../config/database';

// Get user by ID (excludes passwordHash)
export const getUserById = async (userId: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        createdAt: true,
      },
    });
    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

// Get user by username (excludes passwordHash)
export const getUserByUsername = async (username: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        createdAt: true,
      },
    });
    return user;
  } catch (error) {
    console.error('Error fetching user by username:', error);
    throw error;
  }
};

// Update user profile (only fields the user is allowed to change)
export const updateProfile = async (
  userId: string,
  data: {
    displayName?: string;
    avatarUrl?: string;
    email?: string;
  }
) => {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        createdAt: true,
      },
    });
    return user;
  } catch (error: any) {
    if (error.code === 'P2002') {
      throw new Error('Email already in use');
    }
    console.error('Error updating profile:', error);
    throw error;
  }
};

// Delete user account and all associated data (cascades)
export const deleteUser = async (userId: string) => {
  try {
    // Sessions, WatchEntries, Recommendations cascade on delete
    await prisma.user.delete({
      where: { id: userId },
    });
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};