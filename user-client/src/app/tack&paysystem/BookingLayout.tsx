import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface BookingLayoutProps {
  children: React.ReactNode;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
  isNextDisabled?: boolean;
}

export const BookingLayout = ({
                                children,
                                currentStep,
                                totalSteps,
                                onNext,
                                onPrevious,
                                isNextDisabled = false,
                              }: BookingLayoutProps) =>{
  const steps = [
    { title: 'Chọn vé', description: 'Chọn buổi diễn và hạng vé' },
    { title: 'Chọn chỗ ngồi', description: 'Chọn vị trí ghế của bạn' },
    { title: 'Thanh toán', description: 'Hoàn tất đơn hàng' },
  ];

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-4xl mx-auto px-4">
        {/* Steps Progress */}
        <div className="mb-8">
          <div className="flex justify-between">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2
                  ${index + 1 === currentStep ? 'bg-primary text-primary-foreground' :
                  index + 1 < currentStep ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  {index + 1}
                </div>
                <div className="text-center">
                  <p className="font-medium">{step.title}</p>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="relative mt-4">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-muted -translate-y-1/2" />
            <div
              className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 transition-all duration-300"
              style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <Card className="p-6">
          {children}
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={currentStep === 0}
          >
            Quay lại
          </Button>
          <Button
            onClick={onNext}
            disabled={isNextDisabled}
          >
            {currentStep === totalSteps ? 'Hoàn tất' : 'Tiếp tục'}
          </Button>
        </div>
      </div>
    </div>
  );
}