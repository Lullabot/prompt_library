---
title: "Drupal 11 Development Standards"
description: "Rules for maintaining high code quality in Drupal 11 projects."
layout: "markdown.njk"
category: "Drupal"
tags: ["drupal", "standards", "best practices", "development"]
date: "2024-03-20"
discipline: "development"
---
```
# Drupal 11 Development Standards

## Drupal Coding Standards
- Follow Drupal core coding standards
- Use PHPCS and DrupalPractice for code review
- Implement proper dependency injection
- Use Drupal's service container
- Follow PSR-4 autoloading standards
- Avoid creating classes in a "Service" namespace, such as Drupal\my_module\Service. Instead, create classes in names spaces that logically group with existing classes. If no such group is possible, create classes in the root of the module namespace instead.

## Module Development
- Use proper module structure
- Implement proper hook system
- Use configuration management
- Follow Drupal's plugin system
- Implement proper update hooks
- Always use `\GuzzleHttp\Utils::jsonDecode` and `\GuzzleHttp\Utils::jsonEncode` instead of PHP's `json_encode` and `json_decode` methods.

## Theme Development
- Use proper theme structure
- Follow Twig best practices
- Implement proper asset libraries
- Use Drupal's breakpoint system
- Follow accessibility standards

## Security
- Use Drupal's security APIs
- Implement proper access control
- Use Drupal's database abstraction
- Sanitize all user input
- Escape all output

## Performance
- Use Drupal's caching system
- Optimize entity queries
- Implement proper cache tags
- Use lazy loading where appropriate
- Optimize asset delivery

## Testing
- Write PHPUnit tests
- Use Drupal's testing framework
- Test all custom functionality
- Include functional tests
- Test edge cases

## Documentation
- Document all custom code
- Use proper docblocks
- Document configuration
- Maintain README files
- Document deployment process

## Logging
- Do not create separate "debug" flags for debug logging. Instead, log each message using the appropriate LoggerInterface method, such as debug(), info(), warning(), or error().
```
