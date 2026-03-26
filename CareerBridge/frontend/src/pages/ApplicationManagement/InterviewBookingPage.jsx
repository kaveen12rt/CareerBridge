import { useState, useEffect } from "react";

export default function InterviewBookingPage() {
    const [jobs, setJobs] = useState([]);
    const [selectedStudent] = useState(() => JSON.parse(localStorage.getItem("cbStudent") || "null"));
    const [selectedJobId, setSelectedJobId] = useState("");
    const [slots, setSlots] = useState([]);
    const [bookedSlots, setBookedSlots] = useState([]);
    const [applications, setApplications] = useState([]);
    const [selectedAppId, setSelectedAppId] = useState("");
    const [message, setMessage] = useState("");
    const [newSlot, setNewSlot] = useState({ jobId: "", interviewDate: "", interviewTime: "" });

    useEffect(() => {
        fetch("http://localhost:5000/api/jobs").then(r => r.json()).then(setJobs).catch(() => { });
        if (selectedStudent) {
            fetch(`http://localhost:5000/api/applications/student/${selectedStudent._id}`)
                .then(r => r.json()).then(setApplications).catch(() => { });
            fetchBookedSlots();
        }
    }, []);

    const fetchAvailableSlots = async () => {
        if (!selectedJobId) return setMessage("❌ Select a job first");
        try {
            const res = await fetch(`http://localhost:5000/api/interviews/slots/job/${selectedJobId}`);
            const data = await res.json();
            setSlots(data);
            if (data.length === 0) setMessage("ℹ️ No available slots for this job yet");
        } catch { setMessage("❌ Error fetching slots"); }
    };

    const createSlot = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/interviews/slots", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newSlot)
            });
            const data = await res.json();
            if (res.ok) { setMessage("✅ Slot created!"); }
            else setMessage(`❌ ${data.error || data.message}`);
        } catch { setMessage("❌ Error creating slot"); }
    };

    const bookSlot = async (slotId) => {
        if (!selectedStudent) return setMessage("❌ Please select your student profile on the Applications page first");
        try {
            const res = await fetch("http://localhost:5000/api/interviews/book", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ slotId, studentId: selectedStudent._id, applicationId: selectedAppId || undefined })
            });
            const data = await res.json();
            if (res.ok) { setMessage("✅ Interview slot booked and locked! 🔒"); fetchAvailableSlots(); fetchBookedSlots(); }
            else setMessage(`❌ ${data.message}`);
        } catch { setMessage("❌ Error booking slot"); }
    };

    const fetchBookedSlots = async () => {
        if (!selectedStudent) return;
        try {
            const res = await fetch(`http://localhost:5000/api/interviews/slots/student/${selectedStudent._id}`);
            const data = await res.json();
            setBookedSlots(data);
        } catch { }
    };

    const cancelBooking = async (slotId) => {
        try {
            const res = await fetch(`http://localhost:5000/api/interviews/slots/${slotId}/cancel`, { method: "PATCH" });
            if (res.ok) { setMessage("✅ Booking cancelled"); fetchBookedSlots(); fetchAvailableSlots(); }
        } catch { }
    };

    const getJobTitle = (jobId) => {
        const job = jobs.find(j => j._id === jobId);
        return job ? job.title : "Unknown Job";
    };

    const getAppLabel = (app) => `${getJobTitle(app.jobId)} — ${app.status}`;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <h1 className="text-3xl font-bold text-indigo-600 mb-1">Interview Slot Booking</h1>
            <p className="text-gray-400 text-sm mb-2">Book interview slots, auto-locking after confirmation</p>
            {selectedStudent
                ? <p className="text-green-600 text-sm font-medium mb-6">👤 Logged in as: <strong>{selectedStudent.name}</strong></p>
                : <p className="text-yellow-600 text-sm font-medium mb-6">⚠️ No student selected. Go to <a href="/applications" className="underline text-indigo-500">Applications page</a> and select your name first.</p>}

            {message && <div className="mb-4 p-3 rounded-lg bg-white shadow text-sm font-medium border-l-4 border-indigo-400">{message}</div>}

            {/* Create Slot */}
            <div className="bg-white rounded-xl shadow p-5 mb-5">
                <h2 className="text-base font-bold text-gray-700 mb-1">➕ Create Interview Slot <span className="text-xs font-normal text-gray-400">(Company side - for demo)</span></h2>
                <div className="flex flex-col gap-3 mt-3">
                    <select className="border rounded-lg px-4 py-2 text-sm" value={newSlot.jobId} onChange={(e) => setNewSlot({ ...newSlot, jobId: e.target.value })}>
                        <option value="">-- Select Job --</option>
                        {jobs.map(j => <option key={j._id} value={j._id}>{j.title} {j.company ? `— ${j.company}` : ""}</option>)}
                    </select>
                    <input className="border rounded-lg px-4 py-2 text-sm" placeholder="Date (e.g. 2026-04-15)" value={newSlot.interviewDate} onChange={(e) => setNewSlot({ ...newSlot, interviewDate: e.target.value })} />
                    <input className="border rounded-lg px-4 py-2 text-sm" placeholder="Time (e.g. 10:00 AM)" value={newSlot.interviewTime} onChange={(e) => setNewSlot({ ...newSlot, interviewTime: e.target.value })} />
                    <button onClick={createSlot} className="bg-indigo-500 text-white px-6 py-2 rounded-lg hover:bg-indigo-600 font-medium w-fit text-sm">Create Slot</button>
                </div>
            </div>

            {/* Book Slot */}
            <div className="bg-white rounded-xl shadow p-5 mb-5">
                <h2 className="text-base font-bold text-gray-700 mb-4">📅 Book an Interview Slot</h2>
                <div className="flex flex-col gap-3 mb-4">
                    <select className="border rounded-lg px-4 py-2 text-sm" value={selectedJobId} onChange={(e) => setSelectedJobId(e.target.value)}>
                        <option value="">-- Select Job to search slots --</option>
                        {jobs.map(j => <option key={j._id} value={j._id}>{j.title} {j.company ? `— ${j.company}` : ""}</option>)}
                    </select>
                    {applications.length > 0 && (
                        <select className="border rounded-lg px-4 py-2 text-sm" value={selectedAppId} onChange={(e) => setSelectedAppId(e.target.value)}>
                            <option value="">-- Link to my application (optional) --</option>
                            {applications.filter(a => a.status === "Applied").map(a => (
                                <option key={a._id} value={a._id}>{getAppLabel(a)}</option>
                            ))}
                        </select>
                    )}
                    <button onClick={fetchAvailableSlots} className="bg-gray-700 text-white px-6 py-2 rounded-lg hover:bg-gray-800 font-medium w-fit text-sm">Search Available Slots</button>
                </div>

                {slots.length === 0 ? (
                    <p className="text-gray-400 text-sm">No slots found. Select a job and search.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {slots.map(slot => (
                            <div key={slot._id} className="border rounded-xl p-4 flex flex-col gap-2 hover:shadow transition">
                                <p className="font-semibold text-gray-700">📅 {slot.interviewDate}</p>
                                <p className="text-sm text-gray-500">🕐 {slot.interviewTime}</p>
                                <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-1 rounded-full w-fit">Available</span>
                                <button onClick={() => bookSlot(slot._id)} className="bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-600 font-medium mt-1">Book This Slot</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* My Bookings */}
            <div className="bg-white rounded-xl shadow p-5">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-base font-bold text-gray-700">🔒 My Booked Interviews</h2>
                    <button onClick={fetchBookedSlots} className="bg-gray-700 text-white px-4 py-2 rounded-lg text-xs hover:bg-gray-800">Refresh</button>
                </div>
                {bookedSlots.length === 0 ? (
                    <p className="text-gray-400 text-sm">No bookings yet.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {bookedSlots.map(slot => (
                            <div key={slot._id} className="border border-indigo-200 rounded-xl p-4 flex flex-col gap-2">
                                <p className="font-semibold text-gray-700">📅 {slot.date}</p>
                                <p className="text-sm text-gray-500">🕐 {slot.time}</p>
                                <span className="text-xs font-semibold text-indigo-700 bg-indigo-100 px-2 py-1 rounded-full w-fit">🔒 Locked</span>
                                <button onClick={() => cancelBooking(slot._id)} className="text-red-500 hover:underline text-xs font-medium mt-1">Cancel Booking</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
