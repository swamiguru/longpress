---
slug: "shopping-app-notifications-ios"
title: "Your phone's notification shade is somebody else's advertising space"
seoTitle: "Why shopping apps keep pushing notifications on iOS"
description: "Android lets you block an app's promotional notifications while keeping order updates. iOS doesn't give you that choice, and here's why."
published: 2026-10-26
category: "known-issue"
topics: ["ios", "android", "notifications"]
image: "/images/known-issue/shopping-app-notifications-ios.png"
imageAlt: "A billboard on a post, a checkerboard motif in one corner, wired to an open padlock, in cream linework on orange"
trigger: >-
  A week of grocery and food-delivery apps sending more sale pings than order
  updates was reason enough to go looking for the setting that silences the
  sales without silencing the orders. On iOS, there isn't one.
whoBenefits: >-
  Growth and marketing teams measured on notification opens, session counts
  and repeat orders. A promotional ping that gets tapped reads as a win on
  that dashboard, whether or not it made the app worth using.
operatorsRead: >-
  The issue was never that apps send too many notifications. It's that a
  notification can be a successful engagement metric while making the
  product worse to use. Both show up in the same weekly report, and only
  one of them gets read out loud.
sources:
  - label: "Android Developers"
    url: "https://developer.android.com/develop/ui/compose/notifications/channels"
  - label: "Apple Support"
    url: "https://support.apple.com/guide/iphone/change-notification-settings-iph7c3d96bab/ios"
  - label: "Grapevine"
    url: "https://www.grapevine.in/post/swiggy-vs-zomato-notifications-9b4d897c-3c9f-42ed-8720-e1dadf9cec33"
draft: false
---

You install a food delivery app to get dinner in thirty minutes. A few weeks later it's also telling you about a flash sale, a cashback offer, a new restaurant on the platform and a reminder that your cart has been sitting for two hours. None of that is why you opened the app, and on an iPhone, there's no clean way to keep the first kind and lose the rest.

A notification is an interruption, and interruptions can be measured. Every ping has an open rate, every open can be tied to a session, and every session can be tied back to a reorder or a cart. Once that chain exists in a dashboard, a notification stops being a courtesy and becomes a line a growth team is scored on. The useful alert (your order has left the restaurant) and the promotional one (biryani is 20% off right now) compete for the same channel, and only one of them has a team optimising for more of it.

[Android's notification channels](https://developer.android.com/develop/ui/compose/notifications/channels) require every app to sort its notifications into named groups, and each group gets its own on/off switch in system settings, what the Android interface itself calls "categories." An app can't post a notification without putting it in a channel, and once a reader turns a channel off, the system blocks it; the app can't quietly turn it back on. That's why [Swiggy and Zomato each ship a channel named for exactly what it is](https://www.grapevine.in/post/swiggy-vs-zomato-notifications-9b4d897c-3c9f-42ed-8720-e1dadf9cec33), Marketing and Promotions on one, Offers and Promotions on the other, and a reader who wants delivery alerts but not sale pings can switch off that one channel and keep the rest.

iOS has no equivalent. [Apple's own guidance](https://support.apple.com/guide/iphone/change-notification-settings-iph7c3d96bab/ios) describes notification settings as customised for each app, meaning the control sits one level up from where Android's does. You can turn an app's notifications fully on or fully off, route them into a Scheduled Summary instead of delivering them immediately, or change how they're grouped. None of that separates a shipping update from a sale. If the app itself hasn't built an in-app promotional toggle, and most haven't, or bury it several menus deep, the only working choice on iOS is mute the whole app or keep the whole app, catch included.

That's the known issue: not that these apps send too many notifications, but that the platform you're on decides whether you get to be selective about it. Android makes the selective version the default behaviour a developer has to opt into building. iOS makes it something a developer has to build on top of a system that doesn't ask for it, which is exactly the kind of extra work that loses to a product roadmap every time.
