const bufferList = document.getElementById('buffer-list');
const textArea = document.getElementById('text-area');
const editor = document.getElementById('editor'); //Get the editor div.
let buffers = {};
let currentBuffer = 'default';
let commandMode = false;
function createBuffer(name, content = '') {
    buffers[name] = content;
    const button = document.createElement('button');
    button.textContent = name;
    button.addEventListener('click', () => switchBuffer(name));
    bufferList.appendChild(button);
}

function switchBuffer(name) {
    saveBuffers();
    buffers[currentBuffer] = textArea.value;
    currentBuffer = name;
    textArea.value = buffers[name];
    updateActiveBufferButton();
    highlightSyntax();
    updateLineNumbers(); // Update line numbers after switching
}

function updateActiveBufferButton() {
    const buttons = bufferList.querySelectorAll('button');
    buttons.forEach(button => {
        if (button.textContent === currentBuffer) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
}

function saveBuffers() {
    localStorage.setItem('buffers', JSON.stringify(buffers));
    localStorage.setItem('currentBuffer', currentBuffer);
}

function loadBuffers() {
    const storedBuffers = JSON.parse(localStorage.getItem('buffers'));
    const storedCurrentBuffer = localStorage.getItem('currentBuffer');
    if (storedBuffers) {
        buffers = storedBuffers;
        for (const name in buffers) {
            createBuffer(name, buffers[name]);
        }
        currentBuffer = storedCurrentBuffer || 'default';
        textArea.value = buffers[currentBuffer] || '';
        updateActiveBufferButton();
        highlightSyntax();
        updateLineNumbers();
    } else {
        createBuffer('default', "");
        updateActiveBufferButton();
        updateLineNumbers();
    }
}

loadBuffers();

textArea.addEventListener('input', () => {
    buffers[currentBuffer] = textArea.value;
    highlightSyntax();
    updateLineNumbers();
});

function newBuffer() {
    const newName = prompt("Enter new buffer name:", "new-buffer");
    if (newName && !buffers[newName]) {
        createBuffer(newName, "");
        switchBuffer(newName);
    } else {
        alert("Invalid or existing name");
    }
}

const newBufferButton = document.createElement("button");
newBufferButton.textContent = "New Buffer";
newBufferButton.addEventListener("click", newBuffer);
bufferList.appendChild(newBufferButton);

// Syntax Highlighting (Basic JavaScript)
function highlightSyntax() {
    let content = textArea.value;
    content = content.replace(/(function|var|let|const|if|else|for|while)/g, '<span style="color: #c678dd;">$1</span>');
    content = content.replace(/(\d+)/g, '<span style="color: #d19a66;">$1</span>');
    content = content.replace(/(".*?"|'.*?')/g, '<span style="color: #98c379;">$1</span>');
    textArea.innerHTML = content;
}

// Search Functionality
function search() {
    const searchTerm = prompt("Enter search term:");
    if (searchTerm) {
        const regex = new RegExp(searchTerm, 'gi');
        const matches = textArea.value.match(regex);
        if (matches) {
            alert(`Found ${matches.length} matches.`);
            const highlightedText = textArea.value.replace(regex, '<span style="background-color: yellow;">$&</span>');
            textArea.innerHTML = highlightedText;
        } else {
            alert("No matches found.");
        }
    }
}

const searchButton = document.createElement("button");
searchButton.textContent = "Search";
searchButton.addEventListener("click", search);
bufferList.appendChild(searchButton);

// Line Numbers
const lineNumbers = document.createElement("div");
lineNumbers.style.width = "30px";
lineNumbers.style.backgroundColor = "#282c34";
lineNumbers.style.color = "#828997";
lineNumbers.style.padding = "10px";
lineNumbers.style.overflowY = "hidden"; //Remove line number scroll bar.
lineNumbers.style.whiteSpace = "pre";
lineNumbers.style.textAlign = "right";
lineNumbers.style.height = "100%";
lineNumbers.style.boxSizing = "border-box";
document.getElementById("editor-container").insertBefore(lineNumbers, document.getElementById("editor"));

function updateLineNumbers() {
    const lines = textArea.value.split("\n");
    let numbers = "";
    for (let i = 1; i <= lines.length; i++) {
        numbers += i + "\n";
    }
    lineNumbers.textContent = numbers;
}

textArea.addEventListener("input", updateLineNumbers);
updateLineNumbers();

//Synchronize scroll.
editor.addEventListener('scroll', function(){
    lineNumbers.scrollTop = editor.scrollTop;
});

function handleVimMotion(event) {
    if (commandMode) {
        switch (event.key) {
            case 'j':
                moveDown();
                break;
            case 'k':
                moveUp();
                break;
            case 'h':
                moveLeft();
                break;
            case 'l':
                moveRight();
                break;
            case 'g':
                if (event.getModifierState("Shift")){
                  goToBottom();
                }
                break;
            case 'G':
                goToBottom();
                break;
            default:
                break;
        }
        if(event.key === 'g' && event.getModifierState('Shift') === false){
          let nextKey = "";
          function handleNextKey(nextEvent){
            nextKey = nextEvent.key;
            if(nextKey === 'g'){
              goToTop();
            }
            document.removeEventListener('keydown', handleNextKey);
          }
          document.addEventListener('keydown', handleNextKey);
        }

        event.preventDefault(); // Prevent default behavior (scrolling, etc.)
    }
}

function moveDown() {
    const lines = textArea.value.split('\n');
    let cursor = textArea.selectionStart;
    let currentLine = 0;
    let lineStart = 0;
    for (let i = 0; i < lines.length; i++) {
        const lineEnd = lineStart + lines[i].length + 1; // +1 for newline
        if (cursor >= lineStart && cursor < lineEnd) {
            currentLine = i;
            break;
        }
        lineStart = lineEnd;
    }
    if (currentLine < lines.length - 1) {
        const nextLineStart = lineStart + lines[currentLine].length + 1;
        textArea.selectionStart = Math.min(nextLineStart + (cursor - lineStart), nextLineStart + lines[currentLine + 1].length);
        textArea.selectionEnd = textArea.selectionStart;
    }
}

function moveUp() {
    const lines = textArea.value.split('\n');
    let cursor = textArea.selectionStart;
    let currentLine = 0;
    let lineStart = 0;
    for (let i = 0; i < lines.length; i++) {
        const lineEnd = lineStart + lines[i].length + 1;
        if (cursor >= lineStart && cursor < lineEnd) {
            currentLine = i;
            break;
        }
        lineStart = lineEnd;
    }
    if (currentLine > 0) {
        let prevLineStart = 0;
        for(let i = 0; i < currentLine; i++){
          prevLineStart += lines[i].length + 1;
        }
        textArea.selectionStart = Math.min(prevLineStart + (cursor - lineStart), prevLineStart + lines[currentLine - 1].length);
        textArea.selectionEnd = textArea.selectionStart;
    }
}

function moveLeft() {
    if (textArea.selectionStart > 0) {
        textArea.selectionStart--;
        textArea.selectionEnd = textArea.selectionStart;
    }
}

function moveRight() {
    if (textArea.selectionStart < textArea.value.length) {
        textArea.selectionStart++;
        textArea.selectionEnd = textArea.selectionStart;
    }
}

function goToTop() {
    textArea.selectionStart = 0;
    textArea.selectionEnd = 0;
}

function goToBottom() {
    textArea.selectionStart = textArea.value.length;
    textArea.selectionEnd = textArea.selectionStart;
}

// Toggle Command Mode
function toggleCommandMode() {
    commandMode = !commandMode;
    if (commandMode) {
        textArea.style.backgroundColor = '#282c34'; // Indicate command mode
    } else {
        textArea.style.backgroundColor = '#1c1e26'; // Normal mode
    }
}

textArea.addEventListener('keydown', (event) => {
    if (event.key === ':') {
        toggleCommandMode();
        event.preventDefault(); // Prevent default colon insertion.
    } else {
      handleVimMotion(event);
    }
});

editor.addEventListener('scroll', function(){
    lineNumbers.scrollTop = editor.scrollTop;
});