import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Section from "../ui/Section";
import Skeleton from "../common/Skeleton";
import { useDarkMode } from "../../context/DarkModeContext";
import { CountriesAPI } from "../../services/countries.service";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function CountryFlags() {
  const { isDark } = useDarkMode();
  const q = useQuery({
    queryKey: ["home-countries"],
    queryFn: CountriesAPI.list,
  });

  const countries = useMemo(() => (Array.isArray(q.data) ? q.data : []), [q.data]);

  if (q.isLoading) {
    return (
      <Section title="Country Visited" subtitle="International countries visited for taekwondo achievements and officiating.">
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-24 rounded-none" />
          ))}
        </div>
      </Section>
    );
  }

  if (!countries.length) return null;

  const tickerItems = countries.length > 1 ? [...countries, ...countries] : countries;

  return (
    <Section
      title="Country Visited"
      subtitle="International countries visited for taekwondo achievements and officiating."
    >
      <div className="country-flags-marquee-wrap">
        <div className="country-flags-marquee-track">
          {tickerItems.map((country, index) => (
            <div
              key={`${country._id || country.countryCode || country.countryName}-${index}`}
              className={cx(
                "h-24 shrink-0 overflow-hidden border flex items-center justify-center",
                isDark ? "border-white/10 bg-slate-800" : "border-black/10 bg-white"
              )}
              title={country.countryName || ""}
            >
              {country.flagUrl ? (
                <img
                  src={country.flagUrl}
                  alt={country.countryName || "Country"}
                  className="h-full w-auto object-contain"
                  loading="lazy"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-4xl">
                  {country.flagEmoji || "🏳️"}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

