'use strict';

// Site behavior: theme toggle state, the compact menu, copy buttons and
// search. Loaded with `defer`, so the document is parsed when this runs.
(function () {
    const baseUrl = document.querySelector('meta[name="base-url"]')?.getAttribute('content') || '';

    function escapeHtml(value) {
        return String(value ?? '').replace(/[&<>"']/g, (ch) => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
        }[ch]));
    }

    // Join a site path onto the base URL without doubling it.
    function getFullUrl(url) {
        if (!url) return url;
        if (baseUrl) {
            url = url.replace(new RegExp(`^(?:${baseUrl}/?)+`), '');
        }
        url = url.replace(/^\/+/, '');
        return baseUrl ? `${baseUrl}/${url}` : `/${url}`;
    }

    // ---- Theme toggle -----------------------------------------------------
    // theme.js keeps aria-pressed in sync after a toggle; this sets the
    // starting state.
    if (window.dsTheme) {
        document.querySelectorAll('.ds-theme-toggle').forEach((button) => {
            button.setAttribute('aria-pressed', window.dsTheme.current === 'dark' ? 'true' : 'false');
        });
    }

    // ---- Compact menu -----------------------------------------------------
    const menu = document.querySelector('.pl-menu');
    if (menu) {
        document.addEventListener('click', (event) => {
            if (menu.open && !menu.contains(event.target)) menu.open = false;
        });
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && menu.open) {
                menu.open = false;
                menu.querySelector('summary')?.focus();
            }
        });
    }

    // ---- Copy buttons -----------------------------------------------------
    // Any button with data-copy="text". The label inside [data-copy-label]
    // (or the button itself) flashes the result.
    function copyText(text) {
        const fallback = () => {
            const area = document.createElement('textarea');
            area.value = text;
            area.setAttribute('readonly', '');
            area.style.position = 'absolute';
            area.style.left = '-9999px';
            document.body.appendChild(area);
            area.select();
            let ok = false;
            try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
            document.body.removeChild(area);
            return ok ? Promise.resolve() : Promise.reject(new Error('copy failed'));
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(text).catch(fallback);
        }
        return fallback();
    }

    function wireCopyButton(button, getText) {
        const label = button.querySelector('[data-copy-label]') || button;
        const original = label.textContent;
        let timer;
        button.addEventListener('click', () => {
            const flash = (text) => {
                label.textContent = text;
                clearTimeout(timer);
                timer = setTimeout(() => { label.textContent = original; }, 1600);
            };
            copyText(getText()).then(() => flash('Copied'), () => flash('Copy failed'));
        });
    }

    document.querySelectorAll('button[data-copy]').forEach((button) => {
        wireCopyButton(button, () => button.getAttribute('data-copy') || '');
    });

    // Every code block in rendered content gets a copy button.
    document.querySelectorAll('.pl-prose pre').forEach((pre) => {
        const code = pre.querySelector('code');
        if (!code) return;
        const wrapper = document.createElement('div');
        wrapper.className = 'pl-code';
        pre.parentNode.insertBefore(wrapper, pre);
        wrapper.appendChild(pre);
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'ds-btn ds-btn-secondary pl-code__copy';
        button.textContent = 'Copy';
        wrapper.appendChild(button);
        wireCopyButton(button, () => code.textContent);
    });

    // ---- Search -----------------------------------------------------------
    const searchForm = document.querySelector('.search-form');
    const searchInput = document.querySelector('.search-input');
    const searchResults = document.querySelector('.search-results');
    if (!searchForm || !searchInput || !searchResults) return;

    let searchIndex = [];
    let debounceTimeout;

    fetch(getFullUrl('search-index.json'))
        .then((response) => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then((data) => { searchIndex = data; })
        .catch((error) => {
            console.error('Error loading search index:', error);
            searchResults.innerHTML = '<p class="pl-search-message ds-body-sm">Search is currently unavailable.</p>';
        });

    // Normalize hyphens vs spaces so a "Content Strategy" chip matches
    // content-strategy items.
    const normalize = (s) => String(s || '').toLowerCase().replace(/[-_\s]+/g, ' ').trim();

    function performSearch(query) {
        if (!query || query.length < 2) {
            searchResults.hidden = true;
            return;
        }

        const queryLower = query.toLowerCase();
        const normQuery = normalize(query);

        const results = searchIndex
            .map((item) => {
                const title = String(item.title || '');
                const description = String(item.description || '');
                const content = String(item.content || '');
                const tags = Array.isArray(item.tags) ? item.tags.map((tag) => String(tag || '')) : [];

                const score =
                    (title.toLowerCase().includes(queryLower) ? 3 : 0) +
                    (description.toLowerCase().includes(queryLower) ? 2 : 0) +
                    (content.toLowerCase().includes(queryLower) ? 1 : 0) +
                    (tags.some((tag) => tag.toLowerCase().includes(queryLower)) ? 2 : 0) +
                    (normQuery && normalize(item.discipline).includes(normQuery) ? 2 : 0) +
                    (normQuery && normalize(item.contentType).includes(normQuery) ? 2 : 0);

                return { ...item, score };
            })
            .filter((item) => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);

        displayResults(results);
    }

    function displayResults(results) {
        searchResults.hidden = false;

        if (results.length === 0) {
            searchResults.innerHTML = '<p class="pl-search-message ds-body-sm">No results found. Try a broader term.</p>';
            return;
        }

        searchResults.innerHTML = results.map((result) => {
            const meta = [result.discipline, result.contentType].filter(Boolean).map(normalize).join(' / ');
            const tags = Array.isArray(result.tags) ? result.tags.filter(Boolean).join(', ') : '';
            return `
            <div class="search-result">
                <a href="${escapeHtml(getFullUrl(result.url))}" class="pl-result result-link ds-body-sm">
                    <span class="pl-result__title">${escapeHtml(result.title)}</span>
                    ${meta ? `<span class="pl-result__meta ds-label-caps ds-muted">${escapeHtml(meta)}</span>` : ''}
                    <span class="pl-result__desc">${escapeHtml(result.description)}</span>
                    ${tags ? `<span class="pl-result__desc ds-hint">${escapeHtml(tags)}</span>` : ''}
                </a>
            </div>`;
        }).join('');
    }

    const chips = document.querySelectorAll('.pl-chip[data-query]');
    const pressChip = (active) => {
        chips.forEach((chip) => chip.setAttribute('aria-pressed', chip === active ? 'true' : 'false'));
    };

    searchForm.addEventListener('submit', (event) => {
        event.preventDefault();
        performSearch(searchInput.value);
    });

    searchInput.addEventListener('input', (event) => {
        // Typing by hand clears whichever quick-search chip was pressed.
        if (event.isTrusted) pressChip(null);
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => performSearch(searchInput.value), 300);
    });

    // Quick-search chips fill the field and run the search.
    chips.forEach((chip) => {
        chip.addEventListener('click', () => {
            pressChip(chip);
            searchInput.value = chip.dataset.query || chip.textContent.trim();
            searchInput.dispatchEvent(new Event('input', { bubbles: true }));
            searchInput.focus();
        });
    });

    // Close results when clicking outside. Chips are outside the form but
    // drive the search, so they don't count.
    document.addEventListener('click', (event) => {
        if (searchForm.contains(event.target) || searchResults.contains(event.target)) return;
        if (event.target.closest && event.target.closest('.pl-chip')) return;
        searchResults.hidden = true;
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !searchResults.hidden) {
            searchResults.hidden = true;
            searchInput.focus();
        }
    });

    // Arrow keys move between results.
    searchResults.addEventListener('keydown', (event) => {
        if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
        event.preventDefault();
        const links = Array.from(searchResults.querySelectorAll('.result-link'));
        const currentIndex = links.indexOf(document.activeElement);
        const nextIndex = event.key === 'ArrowDown'
            ? (currentIndex < links.length - 1 ? currentIndex + 1 : 0)
            : (currentIndex > 0 ? currentIndex - 1 : links.length - 1);
        links[nextIndex]?.focus();
    });
})();
