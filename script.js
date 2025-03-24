const editor = document.getElementById('editor');
const bufferList = document.getElementById('buffer-list');
const statusBar = document.getElementById('status-bar');
const lineNumbers = document.getElementById('line-numbers');

let buffers = { 'buffer1': '' };
let currentBuffer = 'buffer1';

function updateBufferList() {
    bufferList.innerHTML = '';
    for (const bufferName in buffers) {
        const button = document.createElement('button');
        button.textContent = bufferName;
        button.addEventListener('click', () => switchBuffer(bufferName));
        bufferList.appendChild(button);
    }
}

function switchBuffer(bufferName) {
    buffers[currentBuffer] = editor.value;
    currentBuffer = bufferName;
    editor.value = buffers[currentBuffer];
    updateStatusBar();
    updateLineNumbers();
}

function createBuffer(bufferName) {
    buffers[bufferName] = '';
    switchBuffer(bufferName);
    updateBufferList();
}

function updateStatusBar() {
    const line = editor.value.substr(0, editor.selectionStart).split('\n').length;
    const col = editor.selectionStart - editor.value.lastIndexOf('\n', editor.selectionStart - 1) - 1;
    statusBar.textContent = `Buffer: ${currentBuffer} | Line: ${line} | Col: ${col}`;
}

function updateLineNumbers() {
    const lines = editor.value.split('\n').length;
    let numbers = '';
    for (let i = 1; i <= lines; i++) {
        numbers += i + '\n';
    }
    lineNumbers.textContent = numbers;

    // Calculate line number width based on the maximum number of digits
    const maxDigits = String(lines).length;
    lineNumbers.style.width = (maxDigits * 10 + 30) + 'px'; // Adjust padding as needed
}

editor.addEventListener('input', () => {
    buffers[currentBuffer] = editor.value;
    updateStatusBar();
    updateLineNumbers();
});

editor.addEventListener('keydown', (event) => {
    if (event.ctrlKey) {
        switch (event.key) {
            case 'f':
                event.preventDefault();
                editor.selectionStart++;
                editor.selectionEnd = editor.selectionStart;
                break;
            case 'b':
                event.preventDefault();
                editor.selectionStart--;
                editor.selectionEnd = editor.selectionStart;
                break;
            case 'a':
                event.preventDefault();
                const currentLineStart = editor.value.lastIndexOf('\n', editor.selectionStart - 1) + 1;
                editor.selectionStart = currentLineStart;
                editor.selectionEnd = currentLineStart;
                break;
            case 'e':
                event.preventDefault();
                const currentLineEnd = editor.value.indexOf('\n', editor.selectionStart);
                editor.selectionStart = currentLineEnd === -1 ? editor.value.length : currentLineEnd;
                editor.selectionEnd = editor.selectionStart;
                break;
            case 'k':
                event.preventDefault();
                const lineEnd = editor.value.indexOf('\n', editor.selectionStart);
                if (lineEnd === -1) {
                    editor.value = editor.value.substring(0, editor.selectionStart);
                } else {
                    editor.value = editor.value.substring(0, editor.selectionStart) + editor.value.substring(lineEnd + 1);
                }
                editor.selectionEnd = editor.selectionStart;
                break;
            case 'x':
                event.preventDefault();
                const newBufferName = prompt('Enter new buffer name:');
                if (newBufferName) {
                    createBuffer(newBufferName);
                }
                break;
            case 's':
                event.preventDefault();
                const searchText = prompt('Enter search text:');
                if (searchText) {
                    const index = editor.value.indexOf(searchText, editor.selectionStart);
                    if (index !== -1) {
                        editor.selectionStart = index;
                        editor.selectionEnd = index + searchText.length;
                    }
                }
                break;
        }
    }
});


function saveFile(name, content) {
    localStorage.setItem(name, content);
    console.log(`File "${name}" saved to local storage.`);
}
const loadButton = document.getElementById('loadButton');

editor.addEventListener('dragover', (event) => {
    event.preventDefault();
});

editor.addEventListener('drop', (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            editor.value = e.target.result;
            buffers[currentBuffer] = e.target.result;
            updateStatusBar();
            updateLineNumbers();
        };
        reader.readAsText(file);
    }
});

loadButton.addEventListener('click', () => {
    editor.click(); // Trigger file dialog
});

// ... (previous code)

let mode = 'normal'; // normal, insert, visual
const miniBuffer = document.getElementById('mini-buffer');

const keybindings = {
    normal: {
        'i': () => { mode = 'insert'; updateStatusBar(); },
        'v': () => { mode = 'visual'; updateStatusBar(); },
        // Add more normal mode keybindings
    },
    insert: {
        'Escape': () => { mode = 'normal'; updateStatusBar(); },
        // Add insert mode keybindings
    },
    visual: {
        'Escape': () => { mode = 'normal'; updateStatusBar(); },
        // Add visual mode keybindings
    },
};

editor.addEventListener('keydown', (event) => {
    const key = event.key;
    if (keybindings[mode] && keybindings[mode][key]) {
        event.preventDefault();
        keybindings[mode][key]();
    } else if (mode === 'normal' && event.ctrlKey) {
            // previous ctrl key functionality.
    }
    updateStatusBar();
});

function updateStatusBar() {
    // ... (previous status bar logic)
    statusBar.textContent = `Buffer: ${currentBuffer} | Line: ${line} | Col: ${col} | Mode: ${mode}`;
}

function showMiniBuffer(prompt, callback) {
    miniBuffer.textContent = prompt;
    editor.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            callback(miniBuffer.textContent);
            miniBuffer.textContent = '';
        } else {
            miniBuffer.textContent += event.key;
        }
    }, { once: true });
}
updateBufferList();
updateStatusBar();
updateLineNumbers();