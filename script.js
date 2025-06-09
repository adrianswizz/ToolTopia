
// Global state
let currentNote = null;
let notes = JSON.parse(localStorage.getItem('notes')) || [];
let games = JSON.parse(localStorage.getItem('games')) || [];
let currentTheme = localStorage.getItem('theme') || 'light';
let visitCount = parseInt(localStorage.getItem('visitCount')) || 1;

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    loadNotes();
    loadGames();
    setupEventListeners();
    setupConverters();
    updateColorInfo();
    updateTextCount();
    updateHomeStats();
    incrementVisitCount();
    setupAutoSave();
});

// Theme Management
function initializeTheme() {
    document.body.setAttribute('data-theme', currentTheme);
    const themeSelector = document.getElementById('theme-selector');
    if (themeSelector) {
        themeSelector.value = currentTheme;
    }
}

function changeTheme() {
    const themeSelector = document.getElementById('theme-selector');
    currentTheme = themeSelector.value;
    document.body.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
}

// Tab Management
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName).classList.add('active');
    
    // Add active class to clicked button
    document.querySelectorAll('.tab-btn').forEach(btn => {
        if (btn.onclick && btn.onclick.toString().includes(tabName)) {
            btn.classList.add('active');
        }
    });
}

// Home Page Functions
function updateHomeStats() {
    const notesCountEl = document.getElementById('notes-count');
    const gamesCountEl = document.getElementById('games-count');
    const visitCountEl = document.getElementById('visit-count');
    
    if (notesCountEl) notesCountEl.textContent = notes.length;
    if (gamesCountEl) gamesCountEl.textContent = games.length;
    if (visitCountEl) visitCountEl.textContent = visitCount;
}

function incrementVisitCount() {
    visitCount++;
    localStorage.setItem('visitCount', visitCount.toString());
}

function setupAutoSave() {
    // Auto-save notes every 30 seconds
    setInterval(() => {
        if (currentNote !== null && document.getElementById('auto-save').checked) {
            saveNote();
        }
    }, 30000);
    
    // Save on page unload
    window.addEventListener('beforeunload', () => {
        if (currentNote !== null) {
            saveNote();
        }
    });
}

// Calculator Functions
let calcExpression = '';

function appendToCalc(value) {
    const display = document.getElementById('calc-input');
    if (value === '*') value = '*';
    if (value === '/') value = '/';
    calcExpression += value;
    display.value = calcExpression.replace(/\*/g, '×').replace(/\//g, '÷');
}

function clearCalc() {
    calcExpression = '';
    document.getElementById('calc-input').value = '';
}

function deleteLast() {
    calcExpression = calcExpression.slice(0, -1);
    document.getElementById('calc-input').value = calcExpression.replace(/\*/g, '×').replace(/\//g, '÷');
}

function calculateResult() {
    try {
        // Replace display symbols with actual operators
        let expression = calcExpression;
        let result = eval(expression);
        document.getElementById('calc-input').value = result;
        calcExpression = result.toString();
    } catch (error) {
        document.getElementById('calc-input').value = 'Error';
        calcExpression = '';
    }
}

// Notes Functions
function loadNotes() {
    const notesList = document.getElementById('notes-list');
    if (notesList) {
        notesList.innerHTML = '';
        
        notes.forEach((note, index) => {
            const noteItem = document.createElement('div');
            noteItem.className = 'note-item';
            noteItem.innerHTML = `
                <h4>${note.title || 'Untitled'}</h4>
                <p>${note.content.substring(0, 50)}...</p>
            `;
            noteItem.onclick = () => loadNote(index);
            notesList.appendChild(noteItem);
        });
    }
    updateHomeStats();
}

function createNewNote() {
    const newNote = {
        title: 'New Note',
        content: '',
        created: new Date().toISOString()
    };
    notes.push(newNote);
    currentNote = notes.length - 1;
    loadNote(currentNote);
    loadNotes();
    saveNotesToStorage();
}

function loadNote(index) {
    currentNote = index;
    const note = notes[index];
    document.getElementById('note-title').value = note.title;
    document.getElementById('note-content').innerHTML = note.content;
    
    // Update active note in sidebar
    document.querySelectorAll('.note-item').forEach((item, i) => {
        item.classList.toggle('active', i === index);
    });
}

function saveNote() {
    if (currentNote === null) return;
    
    const title = document.getElementById('note-title').value;
    const content = document.getElementById('note-content').innerHTML;
    
    notes[currentNote].title = title;
    notes[currentNote].content = content;
    notes[currentNote].modified = new Date().toISOString();
    
    saveNotesToStorage();
    loadNotes();
}

function deleteNote() {
    if (currentNote === null) return;
    
    if (confirm('Are you sure you want to delete this note?')) {
        notes.splice(currentNote, 1);
        currentNote = null;
        document.getElementById('note-title').value = '';
        document.getElementById('note-content').innerHTML = '';
        saveNotesToStorage();
        loadNotes();
    }
}

function formatText(command) {
    document.execCommand(command, false, null);
}

function insertImage() {
    const file = document.getElementById('image-upload').files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            document.getElementById('note-content').appendChild(img);
        };
        reader.readAsDataURL(file);
    }
}

