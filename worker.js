export default {
  async fetch(request, env, ctx) {
    // CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // Handle OPTIONS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // Only accept POST
    if (request.method !== "POST") {
      return new Response("Method not allowed", { 
        status: 405, 
        headers: corsHeaders 
      });
    }

    try {
      // Parse form data
      const formData = await request.formData();
      const data = {};
      
      for (const [key, value] of formData) {
        // Handle multiple values (checkboxes)
        if (data[key]) {
          data[key] = data[key] + ", " + value;
        } else {
          data[key] = value;
        }
      }

      // Build email HTML
      let emailHtml = `📬 Neue Anfrage von fudora.de
=============================

👤 Über Sie
-----------

Name: ${data.name || "Nicht angegeben"}
E-Mail: ${data.email || "Nicht angegeben"}
Telefon: ${data.phone || "Nicht angegeben"}
Firma/Branche: ${data.company || "Nicht angegeben"}

🎯 Projektart
-------------

${data.projektart || "Nicht angegeben"}

📦 Interessante Pakete
----------------------

${data.pakete || "Keine Pakete ausgewählt"}

🔍 Details
----------

Aktuelle Webseite: ${data.aktuelle_webseite || "Keine"}
Geschätzte Seiten: ${data.seiten || "Nicht angegeben"}
Gewünschte Funktionen: ${data.funktionen || "Nicht angegeben"}

🎨 Design
---------

Stil: ${data.design_stil || "Nicht angegeben"}
Farbvorlieben: ${data.farben || "Nicht angegeben"}

💰 Budget & Zeit
----------------

Budget: ${data.budget || "Nicht angegeben"}
Zeitrahmen: ${data.zeitrahmen || "Nicht angegeben"}

💬 Nachricht
------------

${data.message || "Keine Nachricht"}
`;

      // Send email via Resend
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "fudora <onboarding@resend.dev>",
          to: env.TO_EMAIL,
          subject: data._subject || "Neue Anfrage von fudora",
          text: emailHtml,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("Resend error:", error);
        return new Response("Error sending email", { 
          status: 500, 
          headers: corsHeaders 
        });
      }

      // Success - redirect to thank you page
      const redirectUrl = data._next || "danke.html";
      return Response.redirect(redirectUrl, 303, {
        ...corsHeaders,
      });

    } catch (error) {
      console.error("Worker error:", error);
      return new Response("Internal error: " + error.message, { 
        status: 500, 
        headers: corsHeaders 
      });
    }
  }
};