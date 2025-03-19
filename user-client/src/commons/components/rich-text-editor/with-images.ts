import { Editor, Element, Transforms } from 'slate';
import { ImageElement } from './custom-types';

/**
 * Custom plugin that extends editor to handle images properly
 */
export const withImages = (editor: Editor) => {
  const { isVoid } = editor;

  // Mark image elements as void
  editor.isVoid = element => {
    return element.type === 'image' ? true : isVoid(element);
  };

  return editor;
};

/**
 * Insert an image element at the current selection
 */
export const insertImage = (editor: Editor, file: File): void => {
  // Create a blob URL for display (giống như cách làm trong BasicInfoForm)
  const url = URL.createObjectURL(file);
  
  const imageElement: ImageElement = {
    type: 'image',
    url,
    alt: file.name || '',
    children: [{ text: '' }],
  };

  // Insert the image node
  Transforms.insertNodes(editor, imageElement);
  
  // Insert a paragraph after the image to ensure we can continue typing
  Transforms.insertNodes(editor, {
    type: 'paragraph',
    children: [{ text: '' }],
  });
  
  // Move the cursor to the next paragraph
  Transforms.move(editor);
};

/**
 * Clean up blob URLs and transform nodes for serialization
 */
export const serializeNodes = (nodes: Element[]): Element[] => {
  return nodes.map(node => {
    if (!Element.isElement(node)) return node;

    // Handle child nodes recursively
    if ('children' in node && Array.isArray(node.children)) {
      return {
        ...node,
        children: node.children.map(child => {
          if (Element.isElement(child)) {
            return serializeNodes([child])[0];
          }
          return child;
        }),
      } as Element;
    }
    
    return node;
  });
};
