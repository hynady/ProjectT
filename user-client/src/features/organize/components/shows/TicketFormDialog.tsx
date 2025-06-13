import { useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/commons/components/dialog";
import { Button } from "@/commons/components/button";
import { Input } from "@/commons/components/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/commons/components/form";

const ticketSchema = z.object({
  type: z.string({
    required_error: "Vui lòng nhập loại vé",
  }).min(2, {
    message: "Tên loại vé phải có ít nhất 2 ký tự",
  }),
  price: z.coerce.number({
    required_error: "Vui lòng nhập giá vé",
    invalid_type_error: "Giá vé phải là số",
  }).min(0, {
    message: "Giá vé không thể âm",
  }),
  availableQuantity: z.coerce.number({
    required_error: "Vui lòng nhập số lượng vé",
    invalid_type_error: "Số lượng vé phải là số",
  }).min(0, {
    message: "Số lượng vé không thể âm",
  }),
});

export type TicketFormValues = z.infer<typeof ticketSchema>;

export interface TicketFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (values: TicketFormValues) => void;
  showName?: string;
  initialValues?: TicketFormValues;
  isEditing: boolean;
  title?: string;
  isSubmitting?: boolean;
}

export const TicketFormDialog = ({
  open,
  onOpenChange,
  onSave,
  showName,
  initialValues,
  isEditing,
  title,
  isSubmitting = false, // Default value if not provided
}: TicketFormDialogProps) => {
  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketSchema),    
    defaultValues: initialValues || {
      type: "",
      price: 0,
      availableQuantity: 0,
    },
  });

  // Reset form when dialog opens or initialValues change
  useEffect(() => {
    if (open && initialValues) {
      form.reset(initialValues);
    }
  }, [open, initialValues, form]);

  const onSubmit = (values: TicketFormValues) => {
    onSave(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {title || (isEditing ? "Sửa loại vé" : "Thêm loại vé mới")}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            {showName && (
              <div className="text-sm text-muted-foreground mb-2">
                Đang thêm vé cho suất diễn: <span className="font-medium text-foreground">{showName}</span>
              </div>
            )}

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loại vé</FormLabel>
                  <FormControl>
                    <Input placeholder="VD: VIP, Standard, Economy..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />                  
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Giá vé (VNĐ)</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="VD: 500,000"
                      name={field.name}
                      value={field.value === 0 ? '0' : field.value.toLocaleString('vi-VN')}
                      onChange={(e) => {
                        // Remove all non-numeric characters
                        const numericValue = e.target.value.replace(/[^\d]/g, '');
                        const value = parseInt(numericValue) || 0;
                        field.onChange(Math.max(0, value));
                      }}
                      onBlur={field.onBlur}
                      onFocus={(e) => {
                        // Select all text when focus, so user can easily replace
                        e.target.select();
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />            
            <FormField
              control={form.control}
              name="availableQuantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số lượng vé</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="VD: 100"
                      name={field.name}
                      value={field.value.toString()}
                      onChange={(e) => {
                        // Remove all non-numeric characters
                        const numericValue = e.target.value.replace(/[^\d]/g, '');
                        const value = parseInt(numericValue) || 0;
                        field.onChange(Math.max(0, value));
                      }}
                      onBlur={field.onBlur}
                      onFocus={(e) => {
                        // Select all text when focus, so user can easily replace
                        e.target.select();
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button variant="outline" type="button" disabled={isSubmitting}>
                  Hủy bỏ
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting} loading={isSubmitting}>
                {isSubmitting 
                  ? (isEditing ? "Đang cập nhật..." : "Đang thêm...") 
                  : (isEditing ? "Cập nhật" : "Thêm")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
