---
title: "HTML Expert"
description: "Expert guidance for writing semantic, accessible, and performant HTML. Covers semantic elements, ARIA roles and attributes, forms best practices, HTML5 features, metadata, resource hints, and progressive enhancement patterns."
date: "2026-03-17"
layout: "markdown.njk"
discipline: "development"
contentType: "skills"
tags:
  - html
  - accessibility
  - semantic-html
  - frontend
  - web-standards
---

`````
---
name: html-expert
description: "This skill should be used when users need expert guidance on writing semantic, accessible, and performant HTML. Use when users ask about HTML best practices, semantic elements, ARIA roles and attributes, form structure, metadata, resource hints, image optimization, interactive elements, or web standards compliance."
---

# HTML Expert

This skill provides comprehensive guidance for writing semantic, accessible, and performant HTML following modern web standards.

## Core Philosophy

HTML is the foundation of the web. Well-structured HTML is self-documenting, accessible by default, and resilient. Favor native HTML elements and attributes over custom implementations — browsers have spent decades optimizing them. Avoid `<div>` soup: every element should communicate meaning to browsers, assistive technologies, and fellow developers.

## Semantic Structure

### Document Outline

Use landmark elements to create a clear page structure:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Title – Site Name</title>
</head>
<body>
  <header>
    <nav aria-label="Main navigation">...</nav>
  </header>
  <main>
    <article>
      <header><h1>Article Title</h1></header>
      <section aria-labelledby="section-heading">
        <h2 id="section-heading">Section</h2>
        ...
      </section>
    </article>
    <aside aria-label="Related content">...</aside>
  </main>
  <footer>...</footer>
</body>
</html>
```

### Element Selection Guide

| Intent | Element |
|--------|---------|
| Primary page content | `<main>` (one per page) |
| Standalone content (blog post, product) | `<article>` |
| Thematic grouping with a heading | `<section>` |
| Site header / article header | `<header>` |
| Site footer / article footer | `<footer>` |
| Navigation links | `<nav>` |
| Tangentially related content | `<aside>` |
| Figure with caption | `<figure>` + `<figcaption>` |
| Date/time value | `<time datetime="2026-03-17">` |
| Highlighted/marked text | `<mark>` |
| Abbreviation | `<abbr title="HyperText Markup Language">HTML</abbr>` |
| Code | `<code>`, `<pre><code>`, `<kbd>`, `<samp>` |
| Quote | `<blockquote cite="url">` / `<q>` |
| Definition | `<dfn>` |

### Heading Hierarchy

- One `<h1>` per page (the main topic)
- Never skip levels (h1 → h3)
- Headings reflect document outline, not visual size — use CSS for sizing

```html
<!-- Wrong: heading for visual size -->
<h3>Small-looking title</h3>

<!-- Right: use CSS for visual size, heading for structure -->
<h2 class="text-sm">Subsection title</h2>
```

## Accessibility

### ARIA — Use Sparingly

Prefer semantic HTML over ARIA. ARIA supplements HTML when native semantics are insufficient.

**The five ARIA rules:**
1. Use native HTML elements when possible
2. Don't change native semantics
3. All interactive ARIA controls must be keyboard operable
4. Don't use `role="presentation"` or `aria-hidden="true"` on focusable elements
5. All interactive elements must have an accessible name

### Accessible Names

Every interactive and landmark element needs a name:

```html
<!-- Button: visible label is the name -->
<button>Save draft</button>

<!-- Icon button: use aria-label -->
<button aria-label="Close dialog">
  <svg aria-hidden="true" focusable="false">...</svg>
</button>

<!-- Input: always pair with <label> -->
<label for="email">Email address</label>
<input id="email" type="email" name="email">

<!-- Multiple navs: distinguish with aria-label -->
<nav aria-label="Main navigation">...</nav>
<nav aria-label="Breadcrumb">...</nav>

<!-- Section named by heading -->
<section aria-labelledby="filters-heading">
  <h2 id="filters-heading">Filters</h2>
</section>
```

### Live Regions

Announce dynamic content changes to screen readers:

```html
<!-- Status messages (polite — waits for user to finish) -->
<div role="status" aria-live="polite" aria-atomic="true">
  Form saved successfully.
</div>

<!-- Alerts (assertive — interrupts immediately) -->
<div role="alert" aria-live="assertive">
  Session expiring in 2 minutes.
</div>
```

### Focus Management

