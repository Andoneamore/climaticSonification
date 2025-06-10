import * as Tone from "tone";
import { mapData } from "./sonifiData.js";
import { getData } from "./getData.js";
import {
    disableButtons,
    enableButtons,
    glide,
    stopBTN, fadeFlags
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
    filter, birdPan,birdPan1,birdPan2,birdPan3, birdPan4, reverb,
} from "./setUpSynths.js";

import {
    birdPlayers, initBirds, fadeBirds,
    fadePoints, fadeDuration
} from "./birds.js";



async function playAll(yearRange){
    disableButtons();

    await Tone.start();



    const lpi  = await getData("/climaticSonification/datasets/global-living-planet-index.csv", 1, 3, 2, yearRange);
    const temp = await getData("/climaticSonification/datasets/annual_air_temperature.csv", 102, 1, 0, yearRange);
    const co2  = await getData("/climaticSonification/datasets/co2_annmean_gl.csv", 38, 1, 0, yearRange);

    const co2Mapped = mapData({min: co2.min, max:co2.max}, co2.inc);

    const tempMapped = mapData({min: temp.min, max:temp.max}, temp.inc);

    const lpiMapped = mapData({min:lpi.min, max:lpi.max}, lpi.inc);


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


    Tone.Transport.scheduleRepeat(function(time){

        console.log(time);

        if(i >= tempMapped.mappedNote.length){
            noiseGen.volume.value = co2Mapped.mappedVol[i-1];
            synth.frequency.value = tempMapped.mappedNote[i-1];

            stopBTN.style.display = 'block';
            enableButtons();
            return;
        }

        document.getElementById('actualYear').textContent = co2.year[i];

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
