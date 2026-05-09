-- Insert Default Data for SelfDesk
-- Run this script after the complete setup to populate tables with initial data

-- ========================================
-- 1. INSERT DEFAULT THEME PRESETS
-- ========================================

-- Light Theme
INSERT INTO theme_presets (user_id, name, colors, is_default, others) VALUES
('acd9f5da-04a0-4d47-a32e-9debe326eef1', 'Light', 
'{"primary":"#3b82f6","primaryLight":"#60a5fa","primaryDark":"#1e40af","secondary":"#8b5cf6","secondaryLight":"#a78bfa","secondaryDark":"#6d28d9","accent":"#ec4899","accentLight":"#f472b6","accentDark":"#be185d","success":"#10b981","warning":"#f59e0b","danger":"#ef4444","info":"#0ea5e9","background":"#ffffff","surface":"#f9fafb","surface2":"#f3f4f6","border":"#e5e7eb","textPrimary":"#1f2937","textSecondary":"#6b7280","textTertiary":"#9ca3af"}', 
true, '{}')
ON CONFLICT DO NOTHING;

-- Dark Theme
INSERT INTO theme_presets (user_id, name, colors, is_default, others) VALUES
('acd9f5da-04a0-4d47-a32e-9debe326eef1', 'Dark', 
'{"primary":"#3b82f6","primaryLight":"#60a5fa","primaryDark":"#1e40af","secondary":"#8b5cf6","secondaryLight":"#a78bfa","secondaryDark":"#6d28d9","accent":"#ec4899","accentLight":"#f472b6","accentDark":"#be185d","success":"#10b981","warning":"#f59e0b","danger":"#ef4444","info":"#0ea5e9","background":"#1f2937","surface":"#111827","surface2":"#0f172a","border":"#374151","textPrimary":"#f9fafb","textSecondary":"#d1d5db","textTertiary":"#9ca3af"}', 
true, '{}')
ON CONFLICT DO NOTHING;

-- Sepia Theme
INSERT INTO theme_presets (user_id, name, colors, is_default, others) VALUES
('acd9f5da-04a0-4d47-a32e-9debe326eef1', 'Sepia', 
'{"primary":"#b97f5c","primaryLight":"#d4a57a","primaryDark":"#925742","secondary":"#a68072","secondaryLight":"#c19d8f","secondaryDark":"#8a6358","accent":"#c98660","accentLight":"#e4a57c","accentDark":"#a86c4e","success":"#8b7355","warning":"#d4a574","danger":"#c97c60","info":"#a68072","background":"#fef5f1","surface":"#faf4f0","surface2":"#f5ede8","border":"#e8dccf","textPrimary":"#4a3728","textSecondary":"#6b5d54","textTertiary":"#8c7b6f"}', 
true, '{}')
ON CONFLICT DO NOTHING;

-- Ocean Theme
INSERT INTO theme_presets (user_id, name, colors, is_default, others) VALUES
('acd9f5da-04a0-4d47-a32e-9debe326eef1', 'Ocean', 
'{"primary":"#0369a1","primaryLight":"#0284c7","primaryDark":"#075985","secondary":"#0284c7","secondaryLight":"#38bdf8","secondaryDark":"#0369a1","accent":"#06b6d4","accentLight":"#22d3ee","accentDark":"#0891b2","success":"#059669","warning":"#d97706","danger":"#dc2626","info":"#0891b2","background":"#f0f9ff","surface":"#e0f2fe","surface2":"#bae6fd","border":"#7dd3fc","textPrimary":"#0c2340","textSecondary":"#0e7490","textTertiary":"#0ea5e9"}', 
true, '{}')
ON CONFLICT DO NOTHING;

-- Forest Theme
INSERT INTO theme_presets (user_id, name, colors, is_default, others) VALUES
('acd9f5da-04a0-4d47-a32e-9debe326eef1', 'Forest', 
'{"primary":"#15803d","primaryLight":"#16a34a","primaryDark":"#14532d","secondary":"#16a34a","secondaryLight":"#22c55e","secondaryDark":"#15803d","accent":"#22c55e","accentLight":"#4ade80","accentDark":"#16a34a","success":"#059669","warning":"#d97706","danger":"#dc2626","info":"#0891b2","background":"#f0fdf4","surface":"#dbeafe","surface2":"#bbf7d0","border":"#86efac","textPrimary":"#14532d","textSecondary":"#166534","textTertiary":"#16a34a"}', 
true, '{}')
ON CONFLICT DO NOTHING;

-- ========================================
-- 2. INSERT DEFAULT APP SETTINGS
-- ========================================

