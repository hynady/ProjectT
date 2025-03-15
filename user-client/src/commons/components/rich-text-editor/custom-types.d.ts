import { BaseEditor } from 'slate'
import { ReactEditor } from 'slate-react'
import { HistoryEditor } from 'slate-history'

export type CustomTextKey = 'bold' | 'italic' | 'underline' | 'code'

export type CustomElementType = 
  | 'paragraph'
  | 'heading-one'
  | 'heading-two'
  | 'block-quote'
  | 'bulleted-list'
  | 'numbered-list'
  | 'list-item'

export type TextAlign = 'left' | 'center' | 'right' | 'justify'

export interface CustomText {
  bold?: boolean
  italic?: boolean
  underline?: boolean
  code?: boolean
  text: string
}

export interface CustomElementBase {
  type: CustomElementType
  children: CustomText[]
}

export interface CustomElementWithAlign extends CustomElementBase {
  align?: TextAlign
}

export type CustomElement = CustomElementBase | CustomElementWithAlign

export type CustomEditor = BaseEditor & ReactEditor & HistoryEditor

declare module 'slate' {
  interface CustomTypes {
    Editor: CustomEditor
    Element: CustomElement
    Text: CustomText
  }
}
