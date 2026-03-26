const mongoose = require("mongoose");

let Job;
try {
    Job = mongoose.model("Job");
} catch {
    const jobSchema = new mongoose.Schema({
        title: { type: String, required: true },
        company: { type: String },
        description: { type: String }
    }, { strict: false });
    Job = mongoose.model("Job", jobSchema);
}

module.exports = Job;
