// Add smooth scrolling to all links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Add active class to current navigation item
document.addEventListener('DOMContentLoaded', function() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
    let searchIndex = [];
    const searchForm = document.querySelector('.search-form');
    const searchInput = document.querySelector('.search-input');
    const searchResults = document.querySelector('.search-results');
    const markdownModal = document.querySelector('.markdown-modal');
    let debounceTimeout;

    // Get base URL from meta tag or default to empty string
    const baseUrl = document.querySelector('meta[name="base-url"]')?.getAttribute('content') || '';

    // Function to ensure URL has correct base
    function getFullUrl(url) {
        if (!url) return url;
        
        // Remove the baseUrl if it's already in the url (to prevent duplication)
        if (baseUrl) {
            // Remove any number of occurrences of baseUrl from the start
            const baseUrlPattern = new RegExp(`^(?:${baseUrl}/?)+`);
            url = url.replace(baseUrlPattern, '');
        }
        
        // Remove any leading slashes
        url = url.replace(/^\/+/, '');
        
        // If baseUrl is empty, just return the cleaned url
        if (!baseUrl) return '/' + url;
        
        // Otherwise, properly join baseUrl with the cleaned url
        return `${baseUrl}/${url}`;
    }

    // Fetch search index
    fetch(getFullUrl('search-index.json'))
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            searchIndex = data;
            console.log('Search index loaded successfully');
        })
        .catch(error => {
            console.error('Error loading search index:', error);
            searchResults.innerHTML = '<div class="no-results">Search is currently unavailable</div>';
        });

    function performSearch(query) {
        if (!query || query.length < 2) {
            searchResults.hidden = true;
            return;
        }

        const queryLower = query.toLowerCase();
        const results = searchIndex
            .map(item => {
                // Ensure all values are strings before calling toLowerCase()
                const title = String(item.title || '');
                const description = String(item.description || '');
                const content = String(item.content || '');
                const tags = Array.isArray(item.tags) ? item.tags.map(tag => String(tag || '')) : [];

                const titleScore = title.toLowerCase().includes(queryLower) ? 3 : 0;
                const descriptionScore = description.toLowerCase().includes(queryLower) ? 2 : 0;
                const contentScore = content.toLowerCase().includes(queryLower) ? 1 : 0;
                const tagScore = tags.some(tag => tag.toLowerCase().includes(queryLower)) ? 2 : 0;
                
                const totalScore = titleScore + descriptionScore + contentScore + tagScore;
                
                return {
                    ...item,
                    score: totalScore
                };
            })
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);

        displayResults(results);
    }

    function displayResults(results) {
        searchResults.hidden = false;
        
        if (results.length === 0) {
            searchResults.innerHTML = '<div class="no-results">No results found</div>';
            return;
        }

        const html = results.map(result => `
            <div class="search-result">
                <a href="${getFullUrl(result.url)}" class="result-link">
                    <h3 class="result-title">${result.title || ''}</h3>
                    <div class="result-meta">
                        <span class="result-discipline">${result.discipline || ''}</span>
                        <span class="result-type">${result.contentType || ''}</span>
                    </div>
                    <p class="result-description">${result.description || ''}</p>
                    ${Array.isArray(result.tags) && result.tags.length ? `
                        <div class="result-tags">
                            ${result.tags.map(tag => `<span class="tag">${tag || ''}</span>`).join('')}
                        </div>
                    ` : ''}
                </a>
            </div>
        `).join('');

        searchResults.innerHTML = html;
    }

    // Event listeners
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        performSearch(searchInput.value);
    });

    searchInput.addEventListener('input', function() {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            performSearch(searchInput.value);
        }, 300);
    });

    // Close results when clicking outside
    document.addEventListener('click', function(e) {
        if (!searchForm.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.hidden = true;
        }
    });

    // Keyboard navigation
    searchResults.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            const links = searchResults.querySelectorAll('.result-link');
            const currentIndex = Array.from(links).indexOf(document.activeElement);
            let nextIndex;

            if (e.key === 'ArrowDown') {
                nextIndex = currentIndex < links.length - 1 ? currentIndex + 1 : 0;
            } else {
                nextIndex = currentIndex > 0 ? currentIndex - 1 : links.length - 1;
            }

            links[nextIndex].focus();
        }
    });
}); 