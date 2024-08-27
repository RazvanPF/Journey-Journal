// CONSTANTS
const popup = document.getElementById('entry-popup');
const newEntryButton = document.getElementById('new-entry');
const closeButton = document.getElementById('close-popup');
const entryList = document.getElementById('entry-list');
const editButton = document.getElementById('edit-entry');
const deleteButton = document.getElementById('delete-entry');
const confirmDeleteButton = document.getElementById('confirm-delete');
const cancelDeleteButton = document.getElementById('cancel-delete');
//LETs 
let isEditing = false;
let currentEntry = null;
let deleteMode = false;
let entryToDelete = null;
let selectedImageFile = null; 
let coverImageElement = null; 
let selectedRange; 
let entries = []; 
let colorPickerOpen = false;
let colorInput;

// Event listeners to open and close the popup
newEntryButton.addEventListener('click', addNewEntry);
closeButton.addEventListener('click', closePopup);
editButton.addEventListener('click', toggleEditing);

// Check if there are any entries and toggle the placeholder
function toggleNoEntryPlaceholder() {
    const entryCount = document.querySelectorAll('.entry').length;
    const placeholder = document.getElementById('no-entry-placeholder');
    
    if (entryCount === 0) {
        placeholder.style.display = 'block';  // Show the placeholder if no entries
    } else {
        placeholder.style.display = 'none';  // Hide the placeholder if entries exist
    }
}

    // Initial check when the page loads
    window.onload = function() {
        toggleNoEntryPlaceholder();
    };
    
    //Create entry data array to store independent data for each entry
    function createEntryData() {
        return {
            title: 'New Entry',
            mood: '',
            weather: '',
            location: '',
            date: '',
            text: '',
            styles: [],
            image: "https://raw.githubusercontent.com/razvanpf/Images/main/imgplaceholder.jpg"
        };
    }

// Add new entry
function addNewEntry() {
    const newEntryData = createEntryData();
    entries.push(newEntryData);

    // Reset input fields for the new entry
    document.getElementById('entry-title').value = newEntryData.title;
    document.getElementById('mood-select').value = '';
    document.getElementById('weather-select').value = '';
    document.getElementById('location-input').value = '';
    document.getElementById('date-picker').value = '';
    document.getElementById('entry-text').innerText = '';
    document.getElementById('mood-selection').textContent = '';
    document.getElementById('weather-selection').textContent = '';
    document.getElementById('location-selection').textContent = '';
    document.getElementById('date-selection').textContent = '';
    selectedImageFile = null; 

    // Reset or hide the cover image element
    if (coverImageElement) {
        coverImageElement.src = "";
        coverImageElement.style.display = 'none'; 
    }

    const newEntryElement = document.createElement('div');
    newEntryElement.classList.add('entry');
    newEntryElement.innerHTML = `
        <div class="entry-header">
            <div class="entry-title">${newEntryData.title}</div>
            <div class="entry-preview"></div>
            <div class="entry-image"><img src="${newEntryData.image}" alt="Entry Image"></div>
        </div>
        <div class="entry-details">
            <span class="mood"></span>
            <span class="weather"></span>
            <span class="location"></span>
            <span class="date"></span>
        </div>
    `;
    
    newEntryElement.addEventListener('click', () => {
        if (!deleteMode) { 
            currentEntryIndex = entries.indexOf(newEntryData);
            openPopup(currentEntryIndex);
        }
    });

    entryList.appendChild(newEntryElement);
    toggleNoEntryPlaceholder();
}


// Open the popup
function openPopup(entryIndex) {
    if (entryIndex === undefined || entryIndex < 0 || entryIndex >= entries.length) {
        console.error('Invalid entry index:', entryIndex);
        return; // Exit the function if the index is invalid
    }

    const entryData = entries[entryIndex];
    const entryText = document.getElementById('entry-text');

    popup.classList.remove('hidden');
    popup.style.display = 'flex';

    document.getElementById('entry-title').value = entryData.title;
    document.getElementById('mood-select').value = entryData.mood;
    document.getElementById('mood-selection').textContent = getMoodEmoji(entryData.mood);
    document.getElementById('weather-select').value = entryData.weather;
    document.getElementById('weather-selection').textContent = entryData.weather ? `${entryData.weather}°C` : '';
    document.getElementById('location-input').value = entryData.location;
    document.getElementById('date-picker').value = entryData.date;
    document.getElementById('location-selection').textContent = entryData.location || '';
    document.getElementById('date-selection').textContent = entryData.date || '';

    // Load the HTML content into the contenteditable area
    entryText.innerHTML = entryData.text || ''; 

    if (!coverImageElement) {
        coverImageElement = document.createElement('img');
        coverImageElement.classList.add('cover-image');
        document.getElementById('popup-body').insertBefore(coverImageElement, document.getElementById('entry-text'));
    }

    if (!entryData.image || entryData.image === "https://raw.githubusercontent.com/razvanpf/Images/main/imgplaceholder.jpg") {
        coverImageElement.style.display = 'none';
    } else {
        coverImageElement.src = entryData.image;
        coverImageElement.style.display = 'block';
    }

    selectedRange = null;
    setEditingState(false);
    document.getElementById('entry-text').setAttribute('contenteditable', 'false');

    currentEntryIndex = entryIndex;  // Set the current entry index
    
    // Update the date display in openPopup function
    document.getElementById('date-selection').textContent = formatDateToDDMMYYYY(entryData.date);
}


