const PAGE_SIZE = 300;
const BASE = window.BASE || '/';

let allItems = [];
let categories = [];   // [{ name, slug, count }]
let activeSlug = '';   // '' = all
let query = '';
let filtered = [];
let shown = 0;

const slugify = (name) =>
    name.toLowerCase().replace(/&/g, ' ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const slugFromPath = () =>
    decodeURIComponent(location.pathname.slice(BASE.length)).split('/').filter(Boolean)[0] || '';

async function loadData() {
    try {
        const response = await fetch('data.json');
        allItems = await response.json();

        const counts = new Map();
        allItems.forEach(item => {
            const name = item.category || 'Uncategorized';
            counts.set(name, (counts.get(name) || 0) + 1);
        });
        categories = [...counts]
            .map(([name, count]) => ({ name, slug: slugify(name), count }))
            .sort((a, b) => b.count - a.count);

        activeSlug = slugFromPath();
        renderChips();
        applyFilters();
    } catch (error) {
        document.getElementById('results').innerHTML =
            '<div class="no-results">couldn\'t load data.json</div>';
        console.error('Error:', error);
    }
}

function renderChips() {
    const chip = (slug, label, count) =>
        `<a class="chip${slug === activeSlug ? ' active' : ''}" href="${BASE}${slug ? slug + '/' : ''}" data-slug="${escapeHtml(slug)}">` +
        `${escapeHtml(label)}<small>${count}</small></a>`;

    document.getElementById('chips').innerHTML =
        chip('', 'all', allItems.length) +
        categories.map(c => chip(c.slug, c.name.toLowerCase(), c.count)).join('');
}

function applyFilters() {
    const cat = categories.find(c => c.slug === activeSlug);
    const q = query.toLowerCase();

    filtered = allItems.filter(item =>
        (!cat || (item.category || 'Uncategorized') === cat.name) &&
        (!q || item.key.toLowerCase().includes(q) || item.value.toLowerCase().includes(q))
    );
    shown = 0;
    document.getElementById('results').innerHTML = '';
    renderMore();
    updateCount(filtered.length);

    document.title = cat ? `${cat.name.toLowerCase()} · symbols` : 'symbols';
}

function renderMore() {
    const container = document.getElementById('results');
    container.querySelector('.more-btn')?.remove();

    if (filtered.length === 0) {
        container.innerHTML = '<div class="no-results">no matches</div>';
        return;
    }

    const end = Math.min(shown + PAGE_SIZE, filtered.length);
    const html = filtered.slice(shown, end).map((item, i) => `
        <div class="item-card" data-i="${shown + i}">
            <div class="item-key">${escapeHtml(item.key)}</div>
            <div class="item-value">${escapeHtml(item.value)}</div>
        </div>
    `).join('');
    container.insertAdjacentHTML('beforeend', html);
    shown = end;

    if (shown < filtered.length) {
        container.insertAdjacentHTML('beforeend',
            `<button class="more-btn" id="more">show more (${filtered.length - shown} left)</button>`);
    }
}

function updateCount(count) {
    const cat = categories.find(c => c.slug === activeSlug);
    const total = cat ? cat.count : allItems.length;
    document.getElementById('count').textContent =
        count === total ? `${count} items` : `${count} of ${total}`;
}

function setCategory(slug, push = true) {
    activeSlug = slug;
    if (push) history.pushState({}, '', `${BASE}${slug ? slug + '/' : ''}`);
    renderChips();
    applyFilters();
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

document.getElementById('results').addEventListener('click', (e) => {
    if (e.target.closest('#more')) return renderMore();
    const card = e.target.closest('.item-card');
    if (card) {
        const item = filtered[Number(card.dataset.i)];
        copyToClipboard(item.value, item.key);
    }
});

document.getElementById('chips').addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    setCategory(chip.dataset.slug);
});

window.addEventListener('popstate', () => setCategory(slugFromPath(), false));

document.getElementById('search').addEventListener('input', (e) => {
    query = e.target.value;
    applyFilters();
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
