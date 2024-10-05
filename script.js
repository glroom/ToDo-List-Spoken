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
     console.log(e);
    if(e.inputType != "insertText" || !isNaN(parseInt(e.data))){
        return;
    }
    console.log(e.inputType);
    
    const selection = window.getSelection();
    const range = selection.getRangeAt(0); // Get the current selection range
    // Store the current caret position relative to the start of the selection
    let caretOffset = range.startOffset;
    // Replace the text content of the span
    this.textContent = this.textContent.slice(0,this.textContent.length-1);
    // Restore the caret position
    const newRange = document.createRange();
    //if(this.textContent.length == 0){
        //this.textContent = ' '
        //caretOffset = 2;
   // }
    
    newRange.setStart(this.childNodes[0], caretOffset-1);
    newRange.collapse(true);
    selection.removeAllRanges();
    selection.addRange(newRange);
};

reminderTimeInput.onblur = function(){if(this.textContent.length ==0){this.textContent = "1"}};

listContainer.onclick = function(e){
    console.log(e);
    const listItem = e.target.closest(".listItem"); //get the listItem div
    
    if(e.target.classList.contains("listCheck") 
        && !listItem.classList.contains("empty") 
        && listItem.querySelector(".listText").textContent != ''){
        //if click the box and listItem not .empty and listText content not empty string
        
        listItem.classList.contains("checked")?
        listItem.classList.remove("checked"):
        listItem.classList.add("checked");
        //is listItem .checked? if so remove checked or else add checked.
        listItem.querySelector(".listInfo").textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        //add the time to listInfo
    }
        
    else if(e.target.classList.contains("listX") && listItem != listContainer.lastChild){
        listItem.style.border = "none";
        listItem.style.margin = "0px";
        listItem.style.maxHeight = "0px";
        listItem.style.opacity = "0%";
        setTimeout((e)=>{
           e.remove();
            
        },200,listItem);
        
    }
    
}

listContainer.addEventListener("keydown", (e) => {
    console.log(e)
        if(e.key == "Enter" && !e.shiftKey){e.preventDefault();
            if(e.target.parentElement == listContainer.children[listContainer.childElementCount-2]){
                listContainer.lastChild.querySelector(".listText").focus();}
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
    
    listContainer.appendChild(newItem);
    
    newItem.outerHTML = 
        `<div class="listItem empty init">
            <div class ="listCheck"></div>
            <div class ="listText" contenteditable="true" spellcheck="false"></div>
            <div class="listEnd">
                <div class ="listX">X</div>
                <div class ="listInfo"></div>
            </div>
        </div>`;

    setTimeout(e=>listContainer.lastChild.classList.remove("init"),10);
    
    

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




