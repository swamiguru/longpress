---
slug: "upi-daily-cap-no-warning"
title: "Your bank may cap how many UPI payments you make in a day, and the published numbers disagree"
seoTitle: "UPI daily payment limit: why the numbers online disagree"
description: "SBI's own page says 20 UPI payments a day to people and no cap on shop payments. HDFC says 20 for both. Other sites say 10. Check before you rely on it."
published: 2026-11-04
category: "known-issue"
topics: ["upi", "payments", "india"]
image: "/images/known-issue/upi-daily-cap-no-warning.png"
imageAlt: "A tally sheet with twenty strokes grouped in fives and a locked door behind it, the key placed to one side"
openSince: 2024
trigger: >-
  Banks set their own limits on UPI payments, and the count limit is reported differently depending on which page you read. A bank's own page and a popular guide can give different numbers for the same bank. It has been a public complaint since at least 2024.
whoBenefits: >-
  Nobody that I can point to. This looks like a risk control, not a fee.
operatorsRead: >-
  If a bank limit stops a payment, the person at the counter should be told which limit it was. Today you have to know to look it up first.
verdict: "skip"
verdictNote: >-
  Skip relying on a single bank account for UPI. Link a second account from a different bank in your UPI app, so a failed payment has a backup. Then read your own bank's page for its numbers, because the guides online disagree.
sources:
  - label: "SBI YONO (UPI limits, June 2025)"
    url: "https://sbi.bank.in/web/yono/blog/understand-upi-transaction-limits-cooling-period-and-payment-tips"
  - label: "HDFC Bank (UPI limits)"
    url: "https://www.hdfc.bank.in/upi/limit"
  - label: "Tax2Win (SBI UPI limit)"
    url: "https://tax2win.in/guide/sbi-upi-limit"
  - label: "ClearTax (SBI UPI limit)"
    url: "https://cleartax.in/s/sbi-upi-transaction-limit"
  - label: "Business Today (Anupam Mittal on SBI's UPI limit)"
    url: "https://www.businesstoday.in/amp/personal-finance/news/story/upi-transaction-shark-tank-judge-anupam-mittal-raises-concern-over-sbis-upi-limit-transaction-errors-441858-2024-08-17"
draft: false
---

A UPI payment can fail even when the money is there. One possible cause is a bank limit on how many UPI payments an account can make in a day. The limits exist and each bank sets its own, but the numbers are hard to pin down.

[SBI's own page](https://sbi.bank.in/web/yono/blog/understand-upi-transaction-limits-cooling-period-and-payment-tips), dated June 2025, says an account can make 20 person-to-person payments in 24 hours. For payments to merchants it says there is no count limit, only the ₹1 lakh daily value limit. [HDFC's page](https://www.hdfc.bank.in/upi/limit) says 20 a day for both person-to-person and merchant payments.

Guides online don't agree with each other. [Tax2Win's SBI guide](https://tax2win.in/guide/sbi-upi-limit) says 10 a day. [ClearTax's](https://cleartax.in/s/sbi-upi-transaction-limit) says 20 for person-to-person payments and no cap for merchants, which matches SBI. The limit has also been a public complaint before: in August 2024, [Business Today reported](https://www.businesstoday.in/amp/personal-finance/news/story/upi-transaction-shark-tank-judge-anupam-mittal-raises-concern-over-sbis-upi-limit-transaction-errors-441858-2024-08-17) that Anupam Mittal had raised concerns about SBI's UPI limit.

So the number depends on your bank, on whether you are paying a person or a shop, and on which page you believe. SBI's page adds that the limits can change as NPCI or the bank decides. It also counts 24 hours, not a calendar day, and the limit is per account. Switching from one UPI app to another on the same account would not reset it.

There is a second limit that can cause a decline. SBI says that after you set or reset your UPI PIN, payments are capped at ₹5,000 for the first 24 hours on Android, or ₹5,000 a day for the first five days on iOS. A larger payment that fails right after a PIN change could be hitting that cap, not the daily count.

I think a limit that can stop a payment should name itself when it does. SBI's page lists its limits but says nothing about showing you how many you have used. That is the known issue: the numbers exist, but you find them only if you go looking, and the pages you find don't agree.

Link a second bank account in your UPI app and check your bank's own page for its limits. That takes a few minutes.

*Corrected 4 November 2026. The first version of this piece said banks cap retail UPI at 10 to 20 payments a day and used a coffee shop payment as the example. SBI's own page says merchant payments have no count cap, and the 10 to 20 range comes from guides that disagree with each other. It also said NPCI had raised some limits in 2025 and that current accounts have higher caps. We could not support either claim, so they have been removed.*
