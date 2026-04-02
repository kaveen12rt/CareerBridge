const countWords = (value) => {
  return String(value || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
};

const normalizeList = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => String(item || "").trim())
    .filter(Boolean);
};

const toNumber = (value) => {
  if (value === "" || value === null || typeof value === "undefined") {
    return null;
  }

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
};

export const getQualityTier = (score) => {
  if (score >= 85) {
    return "Excellent";
  }

  if (score >= 70) {
    return "Good";
  }

  if (score >= 50) {
    return "Fair";
  }

  return "Needs Work";
};

export const analyzeJobPostQuality = (jobPost = {}) => {
  let score = 0;
  const warnings = [];
  const suggestions = [];
  const criticalIssues = [];

  const title = String(jobPost.title || "").trim();
  const description = String(jobPost.description || "").trim();
  const companyName = String(jobPost.companyName || "").trim();
  const department = String(jobPost.department || "").trim();
  const location = String(jobPost.location || "").trim();
  const type = String(jobPost.type || "").trim();
  const experience = String(jobPost.experience || "").trim();
  const requirements = normalizeList(jobPost.requirements);
  const skills = normalizeList(jobPost.skills);
  const salaryMin = toNumber(jobPost.salaryMin);
  const salaryMax = toNumber(jobPost.salaryMax);

  if (title.length >= 12 && title.split(/\s+/).length >= 2) {
    score += 15;
  } else if (title.length >= 6) {
    score += 8;
    warnings.push("Job title is short. Make it more specific.");
  } else {
    warnings.push("Job title is too short or missing.");
    suggestions.push("Use a role-focused title like Senior Frontend Developer.");
  }

  const descriptionWordCount = countWords(description);
  if (descriptionWordCount >= 120) {
    score += 30;
  } else if (descriptionWordCount >= 70) {
    score += 20;
    warnings.push("Job description is acceptable but could be more detailed.");
  } else if (descriptionWordCount >= 30) {
    score += 10;
    warnings.push("Job description is brief and may feel unclear to applicants.");
    suggestions.push("Add responsibilities, expected outcomes, and team context.");
  } else {
    warnings.push("Job description is missing or too short.");
    suggestions.push("Write at least 70 to 120 words describing the role and duties.");
  }

  if (salaryMin !== null && salaryMax !== null) {
    if (salaryMin > salaryMax) {
      criticalIssues.push("Salary range is invalid: minimum salary is higher than maximum salary.");
      warnings.push("Fix salary range before publishing.");
    } else if (salaryMin === salaryMax) {
      score += 8;
      warnings.push("Salary min and max are the same. Add a realistic range.");
    } else {
      score += 15;
    }
  } else if (salaryMin !== null || salaryMax !== null) {
    score += 5;
    warnings.push("Salary range is incomplete. Add both minimum and maximum salary.");
  } else {
    warnings.push("Salary range is missing.");
    suggestions.push("Add a salary range to increase trust and application quality.");
  }

  if (experience.length >= 5) {
    score += 10;
  } else {
    warnings.push("Experience requirement is missing or unclear.");
    suggestions.push("Add clear experience guidance such as 2 to 4 years.");
  }

  const parsedDeadline = jobPost.deadline ? new Date(jobPost.deadline) : null;
  if (parsedDeadline && !Number.isNaN(parsedDeadline.getTime())) {
    const now = new Date();
    const diffMs = parsedDeadline.getTime() - now.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffDays <= 0) {
      criticalIssues.push("Application deadline must be a future date.");
      warnings.push("Deadline is invalid or already passed.");
    } else if (diffDays < 3) {
      score += 6;
      warnings.push("Application deadline is very soon. Consider giving applicants more time.");
    } else {
      score += 10;
    }
  } else {
    warnings.push("Application deadline is missing.");
    suggestions.push("Set a valid future deadline to create urgency and clarity.");
  }

  if (requirements.length >= 4) {
    score += 10;
  } else if (requirements.length >= 2) {
    score += 6;
    warnings.push("Add more requirements for stronger candidate screening.");
  } else {
    warnings.push("Requirements list is too short.");
    suggestions.push("Include at least 3 to 4 clear requirements.");
  }

  if (skills.length >= 4) {
    score += 5;
  } else if (skills.length >= 2) {
    score += 3;
    warnings.push("Add a few more required skills.");
  } else {
    warnings.push("Skills list is weak or missing.");
    suggestions.push("Add technical and soft skills that are essential for the role.");
  }

  const requiredCoreFields = [companyName, department, location, type];
  const completedCoreFields = requiredCoreFields.filter((value) => Boolean(value)).length;
  if (completedCoreFields === requiredCoreFields.length) {
    score += 5;
  } else if (completedCoreFields >= 2) {
    score += 2;
    warnings.push("Some important job details are missing.");
  } else {
    warnings.push("Core job details are incomplete.");
  }

  const finalScore = Math.max(0, Math.min(100, Math.round(score)));

  return {
    score: finalScore,
    tier: getQualityTier(finalScore),
    warnings,
    suggestions,
    criticalIssues,
  };
};
