function searchBoxEnter(event) {

    if (event.key == "Enter") {
        loadload(musicTrackR.searchBox.value());
    }

}

async function loadload(searchValue) {

    //get initial HLS file from track id

    //INCLUDE SPOTIFY ANALYSIS --> MATCH ISRC?

    // !! INCLUDE -> ability to search

    const client_id = "Ya7cEWyTIYPsvqGiHRBACgpAZ7lVcZXs";

    searchUrl = new URL(`https://api-v2.soundcloud.com/search?q=${searchValue}&client_id=${client_id}&limit=20`);
    const response = await fetch(searchUrl);
    const data = await response.json();
    const songJSON = data.collection.find(element => element.artwork_url != undefined);
    const url = songJSON.media.transcodings.find(element => element.format.mime_type == "audio/mpeg").url

    fetchSong(client_id, url);
    console.log(songJSON);
    getBpmFromSpotify(searchValue)
        .then((data) => musicTrackL.spotify = data);
    
}

async function fetchSong (client_id, url) {


    const proxyUrl = '';
    const songUrl = new URL(`${url}?client_id=${client_id}`);

    const response = await fetch(proxyUrl + songUrl);
    const data = await response.json();

    fetchHLS(data.url); //fetch the HLS file, parse it and extract the parts URLs
}

async function fetchHLS (url) {
    const response = await fetch(url);
    var data = await response.text();
    var reader = new M3U8FileParser();
    reader.read(data);
    const hls = reader.getResult();

    let urls = [];
    for (let i = 0; i < hls.segments.length; i++) {
        
        urls.push(hls.segments[i].url);
        
    }

    fetchParts(urls); //from the list of small mp3 parts concat it with cronker
    
}

async function fetchParts (urls) {

    const crunker = new Crunker.default();

     // for each url / part fetch it and make into a audiobuffer for cronker   
    crunker
        .fetchAudio(...urls)
        .then((buffers) => crunker.concatAudio(buffers))
        .then((merged) => crunker.export(merged, 'audio/mp3'))
        .then((merged) => musicTrackL.dropHandler({file:merged.blob}))


    //use cronker to concat all the audiobuffers and pass it to a DJ track

}

async function spotifyGetAccessToken() {

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

async function getBpmFromSpotify(searchQuery) {

    const ACCESS_TOKEN = await spotifyGetAccessToken();

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
          const trackId = data.tracks.items[0].id;
          const audioFeaturesUrl = `https://api.spotify.com/v1/audio-analysis/${trackId}`;

          return fetch(audioFeaturesUrl, { headers })
            .then(response => response.json())
            .then(data => data);
        } else {
          throw new Error('No track found with the provided name' + isrc);
        }
      });
}
