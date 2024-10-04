const reminderTimeInput = document.getElementById("reminderTime");
const toggleRemindersButton = document.getElementById("toggleReminders");
const listContainer = document.getElementById("listContainer");

let remindersInterval;
let speechUtterance = new SpeechSynthesisUtterance();

toggleRemindersButton.addEventListener("click", () => {
    if (remindersInterval) {
        clearInterval(remindersInterval);
        remindersInterval = null;
        toggleRemindersButton.textContent = "Start Reminders";
    } else {
        const reminderTime = parseInt(reminderTimeInput.value, 10) * 60 * 1000; // Convert minutes to milliseconds
        remindersInterval = setInterval(readToDoItems, reminderTime);
        toggleRemindersButton.textContent = "Stop Reminders";
    }
});

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
    listContainer.appendChild(newItem);
}

// MutationObserver to detect changes in the empty list item
const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
        if (mutation.type === 'characterData' && mutation.target.classList.contains("empty"))   
 {
            mutation.target.classList.remove("empty");
            addNewEmptyItem();
            break; // Only add one item at a time
        }
    }
});

// Start observing the list container
observer.observe(listContainer, { childList: true, subtree: true, characterData: true });

// Initial empty list item
addNewEmptyItem();