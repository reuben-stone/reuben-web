# Training Modules Roadmap

Internal planning doc. Not published.

## Live modules

1. **AI Reliability Principles** - prompts, rules, tests, evals, guardrails, feedback loop
2. **Evals in Depth** - datasets, graders, rubrics, regression suites, model-as-judge
3. **Context Engineering & Memory** - context selection, token budgets, memory patterns
4. **Tool Use & Structured Outputs** - tool design, structured generation, validation boundaries
5. **Agent & Workflow Architecture** - state machines, delegation, durable execution
6. **Failure Recovery & Idempotency** - bounded retries, idempotency, crash recovery, graceful degradation

## Future modules

### 07 - RAG & Retrieval Patterns
- Embedding models and vector search
- Chunking strategies and their trade-offs
- Hybrid search (keyword + semantic)
- Retrieval quality evaluation
- When RAG vs fine-tuning vs long context
- Artemis connection: less directly grounded in current Artemis work, more "how I'd approach it"

### 08 - Observability & Tracing
- Tracing multi-step agent workflows
- What to log: inputs, outputs, latencies, token usage, tool calls, state transitions
- Structured logging for AI systems
- Alerting on quality degradation vs traditional error alerting
- Connecting traces to eval results
- Artemis connection: workflow state transitions are naturally traceable

### 09 - Latency & Cost Optimisation
- Token usage as a cost lever
- Model selection per task (smaller models for simpler steps)
- Caching strategies (prompt caching, result caching)
- Parallel vs sequential tool calls
- Streaming and perceived latency
- When to optimise vs when to accept the cost

### 10 - Human-in-the-Loop & Product UX
- Approval gates as UX, not just guardrails
- Showing AI confidence/uncertainty to users
- Progressive disclosure of AI reasoning
- When to automate fully vs keep humans in the loop
- Designing for AI failure from the user's perspective

### 11 - Security & Trust Boundaries
- Prompt injection and indirect prompt injection
- Least-privilege tool access
- Sandboxing model-generated code
- Data boundaries (what the model should never see)
- Audit trails for AI actions
- Trust boundaries between agents in multi-agent systems
