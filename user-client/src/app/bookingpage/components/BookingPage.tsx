import {useEffect, useState} from 'react';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import {Card} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {ShowSelection} from '../components/ShowSelection';
import {TicketSelection} from '../components/TicketSelection';
import {Confirmation} from './Confirmation.tsx';
import useBooking from '../hooks/useBooking';
import {useOccaData} from '../hooks/useOccaData';
import {BookingSummary} from "@/app/bookingpage/components/BookingSummary.tsx";
import {PaymentSuccess} from "@/app/bookingpage/components/PaymentSuccess.tsx";
import {PaymentMethods} from "@/app/bookingpage/components/PaymentMethods.tsx";
import {BookingSkeleton} from "@/app/bookingpage/components/skeleton/BookingSkeleton.tsx";
import {ProgressSteps} from "@/app/bookingpage/components/fragments/ProgressSteps.tsx";
import {ScrollToTop} from "@/components/global/ScrollToTop.tsx";
import {ArrowLeft} from "lucide-react";

const BookingPage = () => {
  const {id} = useParams<{ id: string }>();
  const {data: occaData, loading} = useOccaData(id || '');
  const [step, setStep] = useState(1);
  const {bookingState, selectShow, updateTickets} = useBooking();
  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);
  const { state } = useLocation();
  const navigate = useNavigate();

  const steps = [
    {title: 'Chọn suất diễn', completed: !!bookingState.selectedShow},
    {title: 'Chọn vé', completed: bookingState.selectedTickets.length > 0},
    {title: 'Kiểm tra', completed: false},
    {title: 'Thanh toán', completed: false}
  ];

  useEffect(() => {
    if (state?.skipToStep && state?.selectedInfo) {
      const { show, ticket } = state.selectedInfo;

      // Set selected show
      selectShow(show);

      // Set selected ticket
      updateTickets(
        {
          type: ticket.type,
          price: ticket.price,
          available: getCurrentShow()?.prices.find(p => p.type === ticket.type)?.available || 0
        },
        ticket.quantity
      );

      // Chuyển đến bước 2
      setStep(2);
    }
  }, [state, occaData]);


  const handleStepClick = (index: number) => {
    // Chỉ cho phép chuyển đến các bước đã hoàn thành hoặc bước tiếp theo
    if (index < step || (index === step + 1 && steps[step - 1].completed)) {
      setStep(index);
    }
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleConfirmPayment = () => {
    setStep(4);
  };

  const getCurrentShow = () => {
    if (!bookingState.selectedShow) return null;
    return occaData?.shows.find(
      show =>
        show.date === bookingState.selectedShow?.date &&
        show.time === bookingState.selectedShow?.time
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto py-16 px-4 md:px-8">
        <BookingSkeleton/>
      </div>
    );
  }

  return (
    <ScrollToTop>
      <div className="container mx-auto py-16 px-4 md:px-8">
        {/* Header Card */}
        <Card className="mb-6">
          <div className="p-6 space-y-6">
            {/* Title Section - Updated */}
            <div className="flex items-start justify-between gap-4">
              {/* Back button and Title */}
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  className="mb-2 -ml-3 h-9 flex items-center text-muted-foreground hover:text-foreground"
                  onClick={() => navigate(`/occas/${id}`)}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Trở về trang chi tiết
                </Button>
                <h1 className="text-xl md:text-2xl font-bold text-foreground">
                  Đặt vé {occaData?.title}
                </h1>
                <p className="text-muted-foreground">
                  Hoàn tất đặt vé của bạn qua {steps.length} bước đơn giản
                </p>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="px-6 mx-6 mb-6 pb-6">
              <ProgressSteps
                steps={steps}
                currentStep={step}
                onStepClick={handleStepClick}
              />
            </div>
          </div>
        </Card>

        {/* Main Content - 2 columns layout on large screens */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-6">
          {/* Main booking form */}
          <div className="lg:col-span-7">
            <Card className="p-4 md:p-6 mb-6 lg:mb-0">
              {step === 1 && occaData && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-foreground">
                    Chọn ngày và giờ diễn
                  </h2>
                  <ShowSelection
                    shows={occaData.shows}
                    onSelectShow={selectShow}
                    selectedShow={bookingState.selectedShow}
                  />
                  <div className="flex justify-end mt-6">
                    <Button
                      onClick={() => setStep(2)}
                      disabled={!bookingState.selectedShow}
                    >
                      Tiếp tục
                    </Button>
                  </div>
                </div>
              )}

              {step === 2 && getCurrentShow() && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-foreground">
                    Chọn loại vé và số lượng
                  </h2>
                  <TicketSelection
                    tickets={getCurrentShow()!.prices}
                    onUpdateTickets={updateTickets}
                    selectedTickets={bookingState.selectedTickets}
                  />
                  <div className="flex gap-4 justify-end mt-6">
                    <Button
                      variant="outline"
                      onClick={handleBack}
                    >
                      Quay lại
                    </Button>
                    <Button
                      onClick={() => setStep(3)}
                      disabled={bookingState.selectedTickets.length === 0}
                    >
                      Tiếp tục
                    </Button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-foreground">
                    Chi tiết thanh toán
                  </h2>
                  <Confirmation
                    bookingState={bookingState}
                    occaInfo={occaData!}
                    onConfirmPayment={handleConfirmPayment}
                    onBack={handleBack}
                  />
                </div>
              )}

              {step === 4 && (
                <div>
                  {isPaymentSuccess ? (
                    <PaymentSuccess id={occaData!.id}/>
                  ) : (
                    <>
                      <h2 className="text-xl font-semibold mb-4 text-foreground">
                        Chọn phương thức thanh toán
                      </h2>
                      <PaymentMethods
                        onPaymentComplete={() => setIsPaymentSuccess(true)}
                        onBack={handleBack}
                        occaId={occaData!.id}
                      />
                    </>
                  )}
                </div>
              )}
            </Card>
          </div>

          {/* Booking Summary - Sticky on large screens */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-16">
              <BookingSummary
                bookingState={bookingState}
                occaInfo={occaData!}
                step={step}
                occaId={occaData!.id}
              />
            </div>
          </div>
        </div>
      </div>
    </ScrollToTop>
  );
};

export default BookingPage;