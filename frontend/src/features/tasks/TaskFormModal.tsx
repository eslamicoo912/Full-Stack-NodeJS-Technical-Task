import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Modal from '../../components/Modal';
import { createTaskApi, updateTaskApi } from '../../api/task.api';
import { getErrorMessage } from '../../api/client';
import { taskSchema, type TaskFormValues } from './task.schemas';
import { TaskStatus, TaskPriority, type Task } from '../../types/task';
import type { UserRef } from '../../types/user';

// One modal for both creating and editing a task
function TaskFormModal({
  projectId,
  task,
  assignees,
  onClose,
  onSuccess,
}: {
  projectId: string;
  task?: Task;
  assignees: UserRef[];
  onClose: () => void;
  onSuccess: (message: string) => void;
}) {
  const isEdit = Boolean(task);
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title ?? '',
      description: task?.description ?? '',
      status: task?.status ?? TaskStatus.TODO,
      priority: task?.priority ?? TaskPriority.MEDIUM,
      dueDate: task?.dueDate ? task.dueDate.slice(0, 10) : '',
      assignee: task?.assignee?._id ?? '',
    },
  });

  const mutation = useMutation({
    mutationFn: (values: TaskFormValues) => {
      const payload = {
        ...values,
        dueDate: values.dueDate || undefined,
        assignee: values.assignee || undefined,
      };
      return isEdit
        ? updateTaskApi(projectId, task!._id, {
            ...payload,
            assignee: values.assignee ? payload.assignee : null,
          })
        : createTaskApi(projectId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      onSuccess(isEdit ? 'Task updated' : 'Task created');
      onClose();
    },
    onError: (error) => setServerError(getErrorMessage(error)),
  });

  const onSubmit = (values: TaskFormValues) => {
    setServerError('');
    mutation.mutate(values);
  };

  return (
    <Modal title={isEdit ? 'Edit task' : 'New task'} onClose={onClose}>
      {serverError && (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {serverError}
        </p>
      )}

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Title
          </label>
          <input
            type="text"
            placeholder="Task title"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            {...register('title')}
          />
          {errors.title && (
            <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Description
          </label>
          <textarea
            rows={3}
            placeholder="What needs to be done? (optional)"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            {...register('description')}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Status
            </label>
            <select
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500"
              {...register('status')}
            >
              {Object.values(TaskStatus).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Priority
            </label>
            <select
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500"
              {...register('priority')}
            >
              {Object.values(TaskPriority).map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Due date
            </label>
            <input
              type="date"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
              {...register('dueDate')}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Assignee
            </label>
            <select
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500"
              {...register('assignee')}
            >
              <option value="">Unassigned</option>
              {assignees.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
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
                : 'Create task'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default TaskFormModal;
