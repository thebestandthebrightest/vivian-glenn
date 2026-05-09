export type TravelMediaType = "image" | "video";

export type TravelMediaItem = {
  id: string;
  src: string;
  type: TravelMediaType;
  posterSrc?: string;
};

export type TravelPlace = {
  id: string;
  city: string;
  country: string;
  label: string;
  lat: number;
  lng: number;
  media: TravelMediaItem[];
};

export const travelPlaces: TravelPlace[] = [
  {
    id: "slovakia",
    city: "Slovakia",
    country: "",
    label: "Slovakia",
    lat: 48.7,
    lng: 19.7,
    media: [{ id: "slovakia-1", src: "/travel/slovakia.JPG", type: "image" }],
  },
  {
    id: "budapest",
    city: "Budapest",
    country: "Hungary",
    label: "Budapest, Hungary",
    lat: 47.4979,
    lng: 19.0402,
    media: [{ id: "budapest-1", src: "/travel/budapest.HEIC", type: "image" }],
  },
  {
    id: "vienna",
    city: "Vienna",
    country: "Austria",
    label: "Vienna, Austria",
    lat: 48.2082,
    lng: 16.3738,
    media: [{ id: "vienna-1", src: "/travel/vienna.HEIC", type: "image" }],
  },
  {
    id: "dublin",
    city: "Dublin",
    country: "Ireland",
    label: "Dublin, Ireland",
    lat: 53.3498,
    lng: -6.2603,
    media: [{ id: "dublin-1", src: "/travel/dublin.HEIC", type: "image" }],
  },
  {
    id: "copenhagen",
    city: "Copenhagen",
    country: "Denmark",
    label: "Copenhagen, Denmark",
    lat: 55.6761,
    lng: 12.5683,
    media: [{ id: "copenhagen-1", src: "/travel/copenhagen.JPG", type: "image" }],
  },
  {
    id: "barcelona",
    city: "Barcelona",
    country: "Spain",
    label: "Barcelona, Spain",
    lat: 41.3874,
    lng: 2.1686,
    media: [
      { id: "barcelona-1", src: "/travel/barcelona-1.JPG", type: "image" },
      { id: "barcelona-2", src: "/travel/barcelona-2.JPG", type: "image" },
    ],
  },
  {
    id: "paris",
    city: "Paris",
    country: "France",
    label: "Paris, France",
    lat: 48.8566,
    lng: 2.3522,
    media: [{ id: "paris-1", src: "/travel/paris.JPG", type: "image" }],
  },
  {
    id: "chicago",
    city: "Chicago",
    country: "United States",
    label: "Chicago, United States",
    lat: 41.8781,
    lng: -87.6298,
    media: [{ id: "chicago-1", src: "/travel/chicago.HEIC", type: "image" }],
  },
  {
    id: "malmo",
    city: "Malmö",
    country: "Sweden",
    label: "Malmö, Sweden",
    lat: 55.605,
    lng: 13.0038,
    media: [{ id: "malmo-1", src: "/travel/malmo.HEIC", type: "image" }],
  },
  {
    id: "morocco",
    city: "Morocco",
    country: "",
    label: "Morocco",
    lat: 31.7917,
    lng: -7.0926,
    media: [
      { id: "morocco-1", src: "/travel/morroco-1.JPG", type: "image" },
      { id: "morocco-2", src: "/travel/morocco-2.HEIC", type: "image" },
    ],
  },
  {
    id: "bath",
    city: "Bath",
    country: "England",
    label: "Bath, England",
    lat: 51.3811,
    lng: -2.359,
    media: [{ id: "bath-1", src: "/travel/bath.JPG", type: "image" }],
  },
  {
    id: "amsterdam",
    city: "Amsterdam",
    country: "Netherlands",
    label: "Amsterdam, Netherlands",
    lat: 52.3676,
    lng: 4.9041,
    media: [{ id: "amsterdam-1", src: "/travel/amsterdam.HEIC", type: "image" }],
  },
  {
    id: "london",
    city: "London",
    country: "England",
    label: "London, England",
    lat: 51.5072,
    lng: -0.1276,
    media: [
      { id: "london-1", src: "/travel/london-1.JPG", type: "image" },
      { id: "london-2", src: "/travel/london-2.JPG", type: "image" },
      { id: "london-3", src: "/travel/london-3.JPG", type: "image" },
    ],
  },
  {
    id: "prague",
    city: "Prague",
    country: "Czech Republic",
    label: "Prague, Czech Republic",
    lat: 50.0755,
    lng: 14.4378,
    media: [{ id: "prague-1", src: "/travel/prague.HEIC", type: "image" }],
  },
  {
    id: "providence",
    city: "Providence",
    country: "United States",
    label: "Providence, United States",
    lat: 41.824,
    lng: -71.4128,
    media: [{ id: "providence-1", src: "/travel/providence.HEIC", type: "image" }],
  },
  {
    id: "brussels",
    city: "Brussels",
    country: "Belgium",
    label: "Brussels, Belgium",
    lat: 50.8503,
    lng: 4.3517,
    media: [{ id: "brussels-1", src: "/travel/bruseels.HEIC", type: "image" }],
  },
  {
    id: "munich",
    city: "Munich",
    country: "Germany",
    label: "Munich, Germany",
    lat: 48.1351,
    lng: 11.582,
    media: [{ id: "munich-1", src: "/travel/munich.JPG", type: "image" }],
  },
  {
    id: "boston",
    city: "Boston",
    country: "United States",
    label: "Boston, United States",
    lat: 42.3601,
    lng: -71.0589,
    media: [{ id: "boston-1", src: "/travel/boston.HEIC", type: "image" }],
  },
  {
    id: "new-york-city",
    city: "New York City",
    country: "United States",
    label: "New York City, United States",
    lat: 40.7128,
    lng: -74.006,
    media: [{ id: "nyc-1", src: "/travel/nyc.png", type: "image" }],
  },
  {
    id: "seattle",
    city: "Seattle",
    country: "United States",
    label: "Seattle, United States",
    lat: 47.6061,
    lng: -122.3328,
    media: [{ id: "seattle-1", src: "/travel/seattle.png", type: "image" }],
  },
  {
    id: "hawaii",
    city: "Hawaii",
    country: "United States",
    label: "Hawaii, United States",
    lat: 20.7984,
    lng: -156.3319,
    media: [
      {
        id: "hawaii-1",
        src: "/travel/hawaii-1.MOV",
        type: "video",
      },
      {
        id: "hawaii-2",
        src: "/travel/hawaii-2.MOV",
        type: "video",
      },
    ],
  },
  {
    id: "antigua",
    city: "Antigua",
    country: "",
    label: "Antigua",
    lat: 17.1274,
    lng: -61.8468,
    media: [{ id: "antigua-1", src: "/travel/antigua.png", type: "image" }],
  },
  {
    id: "mexico",
    city: "Mexico",
    country: "",
    label: "Mexico",
    lat: 23.6345,
    lng: -102.5528,
    media: [{ id: "mexico-1", src: "/travel/mexico.png", type: "image" }],
  },
];
