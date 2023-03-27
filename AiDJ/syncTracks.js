class syncAlgorithm {

  constructor(syncThreshold, syncStep) {

    this.syncThreshold = syncThreshold; // threshold for synchronization in seconds
    this.syncStep = syncStep; // adjustment step size for synchronization

  }

  syncLoop(deck, otherDeck) {

    if (deck.bpm && otherDeck.bpm && deck.ticks && otherDeck.ticks) {

      let currentRate = otherDeck.sound.rate();
      let rateAdjustment;

      //GET CLOSEST TICK --> SINE WAVE OF DISTANCE TO TICK
      let deckClosestPeak = deck.sound.currentTime() - deck.ticks[closestIndex(deck.sound.currentTime(), deck.ticks)];
      let otherDeckClosestPeak = otherDeck.sound.currentTime() - otherDeck.ticks[closestIndex(otherDeck.sound.currentTime(), otherDeck.ticks)];

      // Calculate the time difference between the two closest peaks
      let timeDiff = deckClosestPeak - otherDeckClosestPeak;

      //MAKE SMOOTHER --> USE LERP
      rateAdjustment = otherDeck.barLength/deck.barLength;

      // Check if the two sine waves are within the synchronization threshold
      if (Math.abs(timeDiff) > this.syncThreshold) {
        // Adjust the rate of the other deck sine wave to synchronize it with the deck sine wave
        rateAdjustment = timeDiff > 0 ? currentRate + this.syncStep : currentRate - this.syncStep;
      }
      //if the tracks are playing and the rate is a real number --> i.e the tracks have not ended
      if (otherDeck.sound.rate() != 0 && deck.sound.rate() != 0 && Number.isFinite(rateAdjustment)) {
        //set correct bpm
        otherDeck.bpm = otherDeck.sound.rate() * otherDeck.initialBpm;
        //set correct rate
        otherDeck.sound.rate(rateAdjustment);
      }
    }
  }

}