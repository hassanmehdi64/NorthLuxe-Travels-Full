"use client";

import { ArrowLeft } from "lucide-react";
import { Link } from "@/lib/router";
import { useBookingFlow } from "../components/booking/useBookingFlow";
import BookingSummary from "../components/booking/BookingSummary";
import { DetailsSection, DoneStep, PaymentSection, ReviewStep, StepIndicator, TripSection } from "../components/booking/BookingSteps";

const Booking = () => {
  const flow = useBookingFlow();
  const { step, section, selectedTour, isCustomBooking, toursLoading, tours } = flow;

  if (toursLoading && !tours.length) {
    return (
      <div className="container-site py-10" aria-busy="true" aria-label="Loading booking">
        <div className="skeleton h-8 w-64" />
        <div className="skeleton mt-6 h-[420px] w-full rounded-panel" />
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="container-site py-10 sm:py-14">
        <DoneStep flow={flow} />
      </div>
    );
  }

  const backHref = selectedTour?.slug && !isCustomBooking ? `/tours/${selectedTour.slug}` : "/tours";

  return (
    <div className="container-site pb-28 pt-5 sm:pt-6 lg:pb-16">
      <Link to={backHref} className="inline-flex items-center gap-1.5 text-[13px] font-medium text-subtle hover:text-navy-900">
        <ArrowLeft size={14} aria-hidden="true" /> {selectedTour && !isCustomBooking ? "Back to tour" : "All tours"}
      </Link>
      <h1 className="heading-1 mt-3 text-[clamp(1.6rem,3vw,2.1rem)]">
        {isCustomBooking ? "Request a custom trip" : selectedTour ? `Book ${selectedTour.title}` : "Book a tour"}
      </h1>

      <div className="mt-6 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0">
          <StepIndicator flow={flow} />
          {step === 1 && section === 1 && <TripSection flow={flow} />}
          {step === 1 && section === 2 && <DetailsSection flow={flow} />}
          {step === 1 && section === 3 && <PaymentSection flow={flow} />}
          {step === 2 && <ReviewStep flow={flow} />}
        </div>
        <BookingSummary flow={flow} />
      </div>
    </div>
  );
};

export default Booking;
