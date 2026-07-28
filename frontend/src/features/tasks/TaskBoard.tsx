import { useEffect, useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProjectApi } from '../../api/project.api';
import { listTasksApi, deleteTaskApi, updateTaskApi } from '../../api/task.api';
import { getErrorMessage } from '../../api/client';
import { useAuth } from '../auth/auth-context';
import TaskFormModal from './TaskFormModal';
import AuditLogModal from './AuditLogModal';
import MemberList from '../projects/MemberList';
import ConfirmDialog from '../../components/ConfirmDialog';
import { useSocket } from '../../lib/useSocket';
import { useToast } from '../../lib/useToast';
import {
  TaskStatus,
  TaskPriority,
  canTransition,
  type Task,
} from '../../types/task';
import { UserRole } from '../../types/user';

// Priority badge colors
const priorityColors: Record<string, string> = {
  Low: 'bg-green-100 text-green-700',
  Medium: 'bg-yellow-100 text-yellow-700',
  High: 'bg-red-100 text-red-700',
};

function TaskBoard() {
  const { id: projectId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  // Show toast when real-time events arrive
  const handleSocketEvent = useCallback((message: string) => {
    showToast(message);
  }, [showToast]);

  // Connect to socket and listen for real-time updates
  useSocket(projectId!, handleSocketEvent);

  // filters
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');

  // modals
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<Task | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [auditTarget, setAuditTarget] = useState<Task | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  // wait until the user stops typing before searching
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // auto-hide the success message
  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(''), 3000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  // fetch the project to get owner/members (for the assignee dropdown)
  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => getProjectApi(projectId!),
    enabled: Boolean(projectId),
  });

  // fetch all tasks for this project
  const {
    data: taskData,
    isLoading: tasksLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['tasks', projectId, search, priorityFilter, assigneeFilter],
    queryFn: () =>
      listTasksApi(projectId!, {
        limit: 100,
        search: search || undefined,
        priority: priorityFilter || undefined,
        assignee: assigneeFilter || undefined,
      }),
    enabled: Boolean(projectId),
  });

  const deleteMutation = useMutation({
    mutationFn: (taskId: string) => deleteTaskApi(projectId!, taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      setSuccessMessage('Task deleted');
      setDeleteTarget(null);
    },
    onError: (err) => {
      setDeleteTarget(null);
      alert(getErrorMessage(err));
    },
  });

  const moveTaskMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: TaskStatus }) =>
      updateTaskApi(projectId!, taskId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    },
  });

  // group tasks by status for the three columns
  const tasks = taskData?.data ?? [];
  const columns = [
    { status: TaskStatus.TODO, label: 'To Do', tasks: [] as Task[] },
    { status: TaskStatus.IN_PROGRESS, label: 'In Progress', tasks: [] as Task[] },
    { status: TaskStatus.DONE, label: 'Done', tasks: [] as Task[] },
  ];
  tasks.forEach((task) => {
    const col = columns.find((c) => c.status === task.status);
    if (col) col.tasks.push(task);
  });

  // who can be assigned: project owner + members
  const assignees = project
    ? [project.owner, ...project.members].filter(
        (u, i, arr) => arr.findIndex((x) => x._id === u._id) === i
      )
    : [];

  // only the task creator, project owner, or Admin can delete
  const canDelete = (task: Task) =>
    user?.role === UserRole.ADMIN ||
    project?.owner._id === user?._id ||
    task.creator._id === user?._id;

  if (projectLoading) {
    return <p className="text-center text-sm text-slate-500">Loading project...</p>;
  }

  if (!project) {
    return (
      <p className="rounded-lg bg-red-50 p-4 text-center text-sm text-red-600">
        Project not found.
      </p>
    );
  }

  return (
    <div>
      {/* header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link to="/" className="text-sm text-indigo-600 hover:underline">
            ← Back to projects
          </Link>
          <h2 className="mt-1 text-xl font-semibold text-slate-800">
            {project.name}
          </h2>
          {project.description && (
            <p className="text-sm text-slate-500">{project.description}</p>
          )}
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + New task
        </button>
      </div>

      {successMessage && (
        <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
          {successMessage}
        </p>
      )}

      {/* member list (Admin can manage) */}
      <div className="mt-6">
        <MemberList project={project} />
      </div>

      {/* filters */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search tasks..."
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 sm:max-w-xs"
        />
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500"
        >
          <option value="">All priorities</option>
          {Object.values(TaskPriority).map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <select
          value={assigneeFilter}
          onChange={(e) => setAssigneeFilter(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500"
        >
          <option value="">All assignees</option>
          {assignees.map((u) => (
            <option key={u._id} value={u._id}>
              {u.name}
            </option>
          ))}
        </select>
      </div>

      {/* loading / error / empty */}
      {tasksLoading && (
        <p className="mt-8 text-center text-sm text-slate-500">Loading tasks...</p>
      )}
      {isError && (
        <p className="mt-8 rounded-lg bg-red-50 p-4 text-center text-sm text-red-600">
          {getErrorMessage(error)}
        </p>
      )}
      {!tasksLoading && !isError && tasks.length === 0 && (
        <div className="mt-8 rounded-xl bg-white p-10 text-center shadow-sm">
          <p className="text-slate-600">No tasks yet.</p>
          <button
            onClick={() => setShowCreate(true)}
            className="mt-3 text-sm font-medium text-indigo-600 hover:underline"
          >
            Create your first task
          </button>
        </div>
      )}

      {/* three-column board */}
      {!tasksLoading && !isError && tasks.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          {columns.map((col) => (
            <div key={col.status} className="rounded-xl bg-slate-50 p-4">
              <h3 className="mb-3 text-sm font-semibold text-slate-700">
                {col.label} ({col.tasks.length})
              </h3>
              <div className="space-y-3">
                {col.tasks.map((task) => (
                  <div
                    key={task._id}
                    className="rounded-lg bg-white p-3 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-medium text-slate-800">
                        {task.title}
                      </h4>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${priorityColors[task.priority]}`}
                      >
                        {task.priority}
                      </span>
                    </div>
                    {task.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                        {task.description}
                      </p>
                    )}
                    <div className="mt-2 text-xs text-slate-500">
                      {task.assignee && <p>Assignee: {task.assignee.name}</p>}
                      {task.dueDate && (
                        <p>Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                      )}
                    </div>

                    {/* status move buttons (respect the state machine) */}
                    <div className="mt-3 flex flex-wrap gap-1 border-t border-slate-100 pt-2">
                      {Object.values(TaskStatus)
                        .filter((s) => canTransition(task.status, s))
                        .map((nextStatus) => (
                          <button
                            key={nextStatus}
                            onClick={() =>
                              moveTaskMutation.mutate({
                                taskId: task._id,
                                status: nextStatus,
                              })
                            }
                            disabled={moveTaskMutation.isPending}
                            className="rounded bg-indigo-50 px-2 py-1 text-xs text-indigo-700 hover:bg-indigo-100 disabled:opacity-50"
                          >
                            → {nextStatus}
                          </button>
                        ))}
                      <button
                        onClick={() => setEditTarget(task)}
                        className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setAuditTarget(task)}
                        className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                      >
                        Activity
                      </button>
                      {canDelete(task) && (
                        <button
                          onClick={() => setDeleteTarget(task)}
                          className="rounded border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* modals */}
      {showCreate && (
        <TaskFormModal
          projectId={projectId!}
          assignees={assignees}
          onClose={() => setShowCreate(false)}
          onSuccess={setSuccessMessage}
        />
      )}
      {editTarget && (
        <TaskFormModal
          projectId={projectId!}
          task={editTarget}
          assignees={assignees}
          onClose={() => setEditTarget(null)}
          onSuccess={setSuccessMessage}
        />
      )}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete task"
          message={`Delete "${deleteTarget.title}"? This cannot be undone.`}
          isLoading={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutate(deleteTarget._id)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
      {auditTarget && (
        <AuditLogModal
          projectId={projectId!}
          task={auditTarget}
          onClose={() => setAuditTarget(null)}
        />
      )}
    </div>
  );
}

export default TaskBoard;
