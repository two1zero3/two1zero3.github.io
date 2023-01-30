import getConfig from '../../../config';
import { initFileBufferIfNotExists } from '../../../helpers/browser.helper';
import { isWindowExists } from "../../../helpers/window.helper";
import { preprocess, shortenAudio } from './audio-utils.js';
import KeyBpmExtractionWorker from 'file-loader?publicPath=/lib/essentia&outputPath=/lib/essentia/!./workers/key-bpm-extraction.js'; //TODO: find a good way of using nice path imports
import FeatureExtractionWorker from 'file-loader?publicPath=/lib/essentia&outputPath=/lib/essentia/!./workers/feature-extraction.js'; //TODO: find a good way of using nice path imports
import InferenceWorker from 'file-loader?publicPath=/lib/essentia/&outputPath=/lib/essentia/!./workers/inference.js'; //TODO: find a good way of using nice path imports

export const supportedFeatures = {
    DURATION: 'duration',
    KEY: 'key',
    BPM: 'bpm',
    HAPPINESS: 'mood_happy',
    SADNESS: 'mood_sad',
    RELAXNESS: 'mood_relaxed',
    AGGRESSIVENESS: 'mood_aggressive',
    DANCEABILITY: 'danceability'
}

const BrowserAudioContext = isWindowExists() ? (window.AudioContext || window.webkitAudioContext) : undefined;
const _audioContext = BrowserAudioContext ? new BrowserAudioContext() : null;

// const features = [supportedFeatures.AGGRESSIVENESS, supportedFeatures.DANCEABILITY, supportedFeatures.HAPPINESS, supportedFeatures.SADNESS, supportedFeatures.RELAXNESS];
const features = [supportedFeatures.AGGRESSIVENESS, supportedFeatures.DANCEABILITY, supportedFeatures.HAPPINESS];

export default class AudioAnalyzer {
    constructor(file, fileUID, onFeatureReceived, includeFeatures, featuresForAnalyzing) {
        this._file = file;
        this._fileUID = fileUID;
        this._onFeatureReceived = onFeatureReceived;
        this._includeFeatures = includeFeatures;
        this._featuresForAnalyzing = featuresForAnalyzing;
    }

    _file = null;
    _fileUID = null;
    _onFeatureReceived = null;
    _includeFeatures = false;
    _featuresForAnalyzing = null;

    _analyzedAudioKey = null;
    _analyzedAudioBPM = null;
    _analyzedFeatures = {};
    _featureExtractionWorker = null;
    _extractedFeatures = null;
    _keyBpmExtractionWorker = null;
    _inferenceWorkers = {};
    _nextInferenceFeatureIndex = 0;

    analyze = () => {
        return new Promise((resolve, reject) => {
            try {
                this._analyze(resolve, reject);
            } catch (err) {
                reject(`Can not analyze file. ${err}`);
            }
        });
    }

    _analyze(resolve, reject) {
        initFileBufferIfNotExists();

        this._file.arrayBuffer().then((ab) => {
            this._decodeFile(ab, resolve, reject);
        })
            .catch(err => {
                reject(err);
            });
    }

    _decodeFile(arrayBuffer, resolve, reject) {
        if (_audioContext) {
            try {
                _audioContext.decodeAudioData(
                    arrayBuffer,
                    (audioBuffer) => {
                        try {
                            if (this._onFeatureReceived) {
                                this._onFeatureReceived(this._fileUID, supportedFeatures.DURATION, audioBuffer.duration);
                            }

                            const prepocessedAudio = preprocess(audioBuffer);

                            this._computeKeyBPM(prepocessedAudio);
                            
                            if (this._includeFeatures && (
                                this._featuresForAnalyzing.includes(supportedFeatures.AGGRESSIVENESS) ||
                                this._featuresForAnalyzing.includes(supportedFeatures.HAPPINESS) ||
                                this._featuresForAnalyzing.includes(supportedFeatures.DANCEABILITY))
                            ) {
                                // reduce amount of audio to analyse
                                let audioData = shortenAudio(prepocessedAudio, getConfig().analyzerAudioPercentage, true); // <-- TRIMMED start/end
                                this._startFeauteAnalyzationWorkersChain(audioData.buffer);
                            }
                        

                            resolve();
                        } catch (err) {
                            reject(err);
                        }
                    },
                    (err) => {
                        reject(err);
                    });
            }
            catch (err) {
                reject(err);
            }
        } else {
            reject('No AudioContext defined.');
        }
    }

