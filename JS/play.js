import * as Tone from "tone";
import {getData} from "./getData.js";
import {mapData} from "./sonifiData.js";
import {noiseGen, synth, bird,bird1,bird2,bird3,bird4, birdPan1,birdPan2,birdPan3, birdPan4, tremolo, reverb, birdPan, birdFaded, filter} from "./setUpSynths.js";
import {
    birdPlayers, initBirds, fadeBirds,
    fadePoints, fadeDuration
} from "./birds.js";


let interval;

let i = 0;
let glide = 1.2;

const stepTime = 1.3;



/// BUTTONS //////////////////////////////////////////////////////////////

const soniBTN = document.getElementById('soniBTN');

const tempBTN = document.getElementById('tempBTN');

const lpiBTN = document.getElementById('lpiBTN');

const stopBTN = document.getElementById('stopBTN');

const qBTN = document.getElementById('question');

const actualYear = document.getElementById('actualYear');

const playBtn = document.getElementById('playBTN');

const slider    = document.getElementById('yearSlider');
const sliderDiv = document.getElementById('sliderContainer');


let fadeFlags  = new Array(birdPlayers.length).fill(false);


let isManual = false;
let currStep= 0;


function resetSonification() {
    // 1) Stoppe Transport & Intervalle

    Tone.Transport.stop();
    Tone.Transport.cancel();

    synth.stop();
    noiseGen.stop();
    bird.stop();
    bird1.stop();
    bird2.stop();
    bird3.stop();
    bird4.stop();

    // 2) Verstecke Slider und Continue-Button
    sliderDiv.style.display='none';
    playBtn.style.display='none';
    stopBTN.style.display='none';

    // 3) Slider auf Anfangswert zurücksetzen
    slider.value = slider.min;

    // 4) Jahr-Anzeige zurücksetzen
    actualYear.textContent = '';

    // 5) Index-Variablen zurücksetzen
    i = 0;
    currStep = 0;
    isManual = false;


    birdPlayers.forEach(p => {
        p.volume.cancelScheduledValues(Tone.now());
        p.volume.value = 0;
    });

    fadeFlags = new Array(birdPlayers.length).fill(false);

}


