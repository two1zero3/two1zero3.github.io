const metaDateTags = document.querySelectorAll("meta[itemprop=datePublished]");
const descriptions = document.querySelectorAll("article > .description");

descriptions.forEach((element,index) => {

    element.innerHTML += ` | <span>${metaDateTags[index].content}</span>`;
    
});