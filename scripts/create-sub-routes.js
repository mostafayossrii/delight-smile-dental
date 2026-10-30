const fs = require('fs');
const path = require('path');

const routes = [
  'patients',
  'appointments',
  'odontogram',
  'treatment-plans',
  'finance',
  'inventory',
  'insurance',
  'labs',
  'attendance',
  'staff',
  'reports',
  'settings',
  'audit'
];

routes.forEach((r) => {
  const dir = path.join(process.cwd(), 'src', 'app', r);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const tab = r.replace('-', '_');
  const fileContent = "import DelightSmileApp from '@/components/DelightSmileApp';\n\nexport default function " +
    r.replace(/[-_](\w)/g, (_, c) => c.toUpperCase()).replace(/^\w/, c => c.toUpperCase()) +
    "Page() {\n  return <DelightSmileApp initialTab=\"" + tab + "\" />;\n}\n";
  fs.writeFileSync(path.join(dir, 'page.tsx'), fileContent);
  console.log('Created route:', r);
});
