<<<<<<< HEAD
const { createWriteStream, readdirSync, statSync } = require('fs');
const { SitemapStream, streamToPromise } = require('sitemap');
const { resolve, join } = require('path');

// Fonction récursive pour parcourir les dossiers et trouver les fichiers HTML
const getAllHtmlFiles = (dir, fileList = []) => {
  const files = readdirSync(dir);

  files.forEach(file => {
    const filePath = join(dir, file);
    if (statSync(filePath).isDirectory()) {
      getAllHtmlFiles(filePath, fileList);
    } else if (file.endsWith('.html')) {
      // Extraire le chemin relatif pour l'ajouter au sitemap
      const relativePath = filePath.replace(__dirname, '').replace(/\\/g, '/');
      fileList.push(relativePath);
    }
  });

  return fileList;
};

// Définir le répertoire racine (dossier racine de votre projet)
const rootDir = resolve(__dirname);

// Récupérer tous les fichiers HTML dans le répertoire et ses sous-dossiers
const htmlFiles = getAllHtmlFiles(rootDir).map(file => ({
  url: file, // Utilise le chemin relatif pour générer l'URL dans le sitemap
  changefreq: 'monthly',
  priority: 0.7
}));

// Créer et générer le sitemap
const generateSitemap = async () => {
  try {
    const sitemapStream = new SitemapStream({ hostname: 'https://lanortrad.netlify.app' });
    const writeStream = createWriteStream(resolve(__dirname, 'sitemap.xml'));

    // Ajouter les fichiers HTML dans le flux
    htmlFiles.forEach(file => sitemapStream.write(file));
    sitemapStream.end();

    // Convertir le flux en XML et l'écrire dans le fichier
    await streamToPromise(sitemapStream).then(data => {
      writeStream.write(data.toString());
    });

    console.log('Sitemap generated successfully!');
  } catch (err) {
    console.error('Error generating sitemap:', err);
  }
};

// Exécuter la fonction pour générer le sitemap
generateSitemap();
=======
const { createWriteStream, readdirSync, statSync } = require('fs');
const { SitemapStream, streamToPromise } = require('sitemap');
const { resolve, join } = require('path');

// Fonction récursive pour parcourir les dossiers et trouver les fichiers HTML
const getAllHtmlFiles = (dir, fileList = []) => {
  const files = readdirSync(dir);

  files.forEach(file => {
    const filePath = join(dir, file);
    if (statSync(filePath).isDirectory()) {
      getAllHtmlFiles(filePath, fileList);
    } else if (file.endsWith('.html')) {
      // Extraire le chemin relatif pour l'ajouter au sitemap
      const relativePath = filePath.replace(__dirname, '').replace(/\\/g, '/');
      fileList.push(relativePath);
    }
  });

  return fileList;
};

// Définir le répertoire racine (dossier racine de votre projet)
const rootDir = resolve(__dirname);

// Récupérer tous les fichiers HTML dans le répertoire et ses sous-dossiers
const htmlFiles = getAllHtmlFiles(rootDir).map(file => ({
  url: file, // Utilise le chemin relatif pour générer l'URL dans le sitemap
  changefreq: 'monthly',
  priority: 0.7
}));

// Créer et générer le sitemap
const generateSitemap = async () => {
  try {
    const sitemapStream = new SitemapStream({ hostname: 'https://lanortrad.netlify.app' });
    const writeStream = createWriteStream(resolve(__dirname, 'sitemap.xml'));

    // Ajouter les fichiers HTML dans le flux
    htmlFiles.forEach(file => sitemapStream.write(file));
    sitemapStream.end();

    // Convertir le flux en XML et l'écrire dans le fichier
    await streamToPromise(sitemapStream).then(data => {
      writeStream.write(data.toString());
    });

    console.log('Sitemap generated successfully!');
  } catch (err) {
    console.error('Error generating sitemap:', err);
  }
};

// Exécuter la fonction pour générer le sitemap
generateSitemap();
>>>>>>> 140a293e8702e83ce2acd7fe1f601c6093d0f973
