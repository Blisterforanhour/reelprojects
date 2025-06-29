// Note: This file is kept for compatibility but AWS functionality has been removed
// to avoid potential trademark issues. All AWS-related functions now return fallback values.

export const initializeAWS = () => {
  console.log('AWS functionality disabled for compliance reasons');
  return false;
};

export const isAWSAvailable = (): boolean => {
  return false;
};

export const getAWSConfig = () => {
  return {
    region: 'disabled',
    bucket: 'disabled',
    available: false,
  };
};

// Placeholder interfaces for compatibility
export interface ProjectAnalysisRequest {
  projectDescription: string;
  projectGoals?: string;
  targetSkills: string[];
}

export interface ProjectAnalysisResponse {
  clarity_score: number;
  feasibility_score: number;
  identified_risks: string[];
  suggested_technologies: string[];
  detected_skills: Array<{
    id: string;
    name: string;
    category: 'technical' | 'soft' | 'language' | 'certification';
    proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master';
    demonstrationMethod: 'code' | 'video' | 'documentation' | 'presentation' | 'live-demo';
    requirements: string;
    aiPrompt?: string;
  }>;
  skill_mapping: Array<{
    skill: string;
    demonstration_method: string;
    complexity_level: number;
    verification_criteria: string[];
  }>;
}

export interface VideoAnalysisRequest {
  videoUrl: string;
  skillName: string;
  skillRequirements: string;
  verificationCriteria: string[];
}

export interface VideoAnalysisResponse {
  rating: number;
  feedback: string;
  confidence: number;
  detected_elements: string[];
  improvement_suggestions: string[];
}

// Disabled functions that return fallback values
export const analyzeProjectWithBedrock = async (
  request: ProjectAnalysisRequest
): Promise<ProjectAnalysisResponse> => {
  throw new Error('AWS functionality has been disabled for compliance reasons');
};

export const analyzeVideoWithBedrock = async (
  request: VideoAnalysisRequest
): Promise<VideoAnalysisResponse> => {
  throw new Error('AWS functionality has been disabled for compliance reasons');
};

export const uploadFileToS3 = async (
  file: File,
  key: string,
  folder: string = 'uploads'
): Promise<string> => {
  throw new Error('AWS functionality has been disabled for compliance reasons');
};

export const generatePresignedUrl = async (
  key: string,
  expiresIn: number = 3600
): Promise<string> => {
  throw new Error('AWS functionality has been disabled for compliance reasons');
};

export const uploadAndAnalyzeVideo = async (
  videoFile: File,
  projectId: string,
  skillName: string,
  skillRequirements: string,
  verificationCriteria: string[]
): Promise<{ videoUrl: string; analysis: VideoAnalysisResponse }> => {
  throw new Error('AWS functionality has been disabled for compliance reasons');
};

export const getBedrockClient = () => {
  throw new Error('AWS functionality has been disabled for compliance reasons');
};

export const getS3Client = () => {
  throw new Error('AWS functionality has been disabled for compliance reasons');
};