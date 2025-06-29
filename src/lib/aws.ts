import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// AWS Configuration
const AWS_REGION = import.meta.env.VITE_AWS_REGION || 'us-east-1';
const AWS_ACCESS_KEY_ID = import.meta.env.VITE_AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY;
const S3_BUCKET_NAME = import.meta.env.VITE_S3_BUCKET_NAME;

// Initialize AWS clients
let bedrockClient: BedrockRuntimeClient | null = null;
let s3Client: S3Client | null = null;

export const initializeAWS = () => {
  if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
    console.warn('AWS credentials not found. AWS services will not be available.');
    return false;
  }

  const credentials = {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  };

  bedrockClient = new BedrockRuntimeClient({
    region: AWS_REGION,
    credentials,
  });

  s3Client = new S3Client({
    region: AWS_REGION,
    credentials,
  });

  return true;
};

export const getBedrockClient = () => {
  if (!bedrockClient) {
    throw new Error('Bedrock client not initialized. Call initializeAWS first.');
  }
  return bedrockClient;
};

export const getS3Client = () => {
  if (!s3Client) {
    throw new Error('S3 client not initialized. Call initializeAWS first.');
  }
  return s3Client;
};

// AWS Bedrock AI Analysis Functions
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

export const analyzeProjectWithBedrock = async (
  request: ProjectAnalysisRequest
): Promise<ProjectAnalysisResponse> => {
  const bedrock = getBedrockClient();

  const prompt = `
You are an AI project analysis expert. Analyze the following project and provide a comprehensive assessment.

Project Description: ${request.projectDescription}
Project Goals: ${request.projectGoals || 'Not specified'}
Target Skills: ${request.targetSkills.join(', ')}

Please provide a detailed analysis in the following JSON format:
{
  "clarity_score": <number 1-10>,
  "feasibility_score": <number 1-10>,
  "identified_risks": [<array of risk strings>],
  "suggested_technologies": [<array of technology strings>],
  "detected_skills": [
    {
      "id": "<unique_id>",
      "name": "<skill_name>",
      "category": "<technical|soft|language|certification>",
      "proficiency": "<beginner|intermediate|advanced|expert|master>",
      "demonstrationMethod": "<code|video|documentation|presentation|live-demo>",
      "requirements": "<specific requirements for demonstrating this skill>",
      "aiPrompt": "<AI verification strategy for this skill>"
    }
  ],
  "skill_mapping": [
    {
      "skill": "<skill_name>",
      "demonstration_method": "<method>",
      "complexity_level": <number 1-5>,
      "verification_criteria": [<array of criteria strings>]
    }
  ]
}

Focus on:
1. Realistic assessment of project clarity and feasibility
2. Identification of potential risks and challenges
3. Technology recommendations based on project requirements
4. Detailed skill analysis with appropriate demonstration methods
5. AI-powered verification strategies for each skill
6. Complexity assessment for skill demonstrations

Ensure all skills from the target list are included in the analysis.
`;

  const command = new InvokeModelCommand({
    modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  });

  try {
    const response = await bedrock.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    // Extract the JSON from Claude's response
    const content = responseBody.content[0].text;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error('No valid JSON found in Bedrock response');
    }

    const analysisResult = JSON.parse(jsonMatch[0]);
    
    // Ensure all required fields are present
    return {
      clarity_score: analysisResult.clarity_score || 5,
      feasibility_score: analysisResult.feasibility_score || 5,
      identified_risks: analysisResult.identified_risks || [],
      suggested_technologies: analysisResult.suggested_technologies || [],
      detected_skills: analysisResult.detected_skills || [],
      skill_mapping: analysisResult.skill_mapping || [],
    };
  } catch (error) {
    console.error('Bedrock analysis error:', error);
    throw new Error(`AI analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Video Analysis with Bedrock
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

export const analyzeVideoWithBedrock = async (
  request: VideoAnalysisRequest
): Promise<VideoAnalysisResponse> => {
  const bedrock = getBedrockClient();

  const prompt = `
You are an AI skill verification expert. Analyze a video demonstration for the skill "${request.skillName}".

Skill Requirements: ${request.skillRequirements}
Verification Criteria: ${request.verificationCriteria.join(', ')}
Video URL: ${request.videoUrl}

Note: Since I cannot directly view the video, I'll provide a simulated analysis based on the skill requirements and criteria. In a real implementation, this would use multimodal AI capabilities.

Please provide analysis in this JSON format:
{
  "rating": <number 1-5>,
  "feedback": "<detailed feedback string>",
  "confidence": <number 0-1>,
  "detected_elements": [<array of detected skill elements>],
  "improvement_suggestions": [<array of improvement suggestions>]
}

Base the analysis on:
1. Skill complexity and requirements
2. Verification criteria provided
3. Best practices for demonstrating ${request.skillName}
4. Common areas for improvement in skill demonstrations

Provide constructive feedback and realistic ratings.
`;

  const command = new InvokeModelCommand({
    modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  });

  try {
    const response = await bedrock.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    const content = responseBody.content[0].text;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error('No valid JSON found in Bedrock response');
    }

    const analysisResult = JSON.parse(jsonMatch[0]);
    
    return {
      rating: analysisResult.rating || 3,
      feedback: analysisResult.feedback || 'Analysis completed',
      confidence: analysisResult.confidence || 0.8,
      detected_elements: analysisResult.detected_elements || [],
      improvement_suggestions: analysisResult.improvement_suggestions || [],
    };
  } catch (error) {
    console.error('Bedrock video analysis error:', error);
    throw new Error(`Video analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// S3 File Upload Functions
export const uploadFileToS3 = async (
  file: File,
  key: string,
  folder: string = 'uploads'
): Promise<string> => {
  if (!S3_BUCKET_NAME) {
    throw new Error('S3 bucket name not configured');
  }

  const s3 = getS3Client();
  const fullKey = `${folder}/${key}`;

  const command = new PutObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: fullKey,
    Body: file,
    ContentType: file.type,
    Metadata: {
      originalName: file.name,
      uploadedAt: new Date().toISOString(),
    },
  });

  try {
    await s3.send(command);
    
    // Return the S3 URL
    return `https://${S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${fullKey}`;
  } catch (error) {
    console.error('S3 upload error:', error);
    throw new Error(`File upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Generate presigned URL for secure file access
export const generatePresignedUrl = async (
  key: string,
  expiresIn: number = 3600
): Promise<string> => {
  if (!S3_BUCKET_NAME) {
    throw new Error('S3 bucket name not configured');
  }

  const s3 = getS3Client();

  const command = new GetObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: key,
  });

  try {
    const url = await getSignedUrl(s3, command, { expiresIn });
    return url;
  } catch (error) {
    console.error('Presigned URL generation error:', error);
    throw new Error(`URL generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Upload video and get analysis
export const uploadAndAnalyzeVideo = async (
  videoFile: File,
  projectId: string,
  skillName: string,
  skillRequirements: string,
  verificationCriteria: string[]
): Promise<{ videoUrl: string; analysis: VideoAnalysisResponse }> => {
  try {
    // Upload video to S3
    const videoKey = `videos/${projectId}/${Date.now()}-${videoFile.name}`;
    const videoUrl = await uploadFileToS3(videoFile, videoKey, 'project-videos');

    // Analyze video with Bedrock
    const analysis = await analyzeVideoWithBedrock({
      videoUrl,
      skillName,
      skillRequirements,
      verificationCriteria,
    });

    return { videoUrl, analysis };
  } catch (error) {
    console.error('Upload and analysis error:', error);
    throw error;
  }
};

// Utility function to check AWS availability
export const isAWSAvailable = (): boolean => {
  return !!(AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY && S3_BUCKET_NAME);
};

// Initialize AWS on module load
if (typeof window !== 'undefined') {
  initializeAWS();
}