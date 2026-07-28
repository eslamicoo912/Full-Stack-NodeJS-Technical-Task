import { useQuery } from '@tanstack/react-query';
import Modal from '../../components/Modal';
import { getAuditLogsApi } from '../../api/user.api';
import { getErrorMessage } from '../../api/client';
import type { Task } from '../../types/task';

// Shows the status-change history for a task
function AuditLogModal({
  projectId,
  task,
  onClose,
}: {
  projectId: string;
  task: Task;
  onClose: () => void;
}) {
  const { data: logs, isLoading, isError, error } = useQuery({
    queryKey: ['audit-logs', projectId, task._id],
    queryFn: () => getAuditLogsApi(projectId, task._id),
  });

  return (
    <Modal title={`Activity: ${task.title}`} onClose={onClose}>
      {isLoading && (
        <p className="text-center text-sm text-slate-500">Loading...</p>
      )}
      {isError && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {getErrorMessage(error)}
        </p>
      )}
      {!isLoading && !isError && logs && logs.length === 0 && (
        <p className="text-center text-sm text-slate-500">No activity yet.</p>
      )}
      {!isLoading && !isError && logs && logs.length > 0 && (
        <div className="space-y-3">
          {logs.map((log) => (
            <div key={log._id} className="flex items-start gap-3">
              <div className="mt-1 h-2 w-2 rounded-full bg-indigo-500" />
              <div className="flex-1">
                <p className="text-sm text-slate-800">
                  {log.fromStatus ? (
                    <>
                      Status changed from{' '}
                      <span className="font-medium">{log.fromStatus}</span> to{' '}
                      <span className="font-medium">{log.toStatus}</span>
                    </>
                  ) : (
                    <>
                      Created with status{' '}
                      <span className="font-medium">{log.toStatus}</span>
                    </>
                  )}
                </p>
                <p className="text-xs text-slate-500">
                  by {log.changedBy.name} &middot;{' '}
                  {new Date(log.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

export default AuditLogModal;
