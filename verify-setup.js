const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Vercel deployment setup...\n');

const checks = [
  {
    name: 'vercel.json exists',
    check: () => fs.existsSync('vercel.json'),
    fix: 'Create vercel.json in root directory'
  },
  {
    name: 'frontend/package.json exists',
    check: () => fs.existsSync('frontend/package.json'),
    fix: 'Ensure frontend directory has package.json'
  },
  {
    name: 'frontend/public/index.html exists',
    check: () => fs.existsSync('frontend/public/index.html'),
    fix: 'Create index.html in frontend/public directory'
  },
  {
    name: 'frontend has vercel-build script',
    check: () => {
      const pkg = JSON.parse(fs.readFileSync('frontend/package.json', 'utf8'));
      return pkg.scripts && pkg.scripts['vercel-build'];
    },
    fix: 'Add "vercel-build" script to frontend/package.json'
  },
  {
    name: '.vercelignore exists',
    check: () => fs.existsSync('.vercelignore'),
    fix: 'Create .vercelignore file'
  }
];

let allPassed = true;

checks.forEach(({ name, check, fix }) => {
  const passed = check();
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} ${name}`);
  if (!passed) {
    console.log(`   Fix: ${fix}\n`);
    allPassed = false;
  }
});

console.log('\n' + '='.repeat(50));
if (allPassed) {
  console.log('✅ All checks passed! Ready to deploy to Vercel.');
  console.log('\nNext steps:');
  console.log('1. git add .');
  console.log('2. git commit -m "Configure Vercel deployment"');
  console.log('3. git push origin master');
  console.log('4. Connect repository to Vercel');
} else {
  console.log('❌ Some checks failed. Please fix the issues above.');
}
console.log('='.repeat(50) + '\n');
