import { useState, useRef, useEffect } from 'react';
import { 
  Bold, Italic, Strikethrough, Underline, Highlighter, Subscript, Superscript,
  List, ListOrdered, ListTodo, 
  LayoutTemplate, Quote, Code, Table, FoldVertical, GitMerge,
  Terminal, ShieldAlert,
  Image as ImageIcon, Link,
  Minus, ChevronDown, Heading1, Heading2, Heading3, Heading4, Heading5, Heading6,
  Type
} from 'lucide-react';

const ToolbarGroup = ({ icon: Icon, label, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 p-1.5 rounded-md text-text_secondary hover:text-text_primary hover:bg-surface2 transition-colors"
        title={label}
      >
        <Icon className="h-4 w-4" />
        <ChevronDown className="h-3 w-3" />
      </button>

      {isOpen && (
        <div 
          className="absolute top-full left-0 mt-1 bg-surface border border-border rounded-lg shadow-lg z-20 py-2 px-2 min-w-[max-content]"
          onClick={() => setIsOpen(false)} // close on any action click
        >
          {children}
        </div>
      )}
    </div>
  );
};

const ToolbarButton = ({ icon: Icon, onClick, title, label }) => (
  <button
    onClick={onClick}
    className="p-1.5 flex items-center justify-center rounded-md text-text_secondary hover:text-text_primary hover:bg-surface2 transition-colors"
    title={title}
  >
    {Icon ? <Icon className="h-4 w-4" /> : <span className="text-sm font-bold w-4 text-center">{label}</span>}
  </button>
);

const HeadingDropdown = ({ onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const headings = [
    { label: 'Heading 1', value: 1, icon: Heading1 },
    { label: 'Heading 2', value: 2, icon: Heading2 },
    { label: 'Heading 3', value: 3, icon: Heading3 },
    { label: 'Heading 4', value: 4, icon: Heading4 },
    { label: 'Heading 5', value: 5, icon: Heading5 },
    { label: 'Heading 6', value: 6, icon: Heading6 },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 p-1.5 rounded-md text-text_secondary hover:text-text_primary hover:bg-surface2 transition-colors"
        title="Headings"
      >
        <span className="text-sm font-bold ml-1">H</span>
        <ChevronDown className="h-3 w-3" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-36 bg-surface border border-border rounded-lg shadow-lg z-20 py-1">
          {headings.map((h) => {
            const Icon = h.icon;
            return (
              <button
                key={h.value}
                onClick={() => {
                  onSelect(h.value);
                  setIsOpen(false);
                }}
                className="w-full flex items-center px-3 py-2 text-sm text-text_secondary hover:bg-surface2 hover:text-text_primary transition-colors"
              >
                <Icon className="h-4 w-4 mr-2" />
                <span>{h.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const MarkdownToolbar = ({ onFormat }) => {
  return (
    <div className="flex items-center space-x-1 px-6 py-2 border-b border-border bg-background flex-wrap gap-y-2 flex-shrink-0 w-full relative z-10">
      
      {/* Quick Access Text Styles */}
      <ToolbarButton icon={Bold} onClick={() => onFormat('bold')} title="Bold (Ctrl+B)" />
      <ToolbarButton icon={Italic} onClick={() => onFormat('italic')} title="Italic (Ctrl+I)" />
      
      <div className="w-px h-5 bg-border mx-1" />
      
      {/* Headings */}
      <HeadingDropdown onSelect={(level) => onFormat('heading', level)} />
      
      <div className="w-px h-5 bg-border mx-1" />

      {/* Grouped Text Styles */}
      <ToolbarGroup icon={Type} label="Text Styles">
        <div className="grid grid-cols-4 gap-1">
          <ToolbarButton label="B/I" onClick={() => onFormat('bold-italic')} title="Bold Italic" />
          <ToolbarButton icon={Strikethrough} onClick={() => onFormat('strikethrough')} title="Strikethrough (Ctrl+Shift+X)" />
          <ToolbarButton icon={Underline} onClick={() => onFormat('underline')} title="Underline (Ctrl+U)" />
          <ToolbarButton icon={Highlighter} onClick={() => onFormat('highlight')} title="Highlight" />
          <ToolbarButton icon={Subscript} onClick={() => onFormat('subscript')} title="Subscript" />
          <ToolbarButton icon={Superscript} onClick={() => onFormat('superscript')} title="Superscript" />
        </div>
      </ToolbarGroup>

      <div className="w-px h-5 bg-border mx-1" />

      {/* Lists Group */}
      <ToolbarGroup icon={List} label="Lists">
        <div className="flex space-x-1">
          <ToolbarButton icon={ListOrdered} onClick={() => onFormat('ordered-list')} title="Ordered List" />
          <ToolbarButton icon={List} onClick={() => onFormat('unordered-list')} title="Unordered List" />
          <ToolbarButton icon={ListTodo} onClick={() => onFormat('task-list')} title="Task List" />
        </div>
      </ToolbarGroup>

      <div className="w-px h-5 bg-border mx-1" />

      {/* Blocks Group */}
      <ToolbarGroup icon={LayoutTemplate} label="Blocks">
        <div className="grid grid-cols-3 gap-1">
          <ToolbarButton icon={Quote} onClick={() => onFormat('blockquote')} title="Blockquote" />
          <ToolbarButton icon={Code} onClick={() => onFormat('code')} title="Code Block (Ctrl+Shift+C)" />
          <ToolbarButton icon={Table} onClick={() => onFormat('table')} title="Table" />
          <ToolbarButton icon={FoldVertical} onClick={() => onFormat('details')} title="Collapsible Section" />
          <ToolbarButton icon={Minus} onClick={() => onFormat('hr')} title="Horizontal Rule" />
        </div>
      </ToolbarGroup>

      <div className="w-px h-5 bg-border mx-1" />

      {/* Inline Elements Group */}
      <ToolbarGroup icon={Terminal} label="Inline formatting">
        <div className="flex space-x-1">
          <ToolbarButton icon={Terminal} onClick={() => onFormat('inline-code')} title="Inline Code (Ctrl+E)" />
          <ToolbarButton label="KBD" onClick={() => onFormat('kbd')} title="Keyboard Key" />
          <ToolbarButton icon={ShieldAlert} onClick={() => onFormat('escape')} title="Escape Character" />
        </div>
      </ToolbarGroup>

      <div className="w-px h-5 bg-border mx-1" />
      
      {/* Media */}
      <ToolbarButton icon={Link} onClick={() => onFormat('link')} title="Insert Link (Ctrl+K)" />
      <ToolbarButton icon={ImageIcon} onClick={() => onFormat('image')} title="Insert Image (Ctrl+Shift+K)" />
    </div>
  );
};

export default MarkdownToolbar;
