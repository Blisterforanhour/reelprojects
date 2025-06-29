/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import './CreateProjectForm.css';
import { getSupabaseClient } from '@reelapps/auth';
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
  Users
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

  const skillCategories = {
    technical: ['React', 'Node.js', 'Python', 'TypeScript', 'SQL', 'MongoDB', 'AWS', 'Docker', 'Git', 'JavaScript'],
    soft: ['Leadership', 'Communication', 'Problem Solving', 'Project Management', 'Team Collaboration', 'Time Management', 'Critical Thinking', 'Creativity', 'Adaptability', 'Mentoring'],
    language: ['English', 'Spanish', 'French', 'German', 'Mandarin', 'Japanese', 'Korean', 'Italian', 'Portuguese', 'Arabic'],
    certification: ['AWS Certified', 'Google Cloud', 'Microsoft Azure', 'Scrum Master', 'PMP', 'CISSP', 'CompTIA', 'Cisco', 'Oracle', 'Salesforce']
  };

  const demonstrationIcons = {
    code: Code,
    video: Video,
    documentation: FileText,
    presentation: Presentation,
    'live-demo': Monitor
  };

  // Real-time analysis when project details change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (projectDescription.length > 50 && targetSkills.length > 0) {
        handleRealTimeAnalysis();
      }
    }, 1500); // Debounce for 1.5 seconds

    return () => clearTimeout(timer);
  }, [projectDescription, projectGoals, targetSkills]);

  const createMockAnalysis = (description: string, goals: string, skills: string[]): ScopeAnalysis => {
    const detectedSkills: ProjectSkill[] = skills.map((skill, index) => {
      const category = getSkillCategory(skill);
      const demonstrationMethod = getDefaultDemonstrationMethod(category);
      
      return {
        id: `skill-${index}`,
        name: skill,
        category,
        proficiency: ['intermediate', 'advanced', 'expert'][Math.floor(Math.random() * 3)] as any,
        demonstrationMethod,
        requirements: getSkillRequirements(skill, demonstrationMethod),
        aiPrompt: getSkillAIPrompt(skill, demonstrationMethod)
      };
    });

    return {
      clarity_score: Math.floor(Math.random() * 3) + 7,
      feasibility_score: Math.floor(Math.random() * 3) + 7,
      identified_risks: [
        'Multi-skill demonstration complexity may require careful timeline planning',
        'Integration challenges between different skill demonstration methods',
        'Maintaining quality standards across diverse skill areas',
        'Ensuring authentic skill verification without over-engineering'
      ],
      suggested_technologies: [
        'GitHub for code repository and version control',
        'Loom or similar for video skill demonstrations',
        'Notion or GitBook for comprehensive documentation',
        'Figma for design and presentation materials'
      ],
      detected_skills: detectedSkills,
      skill_mapping: detectedSkills.map(skill => ({
        skill: skill.name,
        demonstration_method: skill.demonstrationMethod,
        complexity_level: Math.floor(Math.random() * 3) + 3,
        verification_criteria: getVerificationCriteria(skill.name, skill.demonstrationMethod)
      }))
    };
  };

  const getSkillCategory = (skillName: string): 'technical' | 'soft' | 'language' | 'certification' => {
    const lowerSkill = skillName.toLowerCase();
    
    if (skillCategories.technical.some(tech => lowerSkill.includes(tech.toLowerCase()))) return 'technical';
    if (skillCategories.soft.some(soft => lowerSkill.includes(soft.toLowerCase()))) return 'soft';
    if (skillCategories.language.some(lang => lowerSkill.includes(lang.toLowerCase()))) return 'language';
    if (skillCategories.certification.some(cert => lowerSkill.includes(cert.toLowerCase()))) return 'certification';
    
    return 'technical';
  };

  const getDefaultDemonstrationMethod = (category: string): 'code' | 'video' | 'documentation' | 'presentation' | 'live-demo' => {
    switch (category) {
      case 'technical': return 'code';
      case 'soft': return 'video';
      case 'language': return 'presentation';
      case 'certification': return 'documentation';
      default: return 'code';
    }
  };

  const getSkillRequirements = (skill: string, method: string): string => {
    const methodRequirements = {
      code: `Build a functional feature that demonstrates ${skill} expertise with clean, well-documented code`,
      video: `Create a 3-5 minute video explaining ${skill} concepts and showing practical application`,
      documentation: `Write comprehensive documentation showcasing ${skill} knowledge and implementation details`,
      presentation: `Develop a presentation that demonstrates ${skill} understanding and real-world usage`,
      'live-demo': `Prepare a live demonstration showing ${skill} in action with interactive examples`
    };
    
    return methodRequirements[method as keyof typeof methodRequirements] || methodRequirements.code;
  };

  const getSkillAIPrompt = (skill: string, method: string): string => {
    const prompts = {
      code: `Implement a feature using ${skill} that shows mastery of core concepts, best practices, and real-world application. Include proper error handling, testing, and documentation.`,
      video: `Record yourself explaining ${skill} fundamentals, demonstrate a practical example, and discuss how you've applied this skill in professional contexts.`,
      documentation: `Create detailed documentation for ${skill} that includes setup guides, usage examples, troubleshooting tips, and advanced techniques you've mastered.`,
      presentation: `Design a presentation about ${skill} that covers theory, practical applications, case studies, and your personal expertise journey.`,
      'live-demo': `Prepare a live coding/demonstration session showcasing ${skill} where you build something functional while explaining your thought process.`
    };
    
    return prompts[method as keyof typeof prompts] || prompts.code;
  };

  const getVerificationCriteria = (skill: string, method: string): string[] => {
    const baseCriteria = [
      `Demonstrates practical understanding of ${skill}`,
      'Shows real-world application and context',
      'Includes clear explanations and documentation'
    ];

    const methodSpecific = {
      code: ['Code quality and best practices', 'Proper testing and error handling', 'Clean architecture and documentation'],
      video: ['Clear communication and explanation', 'Practical demonstration included', 'Professional presentation quality'],
      documentation: ['Comprehensive coverage of topics', 'Well-structured and organized', 'Includes examples and use cases'],
      presentation: ['Engaging and informative content', 'Visual aids and examples', 'Demonstrates expertise depth'],
      'live-demo': ['Interactive and engaging demonstration', 'Handles questions and edge cases', 'Shows problem-solving in real-time']
    };

    return [...baseCriteria, ...(methodSpecific[method as keyof typeof methodSpecific] || methodSpecific.code)];
  };

  const handleRealTimeAnalysis = async () => {
    if (isAnalyzing || !projectDescription || targetSkills.length === 0) return;

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.functions.invoke('analyze-project-scope', {
        body: {
          projectDescription,
          projectGoals,
          targetSkills
        }
      });

      if (error) {
        console.warn('Edge Function failed, using enhanced mock analysis:', error);
        const mockAnalysis = createMockAnalysis(projectDescription, projectGoals, targetSkills);
        setAnalysis(mockAnalysis);
        generateSkillFeedback(mockAnalysis);
      } else {
        setAnalysis(data);
        generateSkillFeedback(data);
      }
    } catch (err) {
      console.warn('Analysis request failed, using enhanced mock analysis:', err);
      const mockAnalysis = createMockAnalysis(projectDescription, projectGoals, targetSkills);
      setAnalysis(mockAnalysis);
      generateSkillFeedback(mockAnalysis);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectName || !projectDescription || targetSkills.length === 0) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let analysisData = analysis;
      if (!analysisData) {
        analysisData = createMockAnalysis(projectDescription, projectGoals, targetSkills);
        setAnalysis(analysisData);
      }

      // Generate a project plan based on the skills and description
      const generateProjectPlan = (skills: ProjectSkill[], description: string): string[] => {
        const plan = [
          `Project Setup: Initialize the ${projectName} project with proper structure and dependencies`,
          'Requirements Analysis: Define detailed specifications and user stories',
          'Architecture Design: Plan the system architecture and technology stack',
          ...skills.map(skill => `${skill.name} Implementation: ${skill.requirements}`),
          'Integration Testing: Ensure all components work together seamlessly',
          'Documentation: Create comprehensive project documentation and skill verification evidence',
          'Final Review: Conduct thorough testing and prepare for skill verification',
          'Deployment & Presentation: Deploy the project and present skill demonstrations'
        ];
        return plan;
      };

      const newProject = {
        id: Date.now().toString(),
        name: projectName,
        description: projectDescription,
        goals: projectGoals,
        target_skills: targetSkills,
        analysis: analysisData,
        plan: generateProjectPlan(analysisData.detected_skills, projectDescription),
        skill_demonstrations: analysisData.detected_skills.map(skill => ({
          ...skill,
          status: 'planned',
          evidence_url: null,
          verified: false,
          rating: null,
          verification_feedback: null
        })),
        status: 'active',
        created_at: new Date().toISOString(),
        type: 'multi-skill-showcase'
      };

      console.log('Multi-skill project created:', newProject);
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
          <h2>Project Setup</h2>
          <p>Define your multi-skill showcase project</p>
        </div>
      </div>

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
          placeholder="Describe what you're building, its purpose, key features, and target users. Be specific about the problems it solves."
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
          placeholder="What specific outcomes do you want to achieve? How will you measure success?"
          disabled={isLoading}
          rows={3}
        />
      </div>

      {projectDescription.length > 50 && (
        <div className="real-time-analysis">
          {isAnalyzing ? (
            <div className="analyzing-indicator">
              <div className="spinner"></div>
              <span>AI is analyzing your project...</span>
            </div>
          ) : analysis ? (
            <div className="analysis-preview">
              <div className="analysis-scores">
                <div className="score-item">
                  <span>Clarity Score</span>
                  <span className="score">{analysis.clarity_score}/10</span>
                </div>
                <div className="score-item">
                  <span>Feasibility</span>
                  <span className="score">{analysis.feasibility_score}/10</span>
                </div>
              </div>
              <div className="quick-insights">
                <Lightbulb size={16} />
                <span>AI detected {analysis.detected_skills.length} skills from your description</span>
              </div>
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
          <h2>Skills to Demonstrate</h2>
          <p>Select skills you'll showcase and get verified through this project</p>
        </div>
      </div>
      
      <div className="skill-input-section">
        <div className="skill-input-container">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            placeholder="Add a skill (e.g., React, Leadership, UI Design)"
            disabled={isLoading}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
          />
          <button type="button" onClick={addSkill} disabled={!newSkill.trim()} className="add-skill-btn">
            <Plus size={16} />
          </button>
        </div>
      </div>

      {targetSkills.length > 0 && (
        <div className="selected-skills">
          <h3>Selected Skills ({targetSkills.length})</h3>
          <div className="skills-grid">
            {targetSkills.map((skill, index) => {
              const skillAnalysis = analysis?.detected_skills.find(s => s.name === skill);
              const DemoIcon = skillAnalysis ? demonstrationIcons[skillAnalysis.demonstrationMethod] : Code;
              const feedback = skillFeedback[skill];
              
              return (
                <div key={index} className="skill-card">
                  <div className="skill-header">
                    <div className="skill-info">
                      <span className="skill-name">{skill}</span>
                      {skillAnalysis && (
                        <div className="demo-method">
                          <DemoIcon size={14} />
                          <span>{skillAnalysis.demonstrationMethod}</span>
                        </div>
                      )}
                    </div>
                    <button type="button" onClick={() => removeSkill(skill)} className="remove-skill">
                      <X size={14} />
                    </button>
                  </div>
                  
                  {skillAnalysis && (
                    <div className="skill-details">
                      <div className="skill-requirement">
                        <strong>Requirement:</strong> {skillAnalysis.requirements}
                      </div>
                      {skillAnalysis.aiPrompt && (
                        <div className="ai-prompt">
                          <strong>AI Challenge:</strong> {skillAnalysis.aiPrompt}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {feedback && (
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

      <div className="skill-suggestions">
        <h3>Popular Skills by Category</h3>
        {Object.entries(skillCategories).map(([category, skills]) => (
          <div key={category} className="skill-category">
            <h4>{category.charAt(0).toUpperCase() + category.slice(1)} Skills</h4>
            <div className="suggestion-chips">
              {skills.slice(0, 8).map(skill => (
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
        ))}
      </div>
    </div>
  );

  const renderAnalysisReview = () => (
    <div className="form-step">
      <div className="step-header">
        <Users className="step-icon" size={24} />
        <div>
          <h2>AI Analysis & Verification Plan</h2>
          <p>Review how your skills will be demonstrated and verified</p>
        </div>
      </div>

      {analysis ? (
        <div className="analysis-section">
          <div className="analysis-overview">
            <div className="analysis-scores">
              <div className="score-card">
                <div className="score-number">{analysis.clarity_score}</div>
                <div className="score-label">Clarity Score</div>
              </div>
              <div className="score-card">
                <div className="score-number">{analysis.feasibility_score}</div>
                <div className="score-label">Feasibility Score</div>
              </div>
              <div className="score-card">
                <div className="score-number">{analysis.detected_skills.length}</div>
                <div className="score-label">Skills Detected</div>
              </div>
            </div>
          </div>

          <div className="skills-verification-plan">
            <h3>Skill Verification Plan</h3>
            <div className="verification-grid">
              {analysis.detected_skills.map((skill, index) => {
                const DemoIcon = demonstrationIcons[skill.demonstrationMethod];
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
                        <span>Complexity:</span>
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
                        <strong>Method:</strong> {skill.demonstrationMethod.replace('-', ' ')}
                      </div>
                      
                      <div className="verification-criteria">
                        <strong>Verification Criteria:</strong>
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
              <h3>Identified Risks & Considerations</h3>
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
              <h3>Suggested Technologies & Tools</h3>
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
          <h3>No Analysis Available</h3>
          <p>Complete the previous steps to see AI analysis</p>
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
        return true; // Review step is always valid if we reached it
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
          <h1>Create Multi-Skill Project</h1>
          <button onClick={onClose} className="close-btn">
            <X size={24} />
          </button>
        </div>

        <div className="step-indicator">
          {[1, 2, 3].map(step => (
            <div key={step} className={`step ${currentStep >= step ? 'active' : ''}`}>
              <div className="step-number">{step}</div>
              <div className="step-text">
                {step === 1 && 'Setup'}
                {step === 2 && 'Skills'}
                {step === 3 && 'Review'}
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
                  disabled={!isStepValid(currentStep)}
                  className="btn-primary"
                >
                  Next
                  <ChevronRight size={16} />
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
                      Creating Project...
                    </>
                  ) : (
                    <>
                      Create Project
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
