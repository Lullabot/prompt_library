---
title: "Drupal 11 Project Setup"
description: "Configuration and setup guide for Drupal 11 projects."
category: "Drupal"
tags: ["drupal", "setup", "configuration", "development"]
date: "2024-03-20"
discipline: "development"
---

# Drupal 11 Project Configuration

## Project Structure
```
├── docroot/              # Drupal installation
│   ├── core/            # Drupal core
│   ├── modules/         # Custom modules
│   ├── profiles/        # Installation profiles
│   ├── sites/           # Site-specific files
│   │   └── default/     # Default site
│   │       ├── files/   # Public files
│   │       └── config/  # Configuration files
│   └── themes/          # Custom themes
├── config/              # Configuration export
├── scripts/             # Deployment scripts
├── tests/               # Test files
├── vendor/              # Composer dependencies
├── .gitignore
├── composer.json
├── composer.lock
└── README.md
```

## composer.json Configuration
```json
{
    "name": "organization/project",
    "description": "Drupal 11 project",
    "type": "project",
    "license": "GPL-2.0-or-later",
    "require": {
        "composer/installers": "^2.0",
        "drupal/core": "^11.0",
        "drupal/core-composer-scaffold": "^11.0",
        "drupal/core-project-message": "^11.0",
        "drupal/core-recommended": "^11.0"
    },
    "require-dev": {
        "drupal/core-dev": "^11.0",
        "phpunit/phpunit": "^9.6",
        "drupal/coder": "^8.3"
    },
    "config": {
        "sort-packages": true,
        "allow-plugins": {
            "composer/installers": true,
            "drupal/core-composer-scaffold": true,
            "drupal/core-project-message": true
        }
    },
    "scripts": {
        "post-install-cmd": "Drupal\\Core\\Composer\\Composer::scaffoldFiles",
        "post-update-cmd": "Drupal\\Core\\Composer\\Composer::scaffoldFiles"
    }
}
```

## CI/CD Configuration
1. Set up GitHub Actions
2. Configure automated testing
3. Set up deployment pipeline
4. Configure environment variables

## Development Environment
1. Local development setup
2. Database configuration
3. PHP settings
4. Development tools
5. Debugging configuration 