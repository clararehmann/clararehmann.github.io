// mac-components.js — Shared HTML component templates
// Edit this file to update the menu bar, sidebar, and About dialog across all pages.
// Each page calls MacComponents.init({ page: '<pagename>' }) at the bottom of <body>.

const ICONS = 'icons/';

const MacComponents = {

  init(opts = {}) {
    const page = opts.page || 'index';
    this.renderMenuBar(page);
    this.renderAboutDialog();
    this.renderSidebar(page);
    this.renderDesktopIcons(page);
  },

  // ── Menu bar ─────────────────────────────────────────────────────────────

  renderMenuBar(page) {
    const el = document.getElementById('menubar');
    if (!el) return;
    el.innerHTML = this._menuHTML(page);
  },

  _apple() {
    return `
      <div class="menu-parent">
        <div class="menu-item menu-apple" onclick="toggleMenu('apple-dd')">
          <img src="icons/apple.png" style="height:1em;width:1em;">
        </div>
        <div class="dropdown" id="apple-dd">
          <div class="dropdown-item" onclick="showAboutDialog()">About This Mac...</div>
          <div class="dropdown-separator"></div>
          <div class="dropdown-item">Control Panels</div>
        </div>
      </div>`;
  },

  _goMain() {
    return `
      <div class="menu-parent">
        <div class="menu-item" onclick="toggleMenu('go-dd')">Go</div>
        <div class="dropdown" id="go-dd">
          <div class="dropdown-item" onclick="window.location.href='index.html'">Home</div>
          <div class="dropdown-item" onclick="window.location.href='research.html'">Research</div>
          <div class="dropdown-item" onclick="window.location.href='publications.html'">Publications</div>
          <div class="dropdown-item" onclick="window.location.href='cv.html'">CV</div>
          <div class="dropdown-item" onclick="window.location.href='contact.html'">Contact</div>
          <div class="dropdown-separator"></div>
          <div class="dropdown-item" onclick="window.location.href='fun.html'">Fun Stuff</div>
        </div>
      </div>`;
  },

  _goFun() {
    return `
      <div class="menu-parent">
        <div class="menu-item" onclick="toggleMenu('go-dd')">Go</div>
        <div class="dropdown" id="go-dd">
          <div class="dropdown-item" onclick="window.location.href='index.html'">Home</div>
          <div class="dropdown-item" onclick="window.location.href='fun.html'">Fun Stuff</div>
          <div class="dropdown-item" onclick="window.location.href='aeg.html'">Aeg</div>
          <div class="dropdown-item" onclick="window.location.href='art.html'">Art Portfolio</div>
          <div class="dropdown-item" onclick="window.location.href='spotify.html'">Spotify</div>
        </div>
      </div>`;
  },

  _clock() {
    return `<div class="menu-item menu-clock" id="clock">12:00 PM</div>`;
  },

  _fileBasic() {
    return `
      <div class="menu-parent">
        <div class="menu-item" onclick="toggleMenu('file-dd')">File</div>
        <div class="dropdown" id="file-dd">
          <div class="dropdown-item" onclick="window.location.href='index.html'">New Finder Window</div>
          <div class="dropdown-separator"></div>
          <div class="dropdown-item" onclick="window.open('mailto:crehmann@uoregon.edu')">Open Email...</div>
        </div>
      </div>`;
  },

  _menuHTML(page) {
    const a = this._apple(), gm = this._goMain(), gf = this._goFun(), clk = this._clock();

    switch (page) {
      case 'index':
        return a + `
          <div class="menu-parent">
            <div class="menu-item" onclick="toggleMenu('file-dd')">File</div>
            <div class="dropdown" id="file-dd">
              <div class="dropdown-item" onclick="window.location.href='index.html'">New Finder Window</div>
              <div class="dropdown-separator"></div>
              <div class="dropdown-item" onclick="window.open('mailto:crehmann@uoregon.edu')">Open Email...</div>
              <div class="dropdown-item" onclick="window.open('https://github.com/clararehmann')">Open GitHub...</div>
              <div class="dropdown-separator"></div>
              <div class="dropdown-item">Get Info</div>
            </div>
          </div>
          <div class="menu-parent">
            <div class="menu-item" onclick="toggleMenu('edit-dd')">Edit</div>
            <div class="dropdown" id="edit-dd">
              <div class="dropdown-item disabled">Undo</div>
              <div class="dropdown-separator"></div>
              <div class="dropdown-item disabled">Cut</div>
              <div class="dropdown-item disabled">Copy</div>
              <div class="dropdown-item disabled">Paste</div>
            </div>
          </div>` + gm + `
          <div class="menu-parent">
            <div class="menu-item" onclick="toggleMenu('special-dd')">Special</div>
            <div class="dropdown" id="special-dd">
              <div class="dropdown-item">Empty Trash...</div>
              <div class="dropdown-separator"></div>
              <div class="dropdown-item" onclick="alert('Sleep... ZZZ')">Sleep</div>
              <div class="dropdown-item" onclick="location.reload()">Restart...</div>
            </div>
          </div>` + clk;

      case 'research':
        return a + this._fileBasic() + `
          <div class="menu-parent">
            <div class="menu-item" onclick="toggleMenu('view-dd')">View</div>
            <div class="dropdown" id="view-dd">
              <div class="dropdown-item">as Icons ✓</div>
              <div class="dropdown-item" onclick="window.location.href='publications.html'">as List</div>
            </div>
          </div>` + gm + clk;

      case 'publications':
        return a + this._fileBasic() + `
          <div class="menu-parent">
            <div class="menu-item" onclick="toggleMenu('view-dd')">View</div>
            <div class="dropdown" id="view-dd">
              <div class="dropdown-item" onclick="window.location.href='research.html'">as Icons</div>
              <div class="dropdown-item">as List ✓</div>
              <div class="dropdown-separator"></div>
              <div class="dropdown-item" onclick="sortBy('year')">Sort by Year</div>
              <div class="dropdown-item" onclick="sortBy('title')">Sort by Title</div>
              <div class="dropdown-item" onclick="sortBy('journal')">Sort by Journal</div>
            </div>
          </div>` + gm + clk;

      case 'cv':
        return a + `
          <div class="menu-parent">
            <div class="menu-item" onclick="toggleMenu('file-dd')">File</div>
            <div class="dropdown" id="file-dd">
              <div class="dropdown-item" onclick="window.location.href='index.html'">New Finder Window</div>
              <div class="dropdown-separator"></div>
              <div class="dropdown-item" onclick="window.open('https://github.com/clararehmann/crehmann-CV/blob/master/crehmann_CV.pdf')">Open PDF Version...</div>
              <div class="dropdown-separator"></div>
              <div class="dropdown-item" onclick="window.open('mailto:crehmann@uoregon.edu')">Open Email...</div>
            </div>
          </div>` + gm + clk;

      case 'contact':
        return a + this._fileBasic() + gm + clk;

      case 'fun':
        return a + `
          <div class="menu-parent">
            <div class="menu-item" onclick="toggleMenu('file-dd')">File</div>
            <div class="dropdown" id="file-dd">
              <div class="dropdown-item" onclick="window.location.href='index.html'">New Finder Window</div>
              <div class="dropdown-separator"></div>
              <div class="dropdown-item" onclick="window.location.href='aeg.html'">Open Aeg...</div>
              <div class="dropdown-item" onclick="window.location.href='art.html'">Open Art Portfolio...</div>
              <div class="dropdown-item" onclick="window.location.href='spotify.html'">Open Spotify...</div>
            </div>
          </div>` + gm + clk;

      case 'aeg':
      case 'art':
      case 'spotify':
        return a + `
          <div class="menu-parent">
            <div class="menu-item" onclick="toggleMenu('file-dd')">File</div>
            <div class="dropdown" id="file-dd">
              <div class="dropdown-item" onclick="window.location.href='fun.html'">Back to Fun Stuff</div>
              <div class="dropdown-item" onclick="window.location.href='index.html'">New Finder Window</div>
            </div>
          </div>` + gf + clk;

      default:
        return a + gm + clk;
    }
  },

  // ── Sidebar ──────────────────────────────────────────────────────────────

  renderSidebar(page) {
    const el = document.querySelector('.finder-sidebar');
    if (!el) return;

    const isFun = ['fun', 'aeg', 'art', 'spotify'].includes(page);

    const items = [
      { href: 'index.html',        icon: 'finder.png', label: 'About Me',     key: 'index' },
      { divider: true },
      { href: 'research.html',     icon: 'research.png',     label: 'Research',     key: 'research' },
      { href: 'publications.html', icon: 'papers.png',       label: 'Publications', key: 'publications' },
      { href: 'cv.html',           icon: 'file.png',       label: 'CV',           key: 'cv' },
      { href: 'contact.html',      icon: 'contact.png',      label: 'Contact',      key: 'contact' },
      { divider: true },
      { href: 'fun.html',          icon: 'aeg-icon.png',   label: 'Fun Stuff',    key: 'fun' },
    ];

    if (isFun) {
      items.push(
        { divider: true },
        { href: 'aeg.html',     icon: 'aeg-icon.png', label: 'Aeg',     key: 'aeg' },
        { href: 'art.html',     icon: 'art.png',   label: 'Art',     key: 'art' },
        { href: 'spotify.html', icon: 'music.png',  label: 'Spotify', key: 'spotify' }
      );
    } else {
      items.push(
        { divider: true },
        { href: 'mailto:crehmann@uoregon.edu', label: '<img src="icons/mail.png"> Email Me', key: 'email', external: true }
      );
    }

    el.innerHTML = items.map(item => {
      if (item.divider) return '<div class="sidebar-divider"></div>';
      const active = item.key === page ? ' active' : '';
      const onclick = item.external
        ? `onclick="window.open('${item.href}')"`
        : `onclick="window.location.href='${item.href}'"`;
      const img = item.icon ? `<img src="${ICONS}${item.icon}" alt="">` : '';
      return `<div class="sidebar-item${active}" ${onclick}>${img}${item.label}</div>`;
    }).join('');
  },

  // ── Desktop icons ────────────────────────────────────────────────────────

  renderDesktopIcons(page) {
    const desktop = document.getElementById('desktop');
    if (!desktop) return;
    const configs = {
      index:        [
        { icon: 'disk.png',     label: 'Macintosh HD',  action: "window.location.href='index.html'",        top:   8 },
        { icon: 'trash.png',          label: 'Trash',         action: "alert('Trash is empty.')",                  top:  68 },
        { icon: 'research.png',   label: 'Research',      action: "window.location.href='research.html'",      top: 128 },
        { icon: 'papers.png',     label: 'Publications',  action: "window.location.href='publications.html'",  top: 188 },
        { icon: 'aeg-icon.png', label: 'Fun Stuff',     action: "window.location.href='fun.html'",           top: 248 },
      ],
      research:     [
        { icon: 'disk.png',  label: 'Macintosh HD',  action: "window.location.href='index.html'",       top:   8 },
        { icon: 'trash.png',       label: 'Trash',         action: "alert('Trash is empty.')",                 top:  68 },
        { icon: 'papers.png',  label: 'Publications',  action: "window.location.href='publications.html'", top: 128 },
        { icon: 'file.png',  label: 'CV',            action: "window.location.href='cv.html'",           top: 188 },
      ],
      publications: [
        { icon: 'disk.png',   label: 'Macintosh HD', action: "window.location.href='index.html'",      top:   8 },
        { icon: 'trash.png',        label: 'Trash',        action: "alert('Trash is empty.')",                top:  68 },
        { icon: 'research.png', label: 'Research',     action: "window.location.href='research.html'",   top: 128 },
      ],
      cv:           [
        { icon: 'disk.png', label: 'Macintosh HD', action: "window.location.href='index.html'",                                                          top:   8 },
        { icon: 'trash.png',      label: 'Trash',        action: "alert('Trash is empty.')",                                                                    top:  68 },
        { icon: 'file.png', label: 'CV.pdf',       action: "window.open('https://github.com/clararehmann/crehmann-CV/blob/master/crehmann_CV.pdf')",  top: 128 },
      ],
      contact:      [
        { icon: 'disk.png', label: 'Macintosh HD', action: "window.location.href='index.html'", top:  8 },
        { icon: 'trash.png',      label: 'Trash',        action: "alert('Trash is empty.')",           top: 68 },
      ],
      fun:          [
        { icon: 'disk.png', label: 'Macintosh HD', action: "window.location.href='index.html'", top:  8 },
        { icon: 'trash.png',      label: 'Trash',        action: "alert('Trash is empty.')",           top: 68 },
      ],
    };
    const icons = configs[page] || [
      { icon: 'disk.png', label: 'Macintosh HD', action: "window.location.href='index.html'", top: 8 },
    ];
    const html = icons.map(ic => {
      const img = ic.emoji
        ? `<div class="icon-img">${ic.emoji}</div>`
        : `<div class="icon-img"><img src="${ICONS}${ic.icon}" alt="${ic.label}"></div>`;
      return `<div class="desktop-icon" style="right:6px;top:${ic.top}px;" ondblclick="${ic.action}">${img}<span class="icon-label">${ic.label}</span></div>`;
    }).join('');
    desktop.insertAdjacentHTML('afterbegin', html);
  },

  // ── About dialog ─────────────────────────────────────────────────────────

  renderAboutDialog() {
    const div = document.createElement('div');
    div.innerHTML = `
      <div class="dialog-overlay" id="about-dialog-overlay" onclick="hideAboutDialog()">
        <div class="dialog" onclick="event.stopPropagation()">
          <div class="window-titlebar">
            <div class="titlebar-btn" onclick="hideAboutDialog()"></div>
            <div class="window-title">About This Mac</div>
          </div>
          <div class="dialog-content">
            <div class="dialog-logo"><img src="icons/apple.png" style="height:1em;width:1em;"></div>
            <div class="dialog-name">Academic OS 8.1</div>
            <div class="dialog-version">© Clara Rehmann 2026</div>
            <div class="dialog-bar"></div>
            <div class="dialog-info">
              <strong>Clara Rehmann</strong><br>
              PhD Candidate, University of Oregon<br>
              Institute of Ecology and Evolution<br>
              crehmann@uoregon.edu<br><br>
              Built-in Memory: Spatial population genetics<br>
              Version: 2026.04 — Eugene, Oregon
            </div>
            <button class="dialog-btn" onclick="hideAboutDialog()">OK</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(div.firstElementChild);
  }

};
