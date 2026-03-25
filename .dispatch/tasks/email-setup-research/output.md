# Email Setup Research: hello@healingheartscourse.com

**Date:** 2026-03-23
**Domain:** healingheartscourse.com
**DNS:** Cloudflare
**Hosting:** Vercel (static)
**Existing accounts:** chasejamison@, trishajamison@, makaylahildreth@, admin@healingheartscourse.com (Google Workspace)

---

## Summary / Recommendation

**Use Google Workspace Groups — it is already paid for and takes about 10 minutes to set up.**

The team already has Google Workspace accounts on healingheartscourse.com. Google Workspace includes Groups at no additional cost. Creating a `hello@` Group gives a shared inbox that all five team members can access and reply from, with the From address showing as `hello@healingheartscourse.com`. No new DNS records are needed; the existing Workspace MX records are already in Cloudflare.

---

## Option 1: Google Workspace Group Alias (RECOMMENDED)

### What it is
Create a Google Group (`hello@healingheartscourse.com`) inside the existing Google Workspace admin console. All email sent to `hello@` is delivered to every member of the group. Any member can reply as `hello@` from their own Gmail inbox.

### Cost
**$0 extra.** Included in the existing Google Workspace subscription. (Business Starter is ~$7/user/month — the team already pays this. Groups are free on top of it.)

### Does it support sending AS hello@?
**Yes.** Full bidirectional support. Recipients see `hello@healingheartscourse.com` in the From field. No "via gmail.com" annotation. This is the cleanest send-as behavior of all options listed here.

### MX record changes needed
**None.** The Google Workspace MX records (`aspmx.l.google.com`, etc.) are already configured in Cloudflare from when the Workspace accounts were set up. The Group lives inside the same mail infrastructure.

