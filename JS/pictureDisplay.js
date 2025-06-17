document.addEventListener('DOMContentLoaded', () => {
    console.log("picture module loaded");
    const explText = document.getElementById('explText');
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
            explText.classList.add('hidden');
            explText.classList.remove('visible');
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
            explText.classList.add('visible');
            explText.classList.remove('hidden');
        });
    });
});