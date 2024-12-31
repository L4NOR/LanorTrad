const MANGAS = [
    'ao no exorcist',
    'satsudou',
    'tokyo underworld',
    'tougen anki',
    'wild strawberry'
];

const GITHUB_REPO = 'L4NOR/LanorTrad';

// État des uploads
let uploadState = {};
MANGAS.forEach(manga => {
    uploadState[manga] = {
        images: [],
        chapter: null,
        status: 'idle'
    };
});

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('uploadSections');
    
    MANGAS.forEach(manga => {
        const section = createUploadSection(manga);
        container.appendChild(section);
    });
});

// Création d'une section d'upload pour un manga
function createUploadSection(manga) {
    const section = document.createElement('div');
    section.className = `p-6 rounded-lg border border-gray-700 bg-gray-800/50`;
    
    section.innerHTML = `
        <h2 class="text-xl font-bold text-white mb-4" style="color: black;">${manga}</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Images Upload -->
            <div class="space-y-4">
                <label class="block text-sm font-medium text-gray-300">Images du chapitre</label>
                <div class="flex items-center justify-center w-full h-32 px-4 border-2 border-dashed rounded-lg border-gray-600 hover:border-indigo-500 transition-colors">
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        class="hidden"
                        id="${manga}-images"
                        onchange="handleImageUpload('${manga}', this.files)"
                    >
                    <label for="${manga}-images" class="flex flex-col items-center cursor-pointer">
                        <i class="fas fa-upload text-2xl mb-2 text-gray-400"></i>
                        <span class="text-sm text-gray-400" id="${manga}-images-label">
                            Sélectionner les images
                        </span>
                    </label>
                </div>
            </div>

            <!-- Chapter HTML Upload -->
            <div class="space-y-4">
                <label class="block text-sm font-medium text-gray-300">Fichier HTML du chapitre</label>
                <div class="flex items-center justify-center w-full h-32 px-4 border-2 border-dashed rounded-lg border-gray-600 hover:border-indigo-500 transition-colors">
                    <input
                        type="file"
                        accept=".html"
                        class="hidden"
                        id="${manga}-chapter"
                        onchange="handleChapterUpload('${manga}', this.files[0])"
                    >
                    <label for="${manga}-chapter" class="flex flex-col items-center cursor-pointer">
                        <i class="fas fa-file-code text-2xl mb-2 text-gray-400"></i>
                        <span class="text-sm text-gray-400" id="${manga}-chapter-label">
                            Sélectionner le fichier HTML
                        </span>
                    </label>
                </div>
            </div>
        </div>

        <!-- Upload Button -->
        <div class="mt-6 flex justify-end">
            <button
                onclick="handleSubmit('${manga}')"
                id="${manga}-submit"
                class="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium transition-colors"
                disabled
            >
                Uploader
            </button>
        </div>
    `;

    return section;
}

// Gestion des uploads d'images
function handleImageUpload(manga, files) {
    uploadState[manga].images = Array.from(files);
    document.getElementById(`${manga}-images-label`).textContent = 
        `${files.length} image(s) sélectionnée(s)`;
    updateSubmitButton(manga);
}

// Gestion de l'upload du fichier HTML
function handleChapterUpload(manga, file) {
    if (file && file.type === 'text/html') {
        uploadState[manga].chapter = file;
        document.getElementById(`${manga}-chapter-label`).textContent = file.name;
        updateSubmitButton(manga);
    }
}

// Mise à jour du bouton Submit
function updateSubmitButton(manga) {
    const button = document.getElementById(`${manga}-submit`);
    button.disabled = !(uploadState[manga].images.length && uploadState[manga].chapter);
}

// Conversion d'un fichier en Base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
    });
}

// Upload vers GitHub
async function uploadToGithub(manga, files, htmlFile) {
    const token = document.getElementById('githubToken').value;
    const branch = document.getElementById('githubBranch').value;
    const statusElement = document.getElementById('uploadStatus');
    
    if (!token) {
        throw new Error('Token GitHub requis');
    }

    try {
        // Préparation des fichiers à uploader
        const allFiles = [
            { file: htmlFile, path: `Manga/${manga}/Chapitres/${htmlFile.name}` },
            ...files.map(f => ({ file: f, path: `Manga/${manga}/Images/${f.name}` }))
        ];

        // Mise à jour du statut initial
        statusElement.textContent = `Upload en cours... (0/${allFiles.length} fichiers)`;
        let uploadedCount = 0;

        // Upload de chaque fichier individuellement
        for (const fileData of allFiles) {
            const content = await fileToBase64(fileData.file);
            
            const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${fileData.path}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: `Upload ${fileData.file.name} pour ${manga}`,
                    content: content,
                    branch: branch
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`Erreur lors de l'upload de ${fileData.file.name}: ${error.message}`);
            }

            uploadedCount++;
            statusElement.textContent = `Upload en cours... (${uploadedCount}/${allFiles.length} fichiers)`;
        }

        return true;
    } catch (error) {
        console.error('Erreur lors de l\'upload:', error);
        throw error;
    }
}

// Gestion de l'envoi
async function handleSubmit(manga) {
    const statusModal = document.getElementById('statusModal');
    const statusElement = document.getElementById('uploadStatus');
    const submitButton = document.getElementById(`${manga}-submit`);
    
    statusModal.classList.remove('hidden');
    statusElement.textContent = 'Préparation de l\'upload...';
    submitButton.disabled = true;

    try {
        await uploadToGithub(
            manga,
            uploadState[manga].images,
            uploadState[manga].chapter
        );

        statusElement.textContent = 'Upload réussi !';
        uploadState[manga].status = 'success';

        // Reset du formulaire
        document.getElementById(`${manga}-images`).value = '';
        document.getElementById(`${manga}-chapter`).value = '';
        document.getElementById(`${manga}-images-label`).textContent = 'Sélectionner les images';
        document.getElementById(`${manga}-chapter-label`).textContent = 'Sélectionner le fichier HTML';
        uploadState[manga].images = [];
        uploadState[manga].chapter = null;
        updateSubmitButton(manga);
        
    } catch (error) {
        console.error(error);
        statusElement.textContent = `Erreur: ${error.message}`;
        uploadState[manga].status = 'error';
    } finally {
        submitButton.disabled = false;
    }
}

// Fermeture du modal
function closeModal() {
    document.getElementById('statusModal').classList.add('hidden');
}