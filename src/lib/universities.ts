export interface UniversityItem {
  id: string;
  name: string;
  shortName: string;
  city: string;
  province: string;
  campuses: string[]; // Pure city names representing the campuses
}

export const SUPPORTED_UNIVERSITIES: UniversityItem[] = [
  {
    id: "uet-lahore",
    name: "University of Engineering and Technology (UET) Lahore",
    shortName: "UET Lahore",
    city: "Lahore",
    province: "Punjab",
    campuses: ["Lahore", "Kala Shah Kaku", "Faisalabad", "Narowal"],
  },
  {
    id: "fast-nuces",
    name: "National University of Computer and Emerging Sciences (FAST-NUCES)",
    shortName: "FAST-NUCES",
    city: "Lahore",
    province: "Punjab",
    campuses: ["Lahore", "Islamabad", "Karachi", "Peshawar", "Chiniot-Faisalabad"],
  },
  {
    id: "nust",
    name: "National University of Sciences and Technology (NUST)",
    shortName: "NUST",
    city: "Islamabad",
    province: "Islamabad Capital Territory",
    campuses: ["Islamabad", "Rawalpindi", "Karachi", "Risalpur"],
  },
  {
    id: "lums",
    name: "Lahore University of Management Sciences (LUMS)",
    shortName: "LUMS",
    city: "Lahore",
    province: "Punjab",
    campuses: ["Lahore"],
  },
  {
    id: "comsats",
    name: "COMSATS University Islamabad (CUI)",
    shortName: "COMSATS",
    city: "Islamabad",
    province: "Islamabad Capital Territory",
    campuses: ["Islamabad", "Lahore", "Abbottabad", "Wah Cantt", "Attock", "Sahiwal", "Vehari"],
  },
  {
    id: "giki",
    name: "Ghulam Ishaq Khan Institute of Engineering Sciences and Technology (GIKI)",
    shortName: "GIKI",
    city: "Topi",
    province: "Khyber Pakhtunkhwa",
    campuses: ["Topi"],
  },
  {
    id: "itu",
    name: "Information Technology University (ITU)",
    shortName: "ITU",
    city: "Lahore",
    province: "Punjab",
    campuses: ["Lahore"],
  },
  {
    id: "pu",
    name: "University of the Punjab (PU)",
    shortName: "Punjab University",
    city: "Lahore",
    province: "Punjab",
    campuses: ["Lahore", "Gujranwala", "Jhelum"],
  },
  {
    id: "gcu",
    name: "Government College University (GCU) Lahore",
    shortName: "GCU Lahore",
    city: "Lahore",
    province: "Punjab",
    campuses: ["Lahore", "Kala Shah Kaku"],
  },
  {
    id: "uet-taxila",
    name: "University of Engineering and Technology (UET) Taxila",
    shortName: "UET Taxila",
    city: "Taxila",
    province: "Punjab",
    campuses: ["Taxila"],
  },
  {
    id: "iba-karachi",
    name: "Institute of Business Administration (IBA) Karachi",
    shortName: "IBA Karachi",
    city: "Karachi",
    province: "Sindh",
    campuses: ["Karachi"],
  },
  {
    id: "ned-karachi",
    name: "NED University of Engineering and Technology",
    shortName: "NED Karachi",
    city: "Karachi",
    province: "Sindh",
    campuses: ["Karachi"],
  },
  {
    id: "bahria",
    name: "Bahria University",
    shortName: "Bahria University",
    city: "Islamabad",
    province: "Islamabad Capital Territory",
    campuses: ["Islamabad", "Karachi", "Lahore"],
  },
  {
    id: "air-university",
    name: "Air University",
    shortName: "Air University",
    city: "Islamabad",
    province: "Islamabad Capital Territory",
    campuses: ["Islamabad", "Multan", "Kamra", "Kharian"],
  },
  {
    id: "qau",
    name: "Quaid-i-Azam University (QAU)",
    shortName: "QAU",
    city: "Islamabad",
    province: "Islamabad Capital Territory",
    campuses: ["Islamabad"],
  },
  {
    id: "ntu",
    name: "National Textile University (NTU)",
    shortName: "NTU",
    city: "Faisalabad",
    province: "Punjab",
    campuses: ["Faisalabad", "Karachi"],
  },
];

export function searchUniversities(query: string): UniversityItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return SUPPORTED_UNIVERSITIES;

  return SUPPORTED_UNIVERSITIES.filter((item) => {
    return (
      item.name.toLowerCase().includes(q) ||
      item.shortName.toLowerCase().includes(q) ||
      item.city.toLowerCase().includes(q) ||
      item.campuses.some((c) => c.toLowerCase().includes(q))
    );
  });
}
