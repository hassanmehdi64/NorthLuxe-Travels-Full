"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Link } from "@/lib/router";
import { usePublicContentList, usePublicTours, useSettings } from "../../hooks/useCms";
import { getHomeHeroImages } from "../../lib/siteTheme";
import Loader from "../spinner/Loader";
import TravelSearch from "./TravelSearch";
import TourCard from "../tours/TourCard";
import Testimonials from "../testimonials/Testimonials";
import GallerySection from "../about/GallerySection";
import { homeDestinations, featuredTours, contentCards, internationalDestinations } from "./homeData.mjs";
import { homeAssets as assets } from "./homeAssets";
import { Action, Icon, planRoute } from "./SiteChrome";

function Hero() {
  const { data: settings } = useSettings(true);
  const reducedMotion = useReducedMotion();
  const slides = settings?.homeHeroImages?.length ? getHomeHeroImages(settings) : [assets.CinematicHunzaHero];
  const [activeSlide, setActiveSlide] = useState(0);
  useEffect(() => {
    if (slides.length < 2 || reducedMotion) return;
    const timer = window.setInterval(() => setActiveSlide((current) => (current + 1) % slides.length), 7000);
    return () => window.clearInterval(timer);
  }, [slides.length, reducedMotion]);
  return <><section className="home-hero">
    {slides.map((src, index) => <img key={src} className={`home-cover home-hero-slide ${index === activeSlide % slides.length ? "is-active" : ""}`} src={src} alt={index === activeSlide % slides.length ? "North Luxe travel landscape" : ""} aria-hidden={index !== activeSlide % slides.length} fetchPriority={index === 0 ? "high" : "auto"} onError={(event) => { if (event.currentTarget.src.endsWith("/gb.jpg")) return; event.currentTarget.src = "/gb.jpg"; }} />)}
    <div className="home-hero-scrim" />
    <div className="home-hero-copy">
      <h1>Travel Beyond the Ordinary</h1>
      <p className="home-hero-description">{settings?.siteTagline || "Journeys across Pakistan and beyond, tailored to you."}</p>
      <div className="home-hero-actions"><Action to="/destinations" variant="sand">Explore Destinations</Action><Action to={planRoute} variant="outline" arrow={false}>Plan My Trip</Action></div>
    </div>
    <p className="home-hero-location"><Icon name="MapPin" />{settings?.address || "Pakistan"}</p>
  </section><TravelSearch /></>;
}

function SectionHeading({ eyebrow, title, description, link, to }) {
  return <div className="home-section-heading"><div>{eyebrow && <p className="home-eyebrow">{eyebrow}</p>}<h2>{title}</h2>{description && <p className="home-description">{description}</p>}</div>
    {link && <Link className="home-section-link" to={to}>{link}<Icon name="ArrowRight" /></Link>}
  </div>;
}

function ContentState({ loading, children }) {
  return <div className="home-content-state" role="status" aria-busy={loading}>{loading ? "Loading journeys…" : children}</div>;
}

function Photograph({ image, alt, className = "" }) {
  return <div className={`home-photograph ${className}`}><img className="home-cover" src={assets[image] || image || "/gb.jpg"} alt={alt} loading="lazy" onError={(event) => { if (event.currentTarget.src.endsWith("/gb.jpg")) return; event.currentTarget.src = "/gb.jpg"; }} /></div>;
}

function PopularDestinations() {
  const { data: tours = [], isLoading: toursLoading } = usePublicTours();
  const { data: entries = [], isLoading } = usePublicContentList("destination");
  const destinations = homeDestinations(tours, entries).slice(0, 7);
  return <section className="home-section home-container home-destinations">
    <SectionHeading title="Popular destinations" link="All destinations" to="/destinations" />
    <div className="home-destination-grid">{destinations.map((item, index) => <Link key={item.slug || item.title} to={item.href} className={`home-destination-card ${index < 3 ? "home-destination-primary" : ""}`}>
      <Photograph image={item.image} alt={item.title} /><h3>{item.title}</h3>
    </Link>)}</div>
    {!destinations.length && <ContentState loading={isLoading || toursLoading}>Published destinations will appear here.</ContentState>}
  </section>;
}

