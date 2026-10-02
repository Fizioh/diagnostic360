import { mcq } from "./helpers";

export const aiQuestions = [
  mcq(
    "ld-ai-01",
    "ai-engineering",
    "AI Engineering",
    "medium",
    {
      language: "python",
      filename: "tools.py",
      lines: [
        "@tool",
        "def fetch_url(url: str) -> str:",
        "    resp = requests.get(url, timeout=10)",
        "    resp.raise_for_status()",
        "    return resp.text[:8000]",
        "",
        "# url comes from model args based on user message",
      ],
      highlightLines: [2, 3, 4],
    },
    "User-supplied URLs in this tool create SSRF risk — what mitigation applies?",
    [
      "Allowlist outbound domains, block metadata IPs, sandbox egress, and validate tool args server-side",
      "Trust the model to refuse internal URLs because system prompts already describe acceptable targets",
      "Run tool handlers as root on the host so the kernel blocks connections to private network ranges",
      "Disable TLS verification on tool fetches so redirects to internal hosts fail fast with clear errors",
    ],
    0,
    "Tool egress must be constrained like any server-side fetch.",
    ["agent security", "SSRF", "tool calling"],
  ),
  mcq(
    "ld-ai-02",
    "ai-engineering",
    "AI Engineering",
    "hard",
    {
      language: "python",
      filename: "rag_answer.py",
      lines: [
        "def answer(query: str) -> str:",
        "    chunks = retriever.search(query, k=5)",
        "    prompt = build_prompt(query, chunks)",
        "    text = llm.complete(prompt, temperature=0.9)",
        "    return text  # includes bracket citations not tied to chunk ids",
      ],
      highlightLines: [3, 4, 5],
    },
    "RAG answers cite sources that do not match retrieved chunks — best quality improvement?",
    [
      "Raise sampling temperature so the model explores more phrasing and cites diverse retrieved chunks",
      "Ground answers with retrieval scores, require cited chunk matches, and log faithfulness evals on samples",
      "Remove retrieval entirely and rely on parametric knowledge so citations are no longer inconsistent",
      "Lengthen the system prompt with citation rules only, without measuring match quality in production",
    ],
    1,
    "Measured grounding + eval loops reduce unfaithful citations.",
    ["RAG", "hallucination", "evals"],
  ),
];
