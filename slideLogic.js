import {resetSonification} from "./JS/play.js";
document.addEventListener('DOMContentLoaded', () => {
    const wrapper = document.querySelector('.slides');
    const slides  = document.querySelectorAll('.slide');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');

    // 1) Beim ersten Laden den gespeicherten Index holen (default 0)
    let current = parseInt(localStorage.getItem('currentSlide') || '0', 10);

    current = Math.min(Math.max(current, 0), slides.length - 1);

    // 2) Auf die richtige Start-Position setzen
    wrapper.style.transform = `translateX(-${current * 100}vw)`;

    updateNav();

    // 3) Klick-Handler zum Weiter – aktualisiert auch localStorage
    nextBtn.addEventListener('click', () => {
        if (current < slides.length - 1) {
            current++;
            wrapper.style.transform = `translateX(-${current * 100}vw)`;
            localStorage.setItem('currentSlide', String(current));
            resetSonification();
            updateNav();
        }
    });

    prevBtn.addEventListener('click', () => {
        if (current > 0) {
            current--;
            wrapper.style.transform = `translateX(-${current * 100}vw)`;
            localStorage.setItem('currentSlide', String(current));
            updateNav();
        }
    });


    function updateNav() {

        prevBtn.disabled = (current === 0);


        nextBtn.disabled = (current === slides.length - 1);
    }
});




