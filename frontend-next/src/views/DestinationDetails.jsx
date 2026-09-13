import { useParams } from "@/lib/router";
import { CalendarDays, Check, MapPin, Users } from "lucide-react";
import { usePublicContentItem, usePublicContentList, usePublicTours } from "../hooks/useCms";
import { normalizeDestinationKey, resolveDestinationMatch } from "../utils/destinations";
import {
  DetailAside,
  DetailBreadcrumb,
  DetailFacts,
  DetailMediaGrid,
  DetailState,
  RelatedContentGrid,
} from "../components/common/EditorialDetails";

const toParagraphs = (value) => String(value || "").split(/\n\s*\n/).map((item) => item.trim()).filter(Boolean);
const toList = (value) => (Array.isArray(value) ? value : String(value || "").split(/[\n,]/)).map((item) => String(item).trim()).filter(Boolean);

const FeatureList = ({ title, items }) => {
  if (!items.length) return null;
  return (
    <section>
      <h2 className="text-base font-bold tracking-tight text-[#061b3a]">{title}</h2>
      <ul className="mt-3 space-y-2.5">
        {items.map((item) => <li key={item} className="flex items-start gap-2.5 text-sm leading-6 text-slate-600"><Check size={14} className="mt-1 shrink-0 text-[var(--c-brand)]" /><span>{item}</span></li>)}
      </ul>
    </section>
  );
};

const DestinationDetails = () => {
  const { slug } = useParams();
  const normalizedSlug = String(slug || "").trim().toLowerCase();
  const { data: tours = [] } = usePublicTours();
  const { data: destinations = [], isLoading: isListLoading } = usePublicContentList("destination");
  const { data: directDestination, isLoading: isItemLoading } = usePublicContentItem("destination", normalizedSlug);
  const destination = directDestination || resolveDestinationMatch(destinations, normalizedSlug);

  if (isListLoading || isItemLoading) return <DetailState>Loading destination details...</DetailState>;
  if (!destination) return <DetailState>Destination not found or not published.</DetailState>;

  const destinationKey = normalizeDestinationKey(destination.title || normalizedSlug);
  const matchedTours = tours.filter((tour) => normalizeDestinationKey(tour.location || "") === destinationKey).slice(0, 3);
  const images = [destination.coverImage, destination.image, ...(destination.gallery || []), ...matchedTours.flatMap((tour) => [tour.image, ...(tour.gallery || [])])];
  const paragraphs = toParagraphs(destination.content || (destination.shortDescription ? destination.description : ""));
  const highlights = toList(destination.highlights);
  const features = toList(destination.features);
  const idealFor = toList(destination.meta?.idealFor);

  return (
    <main className="bg-theme-bg pb-12 pt-5 sm:pb-14 sm:pt-7">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        <DetailBreadcrumb href="/destinations" label="All destinations" />

        <header className="mt-4 grid gap-5 border-b border-slate-200 pb-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[var(--c-brand)]">Destination</p>
            <h1 className="mt-2 max-w-4xl text-[1.6rem] font-bold leading-[1.1] tracking-[-0.035em] text-[#061b3a] sm:text-[2rem] lg:text-[2.35rem]">{destination.title}</h1>
            {destination.shortDescription || destination.description ? <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500 sm:text-base">{destination.shortDescription || destination.description}</p> : null}
          </div>
          <div className="lg:justify-self-end"><DetailFacts items={[
            { icon: MapPin, label: "Region", value: destination.title },
            { icon: CalendarDays, label: "Best time", value: destination.meta?.bestTime },
            { icon: Users, label: "Tours", value: matchedTours.length ? `${matchedTours.length} available` : "" },
          ]} /></div>
        </header>

        <div className="mt-5"><DetailMediaGrid images={images} title={destination.title} /></div>

        <div className="mt-7 grid gap-7 lg:grid-cols-[minmax(0,1fr)_290px] lg:items-start">
          <article className="min-w-0">
            {paragraphs.length ? <section><h2 className="text-xl font-bold tracking-tight text-[#061b3a]">Discover {destination.title}</h2><div className="mt-3 space-y-4">{paragraphs.map((paragraph, index) => <p key={`${index}-${paragraph.slice(0, 24)}`} className="text-[15px] leading-7 text-slate-600">{paragraph}</p>)}</div></section> : null}
            {highlights.length || features.length || idealFor.length ? <div className="mt-7 grid gap-6 border-t border-slate-200 pt-6 sm:grid-cols-2 xl:grid-cols-3"><FeatureList title="Highlights" items={highlights} /><FeatureList title="Experience" items={features} /><FeatureList title="Ideal for" items={idealFor} /></div> : null}
          </article>
          <DetailAside eyebrow="Plan this destination" title={`Travel to ${destination.title}`} text="Share your preferred dates, group size and travel style for a custom itinerary." buttonLabel="Plan my trip" />
        </div>

        <div className="mt-8"><RelatedContentGrid title={`Tours in ${destination.title}`} route="tours" items={matchedTours} /></div>
      </div>
    </main>
  );
};

export default DestinationDetails;
