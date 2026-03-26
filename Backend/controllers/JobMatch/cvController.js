const mongoose = require('mongoose');
const CVTemplate = require('../../models/JobMatch/CVTemplate');

const getTemplates = async (req, res) => {
  try {
    const { studentId } = req.params;
    const templates = await CVTemplate.find({ studentId }).sort({ updatedAt: -1 });
    res.json({ total: templates.length, templates });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching CV templates', error: error.message });
  }
};

const createTemplate = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { name, summary = '', sections = [], isDefault = false } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Template name is required' });
    }

    const template = await CVTemplate.create({
      studentId,
      name,
      summary,
      sections,
      isDefault
    });

    res.status(201).json(template);
  } catch (error) {
    res.status(500).json({ message: 'Error creating CV template', error: error.message });
  }
};

const updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid template id' });
    }

    const updated = await CVTemplate.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    if (!updated) {
      return res.status(404).json({ message: 'Template not found' });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating CV template', error: error.message });
  }
};

const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid template id' });
    }

    const deleted = await CVTemplate.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Template not found' });
    }

    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting CV template', error: error.message });
  }
};

const previewCV = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid template id' });
    }

    const template = await CVTemplate.findById(id);

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
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

module.exports = {
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  previewCV
};
