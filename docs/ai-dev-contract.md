# Atlas AI Development Contract

1. docs/atlas-architecture-v1.md is the governing architecture.
2. Deterministic engine computes:
   - effective sets
   - MEV/MAV/MRV
   - % of goal
   - balance ratios
   - trend slopes
3. LLM may:
   - explain insights
   - interpret ambiguous patterns
   - suggest bounded plan changes
4. LLM may NOT:
   - compute volume math
   - override MRV/MEV constraints
   - change split structure without approval
5. Beginner-facing UI must avoid technical terms like "mesocycle".
6. If a requested change conflicts with the architecture, propose an alternative.
