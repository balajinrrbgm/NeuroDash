# NeuroDash

Front-end in minutes. Back-end designed for scale.
An AI-powered B2B Customer Intelligence platform built for the **H0: Hack the Zero Stack with Vercel v0 and AWS Databases** hackathon.

## Tech Stack
- **Frontend**: Next.js (App Router), Tailwind CSS, Recharts (Vercel)
- **Database**: Amazon Aurora PostgreSQL Serverless v2 + `pgvector`
- **AI**: OpenAI text-embeddings
- **ORM**: Drizzle ORM

---

## 🏃 Local Development (Phase 2)

We use Docker to spin up a local PostgreSQL instance equipped with the `pgvector` extension.

### 1. Start the Local Database
```bash
docker-compose up -d
```
*This starts a local DB on port 5432 using `pgvector/pgvector:pg16`.*

### 2. Configure Environment Variables
Rename `.env.example` to `.env.local` and add your OpenAI API key:
```bash
cp .env.example .env.local
```

### 3. Push the Database Schema
Using Drizzle ORM, push the schema to your local database:
```bash
npx drizzle-kit push
```

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to see your local instance.

---

## ☁️ AWS Deployment ("Zero Stack")

To deploy the production-ready Amazon Aurora PostgreSQL database effortlessly, use the provided AWS CloudFormation template.

### 1. Deploy the CloudFormation Stack
1. Log in to your AWS Console and navigate to **CloudFormation**.
2. Click **Create stack** -> **With new resources (standard)**.
3. Select **Upload a template file** and choose `aws/aurora-serverless-v2.yml`.
4. Fill in the **Stack name** (e.g., `neurodash-db`) and provide a secure **MasterUserPassword**.
5. Click **Next** through the options and **Submit**.

### 2. Retrieve Connection String
Once the stack reaches the `CREATE_COMPLETE` status, go to the **Outputs** tab.
Copy the `ConnectionString` value.

### 3. Deploy to Vercel
1. Push your code to a GitHub repository.
2. Import the project into **Vercel**.
3. In the Environment Variables section on Vercel, add:
   - `DATABASE_URL`: (Paste the connection string from AWS CloudFormation)
   - `OPENAI_API_KEY`: (Your OpenAI API key)
4. Click **Deploy**!

You now have a globally distributed Vercel frontend seamlessly connected to an auto-scaling Amazon Aurora backend!
