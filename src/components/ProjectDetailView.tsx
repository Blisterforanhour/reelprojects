import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Target, 
  CheckCircle, 
  Circle, 
  Clock, 
  Brain, 
  Star, 
  Award, 
  Video, 
  Code, 
  FileText, 
  Presentation, 
  Rocket,
  Upload,
  ExternalLink,
  Eye
} from 'lucide-react';
import { getSupabaseClient } from '../lib/auth';
import './ProjectDetailView.css';

interface ProjectSkill {
  id: string;
  name: string;
  category: 'technical' | 'soft' | 'language' | 'certification';
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master';
  demonstrationMethod: 'code' | 'video' | 'documentation' | 'presentation' | 'live-demo';
  requirements: string;
  aiPrompt?: string;
  status?: 'planned' | 'in-progress' | 'completed' | 'verified';
  evidence_url?: string | null;
  verified?: boolean;
  rating?: number | null;
  verification_feedback?: string;
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

interface ProjectData {
  id: string;
  name: string;
  description: string;
  goals?: string;
  target_skills: string[];
  analysis: ScopeAnalysis;
  plan: string[];
  skill_demonstrations: ProjectSkill[];
  status: string;
  created_at: string;
  type: string;
}

interface ProjectDetailViewProps {
  projects: ProjectData[];
}

const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({ projects }) => {
  const { id: projectId } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [projectVideo, setProjectVideo] = useState<File | null>(null);
  const [showVideoUploadModal, setShowVideoUploadModal] = useState(false);
  const [videoAnalyzing, setVideoAnalyzing] = useState(false);

  useEffect(() => {
    // Try to get project from navigation state first
    const stateProject = location.state?.project as ProjectData;
    
    if (stateProject && stateProject.id === projectId) {
      setProject(stateProject);
      setIsLoading(false);
      return;
    }

    // Otherwise try to find project from props
    if (projects && projectId) {
      const foundProject = projects.find((p: ProjectData) => p.id === projectId);
      if (foundProject) {
        setProject(foundProject);
        setIsLoading(false);
        return;
      }
    }

    setIsLoading(false);
  }, [projectId, location.state, projects]);

  if (isLoading) {
    return (
      <div className="project-detail-view">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading AI-powered project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="project-detail-view">
        <div className="project-not-found">
          <div className="not-found-content">
            <Target size={64} className="not-found-icon" />
            <h2>Project Not Found</h2>
            <p>The AI-powered project you're looking for could not be found.</p>
            <button onClick={() => navigate('/')} className="btn btn-primary">
              <ArrowLeft size={16} />
              Back to Projects
            </button>
          </div>
        </div>
      </div>
    );
  }

  const demonstrationIcons = {
    code: Code,
    video: Video,
    documentation: FileText,
    presentation: Presentation,
    'live-demo': Rocket
  };

  const demonstrationLabels = {
    code: 'Code Repository',
    video: 'Video Demo',
    documentation: 'Documentation',
    presentation: 'Presentation',
    'live-demo': 'Live Demo'
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return '#64748B';
      case 'in-progress': return '#F59E0B';
      case 'completed': return '#3B82F6';
      case 'verified': return '#10B981';
      default: return '#64748B';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planned': return Circle;
      case 'in-progress': return Clock;
      case 'completed': return CheckCircle;
      case 'verified': return Award;
      default: return Circle;
    }
  };

  const handleSkillProgress = (skillId: string, newStatus: string) => {
    console.log(`Updating skill ${skillId} to status: ${newStatus}`);
    
    // Update project state with new skill status
    const updatedProject = {
      ...project,
      skill_demonstrations: project.skill_demonstrations.map(s => 
        s.id === skillId 
          ? { ...s, status: newStatus as ProjectSkill['status'] }
          : s
      )
    };

    setProject(updatedProject);
    
    // Update localStorage
    const savedProjects = localStorage.getItem('reelProjects');
    if (savedProjects) {
      try {
        const projects = JSON.parse(savedProjects);
        const updatedProjects = projects.map((p: ProjectData) => 
          p.id === project.id ? updatedProject : p
        );
        localStorage.setItem('reelProjects', JSON.stringify(updatedProjects));
      } catch (error) {
        console.error('Error updating localStorage:', error);
      }
    }
  };

