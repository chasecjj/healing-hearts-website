// Shared email HTML chrome for Spark Challenge drip emails.
// All day templates import these helpers to maintain consistent styling.

export function emailWrapper(bodyContent) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background-color:#faf9f6; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#faf9f6;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%;">
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <img src="https://healingheartscourse.com/logo.png" alt="Healing Hearts" width="48" height="48" style="display:block;">
            </td>
          </tr>
          <tr>
            <td style="background-color:#ffffff; border-radius:16px; padding:48px 40px; box-shadow:0 4px 24px rgba(17,145,177,0.06);">
              <div style="height:3px; background:linear-gradient(90deg, #1191B1, #B96A5F, #1191B1); border-radius:2px; margin-bottom:32px;"></div>
              ${bodyContent}
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:32px 20px 0;">
              <p style="margin:0 0 8px; font-size:13px; color:#a3a3a3;">
                Healing Hearts &middot; healingheartscourse.com
              </p>
              <p style="margin:0; font-size:12px; color:#d4d4d4;">
                Every marriage has a story worth fighting for.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function heading(text) {
  return `<h1 style="margin:0 0 16px; font-size:28px; color:#2D2D2D; font-weight:400; font-style:italic; font-family:Georgia,'Times New Roman',serif;">${text}</h1>`;
}

export function subheading(text) {
  return `<h2 style="margin:32px 0 12px; font-size:22px; color:#2D2D2D; font-weight:400; font-style:italic; font-family:Georgia,'Times New Roman',serif;">${text}</h2>`;
}

export function paragraph(text) {
  return `<p style="margin:0 0 20px; font-size:16px; line-height:1.7; color:#555555;">${text}</p>`;
}

export function callout(text) {
  return `<div style="background-color:#faf9f6; border-left:4px solid #1191B1; padding:16px 20px; margin:24px 0; border-radius:0 8px 8px 0;">
  <p style="margin:0; font-size:16px; line-height:1.7; color:#555555; font-style:italic;">${text}</p>
</div>`;
}

export function bulletList(items) {
  const listItems = items.map(item => `<li style="margin-bottom:8px; font-size:16px; line-height:1.6; color:#555555;">${item}</li>`).join('');
  return `<ul style="margin:16px 0 24px; padding-left:24px;">${listItems}</ul>`;
}

export function numberedList(items) {
  const listItems = items.map(item => `<li style="margin-bottom:8px; font-size:16px; line-height:1.6; color:#555555;">${item}</li>`).join('');
  return `<ol style="margin:16px 0 24px; padding-left:24px;">${listItems}</ol>`;
}

export function ctaButton(text, url) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:32px auto;">
  <tr>
    <td align="center" style="background-color:#1191B1; border-radius:50px; padding:14px 32px;">
      <a href="${url}" style="color:#ffffff; text-decoration:none; font-size:16px; font-weight:600; display:inline-block;">${text}</a>
    </td>
  </tr>
</table>`;
}

export function divider() {
  return `<div style="height:1px; background-color:#e5e5e5; margin:24px 0;"></div>`;
}

export function signOff(message, previewNext) {
  let html = `${divider()}
${paragraph(message)}
<p style="margin:0 0 4px; font-size:18px; color:#2D2D2D; font-style:italic; font-family:Georgia,'Times New Roman',serif;">Trisha Jamison</p>
<p style="margin:0; font-size:13px; color:#a3a3a3;">Founder, Healing Hearts</p>`;

  if (previewNext) {
    html += `<div style="margin-top:24px; padding:16px 20px; background-color:#f0fafb; border-radius:8px;">
  <p style="margin:0; font-size:14px; color:#1191B1; font-weight:600;">Coming tomorrow:</p>
  <p style="margin:4px 0 0; font-size:14px; color:#555555;">${previewNext}</p>
</div>`;
  }

  return html;
}

export function dayBadge(dayNumber) {
  return `<div style="display:inline-block; background-color:#1191B1; color:#ffffff; font-size:13px; font-weight:700; padding:6px 14px; border-radius:50px; margin-bottom:16px;">Day ${dayNumber} of 7</div>`;
}
