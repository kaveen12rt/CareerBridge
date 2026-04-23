import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { jsPDF } from 'jspdf';

// ─── Premium template ids ────────────────────────────────────────────────────
const PREMIUM_IDS = new Set([
  'obsidian-luxury',
  'aurora-gradient',
  'crimson-editorial',
  'sage-minimal',
  'noir-typeset',
]);

const CVGenerator = () => {
  const sampleProfileImage = '/images/cv-example-man.svg';
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

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

  // ─── Free templates ──────────────────────────────────────────────────────
  const freeTemplates = [
    { id: 'cocoa-profile',    name: 'Cocoa Profile',    accent: 'bg-amber-700',    card: 'from-amber-900 to-amber-500',    description: 'Warm brown profile layout with elegant heading strip.' },
    { id: 'olive-column',     name: 'Olive Column',     accent: 'bg-lime-700',     card: 'from-lime-800 to-stone-300',     description: 'Muted olive left panel with clean modern content blocks.' },
    { id: 'blush-creative',   name: 'Blush Creative',   accent: 'bg-rose-400',     card: 'from-rose-200 to-zinc-200',      description: 'Soft pink designer-style resume with image-forward look.' },
    { id: 'blue-power',       name: 'Blue Power',       accent: 'bg-blue-700',     card: 'from-blue-900 to-blue-500',      description: 'Bold corporate blue with strong section contrast.' },
    { id: 'midnight-gold',    name: 'Midnight Gold',    accent: 'bg-yellow-500',   card: 'from-slate-900 to-slate-700',    description: 'Luxury dark theme with premium gold highlights.' },
    { id: 'coral-split',      name: 'Coral Split',      accent: 'bg-orange-500',   card: 'from-orange-500 to-rose-300',    description: 'Creative split layout with warm coral tones.' },
    { id: 'forest-pro',       name: 'Forest Pro',       accent: 'bg-emerald-700',  card: 'from-emerald-900 to-green-500',  description: 'Elegant green profile for consulting and business roles.' },
    { id: 'aqua-grid',        name: 'Aqua Grid',        accent: 'bg-cyan-600',     card: 'from-cyan-700 to-sky-300',       description: 'Clean cyan visual blocks with modern alignment.' },
    { id: 'plum-studio',      name: 'Plum Studio',      accent: 'bg-fuchsia-700',  card: 'from-fuchsia-800 to-purple-400', description: 'Stylish creative profile with rich plum tones.' },
    { id: 'sunset-creative',  name: 'Sunset Creative',  accent: 'bg-red-500',      card: 'from-red-500 to-amber-300',      description: 'Colorful sunset-inspired design for standout portfolios.' },
    { id: 'indigo-edge',      name: 'Indigo Edge',      accent: 'bg-indigo-700',   card: 'from-indigo-900 to-indigo-400',  description: 'Sharp indigo accents with polished professional styling.' },
    { id: 'graphite-clean',   name: 'Graphite Clean',   accent: 'bg-zinc-600',     card: 'from-zinc-700 to-zinc-300',      description: 'Minimal, neutral, and highly readable business format.' },
    { id: 'executive-sidebar',name: 'Executive Sidebar',accent: 'bg-amber-800',    card: 'from-stone-700 to-stone-300',    description: 'Left profile panel + dark top name banner.' },
    { id: 'modern-navy',      name: 'Modern Navy',      accent: 'bg-slate-800',    card: 'from-slate-700 to-slate-500',    description: 'Strong left sidebar with modern profile layout.' },
    { id: 'minimal-white',    name: 'Minimal White',    accent: 'bg-zinc-700',     card: 'from-zinc-300 to-zinc-100',      description: 'Clean single-column sections with elegant spacing.' },
    { id: 'royal-blue',       name: 'Royal Blue',       accent: 'bg-blue-700',     card: 'from-blue-700 to-blue-400',      description: 'Corporate blue style with clear section hierarchy.' },
    { id: 'charcoal',         name: 'Charcoal Pro',     accent: 'bg-neutral-800',  card: 'from-neutral-700 to-neutral-400',description: 'Dark-highlight format for tech and product roles.' },
    { id: 'teal-clean',       name: 'Teal Clean',       accent: 'bg-teal-700',     card: 'from-teal-700 to-teal-300',      description: 'Fresh professional look with soft contrast.' },
    { id: 'mono-border',      name: 'Mono Border',      accent: 'bg-gray-700',     card: 'from-gray-500 to-gray-200',      description: 'Simple monochrome with structured dividers.' },
    { id: 'lavender-soft',    name: 'Lavender Soft',    accent: 'bg-violet-400',   card: 'from-violet-200 to-purple-100',  description: 'Pastel purple two-column with soft rounded sections.' },
    { id: 'steel-banner',     name: 'Steel Banner',     accent: 'bg-slate-600',    card: 'from-slate-700 to-slate-400',    description: 'Dark steel top banner with clean white content area.' },
    { id: 'peach-card',       name: 'Peach Card',       accent: 'bg-orange-300',   card: 'from-orange-200 to-amber-100',   description: 'Warm peach tones with rounded card sections.' },
    { id: 'slate-timeline',   name: 'Slate Timeline',   accent: 'bg-slate-500',    card: 'from-slate-400 to-slate-200',    description: 'Left accent bar with timeline-style section layout.' },
    { id: 'copper-split',     name: 'Copper Split',     accent: 'bg-amber-600',    card: 'from-amber-700 to-orange-300',   description: 'Warm copper diagonal header with bold name treatment.' },
    { id: 'ice-blue',         name: 'Ice Blue',         accent: 'bg-sky-400',      card: 'from-sky-200 to-blue-100',       description: 'Icy light blue with frosted card sections and clean type.' },
  ];

  // ─── Premium templates ───────────────────────────────────────────────────
  const premiumTemplates = [
    {
      id: 'obsidian-luxury',
      name: 'Obsidian Luxury',
      accent: 'bg-yellow-400',
      card: 'from-gray-950 to-gray-800',
      description: 'Deep black canvas with gold foil accents. Built for executives.',
      premium: true,
    },
    {
      id: 'aurora-gradient',
      name: 'Aurora Gradient',
      accent: 'bg-violet-500',
      card: 'from-violet-600 to-cyan-400',
      description: 'Sweeping aurora borealis gradient header. Striking and modern.',
      premium: true,
    },
    {
      id: 'crimson-editorial',
      name: 'Crimson Editorial',
      accent: 'bg-red-700',
      card: 'from-red-900 to-rose-600',
      description: 'Magazine-style editorial layout with bold crimson typography.',
      premium: true,
    },
    {
      id: 'sage-minimal',
      name: 'Sage Minimal',
      accent: 'bg-green-700',
      card: 'from-green-800 to-lime-300',
      description: 'Refined sage green with generous whitespace. Calm and elegant.',
      premium: true,
    },
    {
      id: 'noir-typeset',
      name: 'Noir Typeset',
      accent: 'bg-stone-800',
      card: 'from-stone-900 to-stone-600',
      description: 'Newspaper-inspired typographic layout. Sophisticated and bold.',
      premium: true,
    },
  ];

  const templates = [...freeTemplates, ...premiumTemplates];

  // ─── State ───────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    fullName: '', role: '', profileImage: '', profileImageType: '',
    email: '', phone: '', address: '', summary: '',
    education: '', skills: '', experience: '',
    languages: '', references: '', projects: ''
  });
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [inspectTemplateId, setInspectTemplateId] = useState(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [cvTitle, setCvTitle] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState('');
  const [loadingTemplate, setLoadingTemplate] = useState(false);
  const [preview, setPreview] = useState(false);

  // ─── Load user ───────────────────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;
    const loadUser = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/auth/check-auth', { credentials: 'include' });
        const data = await res.json();
        const userId = data?.data?.user?.id;
        if (res.ok && userId && isMounted) setCurrentUserId(userId);
      } catch { if (isMounted) setCurrentUserId(''); }
    };
    loadUser();
    return () => { isMounted = false; };
  }, []);

  // ─── Load saved CV for editing ───────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;
    const templateId = searchParams.get('templateId');
    const loadTemplate = async () => {
      if (!templateId) { if (isMounted) setEditingTemplateId(''); return; }
      try {
        setLoadingTemplate(true);
        const res = await fetch(`http://localhost:5000/api/job-match/cv/template/${templateId}`, { credentials: 'include' });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || 'Failed to load saved CV.');
        if (!isMounted) return;
        const sectionMap = (Array.isArray(data?.sections) ? data.sections : []).reduce((acc, s) => {
          if (s?.title) acc[s.title] = s.content || '';
          return acc;
        }, {});
        const profileLines = String(sectionMap.Profile || '').split(/\r?\n/).filter(Boolean);
        const contactLines = String(sectionMap.Contact || '').split(/\r?\n/).filter(Boolean);
        setForm((prev) => ({
          ...prev,
          fullName: profileLines[0] || '', role: profileLines[1] || '',
          email: contactLines[0] || '', phone: contactLines[1] || '', address: contactLines[2] || '',
          summary: data?.summary || '',
          education: sectionMap.Education || '', skills: sectionMap.Skills || '',
          experience: sectionMap['Work Experience'] || '', languages: sectionMap.Languages || '',
          references: sectionMap.References || '', projects: sectionMap.Projects || '',
          profileImage: data?.profileImage || '',
          profileImageType: data?.profileImage ? 'image/png' : ''
        }));
        setCvTitle(data?.name || '');
        setSelectedTemplate(data?.templateId || 'minimal-white');
        setEditingTemplateId(data?._id || templateId);
        setPreview(false); setSaveMessage(''); setSaveError('');
      } catch (error) { if (isMounted) setSaveError(error.message || 'Failed to load saved CV.'); }
      finally { if (isMounted) setLoadingTemplate(false); }
    };
    loadTemplate();
    return () => { isMounted = false; };
  }, [searchParams]);

  // ─── Helpers ─────────────────────────────────────────────────────────────
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
    if (!fullName) nextErrors.fullName = 'Full name is required.';
    else if (fullName.length < 2) nextErrors.fullName = 'Full name must be at least 2 characters.';
    if (!role) nextErrors.role = 'Job title / role is required.';
    else if (role.length < 2) nextErrors.role = 'Job title / role must be at least 2 characters.';
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = 'Enter a valid email address.';
    if (phone && !/^[+]?[-()\d\s]{7,20}$/.test(phone)) nextErrors.phone = 'Enter a valid phone number.';
    if (summary.length > 600) nextErrors.summary = 'Professional summary must be 600 characters or less.';
    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const generatePreview = () => { if (validateForm()) setPreview(true); };

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFormErrors((prev) => { if (!prev[key]) return prev; const next = { ...prev }; delete next[key]; return next; });
    setSaveMessage(''); setSaveError('');
  };

  const buildTemplateName = () => {
    const explicitTitle = String(cvTitle || '').trim();
    if (explicitTitle) return explicitTitle;
    const templateName = templates.find((t) => t.id === selectedTemplate)?.name || 'Template';
    const safeName = String(form.fullName || 'My CV').trim() || 'My CV';
    return `${safeName} - ${templateName}`;
  };

  const buildSections = () => {
    const sections = [];
    const addSection = (title, value) => {
      const content = String(value || '').trim();
      if (!content) return;
      sections.push({ title, content });
    };
    addSection('Profile', [form.fullName, form.role].filter(Boolean).join('\n'));
    addSection('Contact', [form.email, form.phone, form.address].filter(Boolean).join('\n'));
    addSection('Education', form.education);
    addSection('Skills', form.skills);
    addSection('Work Experience', form.experience);
    addSection('Languages', form.languages);
    addSection('References', form.references);
    addSection('Projects', form.projects);
    return sections;
  };

  const saveTemplate = async () => {
    setSaveMessage(''); setSaveError('');
    if (!currentUserId) { setSaveError('Please sign in to save your CV.'); return; }
    if (!selectedTemplate) { setSaveError('Select a template before saving.'); return; }
    if (!validateForm()) { setSaveError('Please fix the highlighted fields before saving.'); return; }
    try {
      setSaving(true);
      const payload = {
        name: buildTemplateName(), summary: String(form.summary || ''),
        sections: buildSections(), isDefault: false,
        templateId: selectedTemplate || '', profileImage: String(form.profileImage || '')
      };
      const isEditMode = Boolean(editingTemplateId);
      const url = isEditMode
        ? `http://localhost:5000/api/job-match/cv/template/${editingTemplateId}`
        : `http://localhost:5000/api/job-match/cv/${currentUserId}`;
      const res = await fetch(url, {
        method: isEditMode ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) { setSaveError(data?.message || 'Failed to save CV.'); return; }
      setSaveMessage(isEditMode ? 'CV updated successfully.' : 'CV saved successfully. You can create and save more CVs anytime.');
      if (!isEditMode) setCvTitle('');
    } catch { setSaveError('Server error while saving the CV. Please try again.'); }
    finally { setSaving(false); }
  };

  const deleteTemplate = async () => {
    if (!editingTemplateId) return;
    if (!window.confirm('Delete this saved CV? This cannot be undone.')) return;
    try {
      setSaving(true);
      const res = await fetch(`http://localhost:5000/api/job-match/cv/template/${editingTemplateId}`, { method: 'DELETE', credentials: 'include' });
      const data = await res.json();
      if (!res.ok) { setSaveError(data?.message || 'Failed to delete CV.'); return; }
      navigate('/cv-saved');
    } catch { setSaveError('Server error while deleting the CV. Please try again.'); }
    finally { setSaving(false); }
  };

  const useExampleDetails = (options = { openPreview: true }) => {
    setForm((prev) => ({ ...prev, ...sampleData, profileImage: sampleProfileImage, profileImageType: 'image/png' }));
    if (options.openPreview) setPreview(true);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setFormErrors((prev) => ({ ...prev, profileImage: 'Only JPG or PNG images are allowed.' }));
      return;
    }
    setFormErrors((prev) => { if (!prev.profileImage) return prev; const next = { ...prev }; delete next.profileImage; return next; });
    const reader = new FileReader();
    reader.onload = () => setForm((prev) => ({ ...prev, profileImage: String(reader.result || ''), profileImageType: file.type }));
    reader.readAsDataURL(file);
  };

  const parseMultiItems = (value) =>
    String(value || '').split(/\r?\n|,|;/).map((item) => item.trim()).filter(Boolean);

  const multiItemsAsLines = (value) => {
    const items = parseMultiItems(value);
    if (items.length === 0) return '-';
    if (items.length === 1) return items[0];
    return items.map((item) => `- ${item}`).join('\n');
  };

  const languageItems = parseMultiItems(form.languages);
  const previewLines = (value) => { const items = parseMultiItems(value); return items.length ? items.join('\n') : '-'; };
  const shouldUsePointForm = (value) => parseMultiItems(value).length > 1;

  const createCircularImageDataUrl = (source, size = 300) =>
    new Promise((resolve) => {
      if (!source) { resolve(''); return; }
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = size; canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(''); return; }
        ctx.beginPath(); ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2); ctx.closePath(); ctx.clip();
        const scale = Math.max(size / image.width, size / image.height);
        const drawWidth = image.width * scale; const drawHeight = image.height * scale;
        const dx = (size - drawWidth) / 2; const dy = (size - drawHeight) / 2;
        ctx.drawImage(image, dx, dy, drawWidth, drawHeight);
        resolve(canvas.toDataURL('image/png'));
      };
      image.onerror = () => resolve('');
      image.src = source;
    });

  // ─── Template classes for live preview panel ─────────────────────────────
  const templateClasses = useMemo(() => {
    const map = {
      'minimal-white':    { container: 'bg-white border-gray-300',          name: 'text-gray-900',    heading: 'text-gray-700 border-b border-gray-300' },
      'mono-border':      { container: 'bg-white border-gray-200',          name: 'text-black tracking-wide', heading: 'text-black uppercase text-sm' },
      'charcoal':         { container: 'bg-gray-900 border-gray-700',       name: 'text-white',       heading: 'text-gray-200 border-b border-gray-700', body: 'text-gray-200', sub: 'text-gray-400' },
      'teal-clean':       { container: 'bg-teal-50 border-teal-200',        name: 'text-teal-900',    heading: 'text-teal-800 border-b border-teal-200' },
      'royal-blue':       { container: 'bg-blue-50 border-blue-200',        name: 'text-blue-900',    heading: 'text-blue-800 border-b border-blue-200' },
      'cocoa-profile':    { container: 'bg-amber-50 border-amber-200',      name: 'text-amber-900',   heading: 'text-amber-800 border-b border-amber-300' },
      'olive-column':     { container: 'bg-lime-50 border-lime-200',        name: 'text-lime-900',    heading: 'text-lime-800 border-b border-lime-300' },
      'blush-creative':   { container: 'bg-rose-50 border-rose-200',        name: 'text-rose-900',    heading: 'text-rose-700 border-b border-rose-300' },
      'blue-power':       { container: 'bg-blue-50 border-blue-300',        name: 'text-blue-900',    heading: 'text-blue-800 border-b border-blue-400' },
      'midnight-gold':    { container: 'bg-slate-900 border-slate-700',     name: 'text-yellow-300',  heading: 'text-yellow-300 border-b border-yellow-500', body: 'text-slate-100', sub: 'text-slate-300' },
      'coral-split':      { container: 'bg-orange-50 border-orange-200',    name: 'text-orange-900',  heading: 'text-orange-800 border-b border-orange-300' },
      'forest-pro':       { container: 'bg-emerald-50 border-emerald-300',  name: 'text-emerald-900', heading: 'text-emerald-800 border-b border-emerald-400' },
      'aqua-grid':        { container: 'bg-cyan-50 border-cyan-300',        name: 'text-cyan-900',    heading: 'text-cyan-800 border-b border-cyan-400' },
      'plum-studio':      { container: 'bg-fuchsia-50 border-fuchsia-200',  name: 'text-fuchsia-900', heading: 'text-fuchsia-800 border-b border-fuchsia-300' },
      'sunset-creative':  { container: 'bg-red-50 border-red-200',          name: 'text-red-900',     heading: 'text-red-700 border-b border-red-300' },
      'indigo-edge':      { container: 'bg-indigo-50 border-indigo-300',    name: 'text-indigo-900',  heading: 'text-indigo-800 border-b border-indigo-400' },
      'graphite-clean':   { container: 'bg-zinc-50 border-zinc-300',        name: 'text-zinc-900',    heading: 'text-zinc-800 border-b border-zinc-400' },
      'executive-sidebar':{ container: 'bg-white border-stone-300',         name: 'text-white',       heading: 'text-zinc-800 border-b border-zinc-400' },
      // New free templates
      'lavender-soft':    { container: 'bg-violet-50 border-violet-200',    name: 'text-violet-900',  heading: 'text-violet-700 border-b border-violet-300' },
      'steel-banner':     { container: 'bg-white border-slate-300',         name: 'text-white',       heading: 'text-slate-700 border-b border-slate-300' },
      'peach-card':       { container: 'bg-orange-50 border-orange-200',    name: 'text-orange-900',  heading: 'text-orange-700 border-b border-orange-200' },
      'slate-timeline':   { container: 'bg-slate-50 border-slate-300',      name: 'text-slate-900',   heading: 'text-slate-700 border-b border-slate-300' },
      'copper-split':     { container: 'bg-amber-50 border-amber-300',      name: 'text-white',       heading: 'text-amber-800 border-b border-amber-300' },
      'ice-blue':         { container: 'bg-sky-50 border-sky-200',          name: 'text-sky-900',     heading: 'text-sky-700 border-b border-sky-200' },
      // Premium
      'obsidian-luxury':  { container: 'bg-gray-950 border-yellow-500',     name: 'text-yellow-300',  heading: 'text-yellow-400 border-b border-yellow-600', body: 'text-gray-100', sub: 'text-gray-400' },
      'aurora-gradient':  { container: 'bg-white border-violet-200',        name: 'text-white',       heading: 'text-violet-700 border-b border-violet-300' },
      'crimson-editorial':{ container: 'bg-white border-red-200',           name: 'text-white',       heading: 'text-red-800 border-b border-red-300' },
      'sage-minimal':     { container: 'bg-green-50 border-green-200',      name: 'text-green-900',   heading: 'text-green-800 border-b border-green-300' },
      'noir-typeset':     { container: 'bg-stone-950 border-stone-600',     name: 'text-stone-100',   heading: 'text-stone-200 border-b border-stone-600', body: 'text-stone-200', sub: 'text-stone-400' },
    };
    return map[selectedTemplate] || { container: 'bg-slate-50 border-slate-200', name: 'text-slate-900', heading: 'text-slate-800 border-b border-slate-200' };
  }, [selectedTemplate]);

  // ─── PDF download ─────────────────────────────────────────────────────────
  const downloadPdf = async () => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 44;
    const contentWidth = pageWidth - margin * 2;
    const circularImage = await createCircularImageDataUrl(form.profileImage, 400);

    // ── Executive Sidebar ──────────────────────────────────────────────────
    if (selectedTemplate === 'executive-sidebar') {
      const leftWidth = 160; const startX = 24; const startY = 24;
      doc.setFillColor(230, 226, 224);
      doc.rect(startX, startY, leftWidth, pageHeight - 48, 'F');
      doc.setFillColor(34, 29, 29);
      doc.rect(startX + leftWidth, startY + 10, pageWidth - startX - leftWidth - 24, 62, 'F');
      doc.setFillColor(180, 170, 165);
      doc.circle(startX + leftWidth / 2, startY + 40, 37, 'F');
      if (circularImage) { try { doc.addImage(circularImage, 'PNG', startX + leftWidth / 2 - 37, startY + 3, 74, 74); } catch {} }
      doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(21);
      doc.text(form.fullName || 'Your Name', startX + leftWidth + 16, startY + 44);
      doc.setFontSize(12); doc.text(form.role || 'Professional Title', startX + leftWidth + 16, startY + 62);
      const leftX = startX + 12; let leftY = startY + 100;
      const addLeftSection = (title, content) => {
        doc.setTextColor(40, 40, 40); doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
        doc.text(title, leftX, leftY); leftY += 10;
        doc.setDrawColor(150, 145, 140); doc.line(leftX, leftY, startX + leftWidth - 12, leftY); leftY += 12;
        doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
        const lines = doc.splitTextToSize(content || '-', leftWidth - 24);
        doc.text(lines, leftX, leftY); leftY += lines.length * 11 + 10;
      };
      addLeftSection('CONTACT', [form.email, form.phone, form.address].filter(Boolean).join('\n'));
      addLeftSection('EDUCATION', multiItemsAsLines(form.education));
      addLeftSection('SKILLS', multiItemsAsLines(form.skills));
      if (languageItems.length > 0) addLeftSection('LANGUAGE', multiItemsAsLines(form.languages));
      const rightX = startX + leftWidth + 16; const rightWidth = pageWidth - rightX - 24; let rightY = startY + 100;
      const addRightSection = (title, content) => {
        doc.setTextColor(35, 35, 35); doc.setFont('helvetica', 'bold'); doc.setFontSize(14);
        doc.text(title, rightX, rightY); rightY += 10;
        doc.setDrawColor(130, 130, 130); doc.line(rightX, rightY, rightX + rightWidth, rightY); rightY += 14;
        doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
        const lines = doc.splitTextToSize(content || '-', rightWidth);
        doc.text(lines, rightX, rightY); rightY += lines.length * 12 + 14;
      };
      addRightSection('ABOUT ME', form.summary);
      addRightSection('WORK EXPERIENCE', multiItemsAsLines(form.experience));
      addRightSection('PROJECTS', multiItemsAsLines(form.projects));
      addRightSection('REFERENCES', multiItemsAsLines(form.references));
      doc.save(`${(form.fullName || 'cv').trim().replace(/\s+/g, '_').toLowerCase()}_executive_sidebar.pdf`);
      return;
    }

    // ── Obsidian Luxury ────────────────────────────────────────────────────
    if (selectedTemplate === 'obsidian-luxury') {
      doc.setFillColor(10, 10, 10);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
      // Gold header bar
      doc.setFillColor(180, 140, 30);
      doc.rect(0, 0, pageWidth, 90, 'F');
      // Thin gold accent line
      doc.setFillColor(212, 175, 55);
      doc.rect(0, 90, pageWidth, 3, 'F');
      if (circularImage) { try { doc.addImage(circularImage, 'PNG', margin, 15, 60, 60); } catch {} }
      doc.setTextColor(10, 10, 10); doc.setFont('helvetica', 'bold'); doc.setFontSize(26);
      doc.text(form.fullName || 'Your Name', margin + 72, 48);
      doc.setFontSize(12); doc.setFont('helvetica', 'normal');
      doc.text(form.role || 'Professional Title', margin + 72, 68);
      let y = 116;
      const addSection = (title, content) => {
        doc.setTextColor(212, 175, 55); doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
        doc.text(title.toUpperCase(), margin, y); y += 8;
        doc.setDrawColor(212, 175, 55); doc.line(margin, y, margin + contentWidth, y); y += 14;
        doc.setTextColor(220, 220, 220); doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
        const lines = doc.splitTextToSize(content || '-', contentWidth);
        doc.text(lines, margin, y); y += lines.length * 13 + 12;
      };
      doc.setTextColor(180, 180, 180); doc.setFontSize(9);
      doc.text([form.email, form.phone, form.address].filter(Boolean).join('  |  '), margin, y); y += 20;
      addSection('Professional Summary', form.summary);
      addSection('Work Experience', multiItemsAsLines(form.experience));
      addSection('Education', multiItemsAsLines(form.education));
      addSection('Skills', multiItemsAsLines(form.skills));
      addSection('Projects', multiItemsAsLines(form.projects));
      if (languageItems.length > 0) addSection('Languages', multiItemsAsLines(form.languages));
      doc.save(`${(form.fullName || 'cv').trim().replace(/\s+/g, '_').toLowerCase()}_obsidian_luxury.pdf`);
      return;
    }

    // ── Aurora Gradient ────────────────────────────────────────────────────
    if (selectedTemplate === 'aurora-gradient') {
      // Gradient header simulation with two rects
      doc.setFillColor(109, 40, 217);
      doc.rect(0, 0, pageWidth / 2, 100, 'F');
      doc.setFillColor(6, 182, 212);
      doc.rect(pageWidth / 2, 0, pageWidth / 2, 100, 'F');
      // Blend strip
      doc.setFillColor(80, 100, 220);
      doc.rect(pageWidth / 2 - 40, 0, 80, 100, 'F');
      if (circularImage) { try { doc.addImage(circularImage, 'PNG', pageWidth - margin - 70, 15, 70, 70); } catch {} }
      doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(28);
      doc.text(form.fullName || 'Your Name', margin, 50);
      doc.setFontSize(13); doc.setFont('helvetica', 'normal');
      doc.text(form.role || 'Professional Title', margin, 72);
      doc.setFontSize(9);
      doc.text([form.email, form.phone, form.address].filter(Boolean).join('  ·  '), margin, 90);
      let y = 120;
      const addSection = (title, content) => {
        doc.setTextColor(109, 40, 217); doc.setFont('helvetica', 'bold'); doc.setFontSize(12);
        doc.text(title, margin, y); y += 10;
        doc.setDrawColor(109, 40, 217); doc.line(margin, y, margin + contentWidth, y); y += 14;
        doc.setTextColor(30, 30, 30); doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
        const lines = doc.splitTextToSize(content || '-', contentWidth);
        doc.text(lines, margin, y); y += lines.length * 13 + 12;
      };
      addSection('Professional Summary', form.summary);
      addSection('Work Experience', multiItemsAsLines(form.experience));
      addSection('Education', multiItemsAsLines(form.education));
      addSection('Skills', multiItemsAsLines(form.skills));
      addSection('Projects', multiItemsAsLines(form.projects));
      if (languageItems.length > 0) addSection('Languages', multiItemsAsLines(form.languages));
      doc.save(`${(form.fullName || 'cv').trim().replace(/\s+/g, '_').toLowerCase()}_aurora_gradient.pdf`);
      return;
    }

    // ── Crimson Editorial ──────────────────────────────────────────────────
    if (selectedTemplate === 'crimson-editorial') {
      doc.setFillColor(153, 27, 27);
      doc.rect(0, 0, pageWidth, 110, 'F');
      if (circularImage) { try { doc.addImage(circularImage, 'PNG', margin, 20, 70, 70); } catch {} }
      doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(30);
      doc.text((form.fullName || 'Your Name').toUpperCase(), margin + 82, 55);
      doc.setFontSize(12); doc.setFont('helvetica', 'normal');
      doc.text(form.role || 'Professional Title', margin + 82, 75);
      doc.setFontSize(9);
      doc.text([form.email, form.phone, form.address].filter(Boolean).join('  |  '), margin + 82, 95);
      let y = 130;
      const addSection = (title, content) => {
        doc.setTextColor(153, 27, 27); doc.setFont('helvetica', 'bold'); doc.setFontSize(13);
        doc.text(title.toUpperCase(), margin, y); y += 10;
        doc.setFillColor(153, 27, 27); doc.rect(margin, y, contentWidth, 2, 'F'); y += 14;
        doc.setTextColor(20, 20, 20); doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
        const lines = doc.splitTextToSize(content || '-', contentWidth);
        doc.text(lines, margin, y); y += lines.length * 13 + 12;
      };
      addSection('Profile', form.summary);
      addSection('Experience', multiItemsAsLines(form.experience));
      addSection('Education', multiItemsAsLines(form.education));
      addSection('Skills', multiItemsAsLines(form.skills));
      addSection('Projects', multiItemsAsLines(form.projects));
      if (languageItems.length > 0) addSection('Languages', multiItemsAsLines(form.languages));
      doc.save(`${(form.fullName || 'cv').trim().replace(/\s+/g, '_').toLowerCase()}_crimson_editorial.pdf`);
      return;
    }

    // ── Sage Minimal ───────────────────────────────────────────────────────
    if (selectedTemplate === 'sage-minimal') {
      doc.setFillColor(240, 253, 244);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
      doc.setFillColor(21, 128, 61);
      doc.rect(0, 0, 6, pageHeight, 'F');
      if (circularImage) { try { doc.addImage(circularImage, 'PNG', pageWidth - margin - 64, 30, 64, 64); } catch {} }
      doc.setTextColor(20, 83, 45); doc.setFont('helvetica', 'bold'); doc.setFontSize(28);
      doc.text(form.fullName || 'Your Name', margin + 10, 52);
      doc.setFontSize(13); doc.setFont('helvetica', 'normal'); doc.setTextColor(22, 101, 52);
      doc.text(form.role || 'Professional Title', margin + 10, 72);
      doc.setFontSize(9); doc.setTextColor(100, 140, 110);
      doc.text([form.email, form.phone, form.address].filter(Boolean).join('  ·  '), margin + 10, 90);
      doc.setDrawColor(21, 128, 61); doc.line(margin + 10, 98, margin + contentWidth, 98);
      let y = 116;
      const addSection = (title, content) => {
        doc.setTextColor(21, 128, 61); doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
        doc.text(title, margin + 10, y); y += 10;
        doc.setDrawColor(187, 247, 208); doc.line(margin + 10, y, margin + contentWidth, y); y += 14;
        doc.setTextColor(30, 60, 40); doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
        const lines = doc.splitTextToSize(content || '-', contentWidth - 10);
        doc.text(lines, margin + 10, y); y += lines.length * 13 + 12;
      };
      addSection('Professional Summary', form.summary);
      addSection('Work Experience', multiItemsAsLines(form.experience));
      addSection('Education', multiItemsAsLines(form.education));
      addSection('Skills', multiItemsAsLines(form.skills));
      addSection('Projects', multiItemsAsLines(form.projects));
      if (languageItems.length > 0) addSection('Languages', multiItemsAsLines(form.languages));
      doc.save(`${(form.fullName || 'cv').trim().replace(/\s+/g, '_').toLowerCase()}_sage_minimal.pdf`);
      return;
    }

    // ── Noir Typeset ───────────────────────────────────────────────────────
    if (selectedTemplate === 'noir-typeset') {
      doc.setFillColor(12, 10, 9);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
      doc.setFillColor(28, 25, 23);
      doc.rect(0, 0, pageWidth, 105, 'F');
      doc.setFillColor(168, 162, 158);
      doc.rect(margin, 105, contentWidth, 1, 'F');
      if (circularImage) { try { doc.addImage(circularImage, 'PNG', pageWidth - margin - 68, 18, 68, 68); } catch {} }
      doc.setTextColor(245, 245, 244); doc.setFont('helvetica', 'bold'); doc.setFontSize(32);
      doc.text(form.fullName || 'Your Name', margin, 52);
      doc.setFontSize(12); doc.setFont('helvetica', 'normal'); doc.setTextColor(168, 162, 158);
      doc.text((form.role || 'Professional Title').toUpperCase(), margin, 72);
      doc.setFontSize(9);
      doc.text([form.email, form.phone, form.address].filter(Boolean).join('   '), margin, 92);
      let y = 122;
      const addSection = (title, content) => {
        doc.setTextColor(168, 162, 158); doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
        doc.text(title.toUpperCase(), margin, y); y += 10;
        doc.setDrawColor(68, 64, 60); doc.line(margin, y, margin + contentWidth, y); y += 14;
        doc.setTextColor(214, 211, 209); doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
        const lines = doc.splitTextToSize(content || '-', contentWidth);
        doc.text(lines, margin, y); y += lines.length * 13 + 12;
      };
      addSection('Profile', form.summary);
      addSection('Experience', multiItemsAsLines(form.experience));
      addSection('Education', multiItemsAsLines(form.education));
      addSection('Skills', multiItemsAsLines(form.skills));
      addSection('Projects', multiItemsAsLines(form.projects));
      if (languageItems.length > 0) addSection('Languages', multiItemsAsLines(form.languages));
      doc.save(`${(form.fullName || 'cv').trim().replace(/\s+/g, '_').toLowerCase()}_noir_typeset.pdf`);
      return;
    }

    // ── All other free templates (standard single-column) ──────────────────
    const colorMap = {
      'minimal-white': [60,60,60], 'mono-border': [0,0,0], 'charcoal': [35,35,35],
      'teal-clean': [13,110,99], 'royal-blue': [29,78,216], 'cocoa-profile': [120,53,15],
      'olive-column': [77,124,15], 'blush-creative': [190,96,120], 'blue-power': [30,58,138],
      'midnight-gold': [234,179,8], 'coral-split': [234,88,12], 'forest-pro': [6,95,70],
      'aqua-grid': [8,145,178], 'plum-studio': [162,28,175], 'sunset-creative': [220,38,38],
      'indigo-edge': [67,56,202], 'graphite-clean': [82,82,91],
      'lavender-soft': [109,40,217], 'steel-banner': [51,65,85], 'peach-card': [194,120,60],
      'slate-timeline': [71,85,105], 'copper-split': [180,100,20], 'ice-blue': [14,116,144],
    };
    const titleColor = colorMap[selectedTemplate] || [30, 64, 175];
    let y = 56;
    doc.setTextColor(...titleColor); doc.setFont('helvetica', 'bold'); doc.setFontSize(24);
    doc.text(form.fullName || 'Your Name', margin, y);
    if (circularImage) { try { doc.addImage(circularImage, 'PNG', pageWidth - margin - 62, 26, 52, 52); } catch {} }
    y += 20; doc.setTextColor(90,90,90); doc.setFont('helvetica', 'normal'); doc.setFontSize(12);
    doc.text(form.role || 'Professional Title', margin, y);
    y += 18; doc.setFontSize(11);
    doc.text([form.email, form.phone, form.address].filter(Boolean).join(' | ') || 'Email | Phone', margin, y);
    y += 24;
    const addSection = (title, content) => {
      doc.setTextColor(...titleColor); doc.setFont('helvetica', 'bold'); doc.setFontSize(13);
      doc.text(title, margin, y); y += 12;
      doc.setDrawColor(200,200,200); doc.line(margin, y, margin + contentWidth, y); y += 16;
      doc.setTextColor(40,40,40); doc.setFont('helvetica', 'normal'); doc.setFontSize(11);
      const lines = doc.splitTextToSize(content || '-', contentWidth);
      doc.text(lines, margin, y); y += lines.length * 14 + 14;
    };
    addSection('Professional Summary', form.summary);
    addSection('Education', multiItemsAsLines(form.education));
    addSection('Skills', multiItemsAsLines(form.skills));
    addSection('Work Experience', multiItemsAsLines(form.experience));
    addSection('Languages', multiItemsAsLines(form.languages));
    addSection('References', multiItemsAsLines(form.references));
    addSection('Projects', multiItemsAsLines(form.projects));
    doc.save(`${(form.fullName || 'cv').trim().replace(/\s+/g, '_').toLowerCase()}_${selectedTemplate || 'template'}.pdf`);
  };

  // ─── Template preview card (grid) ────────────────────────────────────────
  const TemplatePreviewCard = ({ template }) => {
    const isPremium = PREMIUM_IDS.has(template.id);
    return (
      <div className={`rounded-xl border overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow relative ${isPremium ? 'border-yellow-400' : 'border-gray-200'}`}>
        {isPremium && (
          <div className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
            ★ PREMIUM
          </div>
        )}
        <div className="h-52 overflow-hidden bg-gray-100 relative">
          <div className="origin-top-left scale-[0.36] w-[278%] pointer-events-none">
            <LargeTemplatePreview template={template} />
          </div>
          {isPremium && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end justify-center pb-3">
              <span className="text-white text-xs font-semibold flex items-center gap-1">
                🔒 Premium Template
              </span>
            </div>
          )}
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
  };

  // ─── Large preview (modal + inspect) ─────────────────────────────────────
  const LargeTemplatePreview = ({ template }) => {
    if (!template) return null;

    // ── Premium: Obsidian Luxury ──────────────────────────────────────────
    if (template.id === 'obsidian-luxury') {
      return (
        <div className="h-[420px] rounded-xl overflow-hidden bg-gray-950 border border-yellow-500/60">
          <div className="h-[110px] bg-gradient-to-r from-yellow-700 via-amber-500 to-yellow-600 flex items-center gap-5 px-6">
            <img src={sampleProfileImage} alt="Sample" className="w-20 h-20 rounded-full object-cover border-4 border-yellow-200 shadow-lg" />
            <div>
              <p className="text-2xl font-bold text-gray-950 leading-none">{sampleData.fullName.toUpperCase()}</p>
              <p className="text-sm text-gray-900 mt-1">{sampleData.role}</p>
            </div>
          </div>
          <div className="h-[3px] bg-yellow-400" />
          <div className="p-5 space-y-3">
            <div>
              <p className="text-[10px] font-bold text-yellow-400 tracking-widest mb-1">PROFESSIONAL SUMMARY</p>
              <div className="h-px bg-yellow-800 mb-2" />
              <p className="text-[10px] text-gray-300 leading-relaxed">{sampleData.summary}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-yellow-400 tracking-widest mb-1">SKILLS</p>
              <div className="h-px bg-yellow-800 mb-2" />
              <div className="flex flex-wrap gap-1">
                {['Communication','Leadership','SEO','Negotiation'].map(s => (
                  <span key={s} className="text-[9px] bg-yellow-900/60 text-yellow-300 px-2 py-0.5 rounded-full border border-yellow-700">{s}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-yellow-400 tracking-widest mb-1">EXPERIENCE</p>
              <div className="h-px bg-yellow-800 mb-2" />
              <p className="text-[10px] text-gray-300">Marketing Executive — ABC Company (2022–2024)</p>
              <p className="text-[10px] text-gray-400">Sales Intern — XYZ Group (2021–2022)</p>
            </div>
          </div>
        </div>
      );
    }

    // ── Premium: Aurora Gradient ──────────────────────────────────────────
    if (template.id === 'aurora-gradient') {
      return (
        <div className="h-[420px] rounded-xl overflow-hidden border border-violet-200">
          <div className="h-[115px] bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-400 flex items-center justify-between px-6">
            <div>
              <p className="text-2xl font-bold text-white leading-none">{sampleData.fullName}</p>
              <p className="text-sm text-violet-100 mt-1">{sampleData.role}</p>
              <p className="text-[10px] text-violet-200 mt-1">{sampleData.email}</p>
            </div>
            <img src={sampleProfileImage} alt="Sample" className="w-20 h-20 rounded-full object-cover border-4 border-white/70 shadow-xl" />
          </div>
          <div className="bg-white p-5 space-y-3">
            <div>
              <p className="text-xs font-bold text-violet-700 mb-1">ABOUT ME</p>
              <div className="h-0.5 bg-gradient-to-r from-violet-400 to-cyan-400 mb-2" />
              <p className="text-[10px] text-gray-600 leading-relaxed">{sampleData.summary}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-bold text-violet-700 mb-1">SKILLS</p>
                <div className="h-0.5 bg-gradient-to-r from-violet-400 to-cyan-400 mb-2" />
                <div className="flex flex-wrap gap-1">
                  {['Communication','Leadership','SEO'].map(s => (
                    <span key={s} className="text-[9px] bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-violet-700 mb-1">EDUCATION</p>
                <div className="h-0.5 bg-gradient-to-r from-violet-400 to-cyan-400 mb-2" />
                <p className="text-[10px] text-gray-600">BSc Marketing</p>
                <p className="text-[10px] text-gray-500">University of Colombo</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // ── Premium: Crimson Editorial ────────────────────────────────────────
    if (template.id === 'crimson-editorial') {
      return (
        <div className="h-[420px] rounded-xl overflow-hidden border border-red-200 bg-white">
          <div className="h-[115px] bg-red-800 flex items-center gap-5 px-6">
            <img src={sampleProfileImage} alt="Sample" className="w-20 h-20 rounded-full object-cover border-4 border-red-300 shadow-lg" />
            <div>
              <p className="text-3xl font-black text-white tracking-tight leading-none">{sampleData.fullName.toUpperCase()}</p>
              <p className="text-sm text-red-200 mt-1 tracking-widest">{sampleData.role.toUpperCase()}</p>
            </div>
          </div>
          <div className="h-1 bg-red-600" />
          <div className="p-5 space-y-3">
            <div>
              <p className="text-xs font-black text-red-800 tracking-widest uppercase mb-1">Profile</p>
              <div className="h-0.5 bg-red-700 mb-2" />
              <p className="text-[10px] text-gray-700 leading-relaxed">{sampleData.summary}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-black text-red-800 tracking-widest uppercase mb-1">Skills</p>
                <div className="h-0.5 bg-red-700 mb-2" />
                <p className="text-[10px] text-gray-700">Communication</p>
                <p className="text-[10px] text-gray-700">Leadership · SEO</p>
              </div>
              <div>
                <p className="text-xs font-black text-red-800 tracking-widest uppercase mb-1">Education</p>
                <div className="h-0.5 bg-red-700 mb-2" />
                <p className="text-[10px] text-gray-700">BSc Marketing</p>
                <p className="text-[10px] text-gray-500">Univ. of Colombo</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // ── Premium: Sage Minimal ─────────────────────────────────────────────
    if (template.id === 'sage-minimal') {
      return (
        <div className="h-[420px] rounded-xl overflow-hidden border border-green-200 bg-green-50 flex">
          <div className="w-1.5 bg-green-700 flex-shrink-0" />
          <div className="flex-1 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-2xl font-bold text-green-900 leading-none">{sampleData.fullName}</p>
                <p className="text-sm text-green-700 mt-1">{sampleData.role}</p>
                <p className="text-[10px] text-green-600 mt-0.5">{sampleData.email}</p>
              </div>
              <img src={sampleProfileImage} alt="Sample" className="w-16 h-16 rounded-full object-cover border-4 border-green-200 shadow" />
            </div>
            <div className="h-px bg-green-300 mb-3" />
            <div className="space-y-3">
              <div>
                <p className="text-[10px] font-bold text-green-800 mb-1">ABOUT ME</p>
                <p className="text-[10px] text-gray-600 leading-relaxed">{sampleData.summary}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] font-bold text-green-800 mb-1">SKILLS</p>
                  <div className="flex flex-wrap gap-1">
                    {['Communication','Leadership','SEO'].map(s => (
                      <span key={s} className="text-[9px] bg-green-200 text-green-800 px-1.5 py-0.5 rounded">{s}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-green-800 mb-1">EDUCATION</p>
                  <p className="text-[10px] text-gray-600">BSc Marketing</p>
                  <p className="text-[10px] text-gray-500">Univ. of Colombo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // ── Premium: Noir Typeset ─────────────────────────────────────────────
    if (template.id === 'noir-typeset') {
      return (
        <div className="h-[420px] rounded-xl overflow-hidden bg-stone-950 border border-stone-700">
          <div className="px-6 pt-6 pb-4 border-b border-stone-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-black text-stone-100 leading-none tracking-tight">{sampleData.fullName}</p>
                <p className="text-xs text-stone-400 tracking-[0.3em] mt-1">{sampleData.role.toUpperCase()}</p>
              </div>
              <img src={sampleProfileImage} alt="Sample" className="w-16 h-16 rounded-full object-cover border-2 border-stone-600 grayscale" />
            </div>
            <p className="text-[10px] text-stone-500 mt-2">{sampleData.email} · {sampleData.phone}</p>
          </div>
          <div className="p-5 space-y-3">
            <div>
              <p className="text-[9px] font-bold text-stone-500 tracking-[0.25em] uppercase mb-1">Profile</p>
              <div className="h-px bg-stone-700 mb-2" />
              <p className="text-[10px] text-stone-300 leading-relaxed">{sampleData.summary}</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-stone-500 tracking-[0.25em] uppercase mb-1">Skills</p>
              <div className="h-px bg-stone-700 mb-2" />
              <div className="flex flex-wrap gap-1">
                {['Communication','Leadership','SEO','Negotiation'].map(s => (
                  <span key={s} className="text-[9px] border border-stone-600 text-stone-400 px-2 py-0.5 rounded">{s}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // ── Free: Blue Power ──────────────────────────────────────────────────
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

    // ── New Free: Lavender Soft ───────────────────────────────────────────
    if (template.id === 'lavender-soft') {
      return (
        <div className="h-[420px] rounded-xl overflow-hidden border border-violet-200 bg-violet-50">
          <div className="grid grid-cols-[155px_1fr] h-full">
            <div className="bg-violet-200/60 p-4 flex flex-col items-center pt-6 gap-3">
              <img src={sampleProfileImage} alt="Sample" className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md" />
              <div className="w-full">
                <p className="text-[10px] font-bold text-violet-800 uppercase tracking-wide mb-1">Contact</p>
                <div className="h-px bg-violet-300 mb-2" />
                <p className="text-[9px] text-violet-700 truncate">{sampleData.email}</p>
                <p className="text-[9px] text-violet-700">{sampleData.phone}</p>
              </div>
              <div className="w-full">
                <p className="text-[10px] font-bold text-violet-800 uppercase tracking-wide mb-1">Skills</p>
                <div className="h-px bg-violet-300 mb-2" />
                <div className="flex flex-wrap gap-1">
                  {['Communication','Leadership','SEO'].map(s => (
                    <span key={s} className="text-[8px] bg-violet-300/70 text-violet-900 px-1.5 py-0.5 rounded-full">{s}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="mb-3 pb-3 border-b border-violet-200">
                <p className="text-xl font-bold text-violet-900 leading-tight">{sampleData.fullName}</p>
                <p className="text-xs text-violet-600 mt-0.5">{sampleData.role}</p>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] font-bold text-violet-700 uppercase tracking-wide mb-1">About Me</p>
                  <p className="text-[9px] text-gray-600 leading-relaxed">{sampleData.summary}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-violet-700 uppercase tracking-wide mb-1">Experience</p>
                  <p className="text-[9px] text-gray-700">Marketing Executive — ABC Co. (2022–2024)</p>
                  <p className="text-[9px] text-gray-700">Sales Intern — XYZ Group (2021–2022)</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-violet-700 uppercase tracking-wide mb-1">Education</p>
                  <p className="text-[9px] text-gray-700">BSc Marketing — Univ. of Colombo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // ── New Free: Steel Banner ────────────────────────────────────────────
    if (template.id === 'steel-banner') {
      return (
        <div className="h-[420px] rounded-xl overflow-hidden border border-slate-300 bg-white">
          <div className="h-[105px] bg-slate-700 flex items-center justify-between px-6">
            <div>
              <p className="text-2xl font-bold text-white leading-tight">{sampleData.fullName}</p>
              <p className="text-sm text-slate-300 mt-0.5">{sampleData.role}</p>
              <p className="text-[10px] text-slate-400 mt-1">{sampleData.email} · {sampleData.phone}</p>
            </div>
            <img src={sampleProfileImage} alt="Sample" className="w-18 h-18 w-[72px] h-[72px] rounded-lg object-cover border-2 border-slate-500 shadow" />
          </div>
          <div className="p-5 grid grid-cols-[1fr_130px] gap-4">
            <div className="space-y-3">
              <div>
                <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-1">Profile</p>
                <div className="h-0.5 bg-slate-200 mb-2" />
                <p className="text-[10px] text-gray-600 leading-relaxed">{sampleData.summary}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-1">Experience</p>
                <div className="h-0.5 bg-slate-200 mb-2" />
                <p className="text-[10px] text-gray-700">Marketing Executive — 2024</p>
                <p className="text-[10px] text-gray-700">Sales Intern — 2022</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">Skills</p>
                <div className="h-0.5 bg-slate-200 mb-2" />
                <div className="space-y-1">
                  {['Communication','Leadership','SEO','Negotiation'].map(s => (
                    <div key={s} className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-500 flex-shrink-0" />
                      <p className="text-[9px] text-gray-700">{s}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">Education</p>
                <div className="h-0.5 bg-slate-200 mb-2" />
                <p className="text-[9px] text-gray-700">BSc Marketing</p>
                <p className="text-[9px] text-gray-500">Univ. of Colombo</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // ── New Free: Peach Card ──────────────────────────────────────────────
    if (template.id === 'peach-card') {
      return (
        <div className="h-[420px] rounded-xl overflow-hidden border border-orange-200 bg-orange-50 p-4">
          <div className="h-full flex flex-col gap-3">
            <div className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4 border border-orange-100">
              <img src={sampleProfileImage} alt="Sample" className="w-16 h-16 rounded-full object-cover border-4 border-orange-200 shadow" />
              <div>
                <p className="text-xl font-bold text-orange-900 leading-tight">{sampleData.fullName}</p>
                <p className="text-xs text-orange-600 mt-0.5">{sampleData.role}</p>
                <p className="text-[9px] text-orange-400 mt-0.5">{sampleData.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 flex-1">
              <div className="bg-white rounded-xl p-3 shadow-sm border border-orange-100 space-y-2">
                <p className="text-[10px] font-bold text-orange-700 uppercase tracking-wide">About Me</p>
                <p className="text-[9px] text-gray-600 leading-relaxed">{sampleData.summary}</p>
              </div>
              <div className="flex flex-col gap-3">
                <div className="bg-white rounded-xl p-3 shadow-sm border border-orange-100">
                  <p className="text-[10px] font-bold text-orange-700 uppercase tracking-wide mb-1">Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {['Communication','Leadership','SEO'].map(s => (
                      <span key={s} className="text-[8px] bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded-full">{s}</span>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-xl p-3 shadow-sm border border-orange-100">
                  <p className="text-[10px] font-bold text-orange-700 uppercase tracking-wide mb-1">Education</p>
                  <p className="text-[9px] text-gray-700">BSc Marketing</p>
                  <p className="text-[9px] text-gray-500">Univ. of Colombo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // ── New Free: Slate Timeline ──────────────────────────────────────────
    if (template.id === 'slate-timeline') {
      return (
        <div className="h-[420px] rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex">
          <div className="w-1 bg-slate-400 flex-shrink-0" />
          <div className="flex-1 p-5">
            <div className="flex items-center gap-4 mb-4 pb-3 border-b border-slate-200">
              <img src={sampleProfileImage} alt="Sample" className="w-14 h-14 rounded-full object-cover border-3 border-slate-300 shadow" />
              <div>
                <p className="text-xl font-bold text-slate-900">{sampleData.fullName}</p>
                <p className="text-xs text-slate-500">{sampleData.role}</p>
                <p className="text-[9px] text-slate-400">{sampleData.email}</p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Summary', text: sampleData.summary },
                { label: 'Experience', items: ['Marketing Executive — 2024', 'Sales Intern — 2022'] },
                { label: 'Skills', items: ['Communication', 'Leadership', 'SEO', 'Negotiation'] },
              ].map(({ label, text, items }) => (
                <div key={label} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-500 mt-0.5 flex-shrink-0" />
                    <div className="w-px flex-1 bg-slate-300 mt-1" />
                  </div>
                  <div className="pb-2">
                    <p className="text-[10px] font-bold text-slate-700 uppercase tracking-wide mb-1">{label}</p>
                    {text && <p className="text-[9px] text-gray-600 leading-relaxed">{text}</p>}
                    {items && items.map(i => <p key={i} className="text-[9px] text-gray-700">{i}</p>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // ── New Free: Copper Split ────────────────────────────────────────────
    if (template.id === 'copper-split') {
      return (
        <div className="h-[420px] rounded-xl overflow-hidden border border-amber-200 bg-white">
          <div className="relative h-[120px] bg-gradient-to-br from-amber-700 to-orange-500 overflow-hidden">
            <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full bg-white/10" />
            <div className="absolute -top-4 -left-4 w-20 h-20 rounded-full bg-white/10" />
            <div className="relative z-10 flex items-center gap-4 px-6 h-full">
              <img src={sampleProfileImage} alt="Sample" className="w-18 w-[72px] h-[72px] rounded-full object-cover border-4 border-white/80 shadow-lg" />
              <div>
                <p className="text-2xl font-black text-white leading-tight">{sampleData.fullName}</p>
                <p className="text-sm text-amber-100 mt-0.5">{sampleData.role}</p>
              </div>
            </div>
          </div>
          <div className="p-5 grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wide mb-1">Profile</p>
                <div className="h-0.5 bg-amber-200 mb-2" />
                <p className="text-[9px] text-gray-600 leading-relaxed">{sampleData.summary}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wide mb-1">Contact</p>
                <div className="h-0.5 bg-amber-200 mb-2" />
                <p className="text-[9px] text-gray-700">{sampleData.email}</p>
                <p className="text-[9px] text-gray-700">{sampleData.phone}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wide mb-1">Experience</p>
                <div className="h-0.5 bg-amber-200 mb-2" />
                <p className="text-[9px] text-gray-700">Marketing Executive — 2024</p>
                <p className="text-[9px] text-gray-700">Sales Intern — 2022</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wide mb-1">Skills</p>
                <div className="h-0.5 bg-amber-200 mb-2" />
                <div className="flex flex-wrap gap-1">
                  {['Communication','Leadership','SEO'].map(s => (
                    <span key={s} className="text-[8px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // ── New Free: Ice Blue ────────────────────────────────────────────────
    if (template.id === 'ice-blue') {
      return (
        <div className="h-[420px] rounded-xl overflow-hidden border border-sky-200 bg-gradient-to-b from-sky-100 to-blue-50">
          <div className="p-5 flex flex-col h-full gap-3">
            <div className="bg-white/80 backdrop-blur rounded-xl p-4 border border-sky-100 shadow-sm flex items-center gap-4">
              <img src={sampleProfileImage} alt="Sample" className="w-16 h-16 rounded-full object-cover border-4 border-sky-200 shadow" />
              <div className="flex-1">
                <p className="text-xl font-bold text-sky-900">{sampleData.fullName}</p>
                <p className="text-xs text-sky-600 mt-0.5">{sampleData.role}</p>
                <p className="text-[9px] text-sky-400 mt-0.5">{sampleData.email} · {sampleData.phone}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 flex-1">
              <div className="bg-white/70 backdrop-blur rounded-xl p-3 border border-sky-100 shadow-sm">
                <p className="text-[10px] font-bold text-sky-700 uppercase tracking-wide mb-1">About Me</p>
                <div className="h-px bg-sky-200 mb-2" />
                <p className="text-[9px] text-gray-600 leading-relaxed">{sampleData.summary}</p>
              </div>
              <div className="flex flex-col gap-3">
                <div className="bg-white/70 backdrop-blur rounded-xl p-3 border border-sky-100 shadow-sm">
                  <p className="text-[10px] font-bold text-sky-700 uppercase tracking-wide mb-1">Skills</p>
                  <div className="h-px bg-sky-200 mb-2" />
                  <div className="flex flex-wrap gap-1">
                    {['Communication','Leadership','SEO'].map(s => (
                      <span key={s} className="text-[8px] bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded-full border border-sky-200">{s}</span>
                    ))}
                  </div>
                </div>
                <div className="bg-white/70 backdrop-blur rounded-xl p-3 border border-sky-100 shadow-sm">
                  <p className="text-[10px] font-bold text-sky-700 uppercase tracking-wide mb-1">Education</p>
                  <div className="h-px bg-sky-200 mb-2" />
                  <p className="text-[9px] text-gray-700">BSc Marketing</p>
                  <p className="text-[9px] text-gray-500">Univ. of Colombo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Default fallback
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

  // ─── Premium modal ────────────────────────────────────────────────────────
  const PremiumModal = () => (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-yellow-400 to-amber-500 px-6 py-5 text-center">
          <p className="text-4xl mb-2">★</p>
          <h2 className="text-2xl font-bold text-gray-900">Premium Template</h2>
          <p className="text-sm text-amber-900 mt-1">Unlock exclusive designs for your CV</p>
        </div>
        <div className="p-6 space-y-4">
          <ul className="space-y-2 text-sm text-gray-700">
            {[
              'Access all 5 premium templates',
              'Unique layouts not available elsewhere',
              'PDF download with premium styling',
              'Priority support',
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="text-yellow-500 font-bold">✓</span> {item}
              </li>
            ))}
          </ul>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
            <p className="text-xs text-amber-700 font-semibold uppercase tracking-wide mb-1">Coming Soon</p>
            <p className="text-2xl font-bold text-gray-900">Premium Plan</p>
            <p className="text-xs text-gray-500 mt-1">Premium templates will be available in the next release.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowPremiumModal(false)}
            className="w-full py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );

  // ─── Live preview panel (right column) ───────────────────────────────────
  const LivePreview = () => {
    const tc = templateClasses;
    const isPremium = PREMIUM_IDS.has(selectedTemplate);

    if (isPremium) {
      return (
        <div className="relative">
          <div className="opacity-40 pointer-events-none">
            <LargeTemplatePreview template={templates.find((t) => t.id === selectedTemplate)} />
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 rounded-xl">
            <span className="text-5xl mb-3">🔒</span>
            <p className="text-white font-bold text-lg">Premium Template</p>
            <p className="text-white/80 text-sm mt-1">Unlock to use this design</p>
            <button
              type="button"
              onClick={() => setShowPremiumModal(true)}
              className="mt-4 px-5 py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 font-bold hover:from-yellow-300 hover:to-amber-400"
            >
              Unlock Premium
            </button>
          </div>
        </div>
      );
    }

    if (selectedTemplate === 'executive-sidebar') {
      return (
        <div className="border border-stone-300 bg-white overflow-hidden">
          <div className="grid grid-cols-[170px_1fr] min-h-[680px]">
            <div className="bg-stone-200 p-4 pt-28 relative">
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-28 h-28 rounded-full border-4 border-white bg-stone-400 shadow overflow-hidden">
                {form.profileImage ? <img src={form.profileImage} alt="Profile" className="w-full h-full object-cover" /> : null}
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
                  <ul className="text-xs text-zinc-700 list-disc pl-4 space-y-1">{parseMultiItems(form.education).map((item) => <li key={item}>{item}</li>)}</ul>
                ) : <p className="text-xs text-zinc-700 whitespace-pre-wrap">{previewLines(form.education)}</p>}
              </div>
              <div className="mb-5">
                <h4 className="text-sm font-bold tracking-wide text-zinc-800 border-b border-zinc-500 pb-1 mb-2">SKILLS</h4>
                {shouldUsePointForm(form.skills) ? (
                  <ul className="text-xs text-zinc-700 list-disc pl-4 space-y-1">{parseMultiItems(form.skills).map((item) => <li key={item}>{item}</li>)}</ul>
                ) : <p className="text-xs text-zinc-700 whitespace-pre-wrap">{previewLines(form.skills)}</p>}
              </div>
              {languageItems.length > 0 ? (
                <div>
                  <h4 className="text-sm font-bold tracking-wide text-zinc-800 border-b border-zinc-500 pb-1 mb-2">LANGUAGE</h4>
                  {shouldUsePointForm(form.languages) ? (
                    <ul className="text-xs text-zinc-700 list-disc pl-4 space-y-1">{parseMultiItems(form.languages).map((item) => <li key={item}>{item}</li>)}</ul>
                  ) : <p className="text-xs text-zinc-700 whitespace-pre-wrap">{previewLines(form.languages)}</p>}
                </div>
              ) : null}
            </div>
            <div className="bg-white">
              <div className="bg-zinc-900 text-white px-6 py-5 min-h-[100px] flex flex-col justify-center">
                <h3 className="text-4xl font-bold tracking-wide leading-none">{form.fullName || 'YOUR NAME'}</h3>
                <p className="text-base mt-2 text-zinc-200">{form.role || 'Professional Title'}</p>
              </div>
              <div className="p-6 space-y-5">
                {[
                  { label: 'ABOUT ME', value: form.summary },
                  { label: 'WORK EXPERIENCE', value: form.experience },
                  { label: 'PROJECTS', value: form.projects },
                  { label: 'REFERENCES', value: form.references },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <h4 className="font-semibold text-sm text-zinc-800 border-b border-zinc-300 pb-1 mb-2">{label}</h4>
                    {shouldUsePointForm(value) ? (
                      <ul className="text-sm text-zinc-700 list-disc pl-5 space-y-1">{parseMultiItems(value).map((item) => <li key={item}>{item}</li>)}</ul>
                    ) : <p className="text-sm text-zinc-700 whitespace-pre-wrap">{previewLines(value)}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Generic preview for all other free templates
    const bodyClass = tc.body || 'text-gray-800';
    const subClass = tc.sub || 'text-gray-500';
    return (
      <div className={`border rounded-xl overflow-hidden ${tc.container}`}>
        <div className="p-6 border-b border-inherit flex items-start gap-4">
          {form.profileImage ? (
            <img src={form.profileImage} alt="Profile" className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 flex-shrink-0" />
          ) : null}
          <div className="flex-1">
            <h2 className={`text-3xl font-bold ${tc.name}`}>{form.fullName || 'Your Name'}</h2>
            <p className={`text-base mt-1 ${subClass}`}>{form.role || 'Professional Title'}</p>
            <p className={`text-sm mt-1 ${subClass}`}>{[form.email, form.phone, form.address].filter(Boolean).join(' · ')}</p>
          </div>
        </div>
        <div className="p-6 space-y-5">
          {[
            { label: 'Professional Summary', value: form.summary },
            { label: 'Education', value: form.education },
            { label: 'Skills', value: form.skills },
            { label: 'Work Experience', value: form.experience },
            { label: 'Languages', value: form.languages },
            { label: 'References', value: form.references },
            { label: 'Projects', value: form.projects },
          ].map(({ label, value }) => {
            const content = String(value || '').trim();
            if (!content) return null;
            return (
              <div key={label}>
                <h3 className={`text-sm font-bold pb-1 mb-2 ${tc.heading}`}>{label}</h3>
                {shouldUsePointForm(value) ? (
                  <ul className={`text-sm list-disc pl-5 space-y-1 ${bodyClass}`}>
                    {parseMultiItems(value).map((item) => <li key={item}>{item}</li>)}
                  </ul>
                ) : <p className={`text-sm whitespace-pre-wrap ${bodyClass}`}>{content}</p>}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ─── Main render ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {showPremiumModal && <PremiumModal />}

      <div className="max-w-7xl mx-auto px-4">
        {!selectedTemplate ? (
          <div>
            <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Choose a CV Template</h1>
                <p className="text-gray-600 mt-1">
                  <span className="inline-flex items-center gap-1 text-yellow-600 font-semibold">★ Premium</span>
                  {' '}templates are marked with a gold badge.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/cv-saved')}
                className="text-sm px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                View Saved CVs
              </button>
            </div>

            {/* Free templates section */}
            <h2 className="text-lg font-semibold text-gray-700 mt-6 mb-3">Free Templates</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {freeTemplates.map((template) => (
                <button type="button" key={template.id} onClick={() => setInspectTemplateId(template.id)} className="text-left">
                  <TemplatePreviewCard template={template} />
                </button>
              ))}
            </div>

            {/* Premium templates section */}
            <h2 className="text-lg font-semibold text-gray-700 mt-8 mb-1 flex items-center gap-2">
              <span className="text-yellow-500">★</span> Premium Templates
              <span className="text-xs font-normal text-gray-500 bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Coming Soon</span>
            </h2>
            <p className="text-sm text-gray-500 mb-3">Exclusive designs with unique layouts and premium PDF styling.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {premiumTemplates.map((template) => (
                <button
                  type="button"
                  key={template.id}
                  onClick={() => { setInspectTemplateId(template.id); }}
                  className="text-left"
                >
                  <TemplatePreviewCard template={template} />
                </button>
              ))}
            </div>

            {/* Inspect / preview modal */}
            {inspectTemplateId ? (() => {
              const t = templates.find((t) => t.id === inspectTemplateId);
              const isPremium = PREMIUM_IDS.has(inspectTemplateId);
              return (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                  <div className="w-full max-w-4xl bg-white rounded-xl shadow-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-2xl font-bold text-gray-900">{t?.name}</h2>
                          {isPremium && (
                            <span className="text-xs font-bold bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-2 py-0.5 rounded-full">★ PREMIUM</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{t?.description}</p>
                      </div>
                      <button type="button" onClick={() => setInspectTemplateId(null)} className="px-3 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-50">Close</button>
                    </div>

                    <LargeTemplatePreview template={t} />

                    <div className="mt-4 flex justify-end gap-3">
                      {isPremium ? (
                        <button
                          type="button"
                          onClick={() => { setInspectTemplateId(null); setShowPremiumModal(true); }}
                          className="bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 font-bold px-5 py-2 rounded-lg hover:from-yellow-300 hover:to-amber-400"
                        >
                          ★ Unlock Premium
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => { setSelectedTemplate(inspectTemplateId); setInspectTemplateId(null); useExampleDetails({ openPreview: true }); }}
                            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
                          >
                            Use With Example Data
                          </button>
                          <button
                            type="button"
                            onClick={() => { setSelectedTemplate(inspectTemplateId); setInspectTemplateId(null); setPreview(false); }}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                          >
                            Use This Template
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })() : null}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: form */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h1 className="text-3xl font-bold text-gray-900">CV Details</h1>
                <button type="button" onClick={() => setSelectedTemplate(null)} className="text-sm text-indigo-600 hover:text-indigo-800 font-semibold">Change Template</button>
              </div>
              <p className="text-sm text-gray-600">
                Selected Template: <span className="font-semibold text-gray-800">{templates.find((t) => t.id === selectedTemplate)?.name}</span>
                {PREMIUM_IDS.has(selectedTemplate) && <span className="ml-2 text-xs font-bold text-yellow-600">★ Premium</span>}
              </p>
              <div>
                <button type="button" onClick={useExampleDetails} className="text-sm px-3 py-2 rounded-lg border border-indigo-300 text-indigo-700 hover:bg-indigo-50">Use Example Details</button>
              </div>
              {loadingTemplate ? <p className="text-sm text-gray-500">Loading saved CV...</p> : null}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">CV Title (optional)</label>
                <input type="text" value={cvTitle} onChange={(e) => setCvTitle(e.target.value)} placeholder="e.g. Marketing CV - April 2026" className="w-full border border-gray-300 rounded px-3 py-2" />
              </div>
              {saveMessage ? <p className="text-sm text-emerald-600">{saveMessage}</p> : null}
              {saveError ? <p className="text-sm text-red-600">{saveError}</p> : null}
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
                <input type="file" accept="image/png, image/jpeg" onChange={handleImageUpload} className={getFieldClassName('profileImage') + ' bg-white'} />
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
                <button type="button" onClick={generatePreview} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">Generate CV Preview</button>
                <button type="button" onClick={saveTemplate} disabled={saving} className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-70">
                  {saving ? 'Saving...' : editingTemplateId ? 'Update CV' : 'Save CV'}
                </button>
                {editingTemplateId ? (
                  <button type="button" onClick={deleteTemplate} disabled={saving} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-70">Delete CV</button>
                ) : null}
                {preview && !PREMIUM_IDS.has(selectedTemplate) ? (
                  <button type="button" onClick={downloadPdf} className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-black">Download PDF</button>
                ) : null}
              </div>
            </div>

            {/* Right: preview */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Preview</h2>
              {!preview ? (
                <p className="text-gray-500">Fill your details and click "Generate CV Preview".</p>
              ) : (
                <LivePreview />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CVGenerator;
