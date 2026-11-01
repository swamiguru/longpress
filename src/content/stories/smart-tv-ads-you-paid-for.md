---
slug: "smart-tv-ads-you-paid-for"
title: "Your TV spent its software budget on an ad business, and 2026 is where it stopped hiding it"
seoTitle: "Smart TV ads: 2026 stopped hiding the business"
description: "Hisense plays ads when you switch inputs. Roku rebuilt its home screen around them. Samsung and Google TV have been doing it quietly for three years."
published: 2026-11-01
category: "known-issue"
topics: ["smart-tv", "connected-tv", "advertising", "hardware"]
image: "/images/known-issue/smart-tv-ads-you-paid-for.png"
imageAlt: "A living-room television with a speaker cone replacing its screen, the remote still pointing at it from the sofa arm"
openSince: 2023
trigger: >-
  The living-room television has had ads in its system UI since 2023, when Samsung and Google TV began selling home-screen tiles. 2026 is when it stopped being subtle. In March, Hisense began playing a video ad whenever an HDMI input was switched. In July, Roku rebuilt its home screen so sponsored content comes first and apps come second. The direction is one way and has been one way for three years.
whoBenefits: >-
  Not the viewer. The CTV ad networks: Nexxen, which has publicly positioned itself as the programmatic partner for Hisense VIDAA inventory, and the OEM-owned ad businesses at Samsung, LG and Google. Panel margin is thin and getting thinner. Software monetisation pays the margin now, and the TV's role in the business model has shifted from object sold to channel operated.
operatorsRead: >-
  Hardware companies with thin unit economics find a software business or go away. That is not controversial inside the industry, and it has not been for a decade. What is new is how little effort the TV makers now put into pretending otherwise. Roku's July update removed the layout customisation feature that let viewers hide ad rows, in the same release that moved sponsored content to the top. There is no plausible reading where that is accidental.
verdict: "skip"
verdictNote: >-
  Skip every current smart TV platform where ads can be avoided. Fire TV, Google TV, Roku, Hisense VIDAA (now Home OS) and current Samsung Tizen all run active ad businesses in system UI as of November 2026. A 2023-or-earlier LG or Sony panel paired with an Apple TV 4K is the one reliable escape; most other paths just move the ads from the TV to the box.
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

The moment that gets talked about began [in March 2026](https://ccstartup.com/blog/2026/03/11/this-smart-tv-brand-crossed-a-big-line-with-its-absurd-ad-antics/), when Hisense viewers in several countries started reporting that switching an HDMI input, from a Nintendo Switch to a cable box, say, triggered a video ad before the new input showed up. In some cases, changing channels did the same thing. [Tom's Hardware walked through the evidence](https://www.tomshardware.com/tech-industry/big-tech/hisense-tvs-force-owners-to-watch-intrusive-ads-when-switching-inputs-visiting-the-home-screen-or-even-changing-channels-practice-infuriates-consumers-brand-denies-wrongdoing) in the brand's own user forums. Hisense called it a "regional spot test." That phrase has done a lot of work this year.

In July, Roku pushed a home-screen rewrite so that sponsored content now sits above the user's own apps, and [removed the layout control](https://kotaku.com/its-not-just-you-everyone-is-mad-at-rokus-horrible-update-2000714762) that previously let viewers push ad rows out of sight. The option to go back is simply not in the UI. Separately, Hisense's VIDAA platform, [rebranded to Home OS](https://news.lavx.hu/article/hisense-vidaa-tvs-now-force-unskippable-ads-before-live-tv), began playing a mandatory ad before you can access live TV at power-on.

None of this is the first version. Samsung has been selling home-screen ad tiles [since 2016](https://www.trustedreviews.com/news/ads-invade-samsung-s-smart-tvs-and-people-aren-t-happy-2948256), and expanded them steadily until 2023, when the ads moved into system menus and began appearing inside third-party apps like Plex. Google TV has rolled through a half-dozen home-screen experiments, each one slightly more aggressive than the last. The direction of travel has not changed and has not reversed, at any of the three major platforms, for about three years running.

The business reason is not a mystery. Panel margin in televisions has been thin for most of this decade and is getting thinner. Software monetisation is where the money sits now; Nexxen, the ad-tech firm, publicly markets itself as the programmatic partner for VIDAA inventory, and the equivalent businesses at Samsung, LG and Google are each worth real money on their respective P&Ls. The TV is no longer the object sold. It is the channel operated.

In India this plays through the same stack with the brands reshuffled. Hisense is a top-five seller here, VIDAA/Home OS and all. OnePlus TV, Mi TV, and Realme TV run Android TV, which means they inherit Google TV's ad surfaces. The one Indian-market exception has been Vu, which runs a sparser launcher, and whose next model refresh is reportedly moving to Android TV. The direction is the same; the shelves are catching up.

Three workarounds get recommended routinely and none of them hold. Changing the launcher on Android TV works until the next OTA, which can re-point the home key at Google's own home screen. DNS-level blocklists via Pi-hole or NextDNS work until the ad network moves to the TV manufacturer's own domain, which is already happening on VIDAA. Factory reset returns the TV to a cleaner home screen, briefly: the ads come back on the first reconnect to the network. The platform runs on a server; the TV just displays what the server sends.

What actually works is unglamorous. A pre-2024 LG or Sony panel, bought used or refurbished, has clean enough system UI that ads are a non-issue. Pair it with an Apple TV 4K, which is the one streaming box in the Indian market where ad surfaces have not expanded. Fire TV, Google TV and Roku all have active and growing ad businesses in their boxes. If a true "dumb" TV is what you want, India has essentially stopped selling them in the consumer channel; the closest working alternative is a commercial signage display from LG or Samsung's B2B lines, which is more expensive and has worse scaling but is honest about what it is.

The known issue is that the smart TV business, as it currently stands, is in the business of selling your attention before it is in the business of being a television. That is not an opinion a single viewer can argue the industry out of. It is a settled fact of how these companies make money in 2026.
