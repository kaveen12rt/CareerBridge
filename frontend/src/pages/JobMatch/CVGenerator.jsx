import { useMemo, useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';

const CVGenerator = () => {
  const sampleProfileImage = '/images/cv-example-man.svg';
  
  const [userId, setUserId] = useState(null);
  const [savedCVs, setSavedCVs] = useState([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [cvName, setCvName] = useState('');
  const [savingCV, setSavingCV] = useState(false);
  const [loadingCVs, setLoadingCVs] = useState(false);

  // Load user ID and fetch saved CVs
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/auth/profile', {
          credentials: 'include',
        });
        const data = await res.json();
        if (data?.data?.user?._id) {
          setUserId(data.data.user._id);
          fetchSavedCVs(data.data.user._id);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    
    loadUserData();
  }, []);

  const fetchSavedCVs = async (studentId) => {
    setLoadingCVs(true);
    try {
      const res = await fetch(`http://localhost:5000/api/job-match/cv/${studentId}`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (data?.templates) {
        setSavedCVs(data.templates);
      }
    } catch (error) {
      console.error('Error fetching saved CVs:', error);
    } finally {
      setLoadingCVs(false);
    }
  };

  const saveCV = async () => {
    if (!cvName.trim() || !userId) {
      alert('Please enter a CV name');
      return;
    }

    setSavingCV(true);
    try {
      const payload = {
        name: cvName.trim(),
        summary: form.summary,
        sections: [
          { title: 'fullName', content: form.fullName },
          { title: 'role', content: form.role },
          { title: 'email', content: form.email },
          { title: 'phone', content: form.phone },
          { title: 'address', content: form.address },
          { title: 'profileImage', content: form.profileImage },
          { title: 'profileImageType', content: form.profileImageType },
          { title: 'education', content: form.education },
          { title: 'skills', content: form.skills },
          { title: 'experience', content: form.experience },
          { title: 'languages', content: form.languages },
          { title: 'references', content: form.references },
          { title: 'projects', content: form.projects },
          { title: 'selectedTemplate', content: selectedTemplate }
        ]
      };

      const res = await fetch(`http://localhost:5000/api/job-match/cv/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const savedCV = await res.json();
        setSavedCVs([savedCV, ...savedCVs]);
        setShowSaveModal(false);
        setCvName('');
        alert('CV saved successfully!');
      } else {
        alert('Failed to save CV');
      }
    } catch (error) {
      console.error('Error saving CV:', error);
      alert('Error saving CV');
    } finally {
      setSavingCV(false);
    }
  };

  const deleteCV = async (cvId) => {
    if (!window.confirm('Are you sure you want to delete this CV?')) return;

    try {
      const res = await fetch(`http://localhost:5000/api/job-match/cv/template/${cvId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        setSavedCVs(savedCVs.filter((cv) => cv._id !== cvId));
        alert('CV deleted successfully!');
      } else {
        alert('Failed to delete CV');
      }
    } catch (error) {
      console.error('Error deleting CV:', error);
      alert('Error deleting CV');
    }
  };

  const loadCV = (cv) => {
    const sectionMap = {};
    if (cv.sections) {
      cv.sections.forEach((section) => {
        sectionMap[section.title] = section.content;
      });
    }
    
    setForm({
      fullName: sectionMap.fullName || '',
      role: sectionMap.role || '',
      profileImage: sectionMap.profileImage || '',
      profileImageType: sectionMap.profileImageType || '',
      email: sectionMap.email || '',
      phone: sectionMap.phone || '',
      address: sectionMap.address || '',
      summary: cv.summary || '',
      education: sectionMap.education || '',
      skills: sectionMap.skills || '',
      experience: sectionMap.experience || '',
      languages: sectionMap.languages || '',
      references: sectionMap.references || '',
      projects: sectionMap.projects || ''
    });
    
    setSelectedTemplate(sectionMap.selectedTemplate || null);
    setPreview(true);
  };

  const sampleData = {
    fullName: 'Lorna Alvarado',
    role: 'Marketing Manager',
    email: 'lorna.alvarado@email.com',
    phone: '+94 77 123 4567',
    address: '123 Main Street, Colombo',
    summary: 'Creative and results-driven professional with experience in sales, communication, and client relationship building.',
    education: 'BSc in Marketing - University of Colombo\nDiploma in Digital Marketing',
    skills: 'Communication, Leadership, SEO, Negotiation',
    experience: 'Marketing Executive - ABC Company (2022-2024)\nSales Intern - XYZ Group (2021-2022)',
    languages: 'English\nSinhala',
    references: 'Harper Russo - Director\nBailey Dupont - Team Lead',
    projects: 'Campaign Optimization Project\nLead Generation Dashboard'
  };

  const templates = [
    {
      id: 'cocoa-profile',
      name: 'Cocoa Profile',
      accent: 'bg-amber-700',
      card: 'from-amber-900 to-amber-500',
      description: 'Warm brown profile layout with elegant heading strip.'
    },
    {
      id: 'olive-column',
      name: 'Olive Column',
      accent: 'bg-lime-700',
      card: 'from-lime-800 to-stone-300',
      description: 'Muted olive left panel with clean modern content blocks.'
    },
    {
      id: 'blush-creative',
      name: 'Blush Creative',
      accent: 'bg-rose-400',
      card: 'from-rose-200 to-zinc-200',
      description: 'Soft pink designer-style resume with image-forward look.'
    },
    {
      id: 'blue-power',
      name: 'Blue Power',
      accent: 'bg-blue-700',
      card: 'from-blue-900 to-blue-500',
      description: 'Bold corporate blue with strong section contrast.'
    },
    {
      id: 'midnight-gold',
      name: 'Midnight Gold',
      accent: 'bg-yellow-500',
      card: 'from-slate-900 to-slate-700',
      description: 'Luxury dark theme with premium gold highlights.'
    },
    {
      id: 'coral-split',
      name: 'Coral Split',
      accent: 'bg-orange-500',
      card: 'from-orange-500 to-rose-300',
      description: 'Creative split layout with warm coral tones.'
    },
    {
      id: 'forest-pro',
      name: 'Forest Pro',
      accent: 'bg-emerald-700',
      card: 'from-emerald-900 to-green-500',
      description: 'Elegant green profile for consulting and business roles.'
    },
    {
      id: 'aqua-grid',
      name: 'Aqua Grid',
      accent: 'bg-cyan-600',
      card: 'from-cyan-700 to-sky-300',
      description: 'Clean cyan visual blocks with modern alignment.'
    },
    {
      id: 'plum-studio',
      name: 'Plum Studio',
      accent: 'bg-fuchsia-700',
      card: 'from-fuchsia-800 to-purple-400',
      description: 'Stylish creative profile with rich plum tones.'
    },
    {
      id: 'sunset-creative',
      name: 'Sunset Creative',
      accent: 'bg-red-500',
      card: 'from-red-500 to-amber-300',
      description: 'Colorful sunset-inspired design for standout portfolios.'
    },
    {
      id: 'indigo-edge',
      name: 'Indigo Edge',
      accent: 'bg-indigo-700',
      card: 'from-indigo-900 to-indigo-400',
      description: 'Sharp indigo accents with polished professional styling.'
    },
    {
      id: 'graphite-clean',
      name: 'Graphite Clean',
      accent: 'bg-zinc-600',
      card: 'from-zinc-700 to-zinc-300',
      description: 'Minimal, neutral, and highly readable business format.'
    },
    {
      id: 'executive-sidebar',
      name: 'Executive Sidebar',
      accent: 'bg-amber-800',
      card: 'from-stone-700 to-stone-300',
      description: 'Left profile panel + dark top name banner like the sample CV.'
    },
    {
      id: 'modern-navy',
      name: 'Modern Navy',
      accent: 'bg-slate-800',
      card: 'from-slate-700 to-slate-500',
      description: 'Strong left sidebar with modern profile layout.'
    },
    {
      id: 'minimal-white',
      name: 'Minimal White',
      accent: 'bg-zinc-700',
      card: 'from-zinc-300 to-zinc-100',
      description: 'Clean single-column sections with elegant spacing.'
    },
    {
      id: 'royal-blue',
      name: 'Royal Blue',
      accent: 'bg-blue-700',
      card: 'from-blue-700 to-blue-400',
      description: 'Corporate blue style with clear section hierarchy.'
    },
    {
      id: 'charcoal',
      name: 'Charcoal Pro',
      accent: 'bg-neutral-800',
      card: 'from-neutral-700 to-neutral-400',
      description: 'Dark-highlight format for tech and product roles.'
    },
    {
      id: 'teal-clean',
      name: 'Teal Clean',
      accent: 'bg-teal-700',
      card: 'from-teal-700 to-teal-300',
      description: 'Fresh professional look with soft contrast.'
    },
    {
      id: 'mono-border',
      name: 'Mono Border',
      accent: 'bg-gray-700',
      card: 'from-gray-500 to-gray-200',
      description: 'Simple monochrome with structured dividers.'
    }
  ];

  const [form, setForm] = useState({
    fullName: '',
    role: '',
    profileImage: '',
    profileImageType: '',
    email: '',
    phone: '',
    address: '',
    summary: '',
    education: '',
    skills: '',
    experience: '',
    languages: '',
    references: '',
    projects: ''
  });
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [inspectTemplateId, setInspectTemplateId] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const [preview, setPreview] = useState(false);

  const getFieldClassName = (fieldKey) => {
    const hasError = Boolean(formErrors[fieldKey]);
    return `w-full border rounded px-3 py-2 ${hasError ? 'border-red-500 focus:outline-red-500' : 'border-gray-300'}`;
  };

  const validateForm = () => {
    const nextErrors = {};

    const fullName = String(form.fullName || '').trim();
    const role = String(form.role || '').trim();
    const email = String(form.email || '').trim();
    const phone = String(form.phone || '').trim();
    const summary = String(form.summary || '').trim();

    if (!fullName) {
      nextErrors.fullName = 'Full name is required.';
    } else if (fullName.length < 2) {
      nextErrors.fullName = 'Full name must be at least 2 characters.';
    }

    if (!role) {
      nextErrors.role = 'Job title / role is required.';
    } else if (role.length < 2) {
      nextErrors.role = 'Job title / role must be at least 2 characters.';
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = 'Enter a valid email address.';
    }

    if (phone && !/^[+]?[-()\d\s]{7,20}$/.test(phone)) {
      nextErrors.phone = 'Enter a valid phone number.';
    }

    if (summary.length > 600) {
      nextErrors.summary = 'Professional summary must be 600 characters or less.';
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const generatePreview = () => {
    if (validateForm()) {
      setPreview(true);
    }
  };

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFormErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const useExampleDetails = (options = { openPreview: true }) => {
    setForm((prev) => ({
      ...prev,
      ...sampleData,
      profileImage: sampleProfileImage,
      profileImageType: 'image/png'
    }));
    if (options.openPreview) {
      setPreview(true);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setFormErrors((prev) => ({
        ...prev,
        profileImage: 'Only JPG or PNG images are allowed.'
      }));
      return;
    }

    setFormErrors((prev) => {
      if (!prev.profileImage) return prev;
      const next = { ...prev };
      delete next.profileImage;
      return next;
    });

    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({
        ...prev,
        profileImage: String(reader.result || ''),
        profileImageType: file.type
      }));
    };
    reader.readAsDataURL(file);
  };

  const parseMultiItems = (value) =>
    String(value || '')
      .split(/\r?\n|,|;/)
      .map((item) => item.trim())
      .filter(Boolean);

  const multiItemsAsLines = (value) => {
    const items = parseMultiItems(value);
    if (items.length === 0) return '-';
    if (items.length === 1) return items[0];
    return items.map((item) => `- ${item}`).join('\n');
  };

  const languageItems = parseMultiItems(form.languages);

  const previewLines = (value) => {
    const items = parseMultiItems(value);
    return items.length ? items.join('\n') : '-';
  };

  const shouldUsePointForm = (value) => parseMultiItems(value).length > 1;

  const createCircularImageDataUrl = (source, size = 300) =>
    new Promise((resolve) => {
      if (!source) {
        resolve('');
        return;
      }

      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve('');
          return;
        }

        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        // Object-cover style fitting so image fills the circle without distortion.
        const scale = Math.max(size / image.width, size / image.height);
        const drawWidth = image.width * scale;
        const drawHeight = image.height * scale;
        const dx = (size - drawWidth) / 2;
        const dy = (size - drawHeight) / 2;

        ctx.drawImage(image, dx, dy, drawWidth, drawHeight);
        resolve(canvas.toDataURL('image/png'));
      };

      image.onerror = () => resolve('');
      image.src = source;
    });

  const templateClasses = useMemo(() => {
    if (selectedTemplate === 'minimal-white') {
      return {
        container: 'bg-white border-gray-300',
        name: 'text-gray-900',
        heading: 'text-gray-700 border-b border-gray-300'
      };
    }

    if (selectedTemplate === 'mono-border') {
      return {
        container: 'bg-white border-gray-200',
        name: 'text-black tracking-wide',
        heading: 'text-black uppercase text-sm'
      };
    }

    if (selectedTemplate === 'charcoal') {
      return {
        container: 'bg-gray-900 border-gray-700',
        name: 'text-white',
        heading: 'text-gray-200 border-b border-gray-700',
        body: 'text-gray-200',
        sub: 'text-gray-400'
      };
    }

    if (selectedTemplate === 'teal-clean') {
      return {
        container: 'bg-teal-50 border-teal-200',
        name: 'text-teal-900',
        heading: 'text-teal-800 border-b border-teal-200'
      };
    }

    if (selectedTemplate === 'royal-blue') {
      return {
        container: 'bg-blue-50 border-blue-200',
        name: 'text-blue-900',
        heading: 'text-blue-800 border-b border-blue-200'
      };
    }

    if (selectedTemplate === 'cocoa-profile') {
      return {
        container: 'bg-amber-50 border-amber-200',
        name: 'text-amber-900',
        heading: 'text-amber-800 border-b border-amber-300'
      };
    }

    if (selectedTemplate === 'olive-column') {
      return {
        container: 'bg-lime-50 border-lime-200',
        name: 'text-lime-900',
        heading: 'text-lime-800 border-b border-lime-300'
      };
    }

    if (selectedTemplate === 'blush-creative') {
      return {
        container: 'bg-rose-50 border-rose-200',
        name: 'text-rose-900',
        heading: 'text-rose-700 border-b border-rose-300'
      };
    }

    if (selectedTemplate === 'blue-power') {
      return {
        container: 'bg-blue-50 border-blue-300',
        name: 'text-blue-900',
        heading: 'text-blue-800 border-b border-blue-400'
      };
    }

    if (selectedTemplate === 'midnight-gold') {
      return {
        container: 'bg-slate-900 border-slate-700',
        name: 'text-yellow-300',
        heading: 'text-yellow-300 border-b border-yellow-500',
        body: 'text-slate-100',
        sub: 'text-slate-300'
      };
    }

    if (selectedTemplate === 'coral-split') {
      return {
        container: 'bg-orange-50 border-orange-200',
        name: 'text-orange-900',
        heading: 'text-orange-800 border-b border-orange-300'
      };
    }

    if (selectedTemplate === 'forest-pro') {
      return {
        container: 'bg-emerald-50 border-emerald-300',
        name: 'text-emerald-900',
        heading: 'text-emerald-800 border-b border-emerald-400'
      };
    }

    if (selectedTemplate === 'aqua-grid') {
      return {
        container: 'bg-cyan-50 border-cyan-300',
        name: 'text-cyan-900',
        heading: 'text-cyan-800 border-b border-cyan-400'
      };
    }

    if (selectedTemplate === 'plum-studio') {
      return {
        container: 'bg-fuchsia-50 border-fuchsia-200',
        name: 'text-fuchsia-900',
        heading: 'text-fuchsia-800 border-b border-fuchsia-300'
      };
    }

    if (selectedTemplate === 'sunset-creative') {
      return {
        container: 'bg-red-50 border-red-200',
        name: 'text-red-900',
        heading: 'text-red-700 border-b border-red-300'
      };
    }

    if (selectedTemplate === 'indigo-edge') {
      return {
        container: 'bg-indigo-50 border-indigo-300',
        name: 'text-indigo-900',
        heading: 'text-indigo-800 border-b border-indigo-400'
      };
    }

    if (selectedTemplate === 'graphite-clean') {
      return {
        container: 'bg-zinc-50 border-zinc-300',
        name: 'text-zinc-900',
        heading: 'text-zinc-800 border-b border-zinc-400'
      };
    }

    if (selectedTemplate === 'executive-sidebar') {
      return {
        container: 'bg-white border-stone-300',
        name: 'text-white',
        heading: 'text-zinc-800 border-b border-zinc-400'
      };
    }

    return {
      container: 'bg-slate-50 border-slate-200',
      name: 'text-slate-900',
      heading: 'text-slate-800 border-b border-slate-200'
    };
  }, [selectedTemplate]);

  const downloadPdf = async () => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 44;
    const contentWidth = pageWidth - margin * 2;
    const circularImage = await createCircularImageDataUrl(form.profileImage, 400);

    if (selectedTemplate === 'executive-sidebar') {
      const leftWidth = 160;
      const headerHeight = 62;
      const startX = 24;
      const startY = 24;

      doc.setFillColor(230, 226, 224);
      doc.rect(startX, startY, leftWidth, pageHeight - 48, 'F');

      doc.setFillColor(34, 29, 29);
      doc.rect(startX + leftWidth, startY + 10, pageWidth - startX - leftWidth - 24, headerHeight, 'F');

      doc.setFillColor(255, 255, 255);
      doc.circle(startX + leftWidth / 2, startY + 40, 42, 'F');
      doc.setFillColor(180, 170, 165);
      doc.circle(startX + leftWidth / 2, startY + 40, 37, 'F');

      if (circularImage) {
        try {
          doc.addImage(circularImage, 'PNG', startX + leftWidth / 2 - 37, startY + 3, 74, 74);
        } catch (error) {
          // Ignore image rendering failure and continue PDF generation
        }
      }

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(21);
      doc.text(form.fullName || 'Your Name', startX + leftWidth + 16, startY + 44);
      doc.setFontSize(12);
      doc.text(form.role || 'Professional Title', startX + leftWidth + 16, startY + 62);

      const leftX = startX + 12;
      let leftY = startY + 100;

      const addLeftSection = (title, content) => {
        doc.setTextColor(40, 40, 40);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text(title, leftX, leftY);
        leftY += 10;
        doc.setDrawColor(150, 145, 140);
        doc.line(leftX, leftY, startX + leftWidth - 12, leftY);
        leftY += 12;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        const lines = doc.splitTextToSize(content || '-', leftWidth - 24);
        doc.text(lines, leftX, leftY);
        leftY += lines.length * 11 + 10;
      };

      addLeftSection('CONTACT', [form.email, form.phone, form.address].filter(Boolean).join('\n'));
      addLeftSection('EDUCATION', multiItemsAsLines(form.education));
      addLeftSection('SKILLS', multiItemsAsLines(form.skills));
      if (languageItems.length > 0) {
        addLeftSection('LANGUAGE', multiItemsAsLines(form.languages));
      }

      const rightX = startX + leftWidth + 16;
      const rightWidth = pageWidth - rightX - 24;
      let rightY = startY + 100;

      const addRightSection = (title, content) => {
        doc.setTextColor(35, 35, 35);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text(title, rightX, rightY);
        rightY += 10;
        doc.setDrawColor(130, 130, 130);
        doc.line(rightX, rightY, rightX + rightWidth, rightY);
        rightY += 14;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        const lines = doc.splitTextToSize(content || '-', rightWidth);
        doc.text(lines, rightX, rightY);
        rightY += lines.length * 12 + 14;
      };

      addRightSection('ABOUT ME', form.summary);
      addRightSection('WORK EXPERIENCE', multiItemsAsLines(form.experience));
      addRightSection('PROJECTS', multiItemsAsLines(form.projects));
      addRightSection('REFERENCES', multiItemsAsLines(form.references));

      const safeName = (form.fullName || 'cv').trim().replace(/\s+/g, '_').toLowerCase();
      doc.save(`${safeName}_executive_sidebar.pdf`);
      return;
    }

    const getColor = () => {
      if (selectedTemplate === 'minimal-white') return [60, 60, 60];
      if (selectedTemplate === 'mono-border') return [0, 0, 0];
      if (selectedTemplate === 'charcoal') return [35, 35, 35];
      if (selectedTemplate === 'teal-clean') return [13, 110, 99];
      if (selectedTemplate === 'royal-blue') return [29, 78, 216];
      if (selectedTemplate === 'executive-sidebar') return [40, 35, 30];
      if (selectedTemplate === 'cocoa-profile') return [120, 53, 15];
      if (selectedTemplate === 'olive-column') return [77, 124, 15];
      if (selectedTemplate === 'blush-creative') return [190, 96, 120];
      if (selectedTemplate === 'blue-power') return [30, 58, 138];
      if (selectedTemplate === 'midnight-gold') return [234, 179, 8];
      if (selectedTemplate === 'coral-split') return [234, 88, 12];
      if (selectedTemplate === 'forest-pro') return [6, 95, 70];
      if (selectedTemplate === 'aqua-grid') return [8, 145, 178];
      if (selectedTemplate === 'plum-studio') return [162, 28, 175];
      if (selectedTemplate === 'sunset-creative') return [220, 38, 38];
      if (selectedTemplate === 'indigo-edge') return [67, 56, 202];
      if (selectedTemplate === 'graphite-clean') return [82, 82, 91];
      return [30, 64, 175];
    };

    const titleColor = getColor();
    let y = 56;

    doc.setTextColor(...titleColor);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text(form.fullName || 'Your Name', margin, y);

    if (circularImage) {
      try {
        doc.addImage(circularImage, 'PNG', pageWidth - margin - 62, 26, 52, 52);
      } catch (error) {
        // Ignore image rendering failure and continue PDF generation
      }
    }

    y += 20;
    doc.setTextColor(90, 90, 90);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.text(form.role || 'Professional Title', margin, y);

    y += 18;
    doc.setTextColor(90, 90, 90);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    const contactLine = [form.email, form.phone, form.address].filter(Boolean).join(' | ');
    doc.text(contactLine || 'Email | Phone', margin, y);

    y += 24;

    const addSection = (title, content) => {
      doc.setTextColor(...titleColor);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text(title, margin, y);
      y += 12;

      doc.setDrawColor(200, 200, 200);
      doc.line(margin, y, margin + contentWidth, y);
      y += 16;

      doc.setTextColor(40, 40, 40);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      const text = content || '-';
      const lines = doc.splitTextToSize(text, contentWidth);
      doc.text(lines, margin, y);
      y += lines.length * 14 + 14;
    };

    addSection('Professional Summary', form.summary);
    addSection('Education', multiItemsAsLines(form.education));
    addSection('Skills', multiItemsAsLines(form.skills));
    addSection('Work Experience', multiItemsAsLines(form.experience));
    addSection('Languages', multiItemsAsLines(form.languages));
    addSection('References', multiItemsAsLines(form.references));
    addSection('Projects', multiItemsAsLines(form.projects));

    const safeName = (form.fullName || 'cv').trim().replace(/\s+/g, '_').toLowerCase();
    doc.save(`${safeName}_${selectedTemplate || 'template'}.pdf`);
  };

  const TemplatePreviewCard = ({ template }) => (
    <div className="rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="h-52 overflow-hidden bg-gray-100">
        <div className="origin-top-left scale-[0.36] w-[278%] pointer-events-none">
          <LargeTemplatePreview template={template} />
        </div>
      </div>
      <div className="p-3">
        <div className="flex items-center gap-2 mb-1">
          <span className={`w-3 h-3 rounded-full ${template.accent}`} />
          <p className="font-semibold text-gray-900">{template.name}</p>
        </div>
        <p className="text-xs text-gray-600">{template.description}</p>
      </div>
    </div>
  );

  const LargeTemplatePreview = ({ template }) => {
    if (!template) return null;

    if (template.id === 'blue-power') {
      return (
        <div className="h-[420px] rounded-xl overflow-hidden border border-gray-200 bg-[#17306d]">
          <div className="h-1/3 bg-[#2a4d96] p-6 flex items-center gap-5">
            <img src={sampleProfileImage} alt="Sample" className="w-24 h-24 rounded-full object-cover border-4 border-[#d7e24a]" />
            <div className="flex-1 space-y-2">
              <p className="text-3xl font-bold text-[#e5ecff] leading-none">DANI</p>
              <p className="text-xl font-bold text-[#d7e24a] leading-none">MARTINEZ</p>
              <p className="text-[#9db2e4] text-sm">Business Manager</p>
            </div>
          </div>
          <div className="h-2/3 p-5 grid grid-cols-2 gap-4 bg-[#16295d]">
            <div className="rounded bg-[#1f3a80] p-3 space-y-2">
              <p className="text-[#d7e24a] text-xs font-bold">EDUCATION</p>
              <p className="text-[#c9d8ff] text-xs">MBA - 2020</p>
              <p className="text-[#8ca5de] text-xs">University of Colombo</p>
            </div>
            <div className="rounded bg-[#294996] p-3 space-y-2">
              <p className="text-[#d7e24a] text-xs font-bold">EXPERIENCE</p>
              <p className="text-[#d6e2ff] text-xs">Senior Manager - 2023</p>
              <p className="text-[#a3b8e8] text-xs">Lead Growth Campaigns</p>
            </div>
          </div>
        </div>
      );
    }

    if (template.id === 'executive-sidebar') {
      return (
        <div className="h-[420px] rounded-xl overflow-hidden border border-stone-300 bg-white grid grid-cols-[160px_1fr]">
          <div className="bg-stone-200 p-3 pt-20 relative">
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full border-4 border-white overflow-hidden">
              <img src={sampleProfileImage} alt="Sample" className="w-full h-full object-cover" />
            </div>
            <p className="text-xs font-bold text-zinc-700 border-b border-zinc-500 pb-1 mb-1">CONTACT</p>
            <p className="text-[10px] text-zinc-700">hello@email.com</p>
            <p className="text-[10px] text-zinc-700">+94 77 123 4567</p>
            <p className="text-xs font-bold text-zinc-700 border-b border-zinc-500 pb-1 mb-1 mt-3">SKILLS</p>
            <p className="text-[10px] text-zinc-700">Communication</p>
            <p className="text-[10px] text-zinc-700">Leadership</p>
          </div>
          <div>
            <div className="bg-zinc-900 text-white px-4 py-3">
              <p className="text-2xl font-bold">DONNA STROUPE</p>
              <p className="text-sm text-zinc-200">Sales Representative</p>
            </div>
            <div className="p-4">
              <p className="text-sm font-bold border-b border-zinc-400 pb-1 mb-1">ABOUT ME</p>
              <p className="text-xs text-zinc-700 mb-3">Creative and client-focused profile with sales and communication strengths.</p>
              <p className="text-sm font-bold border-b border-zinc-400 pb-1 mb-1">WORK EXPERIENCE</p>
              <p className="text-xs text-zinc-700">Marketing Executive (2023)</p>
              <p className="text-xs text-zinc-700">Sales Intern (2022)</p>
            </div>
          </div>
        </div>
      );
    }

    if (['cocoa-profile', 'olive-column', 'forest-pro', 'teal-clean'].includes(template.id)) {
      return (
        <div className={`h-[420px] rounded-xl overflow-hidden border border-gray-200 bg-gradient-to-br ${template.card}`}>
          <div className="h-full grid grid-cols-[170px_1fr] bg-white/92">
            <div className="p-4 border-r border-gray-200 bg-black/5">
              <img src={sampleProfileImage} alt="Sample" className="w-20 h-20 rounded-full object-cover border-4 border-white shadow mx-auto" />
              <p className="text-[11px] font-bold mt-3 mb-1 text-gray-800">CONTACT</p>
              <p className="text-[10px] text-gray-600 truncate">{sampleData.email}</p>
              <p className="text-[10px] text-gray-600">{sampleData.phone}</p>
              <p className="text-[11px] font-bold mt-3 mb-1 text-gray-800">SKILLS</p>
              <p className="text-[10px] text-gray-700">Communication</p>
              <p className="text-[10px] text-gray-700">Leadership</p>
            </div>
            <div>
              <div className="px-4 py-3 border-b border-gray-200 bg-white/70">
                <p className="text-2xl font-bold text-gray-800 leading-none">{sampleData.fullName.toUpperCase()}</p>
                <p className="text-sm text-gray-600 mt-1">{sampleData.role}</p>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <p className="text-xs font-bold text-gray-800 border-b border-gray-300 pb-1 mb-1">ABOUT ME</p>
                  <p className="text-[10px] text-gray-600">{sampleData.summary}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800 border-b border-gray-300 pb-1 mb-1">EXPERIENCE</p>
                  <p className="text-[10px] text-gray-700">Marketing Executive - 2024</p>
                  <p className="text-[10px] text-gray-700">Sales Intern - 2022</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (['blush-creative', 'sunset-creative', 'plum-studio'].includes(template.id)) {
      return (
        <div className={`h-[420px] rounded-xl overflow-hidden border border-gray-200 bg-gradient-to-br ${template.card} p-5`}>
          <div className="h-full bg-white/90 rounded-lg grid grid-cols-[220px_1fr] overflow-hidden">
            <div className="p-4 bg-white/40 border-r border-white/60">
              <div className="w-36 h-36 mx-auto rounded-md overflow-hidden border-4 border-white shadow">
                <img src={sampleProfileImage} alt="Sample" className="w-full h-full object-cover" />
              </div>
              <p className="text-xs font-bold mt-4 text-gray-700">ABOUT ME</p>
              <p className="text-[10px] text-gray-600 mt-1">Creative profile focused on design and communication.</p>
            </div>
            <div className="p-5">
              <p className="text-4xl font-light text-gray-800 tracking-wide">{sampleData.fullName.split(' ')[0]}</p>
              <p className="text-3xl font-bold text-gray-900 -mt-1">{sampleData.fullName.split(' ').slice(1).join(' ')}</p>
              <p className="text-xs tracking-[0.35em] text-gray-600 mt-1">{sampleData.role.toUpperCase()}</p>
              <div className="mt-5 space-y-3">
                <div>
                  <p className="text-xs font-bold text-gray-800 border-b border-gray-300 pb-1 mb-1">WORK EXPERIENCE</p>
                  <p className="text-[10px] text-gray-700">Design Team Lead - Wardiere Inc.</p>
                  <p className="text-[10px] text-gray-700">Senior Marketing Executive - 2023</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800 border-b border-gray-300 pb-1 mb-1">EDUCATION</p>
                  <p className="text-[10px] text-gray-700">Bachelor in Design</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (['midnight-gold', 'charcoal', 'graphite-clean'].includes(template.id)) {
      return (
        <div className={`h-[420px] rounded-xl overflow-hidden border border-gray-200 bg-gradient-to-br ${template.card}`}>
          <div className="h-full grid grid-cols-[250px_1fr] bg-[#2d2f35]">
            <div className="p-5 text-white border-r border-white/20">
              <img src={sampleProfileImage} alt="Sample" className="w-24 h-24 rounded-full object-cover border-4 border-yellow-200/70 mx-auto" />
              <p className="text-sm font-semibold mt-4">Contact</p>
              <p className="text-xs text-gray-300 mt-1">{sampleData.phone}</p>
              <p className="text-sm font-semibold mt-4">Education</p>
              <p className="text-xs text-gray-300 mt-1">MBA, University of Colombo</p>
            </div>
            <div className="bg-[#f3f4f6] p-5">
              <p className="text-4xl font-semibold text-gray-800">Daniel Gallego</p>
              <p className="text-xs text-gray-500 tracking-[0.2em]">MARKETING MANAGER</p>
              <div className="mt-4 space-y-3">
                <div>
                  <p className="text-sm font-bold text-gray-800 border-b border-gray-300 pb-1 mb-1">Experience</p>
                  <p className="text-xs text-gray-700">Developed campaigns that increased engagement by 40%.</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800 border-b border-gray-300 pb-1 mb-1">Skills</p>
                  <p className="text-xs text-gray-700">Leadership, SEO, Public Speaking, Data Analysis</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (['royal-blue', 'indigo-edge', 'aqua-grid', 'modern-navy'].includes(template.id)) {
      return (
        <div className={`h-[420px] rounded-xl overflow-hidden border border-gray-200 bg-gradient-to-br ${template.card} p-4`}>
          <div className="h-full bg-white/90 rounded-lg overflow-hidden">
            <div className="h-20 bg-slate-800/90 text-white px-4 flex items-center justify-between">
              <div>
                <p className="text-xl font-bold">{sampleData.fullName}</p>
                <p className="text-xs text-slate-200">{sampleData.role}</p>
              </div>
              <img src={sampleProfileImage} alt="Sample" className="w-12 h-12 rounded-full object-cover border-2 border-white" />
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              <div className="rounded bg-slate-100 p-2">
                <p className="text-xs font-bold text-slate-700">CONTACT</p>
                <p className="text-[10px] text-slate-600 truncate">{sampleData.email}</p>
                <p className="text-[10px] text-slate-600">{sampleData.phone}</p>
              </div>
              <div className="rounded bg-slate-100 p-2">
                <p className="text-xs font-bold text-slate-700">PROFILE</p>
                <p className="text-[10px] text-slate-600">Creative and data-driven manager.</p>
              </div>
              <div className="rounded bg-slate-100 p-2 col-span-2">
                <p className="text-xs font-bold text-slate-700">EXPERIENCE</p>
                <p className="text-[10px] text-slate-600">Marketing Executive - 2024</p>
                <p className="text-[10px] text-slate-600">Sales Intern - 2022</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={`h-[420px] rounded-xl overflow-hidden border border-gray-200 bg-gradient-to-br ${template.card} p-5`}>
        <div className="h-full bg-white/90 rounded-lg overflow-hidden">
          <div className="h-1/4 border-b border-gray-200 p-4 flex items-center gap-4">
            <img src={sampleProfileImage} alt="Sample" className="w-16 h-16 rounded-full object-cover" />
            <div className="flex-1 space-y-2">
              <p className="text-lg font-bold text-gray-700">{sampleData.fullName}</p>
              <p className="text-sm text-gray-500">{sampleData.role}</p>
            </div>
          </div>
          <div className="h-3/4 grid grid-cols-[140px_1fr]">
            <div className="bg-gray-100 border-r border-gray-200 p-3">
              <p className="text-xs font-bold text-gray-700 mb-1">CONTACT</p>
              <p className="text-[10px] text-gray-600 truncate">{sampleData.email}</p>
              <p className="text-[10px] text-gray-600 mb-2">{sampleData.phone}</p>
              <p className="text-xs font-bold text-gray-700 mb-1">SKILLS</p>
              <p className="text-[10px] text-gray-600">Communication</p>
              <p className="text-[10px] text-gray-600">Leadership</p>
            </div>
            <div className="p-4">
              <p className="text-xs font-bold text-gray-700 border-b border-gray-300 pb-1 mb-1">ABOUT ME</p>
              <p className="text-[10px] text-gray-600 mb-2">{sampleData.summary}</p>
              <p className="text-xs font-bold text-gray-700 border-b border-gray-300 pb-1 mb-1">EXPERIENCE</p>
              <p className="text-[10px] text-gray-600">Marketing Executive (2024)</p>
              <p className="text-[10px] text-gray-600">Sales Intern (2022)</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {!selectedTemplate ? (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Choose a CV Template</h1>
            <p className="text-gray-600 mb-6">
              Select a template to continue. After choosing, you can fill your details and download as PDF.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {templates.map((template) => (
                <button
                  type="button"
                  key={template.id}
                  onClick={() => setInspectTemplateId(template.id)}
                  className="text-left"
                >
                  <TemplatePreviewCard template={template} />
                </button>
              ))}
            </div>

            {inspectTemplateId ? (
              <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                <div className="w-full max-w-4xl bg-white rounded-xl shadow-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{templates.find((t) => t.id === inspectTemplateId)?.name}</h2>
                      <p className="text-sm text-gray-600">{templates.find((t) => t.id === inspectTemplateId)?.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setInspectTemplateId(null)}
                      className="px-3 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Close
                    </button>
                  </div>

                  <LargeTemplatePreview template={templates.find((t) => t.id === inspectTemplateId)} />

                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTemplate(inspectTemplateId);
                        setInspectTemplateId(null);
                        useExampleDetails({ openPreview: true });
                      }}
                      className="mr-3 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
                    >
                      Use With Example Data
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTemplate(inspectTemplateId);
                        setInspectTemplateId(null);
                        setPreview(false);
                      }}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                    >
                      Use This Template
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h1 className="text-3xl font-bold text-gray-900">CV Details</h1>
                <button
                  type="button"
                  onClick={() => setSelectedTemplate(null)}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-semibold"
                >
                  Change Template
                </button>
              </div>

              <p className="text-sm text-gray-600">
                Selected Template: <span className="font-semibold text-gray-800">{templates.find((t) => t.id === selectedTemplate)?.name}</span>
              </p>

              <div>
                <button
                  type="button"
                  onClick={useExampleDetails}
                  className="text-sm px-3 py-2 rounded-lg border border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                >
                  Use Example Details
                </button>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                <input type="text" value={form.fullName} onChange={(e) => updateField('fullName', e.target.value)} placeholder="Enter full name" className={getFieldClassName('fullName')} />
                {formErrors.fullName ? <p className="text-xs text-red-600 mt-1">{formErrors.fullName}</p> : null}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Job Title / Role</label>
                <input type="text" value={form.role} onChange={(e) => updateField('role', e.target.value)} placeholder="Enter job title" className={getFieldClassName('role')} />
                {formErrors.role ? <p className="text-xs text-red-600 mt-1">{formErrors.role}</p> : null}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Profile Picture (JPG or PNG)</label>
                <input
                  type="file"
                  accept="image/png, image/jpeg"
                  onChange={handleImageUpload}
                  className={getFieldClassName('profileImage') + ' bg-white'}
                />
                {formErrors.profileImage ? <p className="text-xs text-red-600 mt-1">{formErrors.profileImage}</p> : null}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                <input type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} placeholder="Enter email" className={getFieldClassName('email')} />
                {formErrors.email ? <p className="text-xs text-red-600 mt-1">{formErrors.email}</p> : null}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
                <input type="text" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder="Enter phone number" className={getFieldClassName('phone')} />
                {formErrors.phone ? <p className="text-xs text-red-600 mt-1">{formErrors.phone}</p> : null}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Address</label>
                <input type="text" value={form.address} onChange={(e) => updateField('address', e.target.value)} placeholder="Enter address" className="w-full border border-gray-300 rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Professional Summary</label>
                <textarea rows={3} value={form.summary} onChange={(e) => updateField('summary', e.target.value)} placeholder="Write a short summary" className={getFieldClassName('summary')} />
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-gray-500">Max 600 characters</p>
                  <p className="text-xs text-gray-500">{String(form.summary || '').length}/600</p>
                </div>
                {formErrors.summary ? <p className="text-xs text-red-600 mt-1">{formErrors.summary}</p> : null}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Education</label>
                <textarea rows={3} value={form.education} onChange={(e) => updateField('education', e.target.value)} placeholder="Add education details (one item per line)" className="w-full border border-gray-300 rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Skills (comma separated)</label>
                <textarea rows={3} value={form.skills} onChange={(e) => updateField('skills', e.target.value)} placeholder="e.g. Communication, Negotiation or one per line" className="w-full border border-gray-300 rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Work Experience</label>
                <textarea rows={4} value={form.experience} onChange={(e) => updateField('experience', e.target.value)} placeholder="Add work experience (one item per line)" className="w-full border border-gray-300 rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Languages</label>
                <textarea rows={2} value={form.languages} onChange={(e) => updateField('languages', e.target.value)} placeholder="e.g. English, French or one per line" className="w-full border border-gray-300 rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">References</label>
                <textarea rows={2} value={form.references} onChange={(e) => updateField('references', e.target.value)} placeholder="Add references (one item per line)" className="w-full border border-gray-300 rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Projects</label>
                <textarea rows={4} value={form.projects} onChange={(e) => updateField('projects', e.target.value)} placeholder="Add projects (one item per line)" className="w-full border border-gray-300 rounded px-3 py-2" />
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={generatePreview}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                >
                  Generate CV Preview
                </button>

                {preview ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowSaveModal(true)}
                      className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
                    >
                      Save CV
                    </button>
                    <button
                      type="button"
                      onClick={downloadPdf}
                      className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-black"
                    >
                      Download PDF
                    </button>
                  </>
                ) : null}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Preview</h2>
              {!preview ? (
                <p className="text-gray-500">Fill your details and click "Generate CV Preview".</p>
              ) : (
                selectedTemplate === 'executive-sidebar' ? (
                  <div className="border border-stone-300 bg-white overflow-hidden">
                    <div className="grid grid-cols-[170px_1fr] min-h-[680px]">
                      <div className="bg-stone-200 p-4 pt-28 relative">
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-28 h-28 rounded-full border-4 border-white bg-stone-400 shadow overflow-hidden">
                          {form.profileImage ? (
                            <img src={form.profileImage} alt="Profile" className="w-full h-full object-cover" />
                          ) : null}
                        </div>

                        <div className="mb-5">
                          <h4 className="text-sm font-bold tracking-wide text-zinc-800 border-b border-zinc-500 pb-1 mb-2">CONTACT</h4>
                          <p className="text-xs text-zinc-700 break-words">{form.email || '-'}</p>
                          <p className="text-xs text-zinc-700 mt-1">{form.phone || '-'}</p>
                          <p className="text-xs text-zinc-700 mt-1 whitespace-pre-wrap">{form.address || '-'}</p>
                        </div>

                        <div className="mb-5">
                          <h4 className="text-sm font-bold tracking-wide text-zinc-800 border-b border-zinc-500 pb-1 mb-2">EDUCATION</h4>
                          {shouldUsePointForm(form.education) ? (
                            <ul className="text-xs text-zinc-700 list-disc pl-4 space-y-1">
                              {parseMultiItems(form.education).map((item) => <li key={item}>{item}</li>)}
                            </ul>
                          ) : (
                            <p className="text-xs text-zinc-700 whitespace-pre-wrap">{previewLines(form.education)}</p>
                          )}
                        </div>

                        <div className="mb-5">
                          <h4 className="text-sm font-bold tracking-wide text-zinc-800 border-b border-zinc-500 pb-1 mb-2">SKILLS</h4>
                          {shouldUsePointForm(form.skills) ? (
                            <ul className="text-xs text-zinc-700 list-disc pl-4 space-y-1">
                              {parseMultiItems(form.skills).map((item) => <li key={item}>{item}</li>)}
                            </ul>
                          ) : (
                            <p className="text-xs text-zinc-700 whitespace-pre-wrap">{previewLines(form.skills)}</p>
                          )}
                        </div>

                        {languageItems.length > 0 ? (
                          <div>
                            <h4 className="text-sm font-bold tracking-wide text-zinc-800 border-b border-zinc-500 pb-1 mb-2">LANGUAGE</h4>
                            {shouldUsePointForm(form.languages) ? (
                              <ul className="text-xs text-zinc-700 list-disc pl-4 space-y-1">
                                {parseMultiItems(form.languages).map((item) => <li key={item}>{item}</li>)}
                              </ul>
                            ) : (
                              <p className="text-xs text-zinc-700 whitespace-pre-wrap">{previewLines(form.languages)}</p>
                            )}
                          </div>
                        ) : null}
                      </div>

                      <div className="bg-white">
                        <div className="bg-zinc-900 text-white px-6 py-5 min-h-[100px] flex flex-col justify-center">
                          <h3 className="text-4xl font-bold tracking-wide leading-none">{form.fullName || 'YOUR NAME'}</h3>
                          <p className="text-base mt-2 text-zinc-200">{form.role || 'Professional Title'}</p>
                        </div>

                        <div className="p-6 space-y-6">
                          <div>
                            <h4 className="font-semibold text-xl text-zinc-800 border-b border-zinc-400 pb-1 mb-2">About Me</h4>
                            <p className="text-sm text-zinc-700 whitespace-pre-wrap">{form.summary || '-'}</p>
                          </div>

                          <div>
                            <h4 className="font-semibold text-xl text-zinc-800 border-b border-zinc-400 pb-1 mb-2">Work Experience</h4>
                            {shouldUsePointForm(form.experience) ? (
                              <ul className="text-sm text-zinc-700 list-disc pl-5 space-y-1">
                                {parseMultiItems(form.experience).map((item) => <li key={item}>{item}</li>)}
                              </ul>
                            ) : (
                              <p className="text-sm text-zinc-700 whitespace-pre-wrap">{previewLines(form.experience)}</p>
                            )}
                          </div>

                          <div>
                            <h4 className="font-semibold text-xl text-zinc-800 border-b border-zinc-400 pb-1 mb-2">Projects</h4>
                            {shouldUsePointForm(form.projects) ? (
                              <ul className="text-sm text-zinc-700 list-disc pl-5 space-y-1">
                                {parseMultiItems(form.projects).map((item) => <li key={item}>{item}</li>)}
                              </ul>
                            ) : (
                              <p className="text-sm text-zinc-700 whitespace-pre-wrap">{previewLines(form.projects)}</p>
                            )}
                          </div>

                          <div>
                            <h4 className="font-semibold text-xl text-zinc-800 border-b border-zinc-400 pb-1 mb-2">References</h4>
                            {shouldUsePointForm(form.references) ? (
                              <ul className="text-sm text-zinc-700 list-disc pl-5 space-y-1">
                                {parseMultiItems(form.references).map((item) => <li key={item}>{item}</li>)}
                              </ul>
                            ) : (
                              <p className="text-sm text-zinc-700 whitespace-pre-wrap">{previewLines(form.references)}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={`space-y-3 border rounded-lg p-4 ${templateClasses.container}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className={`text-xl font-bold ${templateClasses.name}`}>{form.fullName || 'Your Name'}</h3>
                        <p className={`text-sm font-medium ${templateClasses.sub || 'text-gray-600'}`}>{form.role || 'Professional Title'}</p>
                        <p className={`text-sm ${templateClasses.sub || 'text-gray-600'}`}>{form.email} {form.phone ? `• ${form.phone}` : ''}</p>
                        {form.address ? <p className={`text-sm ${templateClasses.sub || 'text-gray-600'} whitespace-pre-wrap`}>{form.address}</p> : null}
                      </div>
                      {form.profileImage ? (
                        <img src={form.profileImage} alt="Profile" className="w-16 h-16 rounded-full object-cover border border-gray-300" />
                      ) : null}
                    </div>

                    <div>
                      <h4 className={`font-semibold pb-1 mb-1 ${templateClasses.heading}`}>Summary</h4>
                      <p className={`${templateClasses.body || 'text-gray-700'} whitespace-pre-wrap`}>{form.summary || '-'}</p>
                    </div>

                    <div>
                      <h4 className={`font-semibold pb-1 mb-1 ${templateClasses.heading}`}>Education</h4>
                      {shouldUsePointForm(form.education) ? (
                        <ul className={`${templateClasses.body || 'text-gray-700'} list-disc pl-5 space-y-1`}>
                          {parseMultiItems(form.education).map((item) => <li key={item}>{item}</li>)}
                        </ul>
                      ) : (
                        <p className={`${templateClasses.body || 'text-gray-700'} whitespace-pre-wrap`}>{previewLines(form.education)}</p>
                      )}
                    </div>

                    <div>
                      <h4 className={`font-semibold pb-1 mb-1 ${templateClasses.heading}`}>Skills</h4>
                      {shouldUsePointForm(form.skills) ? (
                        <ul className={`${templateClasses.body || 'text-gray-700'} list-disc pl-5 space-y-1`}>
                          {parseMultiItems(form.skills).map((item) => <li key={item}>{item}</li>)}
                        </ul>
                      ) : (
                        <p className={`${templateClasses.body || 'text-gray-700'} whitespace-pre-wrap`}>{previewLines(form.skills)}</p>
                      )}
                    </div>

                    <div>
                      <h4 className={`font-semibold pb-1 mb-1 ${templateClasses.heading}`}>Work Experience</h4>
                      {shouldUsePointForm(form.experience) ? (
                        <ul className={`${templateClasses.body || 'text-gray-700'} list-disc pl-5 space-y-1`}>
                          {parseMultiItems(form.experience).map((item) => <li key={item}>{item}</li>)}
                        </ul>
                      ) : (
                        <p className={`${templateClasses.body || 'text-gray-700'} whitespace-pre-wrap`}>{previewLines(form.experience)}</p>
                      )}
                    </div>

                    <div>
                      <h4 className={`font-semibold pb-1 mb-1 ${templateClasses.heading}`}>Languages</h4>
                      {shouldUsePointForm(form.languages) ? (
                        <ul className={`${templateClasses.body || 'text-gray-700'} list-disc pl-5 space-y-1`}>
                          {parseMultiItems(form.languages).map((item) => <li key={item}>{item}</li>)}
                        </ul>
                      ) : (
                        <p className={`${templateClasses.body || 'text-gray-700'} whitespace-pre-wrap`}>{previewLines(form.languages)}</p>
                      )}
                    </div>

                    <div>
                      <h4 className={`font-semibold pb-1 mb-1 ${templateClasses.heading}`}>References</h4>
                      {shouldUsePointForm(form.references) ? (
                        <ul className={`${templateClasses.body || 'text-gray-700'} list-disc pl-5 space-y-1`}>
                          {parseMultiItems(form.references).map((item) => <li key={item}>{item}</li>)}
                        </ul>
                      ) : (
                        <p className={`${templateClasses.body || 'text-gray-700'} whitespace-pre-wrap`}>{previewLines(form.references)}</p>
                      )}
                    </div>

                    <div>
                      <h4 className={`font-semibold pb-1 mb-1 ${templateClasses.heading}`}>Projects</h4>
                      {shouldUsePointForm(form.projects) ? (
                        <ul className={`${templateClasses.body || 'text-gray-700'} list-disc pl-5 space-y-1`}>
                          {parseMultiItems(form.projects).map((item) => <li key={item}>{item}</li>)}
                        </ul>
                      ) : (
                        <p className={`${templateClasses.body || 'text-gray-700'} whitespace-pre-wrap`}>{previewLines(form.projects)}</p>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* Saved CVs Section */}
        {selectedTemplate && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">My Saved CVs</h2>
            {loadingCVs ? (
              <p className="text-gray-500">Loading saved CVs...</p>
            ) : savedCVs.length === 0 ? (
              <p className="text-gray-500">No saved CVs yet. Create and save your first CV!</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedCVs.map((cv) => (
                  <div key={cv._id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-2">{cv.name}</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Saved on {new Date(cv.createdAt).toLocaleDateString()}
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => loadCV(cv)}
                        className="flex-1 bg-indigo-600 text-white px-3 py-2 rounded text-sm hover:bg-indigo-700"
                      >
                        Load
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteCV(cv._id)}
                        className="bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Save Modal */}
        {showSaveModal && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Save CV</h2>
              <p className="text-gray-600 mb-4">Give your CV a name to save it for later.</p>
              <input
                type="text"
                value={cvName}
                onChange={(e) => setCvName(e.target.value)}
                placeholder="e.g., Marketing Manager CV, Job Application"
                className="w-full border border-gray-300 rounded px-3 py-2 mb-4 text-gray-900 placeholder-gray-500"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowSaveModal(false);
                    setCvName('');
                  }}
                  className="flex-1 px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveCV}
                  disabled={savingCV}
                  className="flex-1 px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-gray-400"
                >
                  {savingCV ? 'Saving...' : 'Save CV'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CVGenerator;
