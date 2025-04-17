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
  Drupal 10 core coding standards & patterns. Ensures generated PHP follows
  DI, hook structure, and Composer best practices.
globs:
  - "**/*.php"
  - "**/*.module"
  - "**/*.services.yml"
alwaysApply: true
---

# Drupal 10 Core Rules

1. **Strict Types & PSR‑12**  
   ~~~php
   declare(strict_types=1);
   ~~~

2. **Dependency Injection**  
   * Never call `\Drupal::service()` or `\Drupal::config()` inside classes.  
   * Controllers, Plugins, EventSubscribers use `create()` + constructor for DI.  

3. **Service Definition Template**  
   ~~~yml
   services:
     my_module.foo:
       class: Drupal\my_module\Foo
       arguments: ['@config.factory', '@logger.channel.my_module']
   ~~~
   Example usage in PHP:
   ~~~php
   public function __construct(ConfigFactoryInterface $config, LoggerChannelInterface $logger) { ... }
   public static function create(ContainerInterface $c): self {
     return new static(
       $c->get('config.factory'),
       $c->get('logger.channel.my_module'),
     );
   }
   ~~~

4. **Hook Implementations**  
   * Hook names: `my_module_hook_name()`.  
   * Return **render arrays** rather than markup strings; keep templates in Twig.

5. **Configuration & Schema**  
   * If a config file is introduced, provide a matching `config/schema/*.schema.yml`.  
   * Validate default values in an install hook.

6. **Composer**  
   * Add 3rd‑party libs with `composer require`.  
   * Never commit vendor code.

7. **Coding Standard**  
   * 2‑space indent; 80‑120 col soft‑limit.  
   * Run `phpcbf --standard=Drupal,DrupalPractice`.

8. **Verification checklist (AI must self‑check)**  
   - [ ] Does every new class have namespace + PSR‑4 path?  
   - [ ] Are all services injected, not globally fetched?  
   - [ ] Are routes defined in `<module>.routing.yml` with `_controller` classes?  
   - [ ] Is there a schema file for any new config?  
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
