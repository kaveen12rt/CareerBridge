const express = require("express");
const router = express.Router();
const Student = require("../../models/ApplicationManagement/Student");

router.get("/", async (req, res) => {
    try {
        const students = await Student.find({}, "_id name email studentNumber");
        res.json(students);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/", async (req, res) => {
    try {
        const { name, email, studentNumber } = req.body;
        const student = new Student({ name, email, studentNumber });
        await student.save();
        res.status(201).json(student);
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ message: `Student number ${error.keyValue.studentNumber} already exists` });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
});

router.delete("/:id", async (req, res) => {
    try {
        await Student.findByIdAndDelete(req.params.id);
        res.json({ message: "Student deleted" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
