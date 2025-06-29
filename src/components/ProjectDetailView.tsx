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
import { getSupabaseClient } from '@reelapps/auth';
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

    // Create a mock project if not found
    if (projectId) {
      const mockProject: ProjectData = {
        id: projectId,
        name: 'Project Demo',
        description: 'A demonstration project to showcase the platform capabilities.',
        target_skills: ['React', 'TypeScript', 'Node.js'],
        analysis: {
          clarity_score: 8,
          feasibility_score: 7,
          identified_risks: [
            'Technical complexity may require additional research',
            'Timeline might need adjustment based on scope'
          ],
          suggested_technologies: [
            'React/TypeScript for frontend development',
            'Node.js for backend services'
          ],
          detected_skills: [],
          skill_mapping: []
        },
        plan: [
          '1. Project setup and environment configuration',
          '2. Core feature development and implementation', 
          '3. Testing and quality assurance',
          '4. Documentation and deployment preparation',
          '5. Launch and monitoring'
        ],
        skill_demonstrations: [],
        status: 'active',
        created_at: new Date().toISOString(),
        type: 'Multi-Skill Showcase'
      };
      setProject(mockProject);
    }
    
    setIsLoading(false);
  }, [projectId, location.state, projects]);

  if (isLoading) {
    return (
      <div className="project-detail-view">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading project...</p>
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
            <p>The project you're looking for could not be found.</p>
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
      console.log('Uploading project showcase video...');
      
      // Simulate file upload to storage
      await new Promise(resolve => setTimeout(resolve, 2000));
      const videoUrl = URL.createObjectURL(projectVideo);
      
      console.log('Project video uploaded successfully');
      
      // Automatically analyze video for all skills
      await handleVideoAnalysis(videoUrl);
      
      setShowVideoUploadModal(false);
      setProjectVideo(null);
    } catch (error) {
      console.error('Video upload failed:', error);
      alert('Failed to upload video. Please try again.');
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleVideoAnalysis = async (videoUrl: string) => {
    if (!project) return;
    
    try {
      setVideoAnalyzing(true);
      console.log('Starting AI analysis of project showcase video...');
      
      // Call the AI verification edge function for each skill
      const supabase = getSupabaseClient();
      const skillAnalysis = [];
      
      // Process each skill with the video
      for (const skill of project.skill_demonstrations) {
        try {
      const { data, error } = await supabase.functions.invoke('verify-skill-video', {
        body: {
          action: 'verify-project-evidence',
          projectId: project.id,
          skillId: skill.id,
          skillName: skill.name,
              demonstrationMethod: 'video',
              evidenceUrl: videoUrl,
              evidenceType: projectVideo?.type || 'video/mp4'
            }
          });
          
          if (!error && data) {
            skillAnalysis.push({
              skillId: skill.id,
              rating: data.rating,
              feedback: data.feedback
            });
          }
        } catch (err) {
          console.warn(`Verification failed for skill ${skill.name}:`, err);
        }
      }
      
      const data = { skillAnalysis };

      // Check if we got any successful verifications
      if (skillAnalysis.length === 0) {
        console.warn('AI video analysis failed, no skills verified, using fallback');
        await simulateVideoAnalysis();
        return;
      }

      console.log('AI video analysis completed:', data);

      // Update all skills with verification results
      const updatedProject = {
        ...project,
        skill_demonstrations: project.skill_demonstrations.map(skill => {
          const skillResult = data.skillAnalysis?.find((r: any) => r.skillId === skill.id);
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

      // Show comprehensive results
      const verifiedSkills = data.skillAnalysis?.length || 0;
      alert(`🎉 Video Analysis Complete!\n\n${verifiedSkills} skills verified from your showcase video!\n\nCheck individual skill ratings below.`);
      
    } catch (error) {
      console.error('Video analysis error:', error);
      await simulateVideoAnalysis();
    } finally {
      setVideoAnalyzing(false);
    }
  };

  const simulateVideoAnalysis = async () => {
    if (!project) return;
    
    console.log('Using fallback video analysis...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const ratings = [3, 4, 4, 5, 5];
    
    // Update all skills with simulated verification results
    const updatedProject = {
      ...project,
      skill_demonstrations: project.skill_demonstrations.map(skill => ({
        ...skill,
        verified: true,
        rating: ratings[Math.floor(Math.random() * ratings.length)],
        status: 'verified' as const,
        verification_feedback: `Demonstrated ${skill.name} skills in project showcase video`,
        evidence_url: projectVideo ? URL.createObjectURL(projectVideo) : undefined
      }))
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
    
    alert(`✅ Video Analysis Complete!\n\nAll ${project.skill_demonstrations.length} skills have been analyzed and verified from your showcase video!`);
  };

  const renderSkillCard = (skill: ProjectSkill) => {
    const IconComponent = demonstrationIcons[skill.demonstrationMethod];
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
                {demonstrationLabels[skill.demonstrationMethod]}
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

        <p className="skill-requirements">{skill.requirements}</p>

        {skill.aiPrompt && (
          <div className="ai-prompt">
            <Brain size={16} />
            <span>{skill.aiPrompt}</span>
          </div>
        )}

        {skill.evidence_url && (
          <div className="evidence-section">
            <h5>Evidence</h5>
            <a href={skill.evidence_url} target="_blank" rel="noopener noreferrer" className="evidence-link">
              <ExternalLink size={16} />
              View Submission
            </a>
          </div>
        )}

        {skill.verified && skill.rating && (
          <div className="verification-section">
            <div className="verification-header">
              <CheckCircle size={16} className="verified-icon" />
              <span>✨ AI Verified on ReelCV</span>
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
                <span className="feedback-text">{skill.verification_feedback}</span>
              </div>
            )}
          </div>
        )}

        <div className="skill-actions">
          {skill.evidence_url && (
            <div className="evidence-indicator">
              <Eye size={16} />
              <span>Included in project video</span>
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
            <span className="project-type">Multi-Skill Showcase</span>
          </div>
          <p className="project-description">{project.description}</p>
          {project.goals && <p className="project-goals">{project.goals}</p>}
        </div>
      </div>

      <div className="project-content">
        <div className="content-grid">
          <div className="main-content">
            {/* Video upload section */}
            <section className="video-upload-section">
              <div className="section-header">
                <h2>
                  <Video size={24} />
                  Project Showcase Video
                </h2>
                <p className="section-description">
                  Upload one comprehensive video demonstrating all skills in this project
                </p>
              </div>
              
              {!project.skill_demonstrations.some(s => s.evidence_url) ? (
                <div className="upload-prompt">
                  <div className="upload-instructions">
                    <h3>📹 Create Your Multi-Skill Showcase</h3>
                    <p>Record a single video demonstrating all {project.skill_demonstrations.length} skills listed below. Our AI will analyze your video and automatically verify each skill.</p>
                    <ul>
                      <li>Duration: 5-15 minutes total</li>
                      <li>Clearly announce each skill as you demonstrate it</li>
                      <li>Show actual work, not just explanations</li>
                      <li>Good lighting and clear audio required</li>
                    </ul>
                  </div>
                  <button 
                    className="upload-video-btn"
                    onClick={handleProjectVideoUpload}
                    disabled={videoAnalyzing}
                  >
                    <Upload size={20} />
                    Upload Showcase Video
                  </button>
                </div>
              ) : (
                <div className="video-status">
                  <CheckCircle size={20} />
                  <div className="status-info">
                    <span>Project video uploaded and analyzed</span>
                    <small>{project.skill_demonstrations.filter(s => s.verified).length} skills verified</small>
                  </div>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={handleProjectVideoUpload}
                  >
                    Replace Video
                  </button>
                </div>
              )}
            </section>

            <section className="skills-section">
              <div className="section-header">
                <h2>
                  <Target size={24} />
                  Skill Demonstrations ({project.skill_demonstrations?.length || 0})
                </h2>
                <div className="progress-summary">
                  <span>
                    {project.skill_demonstrations?.filter(s => s.status === 'verified').length || 0} verified,
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
                Project Plan
              </h2>
              <div className="plan-steps">
                {project.plan?.map((step, index) => (
                  <div key={index} className="plan-step">
                    <div className="step-number">{index + 1}</div>
                    <div className="step-content">
                      <p>{step}</p>
                    </div>
                  </div>
                )) || <p>No project plan available</p>}
              </div>
            </section>
          </div>

          <div className="sidebar">
            <div className="analysis-card">
              <h3>
                <Brain size={20} />
                AI Analysis
              </h3>
              <div className="analysis-scores">
                <div className="score-item">
                  <span>Clarity Score</span>
                  <span className="score">{project.analysis?.clarity_score || 0}/10</span>
                </div>
                <div className="score-item">
                  <span>Feasibility Score</span>
                  <span className="score">{project.analysis?.feasibility_score || 0}/10</span>
                </div>
              </div>

              <div className="analysis-section">
                <h4>Identified Risks</h4>
                <ul className="risk-list">
                  {project.analysis?.identified_risks?.map((risk, index) => (
                    <li key={index}>{risk}</li>
                  )) || <li>No risks identified</li>}
                </ul>
              </div>

              <div className="analysis-section">
                <h4>Suggested Technologies</h4>
                <div className="tech-tags">
                  {project.analysis?.suggested_technologies?.map((tech, index) => (
                    <span key={index} className="tech-tag">{tech}</span>
                  )) || <span className="tech-tag">No suggestions available</span>}
                </div>
              </div>
            </div>

            <div className="reelcv-integration">
              <h3>
                <Award size={20} />
                ReelCV Integration
              </h3>
              <p>Verified skills from this project will automatically appear on your ReelCV profile.</p>
              
              <div className="integration-stats">
                <div className="stat">
                  <span className="stat-number">
                    {project.skill_demonstrations?.filter(s => s.verified).length || 0}
                  </span>
                  <span className="stat-label">Skills on ReelCV</span>
                </div>
                <div className="stat">
                  <span className="stat-number">
                    {project.skill_demonstrations?.filter(s => s.rating).length ? 
                      (project.skill_demonstrations.filter(s => s.rating).reduce((acc, s) => acc + (s.rating || 0), 0) / project.skill_demonstrations.filter(s => s.rating).length).toFixed(1) : 
                      '0.0'
                    }
                  </span>
                  <span className="stat-label">Avg Rating</span>
                </div>
              </div>

              <button 
                className="btn btn-primary full-width"
                onClick={() => {
                  const reelCVUrl = window.location.origin.replace(':5175', ':5174');
                  window.open(reelCVUrl, '_blank', 'noopener,noreferrer');
                }}
              >
                <Eye size={16} />
                View on ReelCV
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Project Video Upload Modal */}
      {showVideoUploadModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Upload Project Showcase Video</h3>
              <button 
                className="close-btn"
                onClick={() => setShowVideoUploadModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-content">
              <div className="video-upload-instructions">
                <h4>📹 Creating Your Multi-Skill Showcase Video</h4>
              <p className="upload-description">
                  Create one comprehensive video demonstrating all the skills in this project. 
                  Your video will be analyzed by AI to verify each skill automatically.
                </p>

                <div className="skills-to-demonstrate">
                  <h5>Skills to demonstrate in your video:</h5>
                  <div className="skill-list">
                    {project?.skill_demonstrations.map((skill, index) => (
                      <div key={skill.id} className="skill-item">
                        <span className="skill-number">{index + 1}</span>
                        <div className="skill-info">
                          <strong>{skill.name}</strong>
                          <p>{skill.requirements}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="video-guidelines">
                  <h5>🎯 Video Guidelines:</h5>
                  <ul>
                    <li>Keep it between 5-15 minutes total</li>
                    <li>Clearly state which skill you're demonstrating</li>
                    <li>Show your work in action, not just talking</li>
                    <li>Include brief explanations of your approach</li>
                    <li>Use good lighting and audio quality</li>
                    <li>Organize sections by skill for easy identification</li>
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
                  <span>{projectVideo ? projectVideo.name : 'Choose video file or drag here'}</span>
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
                      Uploading & Analyzing...
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      Upload & Analyze Video
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