    _computeKeyBPM(audioSignal) {
        let analyzeKey = this._featuresForAnalyzing.includes(supportedFeatures.KEY);
        let analyzeBPM = this._featuresForAnalyzing.includes(supportedFeatures.BPM); 

        if (!analyzeKey && !analyzeBPM) {
            return;
        } else {
            this._keyBpmExtractionWorker = new Worker(KeyBpmExtractionWorker);
            this._keyBpmExtractionWorker.onmessage = (msg) => {
                switch (msg.data.feature) {
                    case supportedFeatures.KEY:
                        this._analyzedAudioKey = msg.data.value;
                        break;
    
                    case supportedFeatures.BPM:
                    default:
                        this._analyzedAudioBPM = msg.data.value;
                        this._keyBpmExtractionWorker.terminate();
                        this._keyBpmExtractionWorker = null;
                        break;
                }
    
                if (this._onFeatureReceived) {
                    this._onFeatureReceived(this._fileUID, msg.data.feature, msg.data.value);
                }
            };
    
            this._keyBpmExtractionWorker.postMessage({
                audioSignal,
                analyzeKey,
                analyzeBPM,
            });
        }
    }

    _startFeauteAnalyzationWorkersChain(audioDataBuffer) {
        this._startFeatureExtractionWorker(audioDataBuffer);
    }

    _startFeatureExtractionWorker(audioDataBuffer) {
        this._featureExtractionWorker = new Worker(FeatureExtractionWorker);
        this._featureExtractionWorker.onmessage = (msg) => {
            this._extractedFeatures = msg.data.features;
            this._featureExtractionWorker.terminate();
            this._featureExtractionWorker = null;

            // feed to models
            if (this._extractedFeatures) {
                //this._startNextInferenceWorker();
                this._startInferenceWorkers();
            } else {
                features.forEach((n) => {
                    if (this._onFeatureReceived) {
                        this._onFeatureReceived(this._fileUID, n, -1);
                    }
                });
            }
        };

        this._featureExtractionWorker.postMessage({
            audio: audioDataBuffer
        });
    }

    _startInferenceWorkers() {
        if (
            !this._featuresForAnalyzing.includes(supportedFeatures.AGGRESSIVENESS) &&
            !this._featuresForAnalyzing.includes(supportedFeatures.HAPPINESS) &&
            !this._featuresForAnalyzing.includes(supportedFeatures.DANCEABILITY)
        ) {
            return;
        } else {
            let featuresForAnalyze = [];

            if (this._featuresForAnalyzing.includes(supportedFeatures.AGGRESSIVENESS)) {
                featuresForAnalyze.push(supportedFeatures.AGGRESSIVENESS);
            }
            if (this._featuresForAnalyzing.includes(supportedFeatures.HAPPINESS)) {
                featuresForAnalyze.push(supportedFeatures.HAPPINESS);
            }
            if (this._featuresForAnalyzing.includes(supportedFeatures.DANCEABILITY)) {
                featuresForAnalyze.push(supportedFeatures.DANCEABILITY);
            }

            featuresForAnalyze.forEach(feature => {
                this._inferenceWorkers[feature] = new Worker(InferenceWorker);
                this._inferenceWorkers[feature].onmessage = (msg) => {
                    //console.error(`${feature} predictions: `, this._analyzedFeatures[feature]);
                    this._inferenceWorkers[feature].terminate();
                    this._inferenceWorkers[feature] = null;
    
                    // listen out for model output
                    this._analyzedFeatures[feature] = msg.data.predictions;
    
                    if (this._onFeatureReceived) {
                        this._onFeatureReceived(this._fileUID, feature, this._analyzedFeatures[feature]);
                    }
                };
    
                this._inferenceWorkers[feature].postMessage({
                    name: feature,
                    extractedFeatures: this._extractedFeatures
                });
            });
        }
    }

    // _startNextInferenceWorker() {
    //     if (this._nextInferenceFeatureIndex < features.length) {
    //         let feature = features[this._nextInferenceFeatureIndex];
    //         ++this._nextInferenceFeatureIndex;

    //         this._inferenceWorkers[feature] = new Worker(InferenceWorker);
    //         this._inferenceWorkers[feature].onmessage = (msg) => {
    //             //console.error(`${feature} predictions: `, this._analyzedFeatures[feature]);
    //             this._inferenceWorkers[feature].terminate();
    //             this._inferenceWorkers[feature] = null;

    //             // listen out for model output
    //             this._analyzedFeatures[feature] = msg.data.predictions;

    //             if (this._onFeatureReceived) {
    //                 this._onFeatureReceived(this._fileUID, feature, this._analyzedFeatures[feature]);
    //             }

    //             this._startNextInferenceWorker();
    //         };

    //         this._inferenceWorkers[feature].postMessage({
    //             name: feature,
    //             extractedFeatures: this._extractedFeatures
    //         });
    //     }
    // }
}