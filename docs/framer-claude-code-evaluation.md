# Framer + AI Coding Agents: A Hands-On Evaluation

*An experience report on using Claude Code with a Framer design to reimplement
it in a real codebase.*

## Executive Summary

We connected an AI coding agent (Claude Code) to a [Framer](https://framer.com)
redesign of our "Prompt Library" site and tried to read the design well enough
to rebuild it in our own 11ty/Eleventy codebase. Connecting and authenticating
was painless on both integration paths we tried, and reading a normal page was
genuinely excellent — we extracted a complete, accurate design spec. But the
two paths each had real gaps: Framer's official agent bridge is currently
blocked by a rendering bug, and the third-party tool that *does* work is
fragile in specific, predictable ways.

**Bottom line: promising but early-stage. A "design in Framer → implement in
code" handoff to an AI agent works today if you design with plain layers, model
things as named components, and keep the right plugin open — but it is not yet
turnkey.**

> ⚠️ **Privacy caution (added after publishing).** The path that actually worked
> here — the third-party **unframer** plugin — runs through a *hosted* service
> tied to your personal account and email. Shortly after we tried it, the
> project's author **emailed our team member directly, unsolicited.** We didn't
> ask for contact and didn't expect a person on the other end watching usage
> closely enough to reach out — and frankly, it felt gross. The tool was
> fairly effective, but that experience is part of the evaluation: using the
> hosted endpoint ties your activity to your identity in a way we found
> intrusive. If you try unframer, weigh that, and strongly prefer
> **self-hosting the [open-source version](https://github.com/remorses/unframer)**
> over the hosted `mcp.unframer.co` tunnel.

### Terms used in this report

- **AI coding agent** — a tool like Claude Code or Cursor that can read your
  files and project context and write code. Here it reads the Framer design and
  writes the implementation.
- **MCP (Model Context Protocol)** — an open standard that lets an AI agent
  call external tools (here, tools that read a Framer project). "MCP server"
  means the program exposing those tools.
- **Replica / variant** — Framer's mechanism for reusing one design across
  states or screen sizes (e.g. a light-theme copy of a dark design, or a mobile
  version of a desktop layout). This is where the tooling is weakest.

## What We Were Trying to Do

Take a finished Framer design (a homepage redesign) and have the agent read it
faithfully — colors, layout, copy, links, component props — so we could rebuild
it node-for-node in our static-site codebase. We were **not** trying to use
Framer's own hosting; the goal was design-in-Framer, ship-in-our-stack.

We succeeded. The extracted result lives in
[`docs/redesign-spec.md`](./redesign-spec.md) — a full 8-section spec with exact
palette tokens, layout, and component definitions, captured node-for-node. That
file is the evidence this workflow *can* work. This report explains how we got
there and where it broke.

## Integration Paths We Tested

We tried three ways to get the design out of Framer and into the agent.

| Path | What it is | Result |
|---|---|---|
| **1. Official Framer bridge** (`@framer/agent` CLI + Claude Code skills) | Framer's own first-party tooling for connecting an agent to a project | **Blocked.** Setup and auth worked; every call that renders or serializes the canvas failed with a renderer bug |
| **2. unframer MCP** (third-party, [open source](https://github.com/remorses/unframer)) | A community MCP server, installed as an in-Framer plugin that tunnels read/write tools to the agent | **Worked.** We read the whole page as XML and reconstructed it — with notable blind spots |
| **3. Publishing route** (read the live site's HTML/CSS) | Skip the tooling; just read the published web page | **Not viable here.** The design lived on a Framer *design page*, which doesn't publish; staging/production URLs were null |

### Path 1 — Official `@framer/agent` bridge (v0.0.33)

Setup was the smooth part. Three commands and a browser approval:

- `npx @framer/agent setup` — installs the Claude Code skills
- `npx @framer/agent project auth <url>` — browser-based approval (clean)
- `npx @framer/agent session new <id>` — starts a local relay server

Lightweight calls worked: `getContext()` and `getNodesOfTypes()` returned node
lists and counts. But **every call that has to render or serialize the canvas
failed** with the same error:

```
Assertion Error: The importMap has to exist on the module
```

This killed `screenshot`, `serialize`, `getNode`, and even reading a single
node's `.attributes` or `.text`. In other words, the bridge could enumerate the
design but could not *read* it.

We tried hard to clear it: destroy and recreate the session, restart the relay
server, re-authorize, reload the skills/plugins, open the project in Framer's
browser editor so its modules would load, and a brand-new agent session. **The
bug persisted in every case.** Our conclusion is that this is a genuine
renderer bug in `@framer/agent` 0.0.33 for this project — and the version
number (`0.0.x`) tells you how early this tooling is. For now, the first-party
bridge was effectively unusable for *reading* a design.

### Path 2 — unframer MCP (the one that worked)

The [unframer](https://github.com/remorses/unframer) MCP server (hosted at
`mcp.unframer.co`) installs as an in-Framer plugin (Cmd-K → search "MCP"). The
plugin exposes an HTTP tunnel URL, which we registered with the agent via
`claude mcp add --transport http`.

This succeeded where the official bridge failed. We read the entire page as XML
(`getProjectXml`, `getNodeXml`) and reconstructed all 8 sections node-for-node:
exact colors, layout, copy, links, and component props. Roughly 22 tools are
available — read project/node/selected-node XML, read and write CMS content,
read color and text styles, search fonts, create/update/delete/duplicate nodes
via an XML DSL, and export React.

The XML maps cleanly onto web concepts. Framer expresses layout with familiar,
CSS-ish ideas — stack/grid layout, `gap`, `padding`, `backgroundColor`,
`borderRadius` — so translating it into real HTML and CSS was straightforward.

### Path 3 — Publishing route

If the design had been on a publishable web page, we could have skipped the
tooling and just read the rendered HTML/CSS. But this design lived on a Framer
**design page** (a canvas surface), which does not publish, so there was no URL
to read. Worth knowing as a fallback, but it did not apply here.

## What Worked Well

- **Connecting and authenticating** the agent to Framer was quick and painless
  on *both* paths. No friction here.
- **Reading a normal page** (plain frames and stacks) via unframer was better
  than expected — accurate and complete. The extracted spec
  ([`redesign-spec.md`](./redesign-spec.md)) is the proof.
- **Components with named props translated beautifully.** Where the design used
  components ("Resource Card", "Type Card", "Library Button"), each instance
  exposed its props directly in the XML and mapped 1:1 to code — we turned them
  into reusable Nunjucks macros. **This is the pattern to recommend.**
- **Familiar layout model.** Because Framer's layout vocabulary mirrors CSS, an
  agent that knows CSS can reason about it with little translation loss.

## What Didn't Work

| Issue | Impact |
|---|---|
| **Official bridge renderer bug** (`importMap`) | The first-party `@framer/agent` path can enumerate but not read a design. Effectively unusable for reads today |
| **Tunnel is fragile** | Closing the unframer plugin panel in Framer drops the tunnel — every call then returns "Framer plugin not connected." You must keep the plugin open for the whole session |
| **Replicas / variants are a blind spot** | `getNodeXml` and `getSelectedNodesXml` return replica/variant nodes self-closed (no children), and `duplicateNode` refuses them ("Cannot set parent of a replica node"). Our light-theme design was built as a replica, so it was *entirely unreadable* — we recovered its colors from an editor screenshot |
| **Component *definitions* aren't readable** | Calling `getNodeXml` on a component's own node returned "Node is not a text node." We could still read each *instance's* props where it was used, which was enough — but you can't introspect the component itself |
| **Clean React export is paywalled** | `exportReactComponents` (pitched as "the most interesting tool") returns "No active React Export subscription" and points to a pricing page. It also only exports component nodes, not whole pages |

The replica/variant blind spot deserves emphasis: **variants and replicas are
exactly how Framer handles responsive breakpoints *and* component states.** So
the read tooling is weakest precisely where a real, production-grade design is
richest. Plan around this.

## If You Want to Try This

A concrete setup checklist for a Framer → AI-agent handoff today:

1. **Use the unframer MCP, not the first-party bridge.** Install the unframer
   plugin in Framer (Cmd-K → "MCP"), then register its tunnel URL with your
   agent (`claude mcp add --transport http <url>`).
2. **Keep the unframer plugin panel open** in Framer for the entire session.
   If you close it, the tunnel drops and every call fails until you reconnect.
3. **Design with plain layers where you need a clean read.** Frames and stacks
   read perfectly; replicas/variants do not.
4. **Model reusable elements as components with clearly named props/controls.**
   Named props are what survive the trip to code 1:1 — this is the single
   biggest lever for a clean handoff.
5. **Detach or flatten any replicas/variants you need read** before handoff —
   or accept that you'll recover those from a screenshot. (Note the tension:
   this conflicts with using variants for responsive breakpoints. Decide
   per-element.)
6. **Treat colors pulled from screenshots as "within a few shades."** Fine-tune
   them against a real preview rather than trusting the sampled hex exactly.
7. **Budget for the React Export subscription** if you want direct design→React
   from unframer — or evaluate Framer's own native React export separately.
8. **Report the `importMap` bug to Framer** so the first-party bridge becomes
   viable.

> **Security note.** The unframer tunnel URL embeds a personal session secret
> (`?id=…&secret=…`). Treat it like a credential — don't commit it to a repo or
> paste it into shared channels.

## Readiness Verdict

**Promising, but early-stage and not yet turnkey.**

The first-party bridge is blocked by a real renderer bug. The reliable path is a
third-party MCP that is tunnel-fragile, blind to replicas and variants, and
paywalls the clean code export. None of that is a dealbreaker — we got a
complete, accurate spec out of a real design — but it does mean the workflow
rewards deliberate design choices rather than working out of the box.

Usable **today** for "read a Framer design and reimplement it in code" *if* you:
design with plain layers (or detach replicas before handoff), model things as
named components, and keep the unframer plugin open. As Framer's own agent
tooling matures past `0.0.x`, expect this to get meaningfully smoother.
