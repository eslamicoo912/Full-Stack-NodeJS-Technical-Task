import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { API_URL } from '../api/client';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(API_URL);
  }
  return socket;
};

// Listen for real-time task updates in a project
export function useSocket(projectId: string, onEvent?: (message: string) => void) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = getSocket();

    // Join this project's room
    socket.emit('join-project', projectId);

    // Invalidate queries and show toast when task events arrive
    const handleCreated = () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      onEvent?.('A new task was created');
    };

    const handleUpdated = () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      onEvent?.('A task was updated');
    };

    const handleDeleted = () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      onEvent?.('A task was deleted');
    };

    socket.on('task:created', handleCreated);
    socket.on('task:updated', handleUpdated);
    socket.on('task:deleted', handleDeleted);

    // Cleanup
    return () => {
      socket.emit('leave-project', projectId);
      socket.off('task:created', handleCreated);
      socket.off('task:updated', handleUpdated);
      socket.off('task:deleted', handleDeleted);
    };
  }, [projectId, queryClient, onEvent]);
}
