import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-md">
        <h1 className="text-5xl font-bold text-slate-800">404</h1>
        <p className="mt-2 text-lg text-slate-600">Page not found</p>
        <p className="mt-1 text-sm text-slate-500">
          The page you are looking for does not exist.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;
