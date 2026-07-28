import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { API_URL } from './api/client'

// Phase 0 placeholder: proves the frontend can reach the backend.
// Replaced by the real router + pages in Phase 1.
function App() {
  const { data, isPending, isError } = useQuery({
    queryKey: ['health-check'],
    queryFn: async () => {
      const res = await axios.get<{ status: string; message: string }>(
        `${API_URL}/health-check`
      )
      return res.data
    },
  })

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-md">
        <h1 className="text-2xl font-bold text-slate-800">Team Task Board</h1>
        <p className="mt-2 text-sm text-slate-500">
          Phase 0 foundation — auth, projects, and the task board arrive in the
          next phases.
        </p>

        <div className="mt-6 flex items-center gap-2 rounded-lg border border-slate-200 p-4">
          <span
            className={`h-3 w-3 rounded-full ${
              isPending
                ? 'animate-pulse bg-amber-400'
                : isError
                  ? 'bg-red-500'
                  : 'bg-green-500'
            }`}
          />
          <span className="text-sm text-slate-700">
            {isPending
              ? 'Checking API connection...'
              : isError
                ? 'API unreachable — is the backend running?'
                : `API connected: ${data.message}`}
          </span>
        </div>
      </div>
    </div>
  )
}

export default App
