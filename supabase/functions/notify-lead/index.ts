import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const NOTIFICATION_EMAIL = Deno.env.get("NOTIFICATION_EMAIL")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const data = await req.json();

    const areasOfInterest = Array.isArray(data.areas_of_interest)
      ? data.areas_of_interest.join(", ")
      : data.areas_of_interest || "—";

    const role = data.role_other || data.role || "—";
    const referral = data.referral_source_other || data.referral_source || "—";

    const htmlBody = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
  <h2 style="color: #0d1017; border-bottom: 2px solid #c9ff57; padding-bottom: 8px;">New Lead Submission</h2>

  <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
    <tr><td style="padding: 8px 12px; font-weight: 600; color: #555; width: 160px;">Name</td><td style="padding: 8px 12px;">${data.name || "—"}</td></tr>
    <tr style="background: #f9f9f9;"><td style="padding: 8px 12px; font-weight: 600; color: #555;">Email</td><td style="padding: 8px 12px;"><a href="mailto:${data.email}">${data.email || "—"}</a></td></tr>
    <tr><td style="padding: 8px 12px; font-weight: 600; color: #555;">Company</td><td style="padding: 8px 12px;">${data.company || "—"}</td></tr>
    <tr style="background: #f9f9f9;"><td style="padding: 8px 12px; font-weight: 600; color: #555;">Role</td><td style="padding: 8px 12px;">${role}</td></tr>
    <tr><td style="padding: 8px 12px; font-weight: 600; color: #555;">Company Stage</td><td style="padding: 8px 12px;">${data.company_stage || "—"}</td></tr>
    <tr style="background: #f9f9f9;"><td style="padding: 8px 12px; font-weight: 600; color: #555;">Biggest Bottleneck</td><td style="padding: 8px 12px;">${data.biggest_bottleneck || "—"}</td></tr>
    <tr><td style="padding: 8px 12px; font-weight: 600; color: #555;">Areas of Interest</td><td style="padding: 8px 12px;">${areasOfInterest}</td></tr>
    <tr style="background: #f9f9f9;"><td style="padding: 8px 12px; font-weight: 600; color: #555;">Tried Automating?</td><td style="padding: 8px 12px;">${data.tried_automating || "—"}</td></tr>
    <tr><td style="padding: 8px 12px; font-weight: 600; color: #555;">Timeline</td><td style="padding: 8px 12px;">${data.timeline || "—"}</td></tr>
    <tr style="background: #f9f9f9;"><td style="padding: 8px 12px; font-weight: 600; color: #555;">Budget Range</td><td style="padding: 8px 12px;">${data.budget_range || "Not specified"}</td></tr>
    <tr><td style="padding: 8px 12px; font-weight: 600; color: #555;">How They Found You</td><td style="padding: 8px 12px;">${referral}</td></tr>
  </table>

  <p style="margin-top: 24px; font-size: 13px; color: #888;">Sent from edozie.dev intake form</p>
</div>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Edozie.dev <notifications@edozie.dev>",
        to: [NOTIFICATION_EMAIL],
        subject: `New Lead: ${data.name} — ${data.company || "Unknown Company"}`,
        html: htmlBody,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Resend error:", err);
      return new Response(JSON.stringify({ error: "Email send failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Notify error:", e);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
