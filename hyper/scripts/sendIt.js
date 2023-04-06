let url = new URL(window.location.href);
let copyButton;

function setup () {


    url.pathname = "hyper/receive.html";

    copyButton = select("#link-to-send");
    copyButton.style("font-size", "2em");

    //make link copy-able but not clickable (so it doesn't redirect the user when tried to copy), use Clipboard API to make it "click to copy me", use native javascript


    console.log(url.href);

    copyButton.mousePressed(() => {
        navigator.clipboard.writeText(url.href);
        copyButton.html("Copied!");
        copyButton.style("background-color", "green");
        setTimeout(() => {
            copyButton.html("click to copy me :)");
            copyButton.style("background-color", "transparent");
        }, 1000);
    });
    


    
}

function draw () {

}
