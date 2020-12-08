let changeColor = document.getElementById('changeColor');

chrome.storage.sync.get('color', function(data) {
  changeColor.style.backgroundColor = data.color;
  changeColor.setAttribute('value', data.color);
});

changeColor.onclick = function(element) {

    var result = "";

    // TODO :: Can we separate these queries?

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.executeScript(null, {
        code: kanji,
        allFrames: false, // this is the default
        runAt: 'document_start', // default is document_idle. See https://stackoverflow.com/q/42509273 for more details.
        }, function(results) {
          // results.length must be 1
          result += results[0].trim();
        });
      });

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


      });

    chrome.tabs.executeScript(null, {
      code: meaning,
      allFrames: false, // this is the default
      runAt: 'document_start', // default is document_idle. See https://stackoverflow.com/q/42509273 for more details.
      }, function(results) {
        // results.length must be 1
        result += results[0];

        });

        navigator.clipboard.writeText(result).then(() => {
            //clipboard successfully set
          }, () => {
            //clipboard write failed, use fallback
          });
  };

// TODO :: I know this is a meme but there has to be a better way to do this.
// Look into searching by element class name after getting the div 'primary'
const kanji = `document.getElementById("primary").children[0].children[1].children[0].children[0].children[0].children[1].textContent`
const furigana = `var spanList = document.getElementById("primary").children[0].children[1].children[0].children[0].children[0].children[0];
                  var result = "";
                  for (var i = 0; i < spanList.children.length; i++) {
                    result += spanList.children[i].textContent;
                  } result;`

// TODO :: Get all of the meanings and separate them?
const meaning = `document.getElementById("primary").children[0].children[1].children[1].children[0].children[1].children[0].children[1].textContent`
