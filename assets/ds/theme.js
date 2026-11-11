/* Light/dark theme for the Lullabot app design system.

   Put this in <head>, inline or as a blocking <script src>, before any
   stylesheet, so data-theme is set before first paint and the page never
   flashes the wrong theme:

     <script src="theme.js" data-storage-key="myapp-theme"></script>

   It resolves the theme from the visitor's saved choice, falling back to the
   system preference, and writes data-theme on <html>. It also exposes
   window.dsTheme for a toggle button:

     <button type="button" class="ds-theme-toggle"
             onclick="dsTheme.toggle()" aria-pressed="false">Dark mode</button>

   With JavaScript off nothing is written, and the prefers-color-scheme block
   in tokens.css takes over. */
(function () {
    var script = document.currentScript;
    var key = (script && script.dataset.storageKey) || 'ds-theme';
    var root = document.documentElement;

    var theme = 'light';
    try {
        var stored = window.localStorage.getItem(key);
        theme = (stored === 'light' || stored === 'dark')
            ? stored
            : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    } catch (e) {
        // Storage can throw in private windows; fall back to light.
    }
    root.setAttribute('data-theme', theme);

    window.dsTheme = {
        get current() {
            return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
        },
        set(value) {
            root.setAttribute('data-theme', value);
            try {
                window.localStorage.setItem(key, value);
            } catch (e) {
                // The choice still applies to this page view; it just will
                // not be remembered.
            }
            document.querySelectorAll('.ds-theme-toggle').forEach(function (button) {
                button.setAttribute('aria-pressed', value === 'dark' ? 'true' : 'false');
            });
        },
        toggle() {
            this.set(this.current === 'dark' ? 'light' : 'dark');
        },
    };
})();
