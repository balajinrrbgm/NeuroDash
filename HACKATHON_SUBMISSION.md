# NeuroDash — Hackathon Submission
**H0: Hack the Zero Stack · AWS + Vercel · 2026**

> **Live App:** https://neuro-dash.vercel.app  
> **GitHub:** https://github.com/balajinrrbgm/NeuroDash  
> **Database:** Amazon Aurora PostgreSQL 15.17 Serverless v2 · eu-central-1  

---

## Inspiration

Customer success teams at B2B companies receive thousands of support tickets, app-store reviews, and survey responses every single day — yet the *why* behind churn and product friction stays buried in plain text. Traditional databases search by keyword: if a customer writes "the payment page is confusing," a keyword search for "checkout" finds nothing.

We watched support agents spend hours manually tagging tickets, product managers miss emerging bug patterns hidden across thousands of free-text responses, and customer success teams only discover unhappy accounts after they have already left.

We asked: *what if you could ask your entire feedback history anything, in plain English, and get instant semantic results?* That question — and the conviction that Aurora PostgreSQL with pgvector could answer it without a dedicated vector database — became NeuroDash.

---

## What it does

NeuroDash is an AI-powered B2B customer intelligence platform that turns unstructured feedback into instant, searchable insight:

- **Semantic ingestion** — POST any feedback text to `/api/ingest`; each item is embedded as a 1536-dimensional vector by AWS Bedrock Titan Text Embeddings v1 and stored in Amazon Aurora PostgreSQL with the pgvector extension.
- **Natural language search** — POST a plain-English query to `/api/search`; results are ranked by cosine similarity using pgvector's `<=>` operator — no keyword match needed. Ask *"checkout confusion"* and surface every ticket about payment friction, even if the word "checkout" never appears.
- **Live dashboard** — Next.js 16 frontend on Vercel visualises ingestion velocity and displays the most semantically relevant feedback items with similarity scores in real time.
- **Universal REST API** — any CRM, helpdesk, or survey platform (Zendesk, Intercom, Typeform) can push feedback via a single HTTP POST; embeddings are generated server-side, invisible to the caller.

---

## How we built it

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 App Router, Tailwind CSS v4, Recharts |
| Hosting | Vercel Edge Network + Serverless Functions |
| Embeddings | AWS Bedrock `amazon.titan-embed-text-v1` (1536 dims) |
| Database | Amazon Aurora PostgreSQL 15.17 Serverless v2 (0.5–16 ACU) |
| Vector search | pgvector `<=>` cosine similarity operator |
| ORM | Drizzle ORM with custom `vector(1536)` column type |
| Infrastructure | AWS CloudFormation (VPC, subnets, Aurora cluster, IAM) |
| Auth | IAM user with least-privilege `bedrock:InvokeModel` policy |

**Data flow:**

1. User submits a natural language query from the dashboard.
2. Vercel Function calls AWS Bedrock to embed the query → 1536-dimensional float array.
3. `ORDER BY embedding <=> $queryVector` returns the closest feedback items by cosine distance inside Aurora PostgreSQL.
4. Results stream back to the dashboard with similarity scores — no separate vector database, no extra infrastructure.

---

## Challenges we ran into

- **Aurora engine version** — PostgreSQL `15.4` was unavailable in `eu-central-1`; used `describe-db-engine-versions` to discover the latest available version (`15.17`) and updated the CloudFormation template.
- **VPC routing gap** — the provisioned VPC had no public route table, making Aurora unreachable from Vercel; fixed by adding `PublicRouteTable`, `PublicRoute`, and subnet route table associations to the IaC template.
- **Native binaries on Vercel** — our first embedding approach used `fastembed` + `onnxruntime-node` (native C++ ONNX runtime); this caused silent 404 responses on Vercel's build platform; switching to AWS Bedrock (pure JavaScript SDK) resolved it completely.
- **SSO token expiry** — AWS SSO credentials expire every ~1–2 hours during development; created a dedicated IAM user `neurodash-vercel` with a permanent, least-privilege Bedrock InvokeModel policy to unblock production deployment.
- **Custom Drizzle vector type** — Drizzle ORM has no built-in pgvector support; implemented a custom column type with `::vector` cast for both read and write paths.

---

## Accomplishments that we're proud of

- **Zero dedicated vector DB** — full semantic search inside Amazon Aurora PostgreSQL using pgvector; no Pinecone, Weaviate, or Qdrant; no additional service cost or operational overhead.
- **Full infrastructure as code** — a single CloudFormation YAML provisions the entire Aurora stack: VPC, two-AZ subnets, internet gateway, route tables, security groups, parameter groups, and the Serverless v2 cluster.
- **1536-dimensional production embeddings** — Bedrock Titan embeddings used in production, the same model family AWS uses internally in Comprehend and Kendra.
- **Least-privilege IAM posture** — dedicated IAM user scoped to exactly `bedrock:InvokeModel` on the specific Titan model ARN; no wildcard permissions anywhere in the stack.
- **End-to-end in one session** — from empty repo to seeded Aurora database with 20 real Bedrock embeddings, semantic search, and live Vercel deployment in a single continuous hackathon session.

---

## What we learned

- **pgvector is production-ready for most B2B workloads** — cosine similarity search on 1536-dim vectors in Aurora is fast, reliable, and eliminates an entire infrastructure tier; the "Zero Stack" is genuinely viable.
- **AWS Bedrock is the right embedding provider for AWS-native stacks** — IAM-based auth means no separate API keys, no rotation policy, and the same credential chain as the rest of the AWS stack.
- **Write CloudFormation first, click the console second** — hand-writing the IaC template surfaced two critical networking gaps (missing route table, `PubliclyAccessible` on the wrong resource type) that would have been invisible through the console.
- **Audit every npm package for native binaries before deploying to Vercel** — `onnxruntime-node` and similar packages are common silent-failure culprits; always check for `.node` files before committing a new dependency.

---

## What's next for NeuroDash

- **v1.1 — Live integrations** — native webhooks for Zendesk, Intercom, Salesforce, and Typeform; no code required to stream feedback into Aurora.
- **v1.2 — AI summarisation** — weekly digest emails generated by Bedrock Claude, summarising trending topics and emerging product issues directly from Aurora query results.
- **v2.0 — Churn prediction** — supervised classifier trained on embeddings from historically churned accounts; proactive alerts before customers escalate.
- **Multi-tenant SaaS** — row-level security in Aurora per workspace; each customer's feedback stays isolated by design.
- **Aurora Global Database** — global read replicas for sub-millisecond dashboard loads across regions, supporting enterprise customers with data residency requirements.

**Monetisation:** `$99/mo` (up to 10k feedback items) · `$499/mo` (up to 100k) · Enterprise (custom ACU + VPC peering)

---

## Built with

Next.js, Vercel, Amazon Aurora PostgreSQL, AWS Bedrock, pgvector, Drizzle ORM, Tailwind CSS, TypeScript, Recharts, AWS CloudFormation
