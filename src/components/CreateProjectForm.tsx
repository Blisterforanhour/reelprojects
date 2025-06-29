/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import './CreateProjectForm.css';
import { getSupabaseClient } from '../lib/auth';
import { analyzeProjectWithBedrock, isAWSAvailable } from '../lib/aws';
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
  Cloud,
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
  const [useAWS, setUseAWS] = useState(isAWSAvailable());
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

  // Generate AI-powered skill suggestions based on project description
  const generateSkillSuggestions = async () => {
    if (!projectDescription || projectDescription.length < 50) return;

    setIsGeneratingSuggestions(true);
    try {
      if (useAWS && isAWSAvailable()) {
        // Use AWS Bedrock for skill suggestions
        const { getBedrockClient } = await import('../lib/aws');
        const bedrock = getBedrockClient();
        
        const prompt = `
Based on this project description, suggest relevant skills that would be needed and could be demonstrated:

Project: ${projectDescription}
Goals: ${projectGoals || 'Not specified'}

Please provide skill suggestions in the following JSON format:
{
  "technical": [<array of technical skills>],
  "soft": [<array of soft skills>],
  "language": [<array of language skills if relevant>],
  "certification": [<array of relevant certifications>]
}

Focus on:
1. Skills directly applicable to this project
2. Modern, in-demand skills in the relevant industry
3. Skills that can be practically demonstrated through project work
4. Both foundational and advanced skills for comprehensive coverage

Limit to 8-10 skills per category, prioritizing the most relevant ones.
`;

        const { InvokeModelCommand } = await import('@aws-sdk/client-bedrock-runtime');
        const command = new InvokeModelCommand({
          modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
          contentType: 'application/json',
          accept: 'application/json',
          body: JSON.stringify({
            anthropic_version: 'bedrock-2023-05-31',
            max_tokens: 2000,
            messages: [{ role: 'user', content: prompt }],
          }),
        });

        const response = await bedrock.send(command);
        const responseBody = JSON.parse(new TextDecoder().decode(response.body));
        const content = responseBody.content[0].text;
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
          const suggestions = JSON.parse(jsonMatch[0]);
          setAiSuggestedSkills(suggestions);
        }
      } else {
        // Fallback to Supabase edge function
        const supabase = getSupabaseClient();
        const { data, error } = await supabase.functions.invoke('generate-skill-suggestions', {
          body: { projectDescription, projectGoals }
        });

        if (!error && data) {
          setAiSuggestedSkills(data);
        }
      }
    } catch (err) {
      console.error('Failed to generate skill suggestions:', err);
      // Fallback to basic suggestions based on keywords
      generateBasicSuggestions();
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  // Fallback basic suggestions based on keywords
  const generateBasicSuggestions = () => {
    const description = projectDescription.toLowerCase();
    const suggestions: {[category: string]: string[]} = {
      technical: [],
      soft: [],
      language: [],
      certification: []
    };

    // Technical skills based on keywords
    const techKeywords = {
      'react': ['React', 'JavaScript', 'TypeScript', 'HTML/CSS', 'Redux'],
      'node': ['Node.js', 'Express.js', 'JavaScript', 'REST APIs', 'MongoDB'],
      'python': ['Python', 'Django', 'Flask', 'Data Analysis', 'Machine Learning'],
      'mobile': ['React Native', 'Flutter', 'iOS Development', 'Android Development'],
      'data': ['SQL', 'PostgreSQL', 'Data Analysis', 'Python', 'Tableau'],
      'cloud': ['AWS', 'Docker', 'Kubernetes', 'DevOps', 'CI/CD'],
      'ai': ['Machine Learning', 'Python', 'TensorFlow', 'Data Science', 'Neural Networks']
    };

    Object.entries(techKeywords).forEach(([keyword, skills]) => {
      if (description.includes(keyword)) {
        suggestions.technical.push(...skills);
      }
    });

    // Always include relevant soft skills
    suggestions.soft = [
      'Problem Solving', 'Project Management', 'Communication', 'Team Collaboration',
      'Critical Thinking', 'Time Management', 'Adaptability', 'Leadership'
    ];

    // Basic certifications
    suggestions.certification = [
      'AWS Certified Solutions Architect', 'Google Cloud Professional',
      'Scrum Master', 'PMP', 'CompTIA Security+'
    ];

    // Remove duplicates and limit
    Object.keys(suggestions).forEach(category => {
      suggestions[category] = [...new Set(suggestions[category])].slice(0, 10);
    });

    setAiSuggestedSkills(suggestions);
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
      if (useAWS && isAWSAvailable()) {
        // Use AWS Bedrock for analysis
        console.log('Using AWS Bedrock for AI analysis...');
        const analysisResult = await analyzeProjectWithBedrock({
          projectDescription,
          projectGoals,
          targetSkills
        });

        console.log('AWS Bedrock analysis successful:', analysisResult);
        setAnalysis(analysisResult);
        generateSkillFeedback(analysisResult);
      } else {
        // Fallback to Supabase edge function
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
          setAnalysisError(`AI analysis failed: ${error.message}`);
          return;
        }

        console.log('Supabase AI analysis successful:', data);
        setAnalysis(data);
        generateSkillFeedback(data);
      }
      
    } catch (err) {
      console.error('Analysis request failed:', err);
      setAnalysisError(`AI analysis failed: ${err instanceof Error ? err.message : 'Unknown error'}. ${!useAWS ? 'Trying fallback method...' : ''}`);
      
      // If AWS fails, try Supabase as fallback
      if (useAWS && isAWSAvailable()) {
        try {
          console.log('AWS failed, trying Supabase fallback...');
          const supabase = getSupabaseClient();
          
          const { data, error } = await supabase.functions.invoke('analyze-project-scope', {
            body: {
              projectDescription,
              projectGoals,
              targetSkills
            }
          });

          if (!error && data) {
            setAnalysis(data);
            generateSkillFeedback(data);
            setAnalysisError(null);
          }
        } catch (fallbackError) {
          console.error('Fallback analysis also failed:', fallbackError);
        }
      }
    } finally {
      setIsAnalyzing(false);
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
      setError('Please wait for AI analysis to complete before creating the project');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Generate a project plan based on the AI analysis
      const generateProjectPlan = (skills: ProjectSkill[], description: string): string[] => {
        const plan = [
          `Project Setup: Initialize the ${projectName} project with proper structure and dependencies`,
          'Requirements Analysis: Define detailed specifications and user stories based on AI recommendations',
          'Architecture Design: Plan the system architecture using suggested technologies',
          ...skills.map(skill => `${skill.name} Implementation: ${skill.requirements}`),
          'Integration Testing: Ensure all components work together seamlessly',
          'AI-Powered Documentation: Create comprehensive project documentation with skill verification evidence',
          'Quality Assurance: Conduct thorough testing and prepare for AI skill verification',
          'Deployment & Presentation: Deploy the project and present skill demonstrations for AI analysis'
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
        type: useAWS ? 'AWS-Powered Multi-Skill Showcase' : 'AI-Powered Multi-Skill Showcase',
        user_id: 'current_user' // This will be set properly in the parent component
      };

      console.log(`${useAWS ? 'AWS' : 'AI'}-powered project created:`, newProject);
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
          <h2>{useAWS ? 'AWS-Powered' : 'AI-Powered'} Project Setup</h2>
          <p>Define your project and let {useAWS ? 'AWS Bedrock' : 'AI'} analyze the optimal skill demonstration approach</p>
        </div>
      </div>

      {isAWSAvailable() && (
        <div className="aws-toggle-section">
          <div className="aws-toggle-container">
            <div className="toggle-info">
              <Cloud size={20} />
              <div>
                <span className="toggle-label">Use AWS Bedrock for AI Analysis</span>
                <small className="toggle-description">
                  Enhanced AI capabilities with AWS Bedrock and S3 storage
                </small>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={useAWS}
                onChange={(e) => setUseAWS(e.target.checked)}
                disabled={isLoading || isAnalyzing}
              />
              <span className="toggle-slider"></span>
            </label>
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
          placeholder={`Describe what you're building, its purpose, key features, and target users. Be specific about the problems it solves. ${useAWS ? 'AWS Bedrock' : 'AI'} will analyze this to suggest optimal skill demonstrations.`}
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
          placeholder={`What specific outcomes do you want to achieve? How will you measure success? ${useAWS ? 'AWS Bedrock' : 'AI'} will use this to optimize skill verification strategies.`}
          disabled={isLoading}
          rows={3}
        />
      </div>

      {projectDescription.length > 50 && (
        <div className="real-time-analysis">
          {isAnalyzing ? (
            <div className="analyzing-indicator">
              <div className="spinner"></div>
              <span>{useAWS ? 'AWS Bedrock' : 'AI'} is analyzing your project for optimal skill demonstration...</span>
            </div>
          ) : analysis ? (
            <div className="analysis-preview">
              <div className="analysis-scores">
                <div className="score-item">
                  <span>{useAWS ? 'AWS' : 'AI'} Clarity Score</span>
                  <span className="score">{analysis.clarity_score}/10</span>
                </div>
                <div className="score-item">
                  <span>Feasibility</span>
                  <span className="score">{analysis.feasibility_score}/10</span>
                </div>
              </div>
              <div className="quick-insights">
                <Lightbulb size={16} />
                <span>{useAWS ? 'AWS Bedrock' : 'AI'} detected {analysis.detected_skills.length} skills and generated verification strategies</span>
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
          <h2>{useAWS ? 'AWS-Enhanced' : 'AI-Enhanced'} Skill Selection</h2>
          <p>Select skills for {useAWS ? 'AWS Bedrock' : 'AI'}-powered verification and automated demonstration planning</p>
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
              placeholder={`Add a skill for ${useAWS ? 'AWS' : 'AI'} analysis (e.g., React, Leadership, UI Design)`}
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
            {useAWS ? <Cloud size={20} /> : <Brain size={20} />}
            {useAWS ? 'AWS' : 'AI'}-Generated Skill Suggestions
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
            {useAWS ? 'AWS' : 'AI'}-Analyzed Skills ({targetSkills.length})
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
                          <span>{useAWS ? 'AWS' : 'AI'}: {skillAnalysis.demonstrationMethod}</span>
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
                        <strong>{useAWS ? 'AWS' : 'AI'} Requirement:</strong> {skillAnalysis.requirements}
                      </div>
                      {skillAnalysis.aiPrompt && (
                        <div className="ai-prompt">
                          <strong>{useAWS ? 'AWS' : 'AI'} Verification Strategy:</strong> {skillAnalysis.aiPrompt}
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
          <h2>{useAWS ? 'AWS Bedrock' : 'AI'} Analysis & Verification Plan</h2>
          <p>Review {useAWS ? 'AWS Bedrock' : 'AI'}-generated skill verification strategies and project insights</p>
        </div>
      </div>

      {analysis ? (
        <div className="analysis-section">
          <div className="analysis-overview">
            <div className="analysis-scores">
              <div className="score-card">
                <div className="score-number">{analysis.clarity_score}</div>
                <div className="score-label">{useAWS ? 'AWS' : 'AI'} Clarity Score</div>
              </div>
              <div className="score-card">
                <div className="score-number">{analysis.feasibility_score}</div>
                <div className="score-label">Feasibility Score</div>
              </div>
              <div className="score-card">
                <div className="score-number">{analysis.detected_skills.length}</div>
                <div className="score-label">{useAWS ? 'AWS' : 'AI'}-Analyzed Skills</div>
              </div>
            </div>
          </div>

          <div className="skills-verification-plan">
            <h3>{useAWS ? 'AWS-Powered' : 'AI-Powered'} Skill Verification Plan</h3>
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
                        <span>{useAWS ? 'AWS' : 'AI'} Complexity:</span>
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
                        <strong>{useAWS ? 'AWS' : 'AI'} Method:</strong> {skill.demonstrationMethod.replace('-', ' ')}
                      </div>
                      
                      <div className="verification-criteria">
                        <strong>{useAWS ? 'AWS' : 'AI'} Verification Criteria:</strong>
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
              <h3>{useAWS ? 'AWS' : 'AI'}-Identified Risks & Considerations</h3>
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
              <h3>{useAWS ? 'AWS' : 'AI'}-Suggested Technologies & Tools</h3>
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
          <h3>No {useAWS ? 'AWS' : 'AI'} Analysis Available</h3>
          <p>Complete the previous steps to see {useAWS ? 'AWS Bedrock' : 'AI'}-powered analysis and verification strategies</p>
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
        return analysis !== null; // Require AI analysis to be complete
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
          <h1>Create {useAWS ? 'AWS-Powered' : 'AI-Powered'} Project</h1>
          <button onClick={onClose} className="close-btn">
            <X size={24} />
          </button>
        </div>

        <div className="step-indicator">
          {[1, 2, 3].map(step => (
            <div key={step} className={`step ${currentStep >= step ? 'active' : ''}`}>
              <div className="step-number">{step}</div>
              <div className="step-text">
                {step === 1 && `${useAWS ? 'AWS' : 'AI'} Setup`}
                {step === 2 && 'Skills'}
                {step === 3 && `${useAWS ? 'AWS' : 'AI'} Review`}
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
                      {useAWS ? 'AWS' : 'AI'} Analyzing...
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
                      Creating {useAWS ? 'AWS' : 'AI'} Project...
                    </>
                  ) : (
                    <>
                      Create {useAWS ? 'AWS' : 'AI'} Project
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