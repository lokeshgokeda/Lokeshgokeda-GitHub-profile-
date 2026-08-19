# Lokesh Gokeda — GitHub Developer Portfolio

This is a static GitHub Pages portfolio configured specifically for **lokeshgokeda**.

## What it does

When someone opens the site, it automatically loads your public GitHub profile and repositories. There is no username/login form.

It displays:
- GitHub profile and avatar
- Bio
- Followers
- Public repository count
- Total stars
- Total forks
- Live repository cards
- Repository descriptions and languages
- Links to each GitHub repository
- Automatic GitHub Pages links when GitHub reports `has_pages`
- Language distribution
- Most-starred projects
- Responsive mobile/desktop UI

## Important Pages-link behavior

The GitHub API exposes a repository's `has_pages` flag. When it is true, the app generates:

`https://lokeshgokeda.github.io/REPOSITORY_NAME/`

For repositories using a different Pages/custom-domain setup, the repository link is still shown.

## Deploy to GitHub Pages

Upload these files to the **root** of your repository:

- index.html
- style.css
- app.js

Then:
1. Repository → Settings
2. Pages
3. Source: Deploy from a branch
4. Branch: main
5. Folder: / (root)
6. Save

After publishing, your URL will normally be:

`https://lokeshgokeda.github.io/REPOSITORY-NAME/`

## No token required

The project uses GitHub's public REST API. Do not put a personal access token into frontend JavaScript.

## Custom links

The email button is intentionally blank because no email address was provided in this request. Change `href="mailto:"` in `index.html` if you want to add a public contact email.

## Note about GitHub Pages links

GitHub's API reports whether a repository has GitHub Pages enabled. A repository may have Pages configured on a custom domain or with a configuration that differs from the default `username.github.io/repository` pattern. For those cases, the repository link remains available.
