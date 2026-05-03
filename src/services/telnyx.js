/**
 * services/telnyx.js — Inbound SMS handler (REFERENCE STUB)
 *
 * This is a stubbed version of the production Telnyx service module.
 * The real implementation handles:
 *
 *   1. Webhook signature verification against TELNYX_PUBLIC_KEY
 *   2. Conversation state lookup/creation in Supabase
 *   3. System prompt construction (SSL business context)
 *   4. OpenAI dispatch with conversation history
 *   5. Outbound SMS via Telnyx API
 *   6. Conversation logging and per-message cost tracking
 *   7. STOP/HELP/UNSUBSCRIBE keyword handling for A2P 10DLC compliance
 *
 * The full implementation is in the private codebase. See SECURITY.md
 * for the rationale behind keeping it private.
 *
 * Hiring teams: I'm happy to walk through the real implementation in
 * an interview screen or share private-repo access. Reach out via
 * summitsendlabs.com.
 */

/**
 * Handle an inbound SMS payload from Telnyx.
 *
 * @param {object} payload - The Telnyx webhook payload
 * @param {object} payload.data - Event data
 * @param {string} payload.data.event_type - e.g. 'message.received'
 * @param {object} payload.data.payload - Message details (from, to, text, etc.)
 */
async function handleInboundSMS(payload) {
  // Production flow (redacted):
  //
  //   const event = parseTelnyxEvent(payload);
  //   if (event.type !== 'message.received') return;
  //
  //   if (isOptOutKeyword(event.text)) {
  //     await handleOptOut(event.from);
  //     return;
  //   }
  //
  //   const conversation = await getOrCreateConversation(event.from);
  //   const history = await getRecentMessages(conversation.id);
  //
  //   const response = await callLLM({
  //     systemPrompt: buildSystemPrompt(conversation),
  //     history,
  //     userMessage: event.text,
  //   });
  //
  //   await sendSMS({ to: event.from, text: response.text });
  //
  //   await logMessage({
  //     conversation_id: conversation.id,
  //     direction: 'inbound',
  //     text: event.text,
  //   });
  //   await logMessage({
  //     conversation_id: conversation.id,
  //     direction: 'outbound',
  //     text: response.text,
  //     tokens: response.tokens,
  //     cost_usd: response.cost,
  //   });

  console.log('[stub] handleInboundSMS called — real implementation is in the private repo');
}

module.exports = {
  handleInboundSMS,
};
