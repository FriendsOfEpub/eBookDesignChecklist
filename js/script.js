r(function () {
  // CUSTOM

  var STORAGE_PREFIX = "blitzDesign_";

  var HELP_TEXT = `<div class='wrapper'>
    <p>If you’re using a mouse or a finger:</p>
    <ul>
      <li>click the “Expand/Collapse button” to toggle all details;</li>
      <li>click the label to display details;</li>
      <li>click the checkbox to check;</li>
      <li>click the “Skip Section” button if the section doesn’t apply;</li>
      <li>click reset to… reset the checklist.</li>
    </ul>
    <p>If you’re using a keyboard:</p>
    <ul>
      <li>press “tab” to navigate items;</li>
      <li>press “enter” to check;</li>
      <li>press “space” to display details;</li>
      <li>press “esc” to reset the checklist.</li>
    </ul>
    <p>Don’t worry, your checklist is autosaved: you can close this page, your current checklist will be retrieved when reopened.</p>
    <p>Finally, this is a Progressive Web App you can install on platforms and browsers which support it. It will even work offline if Service Workers are supported.</p>
  </div>`;

  // VARIABLES

  var form = document.querySelector("form");
  var details = document.querySelectorAll(".details");
  var boxes = document.querySelectorAll("input[type='checkbox']");

  var howTo = document.createElement("section");
  var helper = document.createElement("button");
  var help = document.createElement("div");

  var header = document.querySelector("header");
  var toggle = document.createElement("button");

  var skippable = document.querySelectorAll("[data-skippable='true']");

  var controls = document.querySelector("#controls");
  var barWrap = document.createElement("div");
  var bar = document.createElement("div");

  var count = boxes.length;
  var checked = 0;
  var progress = 0;

  var isFirefox = false;

  var mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  var noMotion = false;

  // FUNCTIONS

  function getClosest(elem, tag) {
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
    checked = document.querySelectorAll("input[type='checkbox']:checked").length;
    progress = parseInt(((checked / count) * 100), 10);
    barHandler(progress);
  };

  function scrollTo(element, to, duration) {
    if (!noMotion) {
      if (duration <= 0) return;
      var difference = to - element.scrollTop;
      var perTick = difference / duration * 10;
      setTimeout(function () {
        element.scrollTop = element.scrollTop + perTick;
        if (element.scrollTop == to) return;
        scrollTo(element, to, duration - 10);
      }, 10);
    }
  };

  function scrollTop() {
    scrollTo(document.scrollingElement, form.offsetTop, 600);
  };

  function focusNoScroll(el) {
    var x = window.scrollX;
    var y = window.scrollY;
    el.focus();
    window.scrollTo(x, y);
  };

  function resetChecklist() {
    localStorage.clear();
    barHandler(0);

    var enable = document.querySelectorAll("button[disabled]");
    for (var i = 0; i < enable.length; i++) {
      enable[i].disabled = false;
    }

    var uncheck = document.querySelectorAll("input[type='checkbox']:checked");
    for (var i = 0; i < uncheck.length; i++) {
      uncheck[i].checked = false;
    }

    focusNoScroll(document.querySelector("input[name]"));
    scrollTop();
  };

  function toggleAria(el) {
    if (el.getAttribute("aria-hidden") === "true") {
      el.setAttribute("aria-hidden", "false");
    } else {
      el.setAttribute("aria-hidden", "true");
    }
  };

  function toggleDetails(trigger) {
    var detail = trigger.nextElementSibling;
    trigger.classList.toggle("open");
    detail.classList.toggle("hidden");
    toggleAria(detail);
  };

  function toggleHelp() {
    if (helper.classList.contains("open")) {
      helper.innerHTML = "?";
      helper.setAttribute("aria-label", "Help");
      helper.setAttribute("title", "Help");
      document.body.style.overflow = "auto";
    } else {
      helper.innerHTML = "×";
      helper.setAttribute("aria-label", "Close help");
      helper.setAttribute("title", "Close help");
      helper.focus();
      document.body.style.overflow = "hidden";
    }
    helper.classList.toggle("open");
    help.classList.toggle("hidden");
    toggleAria(help);
  };

  function checkChildren(trigger) {
    var sectionId = trigger.getAttribute("id");
    var checkScope = sectionId.substring(0, sectionId.indexOf("-list"));
    var toCheck = document.querySelectorAll("input[name='" + checkScope + "']");
    for (var j = 0; j < toCheck.length; j++) {
      var checkMe = toCheck[j];
      checkMe.checked = true;
      updateProgress();
      localStorage.setItem(STORAGE_PREFIX + checkMe.getAttribute("value"), "true");
      localStorage.setItem(STORAGE_PREFIX + "barWidth", progress);
    }
    trigger.setAttribute("disabled", "disabled");
    localStorage.setItem(STORAGE_PREFIX + trigger.getAttribute("id") + "_button", "true");

    // scroll to next section
    var currentSection = getClosest(trigger, "section");
    var nextSection = currentSection.nextElementSibling;
    var nextButton = nextSection.querySelector(".checkAll");
    var nextInput = nextSection.querySelector("input");
    if (nextButton) {
      focusNoScroll(nextButton);
    } else {
      focusNoScroll(nextInput);
      if (isFirefox) {
        nextInput.blur();
        setTimeout(function () {
          nextInput.focus();
        }, 600);
      }
    }
    scrollTo(document.scrollingElement, nextSection.offsetTop, 600);
  };

  function changeMotionHook() {
    if (mediaQuery.matches) {
      noMotion = true;
    } else {
      noMotion = false;
    }
  }

  // INIT (run on doc Ready)

  (function checkFirefox() {
    if (navigator.userAgent.toLowerCase().indexOf("firefox") > -1) {
      isFirefox = true;
    }
  })();

  (function initMotionHook() {
    changeMotionHook();
  })();

  (function hideDetails() {
    document.body.classList.add("js-enabled");
    for (var i = 0; i < details.length; i++) {
      var detail = details[i];
      detail.classList.add("hidden");
      detail.setAttribute("aria-hidden", "true");
      detail.setAttribute("aria-live", "polite");
    };
  })();

  (function initProgressBar() {
    var retrievedProgress = localStorage.getItem(STORAGE_PREFIX + "barWidth");
    barWrap.id = "progress";
    bar.id = "progress-inner";
    barWrap.appendChild(bar);
    controls.insertBefore(barWrap, controls.firstChild);
    if (retrievedProgress) {
      barHandler(retrievedProgress);
    } else {
      setTimeout(function () {
        updateProgress();
        localStorage.setItem(STORAGE_PREFIX + "barWidth", progress);
      }, 100);
    };
  })();

  (function initHelp() {
    howTo.id = "how-to";

    helper.type = "button";
    helper.className = "helper";
    helper.id = "helper";
    helper.innerHTML = "?";
    helper.setAttribute("aria-label", "Help");
    helper.setAttribute("title", "Help");
    helper.setAttribute("aria-haspopup", "help");
    helper.setAttribute("aria-controls", "help");

    help.classList.add("help-content", "hidden");
    help.id = "help";
    help.setAttribute("role", "dialog");
    help.setAttribute("aria-modal", "true");
    help.setAttribute("aria-hidden", "true");
    help.setAttribute("aria-live", "assertive");
    help.tabIndex = -1;

    help.innerHTML += HELP_TEXT;

    howTo.appendChild(help);

    helper.addEventListener("click", toggleHelp, false);

    header.appendChild(helper)

    document.body.insertBefore(howTo, document.querySelector("main"));
  })();

  (function initToggle() {
    toggle.type = "button";
    toggle.id = "toggle";
    toggle.className = "checkAll";
    toggle.innerHTML = "Expand all details";
    header.appendChild(toggle);
  })();

  (function initCheckboxes() {
    for (var i = 0; i < count; i++) {
      var box = boxes[i];
      if (box.hasAttribute("value")) {
        var storageId = STORAGE_PREFIX + box.getAttribute("value");
        var oldVal = localStorage.getItem(storageId);
        box.checked = oldVal === "true" ? true : false;
      }
    };
  })();

  (function initCheckAllButtons() {
    for (var i = 0; i < skippable.length; i++) {
      var scope = skippable[i].id;
      var value = scope.toLowerCase();
      var button = document.createElement("button");
      var disabled = localStorage.getItem(STORAGE_PREFIX + value + "_button");
      button.type = "button";
      button.classList.add("checkAll");
      button.id = value;
      button.innerHTML = "Skip section";
      if (disabled) {
        button.setAttribute("disabled", "disabled");
      }
      var section = document.querySelector("#" + value);
      var wrapper = section.firstElementChild;
      var firstLabel = wrapper.querySelector("label");
      wrapper.insertBefore(button, firstLabel);
    };
  })();

  // Event Listeners 

  mediaQuery.addListener(changeMotionHook);

  form.addEventListener("click", function (e) {
    var elt = e.target;
    var isSummary = elt.classList.contains("summary");
    var isSummaryNested = elt.matches(".summary > *");
    var isDetailsPara = elt.classList.contains("details-para");
    var isCheckAllButton = elt.classList.contains("checkAll");
    var isReset = (elt.type === "reset");

    if (isSummary) {
      e.preventDefault();
      toggleDetails(elt);
    } else if (isSummaryNested) {
      e.preventDefault();
      toggleDetails(elt.parentElement);
    } else if (isCheckAllButton) {
      checkChildren(elt);
    } else if (isReset) {
      resetChecklist();
    } else if (isDetailsPara) {
      e.preventDefault();
    } else {
      return;
    }
  });

  form.addEventListener("change", function (e) {
    var elt = e.target;
    var active = document.activeElement;
    updateProgress();
    if (elt.getAttribute("value") !== null) {
      var storageId = STORAGE_PREFIX + elt.getAttribute("value");
      var checkStatus = elt.checked;
    } else {
      var storageId = STORAGE_PREFIX + active.getAttribute("value");
      var checkStatus = active.checked;
    }
    localStorage.setItem(STORAGE_PREFIX + "barWidth", progress);
    localStorage.setItem(storageId, checkStatus);
  });

  if (isFirefox) {
    document.addEventListener("keyup", lolFirefox, false);
  }
  document.addEventListener("keydown", keyboardHandler, false);

  function lolFirefox(e) {
    var active = document.activeElement;
    var isCheckbox = (active.type === "checkbox");
    var pressSpacebar = (e.key === "Spacebar" || e.keyCode === 32);

    if (isCheckbox && pressSpacebar) {
      e.preventDefault();
    }
  };

  function keyboardHandler(e) {
    var active = document.activeElement;
    var isCheckbox = (active.type === "checkbox");
    var isHelperOpen = (active.classList.contains("helper") && active.classList.contains("open"));
    var pressTab = (e.key === "Tab" || e.keyCode === 9);
    var pressEnter = (e.key === "Enter" || e.keyCode === 13);
    var pressEscape = (e.key === "Escape" || e.keyCode === 27);
    var pressSpacebar = (e.key === "Spacebar" || e.keyCode === 32);

    if (pressEscape) {
      e.preventDefault();
      e.stopImmediatePropagation();
      if (isHelperOpen) {
        toggleHelp();
      } else {
        resetChecklist();
        if (isFirefox) {
          active.blur();
        };
      }
    } else if (isHelperOpen && pressTab) {
      e.preventDefault();
    } else if (isCheckbox && pressEnter) {
      e.preventDefault();
      var updateChange = new Event("change");
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
      var pushActive = active.parentElement.querySelector(".summary");
      toggleDetails(pushActive);
    } else {
      return;
    }
  };

  toggle.addEventListener("click", function (e) {
    e.preventDefault();
    this.classList.toggle("toggleActive");
    if (this.classList.contains("toggleActive")) {
      this.innerHTML = "Collapse all details";
      for (var i = 0; i < details.length; i++) {
        var detail = details[i];
        detail.classList.remove("hidden");
        detail.previousElementSibling.classList.add("open");
        detail.setAttribute("aria-hidden", "false");
      };
    } else {
      this.innerHTML = "Expand all details";
      for (var i = 0; i < details.length; i++) {
        var detail = details[i];
        detail.classList.add("hidden");
        detail.previousElementSibling.classList.remove("open");
        detail.setAttribute("aria-hidden", "true");
      };
    };
  });
});
function r(f) { /in/.test(document.readyState) ? setTimeout('r(' + f + ')', 9) : f() }
