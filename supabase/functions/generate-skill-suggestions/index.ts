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
  language: string[];
  certification: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { projectDescription, projectGoals }: SkillSuggestionRequest = await req.json()

    // Generate skill suggestions based on project description analysis
    const suggestions: SkillSuggestions = generateSkillSuggestions(projectDescription, projectGoals);

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

function generateSkillSuggestions(description: string, goals?: string): SkillSuggestions {
  const lowerDescription = description.toLowerCase();
  const lowerGoals = goals?.toLowerCase() || '';
  const combinedText = `${lowerDescription} ${lowerGoals}`;

  const suggestions: SkillSuggestions = {
    technical: [],
    soft: [],
    language: [],
    certification: []
  };

  // Technical skill mapping based on keywords and context
  const techMappings = {
    // Frontend Technologies
    'react': ['React', 'JavaScript', 'TypeScript', 'HTML/CSS', 'Redux', 'React Router'],
    'vue': ['Vue.js', 'JavaScript', 'TypeScript', 'HTML/CSS', 'Vuex', 'Vue Router'],
    'angular': ['Angular', 'TypeScript', 'JavaScript', 'HTML/CSS', 'RxJS', 'Angular CLI'],
    'frontend': ['HTML/CSS', 'JavaScript', 'TypeScript', 'Responsive Design', 'UI/UX Design'],
    'web': ['HTML/CSS', 'JavaScript', 'TypeScript', 'Web APIs', 'Browser DevTools'],
    
    // Backend Technologies
    'node': ['Node.js', 'Express.js', 'JavaScript', 'TypeScript', 'REST APIs', 'NPM'],
    'python': ['Python', 'Django', 'Flask', 'FastAPI', 'SQLAlchemy', 'Pandas'],
    'java': ['Java', 'Spring Boot', 'Maven', 'JUnit', 'Hibernate', 'REST APIs'],
    'backend': ['REST APIs', 'Database Design', 'Server Architecture', 'API Security'],
    
    // Database Technologies
    'database': ['SQL', 'PostgreSQL', 'MongoDB', 'Database Design', 'Query Optimization'],
    'sql': ['SQL', 'PostgreSQL', 'MySQL', 'Database Design', 'Data Modeling'],
    'mongodb': ['MongoDB', 'NoSQL', 'Database Design', 'Aggregation Pipelines'],
    'postgres': ['PostgreSQL', 'SQL', 'Database Administration', 'Performance Tuning'],
    
    // Cloud & DevOps
    'aws': ['AWS', 'Cloud Architecture', 'EC2', 'S3', 'Lambda', 'CloudFormation'],
    'cloud': ['Cloud Computing', 'AWS', 'Docker', 'Kubernetes', 'CI/CD'],
    'docker': ['Docker', 'Containerization', 'DevOps', 'Kubernetes', 'CI/CD'],
    'devops': ['DevOps', 'CI/CD', 'Docker', 'Kubernetes', 'Infrastructure as Code'],
    
    // Mobile Development
    'mobile': ['React Native', 'Flutter', 'iOS Development', 'Android Development', 'Mobile UI/UX'],
    'ios': ['iOS Development', 'Swift', 'Xcode', 'Mobile UI/UX', 'App Store'],
    'android': ['Android Development', 'Kotlin', 'Java', 'Android Studio', 'Google Play'],
    
    // Data & AI
    'data': ['Data Analysis', 'SQL', 'Python', 'Pandas', 'Data Visualization', 'Statistics'],
    'analytics': ['Data Analytics', 'SQL', 'Python', 'Tableau', 'Power BI', 'Statistics'],
    'machine learning': ['Machine Learning', 'Python', 'TensorFlow', 'Scikit-learn', 'Data Science'],
    'ai': ['Artificial Intelligence', 'Machine Learning', 'Python', 'Neural Networks', 'Deep Learning'],
    
    // Testing & Quality
    'test': ['Unit Testing', 'Integration Testing', 'Test Automation', 'Jest', 'Cypress'],
    'quality': ['Quality Assurance', 'Testing', 'Code Review', 'Bug Tracking', 'Test Planning'],
    
    // Security
    'security': ['Cybersecurity', 'Authentication', 'Authorization', 'HTTPS/SSL', 'Security Auditing'],
    'auth': ['Authentication', 'Authorization', 'JWT', 'OAuth', 'Security Best Practices']
  };

  // Soft skills based on project context
  const softSkillMappings = {
    'team': ['Team Collaboration', 'Communication', 'Leadership', 'Conflict Resolution'],
    'manage': ['Project Management', 'Leadership', 'Time Management', 'Strategic Planning'],
    'lead': ['Leadership', 'Team Management', 'Decision Making', 'Mentoring'],
    'collaborate': ['Team Collaboration', 'Communication', 'Interpersonal Skills', 'Teamwork'],
    'present': ['Presentation Skills', 'Public Speaking', 'Communication', 'Storytelling'],
    'client': ['Client Relations', 'Communication', 'Customer Service', 'Stakeholder Management'],
    'agile': ['Agile Methodology', 'Scrum', 'Team Collaboration', 'Adaptability'],
    'problem': ['Problem Solving', 'Critical Thinking', 'Analytical Skills', 'Troubleshooting'],
    'creative': ['Creativity', 'Innovation', 'Design Thinking', 'Problem Solving'],
    'research': ['Research Skills', 'Analytical Thinking', 'Data Analysis', 'Critical Thinking']
  };

  // Language skills based on context
  const languageContext = {
    'international': ['English', 'Spanish', 'French', 'German'],
    'global': ['English', 'Mandarin', 'Spanish', 'French'],
    'multilingual': ['English', 'Spanish', 'French', 'German', 'Mandarin'],
    'translation': ['English', 'Spanish', 'French', 'German', 'Translation Skills'],
    'localization': ['English', 'Spanish', 'French', 'German', 'Localization']
  };

  // Certification suggestions based on technologies
  const certificationMappings = {
    'aws': ['AWS Certified Solutions Architect', 'AWS Certified Developer', 'AWS Certified SysOps'],
    'cloud': ['AWS Certified Solutions Architect', 'Google Cloud Professional', 'Microsoft Azure Fundamentals'],
    'security': ['CompTIA Security+', 'CISSP', 'Certified Ethical Hacker'],
    'project': ['PMP', 'Scrum Master', 'Agile Certified Practitioner'],
    'data': ['Google Data Analytics', 'Microsoft Power BI', 'Tableau Desktop Specialist'],
    'python': ['Python Institute PCAP', 'Google IT Automation with Python'],
    'javascript': ['JavaScript Algorithms and Data Structures', 'React Developer Certification'],
    'agile': ['Scrum Master', 'Agile Certified Practitioner', 'SAFe Agilist']
  };

  // Apply technical mappings
  Object.entries(techMappings).forEach(([keyword, skills]) => {
    if (combinedText.includes(keyword)) {
      suggestions.technical.push(...skills);
    }
  });

  // Apply soft skill mappings
  Object.entries(softSkillMappings).forEach(([keyword, skills]) => {
    if (combinedText.includes(keyword)) {
      suggestions.soft.push(...skills);
    }
  });

  // Apply language mappings
  Object.entries(languageContext).forEach(([keyword, languages]) => {
    if (combinedText.includes(keyword)) {
      suggestions.language.push(...languages);
    }
  });

  // Apply certification mappings
  Object.entries(certificationMappings).forEach(([keyword, certs]) => {
    if (combinedText.includes(keyword)) {
      suggestions.certification.push(...certs);
    }
  });

  // Add default soft skills for any project
  const defaultSoftSkills = [
    'Problem Solving', 'Communication', 'Time Management', 'Attention to Detail',
    'Critical Thinking', 'Adaptability', 'Self-Motivation', 'Continuous Learning'
  ];
  suggestions.soft.push(...defaultSoftSkills);

  // Add default technical skills based on common patterns
  if (suggestions.technical.length === 0) {
    suggestions.technical.push('Git', 'Version Control', 'Code Documentation', 'Debugging');
  }

  // Remove duplicates and limit results
  Object.keys(suggestions).forEach(category => {
    const categoryKey = category as keyof SkillSuggestions;
    suggestions[categoryKey] = [...new Set(suggestions[categoryKey])].slice(0, 12);
  });

  return suggestions;
}