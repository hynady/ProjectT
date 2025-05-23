import React from "react";
import { useSlate } from "slate-react";
import { 
  Bold, Italic, Underline, Code,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Quote, Heading1, Heading2
} from "lucide-react";
import { Button } from "./components";
import { CustomEditor } from "./editor-utils";
import { CustomElementType, CustomTextKey, TextAlign } from "./custom-types";

// Text formatting buttons
export const MarkButton = ({ format, icon, tooltip }: { format: CustomTextKey, icon: React.ReactNode, tooltip: string }) => {
  const editor = useSlate();
  let isActive = false;

  switch (format) {
    case 'bold':
      isActive = CustomEditor.isBoldActive(editor);
      break;
    case 'italic':
      isActive = CustomEditor.isItalicActive(editor);
      break;
    case 'underline':
      isActive = CustomEditor.isUnderlineActive(editor);
      break;
    case 'code':
      isActive = CustomEditor.isCodeActive(editor);
      break;
  }

  return (
    <Button
      active={isActive}
      tooltip={tooltip}
      onMouseDown={(event) => {
        event.preventDefault();
        switch (format) {
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
      }}
    >
      {icon}
    </Button>
  );
};

// Block formatting buttons
export const BlockButton = ({ format, icon, tooltip }: { format: CustomElementType | TextAlign, icon: React.ReactNode, tooltip: string }) => {
  const editor = useSlate();
  const isAlign = ['left', 'center', 'right', 'justify'].includes(format);
  
  const isActive = isAlign 
    ? CustomEditor.isAlignActive(editor, format as TextAlign)
    : CustomEditor.isBlockActive(editor, format as CustomElementType);

  return (
    <Button
      active={isActive}
      tooltip={tooltip}
      onMouseDown={(event) => {
        event.preventDefault();
        if (isAlign) {
          CustomEditor.toggleAlign(editor, format as TextAlign);
        } else {
          CustomEditor.toggleBlock(editor, format as CustomElementType);
        }
      }}
    >
      {icon}
    </Button>
  );
};

// Pre-configured buttons
export const BoldButton = () => (
  <MarkButton format="bold" icon={<Bold className="h-4 w-4" />} tooltip="Bold (⌘+B)" />
);

export const ItalicButton = () => (
  <MarkButton format="italic" icon={<Italic className="h-4 w-4" />} tooltip="Italic (⌘+I)" />
);

export const UnderlineButton = () => (
  <MarkButton format="underline" icon={<Underline className="h-4 w-4" />} tooltip="Underline (⌘+U)" />
);

export const CodeButton = () => (
  <MarkButton format="code" icon={<Code className="h-4 w-4" />} tooltip="Code (⌘+`)" />
);

export const HeadingOneButton = () => (
  <BlockButton format="heading-one" icon={<Heading1 className="h-4 w-4" />} tooltip="Heading 1 (⌘+1)" />
);

export const HeadingTwoButton = () => (
  <BlockButton format="heading-two" icon={<Heading2 className="h-4 w-4" />} tooltip="Heading 2 (⌘+2)" />
);

export const BlockQuoteButton = () => (
  <BlockButton format="block-quote" icon={<Quote className="h-4 w-4" />} tooltip="Block Quote (⌘+Q)" />
);

export const AlignLeftButton = () => (
  <BlockButton format="left" icon={<AlignLeft className="h-4 w-4" />} tooltip="Align Left (⌘+L)" />
);

export const AlignCenterButton = () => (
  <BlockButton format="center" icon={<AlignCenter className="h-4 w-4" />} tooltip="Align Center (⌘+E)" />
);

export const AlignRightButton = () => (
  <BlockButton format="right" icon={<AlignRight className="h-4 w-4" />} tooltip="Align Right (⌘+R)" />
);

export const AlignJustifyButton = () => (
  <BlockButton format="justify" icon={<AlignJustify className="h-4 w-4" />} tooltip="Align Justify (⌘+J)" />
);

export const BulletListButton = () => (
  <BlockButton format="bulleted-list" icon={<List className="h-4 w-4" />} tooltip="Bullet List (⌘+Shift+8)" />
);

export const NumberedListButton = () => (
  <BlockButton format="numbered-list" icon={<ListOrdered className="h-4 w-4" />} tooltip="Numbered List (⌘+Shift+7)" />
);

export { ImageButton } from './image-button';
