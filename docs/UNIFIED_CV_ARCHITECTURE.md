# Unified CV/Resume Architecture for ReelApps Ecosystem

## Overview
This document outlines the architecture for a unified, dynamic CV/resume system that integrates data from ReelProjects and ReelSkills platforms to create a comprehensive, public-facing professional profile.

## System Architecture

### 1. Data Sources Integration

#### ReelProjects Data
- **Verified Skills**: Skills demonstrated and AI/AWS-verified through project work
- **Project Portfolio**: Completed projects with evidence and ratings
- **Technical Competencies**: Code repositories, live demos, documentation
- **Skill Ratings**: AI-generated ratings (1-5 scale) with confidence scores
- **Project Impact**: Measurable outcomes and achievements

#### ReelSkills Data
- **Skill Assessments**: Standardized skill evaluations and certifications
- **Learning Progress**: Course completions and skill development tracking
- **Peer Endorsements**: Professional recommendations and validations
- **Industry Benchmarks**: Skill level comparisons against industry standards
- **Continuous Learning**: Ongoing skill development and upskilling activities

### 2. Unified Data Model

```typescript
interface UnifiedProfile {
  // Basic Information
  id: string;
  user_id: string;
  slug: string; // Public URL identifier
  
  // Personal Details
  personal_info: {
    first_name: string;
    last_name: string;
    headline: string;
    summary: string;
    location: string;
    avatar_url: string;
    contact_info: {
      email?: string;
      phone?: string;
      linkedin?: string;
      github?: string;
      portfolio?: string;
    };
  };

  // Unified Skills
  skills: UnifiedSkill[];
  
  // Project Portfolio
  projects: ProjectShowcase[];
  
  // Professional Experience
  experience: WorkExperience[];
  
  // Education & Certifications
  education: Education[];
  certifications: Certification[];
  
  // Achievements & Metrics
  achievements: Achievement[];
  metrics: ProfileMetrics;
  
  // Visibility & Settings
  visibility: VisibilitySettings;
  last_updated: string;
}

interface UnifiedSkill {
  id: string;
  name: string;
  category: 'technical' | 'soft' | 'language' | 'certification';
  
  // Aggregated from both platforms
  overall_rating: number; // 1-5 scale
  confidence_score: number; // 0-1 scale
  
  // Source breakdown
  sources: {
    reelprojects?: {
      verified_count: number;
      avg_rating: number;
      latest_verification: string;
      evidence_urls: string[];
    };
    reelskills?: {
      assessment_score: number;
      completion_date: string;
      certification_level: string;
      endorsements: number;
    };
  };
  
  // Verification status
  verification_status: 'verified' | 'assessed' | 'endorsed' | 'claimed';
  verification_date: string;
  
  // Professional context
  years_experience: number;
  proficiency_level: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master';
  industry_ranking?: number; // Percentile ranking
}

interface ProjectShowcase {
  id: string;
  title: string;
  description: string;
  role: string;
  technologies: string[];
  
  // Dates
  start_date: string;
  end_date?: string;
  
  // Evidence & Links
  github_url?: string;
  live_url?: string;
  demo_video_url?: string;
  documentation_url?: string;
  
  // AI Analysis Results
  ai_analysis: {
    clarity_score: number;
    technical_complexity: number;
    innovation_score: number;
    impact_assessment: string;
  };
  
  // Verified Skills from this project
  verified_skills: {
    skill_name: string;
    rating: number;
    evidence_type: 'code' | 'video' | 'documentation' | 'live-demo';
    verification_date: string;
  }[];
  
  // Metrics
  metrics?: {
    github_stars?: number;
    live_users?: number;
    performance_metrics?: any;
  };
  
  featured: boolean;
}
```

### 3. Data Aggregation Logic

#### Skill Rating Calculation
```typescript
function calculateUnifiedSkillRating(
  reelProjectsData: ProjectSkillData[],
  reelSkillsData: SkillAssessmentData
): UnifiedSkillRating {
  
  // Weight factors
  const PROJECT_WEIGHT = 0.6; // Real-world application
  const ASSESSMENT_WEIGHT = 0.4; // Standardized testing
  
  let projectScore = 0;
  let assessmentScore = 0;
  
  // Calculate project-based score
  if (reelProjectsData.length > 0) {
    const avgProjectRating = reelProjectsData.reduce((sum, p) => sum + p.rating, 0) / reelProjectsData.length;
    const recencyBonus = calculateRecencyBonus(reelProjectsData);
    const complexityBonus = calculateComplexityBonus(reelProjectsData);
    
    projectScore = Math.min(5, avgProjectRating + recencyBonus + complexityBonus);
  }
  
  // Calculate assessment-based score
  if (reelSkillsData) {
    assessmentScore = reelSkillsData.normalized_score; // Already 1-5 scale
  }
  
  // Weighted combination
  const finalScore = (projectScore * PROJECT_WEIGHT) + (assessmentScore * ASSESSMENT_WEIGHT);
  
  // Confidence calculation
  const confidence = calculateConfidence(reelProjectsData, reelSkillsData);
  
  return {
    overall_rating: Math.round(finalScore * 10) / 10, // Round to 1 decimal
    confidence_score: confidence,
    verification_status: determineVerificationStatus(reelProjectsData, reelSkillsData)
  };
}
```

### 4. Public CV Generation

#### URL Structure
```
https://cv.reelapp.co.za/{user-slug}
https://cv.reelapp.co.za/{user-slug}/skills
https://cv.reelapp.co.za/{user-slug}/projects
https://cv.reelapp.co.za/{user-slug}/download/pdf
```

