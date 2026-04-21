import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function ContactUsPage() {
  const [currentUser, setCurrentUser] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/check-auth", {
          credentials: "include",
        });

        if (!res.ok) return;

        const data = await res.json();
        const user = data?.data?.user;

        if (user) {
          setCurrentUser(user);
          setFormData((prev) => ({
            ...prev,
            name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
            email: user.email || "",
          }));
        }
      } catch {}
    };

    checkAuth();
  }, []);

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!formData.subject.trim()) newErrors.subject = "Subject is required.";
    if (!formData.message.trim()) newErrors.message = "Message is required.";
    if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters.";
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setSuccess("");
    setPageError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);
    setSuccess("");
    setPageError("");

    if (Object.keys(validationErrors).length > 0) return;

    try {
      setSubmitting(true);

      const res = await fetch("http://localhost:5000/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          subject: formData.subject.trim(),
          message: formData.message.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPageError(data.message || "Failed to send message.");
        return;
      }

      setSuccess("Your message has been sent successfully.");
      setFormData((prev) => ({
        ...prev,
        subject: "",
        message: "",
      }));
    } catch {
      setPageError("Server error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-indigo-100 px-4 py-10">
      <div className="max-w-7xl mx-auto relative">
        <div className="pointer-events-none absolute -top-24 -right-16 h-64 w-64 rounded-full bg-blue-300/30 blur-3xl" />
        <div className="pointer-events-none absolute top-40 -left-20 h-72 w-72 rounded-full bg-indigo-300/25 blur-3xl" />

        <div className="relative bg-white/80 backdrop-blur rounded-3xl shadow-xl p-8 mb-8 border border-white/60">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
            Support Desk
          </div>
          <h1 className="text-4xl font-bold text-indigo-700 mt-3 mb-3">
            Contact Us
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl">
            Send us your questions, issues, or suggestions. We’ll get back to you as soon as possible.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white/90 backdrop-blur rounded-2xl shadow-lg p-8 border border-white/70">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                Send a Message
              </h2>

              {success && (
                <div className="mb-4 rounded-lg bg-emerald-50 text-emerald-700 px-4 py-3 text-sm border border-emerald-100">
                  {success}
                </div>
              )}

              {pageError && (
                <div className="mb-4 rounded-lg bg-rose-50 text-rose-700 px-4 py-3 text-sm border border-rose-100">
                  {pageError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 bg-white/90"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 bg-white/90"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 bg-white/90"
                  />
                  {errors.subject && (
                    <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Message
                  </label>
                  <textarea
                    name="message"
                    rows="7"
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 bg-white/90"
                    placeholder="Write your message here..."
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-600">{errors.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-blue-700 transition disabled:opacity-60 shadow-lg shadow-indigo-200/60 hover:-translate-y-0.5"
                >
                  {submitting ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white/90 backdrop-blur rounded-2xl shadow-lg p-8 border border-white/70">
              <h2 className="text-2xl font-bold text-slate-900 mb-5">
                Contact Information
              </h2>

              <div className="space-y-4 text-slate-700">
                <div className="bg-indigo-50/60 rounded-xl p-4 border border-indigo-100">
                  <p className="text-sm text-slate-500 mb-1">Email</p>
                  <p className="font-semibold">careerbridge026@gmail.com</p>
                </div>

                <div className="bg-indigo-50/60 rounded-xl p-4 border border-indigo-100">
                  <p className="text-sm text-slate-500 mb-1">Phone</p>
                  <p className="font-semibold">+94 11 234 5678</p>
                </div>

                <div className="bg-indigo-50/60 rounded-xl p-4 border border-indigo-100">
                  <p className="text-sm text-slate-500 mb-1">Office Hours</p>
                  <p className="font-semibold">Mon - Fri, 9:00 AM - 5:00 PM</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-sky-500 rounded-2xl shadow-lg p-8 text-white relative overflow-hidden">
              <div className="absolute -top-10 -right-10 h-24 w-24 rounded-full bg-white/15 blur-xl" />
              <div className="absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-white/10 blur-xl" />
              <h2 className="text-2xl font-bold mb-4">Need Quick Help?</h2>
              <p className="text-blue-100 leading-7">
                You can also use the chatbot on the website for quick guidance about jobs, profile, internships, feedback, and account features.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <Link
            to="/"
            className="inline-block bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-950 transition"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ContactUsPage;