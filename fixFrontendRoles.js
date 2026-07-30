const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Pattern 1: user?.role === 'admin' -> (user?.role === 'admin' || user?.role === 'superadmin')
  content = content.replace(/user\?\.role === 'admin'(?! \|\| user\?\.role === 'superadmin')/g, "(user?.role === 'admin' || user?.role === 'superadmin')");
  
  // Pattern 2: user.role === 'admin' -> (user.role === 'admin' || user.role === 'superadmin')
  content = content.replace(/user\.role === 'admin'(?! \|\| user\.role === 'superadmin')/g, "(user.role === 'admin' || user.role === 'superadmin')");

  // Pattern 3: employee.role === 'admin' -> (employee.role === 'admin' || employee.role === 'superadmin')
  // wait, employee.role is already handled in EmployeeCard.tsx. Let's still do it safely.
  content = content.replace(/employee\.role === 'admin'(?! \|\| employee\.role === 'superadmin')/g, "(employee.role === 'admin' || employee.role === 'superadmin')");

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      replaceInFile(fullPath);
    }
  }
}

walkDir(path.join(__dirname, 'src'));
console.log('Finished updating role checks.');