// Close the popup and update the entry
function closePopup() {
    if (typeof currentEntryIndex !== 'undefined') {
        updateEntry(currentEntryIndex);
    } else {
        console.error('Current entry index is undefined, cannot update the entry.');
    }
    popup.classList.add('hidden'); // Hide the popup
}


// Update entry
function updateEntry(entryIndex) {
    if (entryIndex === undefined || entryIndex < 0 || !entries[entryIndex]) {
        console.error('Invalid entry index:', entryIndex);
        return;
    }

    const entryData = entries[entryIndex];
    const entryElement = entryList.children[entryIndex];
    const entryText = document.getElementById('entry-text');

    entryData.title = document.getElementById('entry-title').value;
    entryData.mood = document.getElementById('mood-select').value;
    entryData.weather = document.getElementById('weather-select').value;
    entryData.location = document.getElementById('location-input').value;
    entryData.date = document.getElementById('date-picker').value;
    entryData.text = entryText.innerHTML; 

    if (selectedImageFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            entryData.image = e.target.result;
            entryElement.querySelector('.entry-image img').src = entryData.image;
        };
        reader.readAsDataURL(selectedImageFile);
        selectedImageFile = null;
    } else {
        entryElement.querySelector('.entry-image img').src = entryData.image || '';
    }

    // Strip HTML tags for the preview
    const strippedText = entryData.text.replace(/<\/?[^>]+(>|$)/g, "");

    entryElement.querySelector('.entry-title').textContent = entryData.title;
    // Add some emojis to weather/location/date
    entryElement.querySelector('.mood').textContent = getMoodEmoji(entryData.mood);
    entryElement.querySelector('.weather').textContent = entryData.weather ? `⛅ ${entryData.weather}°C` : '';
    entryElement.querySelector('.location').textContent = entryData.location ? `📍 ${entryData.location}` : '';
    entryElement.querySelector('.date').textContent = entryData.date ? `📅 ${formatDateToDDMMYYYY(entryData.date)}` : '';

    // Update the preview text after saving the entry
    updateEntryPreview(entryData, entryIndex);

}

// Get emoji for mood
function getMoodEmoji(mood) {
    switch(mood) {
        case 'sad': return '😢';
        case 'neutral': return '😐';
        case 'happy': return '😊';
        case 'freezing': return '🥶';
        case 'melting': return '🥵';
        case 'drunk': return '🥴';
        case 'sick': return '🤢';
        default: return '';
    }
}

// Get mood value from emoji
function getMoodValueFromEmoji(emoji) {
    switch(emoji) {
        case '😢': return 'sad';
        case '😐': return 'neutral';
        case '😊': return 'happy';
        case '🥶': return 'freezing';
        case '🥵': return 'melting';
        case '🥴': return 'drunk';
        case '🤢': return 'sick';
        default: return '';
    }
}

// Toggle editing in the popup
function toggleEditing() {
    isEditing = !isEditing;
    setEditingState(isEditing);
}

// Set the editing state
function setEditingState(enable) {
    document.getElementById('entry-title').disabled = !enable;
    document.getElementById('entry-text').disabled = !enable;
    document.getElementById('font-size-tool').disabled = !enable;
    document.getElementById('font-family-tool').disabled = !enable;

    // Toggle contenteditable attribute based on editing state
    document.getElementById('entry-text').setAttribute('contenteditable', enable ? 'true' : 'false');

    const textTools = document.querySelectorAll('#popup-footer button.text-tool, #font-family-tool, #font-size-tool');
    textTools.forEach(tool => {
        tool.disabled = !enable;
    });

    // Change the "Edit Content" button text to indicate the current state
    editButton.textContent = enable ? 'Disable Editing Content' : 'Edit Content';
}


