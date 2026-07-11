const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('./src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Replace hardcoded strings like "$299.00" -> "₹299.00"
    content = content.replace(/"\$([0-9.,]+)"/g, '"₹$1"');
    
    // Replace JSX text like >$25.00< -> >₹25.00<
    content = content.replace(/>\$([0-9.,]+)</g, '>₹$1<');

    // Replace JSX text like >${item.price.toFixed(2)}< -> >₹${item.price.toFixed(2)}<
    content = content.replace(/>\$\{([^}]+)\}</g, '>₹${$1}<');
    
    // Replace parseFloat(product.price.replace('$', '')) with '₹'
    content = content.replace(/replace\('\$', ''\)/g, "replace('₹', '')");
    
    // Replace text inside paragraphs like "over $200" -> "over ₹200"
    content = content.replace(/ \$([0-9.,]+)/g, ' ₹$1');
    content = content.replace(/\(\$([0-9.,]+)\)/g, '(₹$1)');

    // Replace tickFormatter={(value) => `\$${value}`} -> `₹${value}`
    content = content.replace(/`\$(\$\{[^}]+\})`/g, '`₹$1`');
    
    // Replace price: `$${...}` -> price: `₹${...}`
    content = content.replace(/`\$\$\{/g, '`₹${');
    
    // Replace price: "$..." -> price: "₹..."
    content = content.replace(/price: "\$([0-9.,]+)"/g, 'price: "₹$1"');

    if (original !== content) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated:', filePath);
    }
  }
});
