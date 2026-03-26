import { useState, useEffect } from "react";

export default function PaymentPage() {
    const [selectedStudent] = useState(() => JSON.parse(localStorage.getItem("cbStudent") || "null"));
    const [applications, setApplications] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [selectedAppId, setSelectedAppId] = useState("");
    const [amount, setAmount] = useState("");
    const [payments, setPayments] = useState([]);
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetch("http://localhost:5000/api/jobs").then(r => r.json()).then(setJobs).catch(() => { });
        if (selectedStudent) {
            fetch(`http://localhost:5000/api/applications/student/${selectedStudent._id}`)
                .then(r => r.json()).then(setApplications).catch(() => { });
            fetchPayments();
        }
    }, []);

    const fetchPayments = async () => {
        if (!selectedStudent) return;
        try {
            const res = await fetch(`http://localhost:5000/api/payments/student/${selectedStudent._id}`);
            const data = await res.json();
            setPayments(data);
        } catch { }
    };

    const createPayment = async () => {
        if (!selectedStudent) return setMessage("❌ No student selected. Go to Applications page first.");
        if (!selectedAppId) return setMessage("❌ Please select an application");
        if (!amount || isNaN(amount)) return setMessage("❌ Enter a valid amount");
        try {
            const res = await fetch("http://localhost:5000/api/payments/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ studentId: selectedStudent._id, applicationId: selectedAppId, amount: Number(amount) })
            });
            const data = await res.json();
            if (res.ok) { setMessage("✅ Payment record created!"); setAmount(""); setSelectedAppId(""); fetchPayments(); }
            else setMessage(`❌ ${data.error || data.message}`);
        } catch { setMessage("❌ Error connecting to server"); }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            const res = await fetch(`http://localhost:5000/api/payments/${id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ paymentStatus: newStatus })
            });
            if (res.ok) { setMessage(`✅ Payment marked as ${newStatus}`); fetchPayments(); }
        } catch { }
    };

    const statusColor = (s) => ({ Pending: "bg-yellow-100 text-yellow-700", Completed: "bg-green-100 text-green-700", Failed: "bg-red-100 text-red-700" }[s] || "bg-gray-100 text-gray-700");

    const getJobTitle = (jobId) => {
        const job = jobs.find(j => j._id === jobId);
        return job ? job.title : "Unknown Job";
    };

    const getAppLabel = (app) => `${getJobTitle(app.jobId)} — ${app.status}`;

    const getPaymentAppLabel = (appId) => {
        const app = applications.find(a => a._id === appId);
        return app ? getJobTitle(app.jobId) : appId;
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <h1 className="text-3xl font-bold text-green-600 mb-1">Payment Tracking</h1>
            <p className="text-gray-400 text-sm mb-2">Create and track payment records with status management</p>
            {selectedStudent
                ? <p className="text-green-600 text-sm font-medium mb-6">👤 Logged in as: <strong>{selectedStudent.name}</strong></p>
                : <p className="text-yellow-600 text-sm font-medium mb-6">⚠️ No student selected. Go to <a href="/applications" className="underline text-indigo-500">Applications page</a> first.</p>}

            {message && <div className="mb-4 p-3 rounded-lg bg-white shadow text-sm font-medium border-l-4 border-green-400">{message}</div>}

            {/* Create Payment */}
            <div className="bg-white rounded-xl shadow p-5 mb-5">
                <h2 className="text-base font-bold text-gray-700 mb-4">💳 Create Payment Record</h2>
                {applications.length === 0 ? (
                    <p className="text-yellow-600 text-sm">⚠️ No applications found. Apply for a job first on the Applications page.</p>
                ) : (
                    <div className="flex flex-col gap-3">
                        <select className="border rounded-lg px-4 py-2 text-sm" value={selectedAppId} onChange={(e) => setSelectedAppId(e.target.value)}>
                            <option value="">-- Select your application --</option>
                            {applications.map(a => (
                                <option key={a._id} value={a._id}>{getAppLabel(a)}</option>
                            ))}
                        </select>
                        <input
                            className="border rounded-lg px-4 py-2 text-sm"
                            placeholder="Amount in LKR (e.g. 500)"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                        <button onClick={createPayment} className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 font-medium w-fit text-sm">Create Payment Record</button>
                    </div>
                )}
            </div>

            {/* Payment History */}
            <div className="bg-white rounded-xl shadow p-5">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-base font-bold text-gray-700">📊 Payment History</h2>
                    <button onClick={fetchPayments} className="bg-gray-700 text-white px-4 py-2 rounded-lg text-xs hover:bg-gray-800">Refresh</button>
                </div>
                {payments.length === 0 ? (
                    <p className="text-gray-400 text-sm">No payment records yet.</p>
                ) : (
                    <div className="flex flex-col gap-3">
                        {payments.map(pay => (
                            <div key={pay._id} className="border rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                <div>
                                    <p className="font-semibold text-gray-700">💼 {getPaymentAppLabel(pay.applicationId)}</p>
                                    <p className="text-sm text-gray-500 mt-1">Amount: <strong>LKR {pay.amount}</strong> • Date: {new Date(pay.paymentDate).toLocaleDateString()}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor(pay.paymentStatus)}`}>{pay.paymentStatus}</span>
                                    {pay.paymentStatus === "Pending" && (
                                        <>
                                            <button onClick={() => updateStatus(pay._id, "Completed")} className="bg-green-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-green-600 font-medium">✅ Complete</button>
                                            <button onClick={() => updateStatus(pay._id, "Failed")} className="bg-red-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-red-600 font-medium">❌ Fail</button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
