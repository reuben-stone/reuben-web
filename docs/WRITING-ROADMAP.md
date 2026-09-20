# Writing Roadmap

Internal editorial planning document. Do not generate public pages for unpublished entries.

Every article is built around a clear question.

---

## AI / Software / Systems

### 01. The model is only one part of the system
**Question:** What does it actually take to turn AI into dependable software?
**Theme:** What rebuilding Artemis taught me about the software required around an AI model: context, state, tools, recovery, verification and human judgement.
**Status:** Published.

### 02. How much should we let AI do on its own?
**Question:** Where should autonomy stop and human judgement begin?
**Theme:** AI autonomy is not binary. Explore the spectrum: suggesting, preparing, asking, acting, acting and reporting. The appropriate amount of autonomy depends partly on the consequence of being wrong.

### 03. I left an AI system watching my software overnight
**Question:** What happens when AI moves from something you ask to something that notices?
**Theme:** Most AI interaction begins when a human prompts it. Explore the experiment behind making Artemis persistent: production signals, Sentry, GitHub, analytics, automatic investigation, Morning Review. Keep this grounded - do not imply capabilities that have not been demonstrated.

### 04. What does an AI actually remember?
**Question:** How can software appear to remember you when the model itself doesn't?
**Theme:** Explain AI memory in accessible language: conversation history, stored facts, summaries, retrieval, selected context, persistent application state. Broader question: how much does an AI need to remember before it begins to feel continuous?

### 05. When should AI admit it doesn't know?
**Question:** Why is uncertainty one of the hardest things to design into an AI product?
**Theme:** Models can produce plausible answers even when evidence is weak. Explore confidence, evidence, verification, uncertainty, product UX, human review. Focus on product design rather than abstract model theory.

### 06. Why I stopped trying to build a smarter AI agent
**Question:** When is it better to coordinate specialist tools than build one system that does everything?
**Theme:** Use the real Artemis Lite investigation experiment. The important decision was not another iteration of the agent - it was recognising the boundary. Artemis did not need to become the coding agent. It needed to know when to use one.

### 07. The most important AI button might be Approve
**Question:** Why might giving AI less authority make it more useful?
**Theme:** Human approval should not automatically be treated as a failure of automation. Explore situations where AI investigates, proposes, prepares, and the human decides. Use draft pull requests as one concrete example.

### 08. What happens when an AI makes a mistake while nobody is watching?
**Question:** How do you build software that can fail, recover and explain what happened?
**Theme:** Long-running AI systems create ordinary software reliability problems: partial failure, retries, duplicate actions, uncertain outcomes, recovery, audit trails. The reader should understand why these problems matter even without being an engineer.

### 09. Will software eventually start fixing itself?
**Question:** How close are we to software that can notice its own problems and prepare its own repairs?
**Theme:** Use Artemis as a grounded entry into self-monitoring and partially self-repairing software. Avoid science-fiction framing. Distinguish clearly between detecting, investigating, preparing a fix, verifying, publishing a proposal and deploying.

### 10. AI doesn't need to know everything about you
**Question:** How much personal context does an AI actually need to be useful?
**Theme:** More context is not automatically better. Explore privacy, relevance, selective memory, noise, personalisation, minimum useful context. Good context selection is more important than simply supplying everything available.

---

## Products / People / Design

### Accessibility isn't a score
**Question:** What does an automated accessibility score actually tell you, and what does it miss?
**Theme:** Draw from work on Lumi/Livana. Explain why automated scanning is useful but does not equal accessibility. Avoid turning the article into a Lumi advertisement.

### Why I made learning Japanese deliberately slower
**Question:** What if removing friction from learning sometimes makes the experience worse?
**Theme:** Draw from Doshi. Explore intentional friction: writing, recall, journaling, reflection, slower interaction. Not every successful product interaction needs to minimise effort or maximise speed.

---

## Editorial principles

- Articles should sound like a person who built something and then thought carefully about what happened.
- The intended audience is broader than engineers.
- Technical concepts should be explained through ordinary language and concrete examples.
- Every article should contain something learned through actual work rather than information that could have been generated from a generic AI prompt.
- The public Writing index remains one chronological feed. No public category pages until enough articles exist to justify them.