function saveNotesToStorage() {
    localStorage.setItem('notes', JSON.stringify(notes));
}

// Unit Converter Functions
const lengthConversions = {
    m: { m: 1, km: 0.001, cm: 100, mm: 1000, in: 39.3701, ft: 3.28084, yd: 1.09361, mi: 0.000621371 },
    km: { m: 1000, km: 1, cm: 100000, mm: 1000000, in: 39370.1, ft: 3280.84, yd: 1093.61, mi: 0.621371 },
    cm: { m: 0.01, km: 0.00001, cm: 1, mm: 10, in: 0.393701, ft: 0.0328084, yd: 0.0109361, mi: 0.00000621371 },
    mm: { m: 0.001, km: 0.000001, cm: 0.1, mm: 1, in: 0.0393701, ft: 0.00328084, yd: 0.00109361, mi: 0.000000621371 },
    in: { m: 0.0254, km: 0.0000254, cm: 2.54, mm: 25.4, in: 1, ft: 0.0833333, yd: 0.0277778, mi: 0.0000157828 },
    ft: { m: 0.3048, km: 0.0003048, cm: 30.48, mm: 304.8, in: 12, ft: 1, yd: 0.333333, mi: 0.000189394 },
    yd: { m: 0.9144, km: 0.0009144, cm: 91.44, mm: 914.4, in: 36, ft: 3, yd: 1, mi: 0.000568182 },
    mi: { m: 1609.34, km: 1.60934, cm: 160934, mm: 1609340, in: 63360, ft: 5280, yd: 1760, mi: 1 }
};

const weightConversions = {
    kg: { kg: 1, g: 1000, lb: 2.20462, oz: 35.274, t: 0.001, st: 0.157473 },
    g: { kg: 0.001, g: 1, lb: 0.00220462, oz: 0.035274, t: 0.000001, st: 0.000157473 },
    lb: { kg: 0.453592, g: 453.592, lb: 1, oz: 16, t: 0.000453592, st: 0.0714286 },
    oz: { kg: 0.0283495, g: 28.3495, lb: 0.0625, oz: 1, t: 0.0000283495, st: 0.00446429 },
    t: { kg: 1000, g: 1000000, lb: 2204.62, oz: 35274, t: 1, st: 157.473 },
    st: { kg: 6.35029, g: 6350.29, lb: 14, oz: 224, t: 0.00635029, st: 1 }
};

function setupConverters() {
    document.getElementById('length-input').addEventListener('input', convertLength);
    document.getElementById('length-from').addEventListener('change', convertLength);
    document.getElementById('length-to').addEventListener('change', convertLength);
    
    document.getElementById('weight-input').addEventListener('input', convertWeight);
    document.getElementById('weight-from').addEventListener('change', convertWeight);
    document.getElementById('weight-to').addEventListener('change', convertWeight);
}

function convertLength() {
    const input = parseFloat(document.getElementById('length-input').value);
    const from = document.getElementById('length-from').value;
    const to = document.getElementById('length-to').value;
    
    if (isNaN(input)) {
        document.getElementById('length-result').textContent = '0';
        return;
    }
    
    const result = input * lengthConversions[from][to];
    document.getElementById('length-result').textContent = result.toFixed(6);
}

function convertWeight() {
    const input = parseFloat(document.getElementById('weight-input').value);
    const from = document.getElementById('weight-from').value;
    const to = document.getElementById('weight-to').value;
    
    if (isNaN(input)) {
        document.getElementById('weight-result').textContent = '0';
        return;
    }
    
    const result = input * weightConversions[from][to];
    document.getElementById('weight-result').textContent = result.toFixed(6);
}

