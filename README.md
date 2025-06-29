# ReelProjects

Part of the ReelApps ecosystem - AI-powered talent acquisition platform with AWS integration.

## About
ReelProjects is the project showcase platform, providing comprehensive project management, AWS Bedrock-powered AI analysis, and professional project presentations with secure S3 storage.

## Features
- **AWS Bedrock AI Analysis**: Advanced project scope analysis using Claude 3 Sonnet
- **AWS S3 Storage**: Secure video and file storage in your existing S3 bucket
- **AI-Powered Project Planning**: Intelligent project scope analysis and planning
- **Video Skill Verification**: AWS-powered skill analysis from video demonstrations
- **Professional Showcases**: Portfolio-ready project presentations
- **Progress Tracking**: Milestone management and completion tracking
- **Hybrid Architecture**: AWS-first with Supabase fallback for maximum flexibility

## AWS Integration
This app integrates with your existing AWS infrastructure:
- **S3 Bucket**: `reelcv-website-bucket` (us-west-2)
- **Bedrock AI**: Claude 3 Sonnet for advanced analysis
- **Organized Storage**: Structured file organization in S3
- **Secure Access**: Presigned URLs for secure file access

## Environment Setup
```bash
# Supabase (Required)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# AWS (Optional - for enhanced features)
VITE_AWS_REGION=us-west-2
VITE_AWS_ACCESS_KEY_ID=your_aws_access_key_id
VITE_AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
VITE_S3_BUCKET_NAME=reelcv-website-bucket
```

## Development
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

## AWS Services Used
- **Amazon Bedrock**: AI analysis with Claude 3 Sonnet
- **Amazon S3**: Secure file and video storage
- **IAM**: Secure access management

## File Organization in S3
```
reelcv-website-bucket/
├── reelproject-videos/
│   ├── project-id-1/
│   │   ├── timestamp-skill-name.mp4
│   │   └── timestamp-skill-name-2.mp4
│   └── project-id-2/
└── reelproject-uploads/
    ├── documents/
    └── presentations/
```

## Shared Packages
This app uses shared packages from the [@reelapps organization](https://github.com/NathiDhliso/ReelApps):
- @reelapps/auth - Authentication utilities
- @reelapps/ui - Shared UI components  
- @reelapps/config - Configuration management
- @reelapps/types - TypeScript definitions
- @reelapps/supabase - Database client

## Deployment
This repository is configured for deployment to `reelprojects.reelapp.co.za`

## License
MIT - Part of ReelApps ecosystem