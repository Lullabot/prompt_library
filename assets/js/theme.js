// Theme management
const STORAGE_KEY = 'theme-preference';
const DARK_CLASS = 'dark-theme';

function getColorPreference() {
    if (localStorage.getItem(STORAGE_KEY)) {
        return localStorage.getItem(STORAGE_KEY);
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function setTheme(theme) {
    localStorage.setItem(STORAGE_KEY, theme);
    reflectTheme(theme);
}

function reflectTheme(theme) {
    document.documentElement.classList.toggle(DARK_CLASS, theme === 'dark');
    document.querySelector('#theme-toggle')?.setAttribute('aria-label', 
        theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
    );
}

// Theme toggle button click handler
function toggleTheme() {
    const currentTheme = getColorPreference();
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
}

// Initialize theme
function initializeTheme() {
    // Set initial theme
    const theme = getColorPreference();
    setTheme(theme);

    // Watch for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', ({ matches }) => {
        if (!localStorage.getItem(STORAGE_KEY)) {
            setTheme(matches ? 'dark' : 'light');
        }
    });
}

// Run initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeTheme);
} else {
    initializeTheme();
} 