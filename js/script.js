// Select the necessary elements from the DOM
const typingText = document.querySelector(".typing-text p"),
    inpField = document.querySelector(".wrapper .input-field"),
    timeTag = document.querySelector(".time span b"),
    wpmTag = document.querySelector(".wpm span"),
    accuracyTag = document.querySelector(".accuracy span");

let tryAgainBtn = document.querySelector("#try-again-btn");
let timer,
    maxTime = 60,
    timeLeft = maxTime,
    originalText = '',
    charIndex = mistakes = wpm = accuracy = textTyped = isTyping = 0;

async function loadParagraph() {
    originalText = '';
    while (originalText.length < 390) {
        let response = await fetch('https://api.quotable.io/random');
        let data = await response.json();
        // Replace all hyphens (-) with non-breaking hyphens (‑)
        let contentWithNonBreakingHyphen = data.content.replace(/-/g, '‑');
        originalText += ' ' + contentWithNonBreakingHyphen;
    }

    // Remove leading and trailing whitespaces
    originalText = originalText.trim();

    typingText.innerHTML = originalText.split('').map(char => {
        return char === ' ' ? '<span class="space">&nbsp;</span>' : `<span>${char}</span>`;
    }).join('');
    typingText.querySelector("span").classList.add("active");
    document.addEventListener("keydown", () => inpField.focus());
    typingText.addEventListener("click", () => inpField.focus());
}

function handleTyping(e) {
    let key = e.key;
    let spans = typingText.querySelectorAll("span");

    if (!isTyping) {
        startGame();
    }

    if (key === 'Backspace') {
        inputRemoval(spans);
    } else if (key.length === 1) {
        inputTyping(spans, key);
    }
}

function inputRemoval(spans) {
    if (charIndex > 0) {
        spans[charIndex].classList.remove("correct", "incorrect", "active");

        if (spans[charIndex].classList.contains("incorrect")) {
            mistakes--;
        }

        charIndex--;
        spans[charIndex].classList.remove("correct", "incorrect", "active");
        spans[charIndex].classList.add("active");
    }
}

function inputTyping(spans, key) {
    let textTyped = inpField.value + key;

    for (let i = 0; i < textTyped.length; i++) {
        spans[i].classList.remove("correct", "incorrect", "active");

        if (textTyped[i] === originalText[i]) {
            spans[i].classList.add("correct");
        } else {
            spans[i].classList.add("incorrect");
            mistakes++;
        }
    }

    charIndex++;

    spans.forEach(span => span.classList.remove("active"));

    if (charIndex < spans.length) {
        spans[charIndex].classList.add("active");
    }

    let totalWordsTyped = textTyped.split(' ').filter(word => word.trim() !== '').length;
    let minutesElapsed = (maxTime - timeLeft) / 60;

    // If minutesElapsed is zero, set wpm to 0 to avoid Infinity
    let wpm = minutesElapsed > 0 ? Math.round(totalWordsTyped / minutesElapsed) : 0;

    let accuracy = calculateAccuracy(originalText, textTyped);

    // Check for NaN and set to 0 if NaN
    wpm = isNaN(wpm) ? 0 : wpm;
    accuracy = isNaN(accuracy) ? 0 : accuracy;

    wpmTag.innerText = wpm;
    accuracyTag.innerText = `${accuracy}%`;
    if (textTyped.length === originalText.length) {
        endGame();
    }
}

function calculateAccuracy(originalText, typedText) {
    let totalCharsAttempted = typedText.length;
    let correctChars = 0;
    for (let i = 0; i < typedText.length; i++) {
        if (originalText[i] === typedText[i]) {
            correctChars++;
        }
    }

    // If totalCharsAttempted is zero, set accuracy to 0 to avoid NaN
    return totalCharsAttempted > 0 ? Math.round((correctChars / totalCharsAttempted) * 100) : 0;
}

function startGame() {
    isTyping = true;
    timer = setInterval(updateTime, 1000);
    inpField.value = '';
    charIndex = mistakes = 0;
    wpmTag.innerText = accuracyTag.innerText = '0'; // reset the WPM display
}

function updateTime() {
    timeLeft--;

    timeTag.innerText = timeLeft;

    if (timeLeft <= 0) {
        endGame();
    }
}

function endGame() {
    clearInterval(timer);
    inpField.disabled = true;
    storeData();
    checkImprovement();
}

