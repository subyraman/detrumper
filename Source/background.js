(function() {

    var ONE_DAY = 1000 * 60 * 60 * 24;

    var KEY_LAST_CHANGED_AT = 'lastChangedAt';
    var KEY_OPTIONS = 'options';
    var KEY_PAUSED = 'paused';
    var KEY_REPLACEMENT_TEXT = 'replacementText'

    var _alreadyQueued = false;

    function now() {
        return new Date().getTime();
    }


    function updateBadge(paused) {
        var badgeText = paused ? "OFF" : "";
        chrome.browserAction.setBadgeText( { text: badgeText } );
    }

    function isPaused() {
        return (localStorage.getItem(KEY_PAUSED) == 'true');
    }

    function setPaused(paused) {
        var lastChangedAt = now();

        localStorage.setItem(KEY_PAUSED, paused);
        chrome.storage.sync.set( { 'paused': paused } );
        updateBadge(paused);

        localStorage.setItem(KEY_LAST_CHANGED_AT, lastChangedAt);
        return lastChangedAt;
    }

    function togglePause(tab) {
        setPaused(!isPaused());

        // Reload the current tab.
        chrome.tabs.update(tab.id, {url: tab.url});
    }

    function getExcluded() {
        var opts = JSON.parse(localStorage.getItem(KEY_OPTIONS));
        return opts ? opts['excluded'] : [];
    }

    function getReplacementText() {
        var defaultText = "Cutie Toupeepants"
        var opts = JSON.parse(localStorage.getItem(KEY_OPTIONS));

        return opts ? opts['replacementText'] : defaultText;
    }

    function onMessage(request, sender, sendResponse) {
        var requestId = request.id;

        if(requestId == 'isPaused?') {
            // TODO: Convert to boolean.
            sendResponse({value: isPaused()});
        }
        else if(requestId == 'getExcluded') {
            sendResponse({value: getExcluded()});
        }
        else if(requestId == 'setOptions') {
            localStorage.setItem(KEY_OPTIONS, request.options);
        }
        else if(requestId == 'getReplacementText') {
            sendResponse(getReplacementText());
        }
    }

    chrome.browserAction.onClicked.addListener(togglePause);
    chrome.extension.onRequest.addListener(onMessage);

    // TODO: Have an option where you can select a specific replacement set, such as "Standard", "Cynical Millenial", etc.
    // TODO: The option value would then be passed into loadDictionary for appropriate dictionary file selection.

    updateBadge(isPaused());

})();
