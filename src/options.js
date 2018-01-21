// This code was just copied from the example for chrome.storage in the docs. 

// Saves options to chrome.storage.sync.
function save_options() {
    const todoKey = document.getElementById('todoKey').value;
    const calIds = document.getElementById('calIds').value;
    chrome.storage.sync.set({
        todoKey: todoKey,
        calIds: calIds
    }, function() {
        // Update status to let user know options were saved.
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function() {
            status.textContent = '';
        }, 750);
    });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
    // Use default value empty string
    chrome.storage.sync.get({
        todoKey: "",
        calIds: ""
    }, function(items) {
        document.getElementById('todoKey').value = items.todoKey;
        document.getElementById('calIds').value = items.calIds;
    });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);