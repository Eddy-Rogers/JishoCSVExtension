let changeColor = document.getElementById('changeColor');

chrome.storage.sync.get('color', function(data) {
  changeColor.style.backgroundColor = data.color;
  changeColor.setAttribute('value', data.color);
});

changeColor.onclick = function(element) {
    var csvResult
    let color = element.target.value;
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.executeScript(null, {
        code: kanji,
        allFrames: false, // this is the default
        runAt: 'document_start', // default is document_idle. See https://stackoverflow.com/q/42509273 for more details.
        }, function(results) {
          // results.length must be 1
          var result = results[0].trim();

          chrome.tabs.executeScript(null, {
            code: furigana,
            allFrames: false, // this is the default
            runAt: 'document_start', // default is document_idle. See https://stackoverflow.com/q/42509273 for more details.
            }, function(results) {
              // results.length must be 1
              result += ", [" + results[0] + "] ";

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

const kanji = `document.getElementById("primary").children[0].children[1].children[0].children[0].children[0].children[1].textContent`
const furigana = `var spanList = document.getElementById("primary").children[0].children[1].children[0].children[0].children[0].children[0];
                  var result = "";
                  for (var i = 0; i < spanList.children.length; i++) {
                    result += spanList.children[i].textContent;
                  } result;`

const meaning = `document.getElementById("primary").children[0].children[1].children[1].children[0].children[1].children[0].children[1].textContent`
