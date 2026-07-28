import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listProjectsApi, deleteProjectApi } from '../api/project.api';
import { getErrorMessage } from '../api/client';
import { useAuth } from '../features/auth/auth-context';
import ProjectFormModal from '../features/projects/ProjectFormModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { UserRole } from '../types/user';
import type { Project } from '../types/project';

function ProjectsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // list controls
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('-createdAt');

  // which modal is open
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<Project | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

  // short success message after create/edit/delete
  const [successMessage, setSuccessMessage] = useState('');

  // wait until the user stops typing before searching
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // auto-hide the success message
  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(''), 3000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['projects', page, search, sort],
    queryFn: () =>
      listProjectsApi({ page, search: search || undefined, sort }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProjectApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setSuccessMessage('Project deleted');
      setDeleteTarget(null);
    },
    onError: (err) => {
      setSuccessMessage('');
      setDeleteTarget(null);
      alert(getErrorMessage(err));
    },
  });

  // only the owner or an Admin can edit/delete a project
  const canModify = (project: Project) =>
    user?.role === UserRole.ADMIN || project.owner._id === user?._id;

  const projects = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div>
      {/* header row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-slate-800">Projects</h2>
        <button
          onClick={() => setShowCreate(true)}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + New project
        </button>
      </div>

      {successMessage && (
        <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
          {successMessage}
        </p>
      )}

      {/* search + sort controls */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search projects..."
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 sm:max-w-xs"
        />
        <select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500"
        >
          <option value="-createdAt">Newest first</option>
          <option value="createdAt">Oldest first</option>
          <option value="name">Name A-Z</option>
          <option value="-name">Name Z-A</option>
        </select>
      </div>

      {/* loading state */}
      {isPending && (
        <p className="mt-8 text-center text-sm text-slate-500">
          Loading projects...
        </p>
      )}

      {/* error state */}
      {isError && (
        <p className="mt-8 rounded-lg bg-red-50 p-4 text-center text-sm text-red-600">
          {getErrorMessage(error)}
        </p>
      )}

      {/* empty state */}
      {!isPending && !isError && projects.length === 0 && (
        <div className="mt-8 rounded-xl bg-white p-10 text-center shadow-sm">
          <p className="text-slate-600">
            {search ? 'No projects match your search.' : 'No projects yet.'}
          </p>
          {!search && (
            <button
              onClick={() => setShowCreate(true)}
              className="mt-3 text-sm font-medium text-indigo-600 hover:underline"
            >
              Create your first project
            </button>
          )}
        </div>
      )}

      {/* project cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <div
            key={project._id}
            className="flex flex-col rounded-xl bg-white p-5 shadow-sm"
          >
            <Link
              to={`/projects/${project._id}`}
              className="text-base font-semibold text-slate-800 hover:text-indigo-600"
            >
              {project.name}
            </Link>
            <p className="mt-1 line-clamp-2 flex-1 text-sm text-slate-500">
              {project.description || 'No description'}
            </p>

            <div className="mt-4 text-xs text-slate-500">
              <p>Owner: {project.owner.name}</p>
              <p className="mt-0.5">
                {project.members.length} member
                {project.members.length === 1 ? '' : 's'} &middot; Created{' '}
                {new Date(project.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="mt-4 flex gap-2 border-t border-slate-100 pt-3">
              <Link
                to={`/projects/${project._id}`}
                className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100"
              >
                Open board
              </Link>
              {canModify(project) && (
                <>
                  <button
                    onClick={() => setEditTarget(project)}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteTarget(project)}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-slate-600">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= pagination.totalPages}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* modals */}
      {showCreate && (
        <ProjectFormModal
          onClose={() => setShowCreate(false)}
          onSuccess={setSuccessMessage}
        />
      )}
      {editTarget && (
        <ProjectFormModal
          project={editTarget}
          onClose={() => setEditTarget(null)}
          onSuccess={setSuccessMessage}
        />
      )}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete project"
          message={`Delete "${deleteTarget.name}"? All of its tasks will be removed too.`}
          isLoading={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutate(deleteTarget._id)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

export default ProjectsPage;
