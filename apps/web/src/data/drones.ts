export interface FilmingSpecs {
  resolution: string;
  stabilization: string;
  flightTime: number;
  range: number;
}

export interface CargoSpecs {
  maxPayload: number;
  flightTime: number;
  range: number;
  weatherResistance: string;
}

export interface Drone {
  id: string;
  name: string;
  category: "filming" | "cargo";
  dailyPrice: number;
  image: string;
  description: string;
  specs: FilmingSpecs | CargoSpecs;
}

export function isFilmingDrone(drone: Drone): drone is Drone & { specs: FilmingSpecs } {
  return drone.category === "filming";
}

export function isCargoDrone(drone: Drone): drone is Drone & { specs: CargoSpecs } {
  return drone.category === "cargo";
}

export const DRONES: Drone[] = [
  {
    id: "phantom-pro",
    name: "Phantom Pro X",
    category: "filming",
    dailyPrice: 89,
    image: "/drones/phantom-pro.svg",
    description: "Professional 4K aerial cinematography with 3-axis stabilization and obstacle avoidance.",
    specs: {
      resolution: "4K 60fps",
      stabilization: "3-axis gimbal",
      flightTime: 31,
      range: 7000,
    },
  },
  {
    id: "mavic-ultra",
    name: "Mavic Ultra",
    category: "filming",
    dailyPrice: 129,
    image: "/drones/mavic-ultra.svg",
    description: "Compact foldable drone with 8K video, Hasselblad camera, and ActiveTrack 5.0.",
    specs: {
      resolution: "8K 30fps",
      stabilization: "3-axis gimbal",
      flightTime: 46,
      range: 15000,
    },
  },
  {
    id: "inspire-cinema",
    name: "Inspire Cinema",
    category: "filming",
    dailyPrice: 149,
    image: "/drones/inspire-cinema.svg",
    description: "Cinema-grade aerial platform with interchangeable lens system and RAW recording.",
    specs: {
      resolution: "6K RAW",
      stabilization: "3-axis gimbal + vibration absorbing",
      flightTime: 28,
      range: 8000,
    },
  },
  {
    id: "cargo-lite",
    name: "SkyMule Lite",
    category: "cargo",
    dailyPrice: 99,
    image: "/drones/cargo-lite.svg",
    description: "Lightweight delivery drone for small packages up to 2kg with precision landing.",
    specs: {
      maxPayload: 2,
      flightTime: 35,
      range: 10000,
      weatherResistance: "IP54",
    },
  },
  {
    id: "cargo-heavy",
    name: "SkyMule Heavy",
    category: "cargo",
    dailyPrice: 169,
    image: "/drones/cargo-heavy.svg",
    description: "Heavy-lift cargo drone for industrial deliveries up to 10kg with all-weather capability.",
    specs: {
      maxPayload: 10,
      flightTime: 25,
      range: 8000,
      weatherResistance: "IP67",
    },
  },
  {
    id: "cargo-max",
    name: "SkyMule Max",
    category: "cargo",
    dailyPrice: 199,
    image: "/drones/cargo-max.svg",
    description: "Maximum payload capacity for heavy-duty logistics. Autonomous route planning included.",
    specs: {
      maxPayload: 20,
      flightTime: 20,
      range: 5000,
      weatherResistance: "IP67",
    },
  },
];
