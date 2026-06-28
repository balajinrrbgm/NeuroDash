# NeuroDash

Front-end in minutes. Back-end designed for scale.
An AI-powered B2B Customer Intelligence platform built for the **H0: Hack the Zero Stack with Vercel v0 and AWS Databases** hackathon.

## Tech Stack
- **Frontend**: Next.js 16 (App Router), Tailwind CSS, Recharts
- **Database**: Amazon Aurora PostgreSQL 15.17 Serverless v2 + `pgvector` (`eu-central-1`)
- **AI / Embeddings**: Amazon Bedrock — `amazon.titan-embed-text-v1` (1536 dims)
- **ORM**: Drizzle ORM

---

## 🏃 Local Development

### Prerequisites
- Docker Desktop (or Docker in WSL2)
- Node.js 18+
- AWS credentials with Bedrock + Aurora access

### 1. Start the Local Database
```bash
# From WSL or Linux terminal
docker compose up -d
```

### 2. Configure Environment Variables
```bash
cp .env.example .env.local
```
Edit `.env.local`:
```env
DATABASE_URL="postgres://postgres:password@localhost:5432/neurodash"

# AWS Bedrock credentials — use IAM user keys (not SSO temporary keys)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=eu-central-1
AWS_BEDROCK_REGION=eu-central-1
```

### 3. Enable pgvector + Push Schema
```bash
node setup-db.js       # enables pgvector extension
npx drizzle-kit push   # creates tables
```

### 4. Seed Sample Data
```bash
node seed.js           # ingests 20 feedback items via Bedrock embeddings
```

### 5. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

---

## ☁️ AWS Deployment

### Step 1 — Deploy Aurora PostgreSQL (CloudFormation)
```bash
aws cloudformation deploy \
  --template-file aws/aurora-serverless-v2.yml \
  --stack-name neurodash-aurora \
  --parameter-overrides \
      DBName=neurodash \
      MasterUsername=postgres \
      MasterUserPassword=YourSecurePassword \
  --region eu-central-1 \
  --capabilities CAPABILITY_IAM
```
Copy the `ConnectionString` from the stack Outputs.

### Step 2 — Enable Bedrock Model Access
1. Open the [Bedrock console in eu-central-1](https://eu-central-1.console.aws.amazon.com/bedrock/home?region=eu-central-1#/modelaccess)
2. Enable **Amazon Titan Text Embeddings V1**
3. Save changes

### Step 3 — Deploy Next.js to AWS Amplify

#### Create an IAM role for Amplify (Bedrock access, no static keys needed)
```bash
# Create Bedrock access policy
aws iam create-policy \
  --policy-name NeuroDashBedrockPolicy \
  --policy-document '{
    "Version":"2012-10-17",
    "Statement":[{
      "Effect":"Allow",
      "Action":["bedrock:InvokeModel"],
      "Resource":"arn:aws:bedrock:eu-central-1::foundation-model/amazon.titan-embed-text-v1"
    }]
  }'

# Create Amplify service role
aws iam create-role \
  --role-name NeuroDashAmplifyRole \
  --assume-role-policy-document '{
    "Version":"2012-10-17",
    "Statement":[{
      "Effect":"Allow",
      "Principal":{"Service":"amplify.amazonaws.com"},
      "Action":"sts:AssumeRole"
    }]
  }'

# Attach policies
aws iam attach-role-policy \
  --role-name NeuroDashAmplifyRole \
  --policy-arn arn:aws:iam::aws:policy/AdministratorAccess-Amplify

aws iam attach-role-policy \
  --role-name NeuroDashAmplifyRole \
  --policy-arn $(aws iam list-policies --query "Policies[?PolicyName=='NeuroDashBedrockPolicy'].Arn" --output text)
```

#### Create and connect the Amplify app
```bash
aws amplify create-app \
  --name neurodash \
  --repository https://github.com/balajinrrbgm/NeuroDash \
  --platform WEB_COMPUTE \
  --region eu-central-1 \
  --iam-service-role-arn $(aws iam get-role --role-name NeuroDashAmplifyRole --query Role.Arn --output text)

# Add environment variables
APP_ID=$(aws amplify list-apps --region eu-central-1 --query "apps[?name=='neurodash'].appId" --output text)

aws amplify update-app \
  --app-id $APP_ID \
  --region eu-central-1 \
  --environment-variables \
      DATABASE_URL="<your-aurora-connection-string>",\
      AWS_BEDROCK_REGION="eu-central-1"

# Create main branch and trigger first deploy
aws amplify create-branch --app-id $APP_ID --branch-name main --region eu-central-1
aws amplify start-job --app-id $APP_ID --branch-name main --job-type RELEASE --region eu-central-1
```

---

## 🔺 Vercel Deployment

### Step 1 — Create a dedicated IAM user for Bedrock access
```bash
aws iam create-user --user-name neurodash-vercel

aws iam put-user-policy \
  --user-name neurodash-vercel \
  --policy-name BedrockInvoke \
  --policy-document '{
    "Version":"2012-10-17",
    "Statement":[{
      "Effect":"Allow",
      "Action":["bedrock:InvokeModel"],
      "Resource":"arn:aws:bedrock:eu-central-1::foundation-model/amazon.titan-embed-text-v1"
    }]
  }'

aws iam create-access-key --user-name neurodash-vercel
# Save the AccessKeyId and SecretAccessKey from the output
```

### Step 2 — Connect to Vercel
1. Push this repo to GitHub (if not done): `git push origin main`
2. Go to [vercel.com/new](https://vercel.com/new) and import the GitHub repo
3. Add these **Environment Variables** in the Vercel dashboard:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `postgres://postgres:...@<aurora-endpoint>:5432/neurodash` |
| `AWS_ACCESS_KEY_ID` | IAM user key from Step 1 |
| `AWS_SECRET_ACCESS_KEY` | IAM user secret from Step 1 |
| `AWS_BEDROCK_REGION` | `eu-central-1` |

4. Click **Deploy**

> **Note:** Aurora's security group must allow inbound TCP 5432 from Vercel's IPs (or `0.0.0.0/0` for hackathon use — already configured in the CloudFormation template).

