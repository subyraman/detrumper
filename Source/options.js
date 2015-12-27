var startingOptions = JSON.parse(localStorage.getItem("options"));
var start = !!startingOptions;

function splitTrim(string, delim) {
    split = string.split(delim);
    for (var i=0; i<split.length; i++) {
        split[i] = split[i].trim();
    }
    return split;
}

//document.getElementById('replacement-text').onkeyup = setOptions;
document.getElementById("replacement-text").value = (start ? startingOptions.replacementText : 'Cutie Toupeepants');

//document.getElementById('excluded').onkeyup = setOptions;
document.getElementById('excluded').value = (start ? startingOptions.excluded : []).join(', ');

document.getElementById('save').onclick = setOptions;

function setOptions() {
    var options = {
        replacementText: document.getElementById("replacement-text").value,
        excluded: splitTrim(document.getElementById('excluded').value, ',')
    };

    localStorage['options'] = JSON.stringify(options);
    chrome.extension.sendRequest({name: "setOptions", options: JSON.stringify(options)});

    chrome.tabs.getCurrent(function(tab) {
        chrome.tabs.remove(tab.id, function() { });
    });
}
