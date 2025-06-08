document.addEventListener('DOMContentLoaded', () => {
    console.log("picture module loaded");
    // Konfiguration: button-ID, container-ID, und hide-button-ID pro Bild
    const toggles = [
        { btnId: 'showImg1Btn', item: 'itemCo2'},
        { btnId: 'showImg2Btn', item: 'itemTemp'},
        { btnId: 'showImg3Btn', item: 'itemLpi' },
    ];

    toggles.forEach(({ btnId, item}) => {
        const btn       = document.getElementById(btnId);
        const items = document.getElementById(item);
        const hideBtn = document.getElementById('hideBtn');

        if (!btn || !items || !hideBtn) return; // fehlertolerant

        // erst verstecken
        items.classList.add('hidden');

        // Klick auf "Show" blendet ein
        btn.addEventListener('click', () => {
            console.log(`Clicked ${btnId}`);
            items.classList.remove('hidden');
            items.classList.add('visible');
            hideBtn.style.display='block';
        });

        // Klick auf "Zurück" blendet wieder aus
        hideBtn.addEventListener('click', () => {
            document
                .querySelectorAll('.image-gallery')
                .forEach(container => {
                    items.classList.remove('visible');
                    items.classList.add('hidden');
                    hideBtn.style.display='none';
                });

        });
    });

    document.getElementById('showImg1Btn').addEventListener('click', () => {
        console.log('Direct listener: showImg1Btn clicked');
    });
});