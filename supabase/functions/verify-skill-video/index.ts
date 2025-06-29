import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface VideoAnalysisRequest {
  action: string;
  projectId: string;
  skillId: string;
  skillName: string;
  demonstrationMethod: string;
  evidenceUrl: string;
  evidenceType: string;
  skillRequirements: string;
  verificationCriteria: string[];
}

interface VideoAnalysisResponse {
  rating: number;
  feedback: string;
  confidence: number;
  detected_elements: string[];
  improvement_suggestions: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const request: VideoAnalysisRequest = await req.json()

    // Simulate AI video analysis (in production, this would use actual video analysis AI)
    const analysisResult: VideoAnalysisResponse = {
      rating: Math.floor(Math.random() * 2) + 4, // 4-5 rating
      feedback: `Excellent demonstration of ${request.skillName}. The video clearly shows practical application and understanding of key concepts. Well-structured presentation with clear explanations.`,
      confidence: 0.85 + Math.random() * 0.1, // 0.85-0.95
      detected_elements: [
        `Clear explanation of ${request.skillName} concepts`,
        'Practical implementation shown',
        'Problem-solving approach demonstrated',
        'Best practices applied',
        'Professional presentation style'
      ],
      improvement_suggestions: [
        'Consider adding more detailed code comments',
        'Could benefit from showing error handling scenarios',
        'Demonstrate testing approaches for better completeness'
      ]
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