import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const SavedCVs = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const loadSavedCVs = async () => {
      try {
        const authRes = await fetch("http://localhost:5000/api/auth/check-auth", {
          credentials: "include",
        });
        const authData = await authRes.json();
        const userId = authData?.data?.user?.id;

        if (!authRes.ok || !userId) {
          throw new Error("Please sign in to view saved CVs.");
        }

        const res = await fetch(`http://localhost:5000/api/job-match/cv/${userId}`, {
          credentials: "include",
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.message || "Failed to load saved CVs.");
        }

        if (isMounted) {
          setTemplates(Array.isArray(data?.templates) ? data.templates : []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Failed to load saved CVs.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadSavedCVs();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Saved CVs</h1>
            <p className="text-gray-600">Review the CVs you have saved earlier.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/cv-generator")}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Create New CV
          </button>
        </div>

        {loading ? <p className="text-gray-500">Loading saved CVs...</p> : null}
        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="text-sm">{error}</p>
            <div className="mt-3">
              <Link to="/signin" className="text-sm font-semibold text-red-700 hover:underline">
                Go to Sign In
              </Link>
            </div>
          </div>
        ) : null}

        {!loading && !error && templates.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <p className="text-gray-600">No saved CVs yet. Create your first CV now.</p>
            <button
              type="button"
              onClick={() => navigate("/cv-generator")}
              className="mt-4 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Go to CV Generator
            </button>
          </div>
        ) : null}

        {!loading && !error && templates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template) => (
              <button
                key={template._id}
                type="button"
                onClick={() => navigate(`/cv-generator?templateId=${template._id}`)}
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm text-left hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{template.name}</h2>
                    <p className="text-sm text-gray-500">
                      Saved: {template.updatedAt ? new Date(template.updatedAt).toLocaleDateString() : "-"}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-3 whitespace-pre-wrap">
                  {template.summary || "No summary provided."}
                </p>
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default SavedCVs;
