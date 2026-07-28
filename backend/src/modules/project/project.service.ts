import { QueryFilter, Types } from 'mongoose';
import { ApiError } from '../../shared/utils/api-error';
import { UserRole } from '../../shared/constants/user-role';
import { QueryString, PaginatedResult } from '../../shared/utils/api-features';
import { IProject } from '../../database/models/project.model';
import { IUser } from '../../database/models/user.model';
import * as projectRepository from './project.repository';
import { CreateProjectInput, UpdateProjectInput } from './project.interface';

const isOwner = (project: IProject, user: IUser): boolean => {
  return String(project.owner) === String(user._id);
};

const isMember = (project: IProject, user: IUser): boolean => {
  return project.members.some((member) => String(member) === String(user._id));
};

// Admins can access every project but others need to own it or be a member
const canAccess = (project: IProject, user: IUser): boolean => {
  return (
    user.role === UserRole.ADMIN || isOwner(project, user) || isMember(project, user)
  );
};

// Only the owner or an Admin may modify or delete a project
const canModify = (project: IProject, user: IUser): boolean => {
  return user.role === UserRole.ADMIN || isOwner(project, user);
};

// Fetch a project and assert the user can at least view it
const getAccessibleProject = async (
  projectId: string,
  user: IUser
): Promise<IProject> => {
  const project = await projectRepository.findProjectById(projectId);
  if (!project) {
    throw ApiError.notFound('Project not found');
  }
  if (!canAccess(project, user)) {
    throw ApiError.forbidden('You do not have access to this project');
  }
  return project;
};

// List only the projects accessible to the authenticated user
export const listProjects = (
  user: IUser,
  queryString: QueryString
): Promise<PaginatedResult<IProject>> => {
  const filter: QueryFilter<IProject> =
    user.role === UserRole.ADMIN
      ? {}
      : { $or: [{ owner: user._id }, { members: user._id }] };

  return projectRepository.findProjects(filter, queryString);
};

export const getProject = async (
  user: IUser,
  projectId: string
): Promise<IProject> => {
  const project = await getAccessibleProject(projectId, user);
  return projectRepository.populateProject(project);
};

export const createProject = async (
  user: IUser,
  input: CreateProjectInput
): Promise<IProject> => {
  const project = await projectRepository.createProject({
    ...input,
    owner: user._id as Types.ObjectId,
  });
  return projectRepository.populateProject(project);
};

export const updateProject = async (
  user: IUser,
  projectId: string,
  input: UpdateProjectInput
): Promise<IProject> => {
  const project = await getAccessibleProject(projectId, user);
  if (!canModify(project, user)) {
    throw ApiError.forbidden('Only the project owner or an Admin can update it');
  }

  project.set(input);
  await project.save();
  return projectRepository.populateProject(project);
};

export const deleteProject = async (
  user: IUser,
  projectId: string
): Promise<void> => {
  const project = await getAccessibleProject(projectId, user);
  if (!canModify(project, user)) {
    throw ApiError.forbidden('Only the project owner or an Admin can delete it');
  }

  await projectRepository.deleteProjectWithRelated(project);
};

// Admin-only (enforced at the route level)
export const addMember = async (
  projectId: string,
  userId: string
): Promise<IProject> => {
  const project = await projectRepository.findProjectById(projectId);
  if (!project) {
    throw ApiError.notFound('Project not found');
  }

  const user = await projectRepository.findUserById(userId);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  if (String(project.owner) === userId) {
    throw ApiError.badRequest('The owner is already part of the project');
  }
  if (project.members.some((member) => String(member) === userId)) {
    throw ApiError.conflict('User is already a member of this project');
  }

  const updated = await projectRepository.addMemberById(projectId, userId);
  return updated as IProject;
};

// Admin-only (enforced at the route level)
export const removeMember = async (
  projectId: string,
  userId: string
): Promise<IProject> => {
  const project = await projectRepository.findProjectById(projectId);
  if (!project) {
    throw ApiError.notFound('Project not found');
  }

  if (!project.members.some((member) => String(member) === userId)) {
    throw ApiError.notFound('User is not a member of this project');
  }

  const updated = await projectRepository.removeMemberById(projectId, userId);
  return updated as IProject;
};
