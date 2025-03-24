let buffers = JSON.parse(localStorage.getItem("webEmacsBuffers")) || { "main": "" };
let currentBuffer = localStorage.getItem("webEmacsCurrentBuffer") || "main";

const editor = document.getElementById("editor");
const bufferList = document.getElementById("buffer-list");
const statusBar = document.getElementById("status-bar");
const outlineView = document.getElementById("outline-view");
const miniBuffer = document.getElementById("mini-buffer");

function updateBufferList() {
    bufferList.innerHTML = "";
    for (let bufferName in buffers) {
        const button = document.createElement("button");
        button.textContent = bufferName;
        button.addEventListener("click", () => switchBuffer(bufferName));
        bufferList.appendChild(button);
    }
}

function switchBuffer(bufferName) {
    buffers[currentBuffer] = editor.value;
    currentBuffer = bufferName;
    editor.value = buffers[bufferName];
    updateStatusBar();
    updateOutlineView();
}

function createBuffer(bufferName) {
    if (!buffers[bufferName]) {
        buffers[bufferName] = "";
        updateBufferList();
    }
}

function deleteBuffer(bufferName) {
    if (buffers[bufferName]) {
        delete buffers[bufferName];
        if (currentBuffer === bufferName) {
            currentBuffer = "main";
            editor.value = buffers["main"];
        }
        updateBufferList();
        updateStatusBar();
        updateOutlineView();
    }
}

function updateStatusBar() {
    statusBar.textContent = "Current Buffer: " + currentBuffer;
}

editor.addEventListener("input", () => {
    buffers[currentBuffer] = editor.value;
    updateOutlineView();
});

document.addEventListener("keydown", (event) => {
    if (event.ctrlKey) {
        switch (event.key) {
            case "b":
                const newBufferName = prompt("Enter buffer name:");
                if (newBufferName) {
                    createBuffer(newBufferName);
                    switchBuffer(newBufferName);
                }
                break;
            case "s":
                // Save buffer logic (e.g., local storage)
                console.log("Buffer saved");
                break;
            case "o":
                const openBufferName = prompt("Open buffer name:");
                if (openBufferName && buffers[openBufferName]) {
                    switchBuffer(openBufferName);
                }
                break;
            case "d":
                deleteBuffer(currentBuffer);
                break;
            case "ArrowUp":
                moveParagraphUp();
                break;
            case "ArrowDown":
                moveParagraphDown();
                break;
            case "ArrowLeft":
                moveWordLeft();
                break;
            case "ArrowRight":
                moveWordRight();
                break;
            case "k":
                killLine();
                break;
            case "h":
                createHeading();
                break;
        }
    }
});

function saveBuffersToLocalStorage() {
    localStorage.setItem("webEmacsBuffers", JSON.stringify(buffers));
    localStorage.setItem("webEmacsCurrentBuffer", currentBuffer);
}

editor.addEventListener("input", () => {
    buffers[currentBuffer] = editor.value;
    updateOutlineView();
    saveBuffersToLocalStorage();
});

document.addEventListener("keydown", (event) => {
    if (event.ctrlKey) {
        switch (event.key) {
            // ... (buffer keybindings from previous example)
            case "f":
                searchPrompt();
                break;
            case "r":
                replacePrompt();
                break;
            case "Enter":
                executeMiniBufferCommand();
                break;
            case "ArrowUp":
                moveParagraphUp();
                break;
            case "ArrowDown":
                moveParagraphDown();
                break;
            case "ArrowLeft":
                moveWordLeft();
                break;
            case "ArrowRight":
                moveWordRight();
                break;
            case "k":
                killLine();
                break;
        }
    }
});

function searchPrompt() {
    const searchTerm = prompt("Search for:");
    if (searchTerm) {
        const index = editor.value.indexOf(searchTerm, editor.selectionStart);
        if (index !== -1) {
            editor.selectionStart = index;
            editor.selectionEnd = index + searchTerm.length;
        } else {
            alert("Search term not found.");
        }
    }
}

function replacePrompt() {
    const searchTerm = prompt("Replace:");
    if (searchTerm) {
        const replaceTerm = prompt("Replace with:");
        if (replaceTerm) {
            editor.value = editor.value.replace(searchTerm, replaceTerm);
            buffers[currentBuffer] = editor.value;
        }
    }
}

