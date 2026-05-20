/** Hero banner slides — synced with rotating destination headline. */
export const HERO_DESTINATION_SLIDES = [
  {
    name: "Rajasthan",
    src: "https://t4.ftcdn.net/jpg/06/31/02/21/360_F_631022109_PXYXdWEMMa494E6dwHC0GSTvqSeHc3My.jpg",
    alt: "Rajasthan tour packages — desert safari and golden dunes at sunset",
  },
  {
    name: "Himachal",
    src: "https://instahimachal.com/wp-content/uploads/2022/03/Best-Destination-Himachal-Pradesh-Insta-Himachal.png",
    alt: "Himachal tour packages — snow peaks, pine forests and mountain camps",
  },
  {
    name: "Kashmir",
    src: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1600&q=85",
    alt: "Kashmir tour packages — lakes, meadows and snow peaks",
  },
  {
    name: "Goa",
    src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=85",
    alt: "Goa tour packages — beaches and coastal getaways",
  },
  {
    name: "Leh Ladakh",
    src: "https://unpluggedlife.in/wp-content/uploads/2023/03/Unplugged_Life_Trip_Pangong_3-1170x658.jpg",
    alt: "Leh Ladakh tour packages — Pangong Lake and Himalayan landscapes",
  },
  {
    name: "Kerala",
    src: "https://www.thrillophilia.com/blog/wp-content/uploads/2025/08/kerala-main-scaled.jpg",
    alt: "Kerala tour packages — houseboats and tropical backwaters",
  },
  {
    name: "Uttarakhand",
    src: "https://images.unsplash.com/photo-1622397333309-0fd06e33b22c?w=1600&q=85",
    alt: "Uttarakhand tour packages — mountains, rivers and temples",
  },
] as const;

export type HeroDestinationSlide = (typeof HERO_DESTINATION_SLIDES)[number];

/** @deprecated Use `HERO_DESTINATION_SLIDES[0]` */
export const HERO_BANNER_IMAGE = HERO_DESTINATION_SLIDES[0];

/** Legacy split export — both sides use the active slide image. */
export const EASE_HERO_SPLIT = {
  left: HERO_BANNER_IMAGE,
  right: HERO_BANNER_IMAGE,
} as const;
