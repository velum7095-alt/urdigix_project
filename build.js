const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function cleanDir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

try {
  console.log('Cleaning build target directories...');
  cleanDir('dist');
  cleanDir('api');

  console.log('Building frontend app...');
  execSync('npm run build --workspace=frontend', { stdio: 'inherit' });

  console.log('Building admin CRM app...');
  execSync('npm run build --workspace=admin', { stdio: 'inherit' });

  console.log('Creating combined dist folder...');
  fs.mkdirSync('dist', { recursive: true });
  
  // Copy frontend/dist to root dist
  console.log('Copying frontend assets...');
  fs.cpSync('frontend/dist', 'dist', { recursive: true });

  // Copy admin/dist to root dist/admin
  console.log('Copying admin assets to dist/admin...');
  fs.mkdirSync('dist/admin', { recursive: true });
  fs.cpSync('admin/dist', 'dist/admin', { recursive: true });

  // Copy backend/api to root api for Vercel Functions
  console.log('Copying backend API serverless functions...');
  fs.cpSync('backend/api', 'api', { recursive: true });

  console.log('Deployment build ready!');
} catch (err) {
  console.error('Build failed:', err);
  process.exit(1);
}