// Password Generator Functions
function setupEventListeners() {
    document.getElementById('password-length').addEventListener('input', function() {
        document.getElementById('length-display').textContent = this.value;
    });
}

function generatePassword() {
    const length = parseInt(document.getElementById('password-length').value);
    const includeUppercase = document.getElementById('include-uppercase').checked;
    const includeLowercase = document.getElementById('include-lowercase').checked;
    const includeNumbers = document.getElementById('include-numbers').checked;
    const includeSymbols = document.getElementById('include-symbols').checked;
    
    let charset = '';
    if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (includeNumbers) charset += '0123456789';
    if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    if (charset === '') {
        alert('Please select at least one character type');
        return;
    }
    
    let password = '';
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    document.getElementById('generated-password').value = password;
}

function copyPassword() {
    const passwordField = document.getElementById('generated-password');
    passwordField.select();
    document.execCommand('copy');
    
    // Show feedback
    const button = event.target;
    const originalHTML = button.innerHTML;
    button.innerHTML = '<i class="fas fa-check"></i>';
    setTimeout(() => {
        button.innerHTML = originalHTML;
    }, 2000);
}

// QR Code Functions
function generateQR() {
    const text = document.getElementById('qr-input').value;
    if (!text.trim()) {
        alert('Please enter text or URL to generate QR code');
        return;
    }
    
    const qrOutput = document.getElementById('qr-output');
    qrOutput.innerHTML = '';
    
    QRCode.toCanvas(text, { width: 256 }, function(error, canvas) {
        if (error) {
            qrOutput.innerHTML = '<p>Error generating QR code</p>';
            return;
        }
        qrOutput.appendChild(canvas);
        
        // Add download button
        const downloadBtn = document.createElement('button');
        downloadBtn.className = 'btn-secondary';
        downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download';
        downloadBtn.onclick = () => downloadQRCode(canvas);
        qrOutput.appendChild(downloadBtn);
    });
}

function downloadQRCode(canvas) {
    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = canvas.toDataURL();
    link.click();
}

function scanQRFromFile() {
    const file = document.getElementById('qr-file').files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height);
            
            const resultDiv = document.getElementById('qr-scan-result');
            if (code) {
                resultDiv.innerHTML = `
                    <h4>QR Code Content:</h4>
                    <p>${code.data}</p>
                    ${isValidURL(code.data) ? `<a href="${code.data}" target="_blank" class="btn-primary">Open Link</a>` : ''}
                `;
            } else {
                resultDiv.innerHTML = '<p>No QR code found in the image</p>';
            }
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function isValidURL(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// Games Functions
function loadGames() {
    const gamesGrid = document.getElementById('games-grid');
    if (gamesGrid) {
        gamesGrid.innerHTML = '';
        
        games.forEach((game, index) => {
            const gameCard = document.createElement('div');
            gameCard.className = 'game-card';
            gameCard.innerHTML = `
                <img src="${game.image}" alt="${game.name}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDMwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMTUwIiBmaWxsPSIjZjBmMGYwIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iNzUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4='">
                <h4>${game.name}</h4>
                <button onclick="playGame('${game.url}')" class="btn-primary">Play</button>
                <button onclick="deleteGame(${index})" class="btn-danger">Delete</button>
            `;
            gamesGrid.appendChild(gameCard);
        });
    }
    updateHomeStats();
}

function showAddGameModal() {
    document.getElementById('add-game-modal').style.display = 'block';
}

function closeAddGameModal() {
    document.getElementById('add-game-modal').style.display = 'none';
    document.getElementById('game-name').value = '';
    document.getElementById('game-url').value = '';
    document.getElementById('game-image').value = '';
    document.getElementById('game-image-file').value = '';
    document.getElementById('image-preview').innerHTML = '';
}

function handleGameImageUpload() {
    const file = document.getElementById('game-image-file').files[0];
    const preview = document.getElementById('image-preview');
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageData = e.target.result;
            preview.innerHTML = `
                <img src="${imageData}" alt="Game image preview">
                <button type="button" class="remove-image" onclick="removeGameImage()">
                    <i class="fas fa-trash"></i> Remove Image
                </button>
            `;
            
            // Clear the URL input when file is selected
            document.getElementById('game-image').value = '';
        };
        reader.readAsDataURL(file);
    }
}

