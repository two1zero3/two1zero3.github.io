function searchBoxEnter(event) {

    if (event.key == "Enter") {
        loadload(musicTrackL.searchBox.value());
    }

}

async function loadload() {

    console.log("AA");
    const proxyUrl = '';
    const url = 'https://api-v2.soundcloud.com/media/soundcloud:tracks:1341960127/b5ac1987-9723-4069-b04a-63963499499c/stream/progressive?client_id=Ya7cEWyTIYPsvqGiHRBACgpAZ7lVcZXs';
    const response = await fetch(proxyUrl + url);
    const data = await response.json();
    console.log(data);
}

var loadJSONP = (function(){
    var unique = 0;
    return function(url, callback, context) {
      // INIT
      var name = "_jsonp_" + unique++;
      if (url.match(/\?/)) url += "&callback="+name;
      else url += "?callback="+name;
      
      // Create script
      var script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = url;
      
      // Setup handler
      window[name] = function(data){
        callback.call((context || window), data);
        document.getElementsByTagName('head')[0].removeChild(script);
        script = null;
        delete window[name];
      };
      
      // Load JSON
      document.getElementsByTagName('head')[0].appendChild(script);
    };
  })();