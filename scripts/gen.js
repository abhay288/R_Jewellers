const fs = require('fs');
const path = require('path');

const models = ['Admin', 'Product', 'Category', 'Cart', 'Wishlist', 'Order', 'OrderItem', 'Address', 'Inventory', 'Review', 'Coupon', 'Banner', 'Return', 'Refund', 'Notification', 'Setting'];
const repoDir = path.join(process.cwd(), 'src', 'repositories');
const serviceDir = path.join(process.cwd(), 'src', 'services');

if (!fs.existsSync(repoDir)) fs.mkdirSync(repoDir, { recursive: true });
if (!fs.existsSync(serviceDir)) fs.mkdirSync(serviceDir, { recursive: true });

models.forEach(model => {
  // Repo
  let repoContent = `import { BaseRepository } from './BaseRepository';\nimport ${model} from '../models/${model}';\n\nexport class ${model}Repository extends BaseRepository<any> {\n  constructor() {\n    super(${model});\n  }\n}\n`;
  fs.writeFileSync(path.join(repoDir, `${model}Repository.ts`), repoContent);

  // Service
  let serviceContent = `import { ${model}Repository } from '../repositories/${model}Repository';\n\nexport class ${model}Service {\n  private repository: ${model}Repository;\n\n  constructor() {\n    this.repository = new ${model}Repository();\n  }\n\n  // TODO: Implement business logic in future phases\n}\n`;
  fs.writeFileSync(path.join(serviceDir, `${model}Service.ts`), serviceContent);
});

// Create User service (UserRepository is already there)
let serviceContentUser = `import { UserRepository } from '../repositories/UserRepository';\n\nexport class UserService {\n  private repository: UserRepository;\n\n  constructor() {\n    this.repository = new UserRepository();\n  }\n\n  // TODO: Implement business logic in future phases\n}\n`;
fs.writeFileSync(path.join(serviceDir, `UserService.ts`), serviceContentUser);

console.log('Done');