// Enhanced Notification
function showNotification(message, color = 'green') {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
    notification.style.backgroundColor = color;
    notification.style.color = 'white';
    notification.style.padding = '10px 50px';
    notification.style.borderRadius = '7px';
    notification.style.zIndex = '999999';
    notification.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.8)';
    document.body.appendChild(notification);
    
    setTimeout(() => {
        document.body.removeChild(notification);
    }, 2000);
}
    // Populate weather options
    $(document).ready(function() {
        const weatherSelect = document.getElementById('weather-select');
        for (let temp = -30; temp <= 45; temp++) {
            let option = document.createElement('option');
            option.value = temp;
            option.text = `${temp}°C`;
            weatherSelect.appendChild(option);
        }

    // Event listener for mood selection
    $('#mood-select').on('change', function() {
        const selectedMood = $(this).val();
        $('#mood-selection').text(getMoodEmoji(selectedMood));
    });

    // Event listener for weather selection
    $('#weather-select').on('change', function() {
        const selectedWeather = $(this).val();
        $('#weather-selection').text(`${selectedWeather}°C`);
    });

    // Manual text input for location
    $('#location-input').on('input', function() {
        const enteredLocation = $(this).val();
        $('#location-selection').text(enteredLocation);
    });

    // Event listener for date selection (click to open, no hover for date ONLY, rest are hover)
    $('#date-dropdown').on('click', function(event) {
        event.stopPropagation();
        $('#date-picker').toggleClass('hidden').focus(); // Toggle the date picker visibility
    });

    $('#date-picker').on('change', function() {
        const selectedDate = $(this).val();
        $('#date-selection').text(selectedDate);
        $('#date-picker').addClass('hidden'); // Hide date picker after selection
    });

    // Prevent the date text from disappearing when the date picker is focused - not really working
    $('#date-picker').on('focus', function() {
        $('#date-selection').css('visibility', 'visible');
    });

    // Open dropdowns on hover
    $('#weather-dropdown').on('mouseover', function() {
        $('#weather-select').parent().addClass('show');
    });

    $('#mood-dropdown').on('mouseover', function() {
        $('#mood-select').parent().addClass('show');
    });

    $('#location-dropdown').on('click', function(event) {
        event.stopPropagation();
        $(this).siblings('.dropdown-content').toggleClass('show'); // Toggle current dropdown
    });

    // Close dropdowns if clicked outside
    $(document).on('click', function() {
        $('.dropdown-content').removeClass('show');
        $('#date-picker').addClass('hidden'); // Hide date picker
    });
});

// Toggle delete mode on click
function toggleDeleteMode() {
    deleteMode = !deleteMode;
    if (deleteMode) {
        deleteButton.classList.add('active');
    } else {
        deleteButton.classList.remove('active');
        if (entryToDelete) {
            removeHighlight(entryToDelete);
            entryToDelete = null;
        }
        removeAllHighlights(); // Remove any existing highlights
    }
}

// Apply highlight manually
function applyHighlight(entry) {
    entry.classList.add('highlight-delete');
}
// Remove highlight manually
function removeHighlight(entry) {
    entry.classList.remove('highlight-delete');
}

// Function to handle entry click for deletion
function handleEntryClick(event) {
    if (deleteMode && event.target.closest('.entry')) {
        if (entryToDelete) {
            removeHighlight(entryToDelete);  // Remove highlight from previous entry
        }
        entryToDelete = event.target.closest('.entry');
        applyHighlight(entryToDelete);  // Apply highlight to the selected entry
        openDeletePopup();
    }
}

// Attach the handleEntryClick function to entry clicks
entryList.addEventListener('click', handleEntryClick);

// Highlight entry in red when hovering in delete mode
entryList.addEventListener('mouseover', (event) => {
    if (deleteMode && event.target.closest('.entry')) {
        const entry = event.target.closest('.entry');
        applyHighlight(entry);
    }
});

// Remove highlight when mouse leaves entry in delete mode
entryList.addEventListener('mouseout', (event) => {
    if (deleteMode && event.target.closest('.entry')) {
        const entry = event.target.closest('.entry');
        if (entry !== entryToDelete) {  // Keep highlight if entry is selected for deletion
            removeHighlight(entry);
        }
    }
});

// Remove all highlights (helper function)
function removeAllHighlights() {
    const highlightedEntries = document.querySelectorAll('.highlight-delete');
    highlightedEntries.forEach(entry => removeHighlight(entry));
}

// Open the delete confirmation popup
function openDeletePopup() {
    document.getElementById('delete-popup').classList.remove('hidden');
}

