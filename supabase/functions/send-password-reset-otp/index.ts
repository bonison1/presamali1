// supabase/functions/send-password-reset-otp/index.ts
//
// Deploy:   supabase functions deploy send-password-reset-otp
// Secrets:  reuses GMAIL_USER, GMAIL_APP_PASSWORD, EDGE_FUNCTION_SECRET
//           (already set for send-signup-otp — no new secrets needed)

import { SMTPClient } from "npm:emailjs@4.0.3";

const GMAIL_USER = Deno.env.get("GMAIL_USER")!;
const GMAIL_APP_PASSWORD = Deno.env.get("GMAIL_APP_PASSWORD")!;
const EDGE_FUNCTION_SECRET = Deno.env.get("EDGE_FUNCTION_SECRET")!;

const client = new SMTPClient({
  user: GMAIL_USER,
  password: GMAIL_APP_PASSWORD,
  host: "smtp.gmail.com",
  ssl: true,
  port: 465,
});

Deno.serve(async (req) => {
  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (authHeader !== `Bearer ${EDGE_FUNCTION_SECRET}`) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const { email, code } = await req.json();

    if (!email || !code) {
      return new Response(JSON.stringify({ error: "Missing email or code" }), { status: 400 });
    }

    await client.sendAsync({
      from: `Mateng <${GMAIL_USER}>`,
      to: email,
      subject: "Your Mateng password reset code",
      text: `Your password reset code is ${code}. It expires in 15 minutes. If you didn't request this, you can ignore this email.`,
      attachment: [
        {
          data: `
            <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
              <h2>Reset your password</h2>
              <p>Use the code below to reset your Mateng account password:</p>
              <p style="font-size: 32px; font-weight: bold; letter-spacing: 4px;">${code}</p>
              <p style="color: #666; font-size: 13px;">This code expires in 15 minutes. If you didn't request this, you can safely ignore this email — your password won't be changed.</p>
            </div>
          `,
          alternative: true,
        },
      ],
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-password-reset-otp error:", err);
    return new Response(JSON.stringify({ error: "Failed to send email" }), { status: 500 });
  }
});