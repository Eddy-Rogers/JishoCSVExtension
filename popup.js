let changeColor = document.getElementById('changeColor');

chrome.storage.sync.get('color', function(data) {
  changeColor.style.backgroundColor = data.color;
  changeColor.setAttribute('value', data.color);
});

changeColor.onclick = function(element) {
    var csvResult
    let color = element.target.value;

    // TODO :: Can we separate these queries?

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.executeScript(null, {
        code: kanji,
        allFrames: false, // this is the default
        runAt: 'document_start', // default is document_idle. See https://stackoverflow.com/q/42509273 for more details.
        }, function(results) {
          // results.length must be 1
          var result = results[0].trim();

          chrome.tabs.executeScript(null, {
            // TODO :: What should happen here if no furigana are available? What about if there are okurigana?
            code: furigana,
            allFrames: false, // this is the default
            runAt: 'document_start', // default is document_idle. See https://stackoverflow.com/q/42509273 for more details.
            }, function(results) {
              // results.length must be 1
              if(!(results[0] === "")) {
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
                  result += results[0];
                    navigator.clipboard.writeText(result).then(() => {
                        //clipboard successfully set
                      }, () => {
                        //clipboard write failed, use fallback
                      });
                  });
            });
        });
    });
  };

// Look into searching by element class name after getting the div 'primary'
const furigana =
`                  // furigana is stored as a separate span for each kanji
                  let furiganaSpans = document.querySelector("#primary .exact_block .furigana").children;
                  // okurigana show up in the word as individual spans, while the kanji are just floating. Makes my life easier 
                  let okuriganaSpans = document.querySelector("#primary .exact_block .text").children;
                  let oCount = 0;
                  let result = "";
                  for (const f of furiganaSpans) {
                    // okurigana don't have furigana but there needs to be a space for it anyway, which shows up as an empty span.
                    if (f.textContent === ""){
                      result += okuriganaSpans[oCount++].textContent;
                    } else {
                      result += f.textContent;
                    }
                  } result;`
const kanji = `document.querySelector("#primary .text").textContent;`

// TODO :: Get all of the meanings and separate them?
const meaning = `document.querySelector("#primary .meaning-meaning").textContent`
