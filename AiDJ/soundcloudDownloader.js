class soundData {

  constructor() {

    this.searchValue;
    this.spotifyData;
    this.spotifyAnalData;
    this.soundCloudData;
    this.client_id;
    this.searchUrl;
    this.createSearchBox();

  }

  //actually bind the searchbar to 
  createSearchBox() {
    this.searchBox = select("#searchbar");
    this.searchBox.attribute("onKeyDown", `soundScraper.searchBoxEnter(event)`);
  }

  searchBoxEnter(event) {

    if (event.key == "Enter") {
      this.loadTrackInfo(this.searchBox.value());
      select("#load-left").elt.classList.remove('visible');
      select("#load-left").elt.classList.add('hidden');
      select("#load-right").elt.classList.remove('visible');
      select("#load-right").elt.classList.add('hidden');
    }

  }

  async loadTrackInfo(searchValue) {

    //get search results and pick first

    this.client_id = "RMDIzNoU4QIzQsT3xq9J5TdxFFQlJvLY";
    this.searchUrl = new URL(`https://api-v2.soundcloud.com/search?q=${searchValue}&client_id=${this.client_id}&limit=20`);

    const response = await fetch(proxyUrl + this.searchUrl);
    const data = await response.json();

    this.soundCloudData = data.collection.find(element => element.artwork_url != undefined);
    this.url = this.soundCloudData.media.transcodings.find(element => element.format.mime_type == "audio/mpeg").url;

    if (this.soundCloudData.monetization_model == "SUB_HIGH_TIER") {
      alert("Warning : due to Soundcloud Go limitations this track will only play the 30 first seconds");
    }

    //set this.spotify as the data returned
    this.getBpmFromSpotify(searchValue)
      .then((data) => this.spotifyAnalData = data)
      .then(() => this.loadHTMLinfo(this.soundCloudData, this.spotifyData, this.spotifyAnalData));
  }

  loadHTMLinfo(soundCloudData, spotifyData, spotifyAnalData) {

    select("#album-cover").attribute("src", soundCloudData.artwork_url);
    select(".song-name").html(soundCloudData.title);
    select(".artist-name").html(soundCloudData.user.username);

    console.log(spotifyData);

    select(".track-bpm").html(`BPM : ${spotifyAnalData.track.tempo}`);
    select(".add-song-track-sp-name").html(spotifyData.artists[0].name + " - " + spotifyData.name);

    //make left right button visible
    select("#load-right").elt.classList.add('visible');
    select("#load-left").elt.classList.add('visible');


  }

  loadTrackUp(deck) {

    if (this.url) {

      addSong();
      this.fetchSong(this.client_id, this.url, deck);
      deck.spotify = this.spotifyAnalData;

    }
  }

  async fetchSong(client_id, url, deck) {

    const songUrl = new URL(`${url}?client_id=${client_id}`);

    const response = await fetch(proxyUrl + songUrl);
    const data = await response.json();

    this.fetchHLS(data.url, deck); //fetch the HLS file, parse it and extract the parts URLs
    console.log(data.url);

  }

  async fetchHLS(url, deck) {

    const response = await fetch(proxyUrl + url);

    var data = await response.text();

    var reader = new M3U8FileParser();
    reader.read(data);
    const hls = reader.getResult();

    let urls = [];
    for (let i = 0; i < hls.segments.length; i++) {

      urls.push(hls.segments[i].url);

    }

    this.fetchParts(urls, deck); //from the list of small mp3 parts concat it with cronker
    console.log(urls);

  }

  async fetchParts(urls, deck) {

    const crunker = new Crunker.default();

    // for each url / part fetch it and make into a audiobuffer for cronker   
    crunker
      .fetchAudio(...urls)
      .then((buffers) => crunker.concatAudio(buffers))
      .then((merged) => crunker.export(merged, 'audio/mp3'))
      .then((merged) => deck.dropHandler({ file: merged.blob }))

    //use cronker to concat all the audiobuffers and pass it to a DJ track

  }
  async spotifyGetAccessToken() {

    const client_id = 'd4a0cc60bd7f4f94977b99d626972221';
    const client_secret = '6fd7492de63942cc8f33f4aaa8f41c1a';

    const authOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(client_id + ':' + client_secret)
      },
      body: 'grant_type=client_credentials'
    };

    const response = await fetch('https://accounts.spotify.com/api/token', authOptions);
    const data = await response.json();

    if (response.status === 200) {
      return data.access_token;
    } else {
      throw new Error('Failed to get access token');
    }
  }

  async getBpmFromSpotify(searchQuery) {

    const ACCESS_TOKEN = await this.spotifyGetAccessToken();

    console.log(ACCESS_TOKEN);

    const apiUrl = `https://api.spotify.com/v1/search?type=track&q=${searchQuery}`;
    const headers = {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    };

    return fetch(apiUrl, { headers })
      .then(response => response.json())
      .then(data => {
        if (data.tracks.items.length > 0) {
          this.spotifyData = data.tracks.items[0];
          const trackId = this.spotifyData.id;
          const audioFeaturesUrl = `https://api.spotify.com/v1/audio-analysis/${trackId}`;

          return fetch(audioFeaturesUrl, { headers })
            .then(response => response.json())
            .then(data => data);
        } else {
          throw new Error('No track found with the provided name');
        }
      });
  }

}