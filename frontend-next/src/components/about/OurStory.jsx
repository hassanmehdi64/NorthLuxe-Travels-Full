import { MapPin, ShieldCheck, Route } from "lucide-react";

const values = [
  { icon: MapPin, title: "Local knowledge", text: "Trusted partners across the North." },
  { icon: ShieldCheck, title: "Reliable support", text: "A local team throughout your trip." },
  { icon: Route, title: "Personal plans", text: "Journeys shaped around your needs." },
];

const OurStory = () => (
  <section className="about-story" aria-labelledby="about-story-title">
    <div className="about-container">
      <div className="about-story-grid">
        <div className="about-story-image">
          <img src="https://skardutrekkers.com/wp-content/uploads/2024/07/Deosai-National-Park01.png" alt="Mountain landscape in Deosai National Park" decoding="async"
            onError={(event) => { if (event.currentTarget.dataset.fallbackApplied) return; event.currentTarget.dataset.fallbackApplied = "true"; event.currentTarget.src = "/gb.jpg"; }} />
        </div>
        <div className="about-story-copy">
          <p className="about-eyebrow">Our story</p>
          <h2 id="about-story-title">Travel made personal</h2>
          <p>North Luxe Travels makes exploring the North simple, comfortable and well managed. We handle the planning so you can enjoy the journey.</p>
          <p>From family holidays to quiet escapes and adventures, we shape each trip around your needs. Our local team brings practical knowledge and support from the first plan to your return.</p>
          <div className="about-values">
            {values.map(({ icon: Icon, title, text }) => (
              <div className="about-value" key={title}>
                <Icon size={16} aria-hidden="true" />
                <div><h3>{title}</h3><p>{text}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default OurStory;
