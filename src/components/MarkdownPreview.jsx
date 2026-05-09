import React, { useMemo } from 'react';

/**
 * Lightweight custom markdown parser and renderer.
 * Supports: headings, bold, italic, lists, code blocks, inline code,
 * links, blockquotes, horizontal rules, and paragraphs.
 * Advanced: tables, highlight, subscript, superscript, kbd, details, task lists.
 */

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function parseInline(text) {
  let result = escapeHtml(text);

  // Escaped characters: replace backslash + char
  result = result.replace(/\\([*`_~^|<])/g, (match, p1) => `&#${p1.charCodeAt(0)};`);

  // Bold + Italic (***text*** or ___text___)
  result = result.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
  result = result.replace(/___(.*?)___/g, '<strong><em>$1</em></strong>');

  // Bold (**text** or __text__)
  result = result.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  result = result.replace(/__(.*?)__/g, '<strong>$1</strong>');

  // Italic (*text* or _text_)
  result = result.replace(/\*(.*?)\*/g, '<em>$1</em>');
  result = result.replace(/(?<!\w)_(.*?)_(?!\w)/g, '<em>$1</em>');

  // Strikethrough (~~text~~)
  result = result.replace(/~~(.*?)~~/g, '<del>$1</del>');

  // Highlight (==text==)
  result = result.replace(/==(.*?)==/g, '<mark>$1</mark>');

  // Subscript (~text~)
  result = result.replace(/~(.*?)~/g, '<sub>$1</sub>');

  // Superscript (^text^)
  result = result.replace(/\^(.*?)\^/g, '<sup>$1</sup>');

  // Inline code (`code`)
  result = result.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

  // Images ![alt](url)
  result = result.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="md-image" loading="lazy" />');

  // Links ([text](url))
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="md-link">$1</a>');

  // Restore HTML tags allowed
  result = result.replace(/&lt;kbd&gt;(.*?)&lt;\/kbd&gt;/gi, '<kbd>$1</kbd>');
  result = result.replace(/&lt;u&gt;(.*?)&lt;\/u&gt;/gi, '<u>$1</u>');

  return result;
}

function parseMarkdown(markdown) {
  if (!markdown) return '';
  const lines = markdown.split('\n');
  const html = [];
  let inCodeBlock = false;
  let codeBlockContent = [];
  let codeBlockLang = '';
  let inList = false;
  let listType = '';
  let inBlockquote = false;
  let blockquoteContent = [];
  let inTable = false;
  let inDetails = false;

  const closeBlocks = () => {
    if (inList) { html.push(listType === 'ul' ? '</ul>' : '</ol>'); inList = false; listType = ''; }
    if (inBlockquote) { html.push(`<blockquote class="md-blockquote">${blockquoteContent.join('<br/>')}</blockquote>`); inBlockquote = false; blockquoteContent = []; }
    if (inTable) { html.push('</tbody></table></div>'); inTable = false; }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (inCodeBlock) {
      if (line.trimStart().startsWith('```')) {
        html.push(`<pre class="md-code-block"><code${codeBlockLang ? ` class="language-${escapeHtml(codeBlockLang)}"` : ''}>${escapeHtml(codeBlockContent.join('\n'))}</code></pre>`);
        inCodeBlock = false;
        codeBlockLang = '';
      } else {
        codeBlockContent.push(line);
      }
      continue;
    }

    if (line.trimStart().startsWith('```')) {
      closeBlocks();
      inCodeBlock = true;
      codeBlockLang = line.trimStart().slice(3).trim();
      codeBlockContent = [];
      continue;
    }

    if (line.trim() === '&lt;details&gt;' || line.trim() === '<details>') {
      closeBlocks();
      html.push('<details class="md-details">');
      inDetails = true;
      continue;
    }
    if (line.trim() === '&lt;/details&gt;' || line.trim() === '</details>') {
      closeBlocks();
      html.push('</details>');
      inDetails = false;
      continue;
    }
    if (inDetails && (line.trim().startsWith('&lt;summary&gt;') || line.trim().startsWith('<summary>'))) {
      const summaryText = line.replace(/&lt;summary&gt;|<summary>/, '').replace(/&lt;\/summary&gt;|<\/summary>/, '');
      html.push(`<summary class="md-summary">${parseInline(summaryText)}</summary>`);
      continue;
    }

    if (line.trim() === '') {
      closeBlocks();
      if (!inDetails) { html.push('<br/>'); }
      continue;
    }

    // Tables
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      const cells = line.trim().slice(1, -1).split('|');
      if (cells.every(c => /^[-:\s]+$/.test(c))) {
        continue;
      }
      if (!inTable) {
        closeBlocks();
        inTable = true;
        html.push('<div class="md-table-wrapper"><table class="md-table"><tbody>');
      }
      html.push(`<tr>${cells.map(c => `<td>${parseInline(c.trim())}</td>`).join('')}</tr>`);
      continue;
    }

    if (/^(-{3,}|_{3,}|\*{3,})$/.test(line.trim())) {
      closeBlocks();
      html.push('<hr class="md-hr" />');
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      closeBlocks();
      const level = headingMatch[1].length;
      html.push(`<h${level} class="md-h${level}">${parseInline(headingMatch[2])}</h${level}>`);
      continue;
    }

    // Blockquote handling with visual nesting support based on number of '>'
    const bqMatch = line.match(/^(\s*)(>+)\s*(.*)$/);
    if (bqMatch) {
      if (!inBlockquote) {
        closeBlocks();
        inBlockquote = true;
        blockquoteContent = [];
      }
      const level = bqMatch[2].length;
      if (level > 1) {
        blockquoteContent.push(`<div class="md-blockquote" style="margin-left: ${(level - 1) * 1.5}rem; margin-top: 0.5rem; margin-bottom: 0.5rem;">${parseInline(bqMatch[3])}</div>`);
      } else {
        blockquoteContent.push(parseInline(bqMatch[3]));
      }
      continue;
    } else {
      if (inBlockquote) { closeBlocks(); }
    }

    // Task list handling with visual nesting support based on whitespace indent
    const taskMatch = line.match(/^(\s*)([-*+])\s+\[([ xX])\]\s+(.+)$/);
    if (taskMatch) {
      if (!inList || listType !== 'ul') {
        closeBlocks();
        html.push('<ul class="md-ul md-task-list">');
        inList = true;
        listType = 'ul';
      }
      const isChecked = taskMatch[3].toLowerCase() === 'x';
      const indent = taskMatch[1].length * 10; // visual indent in px
      html.push(`<li class="md-task-list-item flex items-start space-x-2" style="margin-left: ${indent}px;"><input type="checkbox" class="md-task-checkbox mt-1" data-line="${i}" ${isChecked ? 'checked' : ''} /> <span class="${isChecked ? 'line-through text-text_tertiary' : ''}">${parseInline(taskMatch[4])}</span></li>`);
      continue;
    }

    // Unordered list handling with visual nesting support based on whitespace indent
    const ulMatch = line.match(/^(\s*)([-*+])\s+(.+)$/);
    if (ulMatch) {
      if (!inList || listType !== 'ul') {
        closeBlocks();
        html.push('<ul class="md-ul">');
        inList = true;
        listType = 'ul';
      }
      const indent = ulMatch[1].length * 10;
      html.push(`<li style="margin-left: ${indent}px;">${parseInline(ulMatch[3])}</li>`);
      continue;
    }

    // Ordered list handling with visual nesting support based on whitespace indent
    const olMatch = line.match(/^(\s*)\d+\.\s+(.+)$/);
    if (olMatch) {
      if (!inList || listType !== 'ol') {
        closeBlocks();
        html.push('<ol class="md-ol">');
        inList = true;
        listType = 'ol';
      }
      const indent = olMatch[1].length * 10;
      html.push(`<li style="margin-left: ${indent}px;">${parseInline(olMatch[2])}</li>`);
      continue;
    }

    if (!inList && !inBlockquote && !inTable) {
      html.push(`<p class="md-p">${parseInline(line)}</p>`);
    } else {
      closeBlocks();
      html.push(`<p class="md-p">${parseInline(line)}</p>`);
    }
  }

  if (inCodeBlock) { html.push(`<pre class="md-code-block"><code>${escapeHtml(codeBlockContent.join('\n'))}</code></pre>`); }
  closeBlocks();
  if (inDetails) { html.push('</details>'); }

  return html.join('\n');
}

const MarkdownPreview = ({ content = '', onToggleTask }) => {
  const renderedHtml = useMemo(() => parseMarkdown(content), [content]);

  const handleClick = (e) => {
    if (e.target.classList.contains('md-task-checkbox')) {
      const lineIndex = parseInt(e.target.getAttribute('data-line'), 10);
      if (!isNaN(lineIndex) && onToggleTask) {
        onToggleTask(lineIndex);
      }
    }
  };

  return (
    <div
      className="markdown-preview prose-custom"
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
      onClick={handleClick}
    />
  );
};

export default MarkdownPreview;