// Close the delete confirmation popup
function closeDeletePopup() {
    document.getElementById('delete-popup').classList.add('hidden');
    entryToDelete = null; // Reset the entry to delete
}

// Confirm deletion
function confirmDeletion() {
    if (entryToDelete) {
        // Find the index of the entry to delete in the entries array
        const entryIndex = Array.from(entryList.children).indexOf(entryToDelete);
        
        // Ensure that the entry index is valid
        if (entryIndex >= 0) {
            // Remove the entry from the entries array
            entries.splice(entryIndex, 1);
            
            // Remove the entry from the DOM
            entryToDelete.remove();
            
            // Reset currentEntryIndex if needed
            if (typeof currentEntryIndex !== 'undefined' && currentEntryIndex !== null) {
                if (currentEntryIndex === entryIndex) {
                    currentEntryIndex = null; // Reset if the current entry is the one being deleted
                } else if (currentEntryIndex > entryIndex) {
                    currentEntryIndex--; // Adjust the index if needed
                }
            }

            entryToDelete = null; // Reset entryToDelete after deletion
        }
    }
    closeDeletePopup();
    toggleNoEntryPlaceholder();  // Check if the placeholder needs to be shown/hidden post deletion
}

// Cancel deletion
function cancelDeletion() {
    if (entryToDelete) {
        removeHighlight(entryToDelete);
        entryToDelete = null;
    }
    closeDeletePopup();  // Close the delete confirmation popup
}

// Activate delete mode when the delete button is clicked
deleteButton.addEventListener('click', toggleDeleteMode);

// Attach event listeners to the confirm and cancel buttons
confirmDeleteButton.addEventListener('click', confirmDeletion);
cancelDeleteButton.addEventListener('click', cancelDeletion);

// Event listener for the "Add Image" button
document.querySelector('.add-image-btn').addEventListener('click', function() {
    // Create a file input element dynamically
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';

    // Trigger the file input when the button is clicked
    fileInput.click();

    // Handle the file selection
    fileInput.addEventListener('change', function() {
        const file = fileInput.files[0];
        if (file) {
            selectedImageFile = file; // Sets the selected image file
            displayCoverImage(file);  // Display image in popup
        }
    });
});

// Display the cover image in the popup
function displayCoverImage(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        if (coverImageElement) {
            coverImageElement.src = e.target.result;
            coverImageElement.style.display = 'block'; // Makes image is visible when added
        } else {
            coverImageElement = document.createElement('img');
            coverImageElement.src = e.target.result;
            coverImageElement.classList.add('cover-image');
            coverImageElement.style.display = 'block'; // Makes image is visible when added
            document.getElementById('popup-body').insertBefore(coverImageElement, document.getElementById('entry-text'));
        }

        // Update the current entry's image in the DOM and entries array
        if (currentEntry !== null) {
            const entryIndex = entries.indexOf(currentEntry);
            if (entryIndex >= 0) {
                entries[entryIndex].image = e.target.result;
            }
        }
    };
    reader.readAsDataURL(file);
}

// Handle lightbox functionality
function openLightbox(imageSrc) {
    // Create lightbox
    const lightbox = document.createElement('div');
    lightbox.id = 'lightbox';
    lightbox.style.position = 'fixed';
    lightbox.style.top = '0';
    lightbox.style.left = '0';
    lightbox.style.width = '100%';
    lightbox.style.height = '100%';
    lightbox.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    lightbox.style.display = 'flex';
    lightbox.style.justifyContent = 'center';
    lightbox.style.alignItems = 'center';
    lightbox.style.zIndex = '10000';
    lightbox.style.cursor = 'pointer';

    // Create image for lightbox
    const lightboxImage = document.createElement('img');
    lightboxImage.src = imageSrc;
    lightboxImage.style.maxWidth = '90%';
    lightboxImage.style.maxHeight = '90%';
    lightbox.appendChild(lightboxImage);

    // Append lightbox to body
    document.body.appendChild(lightbox);

    // Close lightbox on click
    lightbox.addEventListener('click', function() {
        document.body.removeChild(lightbox);
    });
}

// Add event listener to the dynamically added image to open lightbox
document.getElementById('popup-body').addEventListener('click', function(event) {
    if (event.target.tagName === 'IMG' && event.target !== document.querySelector('.entry-image img')) {
        openLightbox(event.target.src);
    }
});

// Save the selection range
function saveSelection() {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        selectedRange = selection.getRangeAt(0);
    }
}

// Restore the selection range
function restoreSelection() {
    const selection = window.getSelection();
    if (selectedRange) {
        selection.removeAllRanges();
        selection.addRange(selectedRange);
    }
}

