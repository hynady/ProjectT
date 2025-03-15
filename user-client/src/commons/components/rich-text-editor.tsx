import isHotkey from 'is-hotkey';
import { useCallback, useMemo, KeyboardEvent } from "react";
import { createEditor } from "slate";
import { Slate, Editable, withReact, RenderElementProps, RenderLeafProps } from "slate-react";
import { withHistory } from "slate-history";
import { cn } from "@/commons/lib/utils/utils";
import { CustomEditor, initialValue } from "./rich-text-editor/editor-utils";
import { Toolbar } from "./rich-text-editor/toolbar";
import { CustomTextKey } from './rich-text-editor/custom-types';

const HOTKEYS: Record<string, CustomTextKey> = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
  'mod+`': 'code',
};

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function RichTextEditor({ 
  value, 
  onChange,
  placeholder,
  className,
  disabled 
}: RichTextEditorProps) {
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  const initialEditorValue = useMemo(() => {
    try {
      const parsed = JSON.parse(value);
      return parsed.length ? parsed : initialValue;
    } catch {
      return value ? [
        {
          type: 'paragraph',
          children: [{ text: value }],
        },
      ] : initialValue;
    }
  }, [value]);

  const renderElement = useCallback((props: RenderElementProps) => {
    const { attributes, children, element } = props;
    const style: React.CSSProperties = {};
    
    // Handle alignment
    if ('align' in element && element.align) {
      style.textAlign = element.align;
    }
    
    // Handle different block types
    switch (element.type) {
      case 'block-quote':
        return (
          <blockquote style={style} className="pl-4 border-l-2 border-gray-300" {...attributes}>
            {children}
          </blockquote>
        );
      case 'bulleted-list':
        return (
          <ul style={{ ...style, listStyleType: 'disc', paddingInlineStart: '1.5em' }} {...attributes}>
            {children}
          </ul>
        );
      case 'heading-one':
        return (
          <h1 style={style} className="text-2xl font-bold my-2" {...attributes}>
            {children}
          </h1>
        );
      case 'heading-two':
        return (
          <h2 style={style} className="text-xl font-bold my-2" {...attributes}>
            {children}
          </h2>
        );
      case 'list-item':
        return (
          <li style={style} {...attributes}>
            {children}
          </li>
        );
      case 'numbered-list':
        return (
          <ol style={{ ...style, listStyleType: 'decimal', paddingInlineStart: '1.5em' }} {...attributes}>
            {children}
          </ol>
        );
      default:
        return <p style={style} {...attributes}>{children}</p>;
    }
  }, []);

  const renderLeaf = useCallback((props: RenderLeafProps) => {
    const { attributes, children, leaf } = props;
    let el = children;

    if (leaf.bold) {
      el = <strong>{el}</strong>;
    }
    if (leaf.italic) {
      el = <em>{el}</em>;
    }
    if (leaf.underline) {
      el = <u>{el}</u>;
    }
    if (leaf.code) {
      el = <code className="bg-gray-100 px-1 py-0.5 rounded">{el}</code>;
    }

    return <span {...attributes}>{el}</span>;
  }, []);

  return (
    <div className={cn(
      "rounded-md border border-input bg-background text-sm ring-offset-background",
      "focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
      disabled && "cursor-not-allowed opacity-50",
      className
    )}>
      <Slate editor={editor} initialValue={initialEditorValue} onChange={value => {
        const isAstChange = editor.operations.some(op => 'set_selection' !== op.type);
        if (isAstChange) {
          onChange(JSON.stringify(value));
        }
      }}>
        <Toolbar />
        <div className="px-3 py-2">
          <Editable 
            className="outline-none selection:bg-primary selection:text-primary-foreground min-h-[100px]"
            spellCheck={false}
            placeholder={placeholder}
            readOnly={disabled}
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
              // Handle hotkeys
              for (const hotkey in HOTKEYS) {
                if (isHotkey(hotkey, event as any)) {
                  event.preventDefault();
                  const mark = HOTKEYS[hotkey];
                  
                  switch (mark) {
                    case 'bold':
                      CustomEditor.toggleBold(editor);
                      break;
                    case 'italic':
                      CustomEditor.toggleItalic(editor);
                      break;
                    case 'underline':
                      CustomEditor.toggleUnderline(editor);
                      break;
                    case 'code':
                      CustomEditor.toggleCode(editor);
                      break;
                  }
                }
              }
            }}
          />
        </div>
      </Slate>
    </div>
  );
}
