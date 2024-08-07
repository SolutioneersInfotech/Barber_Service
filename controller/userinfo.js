const PersonalInfo = require('../models/Userinfo_model');

// Get personal info by ID
exports.getPersonalInfo = async (req, res) => {
  try {
    const personalInfo = await PersonalInfo.findById(req.params.id);
    if (!personalInfo) return res.status(404).send('Personal Info not found');
    res.json(personalInfo);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Create or update personal info
exports.createOrUpdatePersonalInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    if (req.file) {
      updateData.profilePic = req.file.path;
    }

    let personalInfo;
    if (id) {
      personalInfo = await PersonalInfo.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    } else {
      personalInfo = new PersonalInfo(updateData);
      await personalInfo.save();
    }

    res.status(200).json(personalInfo);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Delete personal info
exports.deletePersonalInfo = async (req, res) => {
  try {
    const personalInfo = await PersonalInfo.findByIdAndDelete(req.params.id);
    if (!personalInfo) return res.status(404).send('Personal Info not found');
    res.status(200).send('Personal Info deleted');
  } catch (error) {
    res.status(500).send(error.message);
  }
};
