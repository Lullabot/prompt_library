# Prompt Library

A collection of AI prompts, cursor rules, project configurations, and workflow states across different disciplines. Built with 11ty and hosted on GitHub Pages.

![Screenshot of the Prompt Library showing the Development AI Prompts page](assets/images/prompt_library.png)

## Features

- Clean, modern design
- Responsive layout
- Easy navigation
- Search functionality
- Content categorization by discipline
- Markdown support

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Git

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/prompt-library.git
cd prompt-library
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm start
```

4. Build for production
```bash
npm run build
```

## Project Structure

```
├── _data/              # Global data files
├── _includes/          # Includes and partials
├── _layouts/           # Page templates
│   ├── base.njk        # Base layout
│   ├── discipline.njk  # Discipline-specific layout
│   └── content-type.njk # Content type layout
├── assets/             # Static assets
│   ├── css/           # Stylesheets
│   ├── js/            # JavaScript files
│   └── images/        # Image assets
├── development/        # Development discipline content
│   ├── prompts/       # Development prompts
│   ├── cursor-rules/  # Development cursor rules
│   ├── project-configs/ # Development project configs
│   └── workflow-states/ # Development workflow states
├── project-management/ # Project Management discipline content
│   ├── prompts/
│   ├── cursor-rules/
│   ├── project-configs/
│   └── workflow-states/
├── sales-marketing/    # Sales & Marketing discipline content
│   ├── prompts/
│   ├── cursor-rules/
│   ├── project-configs/
│   └── workflow-states/
├── content-strategy/   # Content Strategy discipline content
│   ├── prompts/
│   ├── cursor-rules/
│   ├── project-configs/
│   └── workflow-states/
├── design/            # Design discipline content
│   ├── prompts/
│   ├── cursor-rules/
│   ├── project-configs/
│   └── workflow-states/
├── .github/           # GitHub configuration
│   └── workflows/     # GitHub Actions workflows
├── .eleventy.js       # 11ty configuration
├── .gitignore
├── package.json
└── README.md
```

## Content Organization

The library is organized by disciplines and content types:

### Disciplines
- Development
- Project Management
- Sales & Marketing
- Content Strategy
- Design

### Content Types
- Prompts: AI prompts for various use cases
- Cursor Rules: Guidelines for development environments
- Project Configs: Project configuration templates
- Workflow States: Process and workflow documentation

Each discipline contains all content types, allowing for specialized content within each field.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Acknowledgments

- [11ty](https://www.11ty.dev/)
- [GitHub Pages](https://pages.github.com/) 