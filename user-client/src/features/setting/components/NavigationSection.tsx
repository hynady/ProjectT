import { cn } from "@/commons/lib/utils/utils";
import { Button } from "@/commons/components/button.tsx";
import { useEffect, useState } from "react";

export interface NavSection {
  id: string;
  title: string;
}

interface NavigationSectionProps {
  sections: NavSection[];
  className?: string;
}

export function NavigationSection({ sections, className }: NavigationSectionProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  
  useEffect(() => {
    const handleScroll = () => {
      // Get all section elements
      const sectionElements = sections.map(section => 
        document.getElementById(section.id)
      ).filter(Boolean) as HTMLElement[];
      
      // If no sections, return
      if (sectionElements.length === 0) return;
      
      // Find which section is visible - use a 200px offset to make sections activate sooner
      const currentScrollPosition = window.scrollY + 200;
      
      // Find the last section that starts before the current scroll position
      let currentSection = sectionElements[0].id;
      for (const section of sectionElements) {
        if (section.offsetTop <= currentScrollPosition) {
          currentSection = section.id;
        } else {
          break;
        }
      }
      
      setActiveSection(currentSection);
    };
    
    // Initial check
    handleScroll();
    
    // Add scroll event listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [sections]);
  
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      // Add a small offset to account for any fixed headers
      const yOffset = -100;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      
      window.scrollTo({ top: y, behavior: 'smooth' });
      setActiveSection(id);
    }
  };
  
  if (sections.length === 0) {
    return null;
  }
  
  return (
    <div className={cn("flex flex-col space-y-1", className)}>
      <h3 className="text-sm font-medium mb-2">Trong trang này</h3>
      {sections.map((section) => (
        <Button
          key={section.id}
          variant="ghost"
          size="sm"
          className={cn(
            "justify-start text-sm hover:bg-transparent hover:underline h-8",
            section.id === activeSection 
              ? "font-medium" 
              : "text-muted-foreground font-normal"
          )}
          onClick={() => scrollToSection(section.id)}
        >
          {section.title}
        </Button>
      ))}
    </div>
  );
}
