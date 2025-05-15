import { Editor, Transforms, Element as SlateElement } from "slate";
import { CustomElementBase, CustomElementType, CustomElementWithAlign, CustomTextKey, TextAlign } from "./custom-types";

export const LIST_TYPES = ['numbered-list', 'bulleted-list'] as const;
export const TEXT_ALIGN_TYPES = ['left', 'center', 'right', 'justify'] as const;

type ElementFormat = CustomElementType | TextAlign;

export const CustomEditor = {
  isBoldActive(editor: Editor) {
    const marks = Editor.marks(editor);
    return marks ? marks.bold === true : false;
  },

  isItalicActive(editor: Editor) {
    const marks = Editor.marks(editor);
    return marks ? marks.italic === true : false;
  },

  isUnderlineActive(editor: Editor) {
    const marks = Editor.marks(editor);
    return marks ? marks.underline === true : false;
  },

  isCodeActive(editor: Editor) {
    const marks = Editor.marks(editor);
    return marks ? marks.code === true : false;
  },

  toggleBold(editor: Editor) {
    toggleMark(editor, 'bold');
  },

  toggleItalic(editor: Editor) {
    toggleMark(editor, 'italic');
  },

  toggleUnderline(editor: Editor) {
    toggleMark(editor, 'underline');
  },

  toggleCode(editor: Editor) {
    toggleMark(editor, 'code');
  },

  isAlignActive(editor: Editor, align: TextAlign) {
    return isBlockActive(editor, align, 'align');
  },
  
  toggleAlign(editor: Editor, align: TextAlign) {
    toggleBlock(editor, align);
  },

  isBlockActive(editor: Editor, blockType: CustomElementType) {
    return isBlockActive(editor, blockType, 'type');
  },

  toggleBlock(editor: Editor, blockType: CustomElementType) {
    toggleBlock(editor, blockType);
  }
};

const toggleMark = (editor: Editor, format: CustomTextKey) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const isMarkActive = (editor: Editor, format: CustomTextKey) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

const isBlockActive = (
  editor: Editor,
  format: ElementFormat,
  blockType: 'type' | 'align' = 'type'
) => {
  const { selection } = editor;
  if (!selection) return false;

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: n => {
        if (!Editor.isEditor(n) && SlateElement.isElement(n)) {
          if (blockType === 'align') {
            return (n as CustomElementWithAlign).align === format;
          }
          return (n as CustomElementBase).type === format;
        }
        return false;
      },
    })
  );

  return !!match;
};

const isListType = (format: ElementFormat): format is typeof LIST_TYPES[number] => {
  return LIST_TYPES.includes(format as typeof LIST_TYPES[number]);
};

const isAlignType = (format: ElementFormat): format is TextAlign => {
  return TEXT_ALIGN_TYPES.includes(format as TextAlign);
};

const toggleBlock = (editor: Editor, format: ElementFormat) => {
  const isActive = isBlockActive(
    editor,
    format,
    isAlignType(format) ? 'align' : 'type'
  );
  const isList = isListType(format);

  Transforms.unwrapNodes(editor, {
    match: n =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      isListType((n as CustomElementBase).type) &&
      !isAlignType(format),
    split: true,
  });
  
  let newProperties: Partial<SlateElement>;
  if (isAlignType(format)) {
    newProperties = {
      align: isActive ? undefined : format,
    };
  } else {
    newProperties = {
      type: isActive ? 'paragraph' : isList ? 'list-item' : format,
    };
  }
  
  Transforms.setNodes(editor, newProperties);

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

export const initialValue = [
  {
    type: 'paragraph' as CustomElementType,
    children: [{ text: '' }],
  },
];
