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

    // Fetch search index
    fetch('/search-index.json')
        .then(response => response.json())
        .then(data => {
            searchIndex = data;
        })
        .catch(error => {
            console.error('Error loading search index:', error);
        });

    function performSearch(query) {
        if (!query || query.length < 2) {
            searchResults.innerHTML = '';
            searchResults.style.display = 'none';
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
        if (results.length === 0) {
            searchResults.innerHTML = '<div class="no-results">No results found</div>';
            searchResults.style.display = 'block';
            return;
        }

        const html = results.map(result => `
            <div class="search-result">
                <a href="${result.url}" class="result-link">
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
        searchResults.style.display = 'block';
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
            searchResults.style.display = 'none';
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