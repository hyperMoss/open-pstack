# Arjit role and route resolution

## Sub-features

Role defaults in installed `skills/setup-pstack/SKILL.md`, provider IDs in `scripts/runner/types.ts`, and native Claude capabilities in shipped `agents/pstack-*.md` frontmatter. This fork retains Arjit's provider-dispatch contract and does not add Eric's generated catalog to the plugin.

## How to get to it (user POV)

Invoke installed `poteto-mode` and ask the parent to resolve roles from a fixture model sheet.

## Driving it with verify-open-pstack

The `catalog` recipe writes a fixture sheet whose `judgment and prose` line uses another role's default. It omits `arena runners` and `bug-fix`. The parent writes descriptors and routes for those roles to `routes.json`. The trusted assertion compares them with the fixture, defaults parsed from the installed setup sheet, and native capabilities parsed from installed agent frontmatter.

## Gotchas

An arbitrary Claude model is external unless an exact shipped native model/effort pair covers it. Codex models are native to a Codex parent. Other providers are external. The recipe reads installed sources rather than storing a second default model matrix.

## Headless

Select `<harness>:catalog` for changed role-resolution behavior. A wrong descriptor or route fails the assertion. Unknown providers fail closed. This proves role resolution only; provider execution needs a separate runner recipe.
