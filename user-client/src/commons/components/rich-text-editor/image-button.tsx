import React, { useRef } from 'react';
import { Image } from 'lucide-react';
import { useSlate } from 'slate-react';
import { Button } from './components';
import { handleImageSelection } from './image-utils';

export const ImageButton = () => {
  const editor = useSlate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleButtonClick = (event: React.MouseEvent<HTMLSpanElement>) => {
    event.preventDefault();
    fileInputRef.current?.click();
  };
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await handleImageSelection(file, editor);
      // Reset the input value so the same file can be uploaded again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  return (
    <>
      <Button
        onMouseDown={handleButtonClick}
      >
        <Image className="h-4 w-4" />
      </Button>
      <input 
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </>
  );
};
