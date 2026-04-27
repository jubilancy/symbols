let allItems = [];

async function loadData() {
    try {
        const response = await fetch('data.json');
        allItems = await response.json();
        displayItems(allItems);
        updateCount(allItems.length);
    } catch (error) {
        document.getElementById('results').innerHTML = 
            '<div class="no-results">Error loading data. Make sure data.json exists.</div>';
        console.error('Error:', error);
    }
}

function displayItems(items) {
    const container = document.getElementById('results');
    
    if (items.length === 0) {
        container.innerHTML = '<div class="no-results">No items found. Try a different search!</div>';
        return;
    }
    
    container.innerHTML = items.map(item => `
        <div class="item-card" onclick="copyToClipboard('${escapeJs(item.value)}', '${escapeJs(item.key)}')">
            <div class="copy-hint">Click to copy</div>
            <div class="item-key">${escapeHtml(item.key)}</div>
            <div class="item-value">${escapeHtml(item.value)}</div>
        </div>
    `).join('');
}

function updateCount(count) {
    document.getElementById('count').textContent = 
        count === allItems.length 
            ? `${count} items` 
            : `Found ${count} of ${allItems.length} items`;
}

function copyToClipboard(text, key) {
    navigator.clipboard.writeText(text).then(() => {
        const msg = document.createElement('div');
        msg.className = 'copied-msg';
        msg.textContent = `Copied "${key}"!`;
        document.body.appendChild(msg);
        
        setTimeout(() => msg.remove(), 2000);
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function escapeJs(text) {
    return text.replace(/'/g, "\\'").replace(/"/g, '\\"');
}

document.getElementById('search').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    
    const filtered = allItems.filter(item => 
        item.key.toLowerCase().includes(query) ||
        item.value.toLowerCase().includes(query)
    );
    
    displayItems(filtered);
    updateCount(filtered.length);
});

loadData();