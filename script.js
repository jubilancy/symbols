let allItems = [];

async function loadData() {
    try {
        const response = await fetch('data.json');
        allItems = await response.json();
        displayItems(allItems);
        updateCount(allItems.length);
    } catch (error) {
        document.getElementById('results').innerHTML =
            '<div class="no-results">couldn\'t load data.json</div>';
        console.error('Error:', error);
    }
}

function displayItems(items) {
    const container = document.getElementById('results');

    if (items.length === 0) {
        container.innerHTML = '<div class="no-results">no matches</div>';
        return;
    }

    container.innerHTML = items.map(item => `
        <div class="item-card" onclick="copyToClipboard('${escapeJs(item.value)}', '${escapeJs(item.key)}')">
            <div class="item-key">${escapeHtml(item.key)}</div>
            <div class="item-value">${escapeHtml(item.value)}</div>
        </div>
    `).join('');
}

function updateCount(count) {
    document.getElementById('count').textContent =
        count === allItems.length
            ? `${count} items`
            : `${count} of ${allItems.length}`;
}

function copyToClipboard(text, key) {
    navigator.clipboard.writeText(text).then(() => {
        const msg = document.createElement('div');
        msg.className = 'copied-msg';
        msg.textContent = `copied "${key}"`;
        document.body.appendChild(msg);

        setTimeout(() => msg.remove(), 1600);
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

// theme toggle, persisted like the quote site
const themeToggle = document.getElementById('theme-toggle');
const root = document.documentElement;

function applyTheme(theme) {
    if (theme === 'dark') {
        root.setAttribute('data-theme', 'dark');
        themeToggle.textContent = 'light';
    } else {
        root.removeAttribute('data-theme');
        themeToggle.textContent = 'dark';
    }
}

const savedTheme = localStorage.getItem('symbols-theme') ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
applyTheme(savedTheme);

themeToggle.addEventListener('click', () => {
    const isDark = root.getAttribute('data-theme') === 'dark';
    const next = isDark ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('symbols-theme', next);
});

loadData();
