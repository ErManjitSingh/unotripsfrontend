"use client";

import {
  Bike,
  Building2,
  Castle,
  Flag,
  Landmark,
  Map,
  MapPin,
  Mountain,
  MountainSnow,
  Palmtree,
  Ship,
  Sparkles,
  Sun,
  Tent,
  Trees,
  Umbrella,
  Waves,
  type LucideIcon,
} from "lucide-react";
import type { DestinationSliderIconKey } from "@/lib/destination-catalog";

export const destinationSliderIconMap: Record<DestinationSliderIconKey, LucideIcon> = {
  mountain: Mountain,
  trees: Trees,
  landmark: Landmark,
  bike: Bike,
  tent: Tent,
  map: Map,
  palmtree: Palmtree,
  castle: Castle,
  waves: Waves,
  ship: Ship,
  sparkles: Sparkles,
  building2: Building2,
  sun: Sun,
  flag: Flag,
  umbrella: Umbrella,
  mapPin: MapPin,
  mountainSnow: MountainSnow,
};
