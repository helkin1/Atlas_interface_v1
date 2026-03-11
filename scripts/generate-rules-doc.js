#!/usr/bin/env node

// ============================================================
// generate-rules-doc.js — Generates docs/RULES_AND_ASSUMPTIONS.md
// from the rules knowledge base.
//
// Usage: node scripts/generate-rules-doc.js
// ============================================================

import { getAllRules, getRulesByConfidence } from "../src/data/rules-knowledge-base.js";
import { writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const OUTPUT = join(__dirname, "..", "docs", "RULES_AND_ASSUMPTIONS.md");

const rules = getAllRules();

// Group by category
const categories = {};
rules.forEach((r) => {
  if (!categories[r.category]) categories[r.category] = [];
  categories[r.category].push(r);
});

const CATEGORY_LABELS = {
  volume: "Volume Landmarks",
  progression: "Progression Thresholds",
  deload: "Deload Parameters",
  readiness: "Readiness Score",
  adherence: "Volume Adherence",
  trends: "Strength Trends",
  contribution: "Contribution Weights",
  insights: "Insight Milestones & Detection",
  plan: "Plan Engine",
};

const CONFIDENCE_LABELS = {
  researched: "Researched (peer-reviewed / RCT / meta-analysis)",
  expert_consensus: "Expert Consensus (multiple recognized experts)",
  placeholder: "Placeholder (needs research validation)",
};

const SOURCE_TYPE_LABELS = {
  meta_analysis: "Meta-Analysis",
  rct: "Randomized Controlled Trial",
  peer_reviewed: "Peer-Reviewed Study",
  textbook: "Published Textbook",
  expert_recommendation: "Expert Recommendation",
  coaching_standard: "Coaching Standard",
};

// Build markdown
let md = "";

md += "# Atlas Rules & Assumptions\n\n";
md += "> **Auto-generated** by `node scripts/generate-rules-doc.js`\n";
md += `> Generated: ${new Date().toISOString().split("T")[0]}\n\n`;
md += "This document lists every configurable value used by Atlas intelligence engines, ";
md += "along with its rationale, source citations, and confidence level.\n\n";

// Summary table
md += "## Summary\n\n";
md += "| Category | Rules | Researched | Expert Consensus | Placeholder |\n";
md += "|---|---|---|---|---|\n";
Object.entries(categories).forEach(([cat, catRules]) => {
  const r = catRules.filter((x) => x.confidence === "researched").length;
  const e = catRules.filter((x) => x.confidence === "expert_consensus").length;
  const p = catRules.filter((x) => x.confidence === "placeholder").length;
  md += `| ${CATEGORY_LABELS[cat] || cat} | ${catRules.length} | ${r} | ${e} | ${p} |\n`;
});
const total = rules.length;
const totalR = getRulesByConfidence("researched").length;
const totalE = getRulesByConfidence("expert_consensus").length;
const totalP = getRulesByConfidence("placeholder").length;
md += `| **Total** | **${total}** | **${totalR}** | **${totalE}** | **${totalP}** |\n\n`;

// Per-category sections
Object.entries(categories).forEach(([cat, catRules]) => {
  md += `---\n\n## ${CATEGORY_LABELS[cat] || cat}\n\n`;

  catRules.forEach((rule) => {
    md += `### ${rule.description}\n\n`;
    md += `- **ID:** \`${rule.id}\`\n`;
    md += `- **Confidence:** ${CONFIDENCE_LABELS[rule.confidence] || rule.confidence}\n`;
    md += `- **Last Reviewed:** ${rule.lastReviewed || "Not yet reviewed"}\n`;

    // Values
    md += `- **Values:**\n`;
    const vals = rule.values;
    if (typeof vals === "object" && !Array.isArray(vals)) {
      Object.entries(vals).forEach(([k, v]) => {
        if (typeof v === "object" && !Array.isArray(v)) {
          md += `  - ${k}: ${JSON.stringify(v)}\n`;
        } else if (Array.isArray(v)) {
          md += `  - ${k}: [${v.join(", ")}]\n`;
        } else {
          md += `  - ${k}: ${v}\n`;
        }
      });
    }

    md += `\n**Rationale:** ${rule.rationale}\n\n`;

    if (rule.notes) {
      md += `**Notes:** ${rule.notes}\n\n`;
    }

    if (rule.sources.length > 0) {
      md += `**Sources:**\n`;
      rule.sources.forEach((s) => {
        const typeLabel = SOURCE_TYPE_LABELS[s.type] || s.type;
        md += `- ${s.ref} (${typeLabel}, ${s.year})`;
        if (s.url) md += ` — [link](${s.url})`;
        md += `\n`;
      });
      md += "\n";
    }
  });
});

// Research backlog
md += "---\n\n## Research Backlog\n\n";
md += "The following rules are currently set to **placeholder** confidence and need research validation:\n\n";
const placeholders = getRulesByConfidence("placeholder");
placeholders.forEach((r) => {
  md += `- [ ] \`${r.id}\` — ${r.description}\n`;
});
md += "\n";

// Legend
md += "---\n\n## Legend\n\n";
md += "### Confidence Levels\n\n";
Object.entries(CONFIDENCE_LABELS).forEach(([k, v]) => {
  md += `- **${k}**: ${v}\n`;
});
md += "\n### Source Types\n\n";
Object.entries(SOURCE_TYPE_LABELS).forEach(([k, v]) => {
  md += `- **${k}**: ${v}\n`;
});
md += "\n";

// Write
mkdirSync(dirname(OUTPUT), { recursive: true });
writeFileSync(OUTPUT, md, "utf-8");
console.log(`Generated: ${OUTPUT}`);
console.log(`  ${total} rules (${totalR} researched, ${totalE} expert consensus, ${totalP} placeholder)`);
