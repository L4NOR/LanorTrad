const fs = require('fs');
const path = require('path');

// Dossier où se trouvent les fichiers
const directoryPath = './votre_dossier/';

// Parcourir les fichiers du dossier
for (let i = 1; i <= 31; i++) {
    const paddedNumber = String(i).padStart(2, '0'); // Pour avoir un format de deux chiffres
    const fileName = `Tome ${paddedNumber}.html`;
    const filePath = path.join(directoryPath, fileName);

    // Vérifier si le fichier existe
    if (fs.existsSync(filePath)) {
        // Lire le contenu du fichier
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                console.error(`Erreur de lecture du fichier ${fileName}:`, err);
                return;
            }

            // Remplacer le titre
            const newTitle = `Ao No Exorcist - Tome ${paddedNumber} - LanorTrad`;
            const modifiedData = data.replace(/<title>.*<\/title>/, `<title>${newTitle}</title>`);

            // Écrire le contenu modifié dans le fichier
            fs.writeFile(filePath, modifiedData, 'utf8', (err) => {
                if (err) {
                    console.error(`Erreur d'écriture dans le fichier ${fileName}:`, err);
                } else {
                    console.log(`Titre modifié pour ${fileName}`);
                }
            });
        });
    } else {
        console.log(`Le fichier ${fileName} n'existe pas.`);
    }
}
