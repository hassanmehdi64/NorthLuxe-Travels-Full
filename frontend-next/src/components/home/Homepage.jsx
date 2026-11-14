"use client";

import {
  BedDouble,
  BriefcaseBusiness,
  Building2,
  Map as MapIcon,
  MessageCircle,
  MessagesSquare,
  Phone,
  Plane,
  Route,
} from "lucide-react";
import { Link } from "@/lib/router";
import { usePublicContentList, usePublicTours, useSettings } from "../../hooks/useCms";
import { getHomeHeroImages } from "../../lib/siteTheme";
import { getContactDetails } from "../../lib/contact";
import TravelSearch from "./TravelSearch";
import DestinationCard from "../featured-destinations/DestinationCard";
import SectionHeading from "../common/SectionHeading";
import SafeImage from "../common/SafeImage";
import TourCard from "../tours/TourCard";
import Testimonials from "../testimonials/Testimonials";
import GallerySection from "../about/GallerySection";
import { homeDestinations, featuredTours, contentCards, internationalDestinations } from "./homeData.mjs";
import { homeAssets as assets } from "./homeAssets";
import { planRoute } from "./SiteChrome";
import HeroSlider from "../media/HeroSlider";
import Carousel from "../media/Carousel";
import Reveal from "../motion/Reveal";

// Configurable in Admin → Settings → General. Never shows the street address.
const getHeroEyebrow = (settings) => {
  const custom = String(settings?.heroEyebrow || "").trim();
  if (custom) return custom;
  const year = String(settings?.foundingYear || "").trim();
  return year ? `Gilgit-Baltistan · Since ${year}` : "Gilgit-Baltistan";
};

function Hero() {
  const { data: settings } = useSettings(true);
  const slides = settings?.homeHeroImages?.length ? getHomeHeroImages(settings) : [assets.CinematicHunzaHero];
  const heroEyebrow = getHeroEyebrow(settings);

  return (
    <>
    <section aria-labelledby="home-hero-title" className="relative isolate bg-navy-950">
      <div className="absolute inset-0 overflow-hidden">
        <HeroSlider images={slides} alt="Northern Pakistan landscape" label="Destination photos" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-r from-navy-950/80 via-navy-950/45 to-navy-950/10" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-navy-950/50 to-transparent" />
      </div>

      {/* Text layer lets swipes/drags through to the photo slider; links stay clickable. */}
      <div className="container-site pointer-events-none relative pb-20 pt-14 sm:pb-24 sm:pt-20 lg:pb-28 lg:pt-24 [&_a]:pointer-events-auto [&_button]:pointer-events-auto">
        <div className="hero-enter max-w-xl">
          {heroEyebrow && <p className="eyebrow eyebrow-light mb-4">{heroEyebrow}</p>}
          <h1 id="home-hero-title" className="heading-display text-white">Travel beyond the ordinary</h1>
          <p className="mt-4 min-h-[3.25em] max-w-md text-base leading-relaxed text-white/85 sm:min-h-0">
            {settings?.siteTagline || "Journeys across Pakistan and beyond, tailored to you."}
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Link to="/tours" className="btn btn-primary btn-lg">
              Explore tours
            </Link>
            <Link to={planRoute} className="text-sm font-semibold text-white underline-offset-4 hover:underline">
              Or plan a private trip
            </Link>
          </div>
        </div>
      </div>

    </section>
    <div className="container-site relative z-10 -mt-12">
      <TravelSearch />
    </div>
    </>
  );
}

function PopularDestinations() {
  const { data: tours = [], isLoading: toursLoading } = usePublicTours();
  const { data: entries = [], isLoading } = usePublicContentList("destination");
  const destinations = homeDestinations(tours, entries).slice(0, 8);
  const loading = !destinations.length && (isLoading || toursLoading);

  return (
    <section className="section pt-10 sm:pt-12">
      <div className="container-site">
        <SectionHeading eyebrow="Where to go" title="Popular destinations" link="All destinations" to="/destinations" />
        {loading ? (
          <div className="grid-cards-4" aria-busy="true" aria-label="Loading destinations">
            {Array.from({ length: 8 }, (_, index) => <div key={index} className="destination-tile-skeleton" />)}
          </div>
        ) : destinations.length ? (
          <Reveal>
            <Carousel label="Popular destinations" slideClassName="basis-[72%] sm:basis-1/3 lg:basis-1/4">
              {destinations.map((item) => <DestinationCard key={item.slug || item.id || item.title} destination={item} overlay />)}
            </Carousel>
          </Reveal>
        ) : (
          <p className="empty-state">Published destinations will appear here.</p>
        )}
      </div>
    </section>
  );
}

function FeaturedTours() {
  const { data: tours = [], isLoading } = usePublicTours();
  const packages = featuredTours(tours);
  return (
    <section className="section section-white">
      <div className="container-site">
        <SectionHeading eyebrow="Ready-made journeys" title="Featured tours" link="All tours" to="/tours" />
        {packages.length ? (
          <Reveal>
            <Carousel label="Featured tours" slideClassName="basis-[85%] sm:basis-1/2 lg:basis-1/4">
              {packages.map((tour) => <TourCard key={tour.id || tour.slug} tour={tour} />)}
            </Carousel>
          </Reveal>
        ) : (
          <p className="empty-state">{isLoading ? "Loading tours…" : "Published tours will appear here."}</p>
        )}
      </div>
    </section>
  );
}

const benefits = [
  [Route, "Personalised itineraries", "Routes shaped around your interests, pace and travel dates."],
  [BedDouble, "Handpicked stays", "Comfortable hotels and guesthouses selected for each journey."],
  [MessagesSquare, "Dedicated support", "One team to plan with before you go and to call on the road."],
];

