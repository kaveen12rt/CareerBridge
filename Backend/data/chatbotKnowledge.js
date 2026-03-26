export const chatbotKnowledge = [
  // ================= GENERAL =================
  {
    id: "greeting",
    keywords: ["hi", "hello", "hey", "good morning", "good evening"],
    answer:
      "Hi! I’m the CareerBridge Assistant. I can help with jobs, profile editing, internships, feedback, skills, career fairs, and admin or student portal navigation.",
    suggestions: [
      "How can I find jobs that match my skills?",
      "How do I edit my profile?",
      "How do I find internships?",
    ],
  },

  {
    id: "thanks",
    keywords: ["thank you", "thanks", "thank"],
    answer: "You’re welcome. Let me know what you want help with next.",
    suggestions: [
      "How do I update my resume?",
      "How can I change my password?",
      "When is the next career fair?",
    ],
  },

  // ================= GENERAL CAREER & JOBS =================
  {
    id: "find-jobs-by-skills",
    keywords: [
      "find jobs that match my skills",
      "jobs matching my skills",
      "jobs for my skills",
      "match my skills",
      "skill based jobs",
    ],
    answer:
      "The best way is to keep your profile skills updated, then browse the Jobs section and compare job requirements with your profile. In a future smart-matching version, the platform can recommend jobs automatically based on your skills.",
    suggestions: [
      "How do I update my skills in my profile?",
      "Can you recommend entry-level positions?",
      "How do I apply for a job?",
    ],
  },

  {
    id: "companies-hiring",
    keywords: [
      "what companies are hiring right now",
      "companies hiring",
      "hiring companies",
      "who is hiring",
    ],
    answer:
      "You can check the Jobs and Companies sections to see available openings and the employers posting them. If live company hiring data is not shown yet, it means that part still needs backend job integration.",
    suggestions: [
      "How do I apply for a job?",
      "Can I save jobs to apply later?",
      "How do I get notifications for new jobs?",
    ],
  },

  {
    id: "apply-job",
    keywords: [
      "how do i apply for a job",
      "apply for a job",
      "job application",
      "how to apply",
    ],
    answer:
      "Open the job listing, review the requirements, and use the apply option if the jobs module is enabled. Make sure your profile, skills, and resume are updated before applying.",
    suggestions: [
      "How do I update my resume?",
      "How can I check my application status?",
      "Can I save jobs to apply later?",
    ],
  },

  {
    id: "suggest-jobs-by-education",
    keywords: [
      "suggest jobs based on my education",
      "jobs based on my education",
      "jobs for my degree",
      "education based jobs",
    ],
    answer:
      "The platform can use your university, major, and graduation information from your profile to guide job suggestions. For best results, keep your education details updated in your profile.",
    suggestions: [
      "How do I add my university information?",
      "How do I edit my profile?",
      "Can you recommend entry-level positions?",
    ],
  },

  {
    id: "update-resume",
    keywords: [
      "how do i update my resume",
      "update my resume",
      "upload resume",
      "resume",
      "resume link",
    ],
    answer:
      "Open your profile, click Edit Profile, then update the Resume Link field and save your changes. The updated resume information will then appear in your profile data.",
    suggestions: [
      "How do I edit my profile?",
      "How can I upload my resume?",
      "How do I add certifications?",
    ],
  },

  {
    id: "application-status",
    keywords: [
      "check my application status",
      "application status",
      "track application",
      "my applications",
    ],
    answer:
      "Application status tracking can be shown in a dedicated applications module. If it is not visible yet, that feature is not fully connected in the current version.",
    suggestions: [
      "How do I apply for a job?",
      "Can I save jobs to apply later?",
      "How do I get notifications for new jobs?",
    ],
  },

  {
    id: "save-jobs",
    keywords: [
      "save jobs to apply later",
      "save jobs",
      "bookmark jobs",
      "favorite jobs",
    ],
    answer:
      "A saved jobs feature can be added so you can bookmark jobs and return later. If you do not currently see this option, it means the feature is not enabled yet in this version.",
    suggestions: [
      "How do I apply for a job?",
      "How can I check my application status?",
      "How do I get notifications for new jobs?",
    ],
  },

  {
    id: "job-notifications",
    keywords: [
      "notifications for new jobs",
      "job notifications",
      "notify me about jobs",
      "new jobs alert",
    ],
    answer:
      "Job notifications can be based on your skills, education, and preferences. If notification settings are not available yet, the feature still needs to be integrated on the current platform.",
    suggestions: [
      "How do I set my job preferences?",
      "How can I find jobs that match my skills?",
      "How do I find internships?",
    ],
  },

  {
    id: "interview-preparation",
    keywords: [
      "best way to prepare for interviews",
      "prepare for interviews",
      "interview tips",
      "interview preparation",
    ],
    answer:
      "The best preparation is to update your resume, review the job description, research the company, practice common interview questions, and prepare examples of your skills and projects.",
    suggestions: [
      "How do I update my resume?",
      "How can I showcase my projects?",
      "What skills are most in demand?",
    ],
  },

  {
    id: "entry-level-jobs",
    keywords: [
      "recommend entry level positions",
      "entry level positions",
      "entry level jobs",
      "jobs for beginners",
      "fresher jobs",
    ],
    answer:
      "Entry-level roles usually include internships, trainee positions, junior developer roles, assistant analyst roles, and graduate opportunities. Keep your profile updated so suitable opportunities can be matched more easily.",
    suggestions: [
      "How do I find internships?",
      "Can you suggest jobs based on my education?",
      "How do I update my skills in my profile?",
    ],
  },

  // ================= PROFILE & ACCOUNT =================
  {
    id: "edit-profile",
    keywords: [
      "how do i edit my profile",
      "edit my profile",
      "edit profile",
      "profile edit",
    ],
    answer:
      "Open your profile from the user menu, then click Edit Profile. From there you can update your education, skills, certifications, bio, and resume information.",
    suggestions: [
      "How do I update my skills in my profile?",
      "How do I add certifications?",
      "How can I upload my resume?",
    ],
  },

  {
    id: "update-skills",
    keywords: [
      "update my skills in my profile",
      "add new skills",
      "skills in profile",
      "update skills",
      "add skills",
    ],
    answer:
      "Go to Edit Profile, find the Skills field, enter your skills separated by commas, and save the profile. The updated skills will then appear in your profile information.",
    suggestions: [
      "How do I edit my profile?",
      "What skills are most in demand?",
      "Can you suggest courses to improve my skills?",
    ],
  },

  {
    id: "change-password",
    keywords: [
      "change my password",
      "change password",
      "update password",
      "password",
    ],
    answer:
      "If you are logged in, open your user menu and select Change Password. If you forgot your password, use the Forgot Password option on the Sign In page.",
    suggestions: [
      "Forgot password",
      "How do I sign in?",
      "How do I edit my profile?",
    ],
  },

  {
    id: "university-info",
    keywords: [
      "add my university information",
      "university information",
      "add university",
      "update university",
    ],
    answer:
      "Open Edit Profile and fill in the University field, then save your profile. This helps improve profile completeness and job relevance.",
    suggestions: [
      "How do I edit my profile?",
      "Can you suggest jobs based on my education?",
      "How do I add certifications?",
    ],
  },

  {
    id: "upload-resume",
    keywords: [
      "upload my resume",
      "how can i upload my resume",
      "resume upload",
      "resume link",
    ],
    answer:
      "On the current version, resume data is usually added through the Resume Link field in Edit Profile. Paste the link and save your profile.",
    suggestions: [
      "How do I update my resume?",
      "How do I edit my profile?",
      "How can I showcase my projects?",
    ],
  },

  {
    id: "add-certifications",
    keywords: [
      "add certifications",
      "how do i add certifications",
      "certifications",
      "update certifications",
    ],
    answer:
      "Go to Edit Profile, use the Certifications field, enter each certification separated by commas, and save the profile.",
    suggestions: [
      "How do I edit my profile?",
      "How do I show my certifications to employers?",
      "What skills are most in demand?",
    ],
  },

  {
    id: "add-bio",
    keywords: [
      "add my bio",
      "how do i add my bio",
      "bio",
      "update bio",
    ],
    answer:
      "Open Edit Profile, type your information in the Bio section, and save your changes. A clear bio helps employers understand your background and interests.",
    suggestions: [
      "How do I edit my profile?",
      "How can I showcase my projects?",
      "How do I update my portfolio?",
    ],
  },

  {
    id: "delete-experience",
    keywords: [
      "delete old experiences from my profile",
      "remove experience",
      "delete experience",
      "old experience",
    ],
    answer:
      "If your profile form includes experience fields, you can remove or edit them in Edit Profile and save again. If that section is not available yet, it needs to be added to the profile form first.",
    suggestions: [
      "How do I edit my profile?",
      "How do I add my bio?",
      "How do I update my portfolio?",
    ],
  },

  {
    id: "job-preferences",
    keywords: [
      "set my job preferences",
      "job preferences",
      "preferred jobs",
      "preferences",
    ],
    answer:
      "Job preferences can be used to filter opportunities based on role, location, or work style. If you do not currently see a job preferences form, that feature still needs to be enabled in the platform.",
    suggestions: [
      "How do I get notifications for new jobs?",
      "How do I find jobs that match my skills?",
      "How do I find internships?",
    ],
  },

  {
    id: "hide-profile",
    keywords: [
      "hide my profile from employers temporarily",
      "hide profile",
      "make profile private",
      "disable employer visibility",
    ],
    answer:
      "A profile visibility toggle can be added for that purpose. If you do not see this option in your account settings, it is not currently active in this version.",
    suggestions: [
      "How do I edit my profile?",
      "How do I set my job preferences?",
      "How can I change my password?",
    ],
  },

  // ================= INTERNSHIPS =================
  {
    id: "find-internships",
    keywords: [
      "find internships",
      "how do i find internships",
      "internships",
      "internship search",
    ],
    answer:
      "You can look for internship opportunities through the Jobs section by checking student-friendly or entry-level listings. If a dedicated internship filter is added, it will make this faster.",
    suggestions: [
      "What companies offer internships for students?",
      "Can I apply for remote internships?",
      "How do I know if I’m eligible for an internship?",
    ],
  },

  {
    id: "internship-companies",
    keywords: [
      "companies offer internships for students",
      "internship companies",
      "who offers internships",
      "student internships",
    ],
    answer:
      "Companies that recruit students usually post trainee, graduate, or internship roles. Check the Companies and Jobs sections to see who is currently recruiting.",
    suggestions: [
      "How do I find internships?",
      "Can I apply for multiple internships at once?",
      "Are internships paid or unpaid?",
    ],
  },

  {
    id: "multiple-internships",
    keywords: [
      "apply for multiple internships at once",
      "multiple internships",
      "many internship applications",
    ],
    answer:
      "You can usually apply to multiple opportunities one by one if the applications module supports it. Bulk internship applications are not currently confirmed unless that feature is specifically enabled.",
    suggestions: [
      "How do I find internships?",
      "Can I cancel an internship application?",
      "How long does an internship application take?",
    ],
  },

  {
    id: "internship-eligibility",
    keywords: [
      "eligible for an internship",
      "internship eligibility",
      "am i eligible for internship",
    ],
    answer:
      "Internship eligibility usually depends on your education level, field of study, skills, and any company requirements listed in the posting. Keep your profile updated so those requirements are easier to compare.",
    suggestions: [
      "How do I add my university information?",
      "How do I update my skills in my profile?",
      "Can I apply for remote internships?",
    ],
  },

  {
    id: "remote-internships",
    keywords: [
      "remote internships",
      "apply for remote internships",
      "online internships",
    ],
    answer:
      "Yes, remote internships can be offered if companies publish remote-friendly positions. Check the job location or work mode details in each listing.",
    suggestions: [
      "How do I find internships?",
      "How do I update my internship preferences?",
      "Are internships paid or unpaid?",
    ],
  },

  {
    id: "internship-preferences",
    keywords: [
      "update my internship preferences",
      "internship preferences",
      "preferred internship",
    ],
    answer:
      "Internship preferences can be handled through your profile or job preference settings if that section is enabled. If it is not visible yet, that feature still needs to be added.",
    suggestions: [
      "How do I set my job preferences?",
      "How do I find internships?",
      "How can I get internship notifications?",
    ],
  },

  {
    id: "internship-notifications",
    keywords: [
      "internship notifications",
      "get internship notifications",
      "notify me about internships",
    ],
    answer:
      "Internship notifications can be based on your education, skills, and preferences. If notifications are not visible yet, the notification feature is still pending integration.",
    suggestions: [
      "How do I find internships?",
      "How do I update my internship preferences?",
      "How do I get notifications for new jobs?",
    ],
  },

  {
    id: "internship-time",
    keywords: [
      "how long does an internship application take",
      "internship application time",
      "internship application process",
    ],
    answer:
      "The time depends on the company and review process. Some applications are quick, while others include screening, interviews, and follow-up steps.",
    suggestions: [
      "Can I cancel an internship application?",
      "How do I know if I’m eligible for an internship?",
      "Are internships paid or unpaid?",
    ],
  },

  {
    id: "cancel-internship",
    keywords: [
      "cancel an internship application",
      "withdraw internship application",
      "cancel internship",
    ],
    answer:
      "If application management is enabled, you may be able to withdraw an internship application from your applications section. If that section is not available yet, the feature still needs integration.",
    suggestions: [
      "How can I check my application status?",
      "How long does an internship application take?",
      "How do I find internships?",
    ],
  },

  {
    id: "paid-unpaid-internships",
    keywords: [
      "internships paid or unpaid",
      "paid internships",
      "unpaid internships",
    ],
    answer:
      "Internships can be either paid or unpaid depending on the company and role. Always check the internship description carefully before applying.",
    suggestions: [
      "How do I find internships?",
      "Can I apply for remote internships?",
      "What companies offer internships for students?",
    ],
  },

  // ================= EVENTS & CAREER FAIRS =================
  {
    id: "next-career-fair",
    keywords: [
      "next career fair",
      "when is the next career fair",
      "career fair date",
    ],
    answer:
      "Career fair details should appear in an events or announcements section if that module is enabled. If you do not see it yet, career fair scheduling is not currently visible in this version.",
    suggestions: [
      "How do I register for a career fair?",
      "Can I attend online career fairs?",
      "How do I prepare for a career fair?",
    ],
  },

  {
    id: "register-career-fair",
    keywords: [
      "register for a career fair",
      "career fair registration",
      "join career fair",
    ],
    answer:
      "If career fair registration is active, you should see a register or join option on the event page. If not, that event flow still needs to be implemented.",
    suggestions: [
      "When is the next career fair?",
      "Can I attend online career fairs?",
      "How do I see the list of participating companies?",
    ],
  },

  {
    id: "online-career-fair",
    keywords: [
      "attend online career fairs",
      "online career fairs",
      "virtual career fair",
    ],
    answer:
      "Yes, online career fairs can be supported if the events module includes virtual sessions or meeting links. If no online event option is shown, it has not been enabled yet.",
    suggestions: [
      "How do I register for a career fair?",
      "Are career fair sessions recorded?",
      "How long does each session last?",
    ],
  },

  {
    id: "participating-companies",
    keywords: [
      "list of participating companies",
      "participating companies",
      "career fair companies",
    ],
    answer:
      "A participating companies list is usually shown on the event or career fair page. If you do not see it, the event details module may not be connected yet.",
    suggestions: [
      "When is the next career fair?",
      "Can I ask questions to multiple companies at once?",
      "Can I schedule interviews during the career fair?",
    ],
  },

  {
    id: "schedule-interviews-career-fair",
    keywords: [
      "schedule interviews during the career fair",
      "career fair interviews",
      "book interview at career fair",
    ],
    answer:
      "Interview scheduling can be supported if the events module includes appointment booking. If that option is not currently shown, it still needs to be integrated.",
    suggestions: [
      "How do I prepare for a career fair?",
      "Can I attend online career fairs?",
      "Can I get feedback from recruiters after the event?",
    ],
  },

  {
    id: "prepare-career-fair",
    keywords: [
      "prepare for a career fair",
      "career fair preparation",
      "how do i prepare for a career fair",
    ],
    answer:
      "Prepare by updating your resume, reviewing participating companies, practicing your introduction, and being ready to ask clear questions about roles and opportunities.",
    suggestions: [
      "How do I update my resume?",
      "What companies are hiring right now?",
      "Can I schedule interviews during the career fair?",
    ],
  },

  {
    id: "recruiter-feedback",
    keywords: [
      "feedback from recruiters after the event",
      "recruiter feedback",
      "event feedback from recruiters",
    ],
    answer:
      "Recruiter feedback can be offered if the event system includes follow-up communication. If you do not see that feature yet, it is not currently active.",
    suggestions: [
      "Are career fair sessions recorded?",
      "How do I prepare for a career fair?",
      "How long does each session last?",
    ],
  },

  {
    id: "recorded-sessions",
    keywords: [
      "career fair sessions recorded",
      "recorded sessions",
      "event recordings",
    ],
    answer:
      "Recorded sessions can be made available if the event organizers choose to save them. If no recordings section is shown, session recording is not enabled in the current version.",
    suggestions: [
      "Can I attend online career fairs?",
      "How long does each session last?",
      "Can I ask questions to multiple companies at once?",
    ],
  },

  {
    id: "session-length",
    keywords: [
      "how long does each session last",
      "session length",
      "career fair session duration",
    ],
    answer:
      "Session length depends on the event setup. The exact duration should normally be shown in the event details if career fair scheduling is active.",
    suggestions: [
      "When is the next career fair?",
      "Are career fair sessions recorded?",
      "Can I schedule interviews during the career fair?",
    ],
  },

  {
    id: "multi-company-questions",
    keywords: [
      "ask questions to multiple companies at once",
      "questions to multiple companies",
      "career fair questions",
    ],
    answer:
      "A group Q&A feature can be added for career events, but if it is not visible yet, it means the current version does not support it directly.",
    suggestions: [
      "Can I attend online career fairs?",
      "How do I see the list of participating companies?",
      "How do I prepare for a career fair?",
    ],
  },

  // ================= SKILLS & LEARNING =================
  {
    id: "add-new-skills",
    keywords: [
      "add new skills to my profile",
      "new skills",
      "add skills",
      "update skills",
    ],
    answer:
      "Open Edit Profile, type your skills in the Skills field separated by commas, and save your profile.",
    suggestions: [
      "How do I edit my profile?",
      "What skills are most in demand?",
      "Can you suggest courses to improve my skills?",
    ],
  },

  {
    id: "skills-in-demand",
    keywords: [
      "skills are most in demand",
      "in demand skills",
      "top skills",
      "popular skills",
    ],
    answer:
      "Common in-demand skills include programming, communication, teamwork, problem solving, data analysis, cloud tools, UI or UX understanding, and project work. The best choice depends on your target field.",
    suggestions: [
      "Can you suggest courses to improve my skills?",
      "How do I update my skills in my profile?",
      "How can I showcase my projects?",
    ],
  },

  {
    id: "suggest-courses",
    keywords: [
      "suggest courses to improve my skills",
      "courses to improve skills",
      "learning courses",
      "skill courses",
    ],
    answer:
      "The platform can suggest learning paths based on your profile skills and goals. If course suggestions are not visible yet, that learning recommendation feature is still pending.",
    suggestions: [
      "What skills are most in demand?",
      "How do I get skill recommendations based on my profile?",
      "Can I take online training through this platform?",
    ],
  },

  {
    id: "show-certifications",
    keywords: [
      "show my certifications to employers",
      "display certifications",
      "certifications to employers",
    ],
    answer:
      "Add your certifications in Edit Profile. Once saved, they become part of your profile information and can be displayed to employers where profile viewing is enabled.",
    suggestions: [
      "How do I add certifications?",
      "How do I edit my profile?",
      "How do I update my portfolio?",
    ],
  },

  {
    id: "online-training",
    keywords: [
      "take online training through this platform",
      "online training",
      "training through platform",
    ],
    answer:
      "Online training can be integrated as a future learning feature. If you do not currently see a training section, it is not active yet in this version.",
    suggestions: [
      "Can you suggest courses to improve my skills?",
      "What skills are most in demand?",
      "Can I get a skill assessment test?",
    ],
  },

  {
    id: "update-portfolio",
    keywords: [
      "update my portfolio",
      "portfolio",
      "change portfolio",
    ],
    answer:
      "A portfolio section can be added to the profile so you can highlight your work. If you do not currently see a dedicated portfolio field, that part still needs to be added to the profile form.",
    suggestions: [
      "How can I showcase my projects?",
      "Can I link my GitHub or LinkedIn account?",
      "How do I add my bio?",
    ],
  },

  {
    id: "showcase-projects",
    keywords: [
      "showcase my projects",
      "projects",
      "add projects",
      "display projects",
    ],
    answer:
      "Projects can be shown through a portfolio, resume link, bio, or future project section. If there is no project field yet, that feature still needs to be added.",
    suggestions: [
      "How do I update my portfolio?",
      "Can I link my GitHub or LinkedIn account?",
      "How do I add my bio?",
    ],
  },

  {
    id: "github-linkedin",
    keywords: [
      "link my github or linkedin account",
      "github",
      "linkedin",
      "social links",
    ],
    answer:
      "GitHub and LinkedIn links can be added to the profile if social link fields are enabled. If those fields are not visible yet, they still need to be added to the edit profile form.",
    suggestions: [
      "How do I update my portfolio?",
      "How can I showcase my projects?",
      "How do I edit my profile?",
    ],
  },

  {
    id: "skill-recommendations",
    keywords: [
      "skill recommendations based on my profile",
      "skill recommendations",
      "recommended skills",
    ],
    answer:
      "Skill recommendations can be generated from your education, target field, and current profile data. In a smarter version of the platform, these can be shown automatically after profile analysis.",
    suggestions: [
      "What skills are most in demand?",
      "Can you suggest courses to improve my skills?",
      "Can I get a skill assessment test?",
    ],
  },

  {
    id: "skill-assessment",
    keywords: [
      "skill assessment test",
      "assessment test",
      "skill test",
    ],
    answer:
      "A skill assessment feature can be integrated to evaluate your strengths and guide job recommendations. If there is no test section yet, it is not available in the current version.",
    suggestions: [
      "How do I get skill recommendations based on my profile?",
      "What skills are most in demand?",
      "Can you suggest courses to improve my skills?",
    ],
  },

  // ================= FALLBACK HELP =================
  {
    id: "support-help",
    keywords: ["help", "support", "issue", "problem", "bug", "assist"],
    answer:
      "I can help with jobs, internships, profile editing, feedback, password changes, career fairs, skills, and general CareerBridge navigation. Ask me a specific question and I’ll guide you.",
    suggestions: [
      "How do I edit my profile?",
      "How do I find internships?",
      "How can I find jobs that match my skills?",
    ],
  },
];