// mac-chrome.js — Shared Mac OS 8 UI behavior for clararehmann.github.io
// Behavior file: edit this to change interactive behavior across all pages.

// Clock
function updateClock() {
  const now = new Date();
  let h = now.getHours(), m = now.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  const el = document.getElementById('clock');
  if (el) el.textContent = h + ':' + String(m).padStart(2, '0') + ' ' + ampm;
}
updateClock();
setInterval(updateClock, 1000);

// Menus
let openMenu = null;
function toggleMenu(id) {
  event.stopPropagation();
  const el = document.getElementById(id);
  if (!el) return;
  if (openMenu && openMenu !== el) {
    openMenu.classList.remove('visible');
    openMenu.parentElement.classList.remove('open');
  }
  el.classList.toggle('visible');
  openMenu = el.classList.contains('visible') ? el : null;
  if (openMenu) el.parentElement.classList.add('open');
  else el.parentElement.classList.remove('open');
}

function closeAllMenus() {
  document.querySelectorAll('.dropdown').forEach(d => {
    d.classList.remove('visible');
    d.parentElement.classList.remove('open');
  });
  openMenu = null;
}

document.addEventListener('click', function(e) {
  if (!e.target.closest('.menu-parent')) closeAllMenus();
});

// Window dragging — divides by 2 to account for body scale(2) on desktop
let dragTarget = null, dragOffX = 0, dragOffY = 0;

function startDrag(e, id) {
  if (window.innerWidth <= 900) return;
  dragTarget = document.getElementById(id);
  if (!dragTarget) return;
  const rect = dragTarget.getBoundingClientRect();
  dragOffX = e.clientX - rect.left;
  dragOffY = e.clientY - rect.top;
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', stopDrag);
  e.preventDefault();
}

function onDrag(e) {
  if (!dragTarget) return;
  dragTarget.style.left = ((e.clientX - dragOffX) / 2) + 'px';
  dragTarget.style.top  = ((e.clientY - dragOffY) / 2) + 'px';
  dragTarget.style.right = 'auto';
  dragTarget.style.bottom = 'auto';
}

function stopDrag() {
  dragTarget = null;
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);
}

// Window resizing — divides by 2 to account for body scale(2) on desktop
let resizeTarget = null, resizeContentEl = null;
let resizeStartX = 0, resizeStartY = 0, resizeStartW = 0, resizeStartH = 0;

function onResize(e) {
  if (!resizeTarget) return;
  const dx = (e.clientX - resizeStartX) / 2;
  const dy = (e.clientY - resizeStartY) / 2;
  const newW = Math.max(200, resizeStartW + dx);
  const newH = Math.max(120, resizeStartH + dy);
  resizeTarget.style.width = newW + 'px';
  resizeTarget.style.height = newH + 'px';
  if (resizeContentEl) {
    const titleH  = (resizeTarget.querySelector('.window-titlebar')  || {offsetHeight: 0}).offsetHeight;
    const toolH   = (resizeTarget.querySelector('.window-toolbar')   || {offsetHeight: 0}).offsetHeight;
    const statusH = (resizeTarget.querySelector('.window-statusbar') || {offsetHeight: 0}).offsetHeight;
    resizeContentEl.style.height = Math.max(40, newH - titleH - toolH - statusH - 2) + 'px';
  }
}

function stopResize() {
  resizeTarget = null;
  resizeContentEl = null;
  document.removeEventListener('mousemove', onResize);
  document.removeEventListener('mouseup', stopResize);
}

// About dialog
function showAboutDialog() {
  closeAllMenus();
  const el = document.getElementById('about-dialog-overlay');
  if (el) el.classList.add('visible');
}
function hideAboutDialog() {
  const el = document.getElementById('about-dialog-overlay');
  if (el) el.classList.remove('visible');
}

// Desktop icon selection + resize handle wiring
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.desktop-icon').forEach(icon => {
    icon.addEventListener('click', function(e) {
      e.stopPropagation();
      document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
      this.classList.add('selected');
    });
  });
  const desktop = document.getElementById('desktop');
  if (desktop) {
    desktop.addEventListener('click', function(e) {
      if (!e.target.closest('.window') && !e.target.closest('.menu-parent')) {
        document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
      }
    });
  }

  document.querySelectorAll('.resize-handle').forEach(handle => {
    handle.addEventListener('mousedown', function(e) {
      if (window.innerWidth <= 900) return;
      const win = this.closest('.window');
      if (!win) return;
      resizeTarget = win;
      resizeContentEl = win.querySelector('.window-content');
      const rect = win.getBoundingClientRect();
      resizeStartX = e.clientX;
      resizeStartY = e.clientY;
      resizeStartW = rect.width / 2;
      resizeStartH = rect.height / 2;
      document.addEventListener('mousemove', onResize);
      document.addEventListener('mouseup', stopResize);
      e.preventDefault();
      e.stopPropagation();
    });
  });
});
