// supabase/functions/send-signup-otp/index.ts
//
// Deploy:   supabase functions deploy send-signup-otp
// Secrets:  supabase secrets set GMAIL_USER=you@gmail.com
//           supabase secrets set GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx   (Gmail App Password, NOT your normal password)
//           supabase secrets set EDGE_FUNCTION_SECRET=<same long random string used in app.edge_function_secret>
//
// Gmail App Password: Google Account -> Security -> 2-Step Verification -> App passwords.
// Regular Gmail passwords will NOT work over SMTP if 2FA is on (which it should be).

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
    // Only the Postgres RPC (with the shared secret) should be able to call this.
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
      subject: "Your Mateng verification code",
      text: `Your verification code is ${code}. It expires in 15 minutes.`,
      attachment: [
        {
          data: `
            <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
              <h2>Verify your email</h2>
              <p>Use the code below to finish creating your Mateng account:</p>
              <p style="font-size: 32px; font-weight: bold; letter-spacing: 4px;">${code}</p>
              <p style="color: #666; font-size: 13px;">This code expires in 15 minutes. If you didn't request this, you can ignore this email.</p>
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
    console.error("send-signup-otp error:", err);
    return new Response(JSON.stringify({ error: "Failed to send email" }), { status: 500 });
  }
});