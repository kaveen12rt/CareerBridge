import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function FeedbackPage() {
  const navigate = useNavigate();

  const [feedbackList, setFeedbackList] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    rating: 5,
    message: "",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pageError, setPageError] = useState("");
  const [success, setSuccess] = useState("");

  const loadFeedback = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/feedback");
      const data = await res.json();

      if (!res.ok) {
        setPageError(data.message || "Failed to load feedback.");
        return;
      }

      setFeedbackList(data?.data?.feedback || []);
    } catch {
      setPageError("Server error while loading feedback.");
    }
  };

  const loadCurrentUser = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/check-auth", {
        credentials: "include",
      });

      if (!res.ok) {
        setCurrentUser(null);
        return;
      }

      const data = await res.json();
      const user = data?.data?.user || null;
      setCurrentUser(user);

      if (user) {
        const myRes = await fetch("http://localhost:5000/api/feedback/mine", {
          credentials: "include",
        });

        if (myRes.ok) {
          const myData = await myRes.json();
          const myFeedback = myData?.data?.feedback;

          if (myFeedback) {
            setEditingId(myFeedback._id);
            setFormData({
              rating: myFeedback.rating,
              message: myFeedback.message,
            });
          }
        }
      }
    } catch {
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setPageError("");
      await Promise.all([loadFeedback(), loadCurrentUser()]);
      setLoading(false);
    };

    init();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSuccess("");
    setPageError("");
    setFormData((prev) => ({
      ...prev,
      [name]: name === "rating" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      navigate("/signin");
      return;
    }

    if (!formData.message.trim()) {
      setPageError("Feedback message is required.");
      return;
    }

    try {
      setSubmitting(true);
      setPageError("");
      setSuccess("");

      const url = editingId
        ? `http://localhost:5000/api/feedback/${editingId}`
        : "http://localhost:5000/api/feedback";

      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          rating: formData.rating,
          message: formData.message,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPageError(data.message || "Failed to save feedback.");
        return;
      }

      setSuccess(editingId ? "Feedback updated successfully." : "Feedback submitted successfully.");

      if (data?.data?.feedback?._id) {
        setEditingId(data.data.feedback._id);
      }

      await loadFeedback();
    } catch {
      setPageError("Server error while saving feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (feedback) => {
    setEditingId(feedback._id);
    setFormData({
      rating: feedback.rating,
      message: feedback.message,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (feedbackId) => {
    const confirmed = window.confirm("Are you sure you want to delete your feedback?");
    if (!confirmed) return;

    try {
      setPageError("");
      setSuccess("");

      const res = await fetch(`http://localhost:5000/api/feedback/${feedbackId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        setPageError(data.message || "Failed to delete feedback.");
        return;
      }

      setSuccess("Feedback deleted successfully.");
      setEditingId(null);
      setFormData({
        rating: 5,
        message: "",
      });

      await loadFeedback();
    } catch {
      setPageError("Server error while deleting feedback.");
    }
  };

  const isOwnFeedback = (feedback) => {
    return currentUser && feedback?.user?._id === currentUser.id;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-gray-600 text-lg">Loading feedback...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-4 py-10">
      <div className="max-w-7xl mx-auto relative">
        <div className="pointer-events-none absolute -top-24 -right-16 h-64 w-64 rounded-full bg-blue-300/30 blur-3xl" />
        <div className="pointer-events-none absolute top-40 -left-20 h-72 w-72 rounded-full bg-indigo-300/25 blur-3xl" />

        <div className="relative bg-white/80 backdrop-blur rounded-3xl shadow-xl p-8 mb-8 border border-white/60">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
            Community Voices
          </div>
          <h1 className="text-4xl font-bold text-indigo-700 mt-3 mb-3">
            Feedback
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl">
            All users can view feedback here. You can only edit or delete your own feedback.
          </p>
        </div>

        {pageError && (
          <div className="mb-6 rounded-lg bg-red-100 text-red-700 px-4 py-3 text-sm">
            {pageError}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-lg bg-green-100 text-green-700 px-4 py-3 text-sm">
            {success}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white/90 backdrop-blur rounded-2xl shadow-lg p-8 sticky top-6 border border-white/70">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">
                {editingId ? "Edit Your Feedback" : "Write Feedback"}
              </h2>

              {!currentUser ? (
                <div>
                  <p className="text-gray-600 mb-4">
                    Sign in to submit, edit, or delete your feedback.
                  </p>
                  <Link
                    to="/signin"
                    className="inline-block bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-5 py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-blue-700 transition shadow-md shadow-indigo-200"
                  >
                    Sign In
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Rating
                    </label>
                    <select
                      name="rating"
                      value={formData.rating}
                      onChange={handleChange}
                      className="w-full border border-slate-200 rounded-lg px-4 py-3 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 bg-white/90"
                    >
                      <option value={5}>5 - Excellent</option>
                      <option value={4}>4 - Very Good</option>
                      <option value={3}>3 - Good</option>
                      <option value={2}>2 - Fair</option>
                      <option value={1}>1 - Poor</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Message
                    </label>
                    <textarea
                      name="message"
                      rows="6"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Write your feedback here..."
                      className="w-full border border-slate-200 rounded-lg px-4 py-3 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 bg-white/90"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-blue-700 transition disabled:opacity-60 shadow-lg shadow-indigo-200/60"
                    >
                      {submitting
                        ? "Saving..."
                        : editingId
                        ? "Update Feedback"
                        : "Submit Feedback"}
                    </button>

                    {editingId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(null);
                          setFormData({ rating: 5, message: "" });
                        }}
                        className="px-4 py-3 bg-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-300 transition"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {feedbackList.length === 0 ? (
              <div className="bg-white/90 backdrop-blur rounded-2xl shadow-lg p-8 text-gray-600 border border-white/70">
                No feedback available yet.
              </div>
            ) : (
              feedbackList.map((feedback) => (
                <div
                  key={feedback._id}
                  className="bg-white/90 backdrop-blur rounded-2xl shadow-lg p-8 border border-white/70"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-800">
                        {feedback.user?.firstName} {feedback.user?.lastName}
                      </h3>
                      <p className="text-gray-500">{feedback.user?.email}</p>
                      <p className="text-sm text-indigo-600 font-medium mt-1 capitalize">
                        {feedback.user?.role}
                      </p>
                    </div>

                    <div className="flex flex-col items-start md:items-end gap-3">
                      <span className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm font-semibold">
                        {"★".repeat(feedback.rating)}{"☆".repeat(5 - feedback.rating)}
                      </span>

                      {isOwnFeedback(feedback) && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(feedback)}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(feedback._id)}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                    <p className="text-gray-700 leading-8">{feedback.message}</p>
                  </div>

                  <p className="text-xs text-gray-400 mt-4">
                    {new Date(feedback.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-10">
          <Link
            to="/"
            className="inline-block bg-gray-800 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-900 transition"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default FeedbackPage;