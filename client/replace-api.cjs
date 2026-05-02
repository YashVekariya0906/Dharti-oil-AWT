const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src');

function walkDir(currentPath) {
  const files = fs.readdirSync(currentPath);
  for (const file of files) {
    const fullPath = path.join(currentPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('http://localhost:5000')) {
        content = content.replace(/(['"`])http:\/\/localhost:5000(.*?)(['"`])/g, 'import.meta.env.VITE_API_URL + $1$2$3');
        // If they use template literals like `http://localhost:5000/api...`
        content = content.replace(/http:\/\/localhost:5000/g, '${import.meta.env.VITE_API_URL}');
        
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Updated', fullPath);
      }
    }
  }
}

walkDir(dir);
console.log('Done!');
