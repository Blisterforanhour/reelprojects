import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SkillSuggestionRequest {
  projectDescription: string;
  projectGoals?: string;
}

interface SkillSuggestions {
  technical: string[];
  soft: string[];
  creative: string[];
  analytical: string[];
  physical: string[];
  regulatory: string[];
  language: string[];
  certification: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { projectDescription, projectGoals }: SkillSuggestionRequest = await req.json()

    // Generate comprehensive skill suggestions for all professions
    const suggestions: SkillSuggestions = generateUniversalSkillSuggestions(projectDescription, projectGoals);

    return new Response(
      JSON.stringify(suggestions),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})

function generateUniversalSkillSuggestions(description: string, goals?: string): SkillSuggestions {
  const lowerDescription = description.toLowerCase();
  const lowerGoals = goals?.toLowerCase() || '';
  const combinedText = `${lowerDescription} ${lowerGoals}`;

  const suggestions: SkillSuggestions = {
    technical: [],
    soft: [],
    creative: [],
    analytical: [],
    physical: [],
    regulatory: [],
    language: [],
    certification: []
  };

  // HEALTHCARE PROFESSION
  if (isHealthcareProfession(combinedText)) {
    suggestions.technical.push('Electronic Health Records', 'Medical Imaging', 'Clinical Decision Support', 'Patient Monitoring', 'Telemedicine', 'Medical Devices');
    suggestions.soft.push('Patient Communication', 'Empathy', 'Crisis Management', 'Team Collaboration', 'Cultural Sensitivity', 'Stress Management');
    suggestions.analytical.push('Clinical Assessment', 'Diagnostic Reasoning', 'Evidence-Based Practice', 'Quality Improvement', 'Risk Assessment', 'Data Analysis');
    suggestions.physical.push('Manual Dexterity', 'Physical Stamina', 'Hand-Eye Coordination', 'Fine Motor Skills', 'Physical Assessment');
    suggestions.regulatory.push('HIPAA Compliance', 'Patient Safety', 'Medical Ethics', 'Joint Commission Standards', 'FDA Regulations');
    suggestions.certification.push('Medical License', 'CPR Certification', 'Specialty Certifications', 'Continuing Education', 'Board Certification');
  }

  // EDUCATION PROFESSION
  else if (isEducationProfession(combinedText)) {
    suggestions.technical.push('Learning Management Systems', 'Educational Technology', 'Online Teaching Tools', 'Assessment Platforms', 'Digital Literacy');
    suggestions.soft.push('Classroom Management', 'Student Engagement', 'Patience', 'Adaptability', 'Mentoring', 'Conflict Resolution');
    suggestions.creative.push('Curriculum Design', 'Lesson Planning', 'Educational Content Creation', 'Interactive Learning', 'Storytelling');
    suggestions.analytical.push('Student Assessment', 'Learning Analytics', 'Educational Research', 'Data-Driven Instruction', 'Performance Analysis');
    suggestions.regulatory.push('FERPA Compliance', 'Special Education Law', 'Child Protection', 'Academic Standards', 'Accessibility Requirements');
    suggestions.certification.push('Teaching License', 'Subject Area Certification', 'ESL Certification', 'Special Education Certification');
  }

  // LEGAL PROFESSION
  else if (isLegalProfession(combinedText)) {
    suggestions.technical.push('Legal Research Software', 'Case Management Systems', 'Document Review Tools', 'E-Discovery', 'Legal Databases');
    suggestions.soft.push('Negotiation', 'Client Relations', 'Oral Advocacy', 'Professional Ethics', 'Critical Thinking', 'Attention to Detail');
    suggestions.analytical.push('Legal Analysis', 'Case Law Research', 'Statutory Interpretation', 'Risk Assessment', 'Contract Analysis');
    suggestions.regulatory.push('Bar Ethics Rules', 'Court Procedures', 'Legal Compliance', 'Professional Responsibility', 'Confidentiality');
    suggestions.certification.push('Bar Admission', 'Specialty Certifications', 'Continuing Legal Education', 'Paralegal Certification');
  }

  // FINANCE PROFESSION
  else if (isFinanceProfession(combinedText)) {
    suggestions.technical.push('Financial Software', 'Trading Platforms', 'Risk Management Systems', 'Portfolio Management', 'Financial Modeling');
    suggestions.soft.push('Client Relations', 'Risk Communication', 'Ethical Decision Making', 'Stress Management', 'Negotiation');
    suggestions.analytical.push('Financial Analysis', 'Market Research', 'Risk Assessment', 'Investment Analysis', 'Performance Metrics');
    suggestions.regulatory.push('SEC Compliance', 'Anti-Money Laundering', 'Fiduciary Responsibility', 'Financial Regulations', 'Audit Standards');
    suggestions.certification.push('CPA', 'CFA', 'FRM', 'Series Licenses', 'Financial Planning Certification');
  }

  // MARKETING PROFESSION
  else if (isMarketingProfession(combinedText)) {
    suggestions.technical.push('Marketing Analytics', 'CRM Systems', 'Social Media Platforms', 'Email Marketing', 'SEO Tools', 'Content Management');
    suggestions.soft.push('Brand Storytelling', 'Customer Empathy', 'Persuasion', 'Creativity', 'Trend Analysis', 'Cross-functional Collaboration');
    suggestions.creative.push('Content Creation', 'Visual Design', 'Campaign Development', 'Brand Strategy', 'Creative Writing', 'Video Production');
    suggestions.analytical.push('Market Research', 'Consumer Behavior Analysis', 'Campaign Performance', 'ROI Analysis', 'A/B Testing');
    suggestions.regulatory.push('GDPR Compliance', 'Advertising Standards', 'Data Privacy', 'FTC Guidelines', 'Email Regulations');
    suggestions.certification.push('Google Analytics', 'HubSpot Certification', 'Facebook Blueprint', 'Digital Marketing Certification');
  }

  // ENGINEERING PROFESSION
  else if (isEngineeringProfession(combinedText)) {
    suggestions.technical.push('CAD Software', 'Simulation Tools', 'Project Management', 'Quality Control Systems', 'Technical Documentation');
    suggestions.soft.push('Problem Solving', 'Team Leadership', 'Client Communication', 'Project Management', 'Innovation', 'Continuous Learning');
    suggestions.analytical.push('Systems Analysis', 'Performance Optimization', 'Risk Assessment', 'Data Analysis', 'Research Methodology');
    suggestions.physical.push('Technical Skills', 'Equipment Operation', 'Safety Protocols', 'Manual Dexterity', 'Spatial Reasoning');
    suggestions.regulatory.push('Safety Standards', 'Environmental Regulations', 'Quality Standards', 'Professional Ethics', 'Code Compliance');
    suggestions.certification.push('Professional Engineer License', 'Industry Certifications', 'Safety Certifications', 'Quality Certifications');
  }

  // SALES PROFESSION
  else if (isSalesProfession(combinedText)) {
    suggestions.technical.push('CRM Software', 'Sales Analytics', 'Lead Generation Tools', 'Presentation Software', 'Communication Platforms');
    suggestions.soft.push('Relationship Building', 'Persuasion', 'Active Listening', 'Resilience', 'Emotional Intelligence', 'Negotiation');
    suggestions.analytical.push('Sales Forecasting', 'Market Analysis', 'Customer Segmentation', 'Performance Metrics', 'Competitive Analysis');
    suggestions.certification.push('Sales Certifications', 'Product Certifications', 'Industry Credentials', 'Professional Development');
  }

  // DESIGN PROFESSION
  else if (isDesignProfession(combinedText)) {
    suggestions.technical.push('Design Software', 'Prototyping Tools', 'Version Control', 'Collaboration Platforms', 'Web Technologies');
    suggestions.soft.push('Creative Problem Solving', 'Client Communication', 'Feedback Integration', 'Time Management', 'Attention to Detail');
    suggestions.creative.push('Visual Design', 'User Experience Design', 'Branding', 'Typography', 'Color Theory', 'Layout Design');
    suggestions.analytical.push('User Research', 'Usability Testing', 'Design Metrics', 'A/B Testing', 'Market Research');
    suggestions.certification.push('Design Certifications', 'UX Certifications', 'Adobe Certifications', 'Industry Credentials');
  }

  // MANUFACTURING PROFESSION
  else if (isManufacturingProfession(combinedText)) {
    suggestions.technical.push('Manufacturing Systems', 'Quality Control', 'Automation', 'Supply Chain Management', 'Production Planning');
    suggestions.soft.push('Team Leadership', 'Safety Awareness', 'Continuous Improvement', 'Problem Solving', 'Communication');
    suggestions.analytical.push('Process Optimization', 'Quality Analysis', 'Performance Metrics', 'Cost Analysis', 'Efficiency Analysis');
    suggestions.physical.push('Equipment Operation', 'Manual Skills', 'Safety Protocols', 'Technical Maintenance', 'Quality Inspection');
    suggestions.regulatory.push('Safety Standards', 'Quality Standards', 'Environmental Compliance', 'OSHA Regulations', 'ISO Standards');
    suggestions.certification.push('Quality Certifications', 'Safety Certifications', 'Lean Manufacturing', 'Six Sigma');
  }

  // RESEARCH PROFESSION
  else if (isResearchProfession(combinedText)) {
    suggestions.technical.push('Research Software', 'Statistical Tools', 'Data Collection', 'Laboratory Equipment', 'Documentation Systems');
    suggestions.soft.push('Critical Thinking', 'Attention to Detail', 'Persistence', 'Collaboration', 'Communication', 'Ethics');
    suggestions.analytical.push('Research Methodology', 'Statistical Analysis', 'Data Interpretation', 'Literature Review', 'Hypothesis Testing');
    suggestions.regulatory.push('Research Ethics', 'IRB Compliance', 'Data Privacy', 'Publication Standards', 'Grant Compliance');
    suggestions.certification.push('Research Certifications', 'Statistical Certifications', 'Ethics Training', 'Specialized Credentials');
  }

  // Add universal skills for any profession
  addUniversalSkills(suggestions, combinedText);

  // Remove duplicates and limit results
  Object.keys(suggestions).forEach(category => {
    const categoryKey = category as keyof SkillSuggestions;
    suggestions[categoryKey] = [...new Set(suggestions[categoryKey])].slice(0, 10);
  });

  return suggestions;
}

