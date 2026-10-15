import type { ArcEvent, InvestigationState } from "./investigation";

export function toolLabel(tool = "") {
  const names: Record<string, string> = {
    search_identity_exa: "Identity search", scrape_linkedin_profile: "LinkedIn profile",
    scrape_linkedin_posts: "LinkedIn posts", inspect_github_developer_profile: "GitHub profile",
    firecrawl_scrape: "Read website", get_file_contents: "Read repository file",
    AskUserQuestion: "Identity clarification", Agent: "Delegate source collection",
  };
  const name = tool.split("__").at(-1) || tool;
  return names[name] || name.replaceAll("_", " ");
}

export function provider(tool = "") {
  if (tool.includes("linkedin")) return "Apify";
  if (tool.includes("exa")) return "Exa";
  if (tool.includes("github")) return "GitHub";
  if (tool.includes("firecrawl")) return "Firecrawl";
  if (tool.includes("neo4j")) return "Neo4j";
  return "Claude";
}

export function toolResults(logs: ArcEvent[]) {
  return new Map(logs.filter((event) => event.tool_use_id &&
    ["tool.finished", "tool.failed"].includes(event.type)).map((event) => [event.tool_use_id!, event]));
}

export function activityLabel(state: InvestigationState) {
  if (state.connection === "reconnecting") return "Reconnecting to the event stream";
  if (state.prompts.length) return "Waiting for your answer";
  if (state.status === "starting") return "Starting investigation";
  if (state.status !== "running") return "";
  if (state.phase === "conversation") return "Answering from collected evidence";
  const results = toolResults(state.logs);
  const active = state.logs.filter((event) => event.type === "tool.started" && !results.has(event.tool_use_id || ""));
  if (active.length) return toolLabel(active.at(-1)?.tool);
  if (state.logs.some((event) => event.stage === "architecting")) return "Preparing the graph assessment";
  return "Agent reviewing sources and planning the next step";
}
