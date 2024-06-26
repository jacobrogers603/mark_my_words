import prismadb from "@/lib/prismadb";

export const adjectives = [
  "Agile",
  "Brave",
  "Clever",
  "Daring",
  "Eager",
  "Fierce",
  "Gentle",
  "Honest",
  "Inventive",
  "Joyful",
  "Kind",
  "Lively",
  "Mighty",
  "Noble",
  "Observant",
  "Playful",
  "Quick",
  "Rustic",
  "Strong",
  "Tough",
  "Unique",
  "Vigorous",
  "Wise",
  "Xenial",
  "Youthful",
  "Zealous",
  "Active",
  "Bold",
  "Curious",
  "Dynamic",
  "Excited",
  "Friendly",
  "Gracious",
  "Humble",
  "Intelligent",
  "Jolly",
  "Keen",
  "Logical",
  "Merry",
  "Neat",
  "Optimistic",
  "Peaceful",
  "Quiet",
  "Reliable",
  "Sincere",
  "Thoughtful",
  "Upbeat",
  "Valiant",
  "Warm",
  "Exuberant",
  "Youthful",
  "Zippy",
  "Amusing",
  "Bouncy",
  "Calm",
  "Delightful",
  "Earnest",
  "Fabulous",
  "Generous",
  "Hearty",
  "Imaginative",
  "Jubilant",
  "Kooky",
  "Luminous",
  "Modest",
  "Notable",
  "Outgoing",
  "Proud",
  "Quirky",
  "Resourceful",
  "Steady",
  "Tranquil",
  "Upstanding",
  "Vibrant",
  "Whimsical",
  "Exotic",
  "Zany",
  "Affable",
  "Bashful",
  "Captivating",
  "Debonair",
  "Enthusiastic",
  "Fantastic",
  "Glowing",
  "Heroic",
  "Inspiring",
  "Jovial",
  "Knightly",
  "Luxurious",
  "Marvelous",
  "Nifty",
  "Ornate",
  "Polite",
  "Quaint",
  "Robust",
  "Sleek",
  "Tactful",
  "Undaunted",
  "Venerable",
  "Witty",
  "Expressive",
  "Yearning",
  "Zealful",
  "Alluring",
  "Bewitching",
  "Charming",
  "Deft",
  "Ebullient",
  "Faithful",
  "Grateful",
  "Hopeful",
  "Impartial",
  "Jaunty",
  "Knotty",
  "Loyal",
  "Mystical",
  "Neutral",
  "Obedient",
  "Practical",
  "Quintessential",
  "Radiant",
  "Scenic",
  "Tenable",
  "Urbane",
  "Vivid",
  "Wholesome",
  "Extraordinary",
  "Yielding",
  "Zestful",
  "Artistic",
  "Blissful",
  "Chic",
  "Dapper",
  "Elated",
  "Forthright",
  "Gallant",
  "Honorable",
  "Idyllic",
  "Jocund",
  "Klutz",
  "Laudable",
  "Meticulous",
  "Nimble",
  "Opulent",
  "Philosophical",
  "Quizzical",
  "Refined",
  "Sophisticated",
  "Thorough",
  "Unflappable",
  "Venturesome",
  "Wise",
  "Xylophonic",
  "Young",
  "Zealous",
];

export const animals = [
  "Antelope",
  "Beaver",
  "Cheetah",
  "Dolphin",
  "Eagle",
  "Fox",
  "Giraffe",
  "Hippo",
  "Iguana",
  "Jaguar",
  "Koala",
  "Lion",
  "Monkey",
  "Narwhal",
  "Owl",
  "Penguin",
  "Quail",
  "Rabbit",
  "Snake",
  "Tiger",
  "Urial",
  "Vulture",
  "Wolf",
  "Xerus",
  "Yak",
  "Zebra",
  "Alligator",
  "Bear",
  "Crocodile",
  "Deer",
  "Elephant",
  "Frog",
  "Goat",
  "Hare",
  "Impala",
  "Jackal",
  "Kangaroo",
  "Leopard",
  "Moose",
  "Newt",
  "Octopus",
  "Porcupine",
  "Quokka",
  "Raccoon",
  "Squirrel",
  "Turtle",
  "Unicorn",
  "Viper",
  "Walrus",
  "X-ray Fish",
  "Yabby",
  "Zebu",
  "Axolotl",
  "Buffalo",
  "Capybara",
  "Dugong",
  "Emu",
  "Flamingo",
  "Gazelle",
  "Hyena",
  "Ibis",
  "Jackrabbit",
  "Koel",
  "Lynx",
  "Meerkat",
  "Numbat",
  "Ocelot",
  "Platypus",
  "Quoll",
  "Rat",
  "Skunk",
  "Tapir",
  "Uakari",
  "Vole",
  "Wombat",
  "Xenopus",
  "Yellowtail",
  "Zorilla",
  "Armadillo",
  "Baboon",
  "Cassowary",
  "Dik-dik",
  "Ermine",
  "Fennec",
  "Gopher",
  "Hamster",
  "Indri",
  "Jerboa",
  "Kinkajou",
  "Lemur",
  "Mandrill",
  "Narwhal",
  "Opossum",
  "Pangolin",
  "Quetzal",
  "Reindeer",
  "Sable",
  "Tahr",
  "Urchin",
  "Vaquita",
  "Weasel",
  "Xantus",
  "Yak",
  "Zonkey",
  "Aardvark",
  "Bison",
  "Chinchilla",
  "Dormouse",
  "Echidna",
  "Falcon",
  "Gecko",
  "Hawk",
  "Ibex",
  "Jackdaw",
  "Kiwi",
  "Llama",
  "Mink",
  "Nightingale",
  "Orangutan",
  "Peacock",
  "Quail",
  "Raven",
  "Seal",
  "Toucan",
  "Umbrellabird",
  "Vicuna",
  "Wallaby",
  "Xolo",
  "Yellowjacket",
  "Zebra Finch",
  "Alpaca",
  "Bonobo",
  "Caribou",
  "Dragonfly",
  "Elk",
  "Finch",
  "Gerbil",
  "Heron",
  "Impala",
  "Jay",
  "Kudu",
  "Leopon",
  "Magpie",
  "Narwhal",
  "Oryx",
  "Parrot",
  "Quagga",
  "Rhino",
  "Starling",
  "Thrush",
  "Urial",
  "Vulture",
  "Warthog",
  "Xenarthra",
  "Yellowhammer",
  "Zooplankton",
];

export const generateUsername = async () => {
  let username;
  let isUnique = false;

  while (!isUnique) {
    const adj1 = adjectives[Math.floor(Math.random() * adjectives.length)].toLowerCase();
    const adj2 = adjectives[Math.floor(Math.random() * adjectives.length)].toLowerCase();
    const animal = animals[Math.floor(Math.random() * animals.length)].toLowerCase();
    username = `${adj1}_${adj2}_${animal}`;

    const existingUsername = await prismadb.user.findUnique({
      where: { username },
    });

    if (!existingUsername) {
      isUnique = true;
    }
  }

  return username;
};