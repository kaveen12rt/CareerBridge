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

  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const getQualityTier = (score) => {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Fair";
  return "Needs Work";
};

const analyzeJobPostQuality = (jobPost = {}) => {
  let score = 0;
  const warnings = [];
  const suggestions = [];
  const criticalIssues = [];

  const title = String(jobPost.title || "").trim();
  const description = String(jobPost.description || "").trim();
  const experience = String(jobPost.experience || "").trim();
  const requirements = normalizeList(jobPost.requirements);
  const skills = normalizeList(jobPost.skills);
  const salaryMin = toNumber(jobPost.salaryMin);
  const salaryMax = toNumber(jobPost.salaryMax);

  if (title.length >= 12 && title.split(/\s+/).length >= 2) score += 15;
  else if (title.length >= 6) {
    score += 8;
    warnings.push("Job title is short. Make it more specific.");
  } else {
    warnings.push("Job title is too short or missing.");
  }

  const descriptionWordCount = countWords(description);
  if (descriptionWordCount >= 120) score += 30;
  else if (descriptionWordCount >= 70) {
    score += 20;
    warnings.push("Description can be improved with more detail.");
  } else if (descriptionWordCount >= 30) {
    score += 10;
    warnings.push("Description is brief and may appear unclear.");
  } else {
    warnings.push("Description is missing or too short.");
  }

  if (salaryMin !== null && salaryMax !== null) {
    if (salaryMin > salaryMax) {
      criticalIssues.push("Salary range invalid: minimum is greater than maximum.");
    } else if (salaryMin === salaryMax) {
      score += 8;
      warnings.push("Salary min and max are identical.");
    } else {
      score += 15;
    }
  } else if (salaryMin !== null || salaryMax !== null) {
    score += 5;
    warnings.push("Salary range is incomplete.");
  } else {
    warnings.push("Salary range is missing.");
  }

  if (experience.length >= 5) score += 10;
  else warnings.push("Experience requirement is missing or unclear.");

  const parsedDeadline = jobPost.deadline ? new Date(jobPost.deadline) : null;
  if (parsedDeadline && !Number.isNaN(parsedDeadline.getTime())) {
    const diffDays = (parsedDeadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    if (diffDays <= 0) {
      criticalIssues.push("Deadline must be a future date.");
    } else if (diffDays < 3) {
      score += 6;
      warnings.push("Deadline is very soon.");
    } else {
      score += 10;
    }
  } else {
    warnings.push("Application deadline is missing.");
  }

  if (requirements.length >= 4) score += 10;
  else if (requirements.length >= 2) {
    score += 6;
    warnings.push("Add more requirements for stronger screening.");
  } else {
    warnings.push("Requirements list is weak.");
  }

  if (skills.length >= 4) score += 5;
  else if (skills.length >= 2) {
    score += 3;
    warnings.push("Add more role-specific skills.");
  } else {
    warnings.push("Skills list is weak or missing.");
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

export { analyzeJobPostQuality };
