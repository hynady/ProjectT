import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/commons/components/context-menu";
import { Editor } from "slate";
import { CustomEditor } from "./editor-utils";
import { 
  Bold, Italic, Underline, Code,
  AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, Quote, Heading1, Heading2
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/commons/components/tooltip";

interface EditorContextMenuProps {
  children: React.ReactNode;
  editor: Editor;
}

function TooltipMenuItem({ children, tooltip, onSelect }: { children: React.ReactNode, tooltip: string, onSelect: () => void }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <ContextMenuItem 
            className="flex items-center gap-2"
            onSelect={onSelect}
          >
            {children}
          </ContextMenuItem>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function EditorContextMenu({ children, editor }: EditorContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <div className="grid grid-cols-4 gap-1 p-1">
          <TooltipMenuItem 
            tooltip="In đậm (Ctrl+B)"
            onSelect={() => CustomEditor.toggleBold(editor)}
          >
            <Bold className="h-4 w-4" />
          </TooltipMenuItem>
          <TooltipMenuItem 
            tooltip="In nghiêng (Ctrl+I)"
            onSelect={() => CustomEditor.toggleItalic(editor)}
          >
            <Italic className="h-4 w-4" />
          </TooltipMenuItem>
          <TooltipMenuItem 
            tooltip="Gạch chân (Ctrl+U)"
            onSelect={() => CustomEditor.toggleUnderline(editor)}
          >
            <Underline className="h-4 w-4" />
          </TooltipMenuItem>
          <TooltipMenuItem 
            tooltip="Code (Ctrl+`)"
            onSelect={() => CustomEditor.toggleCode(editor)}
          >
            <Code className="h-4 w-4" />
          </TooltipMenuItem>
        </div>

        <ContextMenuSeparator />

        <div className="grid grid-cols-3 gap-1 p-1">
          <TooltipMenuItem 
            tooltip="Căn trái"
            onSelect={() => CustomEditor.toggleAlign(editor, 'left')}
          >
            <AlignLeft className="h-4 w-4" />
          </TooltipMenuItem>
          <TooltipMenuItem 
            tooltip="Căn giữa"
            onSelect={() => CustomEditor.toggleAlign(editor, 'center')}
          >
            <AlignCenter className="h-4 w-4" />
          </TooltipMenuItem>
          <TooltipMenuItem 
            tooltip="Căn phải"
            onSelect={() => CustomEditor.toggleAlign(editor, 'right')}
          >
            <AlignRight className="h-4 w-4" />
          </TooltipMenuItem>
        </div>

        <ContextMenuSeparator />

        <TooltipMenuItem 
          tooltip="Tiêu đề 1"
          onSelect={() => CustomEditor.toggleBlock(editor, 'heading-one')}
        >
          <Heading1 className="h-4 w-4" />
          <span>Heading 1</span>
        </TooltipMenuItem>
        <TooltipMenuItem 
          tooltip="Tiêu đề 2"
          onSelect={() => CustomEditor.toggleBlock(editor, 'heading-two')}
        >
          <Heading2 className="h-4 w-4" />
          <span>Heading 2</span>
        </TooltipMenuItem>
        <TooltipMenuItem 
          tooltip="Trích dẫn"
          onSelect={() => CustomEditor.toggleBlock(editor, 'block-quote')}
        >
          <Quote className="h-4 w-4" />
          <span>Quote</span>
        </TooltipMenuItem>
        <TooltipMenuItem 
          tooltip="Danh sách gạch đầu dòng"
          onSelect={() => CustomEditor.toggleBlock(editor, 'bulleted-list')}
        >
          <List className="h-4 w-4" />
          <span>Bullet List</span>
        </TooltipMenuItem>
        <TooltipMenuItem 
          tooltip="Danh sách đánh số"
          onSelect={() => CustomEditor.toggleBlock(editor, 'numbered-list')}
        >
          <ListOrdered className="h-4 w-4" />
          <span>Numbered List</span>
        </TooltipMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
