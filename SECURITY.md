# Security and Scope of This Repo

This repo is a **deliberately curated subset** of the live Summit Send Labs voice/SMS platform. The omissions documented below are intentional, and the rationale for each is explicit. Reviewing what's *not* here is part of evaluating my judgment about handling sensitive material — if you're a hiring team, this section is meant to be read carefully.

## Categories of exclusion

### 1. Credentials and secrets

**Excluded:**
- All API keys, tokens, and connection strings (Telnyx, OpenAI, Supabase, anything else)
- Webhook signing secrets used to verify inbound Telnyx requests
- Service-role keys for any backend service
- Any `.env` file with real values

**How it's handled:** All sensitive configuration lives in environment variables, sourced from Railway's secrets management in production. The repo includes only `.env.example` with placeholder values and clear documentation of what each variable does.

**Why:** Self-evident. The non-obvious part is that even in a private repo, secrets shouldn't live in version control — once committed, they live forever in git history. The convention of environment-variable-only secrets is followed in both the public and private versions of this codebase.

### 2. Production prompt content

**Excluded:**
- The actual system prompt used in production
- The full SSL business context, services, and escalation rules embedded in the prompt
- Customer-specific prompt overrides

**How it's handled:** The repo includes a generic example prompt in `examples/system-prompt.example.txt` that demonstrates structure (role, scope, tone, fallback behavior) without revealing the real content. The LLM integration code shows how the prompt is injected, not what it contains.

**Why:** The production prompt is SSL's primary IP at this stage. Prompt strategy — how context is structured, how the assistant is bounded, how it handles edge cases — is the differentiator between a generic LLM wrapper and a useful product. Sharing it publicly would be giving away the actual product. Sharing it under NDA with a hiring team is a different conversation, and I'm happy to do that.

### 3. Customer-specific deployments

**Excluded:**
- All configuration, prompts, and integration code for the in-progress small-business customer engagement (a local bike shop)
- Customer phone numbers, customer business data, customer-specific conversation logs
- The deployment playbook and templates that productize SSL's small-business offering

**How it's handled:** Customer deployments live in private branches and separate Supabase schemas. Nothing customer-specific is in the public repo.

**Why:** This is the most important exclusion category. A platform vendor that exposes customer data — even unintentionally, even as code references — has a credibility problem with every future customer. The discipline of strict customer-data isolation matters more than the convenience of having everything in one repo.

### 4. Adjacent SSL systems

**Excluded:**
- Text THAT Friend (TTF), the consumer chatbot product, which runs on a separate codebase that shares some infrastructure with the SSL voice/SMS assistant
- The Cloudflare Pages frontend code for summitsendlabs.com
- The n8n workflows that handle daily monitoring, operational reporting, and VIP video drops for TTF
- The Stripe integration for SSL pricing tiers and TTF billing

**How it's handled:** Each lives in its own private repo. This repo is scoped narrowly to the voice/SMS reference platform.

**Why:** Scoping the public artifact narrowly makes it more useful, not less. A reviewer can read the README and the architecture diagram and understand the system in fifteen minutes. A repo with everything would take an hour to navigate and signal less judgment about what to share.

### 5. Operational details

**Excluded:**
- Internal cost thresholds, alerting rules, and on-call procedures
- Specific dollar figures for cost per conversation or unit economics
- Internal pricing logic for the SSL service tiers
- Vendor contracts, billing arrangements, or platform spend

**How it's handled:** Operational instrumentation is described at a structural level in the README ("conversations are logged, costs are tracked") without specific numbers or thresholds.

**Why:** Cost data and operational patterns are commercially sensitive. They reveal margin structure and operational scale, both of which are competitive information.

## What you can ask for under NDA

If you're a hiring team or potential collaborator and any of the excluded material is relevant to a specific conversation, I'm happy to share more under appropriate confidentiality. Common requests I can accommodate:

- Private-repo access for the full production codebase
- Walk-through of the actual production prompt strategy
- Real cost-per-conversation data and unit economics
- The customer deployment playbook and templates
- The TTF or n8n adjacent codebases

Reach me via the contact details on summitsendlabs.com.

## Why I'm writing this section

Most candidates publish a public repo and either include too much (real secrets, customer references, sensitive business logic) or too little (a stripped-down skeleton with no real signal). Neither demonstrates the judgment that matters for working in regulated AI environments.

The framing I'm using here — explicit, categorized exclusions with rationale — is borrowed from how I think about platform delivery in regulated enterprise environments. Controls aren't an afterthought to the rollout; they're a constraint the architecture has to respect from day one. Same principle applies to a public code artifact: what you choose not to share, and why, is part of the artifact.

---

*Travis Opheim, founder, Summit Send Labs LLC.*
