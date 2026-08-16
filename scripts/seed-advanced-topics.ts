import * as dotenv from 'dotenv';
import * as path from 'path';
import mongoose from 'mongoose';
import { Group } from '../models/group';
import { Topic } from '../models/topic';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const ADVANCED_TRACKS = [
  {
    name: 'System Design & High Availability',
    slug: 'system-design',
    description: 'Scalability, Load Balancing, Caching Strategies, Database Sharding, and Microservices Patterns.',
    order: 1,
    topics: [
      {
        title: 'Microservices vs Monoliths & API Gateways',
        body: `# Microservices Architecture & API Gateways

## Overview
Monolithic applications bundle all business logic, data access, and UI rendering into a single codebase. As systems scale, microservices decouple services along bounded contexts.

## Key Architectural Trade-offs

| Feature | Monolith | Microservices |
| :--- | :--- | :--- |
| **Deployment** | Single artifact (JAR/Docker) | Independent deployments per service |
| **Scaling** | Scale whole app vertically/horizontally | Granular horizontal scaling per service |
| **Data Access** | Shared database | Database per service (Isolated) |
| **Complexity** | Low initial operational complexity | High network, RPC, & orchestration complexity |

## API Gateway Responsibilities
An **API Gateway** serves as the single reverse-proxy entry point for clients:

1. **Authentication & Authorization**: Validates JWT/OAuth tokens before forwarding requests downstream.
2. **Rate Limiting & Throttling**: Prevents DDoS and resource starvation using Token Bucket / Leaky Bucket algorithms.
3. **Request Routing & Load Balancing**: Routes requests to specific microservice clusters (e.g. \`/api/v1/payments\` → Payment Service).
4. **Protocol Translation**: Converts HTTP/REST or GraphQL requests into gRPC / Protobuf for internal RPCs.

\`\`\`mermaid
graph TD
    Client[Web / Mobile Client] --> Gateway[API Gateway / Reverse Proxy]
    Gateway --> Auth[Auth Service]
    Gateway --> User[User Service]
    Gateway --> Order[Order Service]
    Order --> Kafka[(Kafka Message Queue)]
    Order --> DB[(Order DB)]
\`\`\`

## Best Practices
- **Resilience**: Implement Circuit Breakers (e.g. Resilience4j or Envoy) to fail fast when downstream services degrade.
- **Service Discovery**: Use dynamic registries (Consul, Eureka, or K8s DNS) instead of hardcoding IP addresses.
`,
      },
      {
        title: 'Distributed Caching: Redis & Cache Invalidation',
        body: `# Distributed Caching: Redis & Cache Invalidation Strategies

## Why Distributed Caching?
Caching reduces database read load, decreases API latency from ~100ms to <2ms, and improves throughput.

## Cache Invalidation Patterns

### 1. Cache-Aside (Lazy Loading)
- App reads from cache first.
- If **cache hit**: Return data immediately.
- If **cache miss**: Query database, populate cache with TTL, return response.

\`\`\`typescript
async function getUserProfile(userId: string) {
  const cached = await redis.get(\`user:\${userId}\`);
  if (cached) return JSON.parse(cached);

  const user = await db.user.findUnique({ where: { id: userId } });
  if (user) {
    await redis.setex(\`user:\${userId}\`, 3600, JSON.stringify(user));
  }
  return user;
}
\`\`\`

### 2. Write-Through & Write-Behind
- **Write-Through**: Application writes to cache, cache synchronously writes to DB before returning.
- **Write-Behind (Write-Back)**: Application writes to cache, cache asynchronously flushes batch writes to DB.

## Handling Cache Stampede (Thundering Herd)
When a hot cache key expires, thousands of concurrent requests query the DB simultaneously.
- **Fix**: Use distributed locking (Redis Redlock / Mutex) or probabilistic early expiration (XFetch).
`,
      },
    ],
  },
  {
    name: 'DevOps, Docker & Kubernetes',
    slug: 'devops-k8s',
    description: 'Containerization, CI/CD Pipelines, Kubernetes Pods/Deployments, Infrastructure as Code.',
    order: 2,
    topics: [
      {
        title: 'Containerization Fundamentals & Docker Multi-Stage Builds',
        body: `# Docker Containerization & Multi-Stage Builds

Containers package code and system dependencies into portable immutable artifacts.

## Multi-Stage Build Strategy
Multi-stage builds keep production container images lean by stripping out build-time tools (Node.js SDK, C++ compilers, Go tools).

\`\`\`dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
RUN npm ci --only=production

EXPOSE 3000
CMD ["npm", "start"]
\`\`\`

## Key Benefits
- **Reduced Attack Surface**: Omits shell compilers and dev dependencies.
- **Tiny Image Size**: Drops image size from 1.2GB down to ~120MB.
- **Layer Caching**: Optimizes CI pipeline build speeds.
`,
      },
      {
        title: 'Kubernetes Architecture: Pods, Deployments & Services',
        body: `# Kubernetes Architecture & Resource Abstractions

Kubernetes (K8s) automates deployment, scaling, and operations of application containers across clusters.

## Core K8s Building Blocks

- **Pod**: Smallest deployable unit containing one or more co-located containers.
- **Deployment**: Declarative spec defining replica count, rolling update strategy, and container spec.
- **Service**: Stable network endpoint (ClusterIP, NodePort, LoadBalancer) that proxies traffic to matching Pod labels.
- **ConfigMap / Secret**: Injects environment configurations and credentials into containers without rebuilding images.

\`\`\`yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
      - name: api
        image: myregistry/api:v1.2.0
        ports:
        - containerPort: 3000
        resources:
          limits:
            cpu: "500m"
            memory: "512Mi"
          requests:
            cpu: "250m"
            memory: "256Mi"
\`\`\`
`,
      },
    ],
  },
  {
    name: 'Generative AI & LLM Engineering',
    slug: 'genai-llm',
    description: 'RAG (Retrieval-Augmented Generation), Vector Embeddings, Prompt Engineering, and Model Evaluation.',
    order: 3,
    topics: [
      {
        title: 'RAG Architecture: Vector DBs & Chunking Strategies',
        body: `# Retrieval-Augmented Generation (RAG) Architecture

RAG dynamically injects domain knowledge into Large Language Model (LLM) prompts without fine-tuning weights.

## 4-Step RAG Pipeline

1. **Document Ingestion & Chunking**: Break large text/PDFs into overlapping chunks (e.g. 512 tokens with 50-token overlap).
2. **Embedding Generation**: Convert text chunks into dense vector embeddings using models like OpenAI \`text-embedding-3-small\` or HuggingFace BGE.
3. **Vector Storage**: Index embeddings into vector databases (Pinecone, Qdrant, Milvus, or pgvector).
4. **Contextual Generation**: Query vector DB using cosine similarity / HNSW, attach retrieved chunks into system prompt, and invoke LLM.

\`\`\`python
# Example: RAG Context Assembly
def generate_rag_response(user_query: str) -> str:
    # Step 1: Embed query
    query_vector = embed_model.get_embedding(user_query)
    
    # Step 2: Vector Search
    top_chunks = vector_db.similarity_search(query_vector, k=3)
    context_str = "\n---\n".join([doc.page_content for doc in top_chunks])
    
    # Step 3: Prompt Construction
    prompt = f"""Use the following context to answer the question:
Context:
{context_str}

Question: {user_query}
Answer:"""

    return llm.generate(prompt)
\`\`\`
`,
      },
    ],
  },
];

