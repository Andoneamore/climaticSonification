import * as Tone from "tone";



let tremolo = new Tone.Tremolo({
    "frequency" : 1,
    "depth": 0.5,
    "spread": 40
});

let filter = new Tone.Filter(1000, "lowpass").toDestination();

const birdPan = new Tone.Panner(0).toDestination();
const birdPan1 = new Tone.Panner(0.6).toDestination();
const birdPan2 = new Tone.Panner(-1).toDestination();
const birdPan3 = new Tone.Panner(1).toDestination();

const birdPan4 = new Tone.Panner(-0.6).toDestination();


//initialisiere Tier Tonspuren LPI
let bird = new Tone.Player({
    url:"/climaticSonification/datasets/crickets_chirp.mp3",
    volume: -6,
    autostart:false,

}).connect(birdPan);
let bird1 = new Tone.Player({
    url: "/climaticSonification/datasets/BBC_SOUND_NHU05050147.mp3",
    autostart:false
    }).connect(birdPan1);
let bird2 = new Tone.Player({
    url:"/climaticSonification/datasets/BBC_SOUND_NHU05060102.mp3",
    autostart:false
}).connect(birdPan2);
let bird3 = new Tone.Player({
    url: "/climaticSonification/datasets/BBC_SOUND_NHU05096030.mp3",
    autostart:false,
    volume: -6
}).connect(birdPan3);
let bird4 = new Tone.Player({
    url:"/climaticSonification/datasets/BBC_SOUND_NHU05060101.mp3",
    autostart:false,
    volume: -3
}).connect(birdPan4);


let birdFaded = false;

const reverb = new Tone.Reverb({decay: 3}).toDestination();


//initialisiere Rauschen co2
let noiseGen = new Tone.Noise("pink");
noiseGen.volume.value = -Infinity;


// initialisiere Synthesizer Temperatur
let synth = new Tone.Oscillator({
    type:'triangle'
}).connect(tremolo);


export {noiseGen, synth, bird, bird1,bird2,bird3,bird4, tremolo, reverb, birdPan,birdPan1,birdPan2,birdPan3, birdPan4, birdFaded, filter};