function resetData() {
    document.getElementById('improvement-message').innerText = "";
}

function resetGame() {
    // Reset and load new paragraph
    inpField.value = '';
    inpField.disabled = false;
    clearInterval(timer);
    timeLeft = maxTime;
    timeTag.innerText = timeLeft;

    // Reset typing variables
    originalText = '';
    accuracy = wpm = charIndex = mistakes = isTyping = 0;
    wpmTag.innerText = 0;
    accuracyTag.innerText = 0;

    // Load a new paragraph for typing
    loadParagraph();
    resetData();
}

function restartGame() {
    // Reset without loading a new paragraph
    inpField.value = '';
    inpField.disabled = false;
    clearInterval(timer);
    accuracy = wpm = charIndex = mistakes = isTyping = 0;
    wpmTag.innerText = 0;
    accuracyTag.innerText = 0;

    const characters = typingText.querySelectorAll("span");
    characters.forEach(span => {
        span.classList.remove("correct", "incorrect", "active");
    });

    characters[0].classList.add("active");
    timeLeft = maxTime;
    timeTag.innerText = timeLeft;
    resetData();
}

// Function to store the typing test data
function storeData() {
    // Prepare the data
    let data = {
        wpm: wpmTag.innerText,
        accuracy: accuracyTag.innerText,
        time: timeTag.innerText
    };

    let jsonData = JSON.stringify(data);

    let now = new Date();

    // Format the current time
    let formattedNow = ('0' + (now.getMonth() + 1)).slice(-2) + '-' +
        ('0' + now.getDate()).slice(-2) + '/' +
        ('0' + now.getHours()).slice(-2) + ':' +
        ('0' + now.getMinutes()).slice(-2);

    // Store the data in the local storage
    localStorage.setItem(formattedNow, jsonData);

    let keys = JSON.parse(localStorage.getItem('keys')) || [];

    // Add the current time to the keys list
    keys.push(formattedNow);

    // Store the keys list in the local storage
    localStorage.setItem('keys', JSON.stringify(keys));
}

function checkImprovement() {
    let currentWPM = Number(wpmTag.innerText);
    let currentAccuracy = Number(accuracyTag.innerText.replace('%', ''));
    let keys = JSON.parse(localStorage.getItem('keys')) || [];
    let lastKey = keys[keys.length - 2]; // the last key (-1) will be the current typing data, we want the one before that (-2)
    let prevData = lastKey ? JSON.parse(localStorage.getItem(lastKey)) : { wpm: 0, accuracy: 0 };

    if (currentWPM > Number(prevData.wpm) && currentAccuracy > Number(prevData.accuracy.replace('%', ''))) {
        document.getElementById('feedback').innerText = "Fantastic! You've improved both your typing speed and accuracy!";
    } else if (currentWPM > Number(prevData.wpm) && currentAccuracy >= Number(prevData.accuracy.replace('%', ''))) {
        document.getElementById('feedback').innerText = "Great job! You've improved your typing speed!";
    } else if (currentAccuracy > Number(prevData.accuracy.replace('%', '')) && currentWPM >= Number(prevData.wpm)) {
        document.getElementById('feedback').innerText = "Great job! You've improved your typing accuracy!";
    } else if (currentWPM === Number(prevData.wpm) && currentAccuracy === Number(prevData.accuracy.replace('%', ''))) {
        document.getElementById('feedback').innerText = "You're consistent! Keep practicing to improve your speed and accuracy.";
    } else {
        document.getElementById('feedback').innerText = "Keep trying! Practice more to improve your speed and accuracy.";
    }

    let newData = { wpm: currentWPM, accuracy: currentAccuracy };
    localStorage.setItem('typingData', JSON.stringify(newData));
}

// Function to get all typing test data
function getAllData() {
    let keys = JSON.parse(localStorage.getItem('keys'));

    if (keys) {
        keys.forEach(key => {
            let data = JSON.parse(localStorage.getItem(key));
        });
    }
}

async function main() {
    // load the initial paragraph
    await loadParagraph();

    // Attach the keydown event listener to inpField directly here
    inpField.addEventListener('keydown', handleTyping);

    // add listeners to buttons
    tryAgainBtn.addEventListener("click", resetGame);

    // add global keydown event listener to handle 'Enter' and 'Escape'
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            restartGame();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            resetGame();
        }
    });
}

main();