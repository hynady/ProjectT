import isHotkey from 'is-hotkey';
import { useCallback, useMemo, KeyboardEvent, useEffect } from "react";
import { createEditor, Element } from "slate";
import { Slate, Editable, withReact, RenderElementProps, RenderLeafProps } from "slate-react";
import { withHistory } from "slate-history";
import { cn } from "@/commons/lib/utils/utils";
import { CustomEditor, initialValue } from "./rich-text-editor/editor-utils";
import { Toolbar } from "./rich-text-editor/toolbar";
import { CustomTextKey, ImageElement } from './rich-text-editor/custom-types';
import { cleanupBlobUrls } from './rich-text-editor/image-utils';
import { withImages, serializeNodes } from './rich-text-editor/with-images';
import { EditorContextMenu } from "./rich-text-editor/context-menu";

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
  const editor = useMemo(() => withImages(withHistory(withReact(createEditor()))), []);

  const initialEditorValue = useMemo(() => {
    if (!value) {
      return initialValue;
    }

    try {
      // Đảm bảo value là một chuỗi JSON hợp lệ
      const parsed = JSON.parse(value);
      
      // Kiểm tra nếu parsed là một mảng và có ít nhất một phần tử
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
      
      // Nếu không phải mảng hoặc mảng rỗng, tạo một đoạn văn với nội dung là value
      return [
        {
          type: 'paragraph',
          children: [{ text: String(parsed) }],
        },
      ];
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // Nếu không parse được JSON, tạo một đoạn văn với nội dung là value
      return [
        {
          type: 'paragraph',
          children: [{ text: value }],
        },
      ];
    }
  }, [value]);

  // Dọn dẹp blob URLs khi component unmount
  useEffect(() => {
    return () => {
      cleanupBlobUrls();
    };
  }, []);

  // Log giá trị đầu vào để debug
  useEffect(() => {
    // console.log("RichTextEditor value changed:", value);
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
      case 'image': {
        const imageElement = element as ImageElement;
        
        return (
          <div {...attributes} className="my-4 relative">
            <div contentEditable={false}>
              {imageElement.url ? (
                <img 
                  src={imageElement.url}
                  alt={imageElement.alt || ''}
                  className="max-w-full rounded-md"
                />
              ) : (
                <div className="bg-muted h-32 w-full flex items-center justify-center rounded-md">
                  <span className="text-muted-foreground">Image not available</span>
                </div>
              )}
            </div>
            {/* This is needed to keep the editor working correctly */}
            <span style={{ display: 'none' }}>{children}</span>
          </div>
        );
      }
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
      "flex flex-col max-h-[2000px]",
      className
    )}>
      <Slate 
        editor={editor} 
        initialValue={initialEditorValue} 
        onChange={value => {
          const isAstChange = editor.operations.some(op => 'set_selection' !== op.type);
          if (isAstChange) {
            // Serialize the nodes
            const serialized = serializeNodes(value.filter(node => Element.isElement(node)) as Element[]);
            const jsonValue = JSON.stringify(serialized);
            // console.log("Editor changed, new value:", jsonValue); // Log để debug
            onChange(jsonValue);
          }
        }}
      >
        {disabled ? null : <Toolbar />}
        <div className="px-3 py-2 flex-1 overflow-auto min-h-0">
          <EditorContextMenu editor={editor}>
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
                  if (isHotkey(hotkey, event.nativeEvent)) {
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
          </EditorContextMenu>
        </div>
      </Slate>
    </div>
  );
}
