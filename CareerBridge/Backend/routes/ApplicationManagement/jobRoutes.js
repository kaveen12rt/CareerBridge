const express = require("express");
const router = express.Router();
const Job = require("../../models/ApplicationManagement/Job");

router.get("/", async (req, res) => {
    try {
        const jobs = await Job.find({}, "_id title company description");
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/", async (req, res) => {
    try {
        const job = new Job(req.body);
        await job.save();
        res.status(201).json(job);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
