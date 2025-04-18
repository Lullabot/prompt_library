---
title: "Drupal Development"
description: "Rules for maintaining high code quality in Drupal projects."
layout: "markdown.njk"
category: "Drupal"
tags: ["drupal", "standards", "best practices", "development"]
date: "2024-04-17"
discipline: "development"
---

## How these files work together

- drupal-core.mdc is Always applied, giving every generation a Drupal foundation.

- drupal-theme.mdc and drupal-tests.mdc are Auto Attached—they load only when you edit Twig or test files, keeping the model focused.

### 1 `drupal-core.mdc` — Core coding standards & patterns (Auto Attached)

```mdc
---
description: >
  Drupal 10 core standards & your team’s personal preferences. Ensures strict
  typing, DI, visibility, final classes, and hook patterns.
globs:
  - "**/*.php"
  - "**/*.module"
  - "**/*.install"
  - "**/*.services.yml"
alwaysApply: true
---

# Drupal 10 Core Rules

1. **Strict Types & PSR‑12**  
   ~~~php
   declare(strict_types=1);
   ~~~

2. **Final Classes & Visibility**  
   - Declare every class `final` unless you explicitly intend it to be extended.  
   - Make all properties `private readonly` when possible; otherwise `private`.  
   - Methods default to `private`; use `protected`/`public` only as needed.

3. **Dependency Injection**  
   - Never call `\Drupal::service()` or `\Drupal::config()` in classes.  
   - Use constructor injection with promoted properties:  
     ~~~php
     public function __construct(
         private readonly ConfigFactoryInterface $config,
         private readonly LoggerChannelInterface $logger,
     ) {}
     ~~~

4. **Hook Implementations**  
   - Thin wrapper: delegate to an invokable class with the `@Hook` attribute.  
     See OOP hooks: https://api.drupal.org/api/drupal/core%21lib%21Drupal%21Core%21Hook%21Attribute%21Hook.php/class/Hook/11.x  
   - Provide a `LegacyHook` bridge for procedural modules:  
     https://www.drupal.org/node/3442349

5. **Service Definitions**  
   ~~~yaml
   services:
     my_module.foo:
       class: Drupal\my_module\Foo
       arguments: ['@config.factory', '@logger.channel.my_module']
       tags: ['event_subscriber']
   ~~~

6. **Composer & Vendor**  
   - Add third‑party libraries via `composer require`.  
   - Never commit `vendor/`.

7. **Coding Standards & Checks**  
   - 2‑space indent, 80–120 col soft limit.  
   - Run `phpcbf --standard=Drupal,DrupalPractice` on staged files.

8. **Self‑Verification Checklist**  
   - [ ] Class is `final` and marked `strict_types`.  
   - [ ] All dependencies injected via constructor.  
   - [ ] No static calls to `\Drupal::`.  
   - [ ] Hooks use OOP attribute + LegacyHook.  
   - [ ] Services listed in `<module>.services.yml`.  
   - [ ] Visibility of properties/methods minimized.  
```

---

### 2 `drupal-theme.mdc` — Twig & front‑end (Auto Attached)

```mdc
---
description: Drupal 10 theming & Twig best practices.
globs:
  - "**/*.html.twig"
  - "**/*.theme"
alwaysApply: false
---

# Drupal Theme Rules

* Limit Twig logic to simple conditionals/loops; heavy logic goes to `*.theme` preprocess.
* Follow **BEM** classes (`block__element--modifier`).
* Use `{% raw %}{{ attach_library('my_theme/component') }}{% endraw %}` for assets.
* Prefer `|t` filter for translatable strings.
* To create template overrides, follow naming conventions (e.g. `node--article.html.twig`).
* Provide a matching `*.libraries.yml` entry for every new asset bundle.
```

---

### 3 `drupal-testing.mdc` — Testing patterns (Auto Attached)

```mdc
---
description: PHPUnit Kernel & Functional test scaffolds.
globs:
  - "tests/src/**/*.php"
alwaysApply: false
---

# Drupal Testing Rules

1. **Base classes**  
   * Use `KernelTestBase` for unit‑ish tests needing services.  
   * Use `BrowserTestBase` for full‑stack functional tests.

2. **Fixtures & setup**  
   * Install required modules via `$this->enableModules(['node', 'my_module']);`
   * Use `$this->drupalCreateUser()` and `$this->drupalLogin()` helpers.

3. **Assertions**  
   * Prefer `$this->assertTrue()` / `$this->assertEquals()` over deprecated helpers.  
   * For rendered HTML, use `$this->assertSession()->elementExists('css', '.class');`.

4. **CI**  
   * Tests must pass with `phpunit -c core/phpunit.xml.dist`.
```