function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

async function downloadOneshot() {
  const zip = new JSZip();
  const imgFolder = zip.folder("Sake to Sakana - Oneshot");
  const importantFolder = imgFolder.folder("IMPORTANT");
  const imgUrls = getCurrentImages();

  if (imgUrls.length === 0) {
    alert("Aucune image trouvée.");
    return;
  }

  const importantText = `Règles de publication des chapitres :
    
1. Aucune republication autorisée sans permission explicite de notre part.
2. Si vous souhaitez partager nos traductions, vous devez retirer tous les éléments textuels.
3. Si vous reprenez les pages avec les éléments textuels, il vous est demandé de créditer à la team LanorTrad.
Tout manquement à ces règles entraînera des sanctions.

LanorTrad`;

  try {
    const downloadStatus = document.createElement("div");
    downloadStatus.className =
      "fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50";
    downloadStatus.style.cssText = `opacity: 0; transition: opacity 0.3s ease-in-out;`;
    downloadStatus.innerHTML = `
                    <div class="bg-gray-900 text-white p-6 rounded-lg shadow-xl text-center" 
                         style="transform: translateY(-20px); transition: transform 0.3s ease-out;">
                        <p class="text-lg">Téléchargement en cours...</p>
                        <div id="progress" class="mt-4">
                            <div class="w-full bg-gray-700 rounded-full">
                                <div id="progressBar" class="bg-green-500 h-2 rounded-full transition-all duration-300 ease-out" style="width: 0%"></div>
                            </div>
                        </div>
                    </div>
                `;
    document.body.appendChild(downloadStatus);

    requestAnimationFrame(() => {
      downloadStatus.style.opacity = "1";
      downloadStatus.querySelector(".bg-gray-900").style.transform =
        "translateY(0)";
    });

    importantFolder.file("IMPORTANT.txt", importantText);

    const downloadPromises = imgUrls.map(async (url, i) => {
      try {
        const response = await fetch(url);
        if (!response.ok)
          throw new Error(`Erreur lors du téléchargement de l'image ${i + 1}`);
        const blob = await response.blob();

        const extension =
          blob.type === "image/png" || url.toLowerCase().endsWith(".png")
            ? "png"
            : "jpg";
        const filename = `${String(i + 1).padStart(3, "0")}.${extension}`;
        imgFolder.file(filename, blob);

        const progress = Math.round(((i + 1) / imgUrls.length) * 100);
        const progressBar = document.getElementById("progressBar");
        if (progressBar) {
          progressBar.style.width = `${progress}%`;
        }
      } catch (error) {
        console.error(`Erreur pour l'image ${i + 1}:`, error);
        throw error;
      }
    });

    await Promise.all(downloadPromises);

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "Sake to Sakana - Oneshot.zip");

    const messageBox = downloadStatus.querySelector(".bg-gray-900");
    messageBox.innerHTML = `
                    <p class="text-lg" style="opacity: 0; transform: translateY(-10px); transition: all 0.3s ease-out">
                        Téléchargement terminé !
                    </p>
                `;

    requestAnimationFrame(() => {
      const successText = messageBox.querySelector("p");
      successText.style.opacity = "1";
      successText.style.transform = "translateY(0)";
    });

    setTimeout(() => {
      messageBox.style.transform = "translateY(20px)";
      downloadStatus.style.opacity = "0";

      setTimeout(() => {
        if (downloadStatus.parentNode) {
          downloadStatus.parentNode.removeChild(downloadStatus);
        }
      }, 300);
    }, 1500);
  } catch (error) {
    console.error("Erreur de téléchargement:", error);
    alert("Une erreur est survenue lors du téléchargement du oneshot.");
    if (document.querySelector(".fixed")) {
      document.querySelector(".fixed").remove();
    }
  }
}

function getCurrentImages() {
  const container = document.getElementById("readerContainer");
  if (!container) return [];

  const images = Array.from(container.getElementsByTagName("img"));
  return images
    .filter((img) => {
      const src = img.src.toLowerCase();
      return src.endsWith(".jpg") || src.endsWith(".jpeg");
    })
    .map((img) => img.src);
}
