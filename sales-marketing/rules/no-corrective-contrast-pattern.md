---
description: AVOID corrective contrast patterns that create defensive, AI-sounding prose
globs: "*.md,*.txt,*.mdx"
alwaysApply: true
---
# No Corrective Contrast Pattern

<version>1.0.0</version>

## Context
The "not just X; it's Y" pattern is overused in AI-generated content and creates unnecessarily defensive, inflated prose. This rule ensures more natural, confident writing.

## Prohibited Patterns

Never use these constructions:
- "This isn't just [X]; it's [Y]"
- "Not just [X], but [Y]"
- "Doesn't just [X]; it [Y]"
- "Not merely [X], but [Y]"
- "Not simply [X]; rather [Y]"
- "More than just [X]"
- "It's not only [X]; it's also [Y]"

## Why This Matters

This pattern:
- Sounds defensive and insecure
- Inflates importance unnecessarily
- Creates wordiness without adding value
- Immediately signals AI-generated content
- Weakens the actual point being made

## Better Alternatives

<example type="invalid">
"This isn't just a code review tool; it's a collaborative development platform."
</example>

<example>
"This code review tool enables collaborative development."
</example>

<example type="invalid">
"Gemini doesn't just catch bugs; it suggests fixes you can commit immediately."
</example>

<example>
"Gemini suggests fixes you can commit immediately."
</example>

<example type="invalid">
"The real value isn't just in time savings; it's in catching issues early."
</example>

<example>
"Catching issues early creates value beyond time savings."
</example>

## General Rule

**State what something DOES, not what it DOESN'T JUST do.**

Lead with capabilities and benefits directly. If you need to show progression or comparison:
- Use "and" to add capabilities
- Use "beyond" to show additional value
- Use "while" to show simultaneous benefits
- Use specific examples instead of abstract comparisons

## Detection Regex

```regex
(isn't|is not|doesn't|does not|not)\s+(just|merely|simply|only).*(;|—|--).*it's
```

## Exception

Historical quotes or direct citations where changing the pattern would alter the original meaning.