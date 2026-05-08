#!/usr/bin/env python3
"""Build script: regenerates HTML content sections from Markdown source files.

Usage:
    python3 build.py           # rebuild all pages
    python3 build.py --check   # dry run, print diffs without writing
"""

import re
import sys
from pathlib import Path

ROOT = Path(__file__).parent
CONTENT = ROOT / 'content'

MARKER_START = re.compile(
    r'<!-- =+\s*-->\s*\n\s*<!-- CONTENT[^\n]*-->\s*\n(?:\s*<!-- [^\n]*-->\s*\n)*',
    re.MULTILINE
)
MARKER_END = re.compile(
    r'\s*<!-- =+\s*-->\s*\n\s*<!-- END CONTENT[^\n]*-->\s*\n\s*<!-- =+\s*-->',
    re.MULTILINE
)

CHECK = '--check' in sys.argv


# ---------------------------------------------------------------------------
# Inline rendering
# ---------------------------------------------------------------------------

def escape(text):
    """HTML-escape bare text (not already in tags)."""
    return text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


def inline(text):
    """Render inline Markdown: **bold**, _em_, [link](url). Escapes & < > in text nodes."""
    # Split on inline tokens so we can escape only text runs
    token_re = re.compile(r'(\*\*.*?\*\*|_.*?_|\*.*?\*|\[.*?\]\(.*?\))')
    parts = token_re.split(text)
    result = []
    for part in parts:
        if re.match(r'\*\*(.*?)\*\*', part):
            inner = part[2:-2]
            result.append(f'<strong>{inline(inner)}</strong>')
        elif re.match(r'[_*](.*?)[_*]', part):
            inner = part[1:-1]
            result.append(f'<em>{inline(inner)}</em>')
        elif re.match(r'\[(.*?)\]\((.*?)\)', part):
            m = re.match(r'\[(.*?)\]\((.*?)\)', part)
            label, url = m.group(1), m.group(2)
            target = ' target="_blank"' if url.startswith('http') else ''
            result.append(f'<a href="{url}"{target}>{inline(label)}</a>')
        else:
            result.append(escape(part))
    return ''.join(result)


# ---------------------------------------------------------------------------
# inject() — replaces between CONTENT markers in an HTML file
# ---------------------------------------------------------------------------

def inject(html_path, inner_html, check=CHECK):
    html = Path(html_path).read_text()

    m_start = MARKER_START.search(html)
    m_end = MARKER_END.search(html)

    if not m_start or not m_end:
        print(f'  WARNING: content markers not found in {html_path}')
        return

    before = html[:m_start.end()].rstrip('\n')
    after = html[m_end.start():].lstrip('\n')
    new_html = before + '\n\n' + inner_html.strip('\n') + '\n\n' + after

    if check:
        import difflib
        old_lines = html.splitlines(keepends=True)
        new_lines = new_html.splitlines(keepends=True)
        diff = list(difflib.unified_diff(old_lines, new_lines, fromfile=str(html_path), tofile='(rebuilt)'))
        if diff:
            print(''.join(diff))
        else:
            print(f'  {html_path}: no changes')
        return

    if new_html != html:
        Path(html_path).write_text(new_html)
        print(f'  updated {html_path}')
    else:
        print(f'  {html_path}: no changes')


# ---------------------------------------------------------------------------
# CV parser
# ---------------------------------------------------------------------------

def render_list_items(lines):
    items = []
    for line in lines:
        m = re.match(r'^-\s+(.*)', line)
        if m:
            items.append(f'<li>{inline(m.group(1))}</li>')
    return '<ul style="margin:0;padding-left:1.2em;">\n' + '\n'.join(items) + '\n</ul>'


def parse_cv(text):
    lines = text.splitlines()
    out = []

    # First line may be pdf_url
    pdf_url = None
    start = 0
    if lines and lines[0].startswith('pdf_url:'):
        pdf_url = lines[0].split(':', 1)[1].strip()
        start = 1

    if pdf_url:
        out.append(
            f'        <a class="cv-pdf-link" href="{pdf_url}" target="_blank">\n'
            f'          <img src="assets/img/icons/file.png" alt="" '
            f'style="width:12px;height:12px;vertical-align:middle;margin-right:4px;image-rendering:pixelated;">\n'
            f'          Download PDF version\n'
            f'        </a>'
        )

    current_section = None  # open section html
    current_entry = None    # list of lines accumulated for current entry
    entry_title = None
    entry_metas = []

    def flush_entry():
        nonlocal current_entry, entry_title, entry_metas
        if current_entry is None:
            return ''
        html = '        <div class="cv-entry">\n'
        if entry_title:
            html += f'          <div class="cv-entry-title">{inline(entry_title)}</div>\n'
        for m in entry_metas:
            html += f'          <div class="cv-entry-meta">{inline(m)}</div>\n'
        # remaining lines are desc content
        desc_lines = current_entry
        if desc_lines:
            # check if it's a list
            if all(re.match(r'^-\s+', l) for l in desc_lines if l.strip()):
                inner = render_list_items([l for l in desc_lines if l.strip()])
                html += f'          <div class="cv-entry-desc">\n            {inner}\n          </div>\n'
            else:
                para = ' '.join(l for l in desc_lines if l.strip())
                if para:
                    html += f'          <div class="cv-entry-desc">{inline(para)}</div>\n'
        html += '        </div>'
        current_entry = None
        entry_title = None
        entry_metas = []
        return html

    def flush_section():
        nonlocal current_section
        parts = []
        entry_html = flush_entry()
        if entry_html:
            parts.append(entry_html)
        if current_section is not None:
            section_html = current_section + '\n' + '\n'.join(parts) + '\n        </div>'
            current_section = None
            return section_html
        return '\n'.join(parts)

    i = start
    while i < len(lines):
        line = lines[i]

        # Section header: ## Title
        if re.match(r'^## ', line):
            out.append(flush_section())
            title = line[3:].strip()
            current_section = f'        <div class="cv-section">\n          <div class="cv-section-title">{inline(title)}</div>'
            i += 1
            continue

        # Entry header: ### Title (possibly empty)
        if re.match(r'^###', line):
            # flush previous entry into section
            entry_html = flush_entry()
            if entry_html:
                if current_section is not None:
                    current_section += '\n' + entry_html
                else:
                    out.append(entry_html)
            raw_title = line[3:].strip()
            entry_title = raw_title if raw_title else None
            current_entry = []
            entry_metas = []
            i += 1
            continue

        # Blockquote meta: > text
        if re.match(r'^> ', line) and current_entry is not None:
            entry_metas.append(line[2:].strip())
            i += 1
            continue

        # List item or paragraph in entry
        if current_entry is not None and line.strip():
            current_entry.append(line)
            i += 1
            continue

        i += 1

    # flush remaining
    out.append(flush_section())

    return '\n'.join(s for s in out if s)


