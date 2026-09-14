---
slug: "tensor-g6-speed-gap"
title: "Six Tensor chips in, Google still hasn't closed the gap on Qualcomm, Apple and MediaTek Dimensity"
description: "The Tensor G6 was built to finally close the speed gap. It still trails Snapdragon, Apple and MediaTek Dimensity, all by double digits."
published: 2026-09-14
category: "known-issue"
topics: ["google", "tensor-g6", "pixel-11", "chips"]
trigger: >-
  Every Tensor chip since 2021 has trailed Qualcomm's flagship on raw speed. The G6, in the Pixel 11 that shipped August 12, was the generation built to finally close that gap. It didn't.
whoBenefits: >-
  A fully custom GPU core, the kind Apple has funded for over a decade, costs hundreds of millions of dollars and years to get right. Licensing a five-year-old Imagination design and tuning it for power draw is dramatically cheaper, and Pixel still sells in the low single digits of global market share each generation. The savings show up as margin, not as a lower price. The Pixel 11 Pro XL costs $100 more than last year's model for the same storage. The chip that doesn't have to win benchmarks is also the chip Google doesn't have to fund like one.
operatorsRead: >-
  Spending the chip budget on the software paths users actually touch, Call Screen, Magic Eraser, Recorder, instead of chasing a Geekbench number nobody outside a spec sheet reads, is a defensible roadmap call. Reusing a five-year-old GPU architecture and shipping it as new is a different decision, and it's the one that should have been called out in review before launch, not left for reviewers to find in a benchmark database.
verdict: "wait"
verdictNote: >-
  Wait if raw speed or gaming is why you're considering flagship money. The GPU is licensed, five-year-old architecture; there's no software update coming that fixes that mid-cycle, so waiting here means waiting for the G7, not for a patch. If Google's on-device AI features are what you're actually after, don't wait for those: Magic Eraser, Call Screen and Recorder already work well regardless of this gap.
draft: false
---

Google has shipped six generations of its own phone chip since 2021, and every one of them has lost the basic speed test to whatever Qualcomm, Apple and others were selling that year. The Tensor G6 was supposed to be the one that changed that. It's Google's second chip built entirely at TSMC, on the same 3-nanometer process Apple and Qualcomm use, after four generations built at Samsung's foundry. Google framed the foundry switch as the fix.

The numbers say otherwise. On Geekbench 6, the Tensor G6 scores 2,671 on a single core and 6,802 across all of them. Qualcomm's Snapdragon 8 Elite Gen 5, in phones like the Galaxy S26 Ultra, beats that by about 39 percent on single-core and 67 percent on multi-core. Apple's A19 Pro, in the iPhone 17 Pro, is ahead by about 11 percent on both counts. MediaTek's Dimensity 9500 leads by 23 percent single-core and 51 percent multi-core. On AnTuTu, the gap on the GPU side alone runs past 260 percent against Snapdragon. Some of that is the CPU: the G6 uses ARM's off-the-shelf Cortex C1-Ultra and C1-Pro cores rather than a custom design, the same approach most mid-range Android chips take. The bigger problem is the GPU. The Tensor G6 ships with an Imagination PowerVR chip that Google has confirmed is a modified version of Imagination's CXT architecture from 2021. The modification adds power efficiency, but sadly, it does not add speed.

That's a trade Google is allowed to make, and it isn't the wrong one. Apple ran a similar playbook in its early iPhone generations before it started designing GPU cores in-house. And on the tasks Google tunes for its own hardware, the software genuinely holds up: Magic Eraser, Call Screen, the Recorder app's live transcription, and Gemini Nano's on-device features all run well on Tensor, because Google is optimizing one narrow path end to end instead of chasing a general benchmark. Spending a limited chip budget on the features people actually touch, instead of a number on a spec sheet, is a defensible call. Credit to Google's engineers for that: they've fine-tuned the software well around an underpowered SoC.

Where Google is wrong is letting that story cover for the GPU specifically. Reusing five-year-old graphics architecture and marketing the result as new, while charging more for it, is the kind of gap between the pitch and the part that this column exists to point at. The Pixel 11 Pro XL launched at $1,299, up $100 from the Pixel 10 Pro XL's $1,199 at the same storage tier. The base Pixel 11 also costs $100 more than last year's base Pixel 10, though it doubles the storage to 256GB, so that comparison isn't as clean. The Pro XL one is: same tier, same storage, $100 more, for a GPU built on five-year-old bones.

TSMC's process got Tensor onto the same node Apple and Qualcomm use, and the CPU and GPU gap barely moved. So the bottleneck was never the fab. Apple's real advantage over Qualcomm and everyone else is a decade of custom core design it funded before it had to. Google would need to make that same bet on the GPU cores it currently licenses, and hold it for more than one generation, before Tensor's raw numbers stop trailing a chip that costs less to build.

*Disclosure: I've been using a Pixel 11 Pro XL since launch.*
