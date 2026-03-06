export function getSplitRecommendation(profile) {
  const days = profile.trainingDaysPerWeek || 3;
  const exp = profile.experienceLevel || "beginner";
  const goal = profile.primaryGoal || "general_fitness";

  if (exp === "beginner") {
    if (days <= 3) return { splitKey: "full_body", name: "Full Body (3 days)", reason: "Perfect for beginners \u2014 high frequency per muscle group with enough recovery time to learn the lifts and build a base." };
    if (days === 4) return { splitKey: "upper_lower", name: "Upper / Lower (4 days)", reason: "Great progression from full body \u2014 lets you add more volume per session while maintaining solid frequency." };
    return { splitKey: "ppl", name: "Push / Pull / Legs (5-6 days)", reason: "Ambitious for a beginner, but doable. Lets you focus on each muscle group with dedicated sessions." };
  }

  if (exp === "intermediate") {
    if (days <= 3) return { splitKey: "full_body", name: "Full Body (3 days)", reason: "Maximizes frequency with limited days. Great for intermediates who want efficient sessions." };
    if (days === 4) return { splitKey: "upper_lower", name: "Upper / Lower (4 days)", reason: "The sweet spot for intermediates \u2014 enough volume and frequency to drive progress on all lifts." };
    if (days === 5) return { splitKey: "ppl", name: "Push / Pull / Legs (5 days)", reason: "Popular intermediate split. Hits everything twice with one extra focus day for weak points." };
    return { splitKey: "ppl", name: "Push / Pull / Legs (6 days)", reason: "Classic PPL 2x/week. High volume, high frequency \u2014 ideal for intermediates chasing hypertrophy." };
  }

  // Advanced
  if (days <= 3) return { splitKey: "full_body", name: "Full Body (3 days)", reason: "Surprisingly effective for advanced lifters \u2014 high frequency, strategic exercise selection per session." };
  if (days === 4) return { splitKey: "upper_lower", name: "Upper / Lower (4 days)", reason: "Proven split for strength and size. Enough volume headroom for advanced progression schemes." };
  if (goal === "strength") return { splitKey: "upper_lower", name: "Upper / Lower (5-6 days)", reason: "Prioritizes compound frequency for strength. Extra days allow accessory specialization." };
  return { splitKey: "ppl", name: "Push / Pull / Legs (6 days)", reason: "Maximum volume and specialization. Ideal for advanced lifters pushing toward their genetic ceiling." };
}
