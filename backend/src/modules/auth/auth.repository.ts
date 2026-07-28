import { User, IUser } from '../../database/models/user.model';
import { RegisterInput } from './auth.interface';

export const findUserByEmail = (email: string): Promise<IUser | null> => {
  return User.findOne({ email }).exec();
};

// Login needs the hashed password, which is excluded by default (select: false)
export const findUserByEmailWithPassword = (
  email: string
): Promise<IUser | null> => {
  return User.findOne({ email }).select('+password').exec();
};

// Password hashing is handled by the User model's pre-save hook
export const createUser = (input: RegisterInput): Promise<IUser> => {
  return User.create(input);
};