async function seedAdvanced() {
  if (!process.env.MONGODB_URI) {
    console.error('Error: MONGODB_URI is missing from .env.local');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.MONGODB_DB || 'placementdeck',
  });
  console.log('Connected to MongoDB.');

  for (const track of ADVANCED_TRACKS) {
    console.log(`\nProcessing track: ${track.name} (${track.slug})...`);

    // Upsert Group with kind='advanced'
    const groupDoc = await Group.findOneAndUpdate(
      { slug: track.slug, kind: 'advanced' },
      {
        kind: 'advanced',
        name: track.name,
        slug: track.slug,
        description: track.description,
        order: track.order,
      },
      { upsert: true, new: true }
    );

    console.log(`✅ Track created/updated: ${groupDoc.name} (ID: ${groupDoc._id})`);

    // Upsert Topic Notes under this group
    for (const t of track.topics) {
      await Topic.findOneAndUpdate(
        { groupId: groupDoc._id, title: t.title },
        {
          groupId: groupDoc._id,
          title: t.title,
          body: t.body,
          tags: [track.slug, 'advanced'],
        },
        { upsert: true, new: true }
      );
      console.log(`   └─ Note added: "${t.title}"`);
    }
  }

  console.log('\n🎉 Advanced Topics seeding complete!');
  process.exit(0);
}

seedAdvanced().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
