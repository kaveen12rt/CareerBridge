import mongoose from "mongoose";
import CVTemplate from "../../models/JobMatch/CVTemplate.js";

const CV_LIMIT_PER_USER = 10;

// GET /api/job-match/cv/:studentId  →  uses authenticated user id
export const getTemplates = async (req, res) => {
  try {
    const studentId = String(req.user?.id || '');
    if (!studentId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const templates = await CVTemplate.find({ studentId }).sort({ updatedAt: -1 });
    res.json({ total: templates.length, templates });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching CV templates', error: error.message });
  }
};

export const getTemplate = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid template id' });
    }

    const template = await CVTemplate.findById(id);

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    // Only the owner can read their CV
    if (String(template.studentId) !== String(req.user?.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(template);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching CV template', error: error.message });
  }
};

export const createTemplate = async (req, res) => {
  try {
    const studentId = String(req.user?.id || '');
    if (!studentId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { name, summary = '', sections = [], isDefault = false, templateId = '', profileImage = '' } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Template name is required' });
    }

    // Enforce per-user CV limit
    const existingCount = await CVTemplate.countDocuments({ studentId });
    if (existingCount >= CV_LIMIT_PER_USER) {
      return res.status(400).json({
        message: `You can save up to ${CV_LIMIT_PER_USER} CVs. Please delete an existing one before creating a new one.`
      });
    }

    const template = await CVTemplate.create({
      studentId,
      templateId,
      name,
      summary,
      sections,
      isDefault,
      profileImage
    });

    res.status(201).json(template);
  } catch (error) {
    res.status(500).json({ message: 'Error creating CV template', error: error.message });
  }
};

export const updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid template id' });
    }

    const existing = await CVTemplate.findById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Template not found' });
    }

    // Only the owner can update
    if (String(existing.studentId) !== String(req.user?.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updated = await CVTemplate.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating CV template', error: error.message });
  }
};

export const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid template id' });
    }

    const existing = await CVTemplate.findById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Template not found' });
    }

    // Only the owner can delete
    if (String(existing.studentId) !== String(req.user?.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await CVTemplate.findByIdAndDelete(id);
    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting CV template', error: error.message });
  }
};

export const previewCV = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid template id' });
    }

    const template = await CVTemplate.findById(id);

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    if (String(template.studentId) !== String(req.user?.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      header: {
        title: template.name,
        generatedAt: new Date().toISOString()
      },
      summary: template.summary,
      sections: template.sections,
      note: 'This is a preview payload. A PDF output can be added later.'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error generating CV preview', error: error.message });
  }
};
