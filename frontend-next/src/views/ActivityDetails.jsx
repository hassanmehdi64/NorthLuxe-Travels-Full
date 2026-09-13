import { useParams } from "@/lib/router";
import { Check, Clock3, MapPin, Mountain } from "lucide-react";
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

const ActivityDetails = () => {
  const { slug } = useParams();
  const { data: activity, isLoading } = usePublicContentItem("activity", slug);
  const { data: activities = [] } = usePublicContentList("activity");

  if (isLoading) return <DetailState>Loading activity details...</DetailState>;
  if (!activity) return <DetailState>Activity not found or not published.</DetailState>;

  const images = [activity.image, activity.coverImage, ...(activity.meta?.heroSliderImages || []), ...(activity.gallery || [])];
  const includes = Array.isArray(activity.includes) ? activity.includes.filter(Boolean) : [];
  const paragraphs = toParagraphs(activity.content || (activity.shortDescription ? activity.description : ""));
  const related = activities.filter((item) => (item.id || item.slug) !== (activity.id || activity.slug)).slice(0, 3);

  return (
    <main className="bg-theme-bg pb-12 pt-5 sm:pb-14 sm:pt-7">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        <DetailBreadcrumb href="/activities" label="All activities" />

        <header className="mt-4 grid gap-5 border-b border-slate-200 pb-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[var(--c-brand)]">Activity</p>
            <h1 className="mt-2 max-w-4xl text-[1.6rem] font-bold leading-[1.1] tracking-[-0.035em] text-[#061b3a] sm:text-[2rem] lg:text-[2.35rem]">{activity.title}</h1>
            {activity.shortDescription || activity.description ? <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500 sm:text-base">{activity.shortDescription || activity.description}</p> : null}
          </div>
          <div className="lg:justify-self-end"><DetailFacts items={[
            { icon: MapPin, label: "Location", value: activity.location },
            { icon: Clock3, label: "Duration", value: activity.duration },
            { icon: Mountain, label: "Level", value: activity.level },
          ]} /></div>
        </header>

        <div className="mt-5"><DetailMediaGrid images={images} title={activity.title} /></div>

        <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_290px] lg:items-start">
          <article className="min-w-0">
            {paragraphs.length ? <section><h2 className="text-xl font-bold tracking-tight text-[#061b3a]">About this activity</h2><div className="mt-3 space-y-4">{paragraphs.map((paragraph, index) => <p key={`${index}-${paragraph.slice(0, 24)}`} className="text-[15px] leading-7 text-slate-600">{paragraph}</p>)}</div></section> : null}
            {includes.length ? <section className="mt-7 border-t border-slate-200 pt-6"><h2 className="text-xl font-bold tracking-tight text-[#061b3a]">What&apos;s included</h2><ul className="mt-4 grid gap-2.5 sm:grid-cols-2">{includes.map((item) => <li key={item} className="flex items-start gap-2.5 rounded-lg bg-white px-3.5 py-3 text-sm text-slate-600"><Check size={15} className="mt-0.5 shrink-0 text-[var(--c-brand)]" /><span>{item}</span></li>)}</ul></section> : null}
          </article>
          <DetailAside eyebrow="Custom activity" title="Add it to your journey" text="Share your dates and group details to include this experience in a custom plan." buttonLabel="Request a plan" />
        </div>

        <div className="mt-8"><RelatedContentGrid title="Related activities" route="activities" items={related} /></div>
      </div>
    </main>
  );
};

export default ActivityDetails;