// Execute a rich text command
function executeCommand(command, value = null) {
    restoreSelection();
    document.execCommand(command, false, value);
}

// Event listeners for the text tools in the toolbar
//Bold
document.querySelector('#bold-tool').addEventListener('click', (e) => {
    e.preventDefault(); // Prevent default to maintain focus
    saveSelection();
    executeCommand('bold');
});

//Italic
document.querySelector('#italic-tool').addEventListener('click', (e) => {
    e.preventDefault(); // Prevent default to maintain focus
    saveSelection();
    executeCommand('italic');
});

//Underline
document.querySelector('#underline-tool').addEventListener('click', (e) => {
    e.preventDefault(); // Prevent default to maintain focus
    saveSelection();
    executeCommand('underline');
});

//Font Size Change
document.getElementById('font-size-tool').addEventListener('change', function() {
    saveSelection(); // Save the current selection before changing the font size
    document.execCommand('fontSize', false, this.selectedIndex + 1);
    restoreSelection(); // Restore the selection after applying the font size
});

// Font family change
document.getElementById('font-family-tool').addEventListener('change', function() {
    saveSelection();
    executeCommand('fontName', this.value);
});

// Open the custom URL input
function openCustomUrlInput() {
    if (window.getSelection().toString().trim() === '') {
        showNotification('Please select any text before adding a hyperlink.', 'red');
        return;
    }
    saveSelection();  // Save the current selection before opening the popup

    var selectedText = window.getSelection().toString(); // Capture the text of the current selection

    // Position the popup above the "URL" button
    var urlButtonRect = document.querySelector('#insert-url').getBoundingClientRect();
    var linkEditorPopup = document.getElementById('linkEditorPopup');

    linkEditorPopup.style.display = 'block'; // Ensure the popup is displayed before calculating height

    // Calculate the position above the button
    var popupHeight = linkEditorPopup.offsetHeight;
    linkEditorPopup.style.top = `${urlButtonRect.top + window.scrollY - popupHeight - 10}px`; // Subtract popup height and add some margin
    linkEditorPopup.style.left = `${urlButtonRect.left + window.scrollX}px`;

    // Set values in the popup
    document.getElementById('displayText').value = selectedText;
    var parentLink = getParentLinkElement();
    document.getElementById('urlInputField').value = parentLink ? parentLink.href : '';
}

// Find the parent <a> element of the selection, if any
function getParentLinkElement() {
    var selection = window.getSelection();
    if (selection.rangeCount === 0) return null;
    var range = selection.getRangeAt(0).startContainer;
    return range.nodeType === 3 ? range.parentNode.closest('a') : range.closest('a');
}

// Remove link from selected text
function removeLinkFromSelection() {
    var selection = window.getSelection();
    if (!selection.rangeCount) return;

    var range = selection.getRangeAt(0);
    var containerElement = range.commonAncestorContainer;

    // Navigate up to find the 'a' element if the selection is inside it
    while (containerElement.nodeType !== 1 || containerElement.tagName !== 'A') {
        containerElement = containerElement.parentNode;
        if (!containerElement) return; // Break if no 'a' element is found
    }

    if (containerElement.tagName === 'A') {
        var docFragment = document.createDocumentFragment();
        while (containerElement.firstChild) {
            docFragment.appendChild(containerElement.firstChild);
        }
        containerElement.parentNode.replaceChild(docFragment, containerElement);
        selection.removeAllRanges();
    }
}

// Apply the custom link to the selected text or remove it if URL is empty
function applyCustomLink() {
    restoreSelection();
    const url = document.getElementById('urlInputField').value.trim();
    const displayText = document.getElementById('displayText').value.trim();

    if (!url) {
        showNotification('Please enter a valid URL.', 'red');
        return;
    }

    if (selectedRange) {
        // Remove any existing link
        document.execCommand('unlink');

        // Create a new link
        document.execCommand('createLink', false, url);

        // Set target="_blank" on the created link
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const linkElement = selection.anchorNode.parentElement;
            if (linkElement && linkElement.tagName === 'A') {
                linkElement.setAttribute('target', '_blank');
                linkElement.setAttribute('href', url);
                linkElement.textContent = displayText || url;
                linkElement.style.color = '#0645AD'; // Optional: set link color
                linkElement.style.textDecoration = 'underline'; // Optional: set text decoration
            }
        }
    }

    closeCustomUrlInput(); // Close the popup after applying the link
    showNotification('Link applied successfully.', 'green'); //Show success notification
}

