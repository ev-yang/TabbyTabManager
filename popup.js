document.getElementById("toggle").addEventListener("click", toggleTabs);
document.getElementById("voice").addEventListener("click", voiceAssistant);

function toggleTabs() {
    let btn = document.getElementById("toggle");
    if (btn.innerHTML === "View all tabs") {
        displayTabs();
        btn.innerHTML = "Hide all tabs";
    } else {
        hideTabs();
        btn.innerHTML = "View all tabs";
    }
}

function hideTabs() {
    let div = document.getElementById("div");
    div.parentNode.removeChild(div);
}

// Display icons and titles of all tabs in all chrome windows
function displayTabs() {
    // keys: window id
    // values: array of tabs
    let tabInfo = new Map();

    // Get all tabs in each window
    chrome.tabs.query({}, function(tabs) {
        tabs.forEach(function(tab) {
            // Add window ID to map if it isn't already there
            let windowID = tab.windowId;
            if (!tabInfo.has(windowID)) {
                tabInfo.set(windowID, [])
            }

            // Add tab to array of tabs under window id key
            tabInfo.get(windowID).push(tab);
        });

        // NEW DIV TAG FOR ALL WINDOWS/TABS
        let newDiv = document.createElement("div");
        newDiv.id = "div";

        let windows = tabInfo.keys();
        let windowCount = 1;
        let currentWindow = windows.next();
        while (!currentWindow.done) {
            let windowID = currentWindow.value;

            // New div class for each window, acts as dropzones
            let dropzone = document.createElement("div");
            dropzone.id = windowID;
            dropzone.className = "dropzones";

            // WINDOW TITLE!
            let windowTitle = document.createElement("header");
            windowTitle.document
            // If you click the window title, will focus/open the given window
            windowTitle.onclick = function() {
                chrome.windows.update(windowID, {focused : true}, function(tab){});
            };
            windowTitle.innerHTML = "Window " + windowCount;

            // Delete entire window
            let deleteWindow = document.createElement("p");
            deleteWindow.innerHTML = "delete window";
            deleteWindow.style.float = "left";
            deleteWindow.style.color = "red";
            deleteWindow.style.marginBottom = "15px";
            deleteWindow.style.fontSize = "10px";
            deleteWindow.onclick = function(){
                chrome.windows.remove(windowID);
                let windowDiv = document.getElementById(windowID);
                windowDiv.parentNode.removeChild(windowDiv);
            };

            // Append to div
            dropzone.appendChild(windowTitle);
            dropzone.appendChild(deleteWindow);
            dropzone.setAttribute("ondragover", "onDragOver(event);");
            dropzone.setAttribute("ondrop", "onDrop(event);");

            // For each tab under the current window, display favicon and title
            let tabs = tabInfo.get(windowID);
            for (let i = 0; i < tabs.length; i ++) {
                let tab = tabs[i];
                let tabID = tab.id;

                // New div class for each tab, acts as draggable elements
                let drag = document.createElement("div");
                drag.className = "box";
                drag.id = tabID;
                let url = tab.url;

                // FAVICON ICONS!
                let parseUrl = url.split("/");
                let faviconUrl = parseUrl[0].concat("//").concat(parseUrl[2]).concat("/favicon.ico");
                let img = document.createElement("img");
                img.src = faviconUrl;
                img.height = 32;
                img.width = 32;
                img.style.float = "left";
                img.style.marginLeft = "15px";
                img.style.marginRight = "20px";
                img.onclick = function(){
                    chrome.windows.update(windowID, {focused : true}, function(tab){});
                    chrome.tabs.highlight({windowId: windowID, tabs: i});
                };
                img.onerror = function(){
                    img.src = "./32x32.png";
                };

                // Delete specific tab
                let deleteTab = document.createElement("img");
                deleteTab.src = "./delete.png";
                deleteTab.style.float = "right";
                deleteTab.height = 16;
                deleteTab.width = 16;
                deleteTab.style.marginRight = "20px";
                deleteTab.onclick = function(){
                    // If this is the last tab in the window, delete the whole window. Otherwise, just delete the tab.
                    // let currentTabCount = 0;
                    // let tabToDelete = chrome.tabs.get(tabID, function(tab){});
                    // let tabWindowID = tabToDelete.windowId;
                    // chrome.tabs.query({windowId: tabWindowID}, function(tabs) {
                    //     tabs.forEach(function(tab) {
                    //         currentTabCount++;
                    //     });
                    // });
                    // if (currentTabCount === 0) {
                    //     // Remove window listing from popup
                    //     let windowDiv = document.getElementById(windowID);
                    //     windowDiv.parentNode.removeChild(windowDiv);
                    // } else {
                    //     // Remove tab listing from popup
                    //     let tabDiv = document.getElementById("" + tabID);
                    //     tabDiv.parentNode.removeChild(tabDiv);
                    // }
                    let tabDiv = document.getElementById("" + tabID);
                    tabDiv.parentNode.removeChild(tabDiv);
                    chrome.tabs.remove(tabID);
                };

                // TAB TITLES!
                let title = document.createElement("p");
                title.innerHTML = tab.title;
                title.onclick = function(){
                    chrome.windows.update(windowID, {focused : true}, function(tab){});
                    chrome.tabs.highlight({windowId: windowID, tabs: i});
                };

                // Append new elements
                drag.appendChild(img);
                drag.appendChild(deleteTab);
                drag.appendChild(title);
                drag.setAttribute("draggable", "true");

                dropzone.appendChild(drag);
            }

            newDiv.appendChild(dropzone);
            document.body.append(newDiv);
            // Update current window
            currentWindow = windows.next();
            windowCount++;
        }
        console.log("done");
        makeTabsDraggable();
    });
}

