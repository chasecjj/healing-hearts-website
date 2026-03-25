import { emailWrapper, escapeHtml, heading, paragraph, divider } from './spark-shared.js';

export function applicationTeamNotifyEmail(data) {
  const safeName = escapeHtml(data.name);
  const previewText = `New application from ${safeName}`;

  const field = (label, value) =>
    value ? `<tr><td style="padding:6px 12px;font-weight:600;vertical-align:top;color:#1191B1;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;">${escapeHtml(label)}</td><td style="padding:6px 12px;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;color:#2D2D2D;">${escapeHtml(value)}</td></tr>` : '';

  const ratingBar = (n) => {
    const filled = '&#9632;'.repeat(n);
    const empty = '&#9633;'.repeat(10 - n);
    return `${filled}${empty} (${n}/10)`;
  };

  // Qualification flags — values arrive as display strings from the form
  const qualificationFlags = [];
  if (data.partner_willing === 'Yes') qualificationFlags.push('Partner willing');
  if (data.partner_willing === 'No') qualificationFlags.push('Partner NOT willing');
  if (data.partner_willing === 'Not yet') qualificationFlags.push('Partner not yet willing');
  if (data.partner_willing === 'Not sure') qualificationFlags.push('Partner willingness uncertain');
  if (['$10K\u201320K', '$10K-$20K', '10k_20k', 'Over $20K', 'over_20k'].includes(data.investment_readiness)) qualificationFlags.push('Budget aligned');
  if (['Under $5K', 'under_5k'].includes(data.investment_readiness)) qualificationFlags.push('Budget concern');
  if (['ASAP', 'asap'].includes(data.urgency)) qualificationFlags.push('High urgency');

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
    field('Partner Aware', data.partner_aware || 'Not provided'),
    field('Partner Willing', data.partner_willing || 'Not provided'),
    field('Ideal Outcome', data.ideal_outcome || 'Not provided'),
    field('Urgency', data.urgency || 'Not provided'),
    field('Investment Readiness', data.investment_readiness || 'Not provided'),
    field('Faith Role', data.faith_role || 'Not provided'),
    field('How Heard', data.how_heard || 'Not provided'),
    field('Additional Notes', data.additional_notes || 'None'),
    `</table>`,
    divider(),
    paragraph('Review this application and update the status in Supabase. If qualified, send the Calendly booking link.'),
  ].join('');

  return {
    subject: `New HH Application: ${safeName} (${escapeHtml(data.urgency) || 'no urgency'})`,
    html: emailWrapper(body, previewText),
  };
}
