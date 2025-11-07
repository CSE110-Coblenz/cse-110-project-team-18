import {
	readFileSync,
	writeFileSync,
	mkdirSync,
	copyFileSync,
	existsSync,
	readdirSync,
	statSync,
} from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { marked } from 'marked';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');
const docsDir = join(projectRoot, 'docs');
const guidesSourceDir = join(docsDir, 'guides'); // Source markdown files
const apiDir = join(docsDir, 'api');
const guidesDir = join(apiDir, 'guides'); // Output HTML files

// Create guides directory if it doesn't exist
if (!existsSync(guidesDir)) {
	mkdirSync(guidesDir, { recursive: true });
}

// Helper function to generate slug from text (for anchor IDs)
function slugify(text) {
	// Ensure text is a string and extract plain text if it's HTML
	let textStr = String(text);
	// Remove HTML tags if present
	textStr = textStr.replace(/<[^>]*>/g, '');
	// Decode HTML entities
	textStr = textStr.replace(/&[#\w]+;/g, '');
	return textStr
		.toLowerCase()
		.replace(/[^\w\s-]/g, '') // Remove special characters
		.replace(/\s+/g, '-') // Replace spaces with hyphens
		.replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
		.trim();
}

// Create custom renderer to add IDs to headings
// We extend the default renderer to keep all default behavior
const defaultRenderer = new marked.Renderer();
const originalHeading = defaultRenderer.heading.bind(defaultRenderer);
const renderer = Object.assign(defaultRenderer, {
	heading(text, level) {
		// First, get the default rendered heading HTML
		const defaultHtml = originalHeading(text, level);

		// Extract plain text from the heading for ID generation
		// Remove HTML tags to get plain text
		const plainText = defaultHtml
			.replace(/<[^>]*>/g, '') // Remove HTML tags
			.replace(/^<h\d+[^>]*>/, '') // Remove opening tag
			.replace(/<\/h\d+>$/, '') // Remove closing tag
			.trim();

		const id = slugify(plainText);

		// Add ID to the heading tag
		return defaultHtml.replace(/^(<h\d+)([^>]*>)/, `$1 id="${id}"$2`);
	},
});

// Configure marked with all options at once
marked.setOptions({
	breaks: true,
	gfm: true,
	renderer: renderer,
});

// List of guide files with their titles
const guideFiles = [
	{ file: 'DEVELOPER_GUIDE.md', title: 'Developer Guide' },
	{ file: 'SCREEN_SWITCHING.md', title: 'Screen Switching Guide' },
	{ file: 'INPUT_HANDLING.md', title: 'Input Handling Guide' },
	{ file: 'CHARACTER_LOADING.md', title: 'Character Loading Guide' },
];

// Convert markdown to HTML and create HTML pages
guideFiles.forEach(({ file, title }) => {
	const source = join(guidesSourceDir, file);
	if (existsSync(source)) {
		// Read markdown content
		const markdown = readFileSync(source, 'utf8');

		// Convert to HTML - marked.parse() returns a string
		let htmlContent;
		try {
			htmlContent = marked.parse(markdown);
			// Ensure it's a string
			if (typeof htmlContent !== 'string') {
				htmlContent = String(htmlContent);
			}
		} catch (error) {
			console.error(`Error parsing ${file}:`, error);
			htmlContent = `<p>Error loading guide content.</p>`;
		}

		// Create HTML page with styling
		const htmlPage = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - Math Explorers: Galactic Quest</title>
    <link rel="stylesheet" href="../assets/style.css">
    <link rel="stylesheet" href="../assets/highlight.css">
    <style>
        html {
            scroll-behavior: smooth;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.7;
            color: #333;
            background: #fff;
        }
        @media (prefers-color-scheme: dark) {
            body {
                background: #1a1a1a;
                color: #e0e0e0;
            }
        }
        /* Smooth scrolling for anchor links */
        h1, h2, h3, h4, h5, h6 {
            scroll-margin-top: 20px;
        }
        /* Style anchor links */
        a[href^="#"] {
            color: #2563eb;
            text-decoration: none;
        }
        a[href^="#"]:hover {
            text-decoration: underline;
        }
        @media (prefers-color-scheme: dark) {
            a[href^="#"] {
                color: #60a5fa;
            }
        }
        .guide-header {
            border-bottom: 2px solid #e0e0e0;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .guide-header h1 {
            margin: 0 0 10px 0;
            color: #2563eb;
        }
        .guide-content {
            font-size: 16px;
        }
        .guide-content h1 {
            font-size: 2em;
            margin-top: 1.5em;
            margin-bottom: 0.5em;
            color: #2563eb;
            border-bottom: 2px solid #e0e0e0;
            padding-bottom: 0.3em;
        }
        .guide-content h2 {
            font-size: 1.5em;
            margin-top: 1.3em;
            margin-bottom: 0.5em;
            color: #2563eb;
        }
        .guide-content h3 {
            font-size: 1.2em;
            margin-top: 1.2em;
            margin-bottom: 0.5em;
            color: #4a5568;
        }
        .guide-content code {
            background: #f5f5f5;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
        }
        @media (prefers-color-scheme: dark) {
            .guide-content code {
                background: #2d2d2d;
                color: #f8f8f2;
            }
        }
        .guide-content pre {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
            border-left: 4px solid #2563eb;
        }
        @media (prefers-color-scheme: dark) {
            .guide-content pre {
                background: #2d2d2d;
            }
        }
        .guide-content pre code {
            background: none;
            padding: 0;
        }
        .guide-content ul, .guide-content ol {
            margin: 1em 0;
            padding-left: 2em;
        }
        .guide-content li {
            margin: 0.5em 0;
        }
        .guide-content blockquote {
            border-left: 4px solid #2563eb;
            padding-left: 1em;
            margin: 1em 0;
            color: #666;
            font-style: italic;
        }
        .guide-content table {
            border-collapse: collapse;
            width: 100%;
            margin: 1em 0;
        }
        .guide-content table th,
        .guide-content table td {
            border: 1px solid #e0e0e0;
            padding: 8px 12px;
            text-align: left;
        }
        .guide-content table th {
            background: #f5f5f5;
            font-weight: 600;
        }
        .back-link {
            display: inline-block;
            margin-bottom: 20px;
            padding: 8px 16px;
            background: #2563eb;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-weight: 500;
            font-size: 14px;
        }
        .back-link:hover {
            background: #1d4ed8;
        }
        .guide-nav {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
        }
        .guide-nav a {
            color: #2563eb;
            text-decoration: none;
            margin-right: 15px;
        }
        .guide-nav a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="guide-header">
        <a href="../guides.html" class="back-link">← Back to Guides</a>
        <h1>${title}</h1>
    </div>
    
    <div class="guide-content">
        ${htmlContent}
    </div>
    
    <div class="guide-nav">
        <a href="../guides.html">← Back to Guides</a>
        <a href="../index.html">← API Documentation</a>
    </div>
</body>
</html>`;

		// Write HTML file (without .md extension)
		const htmlFileName = file.replace('.md', '.html');
		const htmlPath = join(guidesDir, htmlFileName);
		writeFileSync(htmlPath, htmlPage);
		console.log(`Created HTML page: ${htmlFileName}`);

		// Also copy the markdown file for reference
		const mdPath = join(guidesDir, file);
		copyFileSync(source, mdPath);
	}
});

// Create a guides index HTML page
const guidesIndexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Developer Guides - Math Explorers: Galactic Quest</title>
    <link rel="stylesheet" href="../assets/style.css">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
            background: #1a1d29;
            color: #e2e8f0;
        }
        .guides-header {
            border-bottom: 2px solid #374151;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .guides-header h1 {
            margin: 0;
            color: #f3f4f6;
            font-size: 2.5em;
            font-weight: 700;
        }
        .guides-header p {
            color: #9ca3af;
            margin: 10px 0 0 0;
            font-size: 1.1em;
        }
        .guides-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 24px;
            margin-top: 30px;
        }
        .guide-card {
            border: 1px solid #374151;
            border-radius: 12px;
            padding: 24px;
            background: #252936;
            transition: all 0.3s ease;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
        .guide-card:hover {
            box-shadow: 0 8px 24px rgba(0,0,0,0.5);
            transform: translateY(-2px);
            border-color: #4b5563;
            background: #2d3142;
        }
        .guide-card h2 {
            margin: 0 0 12px 0;
            color: #60a5fa;
            font-size: 1.5em;
            font-weight: 600;
        }
        .guide-card p {
            color: #d1d5db;
            margin: 0 0 18px 0;
            line-height: 1.6;
        }
        .guide-link {
            display: inline-block;
            color: #60a5fa;
            text-decoration: none;
            font-weight: 600;
            font-size: 0.95em;
            transition: color 0.2s;
        }
        .guide-link:hover {
            color: #93c5fd;
            text-decoration: underline;
        }
        .back-link {
            display: inline-block;
            margin-top: 40px;
            padding: 10px 20px;
            background: #3b82f6;
            color: #ffffff;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            transition: background 0.2s;
        }
        .back-link:hover {
            background: #2563eb;
            color: #ffffff;
        }
    </style>
</head>
<body>
    <div class="guides-header">
        <h1>Developer Guides</h1>
        <p>Step-by-step guides for developing Math Explorers: Galactic Quest</p>
    </div>
    
    <div class="guides-grid">
        <div class="guide-card">
            <h2>Developer Guide</h2>
            <p>Overview of the codebase architecture, quick start guide, and common development tasks.</p>
            <a href="guides/DEVELOPER_GUIDE.html" class="guide-link">Read Guide →</a>
        </div>
        
        <div class="guide-card">
            <h2>Screen Switching</h2>
            <p>Learn how the screen management system works and how to add new screens to the game.</p>
            <a href="guides/SCREEN_SWITCHING.html" class="guide-link">Read Guide →</a>
        </div>
        
        <div class="guide-card">
            <h2>Input Handling</h2>
            <p>Guide to handling keyboard input with InputManager and mouse/click events with Konva.</p>
            <a href="guides/INPUT_HANDLING.html" class="guide-link">Read Guide →</a>
        </div>
        
        <div class="guide-card">
            <h2>Character Loading</h2>
            <p>Complete guide to loading sprites, creating animations, and managing characters.</p>
            <a href="guides/CHARACTER_LOADING.html" class="guide-link">Read Guide →</a>
        </div>
    </div>
    
    <a href="index.html" class="back-link">← Back to API Documentation</a>
</body>
</html>`;

writeFileSync(join(apiDir, 'guides.html'), guidesIndexHtml);
console.log('Created guides index page: docs/api/guides.html');

// Developer Guides sidebar section HTML
const developerGuidesSidebar = `
<div class="tsd-developer-guides" style="margin-top: 20px; padding: 12px; background: #1e293b; border-radius: 6px; border: 1px solid #334155;">
	<a href="guides.html" style="color: #60a5fa; text-decoration: none; font-size: 0.95em; font-weight: 500; display: block;">
		📚 Check out Developer Guides →
	</a>
</div>`;

// Function to add developer guides to sidebar
function addGuidesToSidebar(htmlContent, relativePath = '') {
	// Skip if already added
	if (htmlContent.includes('tsd-developer-guides')) {
		return htmlContent;
	}

	// Calculate relative path for guides (e.g., '../guides.html' for subdirectories)
	let guidesPath = 'guides.html';
	if (relativePath) {
		const depth = relativePath.split('/').filter((p) => p && p !== '.').length;
		if (depth > 0) {
			guidesPath = '../'.repeat(depth) + 'guides.html';
		}
	}

	// Create the sidebar HTML with correct path
	const guidesHtml = developerGuidesSidebar.replace(/href="guides\.html"/g, `href="${guidesPath}"`);

	// Find the page-menu div and insert after the Settings accordion
	const afterSettingsPattern =
		/(<\/details><\/div>)(<details open class="tsd-accordion tsd-page-navigation">)/;

	// Try to insert after Settings accordion
	if (afterSettingsPattern.test(htmlContent)) {
		return htmlContent.replace(afterSettingsPattern, `$1${guidesHtml}$2`);
	}

	// Fallback: insert after page-menu opening tag
	const pageMenuPattern = /(<div class="page-menu">)/;
	if (pageMenuPattern.test(htmlContent)) {
		return htmlContent.replace(pageMenuPattern, `$1${guidesHtml}`);
	}

	return htmlContent;
}

// Try to modify the TypeDoc index.html to add a link to guides
try {
	const indexPath = join(apiDir, 'index.html');
	let indexContent = readFileSync(indexPath, 'utf8');

	// Add a link to guides in the page content (before the closing div)
	const guidesLink =
		'<div class="tsd-panel tsd-typography" style="margin-top: 20px;"><h2>Developer Guides</h2><p>Check out our <a href="guides.html" style="color: #2563eb; font-weight: 500;">step-by-step developer guides</a> for detailed instructions on screen switching, input handling, character loading, and more.</p></div>';

	// Insert before the closing </div> of col-content
	const insertPoint = indexContent.indexOf('</div></div><div class="col-sidebar">');
	if (insertPoint !== -1) {
		indexContent =
			indexContent.slice(0, insertPoint) + guidesLink + indexContent.slice(insertPoint);
	}

	// Add developer guides to sidebar
	indexContent = addGuidesToSidebar(indexContent);
	writeFileSync(indexPath, indexContent);
	console.log('Added guides link to index.html');
} catch (error) {
	console.warn('Could not modify index.html:', error.message);
}

// Add developer guides sidebar to all HTML files in docs/api
function processAllHtmlFiles(dir, relativePath = '') {
	const files = readdirSync(dir);

	for (const file of files) {
		const filePath = join(dir, file);
		const stat = statSync(filePath);

		if (stat.isDirectory()) {
			// Skip guides directory and assets directory
			if (file !== 'guides' && file !== 'assets') {
				processAllHtmlFiles(filePath, join(relativePath, file));
			}
		} else if (file.endsWith('.html') && file !== 'guides.html' && file !== 'index.html') {
			try {
				let content = readFileSync(filePath, 'utf8');

				// Only process if it's a TypeDoc-generated page (has col-sidebar)
				if (content.includes('col-sidebar')) {
					const newContent = addGuidesToSidebar(content, relativePath);
					if (newContent !== content) {
						writeFileSync(filePath, newContent);
						console.log(`Added developer guides sidebar to ${join(relativePath, file)}`);
					}
				}
			} catch (error) {
				console.warn(`Could not process ${filePath}:`, error.message);
			}
		}
	}
}

// Process all HTML files
try {
	processAllHtmlFiles(apiDir);
} catch (error) {
	console.warn('Could not process all HTML files:', error.message);
}

console.log('Post-processing complete!');