function makeTabsDraggable() {
    let dragSrcEl = null;

    function handleDragStart(e) {
        console.log("Drag started!");
        dragSrcEl = this;
        console.log(this);
        this.style.opacity = '0.4';

        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', this.innerHTML);
    }

    function handleDragOver(e) {
        if (e.preventDefault) {
            e.preventDefault();
        }

        e.dataTransfer.dropEffect = 'move';

        return false;
    }

    function handleDragEnter(e) {
        this.classList.add('over');
    }

    function handleDragLeave(e) {
        this.classList.remove('over');
    }

    function handleDrop(e) {
        e.stopPropagation();
        console.log(this);

        if (dragSrcEl !== this) {
            dragSrcEl.innerHTML = this.innerHTML;
            this.innerHTML = e.dataTransfer.getData('text/html');
            event.preventDefault();
        }

        return false;
    }

    function handleDragEnd(e) {
        this.style.opacity = '1';

        items.forEach(function (item) {
            item.classList.remove('over');
        });
    }

    let items = document.querySelectorAll('.box');
    console.log(items);
    items.forEach(function(item) {
        item.addEventListener('dragstart', handleDragStart, false);
        item.addEventListener('dragenter', handleDragEnter, false);
        item.addEventListener('dragover', handleDragOver, false);
        item.addEventListener('dragleave', handleDragLeave, false);
        item.addEventListener('drop', handleDrop, false);
        item.addEventListener('dragend', handleDragEnd, false);
    });
}

// voice assistant
function voiceAssistant() {
    let message = document.querySelector('#message');

    let SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
    let SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;

    let grammar = '#JSGF V1.0;';

    let recognition = new SpeechRecognition();
    let speechRecognitionList = new SpeechGrammarList();
    speechRecognitionList.addFromString(grammar, 1);
    recognition.grammars = speechRecognitionList;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onresult = function(event) {
        let last = event.results.length - 1;
        let command = event.results[last][0].transcript;
        message.textContent = 'Voice Input: ' + command + '.';
        console.log("close window command");
        if (command.toLowerCase() === 'close window') {
            console.log("close window command");
        }
    }

    recognition.onspeechend = function() {
        recognition.stop();
    };

    recognition.onerror = function(event) {
        message.textContent = 'Error occurred in recognition: ' + event.error;
    }
}