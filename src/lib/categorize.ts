/** Infer category / age from product name keywords (for thin Excel sheets). */

const CATEGORY_RULES: { category: string; patterns: RegExp[] }[] = [
  {
    category: "Building Sets",
    patterns: [/block/i, /lego/i, /brick/i, /builder/i, /construction/i],
  },
  {
    category: "Vehicles",
    patterns: [/car/i, /bike/i, /truck/i, /rc\b/i, /remote/i, /helicopter/i, /plane/i, /train/i, /bus\b/i],
  },
  {
    category: "Baby & Toddler",
    patterns: [/rattle/i, /teether/i, /baby/i, /toddler/i, /soft\s*toy/i, /plush/i, /crib/i],
  },
  {
    category: "Puzzles",
    patterns: [/puzzle/i, /jigsaw/i],
  },
  {
    category: "STEM Toys",
    patterns: [/robot/i, /coding/i, /stem/i, /science/i, /microscope/i, /experiment/i],
  },
  {
    category: "Games",
    patterns: [/board\s*game/i, /card\s*game/i, /\bgame\b/i, /ludo/i, /chess/i, /uno\b/i],
  },
  {
    category: "Dolls & Playsets",
    patterns: [/doll/i, /barbie/i, /kitchen\s*set/i, /doctor\s*set/i, /playset/i],
  },
  {
    category: "Outdoor",
    patterns: [/ball/i, /bat\b/i, /skipping/i, /scooter/i, /slide/i, /swing/i, /water\s*gun/i],
  },
  {
    category: "Electronics",
    patterns: [/speaker/i, /tablet/i, /phone/i, /camera/i, /walkie/i, /drone/i, /wireless/i],
  },
];

const AGE_RULES: { ageGroup: string; patterns: RegExp[] }[] = [
  { ageGroup: "0-3 years", patterns: [/baby/i, /rattle/i, /teether/i, /infant/i, /0-3/i] },
  { ageGroup: "3-5 years", patterns: [/preschool/i, /3-5/i, /toddler/i] },
  { ageGroup: "6-9 years", patterns: [/6-9/i, /6\+/i, /school/i] },
  { ageGroup: "10+ years", patterns: [/10\+/i, /teen/i, /collector/i, /14\+/i] },
];

export function inferCategory(name: string): string {
  for (const rule of CATEGORY_RULES) {
    if (rule.patterns.some((p) => p.test(name))) return rule.category;
  }
  return "Toys";
}

export function inferAgeGroup(name: string): string {
  for (const rule of AGE_RULES) {
    if (rule.patterns.some((p) => p.test(name))) return rule.ageGroup;
  }
  return "All Ages";
}
