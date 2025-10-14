const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');

function walk(dir){
  let results = [];
  let list;
  try{ list = fs.readdirSync(dir); } catch { return results; }
  list.forEach(file => {
    const p = path.join(dir, file);
    if (/node_modules|\.git|\.expo|ios\/Pods|android|build/.test(p)) return;
    let stat;
    try{ stat = fs.statSync(p); } catch { return; }
    if(stat && stat.isDirectory()){
      results = results.concat(walk(p));
    } else {
      results.push(p);
    }
  });
  return results;
}

function isTextFile(file){
  return /\.md$|\.txt$|\.json$|\.mdx$|\.html$|\.yml$|\.yaml$/.test(file);
}

function replaceStripeMatch(match){
  if(match === match.toUpperCase()) return 'BRAINTREE';
  if(match[0] === match[0].toUpperCase()) return 'Braintree';
  return 'braintree';
}

function processFile(file){
  try{
    let content = fs.readFileSync(file,'utf8');
    let orig = content;
    // replace stripe (case-insensitive) with braintree preserving case
    content = content.replace(/stripe/gi, m => replaceStripeMatch(m));
    // env var replacements
    content = content.replace(/EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY/g, 'EXPO_PUBLIC_BRAINTREE_PUBLIC_KEY');
    content = content.replace(/STRIPE_SECRET_KEY/g, 'BRAINTREE_PRIVATE_KEY');
    content = content.replace(/STRIPE_/g, 'BRAINTREE_');
    if(content !== orig){
      fs.writeFileSync(file, content, 'utf8');
      return true;
    }
  } catch(e){
    // ignore
  }
  return false;
}

function main(){
  const all = walk(repoRoot);
  const files = all.filter(isTextFile);
  let touched = [];
  files.forEach(f => {
    if(processFile(f)) touched.push(f);
  });

  // handle docs/stripe-legacy.md rename if exists
  const oldArchive = path.join(repoRoot,'docs','stripe-legacy.md');
  const newArchive = path.join(repoRoot,'docs','braintree-legacy.md');
  if(fs.existsSync(oldArchive)){
    let content = fs.readFileSync(oldArchive,'utf8');
    content = content.replace(/stripe/gi, m => replaceStripeMatch(m));
    fs.writeFileSync(oldArchive, content, 'utf8');
    try{ fs.renameSync(oldArchive, newArchive); touched.push(oldArchive); touched.push(newArchive); } catch(e){ }
  }

  console.log('Replaced occurrences in', touched.length, 'files');
  touched.forEach(f => console.log(' -', path.relative(repoRoot, f)));
}

main();
