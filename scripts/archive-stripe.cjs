const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const archivePath = path.join(repoRoot, 'docs', 'stripe-legacy.md');

function walk(dir){
  let results = [];
  let list;
  try{
    list = fs.readdirSync(dir);
  } catch (e) {
    return results; // skip unreadable dirs
  }
  list.forEach(file => {
    const p = path.join(dir, file);
    // skip large or irrelevant dirs early
    if (/node_modules|\.git|\.expo|ios\/Pods|android|build/.test(p)) return;
    let stat;
    try{
      stat = fs.statSync(p);
    } catch (e){
      return; // skip files that cause stat errors
    }
    if(stat && stat.isDirectory()){
      results = results.concat(walk(p));
    } else {
      results.push(p);
    }
  });
  return results;
}

function isMarkdown(file){
  return file.endsWith('.md');
}

function containsStripe(content){
  return /stripe/i.test(content);
}

function redactKeys(content){
  content = content.replace(/sk_test_[A-Za-z0-9_\-]+/g, 'sk_test_<REDACTED>');
  content = content.replace(/pk_test_[A-Za-z0-9_\-]+/g, 'pk_test_<REDACTED>');
  return content;
}

function removeEnvLines(content){
  content = content.replace(/^\s*EXPO_PUBLIC_STRIPE_[A-Z0-9_]+=.*$/gmi, 'EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_<REDACTED>');
  content = content.replace(/^\s*STRIPE_SECRET_KEY=.*$/gmi, 'STRIPE_SECRET_KEY=sk_test_<REDACTED>');
  return content;
}

function prependBanner(content){
  const banner = '> NOTE: Legacy Stripe content consolidated to `docs/stripe-legacy.md` and sensitive keys redacted. See that file for archived details.\n>\n';
  if(content.includes('Legacy Stripe content consolidated to `docs/stripe-legacy.md`')) return content;
  return banner + content;
}

function appendArchive(filename, snippet){
  const header = `\n---\n\n### Archived from: ${path.relative(repoRoot, filename)}\n\n`;
  fs.appendFileSync(archivePath, header + snippet + '\n');
}

function snippetAroundStripe(content){
  const lines = content.split(/\r?\n/);
  let matches = [];
  for(let i=0;i<lines.length;i++){
    if(/stripe/i.test(lines[i])){
      const start = Math.max(0, i-2);
      const end = Math.min(lines.length-1, i+2);
      matches.push(lines.slice(start, end+1).join('\n'));
    }
  }
  return matches.join('\n...\n');
}

function main(){
  const allFiles = walk(repoRoot);
  const mdFiles = allFiles.filter(isMarkdown).filter(f => !f.includes('node_modules') && !f.includes('.git'));
  let touched = [];
  mdFiles.forEach(file => {
    try{
      const content = fs.readFileSync(file, 'utf8');
      if(containsStripe(content) && path.resolve(file) !== path.resolve(archivePath)){
        let newContent = content;
        const snippet = snippetAroundStripe(content) || '';
        newContent = redactKeys(newContent);
        newContent = removeEnvLines(newContent);
        newContent = prependBanner(newContent);
        if(newContent !== content){
          fs.writeFileSync(file, newContent, 'utf8');
          touched.push(file);
          const safeSnippet = snippet ? '````\n' + snippet + '\n````' : '(no snippet extracted)';
          appendArchive(file, safeSnippet);
        }
      }
    } catch(e){
      console.error('error processing', file, e.message);
    }
  });
  console.log('Touched files:', touched.length);
  touched.forEach(f => console.log(' -', path.relative(repoRoot, f)));
}

main();