-- Default app settings for user
INSERT INTO app_settings (user_id, current_theme, theme_colors, others) VALUES
('acd9f5da-04a0-4d47-a32e-9debe326eef1', 'light', 
'{"primary":"#3b82f6","secondary":"#64748b","background":"#ffffff","surface":"#f8fafc","text_primary":"#1e293b","text_secondary":"#64748b","text_tertiary":"#94a3b8","border":"#e2e8f0","danger":"#ef4444","warning":"#f59e0b","success":"#10b981","info":"#06b6d4"}',
'{"auto_save": true, "auto_save_interval": 30, "language": "en", "timezone": "UTC", "notifications_enabled": true}')
ON CONFLICT (user_id) DO NOTHING;

-- ========================================
-- 3. INSERT DEFAULT FOLDERS
-- ========================================

-- Default folder structure for user
INSERT INTO folders (user_id, name, color, others) VALUES
('acd9f5da-04a0-4d47-a32e-9debe326eef1', 'Personal', '#3b82f6', '{"icon": "user", "description": "Personal notes and files"}'),
('acd9f5da-04a0-4d47-a32e-9debe326eef1', 'Work', '#10b981', '{"icon": "briefcase", "description": "Work-related documents"}'),
('acd9f5da-04a0-4d47-a32e-9debe326eef1', 'Ideas', '#f59e0b', '{"icon": "lightbulb", "description": "Creative ideas and brainstorming"}'),
('acd9f5da-04a0-4d47-a32e-9debe326eef1', 'Archive', '#64748b', '{"icon": "archive", "description": "Old notes and completed projects"}'),
('acd9f5da-04a0-4d47-a32e-9debe326eef1', 'Important', '#ef4444', '{"icon": "star", "description": "Important documents and references"}'),
('acd9f5da-04a0-4d47-a32e-9debe326eef1', 'Projects', '#8b5cf6', '{"icon": "folder", "description": "Project-specific files and notes"}')
ON CONFLICT DO NOTHING;

-- ========================================
-- 4. INSERT SAMPLE NOTES (Optional)
-- ========================================

