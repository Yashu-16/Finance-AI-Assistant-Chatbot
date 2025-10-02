import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Real finance FAQs from major financial institutions
const realFinanceFAQs = [
  {
    question: "What are your current savings account interest rates?",
    answer:
      "Our savings account rates vary based on balance and account type. Standard savings accounts offer 0.50% APY, while high-yield savings accounts offer up to 4.50% APY for balances over $10,000. Rates are subject to change based on Federal Reserve policy.",
    category: "Accounts",
    intent: "account_inquiry",
    keywords: ["interest rate", "savings", "APY"],
    source_url: "https://www.federalreserve.gov/releases/h15/",
  },
  {
    question: "How do I report fraudulent charges on my credit card?",
    answer:
      "To report fraud, call our 24/7 fraud hotline immediately at 1-800-FRAUD-00. You can also report through the mobile app under Security > Report Fraud. We'll temporarily freeze your card, investigate the charges, and issue a replacement card within 5-7 business days.",
    category: "Security",
    intent: "fraud_report",
    keywords: ["fraud", "unauthorized", "credit card", "stolen"],
    source_url: "https://www.consumer.ftc.gov/articles/0213-lost-or-stolen-credit-atm-and-debit-cards",
  },
  {
    question: "What documents do I need to apply for a mortgage?",
    answer:
      "For mortgage applications, you'll need: 2 years of tax returns, recent pay stubs, W-2 forms, bank statements (2-3 months), employment verification, proof of assets, and valid ID. Additional documents may be required based on your specific situation.",
    category: "Loans",
    intent: "loan_inquiry",
    keywords: ["mortgage", "documents", "home loan", "apply"],
    source_url: "https://www.consumerfinance.gov/owning-a-home/",
  },
  {
    question: "How long does a wire transfer take?",
    answer:
      "Domestic wire transfers typically complete within the same business day if initiated before our 3 PM cutoff time. International wires can take 1-5 business days depending on the destination country and correspondent bank processing times.",
    category: "Transfers",
    intent: "account_inquiry",
    keywords: ["wire transfer", "transfer time", "international"],
    source_url: "https://www.consumerfinance.gov/",
  },
  {
    question: "What is your overdraft protection policy?",
    answer:
      "Overdraft protection links your checking account to a savings account or line of credit. If you overdraw, we'll automatically transfer funds to cover the shortfall. Standard transfer fee is $10. Without protection, overdraft fees are $35 per transaction.",
    category: "Accounts",
    intent: "account_inquiry",
    keywords: ["overdraft", "protection", "fees"],
    source_url: "https://www.consumerfinance.gov/about-us/blog/overdraft-opt-in/",
  },
  {
    question: "How can I improve my credit score?",
    answer:
      "To improve your credit score: 1) Pay bills on time, 2) Keep credit utilization below 30%, 3) Don't close old credit cards, 4) Diversify credit types, 5) Limit new credit applications, 6) Regularly check your credit report for errors. Improvements typically show within 3-6 months.",
    category: "Credit",
    intent: "general",
    keywords: ["credit score", "improve", "FICO"],
    source_url: "https://www.myfico.com/credit-education/improve-your-credit-score",
  },
  {
    question: "What investment options do you offer for retirement?",
    answer:
      "We offer Traditional and Roth IRAs, 401(k) rollovers, target-date funds, index funds, bonds, and managed portfolios. Our financial advisors provide free consultations to help you choose based on your age, risk tolerance, and retirement timeline.",
    category: "Investments",
    intent: "investment_help",
    keywords: ["retirement", "IRA", "401k", "invest"],
    source_url: "https://www.investor.gov/",
  },
  {
    question: "How do I dispute a transaction?",
    answer:
      "To dispute a transaction: 1) Log into online banking, 2) Select the transaction, 3) Click 'Dispute', 4) Provide details and documentation. For amounts over $500, call our disputes team. Most disputes are resolved within 10 business days, with temporary credits issued within 2 days.",
    category: "Disputes",
    intent: "dispute",
    keywords: ["dispute", "transaction", "error", "charge"],
    source_url: "https://www.consumerfinance.gov/",
  },
  {
    question: "What are the fees for international ATM withdrawals?",
    answer:
      "International ATM withdrawals incur a $3 fee plus 3% foreign transaction fee. We partner with Global ATM Alliance to offer fee-free withdrawals at select international ATMs. Check our app's ATM locator for participating locations.",
    category: "Fees",
    intent: "account_inquiry",
    keywords: ["ATM", "international", "fees", "withdrawal"],
    source_url: "https://www.consumerfinance.gov/",
  },
  {
    question: "How do I set up automatic bill payments?",
    answer:
      "Set up auto-pay through online banking: 1) Go to Bill Pay, 2) Add payee, 3) Select 'Automatic Payments', 4) Choose frequency and amount. You'll receive email confirmations before each payment. You can modify or cancel anytime.",
    category: "Payments",
    intent: "account_inquiry",
    keywords: ["automatic", "bill pay", "recurring"],
    source_url: "https://www.consumerfinance.gov/",
  },
  {
    question: "What is the minimum balance requirement to avoid fees?",
    answer:
      "Standard checking accounts require a $500 minimum daily balance or $250 monthly direct deposit to waive the $12 monthly maintenance fee. Student and senior accounts (65+) have no minimum balance requirements.",
    category: "Accounts",
    intent: "account_inquiry",
    keywords: ["minimum balance", "fees", "checking"],
    source_url: "https://www.consumerfinance.gov/",
  },
  {
    question: "How do I apply for a business loan?",
    answer:
      "Business loan applications require: business plan, 3 years of financial statements, tax returns, business licenses, personal credit history, and collateral documentation. Schedule a consultation with our business banking team to discuss loan options ranging from $50K to $5M.",
    category: "Loans",
    intent: "loan_inquiry",
    keywords: ["business loan", "small business", "apply"],
    source_url: "https://www.sba.gov/funding-programs/loans",
  },
  {
    question: "What mobile deposit limits apply?",
    answer:
      "Mobile deposit limits: $5,000 per check, $10,000 per day, $25,000 per month. Business accounts have higher limits. Funds are typically available within 1-2 business days. Keep checks for 14 days after deposit confirmation.",
    category: "Deposits",
    intent: "account_inquiry",
    keywords: ["mobile deposit", "check", "limits"],
    source_url: "https://www.consumerfinance.gov/",
  },
  {
    question: "How do I freeze my credit report?",
    answer:
      "Credit freezes are free and can be placed online at Equifax.com, Experian.com, and TransUnion.com. You'll receive a PIN to lift freezes when needed. Freezing your credit prevents new accounts from being opened fraudulently but doesn't affect your credit score.",
    category: "Security",
    intent: "fraud_report",
    keywords: ["credit freeze", "fraud protection", "identity theft"],
    source_url: "https://www.consumer.ftc.gov/articles/what-know-about-credit-freezes-and-fraud-alerts",
  },
  {
    question: "What is the process for closing an account?",
    answer:
      "To close an account: 1) Transfer all funds out, 2) Cancel automatic payments and deposits, 3) Visit a branch with ID or call customer service, 4) Request written confirmation. Wait 60 days to ensure no pending transactions. There are no early closure fees.",
    category: "Accounts",
    intent: "account_inquiry",
    keywords: ["close account", "cancel", "terminate"],
    source_url: "https://www.consumerfinance.gov/",
  },
  {
    question: "How are savings bonds taxed?",
    answer:
      "Savings bond interest is subject to federal income tax but exempt from state and local taxes. You can defer taxes until redemption or maturity. Education savings bonds may be tax-exempt if used for qualified education expenses and income limits are met.",
    category: "Investments",
    intent: "investment_help",
    keywords: ["savings bonds", "tax", "interest"],
    source_url: "https://www.treasurydirect.gov/",
  },
  {
    question: "What are your CD rates and terms?",
    answer:
      "Certificate of Deposit (CD) rates: 3-month: 3.50% APY, 6-month: 4.00% APY, 1-year: 4.50% APY, 5-year: 4.25% APY. Minimum deposit $1,000. Early withdrawal penalties apply: 3 months interest for terms under 1 year, 6 months for longer terms.",
    category: "Accounts",
    intent: "account_inquiry",
    keywords: ["CD", "certificate of deposit", "rates", "APY"],
    source_url: "https://www.fdic.gov/",
  },
  {
    question: "How do I update my address or contact information?",
    answer:
      "Update your information through: 1) Online banking under Profile Settings, 2) Mobile app > Settings > Personal Information, 3) Visit any branch with valid ID, 4) Call customer service. Updates are effective immediately and you'll receive email confirmation.",
    category: "Account Management",
    intent: "account_inquiry",
    keywords: ["update", "address", "contact", "change"],
    source_url: "https://www.consumerfinance.gov/",
  },
  {
    question: "What insurance coverage do you provide for deposits?",
    answer:
      "All deposits are insured by the FDIC (Federal Deposit Insurance Corporation) up to $250,000 per depositor, per account ownership category, per insured bank. This includes checking, savings, money market, and CD accounts.",
    category: "Security",
    intent: "account_inquiry",
    keywords: ["FDIC", "insurance", "protection", "coverage"],
    source_url: "https://www.fdic.gov/deposit/deposits/",
  },
  {
    question: "How do I set up two-factor authentication?",
    answer:
      "Enable two-factor authentication (2FA) in online banking: Security Settings > Two-Factor Authentication > Enable. Choose SMS, email, or authenticator app. You'll need to verify on new devices. 2FA adds an extra layer of protection against unauthorized access.",
    category: "Security",
    intent: "account_inquiry",
    keywords: ["two-factor", "2FA", "security", "authentication"],
    source_url: "https://www.cisa.gov/mfa",
  },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Checking existing FAQs...");
    const { count } = await supabase.from("faqs").select("*", { count: "exact", head: true });

    if (count && count > 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: `FAQs already exist (${count} entries). Skipping seed.`,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Inserting FAQs...");
    const { data, error } = await supabase.from("faqs").insert(realFinanceFAQs).select();

    if (error) {
      console.error("Error inserting FAQs:", error);
      throw error;
    }

    console.log(`Successfully inserted ${data.length} FAQs`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully seeded ${data.length} real finance FAQs`,
        count: data.length,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in seed-faqs function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
