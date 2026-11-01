---
slug: "upi-daily-cap-no-warning"
title: "There is a daily cap on how many UPI transactions you can make. Nothing in the apps tells you until you hit it."
seoTitle: "The UPI daily cap your apps don't warn you about"
description: "Most banks cap retail UPI at 10 to 20 payments a day. Your UPI app doesn't surface the counter. You find out at the next counter."
published: 2026-11-01
category: "known-issue"
topics: ["upi", "payments", "india"]
image: "/images/known-issue/upi-daily-cap-no-warning.png"
imageAlt: "A tally sheet with twenty strokes grouped in fives and a locked door behind it, the key placed to one side"
openSince: 2019
trigger: >-
  Every retail UPI account in India has a daily transaction cap set by its own bank, inside the NPCI envelope. The cap has existed since UPI 1.0. The surface area that would warn a user they are near it — the UPI app, the bank's own app, the SMS confirmation line — surfaces nothing. The failure happens at a shop counter, with the next customer in queue, and reads to the shopkeeper like a declined card.
whoBenefits: >-
  Nobody, directly. This is not a case of someone making money off the cap; it is a case of nobody being responsible for the UX of hitting it. NPCI sets a ceiling. Each bank picks a number inside that ceiling. The UPI app operator — PhonePe, Google Pay, Paytm — does not count against the per-bank cap because it has no way to know what the bank's number is from one issuer to the next. The result is a three-party system in which no party owns the viewer's experience of running out of transactions.
operatorsRead: >-
  A rate limit without a visible counter is the first thing a payments platform fixes once it is big enough to care about reliability. UPI is big enough; it has been for years. The counter has not shipped because the counter sits across a three-way boundary — the bank, NPCI and the app — and none of the three absorbs the support cost of the failure. The shopkeeper does, and the shopkeeper is not represented in any of the three.
verdict: "skip"
verdictNote: >-
  Skip SBI as your sole UPI handle if you transact more than ten or so times a day — register a second handle on HDFC, ICICI or Axis against a different account and keep it linked in a backup UPI app. The limits are not uniform across banks, and the fail-over keeps your morning working. For high-value monthly outflows (fees, taxes, healthcare), use the category-exempt caps NPCI permits for those specific flows rather than retail UPI.
sources:
  - label: "Business Today (Anupam Mittal on SBI's UPI limit)"
    url: "https://www.businesstoday.in/amp/personal-finance/news/story/upi-transaction-shark-tank-judge-anupam-mittal-raises-concern-over-sbis-upi-limit-transaction-errors-441858-2024-08-17"
  - label: "Pine Labs (UPI 2026 rules)"
    url: "https://www.pinelabs.com/blog/upi-transaction-new-rules-complete-guide-for-2026"
  - label: "Outlook Money (NPCI August 2025 limits)"
    url: "https://www.outlookmoney.com/banking/new-upi-use-limits-from-august-1-fewer-balance-checks-autopay-requests"
  - label: "IDFC First Bank (payment-failure help)"
    url: "https://www.idfcfirstbank.com/finfirst-blogs/savings-account/upi-payment-failures-tips-to-resolve-issues"
  - label: "Business Standard (UPI outages coverage)"
    url: "https://www.business-standard.com/topic/upi/page-6"
draft: false
---

The failure almost always happens in the middle of a day. You pay for the auto, you pay for tea, you pay for the vegetables, you pay the courier, you pay the chemist, you get to the coffee shop around 4pm, and the UPI confirmation never comes. The barista stares. Someone behind you clears a throat. You try again on a different app, same bank. Same silence. You pay by card and leave.

If you called your bank's helpline after that, you would be told your retail UPI account hit a daily transaction limit — a number sitting somewhere between about 10 and 20 payments a day, depending on the bank and the account tier. SBI's number is reportedly on the lower end of that band; Anupam Mittal [raised it publicly against SBI in 2024](https://www.businesstoday.in/amp/personal-finance/news/story/upi-transaction-shark-tank-judge-anupam-mittal-raises-concern-over-sbis-upi-limit-transaction-errors-441858-2024-08-17), and the thread of complaints on the bank's own support channels has not thinned since. HDFC, ICICI and Axis each have their own number, each slightly different, none of them published prominently at account opening.

What makes this a column rather than a complaint is the UX gap. UPI runs on a system where NPCI sets the outer envelope, each bank picks a per-account cap inside that envelope, and the UPI app operator — PhonePe, Google Pay, Paytm, BHIM — handles the request. None of the three surfaces a running counter to the user. The UPI app does not know your bank's number. The bank's own app does not display the day's count on its home screen. The SMS confirmation line that ships after a successful payment contains the transaction amount and the reference ID. It does not contain "7 of 20 today."

NPCI did raise some rate limits in 2025 — [specifically on balance checks and autopay setup](https://www.outlookmoney.com/banking/new-upi-use-limits-from-august-1-fewer-balance-checks-autopay-requests), which were being hammered by poll-based reconciliations and causing outages at peak. The 2026 revisions widened category-exempt caps for tax, education, healthcare and insurance payments [to as high as ₹10 lakh a day](https://www.pinelabs.com/blog/upi-transaction-new-rules-complete-guide-for-2026) under verified use cases. Neither revision addressed the retail per-account counter the ordinary user actually hits. That one, which fires at the barista and the autowala and the subzi-mandi queue, has not materially moved in years.

The three-party structure is why. Fixing a hidden counter requires the UPI app to know the bank's per-account cap, which means NPCI has to publish per-issuer limits in a machine-readable form, which means the banks have to agree to publish them. Each party has a reason not to carry the responsibility: the bank considers it an internal risk control, NPCI considers it a bank-specific setting outside its scope, and the UPI app considers it a bank-side state it cannot authoritatively surface. The customer sits in the middle, and the merchant takes the hit.

The practical fixes are three, in order of effort. First, register a second UPI handle against a different bank. HDFC, ICICI and Axis each run a slightly higher per-account cap than SBI as of late 2026; keeping a second handle linked in a backup app — PhonePe for primary, Google Pay for backup, or vice versa — means a failed transaction can be retried in under a minute without changing physical cards. Second, use category-exempt caps for the monthly payments that would otherwise eat into your retail count: a one-shot ₹25,000 tax payment uses the government-services envelope, not the retail counter. Third, for anyone running a small business on UPI QR, apply for a current account rather than a savings account; the per-account caps are structurally higher on current accounts, which is the piece of the policy the ordinary retail customer does not benefit from.

The known issue is that the UX of a shared infrastructure limit is nobody's product. NPCI has no screen. The bank has one, and does not surface the counter. The UPI app has one, and does not know the number. Nothing in this is a hard engineering problem; it is a boundary problem. Six years after the limit was first raised publicly against SBI, no party has absorbed the cost of fixing it. The queue at the counter is where that cost lands instead.
