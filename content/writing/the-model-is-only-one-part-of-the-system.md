---
title: "The model is only one part of the system"
question: "What does it actually take to turn AI into dependable software?"
description: "What rebuilding Artemis taught me about context, tools, state, recovery and where AI reasoning should stop."
excerpt: "Rebuilding Artemis changed the question from what the model could do to what the software around it needed to control."
slug: "the-model-is-only-one-part-of-the-system"
datePublished: "2026-09-20"
dateModified: "2026-09-20"
published: true
topics:
  - AI Systems
  - Engineering
relatedWork:
  - title: "Artemis"
    url: "/work/artemis/"
    label: "AI Systems Engineering Case Study"
---

When I first started building Artemis, the exciting part was giving the model things it could actually do.

Artemis began as a desktop system that sat above the software projects I was working on. It could understand multiple repositories, inspect their state, remember previous conversations, pull in production information and delegate engineering work to autonomous workers.

Those workers operated in isolated copies of a repository, made changes, ran checks and returned pull requests for me to review.

It felt like a significant step beyond using an AI assistant in a chat window. The model wasn't just answering questions about my work. It was participating in it.

And it worked.

That turned out to be the beginning of the interesting part.

## Capability was surprisingly easy

Modern language models are remarkably easy to make look capable.

Give a model access to a file system and it can read code. Give it a search tool and it can investigate a project. Give it access to Git and it can inspect changes. Connect a few more services and suddenly it appears to understand a meaningful part of your working environment.

The first version of Artemis accumulated these capabilities quickly.

Every new tool made the system more useful, but it also made the environment around the model more complicated.

- What information should it see?
- What should it remember?
- What happens if a tool fails halfway through a task?
- What happens if the application closes?
- If the model attempts an external action and the connection disappears, did that action happen or not?
- Which decisions should the model actually be allowed to make?

I gradually realised that I was spending less time thinking about what the model could do and more time thinking about everything surrounding it.

That became the starting point for Artemis Lite.

## A smaller system to answer a bigger question

I didn't build Lite because the original Artemis had failed.

I built it because Artemis had become capable enough to expose a more useful question:

> How much of an AI system actually needs to be AI?

The easiest architecture is to give a model a collection of tools, provide a large amount of context and let it decide what to do next.

That can be extremely powerful.

It's also inherently unpredictable.

The same flexibility that makes a language model useful means it isn't the component I want deciding everything about the lifecycle of a piece of work.

So Lite started from a deliberately simple principle:

> Deterministic shell. Probabilistic core.

In plain English: use the model for the things models are good at, and ordinary software for everything that doesn't need a model.

A model can be excellent at interpreting an ambiguous error, understanding unfamiliar code or deciding which piece of evidence is worth investigating next.

It doesn't need to decide whether a workflow has been saved correctly.

It doesn't need to remember whether an approval has already happened.

It shouldn't be responsible for preventing the same production problem from creating five identical pieces of work.

And it certainly shouldn't be given unrestricted authority to merge code or deploy software simply because it believes its answer is correct.

Those are software problems. We already know how to solve them.

## The context problem

One of the first things I looked at was context.

There is a temptation when building with language models to assume that more information is better. If the model might need something, put it in the prompt.

Artemis had gradually moved in that direction. Memory, repository information, conversation history and tool results could all accumulate around a task.

Lite made me treat context more like an engineering resource.

Instead of asking *"What information can I give the model?"* I started asking *"What is the minimum information it needs to make this particular decision well?"*

That sounds like a small distinction, but it changes the architecture.

A production error doesn't necessarily require the history of an entire project. A decision about which repository to inspect doesn't require every file in that repository. A verification step doesn't need to know everything that happened during the investigation.

Each stage can receive the information relevant to that stage.

This makes the system cheaper and easier to understand, but more importantly it makes failures easier to reason about.

When something goes wrong, I can ask a much more useful question: *Did the model see the right things?*

## Then a real bug broke my neat architecture

The most useful lesson came when I stopped testing the architecture with tidy examples.

Lumi, an accessibility product I'm building, reported a real production error through Sentry.

It wasn't particularly dramatic. A browser API was rejecting a string because one of its characters couldn't be represented in the format it expected.

But it was real, which made it useful.

I gave the problem to Artemis Lite.

