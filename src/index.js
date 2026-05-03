/**
 * Summit Send Labs — Voice & SMS AI Assistant
 * Entry point: HTTP server with Telnyx webhook handlers.
 *
 * This is a sanitized reference version of the production entry point.
 * The actual service module that handles inbound messages
 * (LLM calls, prompt construction, persistence) is referenced but
 * not included in this public repo. See README.md for what's excluded
 * and SECURITY.md for the full rationale.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');

// In production, this module handles LLM dispatch, conversation state,
// Supabase logging, and cost tracking. See SECURITY.md for why the
// implementation is not in this public repo.
const { handleInboundSMS } = require('./services/telnyx');

const app = express();

// Railway sets PORT automatically; fall back to 3000 for local dev.
const PORT = process.env.PORT || 3000;

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

app.use(cors());

// Cap inbound payload size — Telnyx webhooks are small (a few KB at most).
// Rejecting oversized requests early protects the LLM dispatch path from
// being abused by accidentally or deliberately large payloads.
app.use(express.json({ limit: '64kb' }));

// ---------------------------------------------------------------------------
// Health and root
// ---------------------------------------------------------------------------

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({ service: 'Summit Send Labs SMS', status: 'running' });
});

// ---------------------------------------------------------------------------
// Telnyx SMS webhook
// ---------------------------------------------------------------------------
//
// Pattern: acknowledge the webhook synchronously (Telnyx retries if it
// doesn't get a 200 quickly), then process asynchronously. This keeps
// the webhook responsive even when LLM latency spikes.
//
// SECURITY NOTE: In production, every inbound webhook is verified against
// the Telnyx signing secret before any downstream work happens. Without
// signature verification, anyone who discovers the webhook URL can POST
// to it and trigger LLM calls (which cost money). The verification
// middleware lives in the private codebase. See SECURITY.md.

app.post('/webhooks/telnyx-sms', async (req, res) => {
  try {
    // verifyTelnyxSignature(req)  ← runs here in production

    res.status(200).json({ message: 'OK' });

    // Fire-and-forget the actual processing. Errors inside handleInboundSMS
    // are caught and logged inside the service module; we don't await
    // because Telnyx has already received its 200.
    handleInboundSMS(req.body).catch((err) => {
      console.error('handleInboundSMS failed:', err);
    });
  } catch (error) {
    console.error('Error handling SMS webhook:', error);
    // We've already sent a 200 above in the happy path; this catches
    // synchronous failures before that point.
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// ---------------------------------------------------------------------------
// Error handling
// ---------------------------------------------------------------------------

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  if (!res.headersSent) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Summit Send Labs SMS Service running on port ${PORT}`);
  console.log('Webhook URL: /webhooks/telnyx-sms');
});