// Profession detection functions
function isHealthcareProfession(text: string): boolean {
  const keywords = ['medical', 'patient', 'clinical', 'diagnosis', 'treatment', 'healthcare', 'nursing', 'therapy', 'pharmaceutical', 'surgery', 'hospital', 'clinic'];
  return keywords.some(keyword => text.includes(keyword));
}

function isEducationProfession(text: string): boolean {
  const keywords = ['teaching', 'student', 'curriculum', 'lesson', 'classroom', 'education', 'learning', 'academic', 'school', 'university', 'training'];
  return keywords.some(keyword => text.includes(keyword));
}

function isLegalProfession(text: string): boolean {
  const keywords = ['legal', 'law', 'court', 'contract', 'litigation', 'compliance', 'regulation', 'attorney', 'lawyer', 'paralegal', 'case'];
  return keywords.some(keyword => text.includes(keyword));
}

function isFinanceProfession(text: string): boolean {
  const keywords = ['financial', 'investment', 'banking', 'accounting', 'budget', 'audit', 'tax', 'portfolio', 'trading', 'insurance', 'loan', 'credit'];
  return keywords.some(keyword => text.includes(keyword));
}

function isMarketingProfession(text: string): boolean {
  const keywords = ['marketing', 'brand', 'campaign', 'advertising', 'promotion', 'social media', 'content', 'seo', 'digital marketing', 'customer acquisition'];
  return keywords.some(keyword => text.includes(keyword));
}

