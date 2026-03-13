import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";

import Section from "../ui/Section";
import Card from "../ui/Card";
import Skeleton from "../common/Skeleton";

import { AchievementsAPI } from "../../services/achievements.service";
import { CertificationsAPI } from "../../services/certifications.service";
import { CountriesAPI } from "../../services/countries.service";
import { AwardsAPI } from "../../services/awards.service";
import { GalleryAPI } from "../../services/gallery.service";
import { PostsAPI } from "../../services/posts.service";

function StatCard({ icon, label, value, isLoading }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      viewport={{ once: true }}
    >
      <Card className="p-6 text-center hover:shadow-soft transition">
        <div className="text-3xl mb-2">{icon}</div>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-12 mx-auto" />
            <Skeleton className="h-4 w-20 mx-auto" />
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold text-brand-500">{value}</div>
            <div className="text-sm text-black/60 mt-1">{label}</div>
          </>
        )}
      </Card>
    </motion.div>
  );
}

export default function StatisticsWidget() {
  const eventsQ = useQuery({
    queryKey: ["stats-achievements"],
    queryFn: AchievementsAPI.list,
  });

  const certsQ = useQuery({
    queryKey: ["stats-certs"],
    queryFn: CertificationsAPI.list,
  });

  const countriesQ = useQuery({
    queryKey: ["stats-countries"],
    queryFn: CountriesAPI.list,
  });

  const awardsQ = useQuery({
    queryKey: ["stats-awards"],
    queryFn: AwardsAPI.list,
  });

  const galleryQ = useQuery({
    queryKey: ["stats-gallery"],
    queryFn: GalleryAPI.list,
  });

  const postsQ = useQuery({
    queryKey: ["stats-posts"],
    queryFn: PostsAPI.listPublished,
  });

  const stats = useMemo(() => {
    return [
      {
        icon: "🌍",
        label: "Countries Visited",
        value: countriesQ.data?.length || 0,
        isLoading: countriesQ.isLoading,
      },
      {
        icon: "🏆",
        label: "Awards Won",
        value: awardsQ.data?.length || 0,
        isLoading: awardsQ.isLoading,
      },
      {
        icon: "⚡",
        label: "Achievements",
        value: eventsQ.data?.length || 0,
        isLoading: eventsQ.isLoading,
      },
      {
        icon: "📜",
        label: "Certifications",
        value: certsQ.data?.length || 0,
        isLoading: certsQ.isLoading,
      },
      {
        icon: "📸",
        label: "Gallery Images",
        value: galleryQ.data?.length || 0,
        isLoading: galleryQ.isLoading,
      },
      {
        icon: "📝",
        label: "Posts Published",
        value: postsQ.data?.length || 0,
        isLoading: postsQ.isLoading,
      },
    ];
  }, [
    countriesQ.data,
    awardsQ.data,
    eventsQ.data,
    certsQ.data,
    galleryQ.data,
    postsQ.data,
    countriesQ.isLoading,
    awardsQ.isLoading,
    eventsQ.isLoading,
    certsQ.isLoading,
    galleryQ.isLoading,
    postsQ.isLoading,
  ]);

  return (
    <Section title="By The Numbers" subtitle="Impressive achievements at a glance.">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>
    </Section>
  );
}


