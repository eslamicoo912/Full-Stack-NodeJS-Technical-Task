import { ApiError } from '../../shared/utils/api-error';
import { generateToken, comparePassword } from '../../shared/utils/auth.utils';
import * as authRepository from './auth.repository';
import { RegisterInput, LoginInput, AuthResponse } from './auth.interface';

export const register = async (input: RegisterInput): Promise<AuthResponse> => {
  const existingUser = await authRepository.findUserByEmail(input.email);
  if (existingUser) {
    throw ApiError.conflict('An account with this email already exists');
  }

  const user = await authRepository.createUser(input);
  return { user, token: generateToken(user) };
};

export const login = async (input: LoginInput): Promise<AuthResponse> => {
  const user = await authRepository.findUserByEmailWithPassword(input.email);

  // I used the same message here for both wrong email or wrong password 
  // to avoid leaking information and which email exists
  if (!user || !(await comparePassword(user, input.password))) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  return { user, token: generateToken(user) };
};