async function play(file, start, col, ann, mode){

    await Promise.all([
        bird.load("/climaticSonification/datasets/crickets_chirp.mp3"),
        bird1.load("/climaticSonification/datasets/BBC_SOUND_NHU05050147.mp3"),
        bird2.load("/climaticSonification/datasets/BBC_SOUND_NHU05060102.mp3"),
        bird3.load("/climaticSonification/datasets/BBC_SOUND_NHU05096030.mp3"),
        bird4.load("/climaticSonification/datasets/BBC_SOUND_NHU05060101.mp3")
    ]);


    disableButtons();

    //entpacken
    const {min, max, inc, year} = await getData(file, start, col, ann);

    const {mappedNote, tremToFreq, mappedVol, mappedFilter} =  mapData({min, max},inc);

    ///SLIDER LOGIC////



    const years = year;  // dein Jahr-Array aus getData()

    slider.min   = Math.min(...years);
    slider.max   = Math.max(...years);
    slider.step  = 1;
    slider.value = [0];

    sliderDiv.style.display='block';







    slider.addEventListener('input', e => {
        const idx = years.indexOf(+e.target.value);
        const progress = idx / (mappedNote.length - 1);
        if (idx < 0) return;

        const fadeYear = years[idx];

        fadeFlags = [false, false, false, false];

        // Stopp den Transport, wechsle in den manuellen Modus
        const t0 = Tone.now();
        Tone.Transport.pause();
        isManual   = true;
        currStep   = idx;
        actualYear.textContent = fadeYear;


        if (mode === 'sine') {
            synth.frequency
                .cancelScheduledValues(t0)
                .linearRampToValueAtTime(mappedNote[idx], t0 + 0.1);
            tremolo.frequency
                .cancelScheduledValues(t0)
                .linearRampToValueAtTime(tremToFreq[idx], t0 + 0.1);

        } else if (mode === 'noise') {
            noiseGen.volume
                .cancelScheduledValues(t0)
                .linearRampToValueAtTime(mappedVol[idx], t0 + 0.1);
            filter.frequency
                .cancelAndHoldAtTime(t0)
                .linearRampToValueAtTime(mappedFilter[idx], t0 + 0.1);

        } else if (mode === 'animals') {
            // Für alle Birds nur die Lautstärke‐Rampen
            birdPlayers.forEach((p, j) => {
                if (fadeYear >= fadePoints[j]) {
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
            // Und den Filter
            filter.frequency
                .cancelAndHoldAtTime(t0)
                .linearRampToValueAtTime(mappedFilter[idx], t0 + 0.1);
        }
    });



    playBtn.style.display = 'block';

    stopBTN.style.display = 'block';


    playBtn.addEventListener('click', e=>{
        console.log('click');
        isManual = false;

        i = currStep;

        const resumeTime = currStep * stepTime +0.001;

        Tone.Transport.start(undefined, resumeTime);

    });






   /* const intervalTime = 1.3;                                 // deine Intervall-Länge in Sekunden
    const totalSteps   = mappedNote.length;                  // Anzahl Jahre von 1970–2020
    const totalDuration= totalSteps * intervalTime;*/

    if (Tone.context.state !== 'running') {
        await Tone.context.resume();
    }



    noiseGen.connect(filter).toDestination();

    tremolo.toDestination().start();


    bird.chain(birdPan, reverb);
    bird1.chain(birdPan1, reverb);
    bird2.chain(birdPan2, reverb);
    bird3.chain(birdPan3,reverb);
    bird4.chain(birdPan4,reverb);

    filter.toDestination();


    if(mode == 'sine'){
        noiseGen.volume.value = -Infinity;
        noiseGen.stop();

        synth.volume.value = 0;
        synth.frequency.value = mappedNote[0];
        tremolo.frequency.value = tremToFreq[0];

        synth.start();

        bird.stop();
        bird1.stop();
        bird2.stop();
        bird3.stop();
        bird4.stop();

    }
    if(mode == 'noise'){
        synth.volume.value = -Infinity;
        synth.stop();
        noiseGen.volume.value = mappedVol[0];
        noiseGen.start();

        bird.stop();
        bird1.stop();
        bird2.stop();
        bird3.stop();
        bird4.stop();

    }

    if(mode == 'animals'){

        synth.volume.value = -Infinity;
        synth.stop();

        noiseGen.volume.value = -Infinity;
        noiseGen.stop();

        bird.start();
        bird1.start();
        bird2.start();
        bird3.start();
        bird4.start();

    }


    Tone.Transport.cancel();
    Tone.Transport.scheduleRepeat((time)=>{

        if (isManual) return;


        if(i >= mappedNote.length){

            if(mode == 'noise'){
                noiseGen.volume.value = mappedVol[i-1];
                filter.frequency.value = mappedFilter[i-1];
              //  resetSonification();
            }
            if(mode == 'sine'){
                synth.frequency.value = mappedNote[i-1];
               // resetSonification();

            }

            if(mode == 'animals'){

                bird.volume.linearRampToValueAtTime(-Infinity, Tone.now() + glide);
                //resetSonification();

                //cricket.loop = false;
            }

            actualYear.textContent = 'Ende';
            stopBTN.style.display = 'block';
            enableButtons();
            return;
        }

        actualYear.textContent = year[i];

        if(mode == 'sine'){
            synth.frequency.linearRampToValueAtTime(mappedNote[i], Tone.now() + glide);
            tremolo.frequency.linearRampToValueAtTime(tremToFreq[i], Tone.now() + 0.5);
            console.log('Freq: ', mappedNote[i]);
            console.log('Trem: ', tremToFreq[i]);
        }

        if(mode == 'noise'){
            noiseGen.volume.linearRampToValueAtTime(mappedVol[i], Tone.now()+glide);
            filter.frequency.cancelAndHoldAtTime(Tone.now());
            filter.frequency.linearRampToValueAtTime(mappedFilter[i], Tone.now() + glide);
            console.log('Filter: ',  mappedFilter[i])
        }

        if(mode == 'animals'){

           // const progress = i / (mappedNote.length - 1);

            fadeBirds(years[i], time, fadeFlags);

            filter.frequency.cancelAndHoldAtTime(Tone.now());
            filter.frequency.linearRampToValueAtTime(mappedFilter[i], Tone.now() + glide);

        }

        i++;

    },stepTime);

    Tone.Transport.start();

}


/// BUTTON LOGIC /////////////////////////////////////////////////////////////////////////////////////

let mode;


soniBTN.addEventListener('click',async ()=>{
    await Tone.start();
    resetSonification();

    mode = 'noise';
    await play('/climaticSonification/datasets/co2_annmean_gl.csv', 38, 1, 0, mode);

});

tempBTN.addEventListener('click',async ()=>{
    await Tone.start();
    resetSonification();
    mode = 'sine';
    await play('/climaticSonification/datasets/annual_air_temperature.csv', 102, 1, 0, mode);

});

lpiBTN.addEventListener('click',async ()=>{
    await Tone.start();
    resetSonification();
    mode = 'animals';
    await play('/climaticSonification/datasets/global-living-planet-index.csv', 1, 3, 2, mode);
});

stopBTN.addEventListener('click', ()=>{
    resetSonification();
    enableButtons();
    //window.location.href = window.location.href;
});

export function disableButtons() {
    soniBTN.disabled = true;
    tempBTN.disabled = true;
    lpiBTN.disabled = true;
}

export function enableButtons() {
    soniBTN.disabled = false;
    tempBTN.disabled = false;
    lpiBTN.disabled = false;
}

export {glide, interval, qBTN, stopBTN, actualYear, fadeFlags, fadePoints, fadeDuration, birdPlayers};

