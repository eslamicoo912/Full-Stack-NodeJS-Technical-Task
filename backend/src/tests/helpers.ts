import mongoose from 'mongoose';
import { User, IUser } from '../database/models/user.model';
import { UserRole } from '../shared/constants/user-role';
import { generateToken } from '../shared/utils/auth.utils';

// create a user directly in the DB and return it with a valid token
export const createTestUser = async (
  role: UserRole = UserRole.MEMBER
): Promise<{ user: IUser; token: string }> => {
  const unique = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const user = await User.create({
    name: 'Test User',
    email: `user_${unique}@example.com`,
    password: 'Password123',
    role,
  });
  return { user, token: generateToken(user) };
};

// wipe all collections so every test starts from a clean state
export const clearDatabase = async (): Promise<void> => {
  const collections = Object.values(mongoose.connection.collections);
  await Promise.all(collections.map((collection) => collection.deleteMany({})));
};
