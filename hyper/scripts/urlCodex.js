class urlCodex {

    constructor(type) {
        this.url = new URL(window.location.href);


        if (type == "encode") {
            this.setupEncoder();
        } else if (type == "decode") {
            this.setupEncoderNext();
            this.decode();
        }

    }

    setupEncoder() {
        this.submit = select(".submit-button");
        this.submit.mousePressed(this.validate.bind(this));
    }
    setupEncoderNext() {
        this.submit = select(".submit-button");
        this.submit.mousePressed(this.validateNext.bind(this));
    }

    validate() {

        if (spotify.data == undefined) {
            alert("No track selected");
            return;
        }

        if (select("textarea").value() == "") {
            alert("No text entered");
            return;
        }

        if (select("#color").value() == "" || select("#number").value() == "") {
            alert("No color / number selected");
            return;
        }
        if (spotify.data != undefined && select("textarea").value() != "") {
            this.encode();
        }
    }

    encode() {
        //get values from spotify and text
        let trackId = spotify.data.external_ids.isrc;
        let text = select("textarea").value();

        //add values to URL
        this.url.searchParams.append("track", trackId);
        this.url.searchParams.append("text", text);
        this.url.searchParams.append("color", select("#color").value());
        this.url.searchParams.append("number", select("#number").value());

        console.log(this.url);
        console.log(spotify.data);

        //redirect to next page
        this.url.pathname = "/sendit.html";
        window.location.href = this.url;
    }

    decode() {

        //get number of messages sent previously
        let numberOfMessages = this.url.searchParams.getAll("track").length;
        console.log(numberOfMessages);

        //get all values from URL
        let trackId = this.url.searchParams.getAll("track");
        let text = this.url.searchParams.getAll("text");
        let color = this.url.searchParams.getAll("color");
        let number = this.url.searchParams.getAll("number");

        //log values to console
        console.log(trackId);
        console.log(text);
        console.log(color);
        console.log(number);

        let parent = select(".images-container");

        //set all values
        for (let i = 0; i < numberOfMessages; i++) {
            let p = createP(text[i]);
            p.parent(select(".existing-text"));
            p.style("color", color[i]);

            let img = createImg("assets/AlbumCoverPlaceholder.png");
            img.parent(parent);
            img.style("border", `0.25em solid ${color[i]}`);

            let label = createElement("label", "artist - track");
            label.parent(parent);
            label.style("color", color[i]);

            let playButton = createButton("preview");
            playButton.parent(parent);

            console.log(trackId[i]);

            spotify.scrapeAllTracks(trackId[i], img, label, playButton);
        }

        select("#number").value(number);
        if (select("#number").value() < 1) {

            //hide spotify-search-container and #cover-art and preview when number is smaller than 1
            select(".spotify-search-container").hide();
            select("#cover-art").hide();

             //add small message to end of page instead of submit button
            select(".submit-button").hide();
            let endMessage = createP("This chain has ended :) Click <a href='submit.html'>here</a> to start a new chain");
            endMessage.style("padding", "3em");
            endMessage.parent(select(".form"));
            endMessage.style("color", "black");

        }

    }

    encodeNext() {

        console.log("VALIDATED");

        //temporary variables to send to URL
        let trackId = spotify.data.external_ids.isrc;
        let text = select("textarea").value();

        console.log(trackId, text);

        //append new values to URL
        this.url.searchParams.append("track", trackId);
        this.url.searchParams.append("text", text);
        this.url.searchParams.append("color", select("#color").value());
        this.url.searchParams.set("number", select("#number").value() - 1);

        //redirect to this.url
        this.url.pathname = "/sendit.html";
        window.location.href = this.url;

        // console.log(this.url);
        // console.log(spotify.data);
    }

    validateNext() {

        if (select("#cover-art").attribute("src") == "/assets/AlbumCoverPlaceholder.png") {
            alert("No track selected");
            return;
        }
        if (select("textarea").value() == "") {
            alert("No text entered");
            return;
        }
        if (select("#color").value() == "" || select("#color").value() == "#000000") {
            alert("No color selected");
            return;
        }
        if (select("#number").value() < 1) {
            alert("You have reached the end of the chain <3");
            return;
        }
        if (spotify.data != undefined && select("textarea").value() != "") {
            this.encodeNext();
        }
    }
}