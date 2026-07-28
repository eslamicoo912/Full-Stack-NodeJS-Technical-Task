import { useParams } from 'react-router-dom';

function ProjectDetailPage() {
  const { id } = useParams();

  return (
    <div className="rounded-xl bg-white p-8 text-center shadow-sm">
      <h2 className="text-xl font-semibold text-slate-800">Project detail</h2>
      <p className="mt-2 text-sm text-slate-500">
        The task board for project <code className="font-mono">{id}</code> will be
        built in Phase 3.
      </p>
    </div>
  );
}

export default ProjectDetailPage;