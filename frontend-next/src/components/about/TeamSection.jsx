
import SectionHeading from "../common/SectionHeading";
import Reveal from "../motion/Reveal";

const leadershipTeam = [
  {
    name: "Hassan Mehdi",
    role: "Founder & Managing Director",
    avatar: "/HM.png",
    message:
      "We craft journeys that inspire and comfort. Every trip reflects our dedication to trust, detail, and unforgettable experiences.",
    focusAreas: ["Guest Trust", "Service Standards", "Long-term Vision"],
  },
  {
    name: "Hassan Abbas",
    role: "Chief Executive & Travel Operations Lead",
    avatar: "/HA.jpeg",
    message:
      "Our tours are executed with precision and passion. Every itinerary is designed to ensure seamless, memorable experiences.",
    focusAreas: ["Tour Operations", "Route Planning", "On-ground Execution"],
  },
];

const TeamSection = () => (
  <Reveal as="section" className="about-team" aria-labelledby="about-team-title">
    <div className="about-container">
      <SectionHeading id="about-team-title" title="Meet our team" description="The people behind your journey." />
      <div className="about-team-grid">
        {leadershipTeam.map((leader) => (
          <article className="about-team-card" key={leader.name}>
            <div className="about-team-profile">
              <img src={leader.avatar} alt={leader.name} loading="lazy" decoding="async" />
              <div><h3>{leader.name}</h3><p>{leader.role}</p></div>
            </div>
            <blockquote>{leader.message}</blockquote>
          </article>
        ))}
      </div>
    </div>
  </Reveal>
);

export default TeamSection;