// Close the custom URL input
function closeCustomUrlInput() {
    document.getElementById('linkEditorPopup').style.display = 'none';
}

// Event listener for the link button
document.querySelector('#insert-url').addEventListener('click', function(e) {
    e.preventDefault(); // Prevent default to maintain focus
    openCustomUrlInput();
});

// Reference to the contenteditable div
const entryTextDiv = document.getElementById('entry-text');

// Add click event listener ofr URLs
entryTextDiv.addEventListener('click', function(event) {
    const target = event.target;
    if (target.tagName === 'A') {
        if (!isEditing) {
            event.preventDefault(); // Prevent default behavior
            const url = target.getAttribute('href');
            if (url) {
                window.open(url, '_blank'); // Open link in a new tab
            }
        }
    }
});

// Event listener for the "Save" button
document.getElementById('save-entry-popup').addEventListener('click', function() {
    if (currentEntryIndex !== null && currentEntryIndex >= 0) {
        updateEntry(currentEntryIndex);
        showNotification("Changes Saved", 'green');
    } else {
        console.error('Current entry not found in entries array.');
    }

    closeCustomUrlInput(); // Close any open URL input popup
    closePopup(); // Close the entry popup
});

// LOCAL STORAGE //

//Save to local storage
function saveToLocalStorage() {
    // Convert entries array to JSON and save it in local storage
    localStorage.setItem('journalEntries', JSON.stringify(entries));

    // Trigger the notification
    showNotification("Content saved", 'green');
}

// Add event listener to the "Save" button
document.getElementById('save-storage').addEventListener('click', saveToLocalStorage);

function openClearStoragePopup() {
    document.getElementById('clear-storage-popup').classList.remove('hidden');
}

function closeClearStoragePopup() {
    document.getElementById('clear-storage-popup').classList.add('hidden');
}

function clearLocalStorage() {
    // Clear local storage
    localStorage.removeItem('journalEntries');
    
    // Clear the UI and reset the entries array
    entries = [];
    entryList.innerHTML = ''; // Remove all entry elements from the UI

    toggleNoEntryPlaceholder(); // Update placeholder visibility
    
    // Trigger the notification
    showNotification("Data cleared", 'red');

    closeClearStoragePopup();
}

// Attach event listeners for the confirmation popup
document.getElementById('confirm-clear').addEventListener('click', clearLocalStorage);
document.getElementById('cancel-clear').addEventListener('click', closeClearStoragePopup);

// Attach event listener to the "Clear" button
document.getElementById('clear-storage').addEventListener('click', openClearStoragePopup);

//LOAD 
function loadFromLocalStorage() {
    const savedEntries = localStorage.getItem('journalEntries');
    if (savedEntries) {
        entries = JSON.parse(savedEntries);
        entries.forEach((entryData, index) => {
            const newEntryElement = document.createElement('div');
            newEntryElement.classList.add('entry');
            newEntryElement.innerHTML = `
                <div class="entry-header">
                    <div class="entry-title">${entryData.title}</div>
                    <div class="entry-preview">${stripHTML(entryData.text).length > 60 ? stripHTML(entryData.text).substring(0, 60) + '...' : stripHTML(entryData.text)}</div>
                    <div class="entry-image"><img src="${entryData.image}" alt="Entry Image"></div>
                </div>
                <div class="entry-details">
                    <span class="mood">${getMoodEmoji(entryData.mood)}</span>
                    <span class="weather">${entryData.weather ? `⛅ ${entryData.weather}` + '°C' : ''}</span>
                    <span class="location">${entryData.location ? `📍 ${entryData.location}` : ''}</span>
                    <span class="date">${entryData.date ? `📅 ${formatDateToDDMMYYYY(entryData.date)}` : ''}</span>
                </div>
            `;
            
            // Attach click event to open the popup with this entry's data
            newEntryElement.addEventListener('click', () => {
                if (!deleteMode) { 
                    currentEntry = newEntryElement;
                    openPopup(index); // Open the popup for this entry
                }
            });

            entryList.appendChild(newEntryElement);
            updateEntryPreview(entryData, index);
        });
        toggleNoEntryPlaceholder();
    }
}

// Helper function to strip HTML tags from a string
function stripHTML(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
}

// Load entries from local storage on page load
window.onload = function() {
    loadFromLocalStorage();
    toggleNoEntryPlaceholder();
};

// HELP POPUP //

