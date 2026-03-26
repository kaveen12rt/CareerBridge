import { useState, useEffect } from "react";

// ============================================================
//     AUTHENTICATION INTEGRATION GUIDE (For Member 1)
// ============================================================
// When authentication is ready, follow these steps:
//
// STEP 1 — Import auth context or hook at the top:
//   import { useAuth } from "../../context/AuthContext";
//   OR
//   import { useAuth } from "../../hooks/useAuth";
//
// STEP 2 — Replace the localStorage student state with:
//   const { currentUser } = useAuth();
//   // currentUser should have: { _id, name, email, studentNumber }
//
// STEP 3 — Replace this line:
//   const [selectedStudent, setSelectedStudent] = useState(...)
//   WITH:
//   const selectedStudent = currentUser;
//
// STEP 4 — DELETE the entire "Who are you?" section block
//   (marked clearly below with ⬇ DELETE START and ⬆ DELETE END)
//
// STEP 5 — DELETE the students state and its useEffect fetch:
//   const [students, setStudents] = useState([]);
//   fetch("http://localhost:5000/api/students")...
//
// STEP 6 — DELETE the localStorage lines:
//   localStorage.setItem("cbStudent", ...)
//   JSON.parse(localStorage.getItem("cbStudent") || "null")
//
// After those changes, the page will automatically show the
// logged-in student's name and their applications only.
// ============================================================

