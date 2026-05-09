import React, { useMemo } from 'react';

/**
 * Lightweight custom markdown parser and renderer.
 * Supports: headings, bold, italic, lists, code blocks, inline code,
 * links, blockquotes, horizontal rules, and paragraphs.
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

  // Bold + Italic (***text*** or ___text___)
  result = result.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
  result = result.replace(/___(.*?)___/g, '<strong><em>$1</em></strong>');

  // Bold (**text** or __text__)
  result = result.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  result = result.replace(/__(.*?)__/g, '<strong>$1</strong>');

  // Italic (*text* or _text_)
  result = result.replace(/\*(.*?)\*/g, '<em>$1</em>');
  result = result.replace(/(?<!\w)_(.*?)_(?!\w)/g, '<em>$1</em>');

  // Inline code (`code`)
  result = result.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

  // Links ([text](url))
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="md-link">$1</a>');

  // Strikethrough (~~text~~)
  result = result.replace(/~~(.*?)~~/g, '<del>$1</del>');

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

  const closeList = () => {
    if (inList) {
      html.push(listType === 'ul' ? '</ul>' : '</ol>');
      inList = false;
      listType = '';
    }
  };

  const closeBlockquote = () => {
    if (inBlockquote) {
      html.push(`<blockquote class="md-blockquote">${blockquoteContent.map(l => parseInline(l)).join('<br/>')}</blockquote>`);
      inBlockquote = false;
      blockquoteContent = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block toggle
    if (line.trimStart().startsWith('```')) {
      if (!inCodeBlock) {
        closeList();
        closeBlockquote();
        inCodeBlock = true;
        codeBlockLang = line.trimStart().slice(3).trim();
        codeBlockContent = [];
      } else {
        html.push(`<pre class="md-code-block"><code${codeBlockLang ? ` class="language-${escapeHtml(codeBlockLang)}"` : ''}>${escapeHtml(codeBlockContent.join('\n'))}</code></pre>`);
        inCodeBlock = false;
        codeBlockLang = '';
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }

    // Empty line
    if (line.trim() === '') {
      closeList();
      closeBlockquote();
      continue;
    }

    // Horizontal rule
    if (/^(-{3,}|_{3,}|\*{3,})$/.test(line.trim())) {
      closeList();
      closeBlockquote();
      html.push('<hr class="md-hr" />');
      continue;
    }

    // Headings
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      closeList();
      closeBlockquote();
      const level = headingMatch[1].length;
      html.push(`<h${level} class="md-h${level}">${parseInline(headingMatch[2])}</h${level}>`);
      continue;
    }

    // Blockquote
    if (line.trimStart().startsWith('> ')) {
      closeList();
      if (!inBlockquote) {
        inBlockquote = true;
        blockquoteContent = [];
      }
      blockquoteContent.push(line.trimStart().slice(2));
      continue;
    } else {
      closeBlockquote();
    }

    // Unordered list
    const ulMatch = line.match(/^(\s*)([-*+])\s+(.+)$/);
    if (ulMatch) {
      closeBlockquote();
      if (!inList || listType !== 'ul') {
        closeList();
        html.push('<ul class="md-ul">');
        inList = true;
        listType = 'ul';
      }
      html.push(`<li>${parseInline(ulMatch[3])}</li>`);
      continue;
    }

    // Ordered list
    const olMatch = line.match(/^(\s*)\d+\.\s+(.+)$/);
    if (olMatch) {
      closeBlockquote();
      if (!inList || listType !== 'ol') {
        closeList();
        html.push('<ol class="md-ol">');
        inList = true;
        listType = 'ol';
      }
      html.push(`<li>${parseInline(olMatch[2])}</li>`);
      continue;
    }

    // Regular paragraph
    closeList();
    closeBlockquote();
    html.push(`<p class="md-p">${parseInline(line)}</p>`);
  }

  // Close any open blocks
  if (inCodeBlock) {
    html.push(`<pre class="md-code-block"><code>${escapeHtml(codeBlockContent.join('\n'))}</code></pre>`);
  }
  closeList();
  closeBlockquote();

  return html.join('\n');
}

const MarkdownPreview = ({ content = '' }) => {
  const renderedHtml = useMemo(() => parseMarkdown(content), [content]);

  return (
    <div
      className="markdown-preview prose-custom"
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
};

export default MarkdownPreview;