### Setup steps
1. Go to [admin.google.com](https://admin.google.com) and sign in as admin@healingheartscourse.com.
2. Navigate to **Directory → Groups → Create group**.
3. Set:
   - Group name: `Hello` (or "Contact" or similar)
   - Group email: `hello@healingheartscourse.com`
   - Description: General contact / hello inbox
4. Click **Next**, set access type to **Announcement only** or **Team** depending on whether only admins or all members should post. For a contact inbox, "Team" is correct.
5. Click **Create group**, then add members: chasejamison@, trishajamison@, makaylahildreth@, and any others who should see contact emails.
6. **Optional — let members reply as hello@:** Each member opens Gmail → Settings → See all settings → Accounts and Import → Send mail as → Add another email address. Enter `hello@healingheartscourse.com`. Google will verify ownership automatically since the Group is in the same Workspace domain — no SMTP password needed.

### Time to set up
**10–15 minutes** (including member invites). Active immediately.

### Caveats
- The Group inbox is not a traditional inbox. Members receive forwarded copies in their own Gmail. There is no shared "we all see the same inbox" view unless you use Google's Collaborative Inbox feature (enable it in the Group settings under "Advanced → Who can manage members → Collaborative Inbox"). For a 5-person team this is usually fine.
- If a true shared inbox with assignment/tracking is needed later, the Group can feed into Hiver or Helpscout.

---

## Option 2: Cloudflare Email Routing (Free forwarding + Gmail send-as workaround)

### What it is
Cloudflare's free Email Routing service receives email at `hello@healingheartscourse.com` and forwards it to one or more existing Gmail addresses. Sending from the custom address requires a Gmail App Password workaround.

### Cost
**$0** for receiving. Sending requires using Gmail's SMTP relay (free, but relies on an undocumented Gmail feature that could be restricted in the future).

### Does it support sending AS hello@?
**Partially.** Receiving is clean. Sending requires each person to configure their own Gmail with an App Password. Gmail adds a subtle "Sent by: gmail.com on behalf of hello@healingheartscourse.com" annotation visible in some email clients (though not in the From field itself). Google Workspace users with 2FA can use this, but it is more fragile than the Group approach.

### MX record changes needed
**Yes — this would conflict with existing Google Workspace MX records.** A domain can only have one set of MX records. If the team already has Google Workspace MX records active, switching to Cloudflare Email Routing would break all existing @healingheartscourse.com email delivery. This makes Option 2 **incompatible** with the current setup unless Workspace is removed first.

### Setup steps (for reference only — not recommended given the conflict)
1. Cloudflare dashboard → your domain → Email → Email Routing → Enable.
2. Cloudflare auto-creates and manages MX records (this would overwrite Workspace MX records — do NOT do this).
3. Add a routing rule: `hello@healingheartscourse.com` → forward to target Gmail address.
4. For send-as: Gmail → Settings → Accounts and Import → Send mail as → Add another email address → SMTP: smtp.gmail.com, port 587, Gmail address + App Password.
5. Add SPF TXT record in Cloudflare: `v=spf1 include:_spf.google.com ~all`

### Time to set up
**20–30 minutes** per person who needs send-as configured. DNS propagation: near-instant on Cloudflare.

### Verdict
**Not recommended.** The MX record conflict with existing Google Workspace is a hard blocker. Even if resolved, the send-as experience is inferior to the native Group approach.

---

## Option 3: Zoho Mail (Free tier)

### What it is
A standalone email hosting service with a free tier supporting up to 5 custom domain users. Would require pointing the domain's MX records to Zoho.

### Cost
**$0** for up to 5 users. Zoho Mail free tier includes web + mobile access.

### Does it support sending AS hello@?
**Yes, natively** — Zoho hosts the mailbox directly, so send and receive both work cleanly.

### MX record changes needed
**Yes — same conflict as Option 2.** Switching MX records to Zoho would break all existing Google Workspace email for chasejamison@, trishajamison@, makaylahildreth@, and admin@. This is not viable as a standalone addition.

### Setup steps (for reference only)
1. Sign up at zoho.com/mail → Add domain → Verify via TXT record in Cloudflare.
2. Replace Cloudflare MX records with Zoho's:
   - `mx.zoho.com` (priority 10)
   - `mx2.zoho.com` (priority 20)
   - `mx3.zoho.com` (priority 50)
3. Add SPF/DKIM/DMARC records in Cloudflare.
4. Create `hello@` mailbox in Zoho admin panel.

### Time to set up
**45–60 minutes** setup + up to 48 hours SPF/DKIM propagation.

### Verdict
**Not recommended.** Requires migrating all domain email away from Google Workspace. The team's existing Workspace accounts would stop receiving mail. Significant disruption with no benefit over the Group approach.

---

## Option 4: ImprovMX (Free forwarding)

### What it is
A forwarding-only service (free tier) similar to Cloudflare Email Routing. Receives email and forwards to a destination inbox.

### Cost
**$0** for receiving (free tier: 1 domain, 5 aliases, 10 MB attachment limit).
**$7.50/month** for SMTP send capability (Premium plan: 200 sent emails/day).

### Does it support sending AS hello@?
**Not on the free tier.** SMTP sending is premium-only. On the free tier, receiving is possible but sending from `hello@` requires paying $7.50/month or using a third-party SMTP workaround.

### MX record changes needed
**Yes — same conflict.** ImprovMX requires its own MX records, which would displace the Google Workspace MX records.

### Setup steps (for reference only)
1. Go to improvmx.com → Add domain (no signup needed) → Add forwarding alias.
2. Add ImprovMX MX records to Cloudflare (conflicts with Workspace MX).
3. For send-as on Premium: Create SMTP credentials in ImprovMX dashboard → configure Gmail Send mail as with ImprovMX SMTP.

### Time to set up
**15 minutes** for receive-only. Add 10–15 minutes per person for send-as if on Premium.

### Verdict
**Not recommended.** Free tier cannot send. Premium costs $7.50/month which is worse value than the existing Workspace subscription that already covers this for free. Same MX conflict issue.

---

## Side-by-Side Comparison

| | Google Workspace Group | Cloudflare Email Routing | Zoho Mail Free | ImprovMX Free |
|---|---|---|---|---|
| **Cost** | $0 (already paid) | $0 | $0 | $0 receive / $7.50/mo send |
| **Receive hello@** | Yes | Yes | Yes | Yes |
| **Send AS hello@** | Yes (clean) | Yes (workaround, fragile) | Yes (clean) | No (premium only) |
| **MX conflict with Workspace** | None | Yes — hard blocker | Yes — hard blocker | Yes — hard blocker |
| **Setup time** | 10–15 min | N/A (blocked) | N/A (blocked) | N/A (blocked) |
| **Extra DNS records** | None | Would overwrite existing | Would overwrite existing | Would overwrite existing |
| **Shared inbox (multiple people)** | Yes (Group + Collaborative Inbox) | Forward to one address only | Single mailbox | Forward to one address |

---

## Action Plan (Google Workspace Group)

1. **Log into** [admin.google.com](https://admin.google.com) as admin@healingheartscourse.com.
2. **Directory → Groups → Create group**
   - Email: `hello@healingheartscourse.com`
   - Type: Team (or Collaborative Inbox for shared assignment)
3. **Add members:** Chase, Trisha, Makayla (and others as needed).
4. **Optional — enable Collaborative Inbox** (Group Settings → Advanced → Collaborative Inbox) if the team wants to assign and track contact emails like tickets.
5. **Per-person send-as setup** (whoever needs to reply as hello@):
   - Gmail → Settings → See all settings → Accounts and Import → Send mail as → Add another email address
   - Enter `hello@healingheartscourse.com`
   - Since it is a domain the Workspace admin already controls, verification happens automatically or via a quick email confirmation.
6. Done. No DNS changes. No new paid services.

---

## Sources

- [Google Workspace — Add or delete an email alias](https://support.google.com/a/answer/33327?hl=en)
- [Google Workspace — Give a group an alias address](https://support.google.com/a/answer/2727156?hl=en)
- [Google Workspace — Create a group in your organization](https://support.google.com/a/answer/9400082?hl=en)
- [Cloudflare Email Routing overview](https://developers.cloudflare.com/email-routing/)
- [Cloudflare Email Routing — Enable Email Routing](https://developers.cloudflare.com/email-routing/get-started/enable-email-routing/)
- [Gmail SMTP with Cloudflare Email Routing (community guide)](https://community.cloudflare.com/t/solved-how-to-use-gmail-smtp-to-send-from-an-email-address-which-uses-cloudflare-email-routing/382769)
- [Zoho Mail — Custom domain email setup](https://www.zoho.com/mail/help/adminconsole/email-hosting-setup.html)
- [ImprovMX — Pricing](https://improvmx.com/pricing)
- [ImprovMX — SMTP (premium)](https://improvmx.com/smtp)
- [Google Workspace Pricing 2026](https://workspace.google.com/pricing)
