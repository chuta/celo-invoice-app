// Supabase Edge Function for generating recurring invoices
// Deploy with: supabase functions deploy generate-recurring-invoices
// Schedule with cron job to run daily

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

serve(async (req) => {
  try {
    // Verify authorization (optional - add a secret key)
    const authHeader = req.headers.get('Authorization')
    const CRON_SECRET = Deno.env.get('CRON_SECRET')
    
    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

    // Call the database function to generate recurring invoices
    const { data, error } = await supabase.rpc('generate_recurring_invoices')

    if (error) throw error

    // Get newly generated invoices
    const { data: newInvoices, error: fetchError } = await supabase
      .from('invoices')
      .select('id')
      .eq('status', 'pending')
      .gte('created_at', new Date(Date.now() - 60000).toISOString()) // Last minute

    if (fetchError) throw fetchError

    // Send email notifications for each new invoice
    const emailPromises = (newInvoices || []).map(async (invoice) => {
      try {
        await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify({
            type: 'recurring_generated',
            invoiceId: invoice.id,
          }),
        })
      } catch (err) {
        console.error(`Failed to send email for invoice ${invoice.id}:`, err)
      }
    })

    await Promise.all(emailPromises)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Generated ${newInvoices?.length || 0} recurring invoices`,
        count: newInvoices?.length || 0,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