The system gathered a bounded amount of context and attempted to investigate it. It failed.

So I improved the discovery tools and tried again. It got further, but the fixed investigation plan wasn't flexible enough.

I added a bounded adaptive loop so the model could decide what evidence it needed next. That was better. It still failed to establish the root cause before reaching its iteration limit.

At first this looked like another problem to solve inside Artemis.

Then I realised what I was actually doing.

I was slowly building a coding agent.

## Knowing what not to build

This was probably the most valuable architectural decision in the project.

There are already specialist systems that are extremely good at navigating repositories, understanding code, editing files and iterating on engineering problems.

Rebuilding all of that inside Artemis wouldn't make Artemis more sophisticated. It would make it responsible for something it didn't need to own.

So I changed the boundary.

> Artemis did not need to become the coding agent. It needed to know when to use one.

For substantial repository work, Artemis now delegates the specialist investigation to an execution system such as Claude Code.

That doesn't make Artemis redundant. It clarifies its job.

Artemis knows *why* the work exists. It knows which product the production signal belongs to. It knows which repository represents that product. It knows whether the same problem has already been investigated. It creates and persists the workflow. It defines the execution boundaries. It records what happened. It independently checks the result. And it decides whether the outcome is ready to become a draft pull request for human review.

The coding agent can disappear when its task finishes.

The surrounding system cannot.

## Failure is part of the product

This distinction becomes particularly important when AI systems begin doing work that lasts longer than a single request.

Imagine Artemis notices a production problem overnight. It creates an investigation, starts a specialist worker and the worker changes some code. Then the application crashes.

When it starts again, *"just ask the model what to do"* isn't a particularly reassuring recovery strategy.

The system needs to know what had already happened.

Likewise, imagine an external service times out while Artemis is creating a pull request. There are two possibilities: the request failed before the pull request was created, or the pull request was created but Artemis never received the response.

Blindly retrying can now create duplicate work.

This isn't really an AI problem.

It's the same kind of problem engineers have dealt with for years in payment systems, job queues, distributed applications and other software where actions have consequences.

AI doesn't remove those problems. If anything, giving models tools makes them more important.

> A useful AI product needs to be designed not only around what happens when the model succeeds, but around what happens when everything around it doesn't.

## A pull request is not proof that the model was right

Another distinction emerged during the real Lumi investigation.

Eventually, the specialist agent correctly identified the likely cause and prepared a very small fix.

Artemis could independently observe the files that had changed and run the project's verification steps.

But some of those repository-level checks were not clean for that project configuration.

That created an important distinction: the investigation succeeded. That did not automatically mean the fix was verified.

Those two states shouldn't be collapsed simply because the model sounds confident.

The result could still be useful. Artemis could explain what it had found, preserve the proposed change and expose the actual verification results. What it couldn't legitimately say was: *this is definitely ready for production.*

That's why the end of this workflow is a draft pull request. A draft pull request is a proposal. I still make the consequential decision.

## The complete loop

Eventually I ran the original Lumi production issue through the redesigned system again.

This time the journey looked very different.

A real production error entered Artemis from Sentry. Artemis worked out which product and repository it belonged to, created a durable workflow and assembled the relevant context. It delegated the repository investigation to Claude Code in an isolated working environment. When that work finished, Artemis independently observed the changes, ran verification, stored the result and carried the proposed work through to a draft pull request for review.

The interesting part wasn't the bug.

The interesting part was everything around the model.

The production signal, workflow state, specialist delegation, verification and review boundary all existed outside the conversation with the model.

> The model was an important component. It wasn't the system.

## What this changed for me

AI development can easily become centred on model capability. Which model is smarter? How large is its context window? Which tools can it call? How autonomous can we make it?

Those questions matter, but I've become much more interested in a different set of questions.

What should the model be responsible for?

What should ordinary software be responsible for?

What happens when either one fails?

What evidence do we keep?

Where does human judgement belong?

And can somebody understand why the system did what it did after the fact?

These questions aren't as visually impressive as watching an agent operate a computer.

But I think they're much closer to the questions that determine whether an AI feature becomes useful software.

---

The lesson from rebuilding Artemis wasn't that models need more tools or more autonomy.

It was almost the opposite.

The model is only one part of the system. The interesting engineering begins when you decide what belongs around it.
