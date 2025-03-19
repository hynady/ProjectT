import React from "react";
import { cn } from "@/commons/lib/utils/utils";

interface SlateTextNode {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  code?: boolean;
}

interface SlateElementProps {
  type: string;
  children: SlateTextNode[];
  align?: 'left' | 'center' | 'right' | 'justify';
  url?: string;
  alt?: string;
}

interface SlateContentRendererProps {
  content: string;
  className?: string;
}

export const SlateContentRenderer: React.FC<SlateContentRendererProps> = ({ content, className }) => {
  let parsedContent: SlateElementProps[] = [];
  
  try {
    parsedContent = JSON.parse(content);
  } catch (error) {
    console.error("Failed to parse Slate content:", error);
    return <div className={className}>Error rendering content</div>;
  }

  if (!Array.isArray(parsedContent) || parsedContent.length === 0) {
    return <div className={className}>No content</div>;
  }

  const renderLeaf = (text: SlateTextNode) => {
    let content: React.ReactNode = text.text;

    if (text.bold) {
      content = <strong>{content}</strong>;
    }
    if (text.italic) {
      content = <em>{content}</em>;
    }
    if (text.underline) {
      content = <u>{content}</u>;
    }
    if (text.code) {
      content = <code className="bg-gray-100 px-1 py-0.5 rounded">{content}</code>;
    }

    return content;
  };

  const renderElement = (element: SlateElementProps, index: number) => {
    const style: React.CSSProperties = {};
    if (element.align) {
      style.textAlign = element.align;
    }

    const children = element.children.map((child, childIndex) => (
      <React.Fragment key={childIndex}>
        {renderLeaf(child)}
      </React.Fragment>
    ));

    switch (element.type) {
      case 'paragraph':
        return (
          <p key={index} style={style} className="mb-4">
            {children}
          </p>
        );
      case 'heading-one':
        return (
          <h1 key={index} style={style} className="text-2xl font-bold my-4">
            {children}
          </h1>
        );
      case 'heading-two':
        return (
          <h2 key={index} style={style} className="text-xl font-bold my-3">
            {children}
          </h2>
        );
      case 'block-quote':
        return (
          <blockquote key={index} style={style} className="pl-4 border-l-2 border-gray-300 italic my-4">
            {children}
          </blockquote>
        );
      case 'bulleted-list':
        return (
          <ul key={index} style={{ ...style, listStyleType: 'disc', paddingInlineStart: '1.5em' }} className="my-4">
            {children}
          </ul>
        );
      case 'numbered-list':
        return (
          <ol key={index} style={{ ...style, listStyleType: 'decimal', paddingInlineStart: '1.5em' }} className="my-4">
            {children}
          </ol>
        );
      case 'list-item':
        return (
          <li key={index} style={style} className="mb-1">
            {children}
          </li>
        );
      case 'image':
        return (
          <div key={index} style={style} className="my-4">
            <img src={element.url} alt={element.alt || ''} className="max-w-full rounded" />
          </div>
        );
      default:
        return (
          <p key={index} style={style}>
            {children}
          </p>
        );
    }
  };

  return (
    <div className={cn("slate-content", className)}>
      {parsedContent.map((element, index) => renderElement(element, index))}
    </div>
  );
};
