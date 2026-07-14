const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const replacements = [
  { regex: /@\/components/g, replacement: '@/frontend/components' },
  { regex: /@\/store/g, replacement: '@/frontend/store' },
  { regex: /@\/app\/actions/g, replacement: '@/backend/actions' },
  { regex: /@\/models/g, replacement: '@/backend/models' },
  { regex: /@\/repositories/g, replacement: '@/backend/repositories' },
  { regex: /@\/services/g, replacement: '@/backend/services' },
  { regex: /@\/lib/g, replacement: '@/shared/lib' },
  { regex: /@\/utils/g, replacement: '@/shared/utils' },
  { regex: /@\/validations/g, replacement: '@/shared/validations' },
  // Some relative imports within app that might exist:
  // Usually Next.js recommends `@/` but just in case:
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf-8');
      let originalContent = content;

      for (const { regex, replacement } of replacements) {
        content = content.replace(regex, replacement);
      }

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf-8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory(srcDir);
// Also process the root files like auth.ts, middleware.ts, etc.
const rootFiles = ['auth.ts', 'auth.config.ts', 'middleware.ts'];
for (const file of rootFiles) {
  const fullPath = path.join(srcDir, file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf-8');
    let originalContent = content;

    for (const { regex, replacement } of replacements) {
      content = content.replace(regex, replacement);
    }

    if (content !== originalContent) {
      fs.writeFileSync(fullPath, content, 'utf-8');
      console.log(`Updated ${fullPath}`);
    }
  }
}

console.log("Done");
