import { Button } from '@/commons/components/button.tsx';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/commons/components/dialog.tsx';
import { Share2, Heart, Facebook, Twitter, MessageCircle, Link as LinkIcon } from 'lucide-react';

export const OccaHeroActions = () => {
  return (
    <div className="hidden sm:flex gap-2 sm:gap-4 justify-start sm:justify-end">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon" className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12">
            <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5"/>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chia sẻ sự kiện</DialogTitle>
            <DialogDescription>
              Chia sẻ sự kiện này với bạn bè của bạn qua các kênh sau
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-4 gap-4 py-4">
            <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4">
              <Facebook className="h-5 w-5"/>
              <span className="text-sm">Facebook</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4">
              <Twitter className="h-5 w-5"/>
              <span className="text-sm">Twitter</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4">
              <MessageCircle className="h-5 w-5"/>
              <span className="text-sm">Message</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4">
              <LinkIcon className="h-5 w-5"/>
              <span className="text-sm">Copy Link</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Button variant="outline" size="icon" className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12">
        <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5"/>
      </Button>
    </div>
  );
};