export interface Project {
  id: string;
  name: string;
  description: string;
  goals?: string;
  target_skills: string[];
  analysis: any;
  plan: string[];
  skill_demonstrations: any[];
  status: string;
  created_at: string;
  type: string;
}

export interface ProjectSkill {
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

export interface ScopeAnalysis {
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