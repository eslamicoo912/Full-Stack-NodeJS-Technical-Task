import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listUsersApi } from '../../api/user.api';
import { addMemberApi, removeMemberApi } from '../../api/member.api';
import { getErrorMessage } from '../../api/client';
import { useAuth } from '../auth/auth-context';
import { UserRole } from '../../types/user';
import type { Project } from '../../types/project';
import type { User } from '../../types/user';

// Shows the project owner + members, with add/remove controls for Admins
function MemberList({ project }: { project: Project }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === UserRole.ADMIN;

  const [search, setSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [error, setError] = useState('');

  // fetch users for the dropdown (Admin only)
  const { data: usersData } = useQuery({
    queryKey: ['users', search],
    queryFn: () => listUsersApi({ search: search || undefined, limit: 20 }),
    enabled: isAdmin,
  });

  const addMutation = useMutation({
    mutationFn: (userId: string) => addMemberApi(project._id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', project._id] });
      setSelectedUserId('');
      setSearch('');
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const removeMutation = useMutation({
    mutationFn: (userId: string) => removeMemberApi(project._id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', project._id] });
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  // filter out users who are already members or the owner
  const availableUsers = (usersData?.data ?? []).filter(
    (u: User) =>
      u._id !== project.owner._id &&
      !project.members.some((m) => m._id === u._id)
  );

  const handleAdd = () => {
    if (!selectedUserId) return;
    setError('');
    addMutation.mutate(selectedUserId);
  };

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-700">Members</h3>

      {/* owner */}
      <div className="mt-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-800">
            {project.owner.name}
          </p>
          <p className="text-xs text-slate-500">{project.owner.email}</p>
        </div>
        <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
          Owner
        </span>
      </div>

      {/* members list */}
      {project.members.length > 0 && (
        <div className="mt-4 space-y-2">
          {project.members.map((member) => (
            <div key={member._id} className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-800">{member.name}</p>
                <p className="text-xs text-slate-500">{member.email}</p>
              </div>
              {isAdmin && (
                <button
                  onClick={() => {
                    if (confirm(`Remove ${member.name} from this project?`)) {
                      removeMutation.mutate(member._id);
                    }
                  }}
                  disabled={removeMutation.isPending}
                  className="rounded border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* add member (Admin only) */}
      {isAdmin && (
        <div className="mt-4 border-t border-slate-100 pt-4">
          <p className="mb-2 text-xs font-medium text-slate-600">Add member</p>
          {error && (
            <p className="mb-2 rounded bg-red-50 p-2 text-xs text-red-600">
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className="flex-1 rounded border border-slate-300 px-2 py-1 text-xs outline-none focus:border-indigo-500"
            />
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="flex-1 rounded border border-slate-300 bg-white px-2 py-1 text-xs outline-none focus:border-indigo-500"
            >
              <option value="">Select user</option>
              {availableUsers.map((u: User) => (
                <option key={u._id} value={u._id}>
                  {u.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleAdd}
              disabled={!selectedUserId || addMutation.isPending}
              className="rounded bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {addMutation.isPending ? 'Adding...' : 'Add'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MemberList;
