// components/common/MarkdownContent.tsx

import { cn } from "@/commons/lib/utils/utils"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface MarkdownContentProps {
  content: string
  className?: string
}

const MarkdownContent = ({
                           content,
                           className,
                         }: MarkdownContentProps) => {
  return (
    <div className={cn("markdown-wrapper", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        className={cn("prose prose-invert max-w-none space-y-6",
          // Headings
          "[&>h1]:text-4xl [&>h1]:font-bold [&>h1]:tracking-tight [&>h1]:lg:text-4xl [&>h1]:mb-4",
          "[&>h2]:text-3xl [&>h2]:font-semibold [&>h2]:tracking-tight [&>h2]:mb-3",
          "[&>h3]:text-2xl [&>h3]:font-semibold [&>h3]:tracking-tight [&>h3]:mb-2",
          "[&>h4]:text-xl [&>h4]:font-semibold [&>h4]:tracking-tight [&>h4]:mb-2",

          // Paragraphs
          "[&>p]:leading-7 [&>p]:text-muted-foreground",
          "[&>p:not(:first-child)]:mt-4",

          // Lists
          "[&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-4",
          "[&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-4",
          "[&>ul>li]:mt-2 [&>ol>li]:mt-2",

          // Images
          "[&_img]:rounded-lg [&_img]:shadow-md [&_img]:w-full [&_img]:object-cover [&_img]:my-4",
          "[&_p>img]:rounded-lg [&_p>img]:shadow-md [&_p>img]:w-full [&_p>img]:object-cover",

          // Links - Điều chỉnh style cho links
          "[&_a]:text-primary [&_a]:no-underline [&_a]:font-medium [&_a]:transition-colors",
          "[&_a:hover]:text-primary/80 [&_a:hover]:underline [&_a:hover]:underline-offset-4",

          // Blockquotes
          "[&>blockquote]:border-l-2 [&>blockquote]:border-muted [&>blockquote]:pl-6 [&>blockquote]:italic [&>blockquote]:my-4",

          // Tables
          "[&>table]:w-full [&>table]:border-collapse [&>table]:border [&>table]:border-border",
          "[&>table>thead>tr>th]:border [&>table>thead>tr>th]:border-border [&>table>thead>tr>th]:px-4 [&>table>thead>tr>th]:py-2 [&>table>thead>tr>th]:text-left",
          "[&>table>tbody>tr>td]:border [&>table>tbody>tr>td]:border-border [&>table>tbody>tr>td]:px-4 [&>table>tbody>tr>td]:py-2",

          // Code blocks
          "[&>pre]:rounded-lg [&>pre]:bg-muted [&>pre]:p-4 [&>pre]:overflow-x-auto",
          "[&>code]:relative [&>code]:rounded [&>code]:bg-muted [&>code]:px-[0.3rem] [&>code]:py-[0.2rem] [&>code]:font-mono [&>code]:text-sm",

          // Horizontal rules
          "[&>hr]:my-8 [&>hr]:border-t [&>hr]:border-border"
        )}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

export default MarkdownContent