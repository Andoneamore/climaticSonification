
import * as Tone from "tone";
import {
    bird, bird1, bird2, bird3, bird4,
    birdPan, birdPan1, birdPan2, birdPan3, birdPan4,
    reverb
} from "./setUpSynths.js";

// 1) alle Player in ein Array packen
export const birdPlayers = [bird1, bird2, bird3, bird4];
// 2) Panner passend zum Array
const birdPans = [birdPan, birdPan1, birdPan2, birdPan3, birdPan4];

// 3) einmalige Initialisierung: Chains & optional Load-Promises
export async function initBirds() {

    // Routing: jeder Player → sein Panner → Reverb
    birdPlayers.forEach((p, i) => {
        p.chain(birdPans[i], reverb);
    });
}

// 4) Fade-Parameter exportieren
export const fadePoints   = [1979, 1990, 2003, 2015];

const targetDB = -60;
export const fadeDuration = 1;


export function fadeBirds(currentYear, time, fadeFlags) {
    birdPlayers.forEach((p, j) => {
        if (!fadeFlags[j] && currentYear >= fadePoints[j]) {
            p.volume
                .cancelScheduledValues(time)
                .linearRampToValueAtTime(targetDB, time + fadeDuration);
            fadeFlags[j] = true;
        }
    });
}