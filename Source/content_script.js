(function() {
	var _self = this;
	var _replacementText;

	function getReplacementText(callback) {
		chrome.extension.sendRequest({id: "getReplacementText"}, function(response) {
			_replacementText = response;
			callback.apply(_self, arguments);
		});
	}

	function handleText(textNode) {
		var v = textNode.nodeValue;
		var matchFound = false;

		var trumpRegex = /Donald J\.? Trump|Donald Trump|Trump/

		if (trumpRegex.test(v)) {
			v = v.replace(trumpRegex, _replacementText);
			matchFound = true;
		}
		
		// Only change the node if there was any actual text change
		if (matchFound) {
			textNode.nodeValue = v;	
		}	
		
	}

	function walk(node) {

		// I stole this function from here: - ZW
		// And I stole it from ZW - AG
		// http://is.gd/mwZp7E
		
		var child, next;

		switch(node.nodeType) {
			case 1:  // Element
			case 9:  // Document
			case 11: // Document fragment
				child = node.firstChild;
				while(child) {
					next = child.nextSibling;
					walk(child);
					child = next;
				}
				break;
			case 3: // Text node
				handleText(node);
				break;
		}
	}



	// Flag to prevent multiple triggering of DOMSubtreeModified
	// set it to true initially so that the DOMSubtreeModified event
	// does not trigger work until the two chrome.extension requests
	// have been handled
	var running = true;


	// Function that calls walk() but makes sure that it only is called once
	// the first call has finished. Any changes that we make to the DOM in walk()
	// will trigget DOMSubtreeModified, so we handle this by using the running flag
	function work() {
		// Set running to true to prevent more calls until the first one is done
		running = true;
		
		// Go through the DOM
		walk(document.body);

		// Set running to false to allow additional calls
		running = false;
	}



	chrome.extension.sendRequest({id: 'isPaused?'}, function(response) {
		var isPaused = response.value;

		// If the extension is paused, no need to try to call getExcluded
		if(isPaused) {
	        return;
	    }
    
	    chrome.extension.sendRequest({id: 'getExcluded'}, function (r2) {
	        var ex = r2.value;
	        for (x in ex) { 
	            if (ex[x] && window.location.href.indexOf(ex[x]) != -1) {
	                return;
	            }
	        }

	    	getReplacementText(function() {
	    		work();
	    	})
	    });

	});




	/**
		The below solution to handle dynamically added content
		is borrowed from http://stackoverflow.com/a/7326468
		*/

	// Add a timer to prevent instant triggering on each DOM change
	var timeout = null;

	// Add an eventlistener for changes to the DOM, e.g. new content has been loaded via AJAX or similar
	// Any changes that we do to the DOM will trigger this event, so we need to prevent infinite looping
	// by checking the running flag first. 
	document.addEventListener('DOMSubtreeModified', function(){
		if (running) {
			return;
		}

		if (timeout) {
			clearTimeout(timeout);
		}

		timeout = setTimeout(work, 500);
	}, false);

})();
