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
  category: 'technical' | 'soft' | 'language' | 'certification';
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master';
  demonstrationMethod: 'code' | 'video' | 'documentation' | 'presentation' | 'live-demo';
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

    // Simulate AI analysis (in production, this would call an actual AI service)
    const analysisResult: ProjectAnalysisResponse = {
      clarity_score: Math.floor(Math.random() * 3) + 7, // 7-10
      feasibility_score: Math.floor(Math.random() * 3) + 7, // 7-10
      identified_risks: [
        'Technical complexity may require additional learning time',
        'Integration challenges between different technologies',
        'Time management for comprehensive skill demonstration'
      ],
      suggested_technologies: [
        'React.js for frontend development',
        'Node.js for backend services',
        'PostgreSQL for data storage',
        'Docker for containerization',
        'AWS/Vercel for deployment'
      ],
      detected_skills: targetSkills.map((skill, index) => ({
        id: `skill_${index + 1}`,
        name: skill,
        category: categorizeSkill(skill),
        proficiency: 'intermediate',
        demonstrationMethod: getDemonstrationMethod(skill),
        requirements: `Demonstrate practical application of ${skill} through hands-on implementation and clear explanation of concepts`,
        aiPrompt: `Create a comprehensive demonstration showing ${skill} expertise through real-world application and problem-solving`
      })),
      skill_mapping: targetSkills.map(skill => ({
        skill,
        demonstration_method: getDemonstrationMethod(skill),
        complexity_level: Math.floor(Math.random() * 3) + 2, // 2-5
        verification_criteria: [
          `Clear explanation of ${skill} concepts`,
          `Practical implementation demonstration`,
          `Problem-solving approach showcase`,
          `Best practices application`
        ]
      }))
    }

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

function categorizeSkill(skill: string): 'technical' | 'soft' | 'language' | 'certification' {
  const technicalSkills = ['react', 'node', 'python', 'javascript', 'typescript', 'sql', 'aws', 'docker', 'git']
  const softSkills = ['leadership', 'communication', 'management', 'teamwork', 'problem solving']
  const languages = ['english', 'spanish', 'french', 'german', 'mandarin']
  const certifications = ['aws certified', 'google cloud', 'microsoft', 'scrum', 'pmp']

  const lowerSkill = skill.toLowerCase()
  
  if (technicalSkills.some(tech => lowerSkill.includes(tech))) return 'technical'
  if (softSkills.some(soft => lowerSkill.includes(soft))) return 'soft'
  if (languages.some(lang => lowerSkill.includes(lang))) return 'language'
  if (certifications.some(cert => lowerSkill.includes(cert))) return 'certification'
  
  return 'technical' // default
}

function getDemonstrationMethod(skill: string): 'code' | 'video' | 'documentation' | 'presentation' | 'live-demo' {
  const lowerSkill = skill.toLowerCase()
  
  if (lowerSkill.includes('communication') || lowerSkill.includes('leadership') || lowerSkill.includes('presentation')) {
    return 'video'
  }
  if (lowerSkill.includes('documentation') || lowerSkill.includes('writing')) {
    return 'documentation'
  }
  if (lowerSkill.includes('react') || lowerSkill.includes('code') || lowerSkill.includes('programming')) {
    return 'code'
  }
  if (lowerSkill.includes('design') || lowerSkill.includes('ui') || lowerSkill.includes('ux')) {
    return 'presentation'
  }
  
  return 'video' // default
}