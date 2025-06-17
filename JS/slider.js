import * as Tone from "tone";

export function setupSlider({ sliderEl, sliderContainer, years, onManualStep }) {
    // 1) Slider-Range
    sliderEl.min  = String(Math.min(...years));
    sliderEl.max  = String(Math.max(...years));
    sliderEl.step = "1";
    sliderEl.value = sliderEl.min;
    sliderContainer.style.display = "block";

    // 2) Nur noch UI: Neuer Jahr-Wert → Callback
    sliderEl.addEventListener("input", e => {
        let chosenYear = +e.target.value;
        const idx = years.indexOf(chosenYear);
        if (idx < 0) return;
        onManualStep(idx, chosenYear);
    });
}