function removeGameImage() {
    document.getElementById('game-image-file').value = '';
    document.getElementById('image-preview').innerHTML = '';
}

function addGame() {
    const name = document.getElementById('game-name').value;
    const url = document.getElementById('game-url').value;
    const imageUrl = document.getElementById('game-image').value;
    const imageFile = document.getElementById('game-image-file').files[0];
    
    if (!name || !url) {
        alert('Please fill in game name and URL');
        return;
    }
    
    // Function to create and save the game
    function createGame(imageData) {
        const game = {
            name: name,
            url: url,
            image: imageData || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDMwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMTUwIiBmaWxsPSIjZjBmMGYwIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iNzUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4=',
            created: new Date().toISOString()
        };
        
        games.push(game);
        localStorage.setItem('games', JSON.stringify(games));
        loadGames();
        closeAddGameModal();
        updateHomeStats();
    }
    
    // If file is selected, use that; otherwise use URL
    if (imageFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            createGame(e.target.result);
        };
        reader.readAsDataURL(imageFile);
    } else {
        createGame(imageUrl);
    }
}

function playGame(url) {
    window.open(url, '_blank');
}

function deleteGame(index) {
    if (confirm('Are you sure you want to delete this game?')) {
        games.splice(index, 1);
        localStorage.setItem('games', JSON.stringify(games));
        loadGames();
        updateHomeStats();
    }
}

function searchGames() {
    const searchTerm = document.getElementById('game-search').value.toLowerCase();
    const gameCards = document.querySelectorAll('.game-card');
    
    gameCards.forEach(card => {
        const gameName = card.querySelector('h4').textContent.toLowerCase();
        card.style.display = gameName.includes(searchTerm) ? 'block' : 'none';
    });
}

// Tools Functions
function updateColorInfo() {
    const colorPicker = document.getElementById('color-picker');
    const hexValue = colorPicker.value;
    const rgbValue = hexToRgb(hexValue);
    
    document.getElementById('hex-value').textContent = hexValue;
    document.getElementById('rgb-value').textContent = `rgb(${rgbValue.r}, ${rgbValue.g}, ${rgbValue.b})`;
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function updateTextCount() {
    const text = document.getElementById('text-counter-input').value;
    const charCount = text.length;
    const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    const lineCount = text.split('\n').length;
    
    document.getElementById('char-count').textContent = charCount;
    document.getElementById('word-count').textContent = wordCount;
    document.getElementById('line-count').textContent = lineCount;
}

function generateRandomNumber() {
    const min = parseInt(document.getElementById('num-min').value) || 1;
    const max = parseInt(document.getElementById('num-max').value) || 100;
    
    if (min >= max) {
        alert('Minimum value must be less than maximum value');
        return;
    }
    
    const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
    document.getElementById('random-number-result').textContent = randomNum;
}

function generateRandomString() {
    const length = parseInt(document.getElementById('string-length').value) || 10;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    document.getElementById('random-string-result').textContent = result;
}

function generateUUID() {
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
    
    document.getElementById('uuid-result').textContent = uuid;
}

// Settings Functions
function openSettings() {
    document.getElementById('settings-modal').style.display = 'block';
}

function closeSettings() {
    document.getElementById('settings-modal').style.display = 'none';
}

function exportData() {
    const data = {
        notes: notes,
        games: games,
        theme: currentTheme,
        timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'utility-hub-data.json';
    a.click();
    URL.revokeObjectURL(url);
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.notes) {
                    notes = data.notes;
                    localStorage.setItem('notes', JSON.stringify(notes));
                    loadNotes();
                }
                
                if (data.games) {
                    games = data.games;
                    localStorage.setItem('games', JSON.stringify(games));
                    loadGames();
                }
                
                if (data.theme) {
                    currentTheme = data.theme;
                    localStorage.setItem('theme', currentTheme);
                    initializeTheme();
                }
                
                alert('Data imported successfully!');
            } catch (error) {
                alert('Error importing data: Invalid file format');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

function clearAllData() {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
        localStorage.clear();
        notes = [];
        games = [];
        currentNote = null;
        loadNotes();
        loadGames();
        document.getElementById('note-title').value = '';
        document.getElementById('note-content').innerHTML = '';
        alert('All data cleared successfully!');
    }
}

// Close modals when clicking outside
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}
