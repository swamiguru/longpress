---
slug: "smart-tv-ads-you-paid-for"
title: "Your TV spent its software budget on an ad business, and 2026 is where it stopped hiding it"
seoTitle: "Smart TV ads: 2026 stopped hiding the business"
description: "Hisense plays ads when you switch inputs. Roku rebuilt its home screen around them. Samsung and Google TV have been doing it quietly for three years."
published: 2026-11-05
category: "known-issue"
topics: ["smart-tv", "connected-tv", "advertising", "hardware"]
image: "/images/known-issue/smart-tv-ads-you-paid-for.png"
imageAlt: "A living-room television with a speaker cone replacing its screen, the remote still pointing at it from the sofa arm"
openSince: 2023
trigger: >-
  The living-room television has had ads in its system UI since 2023, when Samsung and Google TV began selling home-screen tiles. 2026 is when it stopped being subtle. In March, Hisense began playing a video ad whenever an HDMI input was switched. In July, Roku rebuilt its home screen so sponsored content comes first and apps come second. The direction is one way and has been one way for three years.
whoBenefits: >-
  Not the viewer. The CTV ad networks: Nexxen, which has publicly positioned itself as the programmatic partner for Hisense VIDAA inventory, and the OEM-owned ad businesses at Samsung, LG and Google. Panel margin is thin and getting thinner. The ad business is where that margin comes from now.
operatorsRead: >-
  Hardware companies with thin unit economics find a software business or go away. That is not controversial inside the industry, and it has not been for a decade. What is new is how little effort the TV makers now put into pretending otherwise. Roku's July update removed the layout customisation feature that let viewers hide ad rows, in the same release that moved sponsored content to the top. There is no plausible reading where that is accidental.
verdict: "skip"
verdictNote: >-
  Skip every current smart TV platform where ads can be avoided. Fire TV, Google TV, Roku, Hisense VIDAA (now Home OS) and current Samsung Tizen all run active ad businesses in system UI as of November 2026. A 2023-or-earlier LG or Sony panel paired with an Apple TV 4K is the cleanest escape. Apple TV's own home rail carries sports-league carriage promos, so this is relative, not absolute. Most other paths just move the ads from the TV to the box.
sources:
  - label: "Tom's Hardware (Hisense)"
    url: "https://www.tomshardware.com/tech-industry/big-tech/hisense-tvs-force-owners-to-watch-intrusive-ads-when-switching-inputs-visiting-the-home-screen-or-even-changing-channels-practice-infuriates-consumers-brand-denies-wrongdoing"
  - label: "Kotaku (Roku July update)"
    url: "https://kotaku.com/its-not-just-you-everyone-is-mad-at-rokus-horrible-update-2000714762"
  - label: "Android Authority"
    url: "https://ccstartup.com/blog/2026/03/11/this-smart-tv-brand-crossed-a-big-line-with-its-absurd-ad-antics/"
  - label: "Lavx News (VIDAA)"
    url: "https://news.lavx.hu/article/hisense-vidaa-tvs-now-force-unskippable-ads-before-live-tv"
  - label: "Digitrendz"
    url: "https://digitrendz.blog/?p=217574"
  - label: "Trusted Reviews (Samsung)"
    url: "https://www.trustedreviews.com/news/ads-invade-samsung-s-smart-tvs-and-people-aren-t-happy-2948256"
draft: false
---

There's a video on a Hisense owner's forum thread from March showing someone switching the input from a Nintendo Switch to their cable box. Before the cable box signal comes through, a brand ad plays. Not after the HDMI handshake. Before. [Tom's Hardware walked through the forum posts](https://www.tomshardware.com/tech-industry/big-tech/hisense-tvs-force-owners-to-watch-intrusive-ads-when-switching-inputs-visiting-the-home-screen-or-even-changing-channels-practice-infuriates-consumers-brand-denies-wrongdoing) in detail; Hisense called it a "regional spot test," a phrase the company has used for the better part of this year while the behaviour spread to more markets.

Then in July, Roku pushed out the home-screen update everyone remembers, the one that put sponsored content above the user's own apps and [quietly removed the setting](https://kotaku.com/its-not-just-you-everyone-is-mad-at-rokus-horrible-update-2000714762) that used to let you hide ad rows. The option to go back is simply not in the UI anymore. In the same patch cycle, Hisense's VIDAA platform, now [rebranded to Home OS](https://news.lavx.hu/article/hisense-vidaa-tvs-now-force-unskippable-ads-before-live-tv), started playing a mandatory pre-roll before you can open live TV at power-on.

None of this started in 2026. Samsung has been [selling home-screen ad tiles since 2016](https://www.trustedreviews.com/news/ads-invade-samsung-s-smart-tvs-and-people-aren-t-happy-2948256), and they've expanded on roughly the same gradient every year since: into system menus by 2020, into third-party app frames like Plex by 2023, and past the point of politely hideable sometime in the last eighteen months. Google TV has run through a half-dozen home-screen experiments on the same slope. The direction hasn't changed in three years, and none of the three major platforms has reversed a single one.

The reason this is happening is the one you'd guess. Panel margins have been thin for most of this decade and they are still getting thinner, and software is where television companies make money now. Nexxen, the ad-tech firm, markets itself in investor decks as the programmatic partner for VIDAA inventory. Samsung Ads and LG Ads are disclosed line items on their respective earnings calls. The ad business isn't a side project any more. It's the business.

The India shelf runs the same stack with different labels on it. Hisense is a top-five seller here and VIDAA/Home OS ships with every unit. OnePlus TV, Mi TV and Realme TV are on Android TV, which means they inherit whichever Google TV ad surfaces are current. The one Indian-market holdout has been Vu, whose launcher has stayed sparse; the next refresh is reportedly moving to Android TV, too.

Three workarounds get recommended whenever this comes up on Reddit and in the Indian AV forums. None of them actually hold. Swapping the Android TV launcher works until the next OTA, which re-points the home key back at Google's default. DNS-level blocklists through Pi-hole or NextDNS work until the ad network moves to the manufacturer's own subdomain, which has already happened on VIDAA. Factory reset returns the TV to a cleaner state briefly; the ads come back on the first reconnect. The thing to understand is that the platform runs on the manufacturer's server, and the TV just shows whatever that server sends.

What works is less fun. A pre-2024 LG or Sony panel, bought used or refurbished, has a sparse enough system UI that ads are a non-issue in practice. Pair it with an Apple TV 4K, which is the streaming box where ad surfaces have been slowest to expand. Its TV app home rail does now carry MLS and F1 carriage promos, so this is relative, not absolute. Fire TV, Google TV and Roku all run active and growing ad businesses in their boxes, so swapping one of those in doesn't help.

A true "dumb" TV is a harder ask. The consumer channel in India has essentially stopped stocking them; the working alternative is a commercial signage display from LG's B2B line or Samsung's, which is more expensive and has worse motion handling and scaling, but is honest about what it is and does not phone home.

The smart TV business, as it is actually run in 2026, is a channel business that happens to show your Netflix. That's not an opinion a single buyer can argue them out of. It's how the money moves, and until the money moves differently, this is what the shelves will carry.