function FeaturedPackages() {
  const { data: tours = [], isLoading } = usePublicTours();
  const packages = featuredTours(tours);
  return <section className="home-section home-container home-tinted">
    <SectionHeading title="Featured tours" link="All packages" to="/tours" />
    <div className="home-three-grid">{packages.map((tour, index) => <TourCard key={tour.id || tour.slug} tour={tour} index={index} />)}</div>
    {!packages.length && <ContentState loading={isLoading}>Published tour packages will appear here.</ContentState>}
  </section>;
}

function OurApproach() {
  const principles = [
    ["Route", "Personalized itineraries", "Trips shaped around your interests and pace."],
    ["BedDouble", "Handpicked stays", "Comfortable stays selected for your journey."],
    ["MessagesSquare", "Dedicated support", "Our team is here to help with your plans."],
  ];
  return <section className="home-section home-container home-approach"><SectionHeading title="Travel your way" />
    <div className="home-three-grid">{principles.map(([icon, title, description]) => <article key={title}><span className="home-principle-icon"><Icon name={icon} /></span><div className="home-principle-copy"><h3>{title}</h3><p>{description}</p></div></article>)}</div>
  </section>;
}

function PakistanFeature() {
  return <section className="home-container home-feature-region" aria-labelledby="northern-pakistan-title">
    <div className="home-pakistan-feature">
      <div className="home-northern-landscape"><Photograph image="SkarduLandscape" alt="Upper Kachura Lake, Skardu" /></div>
      <div className="home-northern-copy">
        <span className="home-feature-label"><Icon name="MapPin3" />Northern Pakistan</span>
        <h2 id="northern-pakistan-title">A little closer to the mountains</h2>
        <p>Discover Hunza, Skardu and Swat with a journey shaped around you.</p>
        <Action to="/tours?q=Pakistan" variant="sand">Explore Pakistan tours</Action>
      </div>
    </div>
  </section>;
}

function InternationalDestinations() {
  const { data: entries = [] } = usePublicContentList("destination");
  const international = internationalDestinations(entries);
  if (!international.length) return null;
  return <section className="home-container home-international home-section"><SectionHeading title="International destinations" link="International tours" to="/tours?q=international" />
    <div className="home-four-grid">{international.map((item) => <article key={item.id || item.slug}><Link to={item.href}><Photograph image={item.image} alt={item.title} /><h3>{item.title}</h3></Link><Link className="home-text-link" to={item.href}>Explore {item.title} ↗</Link></article>)}</div>
  </section>;
}

function Experiences() {
  const { data: items = [], isLoading } = usePublicContentList("activity");
  const experiences = contentCards(items, "activities").slice(0, 3);
  return <section className="home-section home-container home-tinted"><SectionHeading title="Experiences" />
    <div className="home-three-grid">{experiences.map((item) => <article className="home-experience" key={item.id || item.slug}><Photograph image={item.image} alt={item.title} /><div className="home-experience-details"><p className="home-eyebrow">{item.eyebrow || item.category || item.location}</p><h3>{item.title}</h3><p className="home-card-summary">{item.description}</p><Link className="home-text-link" to={item.href}>Explore experience<Icon name="ArrowUpRight2" /></Link></div></article>)}</div>
    {!experiences.length && <ContentState loading={isLoading}>Published activities will appear here.</ContentState>}
  </section>;
}

function Services() {
  const { data: items = [], isLoading } = usePublicContentList("service");
  const services = contentCards(items, "services").slice(0, 4);
  const icons = ["Building2", "Plane1", "BriefcaseBusiness", "Map"];
  return <section className="home-section home-container home-services"><SectionHeading title="Travel services" link="All services" to="/services" /><div className="home-four-grid">{services.map((item, index) => <Link className="home-service" key={item.id || item.slug} to={item.href}><Icon name={icons[index]} /><h3>{item.title}</h3><p className="home-card-summary">{item.description}</p></Link>)}</div>{!services.length && <ContentState loading={isLoading}>Published travel services will appear here.</ContentState>}</section>;
}

export default function Homepage() {
  return <main className="public-home-content"><Hero /><PopularDestinations /><FeaturedPackages /><OurApproach /><PakistanFeature /><InternationalDestinations /><Experiences /><Services /><Testimonials /><GallerySection /></main>;
}
