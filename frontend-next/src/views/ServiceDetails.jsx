import Loader from "../components/spinner/Loader";
import { useParams } from "@/lib/router";
import { Check, Layers3 } from "lucide-react";
import { usePublicContentItem, usePublicContentList } from "../hooks/useCms";
import {
  DetailAside,
  DetailBreadcrumb,
  DetailFacts,
  DetailMediaGrid,
  DetailState,
  RelatedContentGrid,
} from "../components/common/EditorialDetails";

const toParagraphs = (value) => String(value || "").split(/\n\s*\n/).map((item) => item.trim()).filter(Boolean);

const ServiceDetails = () => {
  const { slug } = useParams();
  const { data: service, isLoading } = usePublicContentItem("service", slug);
  const { data: services = [] } = usePublicContentList("service");

  if (isLoading) return <Loader fullPage label="Loading service details" />;
  if (!service) return <DetailState>Service not found or not published.</DetailState>;

  const images = [service.image, service.coverImage, ...(service.gallery || [])];
  const deliverables = Array.isArray(service.deliverables) ? service.deliverables.filter(Boolean) : [];
  const paragraphs = toParagraphs(service.content || (service.shortDescription ? service.description : ""));
  const related = services.filter((item) => (item.id || item.slug) !== (service.id || service.slug)).slice(0, 3);

  return (
    <main className="editorial-detail-page bg-theme-bg pb-12 pt-5 sm:pb-14 sm:pt-7">
      <div className="site-page-container mx-auto">
        <DetailBreadcrumb href="/services" label="All services" />

        <header className="mt-4 grid gap-5 border-b border-slate-200 pb-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[var(--c-brand)]">Travel service</p>
            <h1 className="mt-2 max-w-4xl text-[1.6rem] font-bold leading-[1.1] tracking-[-0.035em] text-[var(--c-navy)] sm:text-[2rem] lg:text-[2.35rem]">{service.title}</h1>
            {service.shortDescription || service.description ? <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500 sm:text-base">{service.shortDescription || service.description}</p> : null}
          </div>
          <div className="lg:justify-self-end"><DetailFacts items={[{ icon: Layers3, label: "Category", value: service.category }]} /></div>
        </header>

        <div className="mt-5"><DetailMediaGrid images={images} title={service.title} /></div>

        <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_290px] lg:items-start">
          <article className="min-w-0">
            {paragraphs.length ? <section><h2 className="text-xl font-bold tracking-tight text-[var(--c-navy)]">Service overview</h2><div className="mt-3 space-y-4">{paragraphs.map((paragraph, index) => <p key={`${index}-${paragraph.slice(0, 24)}`} className="text-[15px] leading-7 text-slate-600">{paragraph}</p>)}</div></section> : null}
            {deliverables.length ? <section className="mt-7 border-t border-slate-200 pt-6"><h2 className="text-xl font-bold tracking-tight text-[var(--c-navy)]">What you get</h2><ul className="mt-4 grid gap-2.5 sm:grid-cols-2">{deliverables.map((item) => <li key={item} className="flex items-start gap-2.5 rounded-lg bg-white px-3.5 py-3 text-sm text-slate-600"><Check size={15} className="mt-0.5 shrink-0 text-[var(--c-brand)]" /><span>{item}</span></li>)}</ul></section> : null}
          </article>
          <DetailAside eyebrow="Need this service?" title="Build it around your trip" text="Share your travel dates and requirements for a tailored service plan." buttonLabel="Request service" />
        </div>

        <div className="mt-8"><RelatedContentGrid title="Related services" route="services" items={related} /></div>
      </div>
    </main>
  );
};

export default ServiceDetails;