document.addEventListener('DOMContentLoaded', function() {
    // Select the help button and the popup elements
    const helpButton = document.getElementById('help');
    const instructionPopup = document.getElementById('instructionPopup');
    const closePopupButton = document.getElementById('closePopupButton');

    // Log the elements to ensure they are not null
    console.log('Help Button:', helpButton);
    console.log('Instruction Popup:', instructionPopup);
    console.log('Close Popup Button:', closePopupButton);

    // Check if elements are not null
    if (!helpButton || !instructionPopup || !closePopupButton) {
        console.error('One or more elements are missing:', { helpButton, instructionPopup, closePopupButton });
        return; // Exit if any of the elements are missing
    }

    // Open instructions popup
    function openInstructionPopup() {
        instructionPopup.classList.remove('hidden');
    }

    // Close instructions popup
    function closeInstructionPopup() {
        instructionPopup.classList.add('hidden');
    }

    // Event listeners for opening and closing the instructions popup
    helpButton.addEventListener('click', openInstructionPopup);
    closePopupButton.addEventListener('click', closeInstructionPopup);

    // Optional: Close the instructions popup if clicking outside of it
    instructionPopup.addEventListener('click', function(event) {
        if (event.target === instructionPopup) {
            closeInstructionPopup();
        }
    });
});

