import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/commons/components/accordion.tsx';

export const OccaFAQs = () => {
  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold text-card-foreground mb-4">Câu hỏi thường gặp</h2>
      <div className="space-y-4">
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Làm thế nào để đặt vé?</AccordionTrigger>
            <AccordionContent>
              Bạn có thể đặt vé trực tiếp trên website bằng cách chọn loại vé mong muốn và thực hiện thanh toán online.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Chính sách đổi/trả vé?</AccordionTrigger>
            <AccordionContent>
              Vé đã mua không được đổi hoặc hoàn tiền, trừ trường hợp sự kiện bị hủy bởi ban tổ chức.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>Có giảm giá cho nhóm không?</AccordionTrigger>
            <AccordionContent>
              Có ưu đãi đặc biệt cho nhóm từ 10 người trở lên. Vui lòng liên hệ ban tổ chức để biết thêm chi tiết.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  );
};