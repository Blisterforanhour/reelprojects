/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import './CreateProjectForm.css';
import { getSupabaseClient } from '../lib/auth';
import { 
  Plus, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Brain, 
  Target, 
  Video, 
  Code, 
  FileText, 
  Presentation, 
  Monitor,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
  Upload,
  Eye,
  ArrowRight,
  Lightbulb,
  Users,
  ChevronDown,
  ChevronUp,
  Minimize2,
  Maximize2,
  Search
} from 'lucide-react';
import { Project } from '../types';

interface ProjectSkill {
  id: string;
  name: string;
  category: 'technical' | 'soft' | 'language' | 'certification';
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master';
  demonstrationMethod: 'code' | 'video' | 'documentation' | 'presentation' | 'live-demo';
  requirements: string;
  aiPrompt?: string;
}

interface ScopeAnalysis {
  clarity_score: number;
  feasibility_score: number;
  identified_risks: string[];
  suggested_technologies: string[];
  detected_skills: ProjectSkill[];
  skill_mapping: {
    skill: string;
    demonstration_method: string;
    complexity_level: number;
    verification_criteria: string[];
  }[];
}

interface CreateProjectFormProps {
  onClose: () => void;
  onProjectCreated: (project: any) => void;
}

const CreateProjectForm: React.FC<CreateProjectFormProps> = ({ onClose, onProjectCreated }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectGoals, setProjectGoals] = useState('');
  const [targetSkills, setTargetSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [analysis, setAnalysis] = useState<ScopeAnalysis | null>(null);
  const [projectPlan, setProjectPlan] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [skillFeedback, setSkillFeedback] = useState<{[key: string]: string}>({});
  const [aiSuggestedSkills, setAiSuggestedSkills] = useState<{[category: string]: string[]}>({});
  const [collapsedSkills, setCollapsedSkills] = useState<{[key: string]: boolean}>({});
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);

  const demonstrationIcons = {
    code: Code,
    video: Video,
    documentation: FileText,
    presentation: Presentation,
    'live-demo': Monitor
  };

  const demonstrationLabels = {
    code: 'Code Repository',
    video: 'Video Demo',
    documentation: 'Documentation',
    presentation: 'Presentation',
    'live-demo': 'Live Demo'
  };

  // Check if Supabase is properly configured
  const isSupabaseConfigured = () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    return supabaseUrl && 
           supabaseAnonKey && 
           supabaseUrl !== 'your_supabase_project_url' && 
           supabaseAnonKey !== 'your_supabase_anon_key' &&
           supabaseUrl.includes('supabase.co');
  };

  // Generate AI-powered skill suggestions based on project description
  const generateSkillSuggestions = async () => {
    if (!projectDescription || projectDescription.length < 50) return;

    setIsGeneratingSuggestions(true);
    try {
      if (isSupabaseConfigured()) {
        // Use Supabase edge function for skill suggestions
        const supabase = getSupabaseClient();
        const { data, error } = await supabase.functions.invoke('generate-skill-suggestions', {
          body: { projectDescription, projectGoals }
        });

        if (!error && data) {
          setAiSuggestedSkills(data);
        } else {
          console.warn('Supabase skill suggestions failed:', error);
          generateBasicSuggestions();
        }
      } else {
        // If Supabase is not configured, use intelligent suggestions
        generateIntelligentSuggestions();
      }
    } catch (err) {
      console.error('Failed to generate skill suggestions:', err);
      // Fallback to intelligent suggestions based on keywords
      generateIntelligentSuggestions();
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  // Intelligent suggestions based on comprehensive keyword analysis
  const generateIntelligentSuggestions = () => {
    const description = projectDescription.toLowerCase();
    const goals = projectGoals?.toLowerCase() || '';
    const combinedText = `${description} ${goals}`;
    
    const suggestions: {[category: string]: string[]} = {
      technical: [],
      soft: [],
      language: [],
      certification: []
    };

    // Advanced technical skill mapping
    const techMappings = {
      // Frontend & Web Development
      'react': ['React', 'JavaScript', 'TypeScript', 'HTML/CSS', 'Redux', 'React Router', 'JSX'],
      'vue': ['Vue.js', 'JavaScript', 'TypeScript', 'HTML/CSS', 'Vuex', 'Vue Router'],
      'angular': ['Angular', 'TypeScript', 'JavaScript', 'HTML/CSS', 'RxJS', 'Angular CLI'],
      'frontend': ['HTML/CSS', 'JavaScript', 'TypeScript', 'Responsive Design', 'UI/UX Design', 'Browser APIs'],
      'web': ['HTML/CSS', 'JavaScript', 'TypeScript', 'Web APIs', 'Browser DevTools', 'Performance Optimization'],
      'ui': ['UI Design', 'UX Design', 'Figma', 'Adobe XD', 'Prototyping', 'User Research'],
      'css': ['CSS', 'Sass', 'Tailwind CSS', 'Bootstrap', 'Responsive Design', 'CSS Grid'],
      
      // Backend Development
      'node': ['Node.js', 'Express.js', 'JavaScript', 'TypeScript', 'REST APIs', 'NPM', 'Middleware'],
      'python': ['Python', 'Django', 'Flask', 'FastAPI', 'SQLAlchemy', 'Pandas', 'NumPy'],
      'java': ['Java', 'Spring Boot', 'Maven', 'JUnit', 'Hibernate', 'REST APIs'],
      'backend': ['REST APIs', 'Database Design', 'Server Architecture', 'API Security', 'Microservices'],
      'api': ['REST APIs', 'GraphQL', 'API Design', 'API Documentation', 'Postman', 'OpenAPI'],
      
      // Database & Data
      'database': ['SQL', 'PostgreSQL', 'MongoDB', 'Database Design', 'Query Optimization', 'Data Modeling'],
      'sql': ['SQL', 'PostgreSQL', 'MySQL', 'Database Design', 'Data Analysis', 'Query Optimization'],
      'mongodb': ['MongoDB', 'NoSQL', 'Database Design', 'Aggregation Pipelines', 'Document Databases'],
      'data': ['Data Analysis', 'SQL', 'Python', 'Pandas', 'Data Visualization', 'Statistics'],
      'analytics': ['Data Analytics', 'SQL', 'Python', 'Tableau', 'Power BI', 'Statistical Analysis'],
      
      // Cloud & DevOps
      'cloud': ['Cloud Computing', 'Docker', 'Kubernetes', 'CI/CD', 'Infrastructure as Code'],
      'docker': ['Docker', 'Containerization', 'DevOps', 'Kubernetes', 'CI/CD', 'Container Orchestration'],
      'devops': ['DevOps', 'CI/CD', 'Docker', 'Kubernetes', 'Infrastructure as Code', 'Monitoring'],
      
      // Mobile Development
      'mobile': ['React Native', 'Flutter', 'iOS Development', 'Android Development', 'Mobile UI/UX'],
      'ios': ['iOS Development', 'Swift', 'Xcode', 'Mobile UI/UX', 'App Store Optimization'],
      'android': ['Android Development', 'Kotlin', 'Java', 'Android Studio', 'Google Play'],
      
      // AI & Machine Learning
      'machine learning': ['Machine Learning', 'Python', 'TensorFlow', 'Scikit-learn', 'Data Science'],
      'ai': ['Artificial Intelligence', 'Machine Learning', 'Python', 'Neural Networks', 'Deep Learning'],
      'tensorflow': ['TensorFlow', 'Machine Learning', 'Python', 'Neural Networks', 'Deep Learning'],
      
      // Testing & Quality
      'test': ['Unit Testing', 'Integration Testing', 'Test Automation', 'Jest', 'Cypress', 'TDD'],
      'quality': ['Quality Assurance', 'Testing', 'Code Review', 'Bug Tracking', 'Test Planning'],
      
      // Security
      'security': ['Cybersecurity', 'Authentication', 'Authorization', 'HTTPS/SSL', 'Security Auditing'],
      'auth': ['Authentication', 'Authorization', 'JWT', 'OAuth', 'Security Best Practices'],
      
      // E-commerce & Business
      'ecommerce': ['E-commerce Development', 'Payment Integration', 'Shopping Cart', 'Inventory Management'],
      'payment': ['Payment Processing', 'Stripe Integration', 'PayPal Integration', 'Financial APIs'],
      'business': ['Business Analysis', 'Requirements Gathering', 'Process Optimization', 'Stakeholder Management']
    };

    // Context-aware soft skills
    const softSkillMappings = {
      'team': ['Team Collaboration', 'Communication', 'Leadership', 'Conflict Resolution', 'Teamwork'],
      'manage': ['Project Management', 'Leadership', 'Time Management', 'Strategic Planning', 'Resource Management'],
      'lead': ['Leadership', 'Team Management', 'Decision Making', 'Mentoring', 'Vision Setting'],
      'collaborate': ['Team Collaboration', 'Communication', 'Interpersonal Skills', 'Cross-functional Teamwork'],
      'present': ['Presentation Skills', 'Public Speaking', 'Communication', 'Storytelling', 'Visual Communication'],
      'client': ['Client Relations', 'Communication', 'Customer Service', 'Stakeholder Management', 'Relationship Building'],
      'agile': ['Agile Methodology', 'Scrum', 'Team Collaboration', 'Adaptability', 'Iterative Development'],
      'problem': ['Problem Solving', 'Critical Thinking', 'Analytical Skills', 'Troubleshooting', 'Root Cause Analysis'],
      'creative': ['Creativity', 'Innovation', 'Design Thinking', 'Problem Solving', 'Brainstorming'],
      'research': ['Research Skills', 'Analytical Thinking', 'Data Analysis', 'Critical Thinking', 'Information Gathering'],
      'startup': ['Entrepreneurship', 'Innovation', 'Risk Management', 'Strategic Thinking', 'Adaptability'],
      'scale': ['Scalability Planning', 'Performance Optimization', 'System Architecture', 'Growth Strategy']
    };

    // Apply intelligent mappings
    Object.entries(techMappings).forEach(([keyword, skills]) => {
      if (combinedText.includes(keyword)) {
        suggestions.technical.push(...skills);
      }
    });

    Object.entries(softSkillMappings).forEach(([keyword, skills]) => {
      if (combinedText.includes(keyword)) {
        suggestions.soft.push(...skills);
      }
    });

    // Add contextual certifications
    if (combinedText.includes('project') || combinedText.includes('manage')) {
      suggestions.certification.push('PMP', 'Scrum Master', 'Agile Certified Practitioner');
    }
    if (combinedText.includes('security') || combinedText.includes('secure')) {
      suggestions.certification.push('CompTIA Security+', 'CISSP', 'Certified Ethical Hacker');
    }
    if (combinedText.includes('data') || combinedText.includes('analytics')) {
      suggestions.certification.push('Google Data Analytics', 'Microsoft Power BI', 'Tableau Desktop Specialist');
    }

    // Add essential soft skills for any project
    const essentialSoftSkills = [
      'Problem Solving', 'Communication', 'Time Management', 'Attention to Detail',
      'Critical Thinking', 'Adaptability', 'Self-Motivation', 'Continuous Learning'
    ];
    suggestions.soft.push(...essentialSoftSkills);

    // Add foundational technical skills if none detected
    if (suggestions.technical.length === 0) {
      suggestions.technical.push('Git', 'Version Control', 'Code Documentation', 'Debugging', 'Software Architecture');
    }

    // Remove duplicates and limit results
    Object.keys(suggestions).forEach(category => {
      suggestions[category] = [...new Set(suggestions[category])].slice(0, 10);
    });

    setAiSuggestedSkills(suggestions);
  };

  // Fallback basic suggestions (kept for compatibility)
  const generateBasicSuggestions = () => {
    generateIntelligentSuggestions(); // Use the intelligent version instead
  };

  // Generate suggestions when project description changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (projectDescription.length > 50) {
        generateSkillSuggestions();
      }
    }, 2000); // Debounce for 2 seconds

    return () => clearTimeout(timer);
  }, [projectDescription, projectGoals]);

  // Real-time analysis when project details change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (projectDescription.length > 50 && targetSkills.length > 0) {
        handleRealTimeAnalysis();
      }
    }, 1500); // Debounce for 1.5 seconds

    return () => clearTimeout(timer);
  }, [projectDescription, projectGoals, targetSkills]);

  const handleRealTimeAnalysis = async () => {
    if (isAnalyzing || !projectDescription || targetSkills.length === 0) return;

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      if (isSupabaseConfigured()) {
        // Use Supabase edge function for analysis
        console.log('Using Supabase edge function for AI analysis...');
        const supabase = getSupabaseClient();
        
        const { data, error } = await supabase.functions.invoke('analyze-project-scope', {
          body: {
            projectDescription,
            projectGoals,
            targetSkills
          }
        });

        if (error) {
          console.error('Supabase AI analysis error:', error);
          setAnalysisError(`AI analysis service unavailable. Using intelligent analysis instead.`);
          // Generate intelligent analysis
          generateIntelligentAnalysis();
          return;
        }

        console.log('Supabase AI analysis successful:', data);
        setAnalysis(data);
        generateSkillFeedback(data);
      } else {
        // Generate intelligent analysis if no AI service is available
        console.log('No AI service configured, generating intelligent analysis...');
        generateIntelligentAnalysis();
      }
      
    } catch (err) {
      console.error('Analysis request failed:', err);
      setAnalysisError(`AI analysis service unavailable. Using intelligent analysis instead.`);
      
      // Generate intelligent analysis
      generateIntelligentAnalysis();
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Generate intelligent analysis based on project content and industry standards
  const generateIntelligentAnalysis = () => {
    const description = projectDescription.toLowerCase();
    const goals = projectGoals?.toLowerCase() || '';
    const combinedText = `${description} ${goals}`;
    
    // Calculate clarity score based on description quality
    let clarityScore = 5; // Base score
    if (projectDescription.length > 100) clarityScore += 1;
    if (projectDescription.length > 200) clarityScore += 1;
    if (projectGoals && projectGoals.length > 50) clarityScore += 1;
    if (combinedText.includes('user') || combinedText.includes('customer')) clarityScore += 1;
    if (combinedText.includes('problem') || combinedText.includes('solution')) clarityScore += 1;
    clarityScore = Math.min(10, clarityScore);

    // Calculate feasibility score based on scope and skills
    let feasibilityScore = 7; // Start optimistic
    if (targetSkills.length > 8) feasibilityScore -= 1; // Too many skills might be ambitious
    if (targetSkills.length < 3) feasibilityScore -= 1; // Too few skills might be too simple
    if (combinedText.includes('complex') || combinedText.includes('advanced')) feasibilityScore -= 1;
    if (combinedText.includes('simple') || combinedText.includes('basic')) feasibilityScore += 1;
    feasibilityScore = Math.max(1, Math.min(10, feasibilityScore));

    // Generate contextual risks
    const risks = [];
    if (targetSkills.length > 6) {
      risks.push('Large number of skills may require extended development time');
    }
    if (combinedText.includes('new') || combinedText.includes('learning')) {
      risks.push('Learning curve for new technologies may impact timeline');
    }
    if (combinedText.includes('integration') || combinedText.includes('api')) {
      risks.push('Third-party integrations may introduce dependencies and complexity');
    }
    if (combinedText.includes('scale') || combinedText.includes('performance')) {
      risks.push('Performance optimization may require additional expertise');
    }
    if (risks.length === 0) {
      risks.push('Consider time management for comprehensive skill demonstration');
    }

    // Generate technology suggestions based on content
    const techSuggestions = generateTechSuggestions(combinedText);

    const intelligentAnalysis: ScopeAnalysis = {
      clarity_score: clarityScore,
      feasibility_score: feasibilityScore,
      identified_risks: risks,
      suggested_technologies: techSuggestions,
      detected_skills: targetSkills.map((skill, index) => ({
        id: `skill_${index}`,
        name: skill,
        category: categorizeSkill(skill),
        proficiency: determineProficiency(skill, combinedText),
        demonstrationMethod: getDemoMethod(skill),
        requirements: generateSkillRequirement(skill, combinedText),
        aiPrompt: generateVerificationStrategy(skill, combinedText)
      })),
      skill_mapping: targetSkills.map(skill => ({
        skill,
        demonstration_method: getDemoMethod(skill),
        complexity_level: calculateComplexity(skill, combinedText),
        verification_criteria: generateVerificationCriteria(skill)
      }))
    };

    setAnalysis(intelligentAnalysis);
    generateSkillFeedback(intelligentAnalysis);
  };

  // Helper functions for intelligent analysis
  const generateTechSuggestions = (text: string): string[] => {
    const suggestions = [];
    
    // Frontend suggestions
    if (text.includes('web') || text.includes('frontend') || text.includes('ui')) {
      suggestions.push('React', 'TypeScript', 'Tailwind CSS', 'Vite');
    }
    
    // Backend suggestions
    if (text.includes('backend') || text.includes('api') || text.includes('server')) {
      suggestions.push('Node.js', 'Express.js', 'PostgreSQL', 'REST APIs');
    }
    
    // Database suggestions
    if (text.includes('data') || text.includes('database') || text.includes('store')) {
      suggestions.push('PostgreSQL', 'MongoDB', 'Redis', 'Database Design');
    }
    
    // Mobile suggestions
    if (text.includes('mobile') || text.includes('app')) {
      suggestions.push('React Native', 'Flutter', 'Mobile UI/UX');
    }
    
    // DevOps suggestions
    if (text.includes('deploy') || text.includes('production') || text.includes('scale')) {
      suggestions.push('Docker', 'CI/CD', 'Git', 'Testing');
    }
    
    // Default suggestions if none match
    if (suggestions.length === 0) {
      suggestions.push('Git', 'Documentation', 'Testing', 'Code Review');
    }
    
    return [...new Set(suggestions)].slice(0, 8);
  };

  const categorizeSkill = (skill: string): 'technical' | 'soft' | 'language' | 'certification' => {
    const techSkills = ['react', 'javascript', 'python', 'sql', 'html', 'css', 'node', 'docker', 'git', 'typescript', 'java', 'mongodb', 'postgresql'];
    const softSkills = ['leadership', 'communication', 'management', 'collaboration', 'problem solving', 'critical thinking', 'creativity', 'teamwork'];
    const languages = ['english', 'spanish', 'french', 'german', 'mandarin', 'japanese', 'korean'];
    
    const skillLower = skill.toLowerCase();
    
    if (techSkills.some(tech => skillLower.includes(tech))) return 'technical';
    if (softSkills.some(soft => skillLower.includes(soft))) return 'soft';
    if (languages.some(lang => skillLower.includes(lang))) return 'language';
    if (skillLower.includes('certified') || skillLower.includes('certification')) return 'certification';
    
    return 'technical'; // default
  };

  const determineProficiency = (skill: string, context: string): 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master' => {
    if (context.includes('expert') || context.includes('advanced') || context.includes('senior')) return 'advanced';
    if (context.includes('beginner') || context.includes('learning') || context.includes('new to')) return 'beginner';
    return 'intermediate'; // default
  };

  const getDemoMethod = (skill: string): 'code' | 'video' | 'documentation' | 'presentation' | 'live-demo' => {
    const skillLower = skill.toLowerCase();
    
    if (skillLower.includes('leadership') || skillLower.includes('communication') || skillLower.includes('presentation')) return 'video';
    if (skillLower.includes('documentation') || skillLower.includes('writing') || skillLower.includes('research')) return 'documentation';
    if (skillLower.includes('design') || skillLower.includes('ui') || skillLower.includes('ux')) return 'presentation';
    if (skillLower.includes('demo') || skillLower.includes('live')) return 'live-demo';
    
    return 'code'; // default for technical skills
  };

  const generateSkillRequirement = (skill: string, context: string): string => {
    const category = categorizeSkill(skill);
    
    switch (category) {
      case 'technical':
        return `Demonstrate ${skill} through practical implementation with clean, well-documented code and clear explanations of technical decisions`;
      case 'soft':
        return `Show ${skill} in action through real examples, scenarios, and measurable outcomes from your experience`;
      case 'language':
        return `Demonstrate ${skill} proficiency through clear communication and practical usage in professional contexts`;
      case 'certification':
        return `Provide evidence of ${skill} certification and demonstrate practical application of certified knowledge`;
      default:
        return `Demonstrate practical application of ${skill} with clear examples and explanations`;
    }
  };

  const generateVerificationStrategy = (skill: string, context: string): string => {
    const category = categorizeSkill(skill);
    
    switch (category) {
      case 'technical':
        return `Create a comprehensive demonstration showing ${skill} implementation, best practices, and problem-solving approach with detailed code explanations`;
      case 'soft':
        return `Present specific examples and scenarios where you successfully applied ${skill}, including challenges faced and outcomes achieved`;
      case 'language':
        return `Demonstrate ${skill} through clear, professional communication and practical usage in relevant contexts`;
      case 'certification':
        return `Show certification credentials and demonstrate practical application of ${skill} knowledge through real-world examples`;
      default:
        return `Provide comprehensive evidence of ${skill} competency through practical examples and clear explanations`;
    }
  };

  const calculateComplexity = (skill: string, context: string): number => {
    const skillLower = skill.toLowerCase();
    
    // High complexity skills
    if (skillLower.includes('architecture') || skillLower.includes('machine learning') || skillLower.includes('devops')) return 5;
    if (skillLower.includes('advanced') || skillLower.includes('expert') || skillLower.includes('senior')) return 4;
    
    // Medium complexity
    if (skillLower.includes('react') || skillLower.includes('node') || skillLower.includes('python')) return 3;
    
    // Lower complexity
    if (skillLower.includes('html') || skillLower.includes('css') || skillLower.includes('basic')) return 2;
    
    return 3; // default medium complexity
  };

  const generateVerificationCriteria = (skill: string): string[] => {
    const category = categorizeSkill(skill);
    
    const baseCriteria = [
      `Clear demonstration of ${skill} knowledge and application`,
      'Professional presentation and explanation',
      'Evidence of practical experience and competency'
    ];
    
    switch (category) {
      case 'technical':
        return [
          ...baseCriteria,
          'Clean, well-structured code implementation',
          'Proper documentation and comments',
          'Best practices and industry standards adherence'
        ];
      case 'soft':
        return [
          ...baseCriteria,
          'Specific examples and measurable outcomes',
          'Clear communication of impact and results',
          'Evidence of successful application in real scenarios'
        ];
      default:
        return baseCriteria;
    }
  };

  const generateSkillFeedback = (analysisData: ScopeAnalysis) => {
    const feedback: {[key: string]: string} = {};
    
    analysisData.detected_skills.forEach(skill => {
      const complexity = analysisData.skill_mapping.find(m => m.skill === skill.name)?.complexity_level || 3;
      
      if (complexity >= 4) {
        feedback[skill.name] = `High complexity skill - consider breaking into smaller demonstrations or focusing on specific aspects`;
      } else if (skill.demonstrationMethod === 'code' && skill.category === 'technical') {
        feedback[skill.name] = `Perfect for code demonstration - build a feature that showcases ${skill.name} expertise`;
      } else if (skill.demonstrationMethod === 'video' && skill.category === 'soft') {
        feedback[skill.name] = `Great for video demo - show real examples of ${skill.name} in action`;
      } else {
        feedback[skill.name] = `Well-suited for ${skill.demonstrationMethod} demonstration`;
      }
    });

    setSkillFeedback(feedback);
  };

  const addSkill = () => {
    const trimmedSkill = newSkill.trim();
    if (trimmedSkill && !targetSkills.includes(trimmedSkill)) {
      setTargetSkills([...targetSkills, trimmedSkill]);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setTargetSkills(targetSkills.filter(skill => skill !== skillToRemove));
  };

  const toggleSkillCollapse = (skillName: string) => {
    setCollapsedSkills(prev => ({
      ...prev,
      [skillName]: !prev[skillName]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectName || !projectDescription || targetSkills.length === 0) {
      setError('Please fill in all required fields');
      return;
    }

    if (!analysis) {
      setError('Please wait for analysis to complete before creating the project');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Generate a project plan based on the analysis
      const generateProjectPlan = (skills: ProjectSkill[], description: string): string[] => {
        const plan = [
          `Project Setup: Initialize the ${projectName} project with proper structure and dependencies`,
          'Requirements Analysis: Define detailed specifications and user stories based on analysis recommendations',
          'Architecture Design: Plan the system architecture using suggested technologies',
          ...skills.map(skill => `${skill.name} Implementation: ${skill.requirements}`),
          'Integration Testing: Ensure all components work together seamlessly',
          'Documentation: Create comprehensive project documentation with skill verification evidence',
          'Quality Assurance: Conduct thorough testing and prepare for skill verification',
          'Deployment & Presentation: Deploy the project and present skill demonstrations for analysis'
        ];
        return plan;
      };

      const newProject = {
        id: `project_${Date.now()}`,
        name: projectName,
        description: projectDescription,
        goals: projectGoals,
        target_skills: targetSkills,
        analysis: analysis,
        plan: generateProjectPlan(analysis.detected_skills, projectDescription),
        skill_demonstrations: analysis.detected_skills.map(skill => ({
          ...skill,
          status: 'planned',
          evidence_url: null,
          verified: false,
          rating: null,
          verification_feedback: null
        })),
        status: 'active',
        created_at: new Date().toISOString(),
        type: 'AI-Powered Multi-Skill Showcase',
        user_id: 'current_user' // This will be set properly in the parent component
      };

      console.log('AI-powered project created:', newProject);
      onProjectCreated(newProject);

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unexpected error occurred';
      setError(message);
      console.error('Project creation failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderProjectSetup = () => (
    <div className="form-step">
      <div className="step-header">
        <Brain className="step-icon" size={24} />
        <div>
          <h2>AI-Powered Project Setup</h2>
          <p>Define your project and let AI analyze the optimal skill demonstration approach</p>
        </div>
      </div>

      {!isSupabaseConfigured() && (
        <div className="config-warning">
          <AlertCircle size={20} />
          <div>
            <strong>Configuration Notice</strong>
            <p>AI analysis service is not configured. Using intelligent analysis based on industry standards and best practices.</p>
          </div>
        </div>
      )}

      <div className="form-group">
        <label htmlFor="projectName">Project Name *</label>
        <input
          id="projectName"
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="e.g., E-commerce Platform, Portfolio Website, Data Analytics Dashboard"
          required
          disabled={isLoading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="projectDescription">Project Description *</label>
        <textarea
          id="projectDescription"
          value={projectDescription}
          onChange={(e) => setProjectDescription(e.target.value)}
          placeholder="Describe what you're building, its purpose, key features, and target users. Be specific about the problems it solves. AI will analyze this to suggest optimal skill demonstrations."
          required
          disabled={isLoading}
          rows={4}
        />
        <div className="character-count">
          {projectDescription.length}/500 characters
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="projectGoals">Success Criteria & Goals</label>
        <textarea
          id="projectGoals"
          value={projectGoals}
          onChange={(e) => setProjectGoals(e.target.value)}
          placeholder="What specific outcomes do you want to achieve? How will you measure success? AI will use this to optimize skill verification strategies."
          disabled={isLoading}
          rows={3}
        />
      </div>

      {projectDescription.length > 50 && (
        <div className="real-time-analysis">
          {isAnalyzing ? (
            <div className="analyzing-indicator">
              <div className="spinner"></div>
              <span>AI is analyzing your project for optimal skill demonstration...</span>
            </div>
          ) : analysis ? (
            <div className="analysis-preview">
              <div className="analysis-scores">
                <div className="score-item">
                  <span>AI Clarity Score</span>
                  <span className="score">{analysis.clarity_score}/10</span>
                </div>
                <div className="score-item">
                  <span>Feasibility</span>
                  <span className="score">{analysis.feasibility_score}/10</span>
                </div>
              </div>
              <div className="quick-insights">
                <Lightbulb size={16} />
                <span>AI detected {analysis.detected_skills.length} skills and generated verification strategies</span>
              </div>
            </div>
          ) : analysisError ? (
            <div className="analysis-error">
              <AlertCircle size={16} />
              <span>{analysisError}</span>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );

  const renderSkillSelection = () => (
    <div className="form-step">
      <div className="step-header">
        <Target className="step-icon" size={24} />
        <div>
          <h2>AI-Enhanced Skill Selection</h2>
          <p>Select skills for AI-powered verification and automated demonstration planning</p>
        </div>
      </div>
      
      <div className="skill-input-section">
        <div className="skill-search-container">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add a skill for AI analysis (e.g., React, Leadership, UI Design)"
              disabled={isLoading}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              className="skill-search-input"
            />
            <button 
              type="button" 
              onClick={addSkill} 
              disabled={!newSkill.trim()} 
              className="add-skill-btn"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* AI-Generated Skill Suggestions - Now at the top */}
      {Object.keys(aiSuggestedSkills).length > 0 && (
        <div className="skill-suggestions">
          <h3 className="suggestions-header">
            <Brain size={20} />
            AI-Generated Skill Suggestions
            {isGeneratingSuggestions && <div className="spinner suggestions-spinner"></div>}
          </h3>
          <p className="suggestions-description">
            Based on your project description, here are relevant skills that could be demonstrated:
          </p>
          
          {Object.entries(aiSuggestedSkills).map(([category, skills]) => (
            skills.length > 0 && (
              <div key={category} className="skill-category">
                <h4 className="category-title">{category.charAt(0).toUpperCase() + category.slice(1)} Skills</h4>
                <div className="suggestion-chips">
                  {skills.map(skill => (
                    <button
                      key={skill}
                      type="button"
                      className={`suggestion-chip ${targetSkills.includes(skill) ? 'selected' : ''}`}
                      onClick={() => {
                        if (!targetSkills.includes(skill)) {
                          setTargetSkills([...targetSkills, skill]);
                        }
                      }}
                      disabled={targetSkills.includes(skill)}
                    >
                      {skill}
                      {targetSkills.includes(skill) && <CheckCircle size={14} />}
                    </button>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      )}

      {/* AI-Analyzed Skills - Now below suggestions */}
      {targetSkills.length > 0 && (
        <div className="selected-skills">
          <h3 className="analyzed-skills-header">
            AI-Analyzed Skills ({targetSkills.length})
          </h3>
          <div className="skills-grid">
            {targetSkills.map((skill, index) => {
              const skillAnalysis = analysis?.detected_skills.find(s => s.name === skill);
              const DemoIcon = skillAnalysis ? (demonstrationIcons as Record<string, React.ComponentType>)[skillAnalysis.demonstrationMethod] || Code : Code;
              const feedback = skillFeedback[skill];
              const isCollapsed = collapsedSkills[skill];
              
              return (
                <div key={index} className="skill-card">
                  <div className="skill-header">
                    <div className="skill-info">
                      <span className="skill-name">{skill}</span>
                      {skillAnalysis && (
                        <div className="demo-method">
                          <DemoIcon size={14} />
                          <span>AI: {skillAnalysis.demonstrationMethod}</span>
                        </div>
                      )}
                    </div>
                    <div className="skill-actions">
                      <button 
                        type="button" 
                        onClick={() => toggleSkillCollapse(skill)} 
                        className="collapse-skill"
                        title={isCollapsed ? 'Expand details' : 'Collapse details'}
                      >
                        {isCollapsed ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
                      </button>
                      <button type="button" onClick={() => removeSkill(skill)} className="remove-skill">
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                  
                  {!isCollapsed && skillAnalysis && (
                    <div className="skill-details">
                      <div className="skill-requirement">
                        <strong>AI Requirement:</strong> {skillAnalysis.requirements}
                      </div>
                      {skillAnalysis.aiPrompt && (
                        <div className="ai-prompt">
                          <strong>AI Verification Strategy:</strong> {skillAnalysis.aiPrompt}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {!isCollapsed && feedback && (
                    <div className="skill-feedback">
                      <AlertCircle size={14} />
                      <span>{feedback}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  const renderAnalysisReview = () => (
    <div className="form-step">
      <div className="step-header">
        <Users className="step-icon" size={24} />
        <div>
          <h2>AI Analysis & Verification Plan</h2>
          <p>Review AI-generated skill verification strategies and project insights</p>
        </div>
      </div>

      {analysis ? (
        <div className="analysis-section">
          <div className="analysis-overview">
            <div className="analysis-scores">
              <div className="score-card">
                <div className="score-number">{analysis.clarity_score}</div>
                <div className="score-label">AI Clarity Score</div>
              </div>
              <div className="score-card">
                <div className="score-number">{analysis.feasibility_score}</div>
                <div className="score-label">Feasibility Score</div>
              </div>
              <div className="score-card">
                <div className="score-number">{analysis.detected_skills.length}</div>
                <div className="score-label">AI-Analyzed Skills</div>
              </div>
            </div>
          </div>

          <div className="skills-verification-plan">
            <h3>AI-Powered Skill Verification Plan</h3>
            <div className="verification-grid">
              {analysis.detected_skills.map((skill, index) => {
                const DemoIcon = (demonstrationIcons as Record<string, React.ComponentType>)[skill.demonstrationMethod] || Code;
                const mapping = analysis.skill_mapping.find(m => m.skill === skill.name);
                
                return (
                  <div key={index} className="verification-card">
                    <div className="verification-header">
                      <DemoIcon className="demo-icon" size={20} />
                      <div>
                        <h4>{skill.name}</h4>
                        <span className={`category-badge ${skill.category}`}>
                          {skill.category}
                        </span>
                      </div>
                    </div>
                    
                    <div className="verification-details">
                      <div className="complexity-level">
                        <span>AI Complexity:</span>
                        <div className="complexity-stars">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={12} 
                              className={i < (mapping?.complexity_level || 3) ? 'filled' : 'empty'}
                            />
                          ))}
                        </div>
                      </div>
                      
                      <div className="demonstration-method">
                        <strong>AI Method:</strong> {skill.demonstrationMethod.replace('-', ' ')}
                      </div>
                      
                      <div className="verification-criteria">
                        <strong>AI Verification Criteria:</strong>
                        <ul>
                          {mapping?.verification_criteria.slice(0, 3).map((criteria, i) => (
                            <li key={i}>{criteria}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {analysis.identified_risks.length > 0 && (
            <div className="risks-section">
              <h3>AI-Identified Risks & Considerations</h3>
              <div className="risks-list">
                {analysis.identified_risks.map((risk, index) => (
                  <div key={index} className="risk-item">
                    <AlertCircle size={16} />
                    <span>{risk}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysis.suggested_technologies.length > 0 && (
            <div className="technologies-section">
              <h3>AI-Suggested Technologies & Tools</h3>
              <div className="tech-list">
                {analysis.suggested_technologies.map((tech, index) => (
                  <div key={index} className="tech-item">
                    <CheckCircle size={16} />
                    <span>{tech}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="no-analysis">
          <Brain size={48} />
          <h3>No AI Analysis Available</h3>
          <p>Complete the previous steps to see AI-powered analysis and verification strategies</p>
        </div>
      )}
    </div>
  );

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return projectName.trim() !== '' && projectDescription.trim() !== '';
      case 2:
        return targetSkills.length > 0;
      case 3:
        return analysis !== null; // Require analysis to be complete
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (currentStep < 3 && isStepValid(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="create-project-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h1>Create AI-Powered Project</h1>
          <button onClick={onClose} className="close-btn">
            <X size={24} />
          </button>
        </div>

        <div className="step-indicator">
          {[1, 2, 3].map(step => (
            <div key={step} className={`step ${currentStep >= step ? 'active' : ''}`}>
              <div className="step-number">{step}</div>
              <div className="step-text">
                {step === 1 && 'AI Setup'}
                {step === 2 && 'Skills'}
                {step === 3 && 'AI Review'}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {currentStep === 1 && renderProjectSetup()}
          {currentStep === 2 && renderSkillSelection()}
          {currentStep === 3 && renderAnalysisReview()}

          {error && (
            <div className="error-message">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-actions">
            <div className="action-buttons">
              {currentStep > 1 && (
                <button type="button" onClick={prevStep} className="btn-secondary">
                  <ChevronLeft size={16} />
                  Previous
                </button>
              )}
              
              {currentStep < 3 ? (
                <button 
                  type="button" 
                  onClick={nextStep}
                  disabled={!isStepValid(currentStep) || isAnalyzing}
                  className="btn-primary"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="spinner"></div>
                      AI Analyzing...
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRight size={16} />
                    </>
                  )}
                </button>
              ) : (
                <button 
                  type="submit" 
                  disabled={isLoading || !isStepValid(currentStep)}
                  className="btn-primary"
                >
                  {isLoading ? (
                    <>
                      <div className="spinner"></div>
                      Creating AI Project...
                    </>
                  ) : (
                    <>
                      Create AI Project
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectForm;