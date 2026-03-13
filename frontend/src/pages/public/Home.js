import Container from "../../components/common/Container";
import PageHead from "../../components/common/PageHead";
import HeroCarousel from "../../components/home/HeroCarousel";
import HomeSections from "../../components/home/HomeSections";
import { useDarkMode } from "../../context/DarkModeContext";

export default function Home() {
  const { isDark } = useDarkMode();

  return (
    <div className={`transition-colors duration-300 ${isDark ? "bg-slate-950" : "bg-white"}`}>
      <PageHead
        title="Home"
        description="Professional taekwondo referee portfolio showcasing achievements, certifications, awards, and international coaching milestones."
        path="/"
      />
      {/* Full-bleed hero carousel (matches reference site) */}
      <HeroCarousel />

      <Container>
        <div className="pt-6" />
      </Container>

      <HomeSections />
    </div>
  );
}

