# Advanced Modules - Building Blueprints & Redundancy Auditor

This document describes the two advanced modules added to the PCW ToolBelt: **Building Blueprints** and **Plugin Redundancy Auditing**.

## 🏗️ Building Blueprints

The Blueprint system allows you to rapidly scaffold complete project structures from predefined templates. Perfect for agency workflows where you repeatedly create similar WordPress themes, plugins, or site architectures.

### Features

- **Template-Based Scaffolding**: Define entire folder structures and file contents in JSON
- **Variable Substitution**: Use `{{VARIABLE}}` syntax in file paths and content
- **Interactive Prompts**: Extension asks for variable values during scaffolding
- **Built-in Variables**: Automatic `PROJECT_NAME`, `TIMESTAMP`, and `AUTHOR` injection
- **Validation**: Checks for existing files/folders to prevent overwriting

### Usage

1. Open Command Palette (`Cmd+Shift+P`)
2. Run `PPACK: Core: Scaffold Blueprint`
3. Select a blueprint from the list
4. Enter variable values when prompted
5. Files and folders are created instantly

### Creating Custom Blueprints

Blueprints are JSON files stored in `src/blueprints/definitions/`. Here's the structure:

```json
{
  "id": "my-blueprint",
  "name": "My Custom Blueprint",
  "description": "Creates a custom project structure",
  "version": "1.0.0",
  "author": "Your Name",
  "variables": [
    {
      "name": "THEME_NAME",
      "description": "The name of your theme",
      "default": "my-theme"
    },
    {
      "name": "TEXT_DOMAIN",
      "description": "Text domain for translations",
      "default": "my-domain"
    }
  ],
  "folders": [
    {
      "path": "wp-content/themes/{{THEME_NAME}}"
    },
    {
      "path": "wp-content/themes/{{THEME_NAME}}/assets/css"
    },
    {
      "path": "wp-content/themes/{{THEME_NAME}}/assets/js"
    }
  ],
  "files": [
    {
      "path": "wp-content/themes/{{THEME_NAME}}/style.css",
      "content": "/*\nTheme Name: {{THEME_NAME}}\nText Domain: {{TEXT_DOMAIN}}\nAuthor: {{AUTHOR}}\n*/"
    },
    {
      "path": "wp-content/themes/{{THEME_NAME}}/functions.php",
      "content": "<?php\n// {{THEME_NAME}} Functions\n// Built with PCW ToolBelt on {{TIMESTAMP}}\n\nfunction {{TEXT_DOMAIN}}_setup() {\n    // Theme setup\n}\nadd_action('after_setup_theme', '{{TEXT_DOMAIN}}_setup');\n"
    }
  ]
}
```

### Built-in Blueprints

#### Agency Website Blueprint (`agency-site`)

Creates a professional agency website structure with:

- Custom theme architecture
- Template parts (header, footer, navigation)
- Custom post types (Projects, Services)
- Custom widgets
- Functionality plugin
- README documentation

**Variables:**

- `THEME_NAME`: Theme directory name (default: `agency-theme`)
- `TEXT_DOMAIN`: Translation text domain (default: `agency`)

## 🔍 Plugin Redundancy Auditor

The Redundancy Auditor scans your WordPress installation for plugin bloat and category conflicts. It identifies when you have multiple plugins serving the same purpose, which can cause performance issues and conflicts.

### Features

- **Automatic Plugin Detection**: Scans `wp-content/plugins` directory
- **Category Classification**: Groups plugins by function (SEO, Caching, Security, etc.)
- **Severity Levels**: High/Medium/Low warnings based on redundancy
- **Smart Recommendations**: Suggests which plugins to keep or remove
- **20+ Categories**: SEO, Caching, Security, Backup, Forms, Page Builders, and more

### Usage

1. Open a WordPress project workspace
2. Open Command Palette (`Cmd+Shift+P`)
3. Run `PPACK: Core: Audit Plugin Redundancy`
4. View results in the PCW ToolBelt side panel

### What It Checks

The auditor compares your installed plugins against a redundancy matrix with 20 categories:

| Category              | Max Recommended | Examples                                        |
| --------------------- | --------------- | ----------------------------------------------- |
| SEO                   | 1               | Yoast SEO, Rank Math, All in One SEO            |
| Caching               | 1               | WP Rocket, W3 Total Cache, WP Super Cache       |
| Security              | 1               | Wordfence, iThemes Security, Sucuri             |
| Backup                | 1               | UpdraftPlus, BackupBuddy, BackWPup              |
| Contact Forms         | 1               | Contact Form 7, WPForms, Gravity Forms          |
| Page Builders         | 1               | Elementor, Beaver Builder, Divi                 |
| Image Optimization    | 1               | Smush, Imagify, ShortPixel                      |
| Slider                | 1               | Smart Slider, Meta Slider, Revolution Slider    |
| Analytics             | 1               | MonsterInsights, ExactMetrics, Google Analytics |
| Social Sharing        | 1               | Social Warfare, AddToAny, Jetpack               |
| Membership            | 1               | MemberPress, Restrict Content Pro, PMPro        |
| Email Marketing       | 1               | Mailchimp, Newsletter, OptinMonster             |
| Popup                 | 1               | Popup Maker, OptinMonster, Thrive Leads         |
| Migration             | 1               | Duplicator, All-in-One WP Migration             |
| Database Optimization | 1               | WP-Optimize, WP-Sweep                           |
| Redirection           | 1               | Redirection, Simple 301 Redirects               |
| Lazy Loading          | 1               | Lazy Load, a3 Lazy Load                         |
| Related Posts         | 1               | YARPP, Related Posts, Jetpack                   |
| Maintenance Mode      | 1               | Coming Soon, WP Maintenance Mode                |
| Cookie Consent        | 1               | Cookie Notice, Complianz, Cookiebot             |

