#!/usr/bin/env node

/**
 * Comprehensive Email Function Test Script
 * Tests the send-email edge function with various scenarios
 * 
 * Usage: node test-email-function.js
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Test configuration
const TEST_CONFIG = {
  // Set to true to actually send emails, false for dry run
  SEND_REAL_EMAILS: false,
  // Invoice ID to test with (must exist in your database)
  TEST_INVOICE_ID: null, // Will be fetched automatically
}

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logSection(title) {
  console.log('\n' + '='.repeat(60))
  log(title, 'bright')
  console.log('='.repeat(60))
}

function logTest(name, status, details = '') {
  const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️'
  const color = status === 'pass' ? 'green' : status === 'fail' ? 'red' : 'yellow'
  log(`${icon} ${name}`, color)
  if (details) {
    console.log(`   ${details}`)
  }
}

async function getTestInvoice() {
  log('\n🔍 Fetching test invoice from database...', 'cyan')
  
  const { data: invoices, error } = await supabase
    .from('invoices')
    .select(`
      *,
      clients (name, email),
      profiles (full_name, email, wallet_address)
    `)
    .limit(1)
    .single()

  if (error) {
    log(`❌ Error fetching invoice: ${error.message}`, 'red')
    return null
  }

  if (!invoices) {
    log('❌ No invoices found in database. Please create at least one invoice first.', 'red')
    return null
  }

  log(`✅ Found invoice: ${invoices.invoice_number}`, 'green')
  log(`   User: ${invoices.profiles?.full_name || 'N/A'}`, 'cyan')
  log(`   Email: ${invoices.profiles?.email || 'N/A'}`, 'cyan')
  log(`   Amount: ${invoices.amount} cUSD`, 'cyan')
  
  return invoices
}

async function testEmailFunction(type, invoiceId, notes = '') {
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: { type, invoiceId, notes },
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

async function testCORS() {
  logSection('🌐 Testing CORS Configuration')
  
  try {
    const response = await fetch(
      `${supabaseUrl}/functions/v1/send-email`,
      {
        method: 'OPTIONS',
        headers: {
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'content-type',
        },
      }
    )

    if (response.ok) {
      const corsHeader = response.headers.get('Access-Control-Allow-Origin')
      if (corsHeader) {
        logTest('CORS preflight request', 'pass', `Allow-Origin: ${corsHeader}`)
      } else {
        logTest('CORS preflight request', 'warn', 'No CORS headers found')
      }
    } else {
      logTest('CORS preflight request', 'fail', `Status: ${response.status}`)
    }
  } catch (error) {
    logTest('CORS preflight request', 'fail', error.message)
  }
}

async function testEmailTypes(invoice) {
  logSection('📧 Testing Email Types')

  const emailTypes = [
    { type: 'invoice_pending', name: 'Invoice Pending (to admin)', notes: '' },
    { type: 'invoice_approved', name: 'Invoice Approved (to user)', notes: 'Great work!' },
    { type: 'invoice_rejected', name: 'Invoice Rejected (to user)', notes: 'Please revise the amounts' },
    { type: 'invoice_paid', name: 'Invoice Paid (to user)', notes: '' },
    { type: 'invoice_voided', name: 'Invoice Voided (to user)', notes: 'Duplicate invoice' },
    { type: 'invoice_cancelled', name: 'Invoice Cancelled (to admin)', notes: '' },
    { type: 'recurring_generated', name: 'Recurring Invoice Generated (to user)', notes: '' },
  ]

  for (const emailType of emailTypes) {
    log(`\n📨 Testing: ${emailType.name}`, 'cyan')
    
    if (!TEST_CONFIG.SEND_REAL_EMAILS) {
      logTest(emailType.name, 'warn', 'Skipped (dry run mode)')
      continue
    }

    const result = await testEmailFunction(emailType.type, invoice.id, emailType.notes)
    
    if (result.success) {
      logTest(emailType.name, 'pass', `Email ID: ${result.data?.id || 'N/A'}`)
    } else {
      logTest(emailType.name, 'fail', result.error)
    }

    // Wait a bit between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
}

async function testErrorHandling(invoice) {
  logSection('🛡️ Testing Error Handling')

  // Test with invalid invoice ID
  log('\n🧪 Test: Invalid invoice ID', 'cyan')
  const result1 = await testEmailFunction('invoice_pending', '00000000-0000-0000-0000-000000000000')
  if (!result1.success) {
    logTest('Invalid invoice ID handling', 'pass', 'Correctly returned error')
  } else {
    logTest('Invalid invoice ID handling', 'fail', 'Should have returned error')
  }

  // Test with invalid email type
  log('\n🧪 Test: Invalid email type', 'cyan')
  const result2 = await testEmailFunction('invalid_type', invoice.id)
  if (!result2.success) {
    logTest('Invalid email type handling', 'pass', 'Correctly returned error')
  } else {
    logTest('Invalid email type handling', 'fail', 'Should have returned error')
  }

  // Test with missing parameters
  log('\n🧪 Test: Missing parameters', 'cyan')
  try {
    const { error } = await supabase.functions.invoke('send-email', {
      body: {},
    })
    if (error) {
      logTest('Missing parameters handling', 'pass', 'Correctly returned error')
    } else {
      logTest('Missing parameters handling', 'fail', 'Should have returned error')
    }
  } catch (error) {
    logTest('Missing parameters handling', 'pass', 'Correctly caught error')
  }
}

async function testEnvironmentVariables() {
  logSection('🔧 Checking Environment Variables')

  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
  ]

  const edgeFunctionVars = [
    'RESEND_API_KEY',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'ADMIN_EMAIL',
    'APP_URL',
    'FROM_EMAIL',
  ]

  log('\n📋 Local Environment Variables:', 'cyan')
  for (const varName of requiredVars) {
    if (process.env[varName]) {
      logTest(varName, 'pass', '✓ Set')
    } else {
      logTest(varName, 'fail', '✗ Missing')
    }
  }

  log('\n📋 Edge Function Variables (must be set in Supabase):', 'cyan')
  for (const varName of edgeFunctionVars) {
    log(`   ${varName}`, 'yellow')
  }
  log('\n   ℹ️  Verify these in: Supabase Dashboard > Project Settings > Edge Functions', 'blue')
}

async function runTests() {
  log('\n' + '█'.repeat(60), 'bright')
  log('   📧 EMAIL FUNCTION COMPREHENSIVE TEST SUITE', 'bright')
  log('█'.repeat(60) + '\n', 'bright')

  // Check environment variables
  await testEnvironmentVariables()

  // Test CORS
  await testCORS()

  // Get test invoice
  const invoice = await getTestInvoice()
  if (!invoice) {
    log('\n❌ Cannot proceed without a test invoice', 'red')
    process.exit(1)
  }

  // Test error handling
  await testErrorHandling(invoice)

  // Test email types
  if (TEST_CONFIG.SEND_REAL_EMAILS) {
    log('\n⚠️  WARNING: Real emails will be sent!', 'yellow')
    await testEmailTypes(invoice)
  } else {
    log('\n📝 DRY RUN MODE: No emails will be sent', 'yellow')
    log('   Set TEST_CONFIG.SEND_REAL_EMAILS = true to send real emails', 'cyan')
  }

  // Summary
  logSection('📊 Test Summary')
  log('\n✅ All tests completed!', 'green')
  log('\n📚 Next Steps:', 'cyan')
  log('   1. Check Supabase Edge Function logs for any errors', 'blue')
  log('   2. Verify environment variables are set in Supabase Dashboard', 'blue')
  log('   3. Check Resend dashboard for email delivery status', 'blue')
  log('   4. Test in production by creating/approving invoices', 'blue')
  
  log('\n🔗 Useful Links:', 'cyan')
  log(`   Supabase Functions: ${supabaseUrl.replace('//', '//supabase.com/dashboard/project/')}/functions`, 'blue')
  log('   Resend Dashboard: https://resend.com/emails', 'blue')
  
  console.log('\n')
}

// Run tests
runTests().catch(error => {
  log(`\n❌ Test suite failed: ${error.message}`, 'red')
  console.error(error)
  process.exit(1)
})
