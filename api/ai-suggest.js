import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are Atlas AI, an exercise science expert embedded in a fitness training platform. You analyze training plans and workout logs to provide actionable, evidence-based recommendations.

Rules:
- Be concise and specific. No filler.
- Reference actual exercises and numbers from the user's data.
- Base recommendations on exercise science: progressive overload, volume landmarks (MEV/MAV/MRV), frequency, recovery.
- Always respond with valid JSON matching the requested format.
- When suggesting changes, explain the reasoning briefly.`;

const TYPE_PROMPTS = {
  analyze: `Analyze this training plan and recent workout performance. Return JSON:
{
  "summary": "1-2 sentence overall assessment",
  "strengths": ["strength1", "strength2"],
  "improvements": ["actionable improvement 1", "actionable improvement 2", "actionable improvement 3"],
  "tip": "One key training tip based on their current program"
}`,
  stall: `The user may be stalling on certain exercises. Analyze their workout logs for plateaus (same or declining weight/reps over 2+ weeks). Return JSON:
{
  "stalls": [
    { "exercise": "exercise name", "observation": "what you noticed", "suggestion": "specific fix" }
  ],
  "general": "Overall progression assessment (1-2 sentences)"
}
If no stalls detected, return empty stalls array with a positive general message.`,
  swap: `The user wants exercise alternatives. Based on their plan, suggest swaps that maintain muscle balance. Return JSON:
{
  "swaps": [
    { "current": "current exercise", "alternatives": ["alt1", "alt2"], "reason": "why these work" }
  ]
}
Suggest 3-5 swaps for exercises that could benefit from variation.`,
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured" });
  }

  const { type, plan, logs } = req.body;

  if (!type || !TYPE_PROMPTS[type]) {
    return res.status(400).json({ error: "Invalid type. Use: analyze, stall, swap" });
  }

  const planSummary = plan ? {
    name: plan.splitName,
    split: plan.splitKey,
    weeks: plan.weeks,
    progressRate: plan.progressRate,
    days: (plan.weekTemplate || []).map(d => ({
      label: d.label,
      isRest: d.isRest,
      exercises: d.isRest ? [] : (d.exercises || []).map(e => {
        const id = typeof e === "string" ? e : (e.id || e.exercise_id);
        const sets = e.setDetails ? e.setDetails.length : (e.sets ? e.sets.length : 0);
        return { id, sets };
      }),
    })),
  } : null;

  const userMessage = `${TYPE_PROMPTS[type]}

PLAN:
${JSON.stringify(planSummary, null, 2)}

RECENT LOGS (last entries):
${JSON.stringify(logs ? Object.entries(logs).slice(-14) : {}, null, 2)}`;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      temperature: 0.3,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const text = response.content[0]?.text || "{}";
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, text];
    const parsed = JSON.parse(jsonMatch[1].trim());
    return res.status(200).json({ type, data: parsed });
  } catch (err) {
    console.error("[atlas-ai]", err);
    return res.status(500).json({ error: "AI request failed. Please try again." });
  }
}