### Sample Output

```
═══════════════════════════════════════════════════════
       PCW TOOLBELT - PLUGIN REDUNDANCY AUDIT
═══════════════════════════════════════════════════════

📊 Summary:
   Total Plugins: 18
   Active Plugins: 15
   Redundancy Warnings: 2
   Scanned: 2025-01-01T12:00:00.000Z

⚠️  REDUNDANCY WARNINGS:

🔴 HIGH PRIORITY (1):

1. SEO
   Found 3 SEO plugins (recommended: 1)
   Plugins:
   - Yoast SEO (v23.0)
   - Rank Math (v1.0.214)
   - All in One SEO Pack (v4.6.0)
   💡 Consider keeping only 1 SEO plugin(s). Multiple plugins in the
   same category can cause conflicts and slow down your site.

🟡 MEDIUM PRIORITY (1):

2. Caching
   Found 2 Caching plugins (recommended: 1)
   Plugins:
   - WP Rocket (v3.15)
   - W3 Total Cache (v2.7.0)
   💡 Consider keeping only 1 Caching plugin(s). Multiple caching plugins
   can conflict and actually reduce performance.
```

### Customizing the Redundancy Matrix

The matrix is stored in `src/blueprints/redundancy-matrix.json`. You can add custom categories or plugins:

```json
{
  "categories": [
    {
      "name": "Custom Category",
      "description": "Your custom plugin category",
      "maxRecommended": 1,
      "plugins": ["plugin-slug-1", "plugin-slug-2", "partial-name*"]
    }
  ],
  "lastUpdated": "2025-01-01"
}
```

**Pattern Matching:**

- Exact match: `"yoast-seo"`
- Partial match: `"wordpress-seo"` (matches in slug or name)
- Wildcard: `"*seo*"` (matches any plugin with "seo" in the name)

## Architecture

### BlueprintManager (`src/core/blueprints/BlueprintManager.ts`)

Singleton class that handles blueprint loading and scaffolding:

- `getAvailableBlueprints()`: Scans definitions folder
- `loadBlueprint(id)`: Loads and caches a blueprint
- `scaffoldBlueprint(blueprint, targetPath, variables)`: Creates files/folders
- `resolvePath()`: Substitutes variables in paths
- `resolveFileContent()`: Substitutes variables in file content

### RedundancyAuditor (`src/packs/core/redundancy.ts`)

Singleton class that audits plugin installations:

- `loadMatrix()`: Loads redundancy-matrix.json
- `scanPlugins(workspacePath)`: Finds all plugins in wp-content/plugins
- `auditPlugins(plugins)`: Compares against matrix categories
- `formatReport(report)`: Creates human-readable output

### Types

**Blueprint Types** (`src/core/blueprints/types.ts`):

- `BlueprintDefinition`: Main blueprint structure
- `BlueprintVariable`: Variable with name/description/default
- `BlueprintFile`: File path and content
- `BlueprintFolder`: Folder path
- `ScaffoldResult`: Result of scaffolding operation

**Redundancy Types** (`src/packs/core/redundancy.ts`):

- `Plugin`: Installed plugin metadata
- `PluginCategory`: Category from matrix
- `RedundancyWarning`: Detected conflict
- `RedundancyReport`: Complete audit result

## Integration with Side Panel

Both modules integrate with the PCW ToolBelt side panel:

1. **Blueprints**: Shows success/failure messages via `vscode.window.showInformationMessage()`
2. **Redundancy**: Displays warnings in the side panel's results view with clickable plugin paths

## Best Practices

### Blueprints

1. **Start Small**: Create a simple blueprint first, then expand
2. **Test Variables**: Ensure all variables are used consistently
3. **Use Descriptions**: Help users understand what each variable does
4. **Default Values**: Provide sensible defaults for all variables
5. **Folder First**: Always create folders before files that go in them

### Redundancy Auditing

1. **Run Regularly**: Audit after installing new plugins
2. **Review Before Removing**: Some plugins may serve multiple purposes
3. **Check Dependencies**: Ensure other plugins don't depend on the one you're removing
4. **Backup First**: Always backup before making plugin changes
5. **Consider Jetpack**: It appears in multiple categories (backup, analytics, security)

## Future Enhancements

### Blueprints

- [ ] Remote blueprint repository
- [ ] Blueprint marketplace/sharing
- [ ] Pre/post scaffolding hooks
- [ ] Git integration (auto-commit after scaffold)
- [ ] Template inheritance

### Redundancy

- [ ] Active/inactive plugin distinction
- [ ] Plugin dependency graph
- [ ] Performance impact scoring
- [ ] Auto-deactivation suggestions
- [ ] Historical tracking (plugin additions over time)

## Support

For issues or feature requests, open an issue in the PCW ToolBelt repository.

---

Built with ❤️ by PCW ToolBelt
