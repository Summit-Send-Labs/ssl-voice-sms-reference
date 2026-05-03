# Carrier Deliverability: A2P 10DLC and the Verizon Filter

A short write-up of the most technically interesting problem on the SSL voice/SMS build — and the one I most underestimated when I started. Sharing it here because it's the kind of work that's invisible until you hit it, and I think the lessons generalize beyond SSL.

## The problem

The SSL platform sends and receives SMS through a Telnyx number. The voice channel worked end-to-end on day one. The SMS channel did not — outbound messages to my own personal Verizon number either silently dropped or arrived with significant delay. Inbound worked fine. Outbound was the issue, and it was specifically Verizon. T-Mobile and AT&T were less aggressive but still inconsistent.

This is the moment where most early-stage builders assume the problem is in their code or their Telnyx configuration. It usually isn't. The problem is that **the US carrier ecosystem has built an entire compliance and filtering layer around application-to-person (A2P) messaging that operates independently of your provider's API**. If you're not registered correctly in that layer, your messages get filtered before they reach the recipient — and you typically don't get a useful error back.

## What I learned about A2P 10DLC

10DLC ("10-digit long code") is the framework US carriers built to let businesses send legitimate A2P traffic over standard local phone numbers, while filtering spam and unregistered traffic. It has three moving pieces:

**1. Brand registration.** Your business entity (Summit Send Labs LLC, in this case) has to be registered with The Campaign Registry (TCR). This involves submitting EIN, legal business name, address, website, and vertical. The brand goes through "vetting" — a score from 0 to 100 that affects throughput and delivery rates. Higher scores = better deliverability.

**2. Campaign registration.** Each *use case* you want to send messages for has to be registered as a separate campaign. SSL's voice/SMS assistant is registered as a customer-care use case. Other common ones: marketing, account notifications, 2FA, polling. Each campaign declares its message flow, sample messages, and opt-in/opt-out language. Carriers review the campaign and assign it a throughput tier.

**3. Number assignment.** Your phone number is then assigned to the campaign. Carriers route messages from that number through the filtering rules associated with the registered campaign and brand.

Verizon is the most aggressive of the major US carriers about enforcing this. AT&T and T-Mobile filter unregistered or poorly-registered traffic, but Verizon will silently drop messages from a number that doesn't have proper campaign registration even if the messages themselves look fine.

## What I changed

The fix wasn't a code change. It was a registration and configuration sequence:

1. **Completed brand registration** through Telnyx's portal, which proxies to TCR. Provided EIN, legal address, website, and vertical for SSL.
2. **Registered the campaign** explicitly as a customer-service use case, with sample message flows that matched what the SSL assistant actually sends. Included clear opt-in language (the SSL site explains that texting the number reaches an AI assistant) and STOP/HELP handling.
3. **Verified opt-out compliance.** Implemented STOP/UNSUBSCRIBE handling at the application layer so that inbound STOP messages are honored immediately and logged. This is required by the registered campaign.
4. **Assigned the SSL number to the campaign** explicitly in Telnyx.
5. **Waited for vetting to complete.** This is the part most builders miss — campaign registration isn't instant. The vetting process can take days, and during that window deliverability is unpredictable.
6. **Tested across all three major carriers** systematically once registration was active, not just my own number.

After registration completed, Verizon delivery normalized and SMS deliverability across the major US carriers became reliable.

## What I would do differently

A few things I'd do earlier next time:

- **Start brand and campaign registration on day one of any SMS project**, even if the application code isn't ready. The vetting clock is the long pole; everything else can be built in parallel.
- **Don't test SMS deliverability against your own number alone.** Carriers behave differently. Verizon being the strictest means you'll catch most issues by testing there first, but a real test plan needs all three.
- **Treat the registered campaign description as a contract.** If your real message flow drifts from what you registered, deliverability degrades silently. Update the registration as the use case evolves.
- **Log delivery status from the carrier, not just from Telnyx.** Telnyx will tell you the message was accepted by the carrier; the carrier delivery receipt (DLR) tells you whether it was actually delivered to the handset. Different signal, important.

## Why this matters for AI systems specifically

This is the lesson that generalized for me, and the one I think is most relevant to enterprise AI deployment broadly:

For any AI system where the **channel** matters as much as the **model**, the channel infrastructure layer is a first-class concern, not an afterthought. The model can be perfect and the system can still fail because the message never arrived, the call never connected, or the response was filtered. At enterprise scale, the equivalent layers are things like: identity and access controls determining what data the model can see, network policies determining what the model can call out to, and compliance frameworks determining what outputs are allowed in production.

The SSL deliverability problem was a small-scale version of the same pattern Kamiwaza customers face with regulated AI deployment: the model is the easy part. Getting it to operate correctly inside the constraints of the environment is the hard part.

---

*Travis Opheim, founder, Summit Send Labs LLC. Reach me through summitsendlabs.com.*