function isEngineeringProfession(text: string): boolean {
  const keywords = ['engineering', 'technical', 'system', 'architecture', 'infrastructure', 'mechanical', 'electrical', 'civil', 'chemical'];
  return keywords.some(keyword => text.includes(keyword));
}

function isSalesProfession(text: string): boolean {
  const keywords = ['sales', 'selling', 'customer', 'client', 'revenue', 'lead', 'prospect', 'negotiation', 'deal', 'quota', 'crm'];
  return keywords.some(keyword => text.includes(keyword));
}

function isDesignProfession(text: string): boolean {
  const keywords = ['design', 'creative', 'visual', 'graphic', 'ui', 'ux', 'branding', 'layout', 'typography', 'color', 'aesthetic'];
  return keywords.some(keyword => text.includes(keyword));
}

function isManufacturingProfession(text: string): boolean {
  const keywords = ['manufacturing', 'production', 'assembly', 'quality control', 'supply chain', 'logistics', 'inventory', 'operations'];
  return keywords.some(keyword => text.includes(keyword));
}

function isResearchProfession(text: string): boolean {
  const keywords = ['research', 'analysis', 'study', 'experiment', 'data', 'methodology', 'hypothesis', 'findings', 'publication'];
  return keywords.some(keyword => text.includes(keyword));
}

function addUniversalSkills(suggestions: SkillSuggestions, text: string): void {
  // Universal soft skills for any profession
  const universalSoftSkills = [
    'Communication', 'Problem Solving', 'Time Management', 'Adaptability',
    'Critical Thinking', 'Teamwork', 'Leadership', 'Emotional Intelligence',
    'Continuous Learning', 'Work Ethic', 'Attention to Detail', 'Creativity'
  ];
  suggestions.soft.push(...universalSoftSkills);

  // Universal technical skills based on modern workplace
  const universalTechnicalSkills = [
    'Microsoft Office', 'Email Communication', 'Video Conferencing',
    'Project Management Tools', 'Data Entry', 'Internet Research',
    'Digital Literacy', 'Cloud Storage', 'Basic Troubleshooting'
  ];
  suggestions.technical.push(...universalTechnicalSkills);

  // Language skills based on context
  if (text.includes('international') || text.includes('global') || text.includes('multilingual')) {
    suggestions.language.push('English', 'Spanish', 'French', 'German', 'Mandarin', 'Business Communication');
  }

  // Add context-specific skills
  if (text.includes('customer') || text.includes('client')) {
    suggestions.soft.push('Customer Service', 'Relationship Building', 'Conflict Resolution');
  }

  if (text.includes('team') || text.includes('collaborate')) {
    suggestions.soft.push('Team Collaboration', 'Cross-functional Teamwork', 'Meeting Facilitation');
  }

  if (text.includes('data') || text.includes('analysis')) {
    suggestions.analytical.push('Data Analysis', 'Reporting', 'Excel', 'Statistical Analysis', 'Data Visualization');
  }

  if (text.includes('presentation') || text.includes('public speaking')) {
    suggestions.soft.push('Presentation Skills', 'Public Speaking', 'Visual Communication');
  }

  if (text.includes('project') || text.includes('manage')) {
    suggestions.soft.push('Project Management', 'Resource Planning', 'Risk Management', 'Stakeholder Management');
    suggestions.certification.push('PMP', 'Agile Certification', 'Scrum Master');
  }
}