function WhyNorthLuxe() {
  return (
    <section className="section" aria-labelledby="why-title">
      <Reveal className="container-site grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="media aspect-[4/3] rounded-panel lg:aspect-[5/4]">
          <SafeImage src={assets.SkarduLandscape} alt="Upper Kachura Lake, Skardu" loading="lazy" />
        </div>
        <div>
          <p className="eyebrow mb-2">Why North Luxe</p>
          <h2 id="why-title" className="heading-2">A little closer to the mountains</h2>
          <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-subtle">
            Discover Hunza, Skardu and beyond with a local team that plans every detail around you.
          </p>
          <ul className="mt-6 grid gap-4">
            {benefits.map(([Icon, title, text]) => (
              <li key={title} className="flex gap-3.5">
                <span className="icon-tile"><Icon size={19} aria-hidden="true" /></span>
                <div>
                  <h3 className="text-[15px] font-semibold text-navy-900">{title}</h3>
                  <p className="mt-0.5 text-sm leading-relaxed text-subtle">{text}</p>
                </div>
              </li>
            ))}
          </ul>
          <Link to="/tours?q=Pakistan" className="btn btn-secondary mt-7">
            Explore Pakistan tours
          </Link>
        </div>
      </Reveal>
    </section>
  );
}

const serviceIcons = [Building2, Plane, BriefcaseBusiness, MapIcon];

function ExperiencesAndServices() {
  const { data: activities = [], isLoading: activitiesLoading } = usePublicContentList("activity");
  const { data: serviceItems = [] } = usePublicContentList("service");
  const experiences = contentCards(activities, "activities").slice(0, 3);
  const services = contentCards(serviceItems, "services").slice(0, 4);

  return (
    <section className="section section-white">
      <div className="container-site">
        <SectionHeading eyebrow="Ways to explore" title="Experiences" link="All experiences" to="/activities" />
        {experiences.length ? (
          <Reveal>
          <Carousel label="Experiences" slideClassName="basis-[85%] sm:basis-1/2 lg:basis-1/3">
            {experiences.map((item) => (
              <Link key={item.id || item.slug} to={item.href} className="card card-hover group flex flex-col overflow-hidden">
                <div className="media media-zoom aspect-[16/10]">
                  <SafeImage src={item.image} alt="" label={item.title} loading="lazy" />
                </div>
                <div className="flex flex-1 flex-col p-4">
                  {(item.eyebrow || item.category || item.location) && (
                    <p className="line-clamp-1 text-xs font-medium text-brand-700">{item.eyebrow || item.category || item.location}</p>
                  )}
                  <h3 className="heading-3 mt-1">{item.title}</h3>
                  {item.description && <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-subtle">{item.description}</p>}
                  <span className="link-arrow mt-auto pt-3">Explore</span>
                </div>
              </Link>
            ))}
          </Carousel>
          </Reveal>
        ) : (
          <p className="empty-state">{activitiesLoading ? "Loading experiences…" : "Published activities will appear here."}</p>
        )}

        {services.length > 0 && (
          <div className="mt-10">
            <div className="mb-4 flex items-end justify-between gap-4">
              <h3 className="heading-3">Travel services</h3>
              <Link to="/services" className="link-arrow">All services</Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {services.map((item, index) => {
                const Icon = serviceIcons[index % serviceIcons.length];
                return (
                  <Link key={item.id || item.slug} to={item.href} className="card card-hover group flex gap-3 p-4">
                    <span className="icon-tile h-9 w-9"><Icon size={17} aria-hidden="true" /></span>
                    <div className="min-w-0">
                      <h4 className="flex items-center gap-1 text-sm font-semibold text-navy-900 group-hover:text-brand-700">
                        {item.title}
                      </h4>
                      {item.description && <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-subtle">{item.description}</p>}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function InternationalDestinations() {
  const { data: entries = [] } = usePublicContentList("destination");
  const international = internationalDestinations(entries);
  if (!international.length) return null;
  return (
    <section className="section">
      <div className="container-site">
        <SectionHeading eyebrow="Beyond Pakistan" title="International destinations" link="International tours" to="/tours?q=international" />
        <Reveal>
          <Carousel label="International destinations" slideClassName="basis-[72%] sm:basis-1/3 lg:basis-1/4">
            {international.map((item) => <DestinationCard key={item.id || item.slug} destination={item} overlay />)}
          </Carousel>
        </Reveal>
      </div>
    </section>
  );
}

function ContactBand() {
  const { data: settings } = useSettings(true);
  const { phone, phoneHref, whatsapp } = getContactDetails(settings);
  const whatsappHref = whatsapp ? `https://wa.me/${whatsapp.replace(/[^\d]/g, "")}` : "";
  return (
    <section className="bg-navy-900">
      <div className="container-site flex flex-col gap-6 py-10 sm:py-12 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl">
          <h2 className="heading-2 text-white">Planning a trip to the north?</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-white/75">
            Tell us your dates and group size and we&apos;ll put together a route, stays and transport for you.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to={planRoute} className="btn btn-primary">Plan my trip</Link>
          {whatsappHref && (
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn btn-outline-light">
              <MessageCircle size={15} aria-hidden="true" />WhatsApp us
            </a>
          )}
          {phone && (
            <a href={phoneHref} className="btn btn-outline-light"><Phone size={15} aria-hidden="true" />{phone}</a>
          )}
        </div>
      </div>
    </section>
  );
}

export default function Homepage() {
  return (
    <main>
      <Hero />
      <PopularDestinations />
      <FeaturedTours />
      <WhyNorthLuxe />
      <ExperiencesAndServices />
      <InternationalDestinations />
      <Testimonials />
      <GallerySection />
      <ContactBand />
    </main>
  );
}
