import { emailWrapper, heading, paragraph, divider } from './spark-shared.js';

export function applicationTeamNotifyEmail(data) {
  const previewText = `New application from ${data.name}`;

  const field = (label, value) =>
    value ? `<tr><td style="padding:6px 12px;font-weight:600;vertical-align:top;color:#1191B1;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;">${label}</td><td style="padding:6px 12px;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;color:#2D2D2D;">${value}</td></tr>` : '';

  const ratingBar = (n) => {
    const filled = '&#9632;'.repeat(n);
    const empty = '&#9633;'.repeat(10 - n);
    return `${filled}${empty} (${n}/10)`;
  };

  const qualificationFlags = [];
  if (data.partner_willing === true) qualificationFlags.push('Partner willing');
  if (data.partner_willing === false) qualificationFlags.push('Partner NOT willing');
  if (['10k_20k', 'over_20k'].includes(data.investment_readiness)) qualificationFlags.push('Budget aligned');
  if (data.investment_readiness === 'under_5k') qualificationFlags.push('Budget concern');
  if (data.urgency === 'asap') qualificationFlags.push('High urgency');

  const flagsHtml = qualificationFlags.length > 0
    ? `<div style="padding:12px;background:#f0fdf4;border-left:4px solid #22c55e;margin:16px 0;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;">${qualificationFlags.map(f => `&#10003; ${f}`).join('<br/>')}</div>`
    : '';

  const body = [
    heading('New Application Received'),
    flagsHtml,
    `<table style="width:100%;border-collapse:collapse;margin:16px 0;">`,
    field('Name', data.name),
    field('Email', data.email),
    field('Phone', data.phone || 'Not provided'),
    field('Relationship', data.relationship_status),
    field('Years Together', data.years_together),
    field('Rating', data.relationship_rating ? ratingBar(data.relationship_rating) : 'Not provided'),
    field('Biggest Challenge', data.biggest_challenge),
    field('Tried Before', data.tried_before || 'Not provided'),
    field('Partner Aware', data.partner_aware ? 'Yes' : 'No'),
    field('Partner Willing', data.partner_willing ? 'Yes' : data.partner_willing === false ? 'No' : 'Not sure'),
    field('Ideal Outcome', data.ideal_outcome || 'Not provided'),
    field('Urgency', data.urgency),
    field('Investment Readiness', data.investment_readiness),
    field('Faith Role', data.faith_role || 'Not provided'),
    field('How Heard', data.how_heard || 'Not provided'),
    field('Additional Notes', data.additional_notes || 'None'),
    `</table>`,
    divider(),
    paragraph('Review this application and update the status in Supabase. If qualified, send the Calendly booking link.'),
  ].join('');

  return {
    subject: `New HH Application: ${data.name} (${data.urgency || 'no urgency'})`,
    html: emailWrapper(body, previewText),
  };
}
