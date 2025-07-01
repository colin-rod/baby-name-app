import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { Resend } from "npm:resend"

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("OK", {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, apikey, Authorization, x-client-info",
      },
    })
  }

  try {
    const bodyText = await req.text()
    console.log("Raw request body:", bodyText)

    const { email, listId, role } = JSON.parse(bodyText)
    console.log("Parsed body:", { email, listId, role })

    if (!email || !listId || !role) {
      throw new Error("Missing required fields in request body")
    }

    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      const redirectUrl = `http://localhost:5173/login?redirect=/invite?listId=${listId}&email=${encodeURIComponent(email)}`
      return new Response(
        JSON.stringify({ error: "Unauthorized", redirectTo: redirectUrl }),
        {
          status: 401,
          headers: {
            ...corsHeaders(),
            "Content-Type": "application/json",
          },
        }
      )
    }

    const apiKey = Deno.env.get("RESEND_API_KEY")
    if (!apiKey) {
      throw new Error("RESEND_API_KEY not found in environment")
    }

    const resend = new Resend(apiKey)

    const { data, error } = await resend.emails.send({
      from: "Your App <onboarding@resend.dev>",
      to: email,
      subject: "You've been invited to collaborate",
      html: `<p>You’ve been invited to the list. Accept here: <a href="http://localhost:5173/invite?listId=${listId}&email=${encodeURIComponent(email)}">Join</a></p>`,
    })

    if (error) {
      console.error("Resend error:", error)
      return new Response("Error sending email", {
        status: 500,
        headers: corsHeaders(),
      })
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        ...corsHeaders(),
        "Content-Type": "application/json",
      },
    })
  } catch (err) {
    console.error("Function error:", err.message || err)
    return new Response("Server Error", {
      status: 500,
      headers: corsHeaders(),
    })
  }
})

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, apikey, Authorization, x-client-info",
    "Content-Type": "text/plain",
  }
}