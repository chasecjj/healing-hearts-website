# Supabase Auth Email Templates

These templates replace the default Supabase Auth emails with Healing Hearts branding. Paste them into the Supabase Dashboard at:

**Authentication -> Email Templates**

---

## Confirm Signup

**Subject line:** `Confirm your Healing Hearts account`

**Message body (HTML):**

```html
<!DOCTYPE html>
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
              <img src="https://healingheartscourse.com/logo.png" alt="Healing Hearts" width="180" style="display:block; height:auto;">
            </td>
          </tr>
          <tr>
            <td style="background-color:#ffffff; border-radius:16px; padding:48px 40px; box-shadow:0 4px 24px rgba(17,145,177,0.06);">
              <div style="height:3px; background:linear-gradient(90deg, #1191B1, #B96A5F, #1191B1); border-radius:2px; margin-bottom:32px;"></div>

              <h1 style="margin:0 0 16px; font-size:28px; color:#2D2D2D; font-weight:400; font-style:italic; font-family:Georgia,'Times New Roman',serif;">
                One quick step
              </h1>

              <p style="margin:0 0 20px; font-size:16px; line-height:1.7; color:#555555;">
                Welcome! We just need to confirm this is really your email address before we set up your account.
              </p>

              <p style="margin:0 0 20px; font-size:16px; line-height:1.7; color:#555555;">
                Click the button below to finish creating your Healing Hearts account and access whatever you have waiting for you.
              </p>

              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:32px auto;">
                <tr>
                  <td align="center" style="background-color:#1191B1; border-radius:50px; padding:14px 32px;">
                    <a href="{{ .ConfirmationURL }}" style="color:#ffffff; text-decoration:none; font-size:16px; font-weight:600; display:inline-block;">
                      Confirm Your Account
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 20px; font-size:14px; line-height:1.6; color:#888888; text-align:center;">
                If the button does not work, copy and paste this link into your browser:
              </p>
              <p style="margin:0 0 20px; font-size:13px; line-height:1.5; color:#1191B1; text-align:center; word-break:break-all;">
                <a href="{{ .ConfirmationURL }}" style="color:#1191B1;">{{ .ConfirmationURL }}</a>
              </p>

              <div style="height:1px; background-color:#e5e5e5; margin:32px 0 24px;"></div>

              <p style="margin:0 0 4px; font-size:18px; color:#2D2D2D; font-style:italic; font-family:Georgia,'Times New Roman',serif;">
                Trisha Jamison
              </p>
              <p style="margin:0; font-size:13px; color:#a3a3a3;">
                Founder, Healing Hearts
              </p>

              <p style="margin:24px 0 0; font-size:13px; color:#999999; line-height:1.5;">
                If you did not create a Healing Hearts account, you can safely ignore this email. No account will be created.
              </p>
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
</html>
```

---

## Magic Link (sign in without password)

**Subject line:** `Your Healing Hearts sign-in link`

**Message body (HTML):**

Same template as above, but swap the headline and body copy:

```
<h1>Sign in to Healing Hearts</h1>

<p>Click the button below to sign in to your Healing Hearts account. This link will expire in 1 hour for your security.</p>

<!-- button text: "Sign In" -->

<!-- After the button: -->
<p>If you did not request this link, you can safely ignore this email.</p>
```

---

## Reset Password

**Subject line:** `Reset your Healing Hearts password`

**Message body (HTML):**

Same template, swap the headline and body:

```
<h1>Reset your password</h1>

<p>We received a request to reset the password on your Healing Hearts account. Click the button below to choose a new one.</p>

<!-- button text: "Reset Password" -->

<!-- After the button: -->
<p>If you did not request a password reset, you can safely ignore this email. Your password will not change.</p>
```

---

## Where to paste

1. Open Supabase Dashboard -> healing-hearts project
2. Navigate to **Authentication** -> **Email Templates**
3. Select each template type from the dropdown (Confirm Signup, Magic Link, Reset Password, Change Email)
4. Update the **Subject** field
5. Paste the full HTML into the **Message Body** field
6. Click **Save**

## Template variables

Supabase provides these variables inside `{{ .Variable }}` syntax:

- `{{ .ConfirmationURL }}` - link that confirms the action (signup/reset/etc.)
- `{{ .Token }}` - raw OTP token (usually not needed in HTML)
- `{{ .TokenHash }}` - hashed token
- `{{ .SiteURL }}` - your site URL from Supabase project settings
- `{{ .Email }}` - the recipient's email address

## Notes

- Supabase's sender domain default is `noreply@mail.app.supabase.io`. To use `hello@healingheartscourse.com` you would need to configure **Custom SMTP** in Supabase Dashboard -> Project Settings -> Auth -> SMTP. That is worth doing but not blocking for this work.
- The template above uses ASCII-only characters to avoid any SMTP encoding issues.
- Colors and fonts match `api/_emails/spark-shared.js` so all HH emails feel consistent.