```html
<!-- Skip link: first focusable element on the page -->
<a class="skip-link" href="#main-content">Skip to main content</a>

<!-- Manage focus when content changes (set via JS) -->
<div id="main-content" tabindex="-1">...</div>
```

### Images

```html
<!-- Informative image -->
<img src="chart.png" alt="Bar chart showing 40% growth in Q3 2025">

<!-- Decorative image -->
<img src="divider.png" alt="">

<!-- Complex image: alt summarizes, longdesc or figcaption details -->
<figure>
  <img src="org-chart.png" alt="Organizational chart (see description below)">
  <figcaption>The engineering department has three teams: Platform (4 members), Product (6 members), and QA (2 members).</figcaption>
</figure>

<!-- SVG inline -->
<svg aria-hidden="true" focusable="false">...</svg>
<svg role="img" aria-label="Company logo">...</svg>
```

## Forms

### Structure

```html
<form method="post" action="/subscribe" novalidate>
  <fieldset>
    <legend>Contact information</legend>

    <div class="field">
      <label for="name">
        Full name
        <span aria-hidden="true">*</span>
      </label>
      <input
        id="name"
        name="name"
        type="text"
        autocomplete="name"
        required
        aria-required="true"
        aria-describedby="name-hint name-error"
      >
      <p id="name-hint" class="hint">As it appears on your ID.</p>
      <p id="name-error" class="error" role="alert" hidden>Name is required.</p>
    </div>

  </fieldset>
  <button type="submit">Subscribe</button>
</form>
```

### Input Types

Use the most specific type for better UX and mobile keyboards:

| Type | Use for |
|------|---------|
| `email` | Email addresses |
| `tel` | Phone numbers |
| `url` | Web URLs |
| `number` | Numeric quantities |
| `search` | Search fields |
| `password` | Passwords |
| `date` / `time` / `datetime-local` | Date/time pickers |
| `color` | Color pickers |
| `range` | Sliders |
| `file` | File uploads |
| `checkbox` | Multiple selections |
| `radio` | Single selection from group |

### Autocomplete

Use `autocomplete` to help browsers autofill correctly:

```html
<input type="text"   name="name"    autocomplete="name">
<input type="email"  name="email"   autocomplete="email">
<input type="tel"    name="phone"   autocomplete="tel">
<input type="text"   name="address" autocomplete="street-address">
<input type="text"   name="city"    autocomplete="address-level2">
<input type="text"   name="zip"     autocomplete="postal-code">
<input type="text"   name="country" autocomplete="country-name">
<input type="text"   name="ccnum"   autocomplete="cc-number">
```

### Validation

```html
<!-- Native constraint validation -->
<input type="email" required minlength="5" maxlength="254" pattern="[^@]+@[^@]+\.[^@]+">

<!-- Communicate errors accessibly -->
<input
  aria-invalid="true"
  aria-describedby="email-error"
>
<p id="email-error" role="alert">Please enter a valid email address.</p>
```

## Metadata and `<head>`

### Essential Tags

```html
<head>
  <!-- Character encoding: must be first -->
  <meta charset="UTF-8">

  <!-- Viewport: required for responsive design -->
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- Page title: unique, descriptive, "Page – Site" pattern -->
  <title>Contact Us – Acme Corp</title>

  <!-- Description: 150–160 characters for search results -->
  <meta name="description" content="Contact the Acme Corp team via email, phone, or our office locations.">

  <!-- Canonical URL: prevents duplicate content issues -->
  <link rel="canonical" href="https://example.com/contact">

  <!-- Open Graph (social sharing) -->
  <meta property="og:title" content="Contact Us – Acme Corp">
  <meta property="og:description" content="Contact the Acme Corp team.">
  <meta property="og:image" content="https://example.com/og-contact.png">
  <meta property="og:url" content="https://example.com/contact">
  <meta property="og:type" content="website">

  <!-- Favicons -->
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="manifest" href="/manifest.webmanifest">
</head>
```

## Performance

### Resource Loading

```html
<!-- Preconnect to critical third-party origins -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

<!-- Preload critical assets (fonts, hero images, key CSS) -->
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/hero.webp" as="image">

<!-- DNS prefetch for non-critical third-party origins -->
<link rel="dns-prefetch" href="https://analytics.example.com">
```

### Images

