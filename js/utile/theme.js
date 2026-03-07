// === THEME MANAGER - LanorTrad ===
// Loaded synchronously in <head> to prevent flash of wrong theme.

(function () {
  'use strict';

  var STORAGE_KEY = 'lanortrad_theme';
  var DEFAULTS = { accent: 'indigo', mode: 'dark' };

  var ACCENTS = ['indigo', 'red', 'green', 'blue', 'purple', 'amber', 'rose', 'teal'];
  var ACCENT_LABELS = {
    indigo: 'Indigo', red: 'Rouge', green: 'Vert', blue: 'Bleu',
    purple: 'Violet', amber: 'Ambre', rose: 'Rose', teal: 'Teal'
  };
  var ACCENT_COLORS = {
    indigo: '#4f46e5', red: '#dc2626', green: '#16a34a', blue: '#2563eb',
    purple: '#7c3aed', amber: '#d97706', rose: '#e11d48', teal: '#0d9488'
  };

  function getPrefs() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        var parsed = JSON.parse(stored);
        return {
          accent: ACCENTS.indexOf(parsed.accent) !== -1 ? parsed.accent : DEFAULTS.accent,
          mode: parsed.mode === 'light' ? 'light' : 'dark'
        };
      }
    } catch (e) { }
    return { accent: DEFAULTS.accent, mode: DEFAULTS.mode };
  }

  function savePrefs(prefs) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)); } catch (e) { }
  }

  function applyTheme(prefs) {
    var root = document.documentElement;
    root.setAttribute('data-accent', prefs.accent);
    root.setAttribute('data-mode', prefs.mode);
  }

  // Apply immediately (before DOM renders)
  var prefs = getPrefs();
  applyTheme(prefs);

  // =====================================================================
  // THEME PICKER UI (injected after DOM ready)
  // =====================================================================
  function injectThemePicker() {
    // Desktop: add button to navbar
    var desktopNav = document.querySelector('nav .hidden.md\\:flex');
    if (desktopNav) {
      var wrapper = document.createElement('div');
      wrapper.className = 'relative';
      wrapper.innerHTML =
        '<button id="theme-toggle-btn" class="p-2 rounded-lg hover:bg-gray-800 transition-colors text-gray-300 hover:text-white" aria-label="Changer le theme">' +
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>' +
        '</button>';

      // Insert before Discord button
      var discordLink = desktopNav.querySelector('a[href*="discord"]');
      if (discordLink) {
        desktopNav.insertBefore(wrapper, discordLink);
      } else {
        desktopNav.appendChild(wrapper);
      }

      // Create dropdown
      var dropdown = document.createElement('div');
      dropdown.id = 'theme-picker';
      dropdown.className = 'hidden';
      dropdown.style.cssText = 'position:absolute;top:calc(100% + 8px);right:0;width:260px;padding:1rem;border-radius:12px;z-index:9999;border:1px solid var(--border-default, rgba(255,255,255,0.1));box-shadow:0 20px 50px rgba(0,0,0,0.5);background:var(--bg-card, #111827);backdrop-filter:blur(12px);';

      var currentPrefs = getPrefs();
      dropdown.innerHTML = buildPickerHTML(currentPrefs);
      wrapper.appendChild(dropdown);

      // Toggle dropdown
      var btn = document.getElementById('theme-toggle-btn');
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        dropdown.classList.toggle('hidden');
      });

      // Close on outside click
      document.addEventListener('click', function (e) {
        if (!wrapper.contains(e.target)) {
          dropdown.classList.add('hidden');
        }
      });

      // Bind picker events
      bindPickerEvents(dropdown);
    }

    // Mobile sidebar: add theme section
    var sidebar = document.getElementById('mobile-sidebar');
    if (sidebar) {
      var sidebarSearch = sidebar.querySelector('.sidebar-search');
      if (sidebarSearch) {
        var themeSection = document.createElement('div');
        themeSection.className = 'sidebar-theme';
        themeSection.style.cssText = 'padding:0.75rem 1.5rem;border-top:1px solid rgba(255,255,255,0.08);';
        var cp = getPrefs();
        themeSection.innerHTML =
          '<div style="font-size:0.8rem;font-weight:600;color:var(--text-secondary,#9ca3af);margin-bottom:0.5rem;text-transform:uppercase;letter-spacing:0.05em;">Theme</div>' +
          '<div class="theme-accent-grid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:0.4rem;margin-bottom:0.75rem;">' +
          buildAccentSwatches(cp.accent) +
          '</div>' +
          '<div class="theme-mode-btns" style="display:flex;gap:0.25rem;background:rgba(31,41,55,0.6);padding:0.25rem;border-radius:8px;">' +
          '<button data-set-mode="dark" style="flex:1;padding:0.4rem;border:none;border-radius:6px;font-size:0.75rem;cursor:pointer;transition:all 0.2s;' + (cp.mode === 'dark' ? 'background:var(--primary,#4f46e5);color:white;' : 'background:transparent;color:var(--text-secondary,#9ca3af);') + '">Sombre</button>' +
          '<button data-set-mode="light" style="flex:1;padding:0.4rem;border:none;border-radius:6px;font-size:0.75rem;cursor:pointer;transition:all 0.2s;' + (cp.mode === 'light' ? 'background:var(--primary,#4f46e5);color:white;' : 'background:transparent;color:var(--text-secondary,#9ca3af);') + '">Clair</button>' +
          '</div>';
        sidebar.insertBefore(themeSection, sidebarSearch);
        bindPickerEvents(themeSection);
      }
    }
  }

  function buildPickerHTML(prefs) {
    return '<div style="font-size:0.8rem;font-weight:600;color:var(--text-secondary,#9ca3af);margin-bottom:0.5rem;">Couleur d\'accent</div>' +
      '<div class="theme-accent-grid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:0.4rem;margin-bottom:1rem;">' +
      buildAccentSwatches(prefs.accent) +
      '</div>' +
      '<div style="font-size:0.8rem;font-weight:600;color:var(--text-secondary,#9ca3af);margin-bottom:0.5rem;">Mode d\'affichage</div>' +
      '<div class="theme-mode-btns" style="display:flex;gap:0.25rem;background:rgba(31,41,55,0.6);padding:0.25rem;border-radius:8px;">' +
      '<button data-set-mode="dark" style="flex:1;padding:0.5rem;border:none;border-radius:6px;font-size:0.8rem;font-weight:500;cursor:pointer;transition:all 0.2s;' + (prefs.mode === 'dark' ? 'background:var(--primary,#4f46e5);color:white;' : 'background:transparent;color:var(--text-secondary,#9ca3af);') + '">Sombre</button>' +
      '<button data-set-mode="light" style="flex:1;padding:0.5rem;border:none;border-radius:6px;font-size:0.8rem;font-weight:500;cursor:pointer;transition:all 0.2s;' + (prefs.mode === 'light' ? 'background:var(--primary,#4f46e5);color:white;' : 'background:transparent;color:var(--text-secondary,#9ca3af);') + '">Clair</button>' +
      '</div>';
  }

  function buildAccentSwatches(currentAccent) {
    var html = '';
    for (var i = 0; i < ACCENTS.length; i++) {
      var name = ACCENTS[i];
      var color = ACCENT_COLORS[name];
      var isActive = name === currentAccent;
      html += '<button data-set-accent="' + name + '" title="' + ACCENT_LABELS[name] + '" style="' +
        'width:100%;aspect-ratio:1;border-radius:8px;border:2px solid ' + (isActive ? 'white' : 'transparent') + ';' +
        'background:' + color + ';cursor:pointer;transition:all 0.2s;position:relative;' +
        '">' +
        (isActive ? '<span style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:white;font-size:0.7rem;">&#10003;</span>' : '') +
        '</button>';
    }
    return html;
  }

  function bindPickerEvents(container) {
    container.addEventListener('click', function (e) {
      var accentBtn = e.target.closest('[data-set-accent]');
      var modeBtn = e.target.closest('[data-set-mode]');

      if (accentBtn) {
        var accent = accentBtn.getAttribute('data-set-accent');
        window.LTTheme.setAccent(accent);
        refreshAllPickers();
      }

      if (modeBtn) {
        var mode = modeBtn.getAttribute('data-set-mode');
        window.LTTheme.setMode(mode);
        refreshAllPickers();
      }
    });
  }

  function refreshAllPickers() {
    var p = getPrefs();
    // Refresh desktop picker
    var desktop = document.getElementById('theme-picker');
    if (desktop) desktop.innerHTML = buildPickerHTML(p);

    // Refresh sidebar picker
    var sidebarTheme = document.querySelector('.sidebar-theme');
    if (sidebarTheme) {
      var grid = sidebarTheme.querySelector('.theme-accent-grid');
      if (grid) grid.innerHTML = buildAccentSwatches(p.accent);
      var modeBtns = sidebarTheme.querySelectorAll('[data-set-mode]');
      modeBtns.forEach(function (btn) {
        var isActive = btn.getAttribute('data-set-mode') === p.mode;
        btn.style.background = isActive ? 'var(--primary,#4f46e5)' : 'transparent';
        btn.style.color = isActive ? 'white' : 'var(--text-secondary,#9ca3af)';
      });
    }

    // Re-bind events on desktop since innerHTML was replaced
    if (desktop) bindPickerEvents(desktop);
  }

  // Public API
  window.LTTheme = {
    getPrefs: getPrefs,
    setAccent: function (accent) {
      if (ACCENTS.indexOf(accent) === -1) return;
      var p = getPrefs();
      p.accent = accent;
      savePrefs(p);
      applyTheme(p);
    },
    setMode: function (mode) {
      if (mode !== 'dark' && mode !== 'light') return;
      var p = getPrefs();
      p.mode = mode;
      savePrefs(p);
      applyTheme(p);
    },
    toggleMode: function () {
      var p = getPrefs();
      p.mode = p.mode === 'dark' ? 'light' : 'dark';
      savePrefs(p);
      applyTheme(p);
      return p.mode;
    },
    ACCENTS: ACCENTS,
    ACCENT_LABELS: ACCENT_LABELS,
    ACCENT_COLORS: ACCENT_COLORS
  };

  // Inject UI after DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(injectThemePicker, 100);
    });
  } else {
    setTimeout(injectThemePicker, 100);
  }
})();
