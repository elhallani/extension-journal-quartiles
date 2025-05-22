// Handle quartile filter selection
const radios = document.querySelectorAll('input[name="quartile-filter"]');
radios.forEach(radio => {
  radio.addEventListener('change', () => {
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
      chrome.tabs.sendMessage(tabs[0].id, {type: 'SET_FILTER', value: radio.value});
    });
  });
});

// Handle sort button
const sortBtn = document.getElementById('sort-btn');
sortBtn.addEventListener('click', () => {
  chrome.tabs.query({active: true, currentWindow: true}, tabs => {
    chrome.tabs.sendMessage(tabs[0].id, {type: 'SORT_BY_QUARTILE'});
  });
});

// Handle export button
const exportBtn = document.getElementById('export-btn');
exportBtn.addEventListener('click', () => {
  chrome.tabs.query({active: true, currentWindow: true}, tabs => {
    chrome.tabs.sendMessage(tabs[0].id, {type: 'EXPORT_CSV'});
  });
});
