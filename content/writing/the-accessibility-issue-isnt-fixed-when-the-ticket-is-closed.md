---
title: "The accessibility issue isn't fixed when the ticket is closed"
question: "What gets lost when a person's difficulty becomes a data point in a tracking system?"
description: "How building accessibility software changed the way I think about the distance between an issue tracker and the person behind the issue."
excerpt: "Building Lumi has made me think more about the gap between closing a ticket and actually removing a barrier."
slug: "the-accessibility-issue-isnt-fixed-when-the-ticket-is-closed"
datePublished: "2026-09-21"
dateModified: "2026-09-21"
published: true
topics:
  - Accessibility
  - Product Engineering
relatedWork:
  - title: "Lumi"
    url: "https://lumi.livana.io"
    label: "Accessibility Intelligence Platform"
---

One slightly uncomfortable thing about building accessibility software is how much time you spend turning people's difficulties into data.

A contrast problem becomes a ratio. A missing label becomes a rule violation. Something that genuinely prevents a person from completing a task becomes an issue with a severity, a category, and eventually a status of `fixed`.

I've been building [Lumi](https://lumi.livana.io) for a while now, and this is basically what the software does. It takes accessibility problems and represents them in a way that engineering teams can work with. A problem needs a rule to match against. It needs to point to a specific element. It gets a status. It might become a Jira ticket. Eventually somebody changes some code and marks it done.

That process is necessary. I'm not questioning whether we should do it.

But spending this much time designing how problems get represented has made me notice the distance between the representation and the thing it's supposed to represent.

## What an engineer sees

Take a contrast issue. A scanner finds it and reports something like:

`Text contrast ratio is 3.2:1. Expected minimum: 4.5:1.`

That's useful. It tells a developer exactly what to fix and gives them a number to hit. It's the kind of finding that can go straight into a ticket, get assigned, and be resolved in the same sprint.

But the person using the product didn't encounter a ratio. Depending on their vision, their screen, the lighting in the room, they encountered text that was difficult to read. Maybe they managed. Maybe they gave up and tried something else. The ratio is a way of describing the problem that makes it actionable for an engineer. It isn't the problem itself.

Or take a keyboard issue. A team might see:

`Interactive element is not keyboard accessible.`

That's a clear defect. Someone navigating without a mouse reached a point in the interface where they simply couldn't continue. The audit finding describes a technical gap. The experience was a closed door.

I keep thinking about this because both descriptions are true at the same time. The engineering representation isn't wrong. But it's an abstraction, and abstractions always leave things out. That's what makes them useful, and it's also what makes them dangerous if you forget they're abstractions.

## I'm part of this

I should be clear that I'm not writing this from some position outside the problem.

I like things becoming measurable. A shrinking issue count feels like progress. A clean verification result feels satisfying. Moving something to `fixed` feels good. I've caught myself looking at Lumi's output and instinctively reading the numbers as the outcome, rather than a signal about the outcome.

Sometimes the numbers genuinely do reflect improvement. If a page had twelve contrast failures last month and zero this month, and the fixes were done well, then the experience is probably better for people who need that contrast.

But "probably better" is doing some work in that sentence. The count went down. Whether the barriers actually went away depends on things the count doesn't capture.

## Tickets are good, actually

I want to be careful here because I don't think any of this is an argument against tracking systems, automated scanners, WCAG, or dashboards.

Standards give teams a shared way of talking about accessibility. Without something like WCAG, every conversation about contrast or keyboard access would start from scratch.

Automated checks find real problems quickly, repeatedly, across large surfaces. A scanner will catch the same categories of issue at three in the morning across hundreds of pages without getting tired or distracted. That matters.

Tickets give somebody ownership. An accessibility finding that doesn't become work rarely becomes a fix.

Verification provides evidence that a change actually had the intended effect. And tracking regressions matters because products keep changing. The thing you fixed in March can quietly break again in June when someone redesigns the navigation.

The workflow I've become most interested in while building Lumi looks roughly like: find the issue, understand what it means for someone using the product, fix it, verify the fix, and keep it fixed. None of those steps is optional, and the tracking system supports all of them.

The bit I keep coming back to is that the tracking system is there to support the work. It isn't the work.

## Proxies

This probably interests me partly because it's a pattern I recognise from other areas of engineering.

We work through proxies constantly. Test coverage is not the same thing as confidence in the code. An uptime percentage is not quite the same thing as someone being able to complete what they came to do. A performance score is not exactly the same thing as a site feeling fast to use.

These proxies are useful precisely because they're measurable when the underlying thing isn't. I can't easily measure how confident I should be in a codebase, but I can measure which code paths are exercised by tests. That's worth knowing.

The pattern is the same with accessibility. I can't directly measure whether a product is accessible, because accessibility isn't a single binary state. It depends on who is using the product, how, in what circumstances, and with what tools. But I can measure whether specific, known barriers exist. That's worth measuring.

The risk in all these cases is treating the proxy as the goal. Not deliberately, usually. It just happens gradually. The metric is right there on the dashboard, and the underlying experience isn't.

## What fixed should mean

I keep noticing that the status `fixed` is doing a lot of work in most accessibility workflows.

An issue gets found. Someone changes some code. The issue gets marked as resolved. That's the happy path, and it's how most of the work gets done.

But `fixed` can mean different things. It can mean the code changed. It can mean a scanner no longer flags the issue. Or it can mean there's good reason to believe the barrier that caused the issue is no longer there for the person who would have encountered it.

Those aren't always the same thing.

I don't think most teams are being careless when they close an accessibility ticket. They're working within the system they have. The system gives them a finding, they address the finding, they close the ticket. That's reasonable.

I've just been thinking about what it would take for `fixed` to carry a bit more weight. Verification helps. Understanding why the issue mattered, not just what the rule said, helps. And building systems that notice when the same problem comes back helps, because it often does.

None of this is a framework or a methodology. It's more of a question I keep sitting with while building the software. What would it mean for the tools to keep the person a bit more visible, even while doing the necessary work of turning their experience into something an engineering team can act on?

I don't have a complete answer. But I think the question is worth spending time with.