```html
<!-- Always specify dimensions to prevent layout shifts (CLS) -->
<img src="photo.jpg" alt="..." width="800" height="600">

<!-- Lazy load below-the-fold images -->
<img src="photo.jpg" alt="..." loading="lazy" width="800" height="600">

<!-- Hero / LCP image: eager load, high fetch priority -->
<img src="hero.webp" alt="..." loading="eager" fetchpriority="high" width="1200" height="630">

<!-- Responsive images -->
<img
  srcset="photo-400.webp 400w, photo-800.webp 800w, photo-1200.webp 1200w"
  sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 800px"
  src="photo-800.webp"
  alt="..."
  width="800"
  height="600"
>

<!-- Art direction with picture -->
<picture>
  <source media="(max-width: 600px)" srcset="photo-portrait.webp">
  <source media="(min-width: 601px)" srcset="photo-landscape.webp">
  <img src="photo-landscape.webp" alt="..." width="1200" height="630">
</picture>
```

### Scripts

```html
<!-- Defer non-critical scripts (executes after parse, in order) -->
<script src="app.js" defer></script>

<!-- Async independent scripts (executes as soon as loaded) -->
<script src="analytics.js" async></script>

<!-- Module scripts (deferred by default, strict mode, no globals) -->
<script type="module" src="main.js"></script>

<!-- Inline critical script (minimal, blocks render intentionally) -->
<script>/* theme detection */</script>
```

## Interactive Elements

### Buttons vs Links

```html
<!-- Button: triggers an action -->
<button type="button">Open menu</button>
<button type="submit">Submit form</button>
<button type="reset">Reset</button>

<!-- Link: navigates to a URL -->
<a href="/about">About us</a>

<!-- Never: <a> without href for actions, <div> for buttons -->
```

### Disclosure Pattern (Details/Summary)

```html
<details>
  <summary>Frequently asked questions</summary>
  <ul>
    <li>...</li>
  </ul>
</details>
```

### Dialog

```html
<!-- Native dialog element (manages focus and backdrop) -->
<dialog id="confirm-dialog" aria-labelledby="dialog-title">
  <h2 id="dialog-title">Confirm deletion</h2>
  <p>Are you sure you want to delete this item?</p>
  <div class="dialog-actions">
    <button autofocus>Cancel</button>
    <button>Delete</button>
  </div>
</dialog>

<script>
  document.getElementById('confirm-dialog').showModal();
</script>
```

## Tables

```html
<table>
  <caption>Quarterly revenue by region (USD thousands)</caption>
  <thead>
    <tr>
      <th scope="col">Region</th>
      <th scope="col">Q1</th>
      <th scope="col">Q2</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">North America</th>
      <td>1,200</td>
      <td>1,450</td>
    </tr>
  </tbody>
  <tfoot>
    <tr>
      <th scope="row">Total</th>
      <td>1,200</td>
      <td>1,450</td>
    </tr>
  </tfoot>
</table>
```

## Common Mistakes

| Wrong | Right | Why |
|-------|-------|-----|
| `<div onclick="...">` | `<button>` | No keyboard access, no role |
| `<a href="#">` for actions | `<button>` | Links navigate; buttons act |
| `<br><br>` for spacing | CSS `margin` | Structure via CSS, not markup |
| `<b>` / `<i>` for emphasis | `<strong>` / `<em>` | Semantic meaning, not visual style |
| `<table>` for layout | CSS Grid/Flexbox | Tables are for tabular data |
| Missing `alt` attribute | `alt=""` or descriptive text | Required; empty string for decorative |
| `<input>` without `<label>` | Always pair with `<label>` | Accessibility and usability |
| `placeholder` as label | Use `<label>` | Placeholder disappears on focus |
| `autofocus` on page load | Only in modals/dialogs | Disorienting for screen reader users |

## Validation and Testing

- **W3C Validator**: Paste HTML at validator.w3.org for syntax errors
- **Accessibility tree**: Chrome DevTools → Accessibility tab
- **Screen reader testing**: VoiceOver (macOS/iOS), NVDA (Windows), TalkBack (Android)
- **Keyboard-only navigation**: Tab, Shift+Tab, Enter, Space, arrow keys — no mouse
- **axe DevTools** or **WAVE**: Automated accessibility scanning

## Additional Resources

- MDN HTML Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference
- HTML Living Standard: https://html.spec.whatwg.org/
- ARIA Authoring Practices Guide: https://www.w3.org/WAI/ARIA/apg/
- WebAIM: https://webaim.org/
- web.dev HTML: https://web.dev/learn/html
`````
