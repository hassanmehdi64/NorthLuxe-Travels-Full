import PageHero from "../components/common/PageHero";
import OurStory from "../components/about/OurStory";
import TeamSection from "../components/about/TeamSection";
import OurAchievements from "../components/achievements/OurAchievements";

const About = () => {
  return (
    <main className="about-page bg-theme-bg text-theme">
      <PageHero
        page="about"
        label="About hero"
        tag="About"
        title="About"
        accent="North Luxe"
        text="Local knowledge, thoughtful planning and support throughout your journey."
      />
      <OurStory />
      <OurAchievements />
      <TeamSection />
    </main>
  );
};

export default About;
