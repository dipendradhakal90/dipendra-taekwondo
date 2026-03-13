import HomeAbout from "./HomeAbout";
import AwardsSection from "./AwardsSection";
import StatisticsWidget from "./StatisticsWidget";
import SkillsSection from "./SkillsSection";
import ActivityFeed from "./ActivityFeed";
import CountryFlags from "./CountryFlags";

export default function HomeSections() {
  return (
    <>
      <HomeAbout />
      <AwardsSection />
      <StatisticsWidget />
      <SkillsSection />
      <ActivityFeed />
      <CountryFlags />
    </>
  );
}
