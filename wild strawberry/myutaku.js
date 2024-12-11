(function () {
    if (document.getElementById('chapter-images') !== null) {
        let div = document.createElement('div');
        div.setAttribute('style', 'text-align: center; justify-content: center; width: 100%; align-items: center; justify-content: center; display: flex; flex-direction: column; position: relative; width: fit-content;');
        
        let img = document.createElement('img');
        img.setAttribute('src', 'https://www.myutaku.com/images/myutaku_horizontal_v2.png?from='.concat(encodeURIComponent(decodeURIComponent(window.location.pathname))));
        
        let divLinkApp = document.createElement('div');
        divLinkApp.setAttribute('style', 'width:100%;display:flex;height: 11%;bottom:0;margin:0 auto;position: absolute;justify-content: center;');
        
        let aApple = document.createElement('a');
        aApple.setAttribute('target', '_blank');
        aApple.setAttribute('href', 'https://www.myutaku.com/redirect-play-store-download');
        aApple.setAttribute('style', 'width: 33%; align-self: flex-end; height: 100%; display: block;');
        
        let aAndroid = document.createElement('a');
        aAndroid.setAttribute('target', '_blank');
        aAndroid.setAttribute('href', 'https://www.myutaku.com/redirect-app-store-download');
        aAndroid.setAttribute('style', 'width: 33%; align-self: flex-end; height: 100%; display: block;');
        
        div.prepend(img);
        divLinkApp.prepend(aApple);
        divLinkApp.prepend(aAndroid);
        div.prepend(divLinkApp);
        
        // Récupérer tous les éléments d'images dans #chapter-images
        let chapterImages = document.getElementById('chapter-images');
        let images = chapterImages.getElementsByTagName('img');
        
        // Vérifier s'il y a au moins 3 images avant d'insérer la nouvelle div
        if (images.length >= 3) {
            // Insérer la nouvelle div après le 3ème élément (donc en 4ème position)
            images[2].after(div);
        } else {
            // Si moins de 3 images, l'ajouter à la fin
            chapterImages.appendChild(div);
        }
    }
})();