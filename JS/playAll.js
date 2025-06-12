import * as Tone from "tone";
import {mapData} from "./sonifiData.js";
import {getData} from "./getData.js";
import {
    disableButtons,
    enableButtons,
    glide,
    stopBTN, fadeFlags, actualYear, stepTime
} from "./play.js";
import {
    noiseGen,
    synth,
    bird,
    bird1,
    bird2,
    bird3,
    bird4,
    tremolo,
    filter, birdPan, birdPan1, birdPan2, birdPan3, birdPan4, reverb,
} from "./setUpSynths.js";

import {
    birdPlayers, initBirds, fadeBirds,
    fadePoints, fadeDuration
} from "./birds.js";
import {playBtn} from "./play.js";

import {setupSlider} from "./slider.js";


let isManual = false;
let currStep = 0;

async function playAll(yearRange) {
    disableButtons();

    await Tone.start();


    const lpi = await getData("/climaticSonification/datasets/global-living-planet-index.csv", 1, 3, 2, yearRange);
    const temp = await getData("/climaticSonification/datasets/annual_air_temperature.csv", 102, 1, 0, yearRange);
    const co2 = await getData("/climaticSonification/datasets/co2_annmean_gl.csv", 38, 1, 0, yearRange);

    const co2Mapped = mapData({min: co2.min, max: co2.max}, co2.inc);

    const tempMapped = mapData({min: temp.min, max: temp.max}, temp.inc);

    const lpiMapped = mapData({min: lpi.min, max: lpi.max}, lpi.inc);


    if (Tone.context.state !== 'running') {
        await Tone.context.resume();
    }


    synth.volume.value = 0;
    synth.frequency.value = tempMapped.mappedNote[0];
    tremolo.frequency.value = tempMapped.tremToFreq[0];

    synth.connect(tremolo);

    tremolo.toDestination().start();


    noiseGen.connect(filter).toDestination();

    filter.toDestination();


// Birds routen in Panner → Reverb → birdGroupGain
    const birdPans = [birdPan, birdPan1, birdPan2, birdPan3, birdPan4];


    synth.start();
    noiseGen.start();

    bird.start();
    bird1.start();
    bird2.start();
    bird3.start();
    bird4.start();


    let i = 0;

    Tone.Transport.cancel();

    setupSlider({
        sliderEl: document.getElementById("yearSlider"),
        sliderContainer: document.getElementById("sliderContainer"),
        years: co2.year,
        mappedVol: co2Mapped.mappedVol,  // Volumen‐Array aus co2Mapped
        mappedFilter: co2Mapped.mappedFilter,
        fadePoints,

        birdPlayers,
        filter,
        onManualStep: (idx, chosenYear) => {
            const t0 = Tone.now();
            Tone.Transport.pause();
            isManual = true;
            currStep = idx;
            actualYear.textContent = chosenYear;

            // Hier reagierst Du auf den Slider-Wert:
            // → noiseGen
            noiseGen.volume
                .cancelScheduledValues(t0)
                .linearRampToValueAtTime(co2Mapped.mappedVol[idx], t0 + 0.1);
            filter.frequency
                .cancelAndHoldAtTime(t0)
                .linearRampToValueAtTime(co2Mapped.mappedFilter[idx], t0 + 0.1);
            // → synth

            synth.frequency
                .cancelScheduledValues(t0)
                .linearRampToValueAtTime(tempMapped.mappedNote[idx], t0 + 0.1);
            tremolo.frequency
                .cancelScheduledValues(t0)
                .linearRampToValueAtTime(tempMapped.tremToFreq[idx], t0 + 0.1);
            // → birds

            birdPlayers.forEach((p, j) => {
                if (chosenYear >= fadePoints[j]) {
                    // bereits jenseits des Fade-Punktes → sofort stummschalten
                    p.volume.cancelScheduledValues(t0)
                        .linearRampToValueAtTime(-80, t0 + 0.1);
                    fadeFlags[j] = true;
                } else {
                    // noch vor dem Fade-Punkt → auf die gemappte Lautstärke fahren
                    p.volume.cancelScheduledValues(t0);
                    fadeFlags[j] = false;
                }
            });
            // → filter
            filter.frequency
                .cancelAndHoldAtTime(t0)
                .linearRampToValueAtTime(co2Mapped.mappedFilter[idx], t0 + 0.1);
        }
    });

    playBtn.style.display = 'block';

    playBtn.addEventListener('click', e=>{
        console.log('click');
        isManual = false;

        i = currStep;

        const resumeTime = currStep * stepTime +0.001;

        Tone.Transport.start(undefined, resumeTime);

    });

    Tone.Transport.scheduleRepeat(function (time) {

        console.log(time);

        if (i >= tempMapped.mappedNote.length) {
            noiseGen.volume.value = co2Mapped.mappedVol[i - 1];
            synth.frequency.value = tempMapped.mappedNote[i - 1];

            actualYear.textContent = 'Ende';
            stopBTN.style.display = 'block';
            enableButtons();
            return;
        }

        actualYear.textContent = co2.year[i];

        synth.frequency.linearRampToValueAtTime(tempMapped.mappedNote[i], time + glide);
        tremolo.frequency.linearRampToValueAtTime(tempMapped.tremToFreq[i], time + glide);


        noiseGen.volume.linearRampToValueAtTime(co2Mapped.mappedVol[i], time + glide);
        filter.frequency.cancelAndHoldAtTime(time);
        filter.frequency.linearRampToValueAtTime(co2Mapped.mappedFilter[i], time + glide);


        const progress = i / (lpiMapped.mappedNote.length - 1);

        fadeBirds(progress, time, fadeFlags);


        filter.frequency.cancelAndHoldAtTime(Tone.now());
        filter.frequency.linearRampToValueAtTime(lpiMapped.mappedFilter[i], time + glide);


        i++;

    }, 1.3);

    Tone.Transport.start();


}

export const allBTN = document.getElementById("allBTN");

allBTN.addEventListener("click", async () => {
    await Tone.start();
    disableButtons();
    await playAll([1979, 2020]);

    stopBTN.style.display = 'block';
});
