import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ProjectAnalysisRequest {
  projectDescription: string;
  projectGoals?: string;
  targetSkills: string[];
}

interface ProjectSkill {
  id: string;
  name: string;
  category: 'technical' | 'soft' | 'language' | 'certification' | 'creative' | 'analytical' | 'physical' | 'regulatory';
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master';
  demonstrationMethod: 'code' | 'video' | 'documentation' | 'presentation' | 'live-demo' | 'portfolio' | 'case-study' | 'simulation' | 'performance' | 'assessment';
  requirements: string;
  aiPrompt?: string;
}

interface ProjectAnalysisResponse {
  clarity_score: number;
  feasibility_score: number;
  identified_risks: string[];
  suggested_technologies: string[];
  detected_skills: ProjectSkill[];
  skill_mapping: Array<{
    skill: string;
    demonstration_method: string;
    complexity_level: number;
    verification_criteria: string[];
  }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { projectDescription, projectGoals, targetSkills }: ProjectAnalysisRequest = await req.json()

    // Enhanced AI analysis with universal profession support
    const analysisResult: ProjectAnalysisResponse = await generateUniversalAnalysis(
      projectDescription, 
      projectGoals, 
      targetSkills
    );

    return new Response(
      JSON.stringify(analysisResult),
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

async function generateUniversalAnalysis(
  projectDescription: string, 
  projectGoals: string = '', 
  targetSkills: string[]
): Promise<ProjectAnalysisResponse> {
  
  // Universal profession detection and analysis
  const profession = detectProfession(projectDescription, projectGoals);
  const industryContext = getIndustryContext(profession);
  
  return {
    clarity_score: calculateClarityScore(projectDescription, projectGoals, profession),
    feasibility_score: calculateFeasibilityScore(projectDescription, targetSkills, profession),
    identified_risks: identifyUniversalRisks(projectDescription, profession, targetSkills),
    suggested_technologies: suggestUniversalTools(projectDescription, profession),
    detected_skills: targetSkills.map((skill, index) => ({
      id: `skill_${index + 1}`,
      name: skill,
      category: categorizeUniversalSkill(skill, profession),
      proficiency: 'intermediate',
      demonstrationMethod: getUniversalDemoMethod(skill, profession),
      requirements: generateUniversalRequirement(skill, profession, industryContext),
      aiPrompt: generateUniversalVerificationStrategy(skill, profession, industryContext)
    })),
    skill_mapping: targetSkills.map(skill => ({
      skill,
      demonstration_method: getUniversalDemoMethod(skill, profession),
      complexity_level: calculateUniversalComplexity(skill, profession),
      verification_criteria: generateUniversalCriteria(skill, profession)
    }))
  };
}

function detectProfession(description: string, goals: string): string {
  const text = `${description} ${goals}`.toLowerCase();
  
  // Comprehensive profession detection
  const professionKeywords = {
    'healthcare': ['medical', 'patient', 'clinical', 'diagnosis', 'treatment', 'healthcare', 'nursing', 'therapy', 'pharmaceutical', 'surgery', 'hospital', 'clinic'],
    'education': ['teaching', 'student', 'curriculum', 'lesson', 'classroom', 'education', 'learning', 'academic', 'school', 'university', 'training'],
    'finance': ['financial', 'investment', 'banking', 'accounting', 'budget', 'audit', 'tax', 'portfolio', 'trading', 'insurance', 'loan', 'credit'],
    'legal': ['legal', 'law', 'court', 'contract', 'litigation', 'compliance', 'regulation', 'attorney', 'lawyer', 'paralegal', 'case'],
    'marketing': ['marketing', 'brand', 'campaign', 'advertising', 'promotion', 'social media', 'content', 'seo', 'digital marketing', 'customer acquisition'],
    'sales': ['sales', 'selling', 'customer', 'client', 'revenue', 'lead', 'prospect', 'negotiation', 'deal', 'quota', 'crm'],
    'hr': ['human resources', 'recruitment', 'hiring', 'employee', 'talent', 'performance', 'compensation', 'benefits', 'onboarding'],
    'design': ['design', 'creative', 'visual', 'graphic', 'ui', 'ux', 'branding', 'layout', 'typography', 'color', 'aesthetic'],
    'engineering': ['engineering', 'technical', 'system', 'architecture', 'infrastructure', 'mechanical', 'electrical', 'civil', 'chemical'],
    'technology': ['software', 'programming', 'development', 'coding', 'app', 'website', 'database', 'api', 'algorithm', 'tech'],
    'manufacturing': ['manufacturing', 'production', 'assembly', 'quality control', 'supply chain', 'logistics', 'inventory', 'operations'],
    'research': ['research', 'analysis', 'study', 'experiment', 'data', 'methodology', 'hypothesis', 'findings', 'publication'],
    'consulting': ['consulting', 'advisory', 'strategy', 'optimization', 'improvement', 'transformation', 'analysis', 'recommendation'],
    'media': ['media', 'journalism', 'content creation', 'broadcasting', 'publishing', 'video production', 'photography', 'writing'],
    'hospitality': ['hospitality', 'hotel', 'restaurant', 'tourism', 'service', 'guest', 'event planning', 'catering', 'travel'],
    'retail': ['retail', 'store', 'merchandise', 'inventory', 'customer service', 'point of sale', 'shopping', 'product'],
    'nonprofit': ['nonprofit', 'charity', 'volunteer', 'community', 'social impact', 'fundraising', 'grant', 'mission'],
    'agriculture': ['agriculture', 'farming', 'crop', 'livestock', 'soil', 'harvest', 'irrigation', 'sustainable farming'],
    'construction': ['construction', 'building', 'contractor', 'project management', 'safety', 'blueprint', 'renovation'],
    'transportation': ['transportation', 'logistics', 'shipping', 'delivery', 'fleet', 'route', 'supply chain', 'warehouse'],
    'energy': ['energy', 'renewable', 'solar', 'wind', 'oil', 'gas', 'power', 'grid', 'sustainability', 'utilities'],
    'real_estate': ['real estate', 'property', 'housing', 'commercial', 'residential', 'lease', 'mortgage', 'appraisal'],
    'sports': ['sports', 'athletic', 'fitness', 'coaching', 'training', 'performance', 'competition', 'team', 'exercise'],
    'arts': ['art', 'creative', 'painting', 'sculpture', 'music', 'theater', 'dance', 'performance', 'gallery', 'exhibition']
  };

  for (const [profession, keywords] of Object.entries(professionKeywords)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return profession;
    }
  }

  return 'general'; // Default fallback
}

function getIndustryContext(profession: string): any {
  const contexts = {
    'healthcare': {
      regulations: ['HIPAA', 'FDA', 'Joint Commission'],
      tools: ['EMR', 'PACS', 'Clinical Decision Support'],
      metrics: ['Patient Outcomes', 'Safety Scores', 'Compliance Rates'],
      stakeholders: ['Patients', 'Physicians', 'Nurses', 'Administrators']
    },
    'education': {
      regulations: ['FERPA', 'ADA', 'Title IX'],
      tools: ['LMS', 'Assessment Tools', 'Educational Technology'],
      metrics: ['Student Achievement', 'Engagement', 'Retention'],
      stakeholders: ['Students', 'Parents', 'Teachers', 'Administrators']
    },
    'finance': {
      regulations: ['SOX', 'GDPR', 'PCI DSS', 'Basel III'],
      tools: ['Financial Software', 'Risk Management', 'Trading Platforms'],
      metrics: ['ROI', 'Risk Metrics', 'Compliance Scores'],
      stakeholders: ['Clients', 'Regulators', 'Shareholders', 'Auditors']
    },
    'legal': {
      regulations: ['Bar Standards', 'Ethics Rules', 'Court Procedures'],
      tools: ['Case Management', 'Legal Research', 'Document Review'],
      metrics: ['Case Success Rate', 'Client Satisfaction', 'Billable Hours'],
      stakeholders: ['Clients', 'Courts', 'Opposing Counsel', 'Judges']
    },
    'marketing': {
      regulations: ['GDPR', 'CAN-SPAM', 'FTC Guidelines'],
      tools: ['Analytics', 'CRM', 'Marketing Automation', 'Social Media'],
      metrics: ['ROI', 'Conversion Rates', 'Brand Awareness'],
      stakeholders: ['Customers', 'Sales Team', 'Management', 'Partners']
    },
    // Add more contexts as needed
    'general': {
      regulations: ['Industry Standards', 'Best Practices'],
      tools: ['Project Management', 'Communication Tools'],
      metrics: ['Quality', 'Efficiency', 'Satisfaction'],
      stakeholders: ['Team Members', 'Clients', 'Management']
    }
  };

  return contexts[profession] || contexts['general'];
}

function categorizeUniversalSkill(skill: string, profession: string): ProjectSkill['category'] {
  const skillLower = skill.toLowerCase();
  
  // Technical skills (broad definition)
  const technicalKeywords = ['software', 'programming', 'coding', 'system', 'database', 'network', 'security', 'analysis', 'research', 'methodology', 'process', 'procedure', 'equipment', 'tool', 'platform', 'application'];
  
  // Creative skills
  const creativeKeywords = ['design', 'creative', 'artistic', 'visual', 'graphic', 'photography', 'video', 'writing', 'content', 'branding', 'storytelling', 'innovation'];
  
  // Analytical skills
  const analyticalKeywords = ['analysis', 'data', 'research', 'statistics', 'metrics', 'reporting', 'evaluation', 'assessment', 'investigation', 'audit'];
  
  // Physical skills
  const physicalKeywords = ['physical', 'manual', 'dexterity', 'coordination', 'strength', 'endurance', 'athletic', 'motor', 'hands-on'];
  
  // Regulatory/Compliance skills
  const regulatoryKeywords = ['compliance', 'regulation', 'legal', 'policy', 'standard', 'audit', 'governance', 'risk', 'safety', 'quality assurance'];
  
  // Soft skills
  const softKeywords = ['leadership', 'communication', 'management', 'collaboration', 'teamwork', 'negotiation', 'customer service', 'problem solving', 'critical thinking', 'time management'];
  
  // Language skills
  const languageKeywords = ['language', 'translation', 'interpretation', 'multilingual', 'communication', 'writing', 'speaking'];
  
  // Certification skills
  const certificationKeywords = ['certified', 'certification', 'license', 'accredited', 'credential', 'qualification'];

  if (technicalKeywords.some(keyword => skillLower.includes(keyword))) return 'technical';
  if (creativeKeywords.some(keyword => skillLower.includes(keyword))) return 'creative';
  if (analyticalKeywords.some(keyword => skillLower.includes(keyword))) return 'analytical';
  if (physicalKeywords.some(keyword => skillLower.includes(keyword))) return 'physical';
  if (regulatoryKeywords.some(keyword => skillLower.includes(keyword))) return 'regulatory';
  if (languageKeywords.some(keyword => skillLower.includes(keyword))) return 'language';
  if (certificationKeywords.some(keyword => skillLower.includes(keyword))) return 'certification';
  if (softKeywords.some(keyword => skillLower.includes(keyword))) return 'soft';
  
  return 'technical'; // Default
}

function getUniversalDemoMethod(skill: string, profession: string): ProjectSkill['demonstrationMethod'] {
  const skillLower = skill.toLowerCase();
  
  // Profession-specific demonstration preferences
  const professionMethods = {
    'healthcare': {
      'clinical': 'case-study',
      'patient': 'simulation',
      'medical': 'case-study',
      'diagnosis': 'case-study'
    },
    'education': {
      'teaching': 'video',
      'curriculum': 'documentation',
      'lesson': 'presentation',
      'classroom': 'video'
    },
    'legal': {
      'legal': 'case-study',
      'contract': 'documentation',
      'litigation': 'case-study',
      'research': 'documentation'
    },
    'design': {
      'design': 'portfolio',
      'creative': 'portfolio',
      'visual': 'portfolio',
      'graphic': 'portfolio'
    },
    'sales': {
      'sales': 'video',
      'negotiation': 'video',
      'presentation': 'presentation',
      'customer': 'case-study'
    }
  };

  // Check profession-specific methods first
  const professionSpecific = professionMethods[profession];
  if (professionSpecific) {
    for (const [keyword, method] of Object.entries(professionSpecific)) {
      if (skillLower.includes(keyword)) {
        return method as ProjectSkill['demonstrationMethod'];
      }
    }
  }

  // Universal skill-based methods
  if (skillLower.includes('programming') || skillLower.includes('coding') || skillLower.includes('development')) return 'code';
  if (skillLower.includes('presentation') || skillLower.includes('speaking') || skillLower.includes('communication')) return 'presentation';
  if (skillLower.includes('design') || skillLower.includes('creative') || skillLower.includes('visual')) return 'portfolio';
  if (skillLower.includes('analysis') || skillLower.includes('research') || skillLower.includes('documentation')) return 'documentation';
  if (skillLower.includes('performance') || skillLower.includes('demonstration') || skillLower.includes('practical')) return 'video';
  if (skillLower.includes('assessment') || skillLower.includes('evaluation') || skillLower.includes('testing')) return 'assessment';
  if (skillLower.includes('simulation') || skillLower.includes('modeling') || skillLower.includes('scenario')) return 'simulation';
  
  return 'video'; // Default versatile method
}

function generateUniversalRequirement(skill: string, profession: string, context: any): string {
  const category = categorizeUniversalSkill(skill, profession);
  
  const templates = {
    'technical': `Demonstrate ${skill} through practical application with clear methodology, documentation of process, and measurable outcomes relevant to ${profession}`,
    'creative': `Showcase ${skill} through a comprehensive portfolio demonstrating range, creativity, and professional application in ${profession} context`,
    'analytical': `Present ${skill} through detailed analysis, methodology explanation, data interpretation, and actionable insights for ${profession}`,
    'physical': `Demonstrate ${skill} through safe, competent performance with proper technique and adherence to ${profession} standards`,
    'regulatory': `Show ${skill} knowledge through compliance examples, risk assessment, and practical application of regulations in ${profession}`,
    'soft': `Demonstrate ${skill} through specific examples, measurable outcomes, and real-world application in ${profession} scenarios`,
    'language': `Demonstrate ${skill} proficiency through clear communication, professional usage, and contextual application in ${profession}`,
    'certification': `Provide evidence of ${skill} certification and demonstrate practical application of certified knowledge in ${profession}`
  };

  return templates[category] || `Demonstrate practical application of ${skill} with clear examples and professional relevance to ${profession}`;
}

function generateUniversalVerificationStrategy(skill: string, profession: string, context: any): string {
  const category = categorizeUniversalSkill(skill, profession);
  
  const strategies = {
    'technical': `Create a comprehensive demonstration of ${skill} showing problem-solving approach, technical competency, and industry best practices for ${profession}`,
    'creative': `Develop a portfolio piece showcasing ${skill} with creative process documentation, iteration examples, and professional application in ${profession}`,
    'analytical': `Present a detailed analysis using ${skill} with clear methodology, data sources, interpretation, and actionable recommendations for ${profession}`,
    'physical': `Perform ${skill} demonstration with safety protocols, proper technique, and quality standards relevant to ${profession}`,
    'regulatory': `Demonstrate ${skill} through compliance scenario, risk assessment, and practical application of industry regulations in ${profession}`,
    'soft': `Present specific examples of ${skill} application with context, challenges faced, actions taken, and measurable results in ${profession}`,
    'language': `Demonstrate ${skill} through professional communication examples, cultural competency, and effective usage in ${profession} contexts`,
    'certification': `Show certification credentials and demonstrate practical application through real-world examples and continued professional development in ${profession}`
  };

  return strategies[category] || `Provide comprehensive evidence of ${skill} competency through practical examples and professional application in ${profession}`;
}

function calculateClarityScore(description: string, goals: string, profession: string): number {
  let score = 5; // Base score
  
  // Length and detail
  if (description.length > 100) score += 1;
  if (description.length > 200) score += 1;
  if (goals && goals.length > 50) score += 1;
  
  // Professional context
  if (description.toLowerCase().includes('objective') || description.toLowerCase().includes('goal')) score += 1;
  if (description.toLowerCase().includes('stakeholder') || description.toLowerCase().includes('client')) score += 1;
  if (description.toLowerCase().includes('outcome') || description.toLowerCase().includes('result')) score += 1;
  
  return Math.min(10, score);
}

function calculateFeasibilityScore(description: string, skills: string[], profession: string): number {
  let score = 7; // Start optimistic
  
  // Skill complexity assessment
  if (skills.length > 8) score -= 1;
  if (skills.length < 3) score -= 1;
  
  // Profession-specific feasibility factors
  const complexProfessions = ['healthcare', 'legal', 'engineering', 'finance'];
  if (complexProfessions.includes(profession)) score -= 0.5;
  
  const text = description.toLowerCase();
  if (text.includes('complex') || text.includes('advanced')) score -= 1;
  if (text.includes('simple') || text.includes('basic')) score += 1;
  if (text.includes('regulatory') || text.includes('compliance')) score -= 0.5;
  
  return Math.max(1, Math.min(10, Math.round(score)));
}

function identifyUniversalRisks(description: string, profession: string, skills: string[]): string[] {
  const risks = [];
  const text = description.toLowerCase();
  
  // Universal risks
  if (skills.length > 6) {
    risks.push('Large number of skills may require extended development time and careful prioritization');
  }
  
  if (text.includes('new') || text.includes('learning')) {
    risks.push('Learning curve for new competencies may impact project timeline and require additional resources');
  }
  
  // Profession-specific risks
  const professionRisks = {
    'healthcare': ['Patient safety considerations', 'Regulatory compliance requirements', 'Privacy and confidentiality protocols'],
    'legal': ['Ethical considerations', 'Confidentiality requirements', 'Regulatory compliance'],
    'finance': ['Regulatory compliance', 'Data security requirements', 'Risk management protocols'],
    'education': ['Student privacy considerations', 'Accessibility requirements', 'Curriculum alignment'],
    'engineering': ['Safety protocols', 'Technical complexity', 'Quality assurance requirements']
  };
  
  if (professionRisks[profession]) {
    risks.push(...professionRisks[profession].slice(0, 2));
  }
  
  // Add default risk if none identified
  if (risks.length === 0) {
    risks.push('Consider time management and resource allocation for comprehensive skill demonstration');
  }
  
  return risks;
}

function suggestUniversalTools(description: string, profession: string): string[] {
  const text = description.toLowerCase();
  
  // Profession-specific tools
  const professionTools = {
    'healthcare': ['Electronic Health Records', 'Clinical Decision Support', 'Medical Imaging', 'Patient Management Systems'],
    'education': ['Learning Management Systems', 'Educational Technology', 'Assessment Tools', 'Collaboration Platforms'],
    'legal': ['Case Management Software', 'Legal Research Tools', 'Document Management', 'Time Tracking'],
    'finance': ['Financial Analysis Software', 'Risk Management Tools', 'Compliance Systems', 'Portfolio Management'],
    'marketing': ['Analytics Platforms', 'CRM Systems', 'Social Media Tools', 'Content Management'],
    'design': ['Design Software', 'Prototyping Tools', 'Collaboration Platforms', 'Version Control'],
    'engineering': ['CAD Software', 'Simulation Tools', 'Project Management', 'Quality Control Systems'],
    'manufacturing': ['ERP Systems', 'Quality Management', 'Supply Chain Tools', 'Production Planning'],
    'research': ['Statistical Software', 'Data Analysis Tools', 'Survey Platforms', 'Reference Management']
  };
  
  const tools = professionTools[profession] || [
    'Project Management Tools',
    'Communication Platforms', 
    'Documentation Systems',
    'Quality Assurance Tools'
  ];
  
  // Add universal tools based on content
  if (text.includes('data') || text.includes('analysis')) {
    tools.push('Data Analysis Tools', 'Reporting Systems');
  }
  if (text.includes('team') || text.includes('collaborate')) {
    tools.push('Collaboration Tools', 'Communication Platforms');
  }
  if (text.includes('document') || text.includes('report')) {
    tools.push('Documentation Tools', 'Content Management');
  }
  
  return [...new Set(tools)].slice(0, 8);
}

function calculateUniversalComplexity(skill: string, profession: string): number {
  const skillLower = skill.toLowerCase();
  
  // High complexity indicators
  if (skillLower.includes('advanced') || skillLower.includes('expert') || skillLower.includes('senior')) return 5;
  if (skillLower.includes('architecture') || skillLower.includes('strategy') || skillLower.includes('leadership')) return 4;
  
  // Profession-specific complexity
  const complexProfessions = ['healthcare', 'legal', 'engineering', 'finance'];
  if (complexProfessions.includes(profession)) {
    if (skillLower.includes('clinical') || skillLower.includes('surgical') || skillLower.includes('diagnostic')) return 5;
    if (skillLower.includes('regulatory') || skillLower.includes('compliance') || skillLower.includes('audit')) return 4;
  }
  
  // Medium complexity
  if (skillLower.includes('management') || skillLower.includes('analysis') || skillLower.includes('design')) return 3;
  
  // Lower complexity
  if (skillLower.includes('basic') || skillLower.includes('fundamental') || skillLower.includes('entry')) return 2;
  
  return 3; // Default medium complexity
}

function generateUniversalCriteria(skill: string, profession: string): string[] {
  const category = categorizeUniversalSkill(skill, profession);
  
  const baseCriteria = [
    `Clear demonstration of ${skill} knowledge and practical application`,
    'Professional presentation and explanation of methodology',
    'Evidence of competency and real-world experience'
  ];
  
  const categorySpecific = {
    'technical': [
      'Proper methodology and best practices application',
      'Problem-solving approach and troubleshooting',
      'Documentation and knowledge transfer capability'
    ],
    'creative': [
      'Originality and creative problem-solving',
      'Professional quality and attention to detail',
      'Ability to iterate and incorporate feedback'
    ],
    'analytical': [
      'Data accuracy and interpretation skills',
      'Clear methodology and logical reasoning',
      'Actionable insights and recommendations'
    ],
    'physical': [
      'Safety protocols and proper technique',
      'Consistency and quality of performance',
      'Adherence to industry standards'
    ],
    'regulatory': [
      'Compliance knowledge and application',
      'Risk assessment and mitigation',
      'Current regulatory understanding'
    ],
    'soft': [
      'Specific examples with measurable outcomes',
      'Interpersonal effectiveness demonstration',
      'Adaptability and emotional intelligence'
    ]
  };
  
  return [...baseCriteria, ...(categorySpecific[category] || [])];
}