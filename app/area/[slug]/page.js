import { notFound } from "next/navigation";
import places from "@/data/places.json";
import AreaContent from "./AreaContent";

const AREAS = {
  seoul: {
    nameEn: "Seoul",
    nameKo: "서울",
    descEn:
      "Discover gluten-free restaurants, cafes, and bakeries in Seoul. From dedicated GF spots in Yongsan to hidden gems in Mapo — find safe places to eat.",
    descKo:
      "서울의 글루텐프리 레스토랑, 카페, 베이커리를 찾아보세요. 용산의 전문점부터 마포의 숨은 맛집까지.",
  },
  gyeonggi: {
    nameEn: "Gyeonggi",
    nameKo: "경기",
    descEn:
      "Gluten-free dining options in the Gyeonggi Province area, including Seongnam, Pyeongtaek, and more.",
    descKo:
      "성남, 평택 등 경기도 지역의 글루텐프리 식당과 카페를 소개합니다.",
  },
  cheonan: {
    nameEn: "Cheonan",
    nameKo: "천안",
    descEn:
      "Gluten-free spots in Cheonan, South Chungcheong Province.",
    descKo:
      "충남 천안 지역의 글루텐프리 매장을 소개합니다.",
  },
};

function getAreaPlaces(areaKey) {
  const safePlaces = Array.isArray(places) ? places : [];
  return safePlaces.filter((p) => {
    const loc = (p.location || "").toLowerCase();
    return loc.startsWith(areaKey);
  });
}

export function generateStaticParams() {
  return Object.keys(AREAS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const area = AREAS[slug];
  if (!area) return { title: "Area Not Found" };

  const count = getAreaPlaces(slug).length;
  return {
    title: `Gluten-Free ${area.nameEn} — ${count} Places | Gluten-Free Korea`,
    description: area.descEn,
    alternates: { canonical: `/area/${slug}` },
    openGraph: {
      type: "website",
      url: `/area/${slug}`,
      title: `Gluten-Free ${area.nameEn}`,
      description: area.descEn,
    },
  };
}

export default async function AreaPage({ params }) {
  const { slug } = await params;
  const area = AREAS[slug];
  if (!area) notFound();

  const areaPlaces = getAreaPlaces(slug);

  return <AreaContent area={area} areaPlaces={areaPlaces} />;
}