function executeMiniBufferCommand() {
    const command = miniBuffer.textContent.trim();
    const parts = command.split(" ");
    switch (parts[0]) {
        case ":save":
            saveBuffersToLocalStorage();
            miniBuffer.textContent = "";
            break;
        case ":open":
            if (parts[1] && buffers[parts[1]]) {
                switchBuffer(parts[1]);
                miniBuffer.textContent = "";
            } else {
                miniBuffer.textContent = "Invalid buffer name.";
            }
            break;
        case ":delete":
            if (parts[1] && buffers[parts[1]]) {
                deleteBuffer(parts[1]);
                miniBuffer.textContent = "";
            } else {
                miniBuffer.textContent = "Invalid buffer name.";
            }
            break;
        case ":time":
            editor.value += new Date().toLocaleString();
            miniBuffer.textContent = "";
            break;
        case ":task":
            const cursorPosition = editor.selectionStart;
            const currentLineStart = editor.value.lastIndexOf('\n', cursorPosition-1) +1;
            const currentLine = editor.value.slice(currentLineStart, editor.value.indexOf('\n', cursorPosition));
            if(currentLine.includes("[ ]")){
                editor.value = editor.value.slice(0, currentLineStart) + currentLine.replace("[ ]", "[X]") + editor.value.slice(editor.value.indexOf('\n', cursorPosition));
            } else if (currentLine.includes("[X]")){
                editor.value = editor.value.slice(0, currentLineStart) + currentLine.replace("[X]", "[-]") + editor.value.slice(editor.value.indexOf('\n', cursorPosition));
            } else if (currentLine.includes("[-]")){
                editor.value = editor.value.slice(0, currentLineStart) + currentLine.replace("[-]", "[ ]") + editor.value.slice(editor.value.indexOf('\n', cursorPosition));
            } else {
                editor.value = editor.value.slice(0, currentLineStart) + "[ ] " + editor.value.slice(cursorPosition);
            }
            miniBuffer.textContent = "";
            break;
        default:
            miniBuffer.textContent = "Invalid command.";
    }
}
function moveParagraphUp() {
    const cursorPosition = editor.selectionStart;
    const previousParagraphEnd = editor.value.lastIndexOf('\n\n', cursorPosition-1);
    if (previousParagraphEnd !== -1) {
        editor.selectionStart = previousParagraphEnd + 2;
        editor.selectionEnd = previousParagraphEnd + 2;
    }
}
function moveParagraphDown() {
    const cursorPosition = editor.selectionStart;
    const nextParagraphStart = editor.value.indexOf('\n\n', cursorPosition);
    if (nextParagraphStart !== -1) {
        editor.selectionStart = nextParagraphStart + 2;
        editor.selectionEnd = nextParagraphStart + 2;
    }
}
function moveWordLeft(){
    const cursorPosition = editor.selectionStart;
    let newPosition = cursorPosition -1;
    while(newPosition > 0 && editor.value[newPosition].match(/\s/)){
        newPosition--;
    }
    while(newPosition > 0 && !editor.value[newPosition].match(/\s/)){
        newPosition--;
    }
    editor.selectionStart = newPosition+1;
    editor.selectionEnd = newPosition+1;
}
function moveWordRight(){
    const cursorPosition = editor.selectionStart;
    let newPosition = cursorPosition + 1;
    while(newPosition < editor.value.length && editor.value[newPosition].match(/\s/)){
        newPosition++;
    }
    while(newPosition < editor.value.length && !editor.value[newPosition].match(/\s/)){
        newPosition++;
    }
    editor.selectionStart = newPosition;
    editor.selectionEnd = newPosition;
}
function killLine(){
    const cursorPosition = editor.selectionStart;
    const nextLine = editor.value.indexOf('\n', cursorPosition);
    if(nextLine === -1){
        editor.value = editor.value.slice(0, cursorPosition);
    } else {
        editor.value = editor.value.slice(0, cursorPosition) + editor.value.slice(nextLine+1);
    }
    editor.selectionStart = cursorPosition;
    editor.selectionEnd = cursorPosition;
}
function updateOutlineView() {
    outlineView.innerHTML = "";
    const lines = editor.value.split("\n");
    lines.forEach((line) => {
        if (line.startsWith("*")) {
            const heading = document.createElement("div");
            heading.textContent = line;
            heading.classList.add("outline-view-heading");
            outlineView.appendChild(heading);
        }
    });
}
function moveParagraphUp() {
    //move cursor up a paragraph
}
function moveParagraphDown() {
    //move cursor down a paragraph
}
function moveWordLeft(){
    //move cursor left a word.
}
function moveWordRight(){
    //move cursor right a word.
}
function killLine(){
    //delete line from cursor to end.
}
function createHeading(){
    const headingText = prompt("Enter heading text:");
    if(headingText){
        const cursorPosition = editor.selectionStart;
        const currentLineStart = editor.value.lastIndexOf('\n', cursorPosition-1) +1;
        const newLine = editor.value.slice(0, currentLineStart) + "* " + headingText + editor.value.slice(cursorPosition);
        editor.value = newLine;
        buffers[currentBuffer] = newLine;
        updateOutlineView();
    }
}

updateBufferList();
updateStatusBar();
updateOutlineView();
editor.value = buffers[currentBuffer];