import React from "react";
import { Toolbar as ToolbarContainer } from "./components";
import { 
  BoldButton, 
  ItalicButton, 
  UnderlineButton,
  CodeButton,
  HeadingOneButton,
  HeadingTwoButton,
  BlockQuoteButton,
  AlignLeftButton,
  AlignCenterButton,
  AlignRightButton,
  AlignJustifyButton,
  BulletListButton,
  NumberedListButton
} from "./format-buttons";

export const Toolbar = () => {
  return (
    <ToolbarContainer>
      <BoldButton />
      <ItalicButton />
      <UnderlineButton />
      <CodeButton />

      <div className="h-6 border-l mx-1"></div>

      <HeadingOneButton />
      <HeadingTwoButton />
      <BlockQuoteButton />

      <div className="h-6 border-l mx-1"></div>

      <AlignLeftButton />
      <AlignCenterButton />
      <AlignRightButton />
      <AlignJustifyButton />

      <div className="h-6 border-l mx-1"></div>
      
      <BulletListButton />
      <NumberedListButton />
    </ToolbarContainer>
  );
};
