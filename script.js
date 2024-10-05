const reminderTimeInput = document.getElementById("reminderTime");
const toggleRemindersButton = document.getElementById("toggleReminders");
const listContainer = document.getElementById("listContainer");

let remindersInterval;
let speechUtterance = new SpeechSynthesisUtterance();
speechUtterance.voice = speechSynthesis.getVoices()[84];

toggleRemindersButton.addEventListener("click", () => {
    if (remindersInterval) {
        clearInterval(remindersInterval);
        remindersInterval = null;
        toggleRemindersButton.textContent = "Start Reminders";
        toggleRemindersButton.classList.remove("enabled");
    } 
    else {
        if(reminderTimeInput.textContent == '' || isNaN(parseInt(reminderTimeInput.textContent))){
            reminderTimeInput.textContent = '30';
        }
        
        const reminderTime = parseInt(reminderTimeInput.textContent, 10) * 60 * 1000; // Convert minutes to milliseconds
        remindersInterval = setInterval(readToDoItems, reminderTime);
        toggleRemindersButton.textContent = "Stop Reminders";
        toggleRemindersButton.classList.add("enabled");
    }
});

reminderTimeInput.oninput =  function(e){
    if(e.inputType !="insertText" || !isNaN(parseInt(e.data))){
        console.log(e.data);
        return;}
    
    const selection = window.getSelection();
    const range = selection.getRangeAt(0); // Get the current selection range
    // Store the current caret position relative to the start of the selection
    const caretOffset = range.startOffset;
    // Replace the text content of the span
    this.textContent = this.textContent.slice(0,this.textContent.length-1);
    // Restore the caret position
    const newRange = document.createRange();
    newRange.setStart(this.childNodes[0], caretOffset-1);
    newRange.collapse(true);
    selection.removeAllRanges();
    selection.addRange(newRange);
}

listContainer.onclick = function(event){

    
}

function readToDoItems() {
    const items = listContainer.querySelectorAll(".listItem");
    const itemsArray = Array.from(items);
    const emptyItem = itemsArray.pop(); // Remove the empty item from shuffling

    shuffleArray(itemsArray); // Shuffle the remaining items

    // Reorder the list items in the DOM
    itemsArray.forEach(item => listContainer.appendChild(item));
    listContainer.appendChild(emptyItem); // Add the empty item back at the end

    // Read only the non-checked items
    const itemsToRead = itemsArray.filter(item => !item.classList.contains("checked"));
    speechUtterance.text = itemsToRead.map(item => item.textContent).join(", ");
    speechSynthesis.speak(speechUtterance);
}

// Fisher-Yates shuffle algorithm for randomizing array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function addNewEmptyItem() {
    const newItem = document.createElement("div");
    newItem.classList.add("listItem", "empty");
    newItem.contentEditable = true;
    newItem.spellcheck = false;
    listContainer.appendChild(newItem);
}

// MutationObserver to detect changes in the empty list item
const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
        console.log(mutation);
        if (mutation.type === 'characterData' && mutation.target.parentElement.parentElement.classList.contains("empty"))
 {
            mutation.target.parentElement.parentElement.classList.remove("empty");
            addNewEmptyItem();
            break; // Only add one item at a time
        }
    }
});

window.onload = (event) => {
	
  
	observer.observe(listContainer, { childList: true, subtree: true, characterData: true });
	// Start observing the list container
};




