# GitHub Custom Instructions Compiler

Librairie de Custom Instructions destinée aux utilisateurs de GitHub Copilot.


🔗 [https://movinglive.github.io/custom-instructions-compiler/](https://movinglive.github.io/custom-instructions-compiler/)

## Technologies utilisées

- [React](https://reactjs.org/) avec TypeScript.
- [Vite](https://vitejs.dev/) pour le bundling.
- [Tailwind CSS](https://tailwindcss.com/) pour le stylage.
- [Octokit](https://github.com/octokit/octokit.js) pour interagir avec l'API GitHub.

## Installation

Installez les dépendances avec npm :

```sh
npm install
```

## Utilisation

Pour lancer l'application en mode développement :

```sh
npm run dev
```

Pour construire l'application pour la production :

```sh
npm run build
```

Pour prévisualiser l'application de production :

```sh
npm run preview
```

## Configuration

- Le point d'entrée de l'application est [`index.html`](index.html), qui charge le script [`src/main.tsx`](src/main.tsx).
- La configuration de Vite se trouve dans [`vite.config.ts`](vite.config.ts).
- Les configurations TypeScript sont définies dans [`tsconfig.json`](tsconfig.json), [`tsconfig.app.json`](tsconfig.app.json) et [`tsconfig.node.json`](tsconfig.node.json).
- La configuration ESLint est disponible dans [`eslint.config.js`](eslint.config.js).
- Les styles sont gérés avec Tailwind CSS et configurés dans [`tailwind.config.js`](tailwind.config.js) et [`postcss.config.js`](postcss.config.js).

## Déploiement

Le déploiement continu est mis en place avec GitHub Actions dans le fichier [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). L'application est déployée sur GitHub Pages.

## Licence

Ce projet est sous licence GNU GPLv3. Voir le fichier [`LICENSE`](LICENSE) pour plus d'informations.