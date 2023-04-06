class spotifyData {

    constructor(type) {

        this.searchValue;
        this.data;
        this.analysis;
        this.ACCESS_TOKEN;


        this.searchbar = select("#spotify-search");

        // bind the searchbar to the search function
        this.searchbar.input(this.searchFunction.bind(this));
        select("#spotify-preview-button").mousePressed(() => {
            if (this.searchbar.value() != "") {
                this.playTrack(this.data.preview_url);
            }
        });

    }

    //plays the track if it is not already playing
    playTrack(url) {
        console.log(url);
        if (this.audioElement && this.audioElement.src == url) {

            console.log(this.audioElement.elt.paused);
            if (this.audioElement.elt.paused) {
                this.audioElement.play();
                return;
            } else {
                this.audioElement.pause();
                return;
            }
        } else {
            this.audioElement = createAudio(url);
            this.audioElement.play();
        }
    }

    //called when the searchbar is used to only search when needed
    searchFunction(e) {
        if (this.searchbar.value() != "" && e.data != null && this.searchbar.value().length > 2) {
            console.log(this.searchbar.value());
            this.loadTrackInfo(this.searchbar.value());
        }
    }

    //actually bind the searchbar to 
    async loadTrackInfo(searchValue) {

        //set this.spotify as the data returned
        this.getSpotifyTrackInfo(searchValue)
            .then((data) => this.data = data)
            .then(() => this.loadHTMLinfo(this.data))
            .then(() => this.getSpotifyAnalysisData())
            .then((analysis) => this.analysis = analysis);

    }

    async scrapeAllTracks(trackId, img, label, playButton) {

        //set this.spotify as the data returned
        this.getSpotifyTrackInfo_fromTrackId(trackId)
            .then((data) => this.data = data)
            .then(() => this.loadHTMLinfo_fromTrackId(this.data, img, label, playButton))
            .then(() => this.getSpotifyAnalysisData())
    }

    //gets the track info from spotify into the html
    loadHTMLinfo(data) {

        //put the cover art in the html
        select("#cover-art").attribute("src", data.album.images[0].url);

        //put the track name in the html
        select("#track-name").html(data.artists[0].name + " - " + data.name);

    }

    loadHTMLinfo_fromTrackId(data, img, label, playButton) {

        console.log(data, img, label, playButton);

        //put the cover art in the html
        img.attribute("src", data.album.images[0].url);

        //put the track name in the html
        label.html(data.artists[0].name + " - " + data.name);

        //make the play button work
        playButton.mousePressed(() => {
            this.playTrack(data.preview_url);
        });
    }

    //gets the token from spotify to access the api
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

    //gets the analysis data from spotify
    async getSpotifyAnalysisData() {

        //get the track id and set the api url
        const trackId = this.data.id;
        const apiUrl = `https://api.spotify.com/v1/audio-features/${trackId}`;

        //set the headers
        const headers = {
            'Authorization': `Bearer ${this.ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
        };

        //fetch the data
        return fetch(apiUrl, { headers })
            .then(response => response.json())
            .then(data => {
                if (data) {
                    return data;
                } else {
                    throw new Error('No track found with the provided name');
                }
            });
    }

    //gets the track info from spotify
    async getSpotifyTrackInfo(searchQuery) {

        //get the access token
        this.ACCESS_TOKEN = await this.spotifyGetAccessToken();

        //set the api url and headers
        const apiUrl = `https://api.spotify.com/v1/search?type=track&q=${searchQuery}`;
        const headers = {
            'Authorization': `Bearer ${this.ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
        };

        //fetch the data
        return fetch(apiUrl, { headers })
            .then(response => response.json())
            .then(data => {
                if (data.tracks.items.length > 0) {
                    return data.tracks.items[0];
                } else {
                    throw new Error('No track found with the provided name');
                }
            });
    }

    //gets the track info from spotify from a track id instead of a search query
    async getSpotifyTrackInfo_fromTrackId(trackId) {

        //get the access token
        this.ACCESS_TOKEN = await this.spotifyGetAccessToken();

        //set the api url and headers
        const apiUrl = `https://api.spotify.com/v1/search?type=track&q=isrc:${trackId}`;

        console.log(trackId, apiUrl);

        const headers = {
            'Authorization': `Bearer ${this.ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
        };

        //fetch the data
        return fetch(apiUrl, { headers })
            .then(response => response.json())
            .then(data => {
                if (data) {
                    return data.tracks.items[0];
                } else {
                    throw new Error('No track found with the provided name');
                }
            });
    }

}