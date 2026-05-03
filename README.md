# Summit Send Labs — Voice & SMS AI Assistant (Reference)

A multi-channel AI assistant platform built on Telnyx, OpenAI, Railway, and Supabase. This repo is a curated, reference-only subset of the live system that powers [summitsendlabs.com](https://summitsendlabs.com) — built and maintained by Travis Opheim, founder of Summit Send Labs LLC (Breckenridge, CO).

The phone number on the SSL site reaches this system directly. Both inbound voice calls and SMS messages are handled by the same backend.

---

## What this repo is — and what it isn't

**This repo is** a reference artifact for technical reviewers (hiring teams, prospective collaborators) who want to understand how the system is architected and how I make build-vs-buy decisions on a real production AI deployment.

**This repo is not** a runnable production system. The system prompt, customer-specific configuration, real credentials, and certain handler logic are intentionally redacted or stubbed. See [What's not in this repo](#whats-not-in-this-repo) below.

If you're a hiring team and want a deeper walkthrough — including private-repo access, the actual production prompt strategy, or a screen-share through specific code paths — reach out via the contact details on summitsendlabs.com.

---

## Architecture

```
Inbound caller / texter
        │
        ├──▶ Telnyx voice channel ──┐
        │                           │
        └──▶ Telnyx SMS channel ────┤
                                    │
                                    ▼
                            Railway (Node.js app layer)
                                    │
                                    ▼
                       OpenAI (system prompt + SSL context)
                                    │
                                    ▼
                       Supabase (conversation logs, cost tracking)
```

A more detailed diagram is in [`docs/architecture.svg`](./docs/architecture.svg).

---

## Stack and decisions

**Telnyx (voice + SMS).** Direct call/SMS control at lower per-minute cost than packaged voice-AI providers. Costs more glue code than something like Vapi or Bland, but the tradeoff is right when you want full control over call flow, recording, and the deliverability layer.

**OpenAI (single LLM provider).** Multi-provider routing is a real cost and resilience play at scale, but premature for a single-deployment system. The LLM integration is structured so a router slots in later without rework.

**Prompt-stuffing instead of RAG.** SSL's knowledge base is small and slow-changing — services, hours, common questions, escalation rules. A retrieval pipeline would have been over-engineering for the corpus size and would have introduced retrieval-failure modes without quality gain. Trigger conditions for revisiting are documented inline.

**Railway (hosting).** Faster developer iteration than AWS/GCP for a single-service Node.js app at this scale. Easy to migrate later if cost or scale demands it.

**Supabase (logging + persistence).** Postgres I don't have to operate, with a clean SDK. Conversation logging from day one — you can't decide what to instrument after the fact.

---

## The hard problem: carrier deliverability

The most technically interesting work on this build wasn't the AI integration — it was getting outbound SMS reliably delivered through US carrier filters (specifically Verizon, which has the most aggressive A2P filtering of the major carriers).

Full write-up in [`docs/carrier-deliverability.md`](./docs/carrier-deliverability.md). Short version: A2P 10DLC registration, brand vetting, campaign use-case classification, and throughput tier alignment are their own discipline. Most early-stage builders treat deliverability as something the vendor handles. It isn't. For any AI system where the channel matters as much as the model, the carrier and infrastructure layer is a first-class concern.

---

## What's instrumented and what isn't

**What's in place today:**
- Conversation logs persisted to Supabase (every inbound and outbound message)
- Cost-per-conversation tracking via token counts and Telnyx call duration
- Manual transcript review for prompt iteration
- Basic error logging and Telnyx webhook retry handling

**What's not in place yet (and why):**
- Labeled eval suite — the system hasn't seen enough third-party traffic to build a meaningful labeled set yet. Coming with the next customer deployment.
- Automated quality scoring — same reason; needs traffic first.
- Latency percentiles broken out by channel — instrumented at the request level but not yet aggregated to a dashboard.
- Multi-provider LLM routing — see "Stack and decisions" above; deliberately deferred.

The honest framing: this is a working system, not a battle-tested one. The next deployment phase (a small-business customer engagement) will generate the real third-party traffic needed to instrument against meaningful evaluation work.

---

## Repo structure

```
.
├── README.md                          ← You are here
├── SECURITY.md                        ← What's not in this repo and why
├── .env.example                       ← Required configuration variables
├── .gitignore
├── package.json
├── docs/
│   ├── architecture.svg               ← Detailed system diagram
│   └── carrier-deliverability.md      ← A2P 10DLC mini-case-study
├── src/
│   ├── index.js                       ← HTTP server, webhook routing
│   └── services/
│       └── telnyx.js                  ← Inbound SMS handler (stubbed —
│                                        production logic in private repo)
└── examples/
    └── system-prompt.example.txt      ← Generic example, not the real prompt
```

---

## Setup (reference only)

This repo isn't intended to be cloned and run. If you want to understand the configuration surface:

```bash
# Install dependencies
npm install

# Copy the example env file and fill in your own credentials
cp .env.example .env

# Required environment variables — see .env.example for the full list:
# - TELNYX_API_KEY
# - TELNYX_PHONE_NUMBER
# - OPENAI_API_KEY
# - SUPABASE_URL
# - SUPABASE_SERVICE_KEY
```

You'll also need: a Telnyx account with A2P 10DLC registration completed for SMS, an OpenAI API key with sufficient quota, and a Supabase project. Schema details for the conversation/message tables are not included in this public repo — see [SECURITY.md](./SECURITY.md).

---

## What's not in this repo

The following are intentionally excluded. Each exclusion is deliberate, not an oversight:

**Security-sensitive:**
- All real credentials, API keys, tokens, and connection strings (handled via environment variables)
- Real Supabase URLs, project IDs, or schema details that could be probed
- Telnyx webhook signing secrets

**Business-sensitive:**
- The actual production system prompt content (replaced with a generic example in `examples/system-prompt.example.txt`)
- Any customer-specific configuration (the next customer deployment for a local bike shop is in a separate private branch)
- Internal cost thresholds, pricing logic, and unit economics calculations
- Stripe/billing integration for the SSL pricing tiers

**Out of scope for this artifact:**
- The Text THAT Friend (TTF) consumer chatbot product, which runs on a separate codebase with shared infrastructure
- Internal monitoring, alerting, and on-call setup
- The n8n workflows that handle daily monitoring and operational reporting
- The Cloudflare Pages frontend for summitsendlabs.com

If any of the excluded material is relevant to a specific conversation (e.g., a hiring team wants to see real cost data or the actual prompt strategy), I'm happy to share under appropriate confidentiality. Reach out via summitsendlabs.com.

---

## About Summit Send Labs

Summit Send Labs LLC is a Colorado AI product studio based in Breckenridge. SSL builds production AI infrastructure for small-business deployments and operates two products on this foundation: the SSL voice/SMS assistant (this repo) and Text THAT Friend (TTF), a consumer chatbot.

By day, I'm a PMO Manager at O'Reilly Auto Parts overseeing enterprise platform delivery across Supply Chain (Manhattan TMS), Finance (Oracle ERP), and HR (Workday). SSL is what I build outside that role.

- Website: [summitsendlabs.com](https://summitsendlabs.com)
- LinkedIn: [Travis Opheim](https://linkedin.com/in/YOUR_HANDLE)  <!-- TODO: replace YOUR_HANDLE before publishing -->

---

## License

This repo is published as a reference artifact under the MIT License. Code may be referenced for educational purposes; the SSL platform itself, the production prompt strategy, and the customer deployment playbook are proprietary.