def build_cv():
    print('Building cv.html...')
    text = (CONTENT / 'cv.md').read_text()
    inner = parse_cv(text)
    inject(ROOT / 'cv.html', inner)


# ---------------------------------------------------------------------------
# Info-page parser (index.html, contact.html)
# ---------------------------------------------------------------------------

def parse_infopage(text, with_profile=False):
    lines = text.splitlines()
    out = []
    i = 0

    # Profile photo line (index only)
    photo_src = None
    if with_profile and lines and lines[0].startswith('photo:'):
        photo_src = lines[0].split(':', 1)[1].strip()
        i = 1

    # Skip blank line after photo
    while i < len(lines) and not lines[i].strip():
        i += 1

    # Collect info boxes and paragraphs
    # An info box starts with [Box Title] on its own line
    boxes = []     # list of (title, [(label, value_html)])
    paragraphs = []  # list of paragraph strings (for index bio)
    current_box = None

    while i < len(lines):
        line = lines[i]

        # Box header: [Title]
        m = re.match(r'^\[(.+)\]$', line)
        if m:
            current_box = (m.group(1), [])
            boxes.append(current_box)
            i += 1
            continue

        # Key: value row inside a box
        if current_box is not None and line.strip() and not line.startswith('['):
            # Split on first colon
            if ':' in line:
                colon = line.index(':')
                label = line[:colon].strip()
                value = line[colon+1:].strip()
                current_box[1].append((label, inline(value)))
            i += 1
            continue

        # Blank line ends box context only if we're collecting paragraphs after
        if not line.strip():
            current_box = None
            i += 1
            continue

        # Paragraph line (for index bio; outside boxes)
        if current_box is None:
            # Accumulate a full paragraph (lines until blank)
            para_lines = []
            while i < len(lines) and lines[i].strip():
                para_lines.append(lines[i].strip())
                i += 1
            if para_lines:
                paragraphs.append(' '.join(para_lines))
            continue

        i += 1

    # Render
    if with_profile and photo_src:
        # Profile header comes before paragraphs; the bio paragraphs come next
        out.append(
            f'        <div class="profile-header">\n'
            f'          <div class="profile-photo-frame" >\n'
            f'            <img src="{photo_src}" >\n'
            f'          </div>\n'
            f'          <div class="profile-info">\n'
            f'            <h1>Clara Rehmann</h1>\n'
            f'            <p>PhD Candidate<br>\n'
            f'            University of Oregon<br>\n'
            f'            Institute of Ecology and Evolution<br>\n'
            f'            <a href="mailto:crehmann@uoregon.edu">crehmann@uoregon.edu</a></p>\n'
            f'          </div>\n'
            f'        </div>'
        )

    for para in paragraphs:
        out.append(f'        <p class="about-text">\n          {inline(para)}\n        </p>')

    for box_title, rows in boxes:
        box_html = f'        <div class="info-box" style="margin-bottom:10px;">\n          <div class="info-box-title">{escape(box_title)}</div>\n'
        for label, val_html in rows:
            if label:
                box_html += (
                    f'          <div class="info-row">'
                    f'<span class="info-label">{escape(label)}:</span>'
                    f'{val_html}</div>\n'
                )
            else:
                box_html += (
                    f'          <div class="info-row">'
                    f'<span class="info-label"></span>'
                    f'<span>{val_html}</span></div>\n'
                )
        box_html += '        </div>'
        out.append(box_html)

    return '\n'.join(out)


def build_index():
    print('Building index.html...')
    text = (CONTENT / 'index.md').read_text()
    inner = parse_infopage(text, with_profile=True)
    inject(ROOT / 'index.html', inner)


def build_contact():
    print('Building contact.html...')
    text = (CONTENT / 'contact.md').read_text()
    inner = parse_infopage(text, with_profile=False)
    inject(ROOT / 'contact.html', inner)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    if CHECK:
        print('--- DRY RUN (--check mode, no files written) ---')
    build_cv()
    build_index()
    build_contact()
    print('Done.')


if __name__ == '__main__':
    main()