export default function ApplicationPage() {
    const [jobs, setJobs] = useState([]);

    // ── TEMPORARY: Remove these 2 lines after authentication is added ──
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(
        () => JSON.parse(localStorage.getItem("cbStudent") || "null")
    );
    // ──────────────────────────────────────────────────────────────────
    //    AFTER AUTH: Replace above 3 lines with:
    //   const { currentUser } = useAuth();
    //   const selectedStudent = currentUser;
    // ──────────────────────────────────────────────────────────────────

    const [selectedJobId, setSelectedJobId] = useState("");
    const [applications, setApplications] = useState([]);
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetch("http://localhost:5000/api/jobs")
            .then(r => r.json()).then(setJobs).catch(() => { });

        // ── TEMPORARY: Remove this fetch after authentication is added ──
        fetch("http://localhost:5000/api/students")
            .then(r => r.json()).then(setStudents).catch(() => { });
        // ────────────────────────────────────────────────────────────────
    }, []);

    useEffect(() => {
        if (selectedStudent) {
            //  TEMPORARY: Remove localStorage line after authentication 
            localStorage.setItem("cbStudent", JSON.stringify(selectedStudent));
            // ──────────────────────────────────────────────────────────────
            fetchApplications(selectedStudent._id);
        }
    }, [selectedStudent]);

    const fetchApplications = async (studentId) => {
        try {
            const res = await fetch(`http://localhost:5000/api/applications/student/${studentId}`);
            const data = await res.json();
            setApplications(data);
        } catch { }
    };

    const applyJob = async () => {
        if (!selectedStudent) return setMessage("❌ Please select a student first");
        if (!selectedJobId) return setMessage("❌ Please select a job");
        try {
            const res = await fetch("http://localhost:5000/api/applications/apply", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ studentId: selectedStudent._id, jobId: selectedJobId })
            });
            const data = await res.json();
            if (res.ok) {
                setMessage("✅ Applied successfully!");
                fetchApplications(selectedStudent._id);
            } else {
                setMessage(`❌ ${data.message || data.error || "Something went wrong"}`);
            }
        } catch (err) {
            setMessage(`❌ Error connecting to server: ${err.message}`);
        }
    };

    const withdrawApplication = async (id) => {
        try {
            const res = await fetch(`http://localhost:5000/api/applications/${id}/withdraw`, {
                method: "PATCH"
            });
            const data = await res.json();
            if (res.ok) {
                setMessage("✅ Application withdrawn");
                fetchApplications(selectedStudent._id);
            } else {
                setMessage(`❌ ${data.message || data.error || "Something went wrong"}`);
            }
        } catch (err) {
            setMessage(`❌ Error connecting to server: ${err.message}`);
        }
    };

    const statusColor = (status) => {
        const map = {
            Applied: "bg-blue-100 text-blue-700",
            InterviewBooked: "bg-green-100 text-green-700",
            Withdrawn: "bg-yellow-100 text-yellow-700",
            Cancelled: "bg-red-100 text-red-700",
            Completed: "bg-purple-100 text-purple-700"
        };
        return map[status] || "bg-gray-100 text-gray-700";
    };

    const getJobTitle = (jobId) => {
        const job = jobs.find(j => j._id === jobId);
        return job ? `${job.title}${job.company ? ` — ${job.company}` : ""}` : jobId;
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <h1 className="text-3xl font-bold text-pink-600 mb-1">Application Management</h1>
            <p className="text-gray-400 text-sm mb-6">Apply for jobs, track status, withdraw applications</p>

            {message && (
                <div className="mb-4 p-3 rounded-lg bg-white shadow text-sm font-medium border-l-4 border-pink-400">
                    {message}
                </div>
            )}

            {/* ⬇ DELETE START — Remove this entire block after authentication is added */}
            <div className="bg-white rounded-xl shadow p-5 mb-5">
                <h2 className="text-base font-bold text-gray-700 mb-3"> Who are you?</h2>
                {students.length === 0 ? (
                    <p className="text-yellow-600 text-sm">
                        ⚠️ No students found in database. Add one via Postman: POST /api/students
                    </p>
                ) : (
                    <select
                        className="border rounded-lg px-4 py-2 text-sm w-full"
                        value={selectedStudent?._id || ""}
                        onChange={(e) => {
                            const s = students.find(s => s._id === e.target.value);
                            setSelectedStudent(s || null);
                        }}
                    >
                        <option value="">-- Select your name --</option>
                        {students.map(s => (
                            <option key={s._id} value={s._id}>
                                {s.name} {s.studentNumber ? `(${s.studentNumber})` : ""}
                            </option>
                        ))}
                    </select>
                )}
                {selectedStudent && (
                    <p className="mt-2 text-green-600 text-sm font-medium">
                        Logged in as: <strong>{selectedStudent.name}</strong>
                    </p>
                )}
            </div>
            {/* ⬆ DELETE END */}

            {/*  AFTER AUTH: This logged-in bar will auto-show from currentUser */}
            {selectedStudent && (
                <div className="bg-white rounded-xl shadow px-5 py-3 mb-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold text-sm">
                            {selectedStudent.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="font-semibold text-gray-700 text-sm">{selectedStudent.name}</p>
                            {selectedStudent.studentNumber && (
                                <p className="text-xs text-gray-400">{selectedStudent.studentNumber}</p>
                            )}
                        </div>
                    </div>
                    <span className="text-xs font-semibold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                        ● Active Session
                    </span>
                </div>
            )}

            {/* Apply for a Job */}
            <div className="bg-white rounded-xl shadow p-5 mb-5">
                <h2 className="text-base font-bold text-gray-700 mb-3">💼 Apply for a Job</h2>
                {!selectedStudent ? (
                    <p className="text-yellow-600 text-sm">⚠️ Please select your profile above to apply.</p>
                ) : (
                    <>
                        <select
                            className="border rounded-lg px-4 py-2 text-sm w-full mb-3"
                            value={selectedJobId}
                            onChange={(e) => setSelectedJobId(e.target.value)}
                        >
                            <option value="">-- Select a Job --</option>
                            {jobs.map(j => (
                                <option key={j._id} value={j._id}>
                                    {j.title} {j.company ? `— ${j.company}` : ""}
                                </option>
                            ))}
                        </select>
                        {jobs.length === 0 && (
                            <p className="text-yellow-600 text-sm mb-3">
                                ⚠️ No jobs available. Ask Member 2 to post jobs.
                            </p>
                        )}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={applyJob}
                                className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 font-medium text-sm"
                            >
                                Apply Now
                            </button>
                            <p className="text-xs text-gray-400">Max 2 active applications allowed at a time</p>
                        </div>
                    </>
                )}
            </div>

            {/* My Applications */}
            <div className="bg-white rounded-xl shadow p-5">
                <h2 className="text-base font-bold text-gray-700 mb-4">
                    📋 My Applications
                </h2>
                {!selectedStudent ? (
                    <p className="text-gray-400 text-sm">Select your profile to view applications.</p>
                ) : applications.length === 0 ? (
                    <p className="text-gray-400 text-sm">No applications yet. Apply for a job above.</p>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-gray-400 border-b text-xs uppercase">
                                <th className="pb-2">Application ID</th>
                                <th className="pb-2">Job</th>
                                <th className="pb-2">Status</th>
                                <th className="pb-2">Date</th>
                                <th className="pb-2">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {applications.map(app => (
                                <tr key={app._id} className="border-b last:border-0 hover:bg-gray-50 transition">
                                    <td className="py-3 font-mono text-xs text-gray-400">{app._id}</td>
                                    <td className="py-3 font-medium text-gray-700">{getJobTitle(app.jobId)}</td>
                                    <td className="py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor(app.status)}`}>
                                            {app.status}
                                        </span>
                                    </td>
                                    <td className="py-3 text-gray-400 text-xs">{new Date(app.appliedDate).toLocaleDateString()}</td>
                                    <td className="py-3">
                                        {app.status === "Applied" && (
                                            <button
                                                onClick={() => withdrawApplication(app._id)}
                                                className="text-yellow-600 hover:underline text-xs font-medium"
                                            >
                                                Withdraw
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
