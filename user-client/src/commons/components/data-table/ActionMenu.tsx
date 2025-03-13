import { ReactNode } from "react";
import { MoreHorizontal } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/commons/components/dropdown-menu";
import { Button } from "@/commons/components/button";

export interface ActionItem {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: 'default' | 'destructive';
}

interface ActionGroupItem {
  label: string;
  actions: ActionItem[];
}

interface ActionMenuProps {
  actions: (ActionItem | ActionGroupItem)[];
  label?: string;
  align?: 'start' | 'end' | 'center';
}

// Type guard to check if an item is a group
const isActionGroup = (item: ActionItem | ActionGroupItem): item is ActionGroupItem => {
  return 'actions' in item && Array.isArray(item.actions);
};

export const ActionMenu = ({ actions, label = "Tác vụ", align = "end" }: ActionMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">{label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align}>
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {actions.map((item, index) => {
          if (isActionGroup(item)) {
            // Render a group of actions with a label
            return (
              <div key={`group-${index}`}>
                {index > 0 && <DropdownMenuSeparator />}
                <DropdownMenuLabel className="text-xs">{item.label}</DropdownMenuLabel>
                {item.actions.map((action, actionIndex) => (
                  <DropdownMenuItem
                    key={`action-${index}-${actionIndex}`}
                    onClick={action.onClick}
                    className={action.variant === 'destructive' ? "text-destructive focus:text-destructive" : ""}
                  >
                    {action.icon && <span className="mr-2">{action.icon}</span>}
                    <span>{action.label}</span>
                  </DropdownMenuItem>
                ))}
              </div>
            );
          } else {
            // Render a single action
            return (
              <DropdownMenuItem
                key={`action-${index}`}
                onClick={item.onClick}
                className={item.variant === 'destructive' ? "text-destructive focus:text-destructive" : ""}
              >
                {item.icon && <span className="mr-2">{item.icon}</span>}
                <span>{item.label}</span>
              </DropdownMenuItem>
            );
          }
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