-- Sample welcome note (inserted after folders are created)
-- We'll use a subquery to get the Personal folder ID
INSERT INTO notes (user_id, title, content, folder_id, is_favorite, tags, others) VALUES
('acd9f5da-04a0-4d47-a32e-9debe326eef1', 'Welcome to SelfDesk', 
'# Welcome to SelfDesk 🎉

SelfDesk is your **advanced** personal workspace that combines *powerful* note-taking, secure chat, and seamless file management.

## 📝 Text Formatting

### Basic Styling
- **Bold text** for emphasis
- *Italic text* for subtle highlights  
- ***Bold and italic*** for strong emphasis
- ~~Strikethrough text~~ for deletions
- <u>Underlined text</u> for special highlights
- ==Highlighted text== for important notes

### Inline Elements
- `Inline code` for technical terms
- <kbd>Ctrl</kbd> + <kbd>S</kbd> for keyboard shortcuts
- Regular text with \*escaped asterisks\* to show special characters

## 📚 Headings

# Heading 1 - Main Title
## Heading 2 - Major Section  
### Heading 3 - Subsection
#### Heading 4 - Detailed Topic
##### Heading 5 - Specific Point
###### Heading 6 - Fine Detail

## 🔗 Links and Images

### Links
- [External Link](https://github.com)
- [Link with title](https://example.com "Example Website")
- [Relative Link](./other-file.md)

### Images
![SelfDesk Logo](https://avatars.githubusercontent.com/u/193323632?s=48&v=4)
![Image with alt text and title](https://github.com/devfazla/free-writer/raw/main/assets/images/fazla.png)

## 📋 Lists

### Unordered Lists
- First item
- Second item
  - Nested item
  - Another nested item
    - Deeply nested item
- Third item

### Ordered Lists
1. First step
2. Second step
   1. Sub-step 2.1
   2. Sub-step 2.2
3. Third step

### Task Lists
- [x] Completed task
- [ ] Pending task
- [x] Another completed task
- [ ] Task in progress

## 📊 Tables

| Feature | Status | Priority |
|---------|--------|----------|
| Notes Editor | ✅ Complete | High |
| Chat System | ✅ Complete | High |
| File Storage | ✅ Complete | Medium |
| Themes | ✅ Complete | Low |
| Auto-save | ✅ Complete | High |

| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Row 1 Col 1 | Row 1 Col 2 | Row 1 Col 3 |
| Row 2 Col 1 | Row 2 Col 2 | Row 2 Col 3 |

## 💻 Code Blocks

### Inline Code
Use `const message = "Hello SelfDesk";` for variables.

### Fenced Code Blocks
```javascript
// JavaScript Example
function welcomeToSelfDesk() {
  const features = [''notes'', ''chat'', ''files''];
  return `Welcome! Features: ${features.join('', '')}`;
}
```

```python
# Python Example
def selfdesk_welcome():
    """Welcome function for SelfDesk"""
    features = ["markdown", "preview", "autosave"]
    print(f"SelfDesk features: {', '.join(features)}")
```

```bash
# Shell Commands
npm install selfdesk
npm run dev
```

## 🎨 Advanced Features

### Blockquotes
> This is a simple blockquote.
> 
> It can span multiple lines and is great for quotes or important information.

> **Nested Blockquote**
> 
> > This is a nested blockquote.
> > 
> > You can nest them deeper if needed.
> > 
> > - Even lists inside blockquotes
> > - With proper formatting

### Horizontal Rules
---

### Details/Summary (Collapsible Content)
<details>
<summary>📖 Click to expand SelfDesk features</summary>

SelfDesk includes:
   - **Advanced Markdown Editor** with live preview
   - **Real-time Auto-save** after 30 seconds of inactivity
   - **Secure Chat** via Telegram Bot API
   - **File Storage** with folder organization
   - **Multi-theme Support** with 5 built-in themes
   - **Password Protection** with encrypted storage

</details>

## 🌟 Special Characters and Escaping

### Escaping Markdown
- \*Not italic\* (escaped asterisks)
- \_Not underscore_\_ (escaped underscores)
- \`\`Not code\`\` (escaped backticks)

### Special Characters
- © Copyright symbol
- ® Registered trademark
- ™ Trademark symbol
- → Right arrow
- ← Left arrow
- ↔ Left-right arrow
- ↑ Up arrow
- ↓ Down arrow

## 🎯 Emojis and Unicode
- 🎉 Welcome celebration
- 📝 Taking notes
- 💬 Chatting with friends
- 📁 Organizing files
- 🎨 Customizing themes
- 🔒 Secure and private
- ⚡ Fast and responsive
- 🌟 Star features

## 📏 Text Alignment and Spacing

### Line Breaks
First line with single space at end⏎
Second line (soft break)

Third line with double space at end⏎⏎
Fourth line (hard break)

## 🔤 Typography Examples

### Different Font Styles
- **Bold**: Strong emphasis
- *Italic*: Emphasis or titles
- `Monospace`: Code or file paths
- <u>Underline</u>: Links or highlights
- ~~Strikethrough~~: Deleted content

### Superscript and Subscript
- H₂O (water formula)
- X² (squared)
- CO₂ (carbon dioxide)

## 🚀 Getting Started

1. **Login** with your password
2. **Create** your first note
3. **Explore** the chat features  
4. **Organize** your files
5. **Customize** your theme

---

## 🎊 Conclusion

SelfDesk combines the **best** of modern web applications with *privacy* and *security* in mind. Whether you''re taking notes, chatting, or managing files, SelfDesk provides a seamless experience.

> **Remember**: All your data is stored securely with auto-save functionality that activates after 30 seconds of inactivity.

---

*Happy using SelfDesk! 🎉*', 
(SELECT id FROM folders WHERE user_id = 'acd9f5da-04a0-4d47-a32e-9debe326eef1' AND name = 'Personal' LIMIT 1), 
true, '{"welcome", "tutorial", "getting-started"}', 
'{"created_by": "acd9f5da-04a0-4d47-a32e-9debe326eef1", "template": "welcome"}')
ON CONFLICT DO NOTHING;

-- ========================================
-- 5. FUNCTIONS FOR USER INITIALIZATION
-- ========================================

-- Enhanced function to initialize user settings with defaults
CREATE OR REPLACE FUNCTION initialize_user_complete(user_uuid TEXT)
RETURNS VOID AS $$
BEGIN
    -- Insert default app settings
    INSERT INTO app_settings (user_id, current_theme, theme_colors, others)
    SELECT user_uuid, current_theme, theme_colors, others
    FROM app_settings WHERE user_id = 'acd9f5da-04a0-4d47-a32e-9debe326eef1'
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Insert default folders
    INSERT INTO folders (user_id, name, color, others)
    SELECT user_uuid, name, color, others
    FROM folders WHERE user_id = 'acd9f5da-04a0-4d47-a32e-9debe326eef1'
    ON CONFLICT DO NOTHING;
    
    -- Insert welcome note in Personal folder (using subquery to get folder ID)
    INSERT INTO notes (user_id, title, content, folder_id, is_favorite, tags, others)
    SELECT user_uuid, title, content, 
           (SELECT id FROM folders WHERE user_id = user_uuid AND name = 'Personal' LIMIT 1),
           is_favorite, tags, others
    FROM notes WHERE user_id = 'acd9f5da-04a0-4d47-a32e-9debe326eef1' AND title = 'Welcome to SelfDesk'
    ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Function to copy theme presets for a user
CREATE OR REPLACE FUNCTION copy_theme_presets_to_user(user_uuid TEXT)
RETURNS VOID AS $$
BEGIN
    INSERT INTO theme_presets (user_id, name, colors, is_default, others)
    SELECT user_uuid, name, colors, false, others
    FROM theme_presets WHERE user_id = 'acd9f5da-04a0-4d47-a32e-9debe326eef1' AND is_default = true
    ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;

SELECT 'Default data insertion completed successfully!' as status;
