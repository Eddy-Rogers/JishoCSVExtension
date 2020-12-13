let saveResult = document.getElementById("changeColor");

chrome.storage.sync.get('color', function(data) {
  saveResult.style.backgroundColor = data.color;
  saveResult.setAttribute('value', data.color);
});

saveResult.addEventListener("click",function() {
    // let color = element.target.value;

    // TODO :: Can we separate these queries?

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.executeScript(null, {
        code: kanji,
        allFrames: false, // this is the default
        runAt: 'document_start', // default is document_idle. See https://stackoverflow.com/q/42509273 for more details.
        }, function(results) {
          // results.length must be 1
        let result = results[0].trim();
        // Key for dictionary
        let key = result;

        chrome.tabs.executeScript(null, {
            // TODO :: What should happen here if no furigana are available? What about if there are okurigana?
            code: furigana,
            allFrames: false, // this is the default
            runAt: 'document_start', // default is document_idle. See https://stackoverflow.com/q/42509273 for more details.
            }, function(results) {
              // results.length must be 1
              if(!(results[0] === "" || results[0] == null)) {
                result += ", [" + results[0] + "] ";
              }
              else {
                result += ", ";
              }

              chrome.tabs.executeScript(null, {
                code: meaning,
                allFrames: false, // this is the default
                runAt: 'document_start', // default is document_idle. See https://stackoverflow.com/q/42509273 for more details.
                }, function(results) {
                  // results.length must be 1
                  result += results[0] + "\n";
                  let storedResults = JSON.parse(window.localStorage.getItem("results"));
                  if (storedResults === null) {
                    storedResults = {};
                  }
                  storedResults[key] = result;
                  window.localStorage.setItem("results", JSON.stringify(storedResults));
                  });
            });
        });
    });
  });

let sendToClip = document.getElementById("sendToClip");
sendToClip.addEventListener("click", function(){
  let results = JSON.parse(window.localStorage.getItem("results"));
  let resultString = "";
  for (const key in results){
    // skip prototype keys
    if (!results.hasOwnProperty(key)) continue;
    resultString += results[key];
  }

  // clearing saved buffer
  window.localStorage.setItem("results", JSON.stringify({}));
  navigator.clipboard.writeText(resultString).then(() => {}, () => {});
});
// Look into searching by element class name after getting the div 'primary'
const furigana =
`                  // array of spans, each containing either a section of the furigana or nothing (in case of a okurigana in the original word)
                  let furiganaSpans = [];
                  // **SPECIAL CASE** Apparently sometimes jisho uses ruby to store the furigana, and also includes kanji?? Why
                  furiganaSpans[0] =  document.querySelector("#primary .furigana rt");
                  // okurigana show up in the word as individual spans, while the kanji are just floating in text content of the parent span.
                  // Makes my life easier
                  let okuriganaSpans = document.querySelector("#primary .text").children;
                  // checking if ruby rb/rt pairs were grabbed
                  if (furiganaSpans[0] == null) {
                    furiganaSpans = document.querySelector("#primary .furigana").children;
                  }
                  
                  let oCount = 0;
                  let result = "";
                  for (const f of furiganaSpans) {
                    // okurigana don't have furigana but there needs to be a space for it anyway, which shows up as an empty span.
                    // if there are no more okurigana, it means that the furigana are just grouped strangely and not every
                    // kanji has a furigana 'directly' above it, so don't check for more okurigana
                    //TODO: change this oCount into an iterator maybe
                    if (f.textContent === "" && oCount < okuriganaSpans.length){
                      result += okuriganaSpans[oCount++].textContent;
                    } else {
                      result += f.textContent;
                    }
                  } result;`
const kanji = `document.querySelector("#primary .text").textContent;`

// TODO :: Get all of the meanings and separate them?
const meaning = `document.querySelector("#primary .meaning-meaning").textContent`
