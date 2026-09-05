import PageHero from "../components/common/PageHero";
import ContactInfo from "../components/contact/ContactInfo";
import ContactForm from "../components/contact/ContactForm";
import ContactMap from "../components/contact/ContactMap";

const ContactPage = () => {
  return (
    <main className="bg-theme-bg">
      <PageHero
        page="contact"
        image="/gb.jpg"
        label="Contact hero"
        tag="Contact"
        title="Plan Your Trip With Confidence"
        text="Send your travel requirements and our team will respond with clear guidance, itinerary options, and practical support."
      />

      <section className="mx-auto grid w-full max-w-[1400px] gap-4 px-4 py-7 sm:px-6 sm:py-8 lg:grid-cols-[0.82fr_1.18fr] lg:gap-5 lg:px-10 lg:py-9">
        <ContactInfo />
        <ContactForm />
      </section>

      <section className="mx-auto w-full max-w-[1400px] px-4 pb-9 sm:px-6 sm:pb-10 lg:px-10 lg:pb-12">
        <ContactMap />
      </section>
    </main>
  );
};

export default ContactPage;
