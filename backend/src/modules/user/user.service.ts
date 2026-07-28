import { QueryString, PaginatedResult } from '../../shared/utils/api-features';
import { IUser } from '../../database/models/user.model';
import * as userRepository from './user.repository';

// List users so an Admin can pick one to add as a project member
export const listUsers = (
  queryString: QueryString
): Promise<PaginatedResult<IUser>> => {
  return userRepository.findUsers(queryString);
};
