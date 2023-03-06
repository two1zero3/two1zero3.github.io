let lowEnergyInFrames = [];
let snareEnergyInFrames = [];
let exports = {};

try {
  importScripts('https://cdn.jsdelivr.net/npm/essentia.js@0.1.3/dist/essentia-wasm.umd.js',
               'https://cdn.jsdelivr.net/npm/essentia.js@0.1.3/dist/essentia.js-core.js'); 
} catch (e) {
  console.error(e.message);
}

let essentia = new Essentia(exports.EssentiaWASM, false);

// prints version of essentia wasm backend
console.log(essentia.version)

// prints all the available algorithm methods in Essentia
console.log(essentia.algorithmNames);

onmessage = (e) => {

  //Set buffer size
  let bufferSize = 882*2;

  //Convert to VectorArray
  let vectorSignalLeft = essentia.arrayToVector(e.data[0]);
  // let vectorSignalRight = essentia.arrayToVector(e.data[1]);

  //Convert to Mono
  //let monoMixDown = essentia.MonoMixer( vectorSignalLeft, vectorSignalRight );
  //let mono32Array = essentia.vectorToArray(monoMixDown.audio);
 
  //Generate for Audio Spectrum
  let frameCutter = generateFrames(e.data[0], bufferSize, bufferSize/2);

  for (let k = 0; k < frameCutter.length; k++) {

    let window = essentia.Windowing(frameCutter[k]);

    let frameSpectrum = essentia.Spectrum(window.frame, bufferSize).spectrum;
    
    let a = essentia.EnergyBand(frameSpectrum, 44100, 20, 200);
    let b = essentia.EnergyBand(frameSpectrum, 44100, 1500, 15000);

    //go from FrameCutter and loop through all bufferSize sample long frames to bark band to finally put in an array
    lowEnergyInFrames.push(a.energyBand);
    snareEnergyInFrames.push(b.energyBand);
    
    // USE BANDENERGY (OR WTV THE REAL NAME IS) TO DO ALL BANDS IN 1 FUNCTION !!
    
  }

  //Extract Features
  let ticks = essentia.vectorToArray(essentia.BeatTrackerDegara(vectorSignalLeft).ticks);
  let bpm = essentia.PercivalBpmEstimator(vectorSignalLeft, 1024, 2048, 128, 128, 210, 50, 44100).bpm;
  console.log("A");

  postMessage({
    bpm: bpm,
    ticks: ticks,
    bass: lowEnergyInFrames, 
    snare: snareEnergyInFrames
  });

}

function generateFrames (array, bufferSize, hopSize) {

  const res = [];

  for (let i = 0; i < array.length; i += hopSize) {

    //SLICE ARRAY INTO CHUNKS OF SIZE = BUFFERSIZE
    let chunk = array.slice(i, i + bufferSize);

    //ZERO PADDING THE LAST ARRAYS SINCE THEY USUALLY ARE CUT SHORT
    if (chunk.length < bufferSize) {

      //CREATE NEW FLOAT32ARRAY FULL OF ZERO's
      let paddingArray = Array(bufferSize - chunk.length).fill(0);
      let paddingTypedArray = new Float32Array(paddingArray);

      //DEFINE NEW ARRAY THAT CONCATENATES THE CHUNK WITH THE ARRAY FULL OF ZERO's --> ZERO PADS THE TYPED ARRAY
      let newArray = new Float32Array(chunk.length + paddingTypedArray.length);
      newArray.set(chunk);
      newArray.set(paddingTypedArray, chunk.length);
      
      //DEFINE CHUNK AS THIS NEW (ZERO PADDED) ARRAY
      chunk = newArray;
    }

    //PUSH THE CHUNKS INTO A NEW ARRAY AS VECTOR DATA
    res.push(essentia.arrayToVector(chunk));

  }

  //RETURN ARRAY OF VECTOR CHUNKS
  console.log(res.length);
  return res;

}