#### CV Templates
1. **Executive Summary View**: High-level overview with key metrics
2. **Technical Profile**: Detailed skills and project breakdown
3. **Portfolio View**: Visual project showcase with media
4. **Traditional CV**: Classic resume format for ATS systems
5. **Interactive Dashboard**: Real-time skill verification status

### 5. Database Schema

```sql
-- Unified CV profiles
CREATE TABLE unified_cv_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  personal_info JSONB NOT NULL DEFAULT '{}',
  visibility_settings JSONB NOT NULL DEFAULT '{}',
  seo_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  last_sync_at TIMESTAMPTZ DEFAULT now()
);

-- Unified skills aggregation
CREATE TABLE unified_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES unified_cv_profiles(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  category skill_category NOT NULL,
  overall_rating DECIMAL(2,1) CHECK (overall_rating >= 1 AND overall_rating <= 5),
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  verification_status TEXT CHECK (verification_status IN ('verified', 'assessed', 'endorsed', 'claimed')),
  reelprojects_data JSONB DEFAULT '{}',
  reelskills_data JSONB DEFAULT '{}',
  years_experience INTEGER DEFAULT 0,
  proficiency_level proficiency_level NOT NULL,
  industry_ranking INTEGER,
  last_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(profile_id, skill_name)
);

-- Project showcase
CREATE TABLE cv_project_showcase (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES unified_cv_profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  custom_description TEXT,
  visibility_override JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- CV analytics
CREATE TABLE cv_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES unified_cv_profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'view', 'download', 'contact', 'skill_click'
  visitor_info JSONB DEFAULT '{}',
  referrer TEXT,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 6. API Endpoints

```typescript
// Public CV API
GET /api/cv/{slug}                    // Get public CV data
GET /api/cv/{slug}/skills             // Get skills breakdown
GET /api/cv/{slug}/projects           // Get project portfolio
GET /api/cv/{slug}/download/pdf       // Generate PDF CV
GET /api/cv/{slug}/analytics          // Get public metrics (views, etc.)

// Private Management API
POST /api/cv/sync                     // Sync data from ReelProjects & ReelSkills
PUT /api/cv/settings                  // Update visibility and preferences
POST /api/cv/generate-slug            // Generate/update public slug
GET /api/cv/preview                   // Preview CV before publishing
```

### 7. Data Synchronization Strategy

#### Real-time Sync Triggers
- New project completion in ReelProjects
- Skill verification in ReelProjects
- Assessment completion in ReelSkills
- Profile updates in either platform

#### Sync Process
```typescript
async function syncUnifiedProfile(userId: string) {
  // 1. Fetch latest data from both platforms
  const [projectsData, skillsData] = await Promise.all([
    fetchReelProjectsData(userId),
    fetchReelSkillsData(userId)
  ]);
  
  // 2. Aggregate and calculate unified metrics
  const unifiedSkills = aggregateSkills(projectsData.skills, skillsData.skills);
  const projectShowcase = processProjects(projectsData.projects);
  
  // 3. Update unified profile
  await updateUnifiedProfile(userId, {
    skills: unifiedSkills,
    projects: projectShowcase,
    last_sync_at: new Date()
  });
  
  // 4. Trigger CV regeneration if public
  if (await isProfilePublic(userId)) {
    await regeneratePublicCV(userId);
  }
}
```

### 8. SEO & Discoverability

#### Meta Tags Generation
```typescript
function generateSEOMetadata(profile: UnifiedProfile): SEOMetadata {
  const topSkills = profile.skills
    .filter(s => s.verification_status === 'verified')
    .sort((a, b) => b.overall_rating - a.overall_rating)
    .slice(0, 5)
    .map(s => s.name);
    
  return {
    title: `${profile.personal_info.first_name} ${profile.personal_info.last_name} - ${profile.personal_info.headline}`,
    description: `Professional profile showcasing verified skills in ${topSkills.join(', ')}. View projects, certifications, and AI-verified competencies.`,
    keywords: [...topSkills, 'portfolio', 'resume', 'verified skills', 'professional profile'],
    og_image: generateProfileCard(profile),
    structured_data: generateStructuredData(profile)
  };
}
```

### 9. Privacy & Visibility Controls

#### Granular Visibility Settings
```typescript
interface VisibilitySettings {
  profile_public: boolean;
  show_contact_info: boolean;
  show_salary_expectations: boolean;
  show_availability_status: boolean;
  
  skills_visibility: {
    show_ratings: boolean;
    show_verification_details: boolean;
    hide_skills: string[]; // Skills to hide
  };
  
  projects_visibility: {
    featured_only: boolean;
    hide_projects: string[]; // Projects to hide
    show_source_code: boolean;
  };
  
  analytics_enabled: boolean;
  search_engine_indexing: boolean;
}
```

### 10. Implementation Phases

#### Phase 1: Core Infrastructure
- Database schema setup
- Basic data aggregation logic
- Simple public CV template
- Sync mechanism between platforms

#### Phase 2: Enhanced Features
- Multiple CV templates
- PDF generation
- Analytics dashboard
- SEO optimization

#### Phase 3: Advanced Capabilities
- AI-powered CV optimization suggestions
- Industry benchmarking
- Skill gap analysis
- Career progression insights

#### Phase 4: Ecosystem Integration
- ATS integration
- Recruiter dashboard
- API for third-party integrations
- Mobile app support

This architecture provides a robust foundation for creating dynamic, data-driven CVs that showcase real, verified skills and achievements from across the ReelApps ecosystem.