
import {getData} from "./getData.js";






/// MAP DATA TO NOTE /////////////////////////////////////////////////////////////////////////////////////
export function mapData({min, max}, inc){

    let currNote;

    let mappedNote=[];

    let relPos;

    let tremToFreq = [];

    let mappedFilter = [];

    let mappedVol = [];

    let minFreq = 110; //A2
    let maxFreq = 880; //A5

    let minVol = -30;
    let maxVol = 0;

    // frequenz für jeden Eintrag bestimmen
    for (let i = 0; i < inc.length ; i++) {
        currNote = inc[i];

        relPos = (currNote - min)/(max - min);

        let currFreq = Math.round((minFreq + relPos * (maxFreq - minFreq))*100)/100 ;

        mappedNote.push(currFreq);


        // MAP TREMOLO
        let tremFreq = 1 + relPos * (10-1);
        tremToFreq.push(tremFreq);

        let cutoff = 200 + relPos * (8000 - 200);

        let noiseVol = minVol + relPos * (maxVol - minVol);

        mappedFilter.push(cutoff);
        mappedVol.push(noiseVol);

    }

    return {mappedNote, tremToFreq, mappedFilter, mappedVol};

}