// Format date from YYYY-MM-DD to DD-MM-YYYY
function formatDateToDDMMYYYY(dateString) {
    if (!dateString) return ''; // Handle empty dates
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`;
}

// Event listener for the color picker
document.getElementById('color-tool').addEventListener('click', function(e) {
    e.preventDefault(); // Prevent default to maintain focus
    saveSelection();

    // Check if the color picker already exists and remove it if it does
    let existingColorInput = document.getElementById('custom-color-picker');
    if (existingColorInput) {
        document.body.removeChild(existingColorInput);
        return; // If it existed, it was just removed, so exit here
    }

    // Create a color input dynamically
    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.id = 'custom-color-picker'; // Assign an ID to the color picker
    colorInput.style.position = 'absolute';
    colorInput.style.zIndex = '10009'; // Ensure it's above other elements
    colorInput.style.opacity = '0'; // Hide the actual input but trigger its event

    // Position the color input above the button
    const buttonRect = this.getBoundingClientRect();
    colorInput.style.left = `${buttonRect.left + window.scrollX}px`;
    colorInput.style.top = `${buttonRect.top + window.scrollY - colorInput.offsetHeight}px`;

    document.body.appendChild(colorInput);
    colorInput.focus();  // Make sure the color input gets focus

    // After the user releases the color picker, apply the color
    colorInput.addEventListener('input', function() {
        colorInput.style.opacity = '1'; // Show the color picker
    });

    // After the color is changed and the user releases, apply the color
    colorInput.addEventListener('change', function() {
        restoreSelection(); // Restore the text selection
        executeCommand('foreColor', colorInput.value);
        document.body.removeChild(colorInput); // Remove color picker after applying color
    });

    // Close the color picker when clicking outside
    document.addEventListener('click', function handleClickOutside(event) {
        if (!colorInput.contains(event.target) && event.target !== colorInput) {
            document.body.removeChild(colorInput);
            document.removeEventListener('click', handleClickOutside); // Remove the event listener once done
        }
    }, { once: true });

    // Trigger the color input click to open the color picker
    colorInput.click();
});

// Alignment Popup
document.getElementById('align-tool').addEventListener('click', function (e) {
    e.preventDefault(); // Prevent default behavior
    saveSelection(); // Save the current text selection

    const alignPopup = document.getElementById('alignPopup');

    // Position the alignPopup above and slightly to the left of the button
    const buttonRect = this.getBoundingClientRect();
    alignPopup.style.left = `${buttonRect.left + window.scrollX - 60}px`; // Adjusted to the left
    alignPopup.style.top = `${buttonRect.top + window.scrollY - alignPopup.offsetHeight - 50}px`; // Adjusted higher

    // Toggle the visibility of the popup
    alignPopup.classList.toggle('hidden');
});

document.getElementById('left-align').addEventListener('click', function () {
    restoreSelection();
    document.execCommand('justifyLeft', false, null);
    document.getElementById('alignPopup').classList.add('hidden'); // Hide the popup after selection
});

document.getElementById('center-align').addEventListener('click', function () {
    restoreSelection();
    document.execCommand('justifyCenter', false, null);
    document.getElementById('alignPopup').classList.add('hidden'); // Hide the popup after selection
});

document.getElementById('right-align').addEventListener('click', function () {
    restoreSelection();
    document.execCommand('justifyRight', false, null);
    document.getElementById('alignPopup').classList.add('hidden'); // Hide the popup after selection
});

// Bullet Points & Numbered List buttons //

// Bullet List Button
document.getElementById('bullet-list-tool').addEventListener('click', function (e) {
    e.preventDefault(); // Prevent default to maintain focus
    saveSelection(); // Save the current selection

    // Toggle bullet list on the selected text or current line
    document.execCommand('insertUnorderedList', false, null);

    // Restore the selection after applying the command
    restoreSelection();
});

// Numbered List Button
document.getElementById('numbered-list-tool').addEventListener('click', function (e) {
    e.preventDefault(); // Prevent default to maintain focus
    saveSelection(); // Save the current selection

    // Toggle numbered list on the selected text or current line
    document.execCommand('insertOrderedList', false, null);

    // Restore the selection after applying the command
    restoreSelection();
});

// TAB KEYBOARD FUNCTIONALITY WHILE EDITING TEXT AREA //
document.getElementById('entry-text').addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
        e.preventDefault(); // Prevent the default tab behavior
        
        // Insert tab space (you can customize the space as needed)
        document.execCommand('insertText', false, '    '); // Inserting 4 spaces
    }
});

// Update the preview text (REMOVE HTML TAGS AND STUFF LIKE THAT)
function updateEntryPreview(entryData, entryIndex) {
    const entryElement = entryList.children[entryIndex];
    if (!entryElement) return;

    // Create a temporary element to parse and extract text content with line breaks
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = entryData.text;

    // Convert <p>, <div>, and <br> tags to newline characters
    let previewText = tempDiv.innerHTML
        .replace(/<\/p>|<\/div>/gi, '\n')
        .replace(/<p>|<div>/gi, '') // Handles paragraphs created by ENTER key
        .replace(/<br\s*\/?>/gi, '\n') // Handles line breaks created by SHIFT + ENTER
        .replace(/&nbsp;/g, " "); // Replace non-breaking spaces with actual spaces

    // Remove any remaining HTML tags
    previewText = previewText.replace(/<\/?[^>]+(>|$)/g, "");

    // Update the preview text with the extracted content
    entryElement.querySelector('.entry-preview').textContent = previewText.length > 60 ? previewText.substring(0, 60) + '...' : previewText;
}

// EMOJI KEYBOARD

document.addEventListener('DOMContentLoaded', () => {
    const emojiBtn = document.getElementById('emoji-btn');
    const emojiPicker = document.getElementById('emoji-picker');
    const entryTextDiv = document.getElementById('entry-text');
    
    let currentSelection; // To store the current cursor position

    // Save the cursor position when the text area is focused or clicked
    entryTextDiv.addEventListener('mouseup', saveSelection);
    entryTextDiv.addEventListener('keyup', saveSelection);

    function saveSelection() {
        if (window.getSelection) {
            currentSelection = window.getSelection().getRangeAt(0);
        }
    }

    // Toggle emoji picker visibility
    emojiBtn.addEventListener('click', function (e) {
        e.preventDefault(); // Prevent any default actions
        const rect = emojiBtn.getBoundingClientRect();
        
        // Calculate the position above the button
        const pickerHeight = emojiPicker.offsetHeight;
        const topPosition = rect.top + window.scrollY - pickerHeight - 170; 
        const leftPosition = rect.left + window.scrollX - 90;

        // Apply the calculated positions
        emojiPicker.style.left = `${leftPosition}px`;
        emojiPicker.style.top = `${topPosition}px`;

        // Picker is visible within the viewport
        if (topPosition < 0) {
            emojiPicker.style.top = `${rect.bottom + window.scrollY + 10}px`; 
        }

        emojiPicker.classList.toggle('hidden');
    });

    // Insert emoji into the text area when clicked
    emojiPicker.addEventListener('click', function (e) {
        if (e.target.classList.contains('emoji')) {
            if (currentSelection) {
                // Restore the selection and insert the emoji at the cursor position
                entryTextDiv.focus();
                currentSelection.deleteContents();
                const emojiNode = document.createTextNode(e.target.textContent);
                currentSelection.insertNode(emojiNode);
                
                // Move the cursor after the inserted emoji
                currentSelection.setStartAfter(emojiNode);
                currentSelection.setEndAfter(emojiNode);
                currentSelection.collapse(false);
                window.getSelection().removeAllRanges();
                window.getSelection().addRange(currentSelection);
            }
            emojiPicker.classList.add('hidden'); // Hide the picker after selection
        }
    });

    // Hide the emoji picker if clicking outside
    document.addEventListener('click', function (event) {
        if (!emojiPicker.contains(event.target) && !emojiBtn.contains(event.target)) {
            emojiPicker.classList.add('hidden');
        }
    });
});