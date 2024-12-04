import fs from 'fs';
import path from 'path';

function walkDir(dir, baseDir) {
  let results = [];
  const list = fs.readdirSync(dir);

  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    const relativePath = path.relative(baseDir, filePath);

    if (stat && stat.isDirectory()) {
      results.push({
        path: relativePath,
        type: 'tree'
      });
      results = results.concat(walkDir(filePath, baseDir));
    } else {
      results.push({
        path: relativePath,
        type: 'file'
      });
    }
  });

  return results;
}

// Détermine si on est en mode déploiement
const isDeployment = process.argv.includes('--deploy');

// Choix du dossier selon le contexte
const baseDir = process.cwd();
const targetDir = isDeployment
  ? path.join(baseDir, 'dist', 'custom-instructions-lib')
  : path.join(baseDir, 'custom-instructions-lib');

// Créer le dossier s'il n'existe pas (seulement en mode local)
if (!isDeployment && !fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Générer la liste des fichiers
const items = fs.readdirSync(targetDir).length === 0
  ? []
  : walkDir(targetDir, targetDir);

// Créer le fichier file-list.json
fs.writeFileSync(
  path.join(targetDir, 'file-list.json'),
  JSON.stringify(items, null, 2)
);

console.log(`File list generated successfully in ${isDeployment ? 'deployment' : 'local'} mode`);