  const handleProjectVideoUpload = () => {
    setShowVideoUploadModal(true);
  };

  const handleVideoUpload = async () => {
    if (!projectVideo || !project) return;

    setUploadingVideo(true);
    
    try {
      console.log('Uploading project showcase video for AI analysis...');
      
      // Use Supabase for video upload and analysis
      console.log('Using Supabase for video upload and analysis...');
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('video', projectVideo);
      formData.append('projectId', project.id);
      formData.append('skillIds', JSON.stringify(project.skill_demonstrations.map(s => s.id)));
      
      // Upload to Supabase Storage
      const supabase = getSupabaseClient();
      const fileName = `${project.id}-showcase-${Date.now()}.${projectVideo.name.split('.').pop()}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('project-videos')
        .upload(fileName, projectVideo);

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('project-videos')
        .getPublicUrl(fileName);

      console.log('Video uploaded successfully, starting AI analysis...');
      
      // Automatically analyze video for all skills
      await handleVideoAnalysis(publicUrl);
      
      setShowVideoUploadModal(false);
      setProjectVideo(null);
    } catch (error) {
      console.error('Video upload failed:', error);
      alert(`Failed to upload video: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleVideoAnalysis = async (videoUrl: string) => {
    if (!project) return;
    
    try {
      setVideoAnalyzing(true);
      console.log('Starting AI analysis of project showcase video...');
      
      const supabase = getSupabaseClient();
      const skillAnalysis = [];
      
      // Process each skill with the AI video verification
      for (const skill of project.skill_demonstrations) {
        try {
          console.log(`Analyzing skill: ${skill.name}`);
          
          const { data, error } = await supabase.functions.invoke('verify-skill-video', {
            body: {
              action: 'verify-project-evidence',
              projectId: project.id,
              skillId: skill.id,
              skillName: skill.name,
              demonstrationMethod: 'video',
              evidenceUrl: videoUrl,
              evidenceType: projectVideo?.type || 'video/mp4',
              skillRequirements: skill.requirements,
              verificationCriteria: project.analysis.skill_mapping.find(m => m.skill === skill.name)?.verification_criteria || []
            }
          });
          
          if (error) {
            console.error(`AI verification failed for skill ${skill.name}:`, error);
            continue;
          }

          if (data && data.rating) {
            skillAnalysis.push({
              skillId: skill.id,
              rating: data.rating,
              feedback: data.feedback || `AI verified ${skill.name} demonstration in video`,
              confidence: data.confidence || 0.8
            });
            console.log(`AI verification successful for ${skill.name}: ${data.rating}/5`);
          }
        } catch (err) {
          console.warn(`AI verification failed for skill ${skill.name}:`, err);
        }
      }

      if (skillAnalysis.length === 0) {
        throw new Error('AI analysis failed for all skills. Please try again or check your video quality.');
      }

      console.log('AI video analysis completed:', skillAnalysis);

      // Update all skills with AI verification results
      const updatedProject = {
        ...project,
        skill_demonstrations: project.skill_demonstrations.map(skill => {
          const skillResult = skillAnalysis.find(r => r.skillId === skill.id);
          return skillResult ? {
            ...skill,
            verified: true,
            rating: skillResult.rating,
            status: 'verified' as const,
            verification_feedback: skillResult.feedback,
            evidence_url: videoUrl
          } : {
            ...skill,
            evidence_url: videoUrl,
            status: 'completed' as const
          };
        })
      };

      setProject(updatedProject);
      
      // Update localStorage
      const savedProjects = localStorage.getItem('reelProjects');
      if (savedProjects) {
        try {
          const projects = JSON.parse(savedProjects);
          const updatedProjects = projects.map((p: ProjectData) => 
            p.id === project.id ? updatedProject : p
          );
          localStorage.setItem('reelProjects', JSON.stringify(updatedProjects));
        } catch (error) {
          console.error('Error updating localStorage:', error);
        }
      }

      // Show comprehensive AI results
      const verifiedSkills = skillAnalysis.length;
      const avgRating = skillAnalysis.reduce((acc, s) => acc + s.rating, 0) / skillAnalysis.length;
      
      alert(`🤖 AI Analysis Complete!\n\n${verifiedSkills} skills verified from your showcase video!\nAverage AI Rating: ${avgRating.toFixed(1)}/5\n\nCheck individual skill ratings and AI feedback below.`);
      
    } catch (error) {
      console.error('AI video analysis error:', error);
      alert(`AI analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease ensure your video clearly demonstrates each skill and try again.`);
    } finally {
      setVideoAnalyzing(false);
    }
  };

  const renderSkillCard = (skill: ProjectSkill) => {
    const IconComponent = (demonstrationIcons as Record<string, React.ComponentType>)[skill.demonstrationMethod] || Code;
    const StatusIcon = getStatusIcon(skill.status || 'planned');
    
    return (
      <div key={skill.id} className="skill-card">
        <div className="skill-header">
          <div className="skill-info">
            <div className="skill-title">
              <h4>{skill.name}</h4>
              <span className="skill-category">{skill.category}</span>
            </div>
            <div className="skill-meta">
              <span className="proficiency">{skill.proficiency}</span>
              <div className="demonstration-type">
                <IconComponent size={16} />
                AI: {demonstrationLabels[skill.demonstrationMethod]}
              </div>
            </div>
          </div>
          <div className="skill-status">
            <StatusIcon 
              size={20} 
              style={{ color: getStatusColor(skill.status || 'planned') }}
            />
            <span style={{ color: getStatusColor(skill.status || 'planned') }}>
              {(skill.status || 'planned').replace('-', ' ')}
            </span>
          </div>
        </div>

        <p className="skill-requirements">AI Requirement: {skill.requirements}</p>

        {skill.aiPrompt && (
          <div className="ai-prompt">
            <Brain size={16} />
            <span>AI Strategy: {skill.aiPrompt}</span>
          </div>
        )}

        {skill.evidence_url && (
          <div className="evidence-section">
            <h5>Evidence</h5>
            <a href={skill.evidence_url} target="_blank" rel="noopener noreferrer" className="evidence-link">
              <ExternalLink size={16} />
              View AI-Analyzed Submission
            </a>
          </div>
        )}

        {skill.verified && skill.rating && (
          <div className="verification-section">
            <div className="verification-header">
              <CheckCircle size={16} className="verified-icon" />
              <span>🤖 AI Verified</span>
            </div>
            <div className="skill-rating">
              <span className="rating-label">AI Rating: </span>
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  size={16}
                  fill={i < skill.rating! ? '#FCD34D' : 'none'}
                  stroke={i < skill.rating! ? '#FCD34D' : 'currentColor'}
                />
              ))}
              <span className="rating-text">({skill.rating}/5)</span>
            </div>
            {skill.verification_feedback && (
              <div className="ai-feedback">
                <Brain size={14} />
                <span className="feedback-text">AI Feedback: {skill.verification_feedback}</span>
              </div>
            )}
          </div>
        )}

        <div className="skill-actions">
          {skill.evidence_url && (
            <div className="evidence-indicator">
              <Eye size={16} />
              <span>AI-analyzed in project video</span>
            </div>
          )}

          {skill.status !== 'verified' && (
            <select
              value={skill.status || 'planned'}
              onChange={(e) => handleSkillProgress(skill.id, e.target.value)}
              className="status-select"
            >
              <option value="planned">Planned</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="project-detail-view">
      <div className="project-header">
        <button onClick={() => navigate('/')} className="back-button">
          <ArrowLeft size={20} />
          Back to Projects
        </button>
        
        <div className="project-info">
          <div className="project-title-section">
            <h1>{project.name}</h1>
            <span className="project-type">AI-Powered Showcase</span>
          </div>
          <p className="project-description">{project.description}</p>
          {project.goals && <p className="project-goals">Goals: {project.goals}</p>}
        </div>
      </div>

      <div className="project-content">
        <div className="content-grid">
          <div className="main-content">
            {/* AI-powered video upload section */}
            <section className="video-upload-section">
              <div className="section-header">
                <h2>
                  <Video size={24} />
                  AI-Powered Project Showcase
                </h2>
                <p className="section-description">
                  Upload your project video for AI analysis and automatic skill verification
                </p>
              </div>
              
              {!project.skill_demonstrations.some(s => s.evidence_url) ? (
                <div className="upload-prompt">
                  <div className="upload-instructions">
                    <h3>🤖 AI-Enhanced Multi-Skill Analysis</h3>
                    <p>Upload a comprehensive video demonstrating all {project.skill_demonstrations.length} skills. Our advanced AI will automatically analyze and verify each skill demonstration.</p>
                    <ul>
                      <li>Duration: 5-15 minutes total</li>
                      <li>Clearly announce each skill as you demonstrate it</li>
                      <li>Show actual work and explain your approach</li>
                      <li>AI will provide detailed feedback and ratings</li>
                    </ul>
                  </div>
                  <button 
                    className="upload-video-btn"
                    onClick={handleProjectVideoUpload}
                    disabled={videoAnalyzing}
                  >
                    <Upload size={20} />
                    Upload for AI Analysis
                  </button>
                </div>
              ) : (
                <div className="video-status">
                  <CheckCircle size={20} />
                  <div className="status-info">
                    <span>Video analyzed by AI</span>
                    <small>{project.skill_demonstrations.filter(s => s.verified).length} skills AI-verified</small>
                  </div>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={handleProjectVideoUpload}
                  >
                    Re-analyze with AI
                  </button>
                </div>
              )}
            </section>

            <section className="skills-section">
              <div className="section-header">
                <h2>
                  <Target size={24} />
                  AI-Verified Skills ({project.skill_demonstrations?.length || 0})
                </h2>
                <div className="progress-summary">
                  <span>
                    {project.skill_demonstrations?.filter(s => s.status === 'verified').length || 0} AI-verified,
                    {' '}
                    {project.skill_demonstrations?.filter(s => s.status === 'completed').length || 0} completed,
                    {' '}
                    {project.skill_demonstrations?.filter(s => s.status === 'in-progress').length || 0} in progress
                  </span>
                </div>
              </div>
              
              <div className="skills-grid">
                {project.skill_demonstrations?.map((skill) => renderSkillCard(skill)) || <p>No skills to demonstrate</p>}
              </div>
            </section>

            <section className="plan-section">
              <h2>
                <Brain size={24} />
                AI-Generated Project Plan
              </h2>
              <div className="plan-steps">
                {project.plan?.map((step, index) => (
                  <div key={index} className="plan-step">
                    <div className="step-number">{index + 1}</div>
                    <div className="step-content">
                      <p>{step}</p>
                    </div>
                  </div>
                )) || <p>No AI-generated plan available</p>}
              </div>
            </section>
          </div>

          <div className="sidebar">
            <div className="analysis-card">
              <h3>
                <Brain size={20} />
                AI Analysis Results
              </h3>
              <div className="analysis-scores">
                <div className="score-item">
                  <span>AI Clarity Score</span>
                  <span className="score">{project.analysis?.clarity_score || 0}/10</span>
                </div>
                <div className="score-item">
                  <span>AI Feasibility</span>
                  <span className="score">{project.analysis?.feasibility_score || 0}/10</span>
                </div>
              </div>

              <div className="analysis-section">
                <h4>AI-Identified Risks</h4>
                <ul className="risk-list">
                  {project.analysis?.identified_risks?.map((risk, index) => (
                    <li key={index}>{risk}</li>
                  )) || <li>No AI risks identified</li>}
                </ul>
              </div>

              <div className="analysis-section">
                <h4>AI-Suggested Technologies</h4>
                <div className="tech-tags">
                  {project.analysis?.suggested_technologies?.map((tech, index) => (
                    <span key={index} className="tech-tag">{tech}</span>
                  )) || <span className="tech-tag">No AI suggestions</span>}
                </div>
              </div>
            </div>

            <div className="reelcv-integration">
              <h3>
                <Award size={20} />
                ReelApps Integration
              </h3>
              <p>AI-verified skills from this project will automatically appear on your professional profile with AI ratings.</p>
              
              <div className="integration-stats">
                <div className="stat">
                  <span className="stat-number">
                    {project.skill_demonstrations?.filter(s => s.verified).length || 0}
                  </span>
                  <span className="stat-label">AI-Verified Skills</span>
                </div>
                <div className="stat">
                  <span className="stat-number">
                    {project.skill_demonstrations?.filter(s => s.rating).length ? 
                      (project.skill_demonstrations.filter(s => s.rating).reduce((acc, s) => acc + (s.rating || 0), 0) / project.skill_demonstrations.filter(s => s.rating).length).toFixed(1) : 
                      '0.0'
                    }
                  </span>
                  <span className="stat-label">Avg AI Rating</span>
                </div>
              </div>

              <div className="mb-4">
                <button 
                  className="btn btn-primary full-width mb-3"
                  onClick={() => {
                    window.open('https://reelcv.reelapps.co.za', '_blank', 'noopener,noreferrer');
                  }}
                >
                  <Eye size={16} />
                  View AI Profile on ReelCV
                </button>
                
                <div className="text-xs text-gray-500 space-y-1">
                  <p>
                    <strong>Explore more ReelApps tools:</strong>
                  </p>
                  <div className="flex flex-col gap-1">
                    <a 
                      href="https://reelpersona.reelapps.co.za" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      • ReelPersona - Work Personality Assessment
                    </a>
                    <a 
                      href="https://reelhunter.reelapps.co.za" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      • ReelHunter - Find Opportunities
                    </a>
                    <a 
                      href="https://reelskills.reelapps.co.za" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      • ReelSkills - Skill Development
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI-powered video upload modal */}
      {showVideoUploadModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Upload for AI Analysis</h3>
              <button 
                className="close-btn"
                onClick={() => setShowVideoUploadModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-content">
              <div className="video-upload-instructions">
                <h4>🤖 AI-Powered Skill Verification</h4>
                <p className="upload-description">
                  Upload your project showcase video for advanced AI analysis. Our AI will automatically identify, analyze, and verify each skill demonstration with detailed feedback.
                </p>

                <div className="skills-to-demonstrate">
                  <h5>Skills for AI analysis:</h5>
                  <div className="skill-list">
                    {project?.skill_demonstrations.map((skill, index) => (
                      <div key={skill.id} className="skill-item">
                        <span className="skill-number">{index + 1}</span>
                        <div className="skill-info">
                          <strong>{skill.name}</strong>
                          <p>AI will analyze: {skill.requirements}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="video-guidelines">
                  <h5>🎯 AI Analysis Guidelines:</h5>
                  <ul>
                    <li>Keep it between 5-15 minutes total</li>
                    <li>Clearly state which skill you're demonstrating</li>
                    <li>Show your work in action with explanations</li>
                    <li>AI will provide detailed ratings and feedback</li>
                    <li>Use good lighting and audio for better AI analysis</li>
                    <li>Organize sections by skill for optimal AI recognition</li>
                  </ul>
                </div>
              </div>

              <div className="file-upload-area">
                <input
                  type="file"
                  id="project-video"
                  onChange={(e) => setProjectVideo(e.target.files?.[0] || null)}
                  accept="video/*"
                  className="file-input"
                />
                <label htmlFor="project-video" className="file-upload-label">
                  <Video size={24} />
                  <span>{projectVideo ? projectVideo.name : 'Choose video file for AI analysis'}</span>
                  <small>Supported formats: MP4, MOV, AVI, WebM</small>
                </label>
              </div>

              <div className="modal-actions">
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowVideoUploadModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={handleVideoUpload}
                  disabled={!projectVideo || uploadingVideo}
                >
                  {uploadingVideo ? (
                    <>
                      <div className="spinner"></div>
                      AI Analyzing...
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      Upload & AI Analyze
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetailView;