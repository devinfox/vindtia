/**
 * VINDTIA Fashion Knowledge Base
 * Comprehensive fashion history, subcultures, and style revival knowledge
 * Based on academic fashion research covering the 1960s to present
 */

export const FASHION_KNOWLEDGE = {
  /**
   * DECADE-BY-DECADE FASHION OVERVIEW
   */
  decades: {
    sixties: {
      summary: "Foundational for modern youth style as a visible, fast-moving identity system. Shift toward youthful silhouettes with shorter hemlines and simpler, graphic lines.",
      keyMovements: ["mod minimalism", "space-age looks", "counterculture anti-fashion"],
      keyPieces: ["mini skirts", "shift dresses", "go-go boots", "turtlenecks", "A-line silhouettes"],
      designers: ["Mary Quant", "André Courrèges", "Pierre Cardin", "Paco Rabanne"],
      culturalContext: "Youth rebellion, Space Race optimism, British Invasion music",
      revivalPotential: "Mod aesthetics resurface in minimalist cycles; graphic patterns return periodically"
    },
    seventies: {
      summary: "Amplified subculture as political/class expression and style as remix of historical references. Punk emerges as paradigmatic bricolage style.",
      keyMovements: ["punk", "disco glamour", "hippie continuation", "glam rock"],
      keyPieces: ["bell bottoms", "platform shoes", "safety pins", "leather jackets", "fringe", "velvet", "maxi dresses", "halter tops"],
      designers: ["Vivienne Westwood", "Malcolm McLaren", "Halston", "Diane von Furstenberg"],
      culturalContext: "Post-Vietnam, economic recession, Studio 54, CBGB punk scene",
      revivalPotential: "Bohemian/festival cycles revive silhouettes repeatedly; punk returns to runway regularly"
    },
    eighties: {
      summary: "Intensification of club-based style innovation. Power dressing meets New Romantic theatricality. Hip-hop emerges as street-to-luxury translation engine.",
      keyMovements: ["power dressing", "New Romantic", "hip-hop style", "preppy"],
      keyPieces: ["power shoulders", "bold colors", "gold jewelry", "sneakers", "tracksuits", "theatrical silhouettes", "corsets"],
      designers: ["Giorgio Armani", "Thierry Mugler", "Claude Montana", "Dapper Dan"],
      culturalContext: "Reagan/Thatcher era, MTV launch, Wall Street excess, hip-hop emergence",
      revivalPotential: "Club-to-catwalk diffusion model; New Romantic returns in maximalist cycles"
    },
    nineties: {
      summary: "Anti-fashion authenticity meets rapid high-fashion appropriation. Grunge becomes luxury theme. Minimalism coexists with maximalism.",
      keyMovements: ["grunge", "minimalism", "Riot Grrrl", "supermodel era", "slip dress aesthetic"],
      keyPieces: ["flannel shirts", "Doc Martens", "slip dresses", "chokers", "baby tees", "low-rise jeans", "platform shoes"],
      designers: ["Marc Jacobs", "Calvin Klein", "Helmut Lang", "Martin Margiela"],
      culturalContext: "Seattle music scene, heroin chic controversy, girl power, dot-com boom",
      revivalPotential: "Soft grunge and digital revivals; 90s minimalism feeds quiet luxury cycles"
    },
    twoThousands: {
      summary: "Global mashup era. Styles recombined across scenes and geographies. Celebrity media hardwires looks into global memory.",
      keyMovements: ["Y2K aesthetic", "hip-hop glamour", "indie sleaze", "boho chic"],
      keyPieces: ["low-rise everything", "velour tracksuits", "logo mania", "skinny jeans", "statement sunglasses", "ballet flats"],
      designers: ["Alexander McQueen", "John Galliano", "Tom Ford", "Nicolas Ghesquière"],
      culturalContext: "Paris Hilton era, MySpace, The O.C., indie rock explosion",
      revivalPotential: "Y2K revival powered by archived imagery + resale + influencer styling"
    },
    twentyTens: {
      summary: "Platform-mediated fashion intensifies. Instagram reshapes visual logic. Streetwear becomes high-fashion language.",
      keyMovements: ["athleisure", "normcore", "streetwear luxury", "soft grunge/Tumblr aesthetic"],
      keyPieces: ["sneakers with everything", "logo collaborations", "oversized everything", "mom jeans", "chokers (again)"],
      designers: ["Virgil Abloh", "Demna Gvasalia", "Alessandro Michele", "Phoebe Philo"],
      culturalContext: "Instagram era, Supreme × Louis Vuitton, gender fluidity in fashion",
      revivalPotential: "Tumblr aesthetics reappear as platforms shift; normcore templates quiet luxury"
    },
    twentyTwenties: {
      summary: "Revival becomes broader and faster. Past is searchable, micro-aesthetics indexed through hashtags. Platform-driven '-core' aesthetics proliferate.",
      keyMovements: ["cottagecore", "dark academia", "Y2K revival", "e-girl/e-boy", "quiet luxury"],
      keyPieces: ["prairie dresses", "corsets", "platform boots", "oversized blazers", "low-rise comeback"],
      designers: ["Daniel Lee (Bottega)", "The Row", "Miu Miu", "emerging designers"],
      culturalContext: "Pandemic lifestyle shifts, TikTok acceleration, sustainability discourse",
      revivalPotential: "Hyper-accelerated cycles; aesthetics assembled and discarded rapidly"
    }
  },

  /**
   * SUBCULTURE DEEP DIVES
   * Comprehensive style profiles for matching
   */
  subcultures: {
    mods: {
      origin: "Urban UK youth; style as modernity and taste-performance",
      peakEra: "1960s; revived late 1970s/early 1980s",
      keyPieces: ["tailored suits", "parkas", "Chelsea boots", "turtlenecks", "shift dresses"],
      styling: "Clean, sharp, streamlined silhouettes; precise grooming; sleek outerwear",
      musicAnchor: "R&B, soul, modernist pop",
      ethos: "Modernist 'cool,' scene status, attention to detail",
      colors: ["navy", "black", "white", "burgundy"],
      materials: ["wool", "cotton", "leather"],
      revivalPathways: "Film/music memory (Quadrophenia); sharp tailoring resurfaces in minimalist cycles",
      notThisStyle: ["bohemian", "loose", "distressed", "hippie", "casual"]
    },
    hippies: {
      origin: "Counterculture networks; craft and anti-fashion stances",
      peakEra: "Late 1960s–1970s",
      keyPieces: ["bell bottoms", "fringe vests", "maxi dresses", "peasant blouses", "headbands"],
      styling: "Flowing, loose silhouettes; handmade/ethnic-coded details; natural fibers",
      musicAnchor: "Psychedelic rock, folk",
      ethos: "Anti-war, anti-establishment, peace and love",
      colors: ["earth tones", "brown", "orange", "rust", "cream", "olive"],
      materials: ["cotton", "linen", "suede", "denim", "crochet"],
      revivalPathways: "'Boho' and festival cycles revive silhouettes repeatedly",
      notThisStyle: ["structured", "corporate", "minimalist", "sparkly", "club"]
    },
    punk: {
      origin: "UK/US urban scenes; boutique + DIY ecosystems",
      peakEra: "Late 1970s; recurrent revivals",
      keyPieces: ["leather jackets", "ripped tees", "safety pins", "tartan", "combat boots", "band tees"],
      styling: "Deliberate ripping, pinning, re-lettering; taboo materials; aggressive slogans",
      musicAnchor: "Punk rock",
      ethos: "Anti-establishment, DIY, shock value, rebellion",
      colors: ["black", "red", "tartan patterns"],
      materials: ["leather", "denim", "cotton", "vinyl"],
      revivalPathways: "Rapid absorption into fashion; museum canonization; repeated runway returns",
      notThisStyle: ["polished", "preppy", "romantic", "delicate", "corporate"]
    },
    newRomantic: {
      origin: "Club scenes; performance-oriented self-styling (Blitz club)",
      peakEra: "Early to mid 1980s",
      keyPieces: ["ruffled shirts", "dramatic silhouettes", "theatrical makeup", "capes", "bold jewelry"],
      styling: "Historical pastiche; exaggerated silhouettes; cosmetics as costume; deliberate theatricality",
      musicAnchor: "Synth-pop, new wave",
      ethos: "Artifice, glamour, spectacle, gender play",
      colors: ["jewel tones", "purple", "gold", "black", "white"],
      materials: ["velvet", "silk", "lace", "satin"],
      revivalPathways: "Club-to-catwalk diffusion; periodic returns in maximalist cycles",
      notThisStyle: ["minimal", "understated", "casual", "sporty", "natural"]
    },
    goth: {
      origin: "Post-punk networks; scene-based aesthetics",
      peakEra: "1980s onward (continuous subculture)",
      keyPieces: ["black everything", "Victorian details", "corsets", "platform boots", "lace", "silver jewelry"],
      styling: "Dark palette; Victorian/romantic motifs; heavy makeup; fetish wear intersections",
      musicAnchor: "Post-punk, goth rock, industrial",
      ethos: "Romantic nihilism, outsider identity, beauty in darkness",
      colors: ["black", "deep purple", "burgundy", "silver"],
      materials: ["velvet", "lace", "leather", "PVC"],
      revivalPathways: "Recurring 'gothic' reappearances in high fashion and internet aesthetics",
      notThisStyle: ["bright", "cheerful", "preppy", "bohemian", "pastel"]
    },
    rave: {
      origin: "UK/EU/US dance scenes; warehouse/club networks",
      peakEra: "Late 1980s–1990s; revival waves",
      keyPieces: ["neon colors", "platform shoes", "bucket hats", "cargo pants", "baby tees", "furry accessories"],
      styling: "Practical dancewear + neon/play; accessories and DIY signals",
      musicAnchor: "House, techno, rave",
      ethos: "Communal euphoria, PLUR, scene codes, nightlife rebellion",
      colors: ["neon", "bright colors", "white"],
      materials: ["synthetic", "stretch", "PVC"],
      revivalPathways: "Museum historicization; periodic 'rave revival' in runway/editorial",
      notThisStyle: ["corporate", "traditional", "minimal", "muted", "serious"]
    },
    hipHop: {
      origin: "Bronx/NYC roots; Black/Latinx cultural production",
      peakEra: "1980s onward (continuous evolution)",
      keyPieces: ["sneakers", "oversized silhouettes", "gold chains", "baseball caps", "designer logos", "tracksuits"],
      styling: "Sportswear meets luxury; statement accessories; logo play; cultural pride",
      musicAnchor: "Hip-hop, R&B",
      ethos: "Identity expression, status, cultural resistance, community",
      colors: ["varies by era", "gold accents", "designer-specific"],
      materials: ["leather", "denim", "athletic fabrics", "luxury materials"],
      revivalPathways: "Luxury remix via Dapper Dan; streetwear → runway; global diffusion",
      notThisStyle: ["preppy traditional", "bohemian", "country", "minimalist quiet"]
    },
    grunge: {
      origin: "Pacific Northwest US scenes; thrift logics",
      peakEra: "Early–mid 1990s; periodic revival",
      keyPieces: ["flannel shirts", "oversized band tees", "Doc Martens", "ripped jeans", "beanies"],
      styling: "Thrift-accessible uniform; deliberately disheveled; layered; 'undone' aesthetic",
      musicAnchor: "Alternative rock, Seattle sound",
      ethos: "Anti-fashion authenticity, rejection of mainstream glamour",
      colors: ["dark", "muted", "earth tones", "black", "navy", "forest green"],
      materials: ["cotton", "flannel", "denim", "leather"],
      revivalPathways: "Runway appropriation (Marc Jacobs 1992); 'soft grunge' digital revivals",
      notThisStyle: ["glamorous", "polished", "preppy", "bright", "sparkly"]
    },
    riotGrrrl: {
      origin: "Feminist punk networks; zines and local scenes",
      peakEra: "Early 1990s",
      keyPieces: ["band tees", "combat boots", "mini skirts", "tights", "DIY patches", "marker slogans"],
      styling: "DIY slogans; thrift-based; layered tough + 'girlish' signals",
      musicAnchor: "Punk, DIY",
      ethos: "Feminist activism, anti-consumer critique, reclaiming femininity on own terms",
      colors: ["black", "red", "pink contrast"],
      materials: ["cotton", "denim", "leather"],
      revivalPathways: "Archival revival; style elements re-enter celebrity/editorial cycles",
      notThisStyle: ["passive", "overly polished", "corporate", "traditional feminine"]
    },
    emoScene: {
      origin: "US/UK youth; online + mall ecosystems",
      peakEra: "2000s peak; revivals in 2020s",
      keyPieces: ["skinny jeans", "band tees", "studded belts", "Converse", "heavy bangs"],
      styling: "Skinny silhouettes; dark palette; hair as major signifier; emotional expression through dress",
      musicAnchor: "Emo, alternative rock, pop-punk",
      ethos: "Emotional intensity, outsider community, aesthetic sensitivity",
      colors: ["black", "red", "pink accents"],
      materials: ["cotton", "denim", "synthetic"],
      revivalPathways: "'Internet aesthetic' recycling; merges into e-girl lineage",
      notThisStyle: ["preppy", "minimal", "bohemian", "athletic", "classic"]
    },
    normcore: {
      origin: "Trend discourse + urban creative scenes",
      peakEra: "Mid 2010s",
      keyPieces: ["basic tees", "dad jeans", "white sneakers", "fleece", "functional outerwear"],
      styling: "Deliberate basics; 'dad' items; functional silhouettes; anti-fashion stance",
      musicAnchor: "None specific; taste stance",
      ethos: "'Anti-fashion' as fashion; sameness as knowing pose; rejection of difference-seeking",
      colors: ["gray", "beige", "white", "navy", "black"],
      materials: ["cotton", "denim", "synthetic", "fleece"],
      revivalPathways: "Becomes template for 'quiet' minimal cycles; often mixed with luxury signifiers",
      notThisStyle: ["maximalist", "glamorous", "logo-heavy", "attention-seeking"]
    },
    cottagecore: {
      origin: "Platform-native aesthetic; pandemic-era intensification",
      peakEra: "2020s",
      keyPieces: ["prairie dresses", "puff sleeves", "straw hats", "aprons", "embroidery"],
      styling: "Pastoral palettes; craft and domestic motifs; romantic, 'slow' living aesthetic",
      musicAnchor: "None specific; lifestyle aesthetic",
      ethos: "Escapism, 'slow' ideals, romanticized rural life, sustainability adjacent",
      colors: ["cream", "sage green", "dusty rose", "brown", "floral prints"],
      materials: ["cotton", "linen", "eyelet", "gingham"],
      revivalPathways: "Merges with vintage and sustainability discourse",
      notThisStyle: ["urban", "edgy", "punk", "glamorous", "modern minimalist"]
    },
    eGirl: {
      origin: "Tumblr-to-TikTok lineage; internet micro-scenes",
      peakEra: "Late 2010s–2020s",
      keyPieces: ["striped long-sleeve under tee", "pleated skirts", "platform boots", "chain accessories", "hair clips"],
      styling: "Alt signifiers recombined with 'cute' cues; performative styling for camera",
      musicAnchor: "Emo rap, pop-punk adjacent",
      ethos: "Internet persona play, remix logic, aesthetic experimentation",
      colors: ["black", "pink", "white", "red"],
      materials: ["mixed synthetic and cotton"],
      revivalPathways: "Explicit revival of early-2010s aesthetics; platform acceleration",
      notThisStyle: ["corporate", "traditional", "natural", "minimal", "adult professional"]
    },
    y2k: {
      origin: "Late 1990s/early 2000s pop + celebrity media",
      peakEra: "2000s original; 2020s revival",
      keyPieces: ["low-rise jeans", "butterfly clips", "mini skirts", "halter tops", "rhinestones", "tiny bags"],
      styling: "Logos, low-rise silhouettes, 'retro-futurist' gloss, playful excess",
      musicAnchor: "Pop, R&B",
      ethos: "Playful excess; irony in revival; celebrity aspiration",
      colors: ["pink", "baby blue", "silver", "white"],
      materials: ["synthetic", "denim", "rhinestones", "metallic"],
      revivalPathways: "Revival powered by archived imagery + resale + influencer styling",
      notThisStyle: ["earthy", "bohemian", "minimalist", "traditional", "modest"]
    }
  },

  /**
   * REVIVAL MECHANISMS
   * Understanding how and why styles return
   */
  revivalMechanisms: {
    bricolage: "Subcultures 'write' meaning through style by reworking commodities and symbols, creating new meanings through combination",
    incorporation: "Styles tend to be 'incorporated' (neutralized) through commercial production and media representation, turning resistance into marketable aesthetic",
    subculturalCapital: "Being 'authentic,' early, or knowledgeable carries value within scenes; revivals seek new combinations that signal both affiliation and distinction",
    nostalgiaCycles: "Nostalgia is socially patterned, emerging under specific conditions. Vintage consumption carries connotations of authenticity and distinction",
    mediaObjects: "Films, photography, magazines serve as 'memory objects' that catalyze revivals by packaging looks into portable narratives (e.g., Quadrophenia for mod revival)",
    platformAcceleration: "Digital systems reward rapid iteration, producing 'aesthetics' that can be assembled and discarded quickly; TikTok intensifies this",
    streetToCatwalk: "Multi-directional diffusion where street styles influence luxury (documented by V&A 'Streetstyle' exhibition 1994)"
  },

  /**
   * STYLE MATCHING RULES
   * For the AI stylist to use when matching products
   */
  matchingRules: {
    eraAccuracy: "When a user specifies an era (e.g., '70s'), prioritize actual vintage from that decade. A 1990s piece cannot authentically deliver '1970s hippie' even with similar patterns.",
    authenticitySignals: "Original vintage pieces carry more authenticity than revival/reproduction pieces for users seeking 'real' era aesthetics",
    subcultureCrossover: "Some subcultures share DNA: punk → goth → e-girl; mod → skinhead → punk (via shared boot culture); hippie → boho → cottagecore",
    designerAlignment: "Match designer reputation with aesthetic: Versace for bold glamour, Armani for quiet luxury, Westwood for punk/rebellion",
    occasionMapping: "Consider unstated occasion: 'gallery opening' suggests intellectual chic; 'first date' suggests memorable but approachable",
    revivalAwareness: "Users may want 'Y2K aesthetic' which can be achieved through original 2000s pieces OR contemporary pieces that capture that vibe"
  },

  /**
   * KEY DESIGNER ASSOCIATIONS
   * Mapping designers to aesthetics/eras
   */
  designerAssociations: {
    versace: ["bold", "glamorous", "baroque", "gold", "powerful", "maximalist", "90s supermodel"],
    armani: ["quiet luxury", "understated", "tailored", "neutral", "elegant", "80s power", "90s minimalism"],
    valentino: ["romantic", "red", "couture", "feminine", "elegant", "Italian glamour"],
    prada: ["intellectual", "subversive", "nylon", "minimal", "conceptual", "90s-2000s"],
    chanel: ["classic", "tweed", "pearls", "Parisian", "timeless", "elegant"],
    dior: ["romantic", "feminine", "New Look", "elegant", "couture"],
    ysl: ["Le Smoking", "androgynous", "French cool", "safari", "70s-80s"],
    vivienneWestwood: ["punk", "British", "rebellious", "corsets", "tartan", "provocative"],
    alexanderMcQueen: ["dramatic", "dark romantic", "theatrical", "avant-garde", "emotional"],
    helmutLang: ["90s minimalism", "deconstructed", "urban", "intellectual"],
    martinMargiela: ["deconstructed", "conceptual", "avant-garde", "intellectual"],
    tomFord: ["glamorous", "sexy", "polished", "70s revival", "2000s excess"],
    ralphLauren: ["preppy", "American classic", "old money", "Hamptons", "equestrian"],
    calvinKlein: ["minimalist", "90s", "clean", "American sportswear", "understated sexy"]
  }
};

/**
 * Get relevant fashion context for a query
 * Used by AI stylist to enhance understanding
 */
export function getFashionContext(query: string): string {
  const lowerQuery = query.toLowerCase();
  const contexts: string[] = [];

  // Check for era mentions
  const eraKeywords: Record<string, string> = {
    "60s": "sixties",
    "1960": "sixties",
    "sixties": "sixties",
    "70s": "seventies",
    "1970": "seventies",
    "seventies": "seventies",
    "80s": "eighties",
    "1980": "eighties",
    "eighties": "eighties",
    "90s": "nineties",
    "1990": "nineties",
    "nineties": "nineties",
    "2000s": "twoThousands",
    "y2k": "twoThousands",
    "2010s": "twentyTens",
    "2020s": "twentyTwenties",
  };

  for (const [keyword, era] of Object.entries(eraKeywords)) {
    if (lowerQuery.includes(keyword)) {
      const decadeInfo = FASHION_KNOWLEDGE.decades[era as keyof typeof FASHION_KNOWLEDGE.decades];
      if (decadeInfo) {
        contexts.push(`ERA CONTEXT (${era}): ${decadeInfo.summary}. Key pieces: ${decadeInfo.keyPieces.join(", ")}. Key designers: ${decadeInfo.designers.join(", ")}.`);
      }
      break;
    }
  }

  // Check for subculture mentions
  const subcultureKeywords: Record<string, string> = {
    "mod": "mods",
    "hippie": "hippies",
    "boho": "hippies",
    "bohemian": "hippies",
    "punk": "punk",
    "new romantic": "newRomantic",
    "goth": "goth",
    "gothic": "goth",
    "rave": "rave",
    "hip hop": "hipHop",
    "hip-hop": "hipHop",
    "grunge": "grunge",
    "riot grrrl": "riotGrrrl",
    "emo": "emoScene",
    "scene": "emoScene",
    "normcore": "normcore",
    "cottagecore": "cottagecore",
    "prairie": "cottagecore",
    "e-girl": "eGirl",
    "egirl": "eGirl",
    "y2k": "y2k",
  };

  for (const [keyword, subculture] of Object.entries(subcultureKeywords)) {
    if (lowerQuery.includes(keyword)) {
      const subInfo = FASHION_KNOWLEDGE.subcultures[subculture as keyof typeof FASHION_KNOWLEDGE.subcultures];
      if (subInfo) {
        contexts.push(`SUBCULTURE CONTEXT (${subculture}): ${subInfo.ethos}. Peak era: ${subInfo.peakEra}. Key pieces: ${subInfo.keyPieces.join(", ")}. Colors: ${subInfo.colors.join(", ")}. NOT this style: ${subInfo.notThisStyle.join(", ")}.`);
      }
      break;
    }
  }

  return contexts.join("\n\n");
}

export default FASHION_KNOWLEDGE;
