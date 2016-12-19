/* It’s not elegant nor uber optimized but it was erratically designed in the span of a few weeks and gets the job done. Please feel free to improve. Thanks. */

r(function() {
	// VARIABLES
	
	var form = document.getElementsByTagName('form')[0],
			details = document.getElementsByClassName('details'),
			boxes = document.querySelectorAll('input[type="checkbox"]'),
			
			howTo = document.createElement('section'),
			helper = document.createElement('button'),
			help = document.createElement('div'),
				
			controls = document.getElementById('controls'),
			barWrap = document.createElement('div'),
			bar = document.createElement('div'),
			
			count = boxes.length,
			checked = 0,
			progress = 0;
			
	var isFirefox = false;
	
	// POLYFILLS
	
	// matches 
	if (!Element.prototype.matches) {
		Element.prototype.matches = 
			Element.prototype.matchesSelector || 
			Element.prototype.mozMatchesSelector ||
			Element.prototype.msMatchesSelector || 
			Element.prototype.oMatchesSelector || 
			Element.prototype.webkitMatchesSelector ||
			function(s) {
      	var matches = (this.document || this.ownerDocument).querySelectorAll(s),
				i = matches.length;
				while (--i >= 0 && matches.item(i) !== this) {}
					return i > -1;            
			};
	}
	
	// localStorage with cookie fallback
	var storage = (function() {
		var _hasLocalStorage = (function() {
			var test = 'test';
			try {
				localStorage.setItem(test, test);
				localStorage.removeItem(test);
				return true;
			} catch(e) {
				return false;
			}
		})();

		var _readCookie = function(name) {
			var nameEQ = name + "=";
			var ca = document.cookie.split(';');
			for (var i = 0; i < ca.length; i++) {
				var c = ca[i];
				while (c.charAt(0) == ' ') c = c.substring(1, c.length);
				if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
			}
			return null;
		};

		var _writeCookie = function(name, value, days) {
			var expiration = (function() {
				if (days) {
					var date = new Date();
					date.setTime(date.getTime() + (days*24*60*60*1000));
					return "; expires=" + date.toGMTString();
				} else {
					return "";
				}
			})();
			document.cookie = name + "=" + value + expiration + "; path=/";
		};
  	
		var _clearCookie = function() {
			var ca = document.cookie.split(";");
			for (var i = 0; i < ca.length; i++){
				var c = ca[i];
				var posEQ = c.indexOf("=");
				var name = posEQ > -1 ? c.substr(0, posEQ) : c;
				document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";                              
			}
		};

		return {
			set: function(name, value, days) {
				_hasLocalStorage ? localStorage.setItem(name, value) : _writeCookie(name, value, days);
			},

			get: function(name) {
				return _hasLocalStorage ? localStorage.getItem(name) : _readCookie(name);
			},

			remove: function(name) {
				_hasLocalStorage ? localStorage.removeItem(name) : this.set(name, "", -1);
			},
    	
			clear: function() {
				_hasLocalStorage ? localStorage.clear() : _clearCookie();
			}
		};
	})();
  
	// FUNCTIONS
	
  var getClosest = function (elem, tag) {
    for (; elem && elem !== document && elem.nodeType === 1; elem = elem.parentNode) {
    	if (elem.tagName.toLowerCase() === tag) {
      	return elem;
      }
    }
		return null;
	};

	function barHandler(widthPer) {
		bar.style.width = widthPer + "%";
		bar.dataset.width = widthPer + "%";
	};
	
	function updateProgress() {
		checked = document.querySelectorAll('input[type="checkbox"]:checked').length;
		progress = parseInt(((checked / count) * 100), 10);
		barHandler(progress);
	};
  
	function scrollTo(element, to, duration) {
		if (duration <= 0) return;
		var difference = to - element.scrollTop;
		var perTick = difference / duration * 10;
		setTimeout(function() {
			element.scrollTop = element.scrollTop + perTick;
			if (element.scrollTop == to) return;
			scrollTo(element, to, duration - 10);
		}, 10);
	};

	function scrollTop() {
	  if (isFirefox) {
    	scrollTo(document.getElementsByTagName('html')[0], form.offsetTop, 600);
		} else {
			scrollTo(document.body, form.offsetTop, 600);
		}
	};
	
	function focusNoScroll(el) {
		var x = window.scrollX, y = window.scrollY;
		el.focus();
		window.scrollTo(x, y);
	};
	
	function resetChecklist() {
		storage.clear();
		barHandler(0);

		var enable = document.querySelectorAll('button[disabled]');
		for (var i = 0; i < enable.length; i++) {
			enable[i].disabled = false;
		}

		var uncheck = document.querySelectorAll('input[type="checkbox"]:checked');
		for (var i = 0; i < uncheck.length; i++) {
			uncheck[i].checked = false;
		}

		focusNoScroll(document.querySelector('input[name]'));
		scrollTop();
	};
	
	function toggleAria(el) {
		if (el.getAttribute('aria-hidden') === 'true') {
			el.setAttribute('aria-hidden', 'false');
		} else {
			el.setAttribute('aria-hidden', 'true');
		}
	};
	
	function toggleDetails(trigger) {
		var detail = trigger.nextElementSibling;
		trigger.classList.toggle('open');
		detail.classList.toggle('hidden');		
		toggleAria(detail);
	};
	
	function toggleHelp() {
		help.classList.toggle('hidden');
		toggleAria(help);
	};

	// INIT (run on doc Ready)
	
	(function checkFirefox() {
		if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
			isFirefox = true;
		}
	})();
		
	(function hideDetails() {
		document.getElementsByTagName('body')[0].classList.add('js-enabled');
		for (var i = 0; i < details.length; i++) {
			var detail = details[i];
			detail.classList.add('hidden');
			detail.setAttribute('aria-hidden', 'true');
			detail.setAttribute('aria-live', 'polite');
		};
	})();
	
	(function initProgressBar() {
		var retrievedProgress = storage.get('blitzDesign_barWidth');
		barWrap.id = 'progress';
		bar.id = 'progress-inner';
		barWrap.appendChild(bar);
		controls.insertBefore(barWrap, controls.firstChild);
		if (retrievedProgress) {
			barHandler(retrievedProgress);
		} else {
	  	setTimeout(function() {
				updateProgress();
				storage.set('blitzDesign_barWidth', progress);
			}, 100);
		};
	})();

  (function initCheckboxes() {
		for (var i = 0; i < count; i++) {
			var box = boxes[i];
			if (box.hasAttribute("value")) {
				var storageId = "blitzDesign_" + box.getAttribute("value");
				var oldVal = storage.get(storageId);
				box.checked = oldVal === "true" ? true : false;
			}
		};
	})();
	
	(function initHelp() {
		howTo.id = 'how-to';
	
		helper.type = 'button';
		helper.className = 'helper';
		helper.id = 'helper';
		helper.innerHTML = 'Help';
			
		howTo.appendChild(helper);
		
		help.classList.add('help-content', 'hidden');
		help.id = 'help';
		help.setAttribute('aria-hidden', 'true');
		help.setAttribute('aria-live', 'assertive');
		help.innerHTML = '<div class="wrapper">'
			+ '<p>If you’re using a mouse or a finger:</p>'
			+ '<ul>'
  		+ '<li>click the checkbox to check</li>'
  		+ '<li>click the label to display details</li>'
  		+ '<li>click reset to… reset the checklist</li>'
  		+ '</ul>'
  		+ '<p>If you’re using a keyboard:</p>'
  		+ '<ul>'
  		+ '<li>press “tab” to navigate items</li>'
  		+ '<li>press “enter” to check</li>'
  		+ '<li>press “space” to display details</li>'
  		+ '<li>press “backspace” to reset the checklist</li>'
  		+ '</ul>'
  		+ '<p>Don’t worry, your checklist is autosaved: you can close this page, your current checklist will be retrieved when reopened.</p>'	
  		+ '<p>Finally, you can install this web app on iOS and Android. And if you’re using Chrome, Firefox or Opera, it will also be available offline.</p>'
  		+ '</div>';
			
		howTo.appendChild(help);

		helper.addEventListener('click', toggleHelp, false);
		
		document.body.insertBefore(howTo, document.getElementsByTagName('main')[0]);
	})();
	
	// Event Listeners 
	
	form.addEventListener('click', function(e) {
		var elt = e.target;
		var isSummary = elt.classList.contains('summary');
		var isSummaryNested = elt.matches('.summary > *');
		var isDetailsPara = elt.classList.contains('details-para');
		var isReset = (elt.type === 'reset');
		
		if (isSummary) {
			e.preventDefault();
			toggleDetails(elt);
		} else if (isSummaryNested) {
			e.preventDefault();
			toggleDetails(elt.parentElement);
		} else if (isReset) {
			resetChecklist();
		} else if (isDetailsPara) {
			e.preventDefault();
		} else {
			return;
		}
	});
	
	form.addEventListener('change', function(e) {
		var elt = e.target;
		var active = document.activeElement;
		updateProgress();
		if (elt.getAttribute("value") !== null) {
			var storageId = "blitzDesign_" + elt.getAttribute("value");
			var checkStatus = elt.checked;
		} else {
			var storageId = "blitzDesign_" + active.getAttribute("value");
			var checkStatus = active.checked;
		}
		storage.set('blitzDesign_barWidth', progress);
		storage.set(storageId, checkStatus);
	});
	
	if (isFirefox) {
		document.addEventListener('keyup', keyboardHandler, false);
	} else {
		document.addEventListener('keydown', keyboardHandler, false);
	}
	
	function keyboardHandler(e) {
		var active = document.activeElement;
		var isCheckbox = (active.type === 'checkbox');
		var pressBackspace = (e.key === 'Backspace' || e.keyCode === 8);
		var pressEnter = (e.key === 'Enter' || e.keyCode === 13);
		var pressSpacebar = (e.key === 'Spacebar' || e.keyCode === 32);
		
		if (pressBackspace) {
			resetChecklist();
			if (isFirefox) {
				active.blur();
			};
		} else if (isCheckbox && pressEnter) {
			e.preventDefault();
			var updateChange = new Event('change');
		  if (active.checked) {
		  	active.checked = false;
		  } else {
		  	active.checked = true;
		  };
		  form.dispatchEvent(updateChange);
		  if (!isFirefox) {
				e.stopImmediatePropagation();
			};
		} else if (isCheckbox && pressSpacebar) {
			e.preventDefault();
			var pushActive = active.parentElement.getElementsByClassName('summary')[0];			
			toggleDetails(pushActive);
		} else {
			return;
		}
	};

});
function r(f){/in/.test(document.readyState)?setTimeout('r('+f+')',9):f()}																	