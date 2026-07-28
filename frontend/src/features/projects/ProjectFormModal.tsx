import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Modal from '../../components/Modal';
import { createProjectApi, updateProjectApi } from '../../api/project.api';
import { getErrorMessage } from '../../api/client';
import { projectSchema, type ProjectFormValues } from './project.schemas';
import type { Project } from '../../types/project';

// One modal for both creating and editing (pass a project to edit it)
function ProjectFormModal({
  project,
  onClose,
  onSuccess,
}: {
  project?: Project;
  onClose: () => void;
  onSuccess: (message: string) => void;
}) {
  const isEdit = Boolean(project);
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: project?.name ?? '',
      description: project?.description ?? '',
    },
  });

  const mutation = useMutation({
    mutationFn: (values: ProjectFormValues) =>
      isEdit ? updateProjectApi(project!._id, values) : createProjectApi(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      onSuccess(isEdit ? 'Project updated' : 'Project created');
      onClose();
    },
    onError: (error) => setServerError(getErrorMessage(error)),
  });

  const onSubmit = (values: ProjectFormValues) => {
    setServerError('');
    mutation.mutate(values);
  };

  return (
    <Modal title={isEdit ? 'Edit project' : 'New project'} onClose={onClose}>
      {serverError && (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {serverError}
        </p>
      )}

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Name
          </label>
          <input
            type="text"
            placeholder="Project name"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            {...register('name')}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Description
          </label>
          <textarea
            rows={3}
            placeholder="What is this project about? (optional)"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            {...register('description')}
          />
          {errors.description && (
            <p className="mt-1 text-xs text-red-600">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {mutation.isPending
              ? 'Saving...'
              : isEdit
                ? 'Save changes'
                : 'Create project'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default ProjectFormModal;
