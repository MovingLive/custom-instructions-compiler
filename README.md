
# GitHub Custom Instructions Compiler

Library of Custom Instructions for GitHub Copilot users.

🔗 [https://movinglive.github.io/custom-instructions-compiler/](https://movinglive.github.io/custom-instructions-compiler/)

## Technologies Used

- [React](https://reactjs.org/) with TypeScript.
- [Vite](https://vitejs.dev/) for bundling.
- [Tailwind CSS](https://tailwindcss.com/) for styling.
- [Octokit](https://github.com/octokit/octokit.js) for interacting with the GitHub API.

## Installation

Install dependencies using npm:

```sh
npm install
```

## Usage

To run the application in development mode:

```sh
npm run dev
```

To build the application for production:

```sh
npm run build
```

To preview the production build:

```sh
npm run preview
```

## Configuration

- The application's entry point is [`index.html`](index.html), which loads the script [`src/main.tsx`](src/main.tsx).
- Vite configuration is located in [`vite.config.ts`](vite.config.ts).
- TypeScript configurations are defined in [`tsconfig.json`](tsconfig.json), [`tsconfig.app.json`](tsconfig.app.json), and [`tsconfig.node.json`](tsconfig.node.json).
- ESLint configuration is available in [`eslint.config.js`](eslint.config.js).
- Styling is managed using Tailwind CSS, configured in [`tailwind.config.js`](tailwind.config.js) and [`postcss.config.js`](postcss.config.js).

## Deployment

Continuous deployment is set up with GitHub Actions in the file [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). The application is deployed to GitHub Pages.

## License

This project is licensed under the GNU GPLv3 license. See the [`LICENSE`](LICENSE) file for more details.
