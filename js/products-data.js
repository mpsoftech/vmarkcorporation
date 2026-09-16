/**
 * V MARK CORPORATION - OFFICIAL PRODUCT CATALOG DATA
 * Extracted directly from official company brochure.
 * Do not add unsubstantiated specifications or certifications.
 */

const VMARK_PRODUCTS = [
  // ================= CATEGORY 1: ROTARY SCREEN & ENGRAVING MACHINERY =================
  {
    id: "rotary-screen-coating-machine",
    category: "engraving-rotary",
    categoryName: "Rotary Screen & Engraving",
    name: "Rotary Screen Coating Machine",
    tagline: "High-speed precision emulsion coating for rotary printing screens",
    image: "assets/images/rotary_screen_coating_machine.jpg",
    badge: "Engraving Machinery",
    shortDesc: "Automatic high-speed coating machine engineered for precise and uniform photosensitive emulsion application on rotary nickel screens.",
    overview: "The V Mark Rotary Screen Coating Machine is designed to deliver uniform, bubble-free, and repeatable emulsion layers across standard and high-mesh rotary nickel screens. Built for smooth automatic operation and swift cleaning between batches.",
    keyFeatures: [
      "Precise and repeatable coating layer thickness",
      "High coating speed for optimum workflow throughput",
      "Easy to operate with intuitive manual & automatic controls",
      "Fully automatic operation cycle with smooth drive motion",
      "Easy to clean design with quick reservoir disassembly",
      "Compatible with standard rotary screen diameters and repeat lengths"
    ],
    applications: [
      "Textile rotary screen engraving departments",
      "Screen emulsion application and preparation",
      "Design studio and industrial textile printing houses"
    ],
    specs: [
      { label: "Operation Mode", value: "Automatic / Semi-Automatic" },
      { label: "Coating Type", value: "Photosensitive Emulsion Coating" },
      { label: "Application", value: "Rotary Nickel Screens" },
      { label: "Cleaning Process", value: "Rapid Dismount & Flush" },
      { label: "Chassis", value: "Heavy duty industrial fabrication" }
    ]
  },
  {
    id: "curing-oven-polymerizer",
    category: "engraving-rotary",
    categoryName: "Rotary Screen & Engraving",
    name: "Curing Oven (Screen Polymerizer)",
    tagline: "Uniform thermal baking and polymerization for rotary screens",
    image: "assets/images/curing_oven_polymerizer.jpg",
    badge: "Thermal Processing",
    shortDesc: "Industrial screen polymerizer providing fast heating, uniform heat distribution, and excellent insulation for reliable screen curing.",
    overview: "The V Mark Curing Oven (Screen Polymerizer) provides controlled thermal conditions required to polymerize cured emulsions and endring adhesives on rotary screens, ensuring durability and high tensile resistance during intense print runs.",
    keyFeatures: [
      "Fast heating cycle to reach target polymerization temperature rapidly",
      "Automatic thermal regulation and temperature monitoring",
      "Uniform heat circulation throughout the curing chamber",
      "High-grade thermal insulation minimizing heat dissipation and power consumption",
      "Heavy duty door seals ensuring tight internal atmospheric retention",
      "Multiple screen capacity support for batch baking"
    ],
    applications: [
      "Rotary screen emulsion polymerization",
      "Endring adhesive curing and bonding",
      "Textile screen preparation departments"
    ],
    specs: [
      { label: "Heating Mechanism", value: "Fast Uniform Electric/Thermal Air" },
      { label: "Control System", value: "Automatic Temperature Regulation" },
      { label: "Insulation", value: "High-density thermal barrier" },
      { label: "Application", value: "Screen Polymerization & Curing" }
    ]
  },
  {
    id: "endring-fixing-machine",
    category: "engraving-rotary",
    categoryName: "Rotary Screen & Engraving",
    name: "Endring Fixing Machine (Glueing Machine)",
    tagline: "High-precision concentric alignment and bonding of endrings",
    image: "assets/images/endring_fixing_machine.jpg",
    badge: "Assembly Precision",
    shortDesc: "Specialized machinery designed for accurate concentric alignment, fitting, and adhesive bonding of endrings to rotary screens.",
    overview: "Precise endring alignment is vital for rotary screen printing accuracy and repeat registration. The V Mark Endring Fixing Machine secures endrings with absolute concentricity, preventing distortion, runout, or seam misalignment on the printing press.",
    keyFeatures: [
      "Exact concentric holding and centering mechanisms",
      "Prevents screen distortion and ensures true rotational alignment",
      "Compatible with all standard repeats (640mm, 820mm, 914mm, 1018mm)",
      "Accommodates various endring types and screen lengths",
      "Rigid mechanical construction ensuring vibration-free stability",
      "Works in tandem with specialized heating lamps for quick adhesive set"
    ],
    applications: [
      "Endring glueing and screen assembly",
      "Rotary screen maintenance and refurbishing",
      "Textile printing prepress workshops"
    ],
    specs: [
      { label: "Alignment", value: "Concentric Precision Mandrel" },
      { label: "Repeats Supported", value: "Standard industrial rotary repeats" },
      { label: "Operation", value: "Manual / Semi-automatic fixture" },
      { label: "Build", value: "Rigid industrial tooling frame" }
    ]
  },
  {
    id: "lacquer-drying-climatizer",
    category: "engraving-rotary",
    categoryName: "Rotary Screen & Engraving",
    name: "Lacquer Drying Climatizer",
    tagline: "Climate-controlled screen drying and lacquer stabilization chamber",
    image: "assets/images/lacquer_drying_climatizer.jpg",
    badge: "Climate Control",
    shortDesc: "Climate-controlled chamber featuring air-conditioned cooling, energy-efficient operation, and uniform drying for freshly coated screens.",
    overview: "The V Mark Lacquer Drying Climatizer provides a controlled temperature and humidity environment to thoroughly dry photoemulsion and lacquer coats without atmospheric contamination, thermal shocks, or pinholes.",
    keyFeatures: [
      "Easy to use with straightforward controls",
      "Energy saving thermal and refrigeration cycles",
      "Automatic running with programmed drying stages",
      "Integrated air condition unit for dehumidification and cooling",
      "Heavy-duty, insulated chamber ensuring consistent internal environment",
      "Dust-free internal environment protects sensitive emulsion coatings"
    ],
    applications: [
      "Drying photosensitive lacquer after screen coating",
      "Controlled climate stabilization before exposure",
      "High-precision textile engraving plants"
    ],
    specs: [
      { label: "Climate System", value: "Integrated Cooling & Heating" },
      { label: "Control", value: "Automatic Cycle Monitoring" },
      { label: "Chamber", value: "Insulated dust-sealed enclosure" },
      { label: "Energy Class", value: "High-efficiency thermal management" }
    ]
  },
  {
    id: "endring-removing-machine",
    category: "engraving-rotary",
    categoryName: "Rotary Screen & Engraving",
    name: "Endring Removing Machine",
    tagline: "Safe, rapid mechanical separation of endrings from worn screens",
    image: "assets/images/endring_removing_machine.jpg",
    badge: "Screen Reclamation",
    shortDesc: "Robust mechanical separator that extracts endrings cleanly from used rotary screens without damaging the reusable endrings.",
    overview: "Endrings represent a significant recurring asset in screen printing. The V Mark Endring Removing Machine applies uniform, controlled extraction force to detach endrings from expired or damaged rotary screens cleanly, readying them for cleaning and reuse.",
    keyFeatures: [
      "Safely removes endrings without bending, warping, or distorting them",
      "Drastically reduces labour time required for manual endring peeling",
      "Minimizes risk of operator injury and equipment fatigue",
      "Universal gripping tooling for various endring profiles and diameters",
      "Sturdy steel fabrication engineered for high torque and pull resistance"
    ],
    applications: [
      "Screen recycling and endring reclamation",
      "Pre-cleaning preparation in rotary screen workshops",
      "Textile printing plant maintenance departments"
    ],
    specs: [
      { label: "Extraction Method", value: "Mechanical Guided Pull" },
      { label: "Endring Protection", value: "Zero distortion grip" },
      { label: "Operation", value: "Manual / Pneumatic assisted" },
      { label: "Construction", value: "Structural steel chassis" }
    ]
  },
  {
    id: "screen-inspection-retouching-stand",
    category: "engraving-rotary",
    categoryName: "Rotary Screen & Engraving",
    name: "Screen Inspection & Retouching Stand",
    tagline: "Backlit rotational inspection table for flaw detection & touch-up",
    image: "assets/images/screen_inspection_stand.jpg",
    badge: "Quality Assurance",
    shortDesc: "Ergonomic illuminated inspection and retouching stand equipped with rotating rollers and internal lighting for inspecting engraved screens.",
    overview: "Detecting pinholes, bridge flaws, and emulsion defects before screens reach the printing press is crucial to avoiding expensive printing rejections. The V Mark Screen Inspection Stand features smooth rotating rollers and uniform internal illumination.",
    keyFeatures: [
      "Uniform internal illumination through high-clarity acrylic pipe",
      "Smooth 360-degree manual rotation on low-friction bearing rollers",
      "Ergonomic working height for comfortable operator retouching",
      "Accommodates various standard screen lengths and repeats",
      "Rigid stand construction with built-in tool / lacquer trays"
    ],
    applications: [
      "Engraved screen quality inspection",
      "Pinhole patching and manual retouching",
      "Final pre-press verification before printing"
    ],
    specs: [
      { label: "Rotation", value: "360-degree roller mounted" },
      { label: "Lighting", value: "Internal diffuse inspection illumination" },
      { label: "Pipe Compatibility", value: "72\" to 160\" length acrylic pipes" },
      { label: "Frame", value: "Powder coated heavy duty steel" }
    ]
  },
  {
    id: "sample-table",
    category: "engraving-rotary",
    categoryName: "Rotary Screen & Engraving",
    name: "Flat / Rotary Sample Table",
    tagline: "Precision pilot sampling table for strike-offs & strike tests",
    image: "assets/images/sample_table.jpg",
    badge: "Sampling & Proofing",
    shortDesc: "High-precision sampling table for flat and rotary screen strike-offs, recipe testing, and color matching prior to full bulk production.",
    overview: "Eliminate bulk machine downtime by proofing print designs on the V Mark Sample Table. Allows textile colourists and design departments to test strike-offs, squeegee pressure, and paste viscosity on actual fabrics.",
    keyFeatures: [
      "Supports both flat screen and rotary screen sample proofing",
      "Precision-levelled table surface ensuring consistent strike pressure",
      "Accurate repeat alignment and manual registration aids",
      "Durable print blanket layer with high chemical resistance",
      "Compact footprint suited for textile design studios and QA labs"
    ],
    applications: [
      "Colour matching strike-offs and strike trials",
      "Design studio proofing and client sample approvals",
      "Laboratory paste formulation testing"
    ],
    specs: [
      { label: "Table Type", value: "Flat & Rotary Strike-off Testing" },
      { label: "Surface", value: "Precision ground flat with solvent blanket" },
      { label: "Registration", value: "Multi-axis manual registration guide" }
    ]
  },
  {
    id: "cloth-inspection-machine",
    category: "engraving-rotary",
    categoryName: "Rotary Screen & Engraving",
    name: "Cloth Inspection Machine",
    tagline: "Industrial fabric inspection table with precision scrolling and lighting",
    image: "assets/images/cloth_inspection_machine.jpg",
    badge: "Fabric Quality",
    shortDesc: "High-speed cloth inspection machine with illuminated inspection board, tension-controlled fabric scrolling, and length measurement.",
    overview: "The V Mark Cloth Inspection Machine ensures printed and finished textile fabrics are inspected thoroughly for print defects, colour variation, weaving faults, and stains before packing or further processing.",
    keyFeatures: [
      "Variable speed drive for comfortable, thorough inspection",
      "High-intensity top and back-illumination panels",
      "Accurate fabric length counter and meter logging",
      "Smooth forward, reverse, and stop electronic controls",
      "Tensionless rolling and batching mechanism prevents fabric elongation"
    ],
    applications: [
      "Post-print fabric inspection",
      "Pre-treatment fabric verification",
      "Textile quality assurance and packing departments"
    ],
    specs: [
      { label: "Fabric Drive", value: "Variable Speed Electric Motor" },
      { label: "Illumination", value: "Top & bottom diffuse inspection lamps" },
      { label: "Controls", value: "Forward / Reverse / Foot pedal stop" }
    ]
  },
  {
    id: "material-handling-box-trolley",
    category: "engraving-rotary",
    categoryName: "Rotary Screen & Engraving",
    name: "Material Handling Box Trolley",
    tagline: "Heavy-duty industrial logistics trolley for wet & dry fabric",
    image: "assets/images/material_handling_box_trolley.jpg",
    badge: "Logistics",
    shortDesc: "Rugged stainless steel / polyethylene lined box trolley engineered for seamless movement of textile fabrics, rolls, and wet goods.",
    overview: "Built for harsh dye-house and print shop conditions, the V Mark Material Handling Box Trolley features reinforced ribs, smooth interior finishes to prevent fabric snagging, and heavy-duty swivel casters.",
    keyFeatures: [
      "Smooth non-snag interior prevents fabric scuffing",
      "Heavy duty industrial wheels with smooth rolling ball bearings",
      "Corrosion-resistant construction suited for wet dyehouse environments",
      "Reinforced top rim and corner braces for long service life"
    ],
    applications: [
      "Fabric movement between printing and finishing",
      "Dye house and wash house internal transport",
      "Bulk material handling in processing mills"
    ],
    specs: [
      { label: "Material", value: "Industrial grade SS / Poly / Reinforced Steel" },
      { label: "Mobility", value: "360-degree heavy swivel casters" }
    ]
  },
  {
    id: "batching-trolley",
    category: "engraving-rotary",
    categoryName: "Rotary Screen & Engraving",
    name: "Batching Trolley",
    tagline: "A-frame / roll carriage trolley for continuous textile batching",
    image: "assets/images/batching_trolley.jpg",
    badge: "Logistics",
    shortDesc: "Heavy load-bearing A-frame batching trolley designed to support large diameter fabric rolls for feeding and winding on printing machines.",
    overview: "The V Mark Batching Trolley supports heavy rolls of greige and printed cloth, allowing smooth unwinding into rotary screen printing machines and continuous washing ranges.",
    keyFeatures: [
      "High load bearing capacity for large diameter fabric batches",
      "Center-shaft support with heavy-duty bearing brackets",
      "Smooth maneuverability even when fully loaded",
      "Robust welded structural steel frame"
    ],
    applications: [
      "Feeding fabric into rotary printing lines",
      "Winding fabric from inspection and stentering machines",
      "Textile processing batch storage"
    ],
    specs: [
      { label: "Frame", value: "Reinforced structural steel A-frame" },
      { label: "Bearings", value: "Self-aligning heavy pillow blocks" }
    ]
  },

  // ================= CATEGORY 2: SMART COLOUR KITCHEN =================
  {
    id: "smart-colour-kitchen-system",
    category: "colour-kitchen",
    categoryName: "Smart Colour Kitchen",
    name: "Smart Colour Kitchen (ECOLOPS)",
    tagline: "Systematically Economical Colour Kitchen for automated paste management",
    image: "assets/images/smart_colour_kitchen_system.jpg",
    badge: "Automation System",
    shortDesc: "Complete industrial colour kitchen system engineered for pigment, reactive, discharge, and disperse paste preparation with zero spillage.",
    overview: "The V Mark Smart Colour Kitchen represents a systematically economical approach (ECOLOPS) to colour paste management. Designed to replace messy manual mixing with automated preparation, pneumatic lifting stirrers, vacuum filtering, and closed-loop transfer.",
    keyFeatures: [
      "Cost effective operations with fast 6 to 8 month payback period",
      "Time saving: Cuts preparation cycle time by up to 40%",
      "Labour saving: Reduces required colour shop manpower by up to 50%",
      "Space saving: Highly compact, modular scaffolding and tank layout",
      "Water saving: Closed-loop cleaning and targeted drum washing",
      "Colour / Paste saving: Zero-spillage approach eliminates paste waste",
      "Environment friendly: Greatly reduces chemical runoff and wash water discharge",
      "Consistent homogeneous and uniform mixing for zero batch-to-batch shade variation"
    ],
    applications: [
      "Rotary screen printing colour kitchens",
      "Flatbed screen printing paste preparation",
      "Textile dyeing and processing paste dispensing"
    ],
    specs: [
      { label: "System Concept", value: "ECOLOPS - Systematically Economical" },
      { label: "Time Savings", value: "Up to 40% reduction" },
      { label: "Labour Savings", value: "Up to 50% reduction" },
      { label: "Payback Period", value: "6 to 8 Months" },
      { label: "Paste Compatibility", value: "Pigment, Procian/Reactive, Discharge, Disperse" }
    ]
  },
  {
    id: "thickener-paste-prep-unit",
    category: "colour-kitchen",
    categoryName: "Smart Colour Kitchen",
    name: "Thickener Paste Preparation Unit (TPPS)",
    tagline: "Homogeneous gum paste mixer ensuring exact recipe adherence",
    image: "assets/images/thickener_paste_prep_machine.jpg",
    badge: "Core Unit",
    shortDesc: "Automated gum paste preparation unit ensuring homogeneous mixing of thickener for consistent color paste quality and zero variation.",
    overview: "The V Mark Thickener Paste Preparation Unit (TPPS) delivers perfect homogeneous mixing of gum paste. Every particle of all ingredients is mixed properly, rapidly, and accurately through full timing and variable speed controls.",
    keyFeatures: [
      "Perfect homogeneous mixing of gum paste eliminates batch-to-batch variation",
      "Exact recipes can be programmed and followed with high repeatability",
      "Fast, accurate ingredient dispersion with high-shear action",
      "Full timing control and variable speed regulation for diverse gum types",
      "Direct pump transfer reduces manual handling, labour, and transit time",
      "Keeps the colour kitchen neat, clean, and tidy with a zero-spillage approach",
      "Substantial savings on expensive thickener and paste waste"
    ],
    applications: [
      "Preparation of base gum pastes (Sodium Alginate, Synthetic Thickeners, Guar Gum)",
      "High-throughput rotary printing colour shops",
      "Textile processing paste preparation"
    ],
    specs: [
      { label: "Mixing Technology", value: "High shear homogeneous agitator" },
      { label: "Speed Control", value: "Variable Frequency Speed Control" },
      { label: "Timing Control", value: "Full programmable timing system" },
      { label: "Piping Integration", value: "Direct connection to transfer pump & tanks" }
    ]
  },
  {
    id: "vacuum-colour-strainer",
    category: "colour-kitchen",
    categoryName: "Smart Colour Kitchen",
    name: "Vacuum Colour Strainer with Lifting & Tilting Unit",
    tagline: "Rapid vacuum filtration of printing pastes to avoid screen choke-ups",
    image: "assets/images/vacuum_colour_strainer_unit.jpg",
    badge: "Filtration",
    shortDesc: "Stainless steel 304 vacuum strainer with motorized lifting and tilting for rapid, foolproof straining of colour paste to prevent printing choke-ups.",
    overview: "Paste impurities and un-dissolved clumps cause devastating screen blockages and printing streaks. The V Mark Vacuum Colour Strainer utilizes a liquid ring vacuum pump and motorized lifting and tilting device to rapidly pull paste through fine filter meshes.",
    keyFeatures: [
      "Filtering body manufactured completely in S.S. 304 for maximum corrosion resistance",
      "Door seal in durable, chemical-resistant silicone rubber",
      "Integrated washing facility from the upper section for fast cleaning",
      "High-performance liquid ring vacuum pump for swift, continuous straining",
      "Motorised lifting and tilting device for effortless bucket discharge",
      "Easy and foolproof operation to avoid costly choke-ups during printing"
    ],
    applications: [
      "Filtering pigment, reactive, discharge, and disperse pastes",
      "Eliminating agglomerates and impurities before rotary printing",
      "Rapid bucket-to-bucket or tank straining"
    ],
    specs: [
      { label: "Body Material", value: "Stainless Steel 304" },
      { label: "Door Gasket", value: "High-grade Silicone Rubber" },
      { label: "Vacuum Pump", value: "Liquid Ring Vacuum Pump" },
      { label: "Discharge Device", value: "Motorized Lifting & Tilting Unit" },
      { label: "Capacities Available", value: "100 Ltr, 200 Ltr, and Custom" }
    ]
  },
  {
    id: "heavy-duty-paste-transfer-pump",
    category: "colour-kitchen",
    categoryName: "Smart Colour Kitchen",
    name: "Heavy Duty Paste Transfer Pump with Motor",
    tagline: "Positive displacement transfer of high-viscosity printing pastes",
    image: "assets/images/smart_colour_kitchen_system.jpg",
    badge: "Fluid Transfer",
    shortDesc: "High-torque paste transfer pump built for moving viscous thickener and colour pastes through piping networks without shear degradation.",
    overview: "Pumping dense printing pastes requires positive displacement engineering. The V Mark Heavy Duty Paste Transfer Pump transfers thickener paste effortlessly from the preparation tank to storage tanks and dispensing heads.",
    keyFeatures: [
      "High-torque motor and robust reduction gear transmission",
      "Handles high-viscosity thickeners without cavitation or stalling",
      "Non-pulsating smooth fluid displacement protects paste viscosity",
      "Stainless steel fluid contact parts for chemical neutrality",
      "Reversible flow capability for line emptying and cleaning"
    ],
    applications: [
      "Transferring gum from TPPS to bulk storage tanks",
      "Feeding colour paste to printing line dispensers",
      "Recirculation and closed-loop colour kitchen transfer"
    ],
    specs: [
      { label: "Motor", value: "Heavy Duty Industrial Geared Motor" },
      { label: "Fluid Contact", value: "Stainless Steel / Corrosion resistant" },
      { label: "Viscosity Range", value: "High-viscosity textile thickeners" }
    ]
  },
  {
    id: "ss-storage-tanks",
    category: "colour-kitchen",
    categoryName: "Smart Colour Kitchen",
    name: "S.S. Storage Tanks (1000 / 2000 Litres)",
    tagline: "Sanitary stainless steel storage tanks for base thickener reserves",
    image: "assets/images/ecolops_diagram.jpg",
    badge: "Bulk Storage",
    shortDesc: "Available in 4 to 8 tank modular banks with 1000 or 2000 litre capacity, complete with draining piping, valves, and level indicators.",
    overview: "Properly aged base paste ensures stable printing results. V Mark Stainless Steel Storage Tanks provide contamination-free storage for thickener reserves (Pigment 14%, Pigment 3%, Reactive base, etc.).",
    keyFeatures: [
      "Configurations of 4 or 8 tanks per bank with 1000 / 2000 Litre capacities",
      "All internal contact surfaces manufactured from high-grade Stainless Steel",
      "Integrated draining piping with precision shutoff valves",
      "Smooth internal radiused corners prevent stagnant paste buildup",
      "Supported on rigid elevated structural frames"
    ],
    applications: [
      "Holding thickener gum reserves",
      "Bulk pigment and reactive paste buffer storage",
      "Automated colour kitchen distribution systems"
    ],
    specs: [
      { label: "Capacities", value: "1000 Ltrs / 2000 Ltrs per tank" },
      { label: "Bank Size", value: "4 to 8 units modular arrangement" },
      { label: "Valves", value: "Full bore S.S. ball / drain valves" }
    ]
  },
  {
    id: "electronic-weighing-scale-conveyor",
    category: "colour-kitchen",
    categoryName: "Smart Colour Kitchen",
    name: "Electronic Weighing Scale & S.S. Conveyor",
    tagline: "Precision formulation weighing paired with 15ft motorized conveyor",
    image: "assets/images/smart_colour_kitchen_system.jpg",
    badge: "Dosing & Handling",
    shortDesc: "High-accuracy digital weighing platform integrated alongside an approximate 15-foot (1.5m / modular) stainless steel drum conveyor.",
    overview: "Eliminate human carrying errors and heavy drum handling. The V Mark S.S. Conveyor and Electronic Weighing Scale allow operators to slide colour barrels smoothly under stirring stations and dispense dyes with gram-level precision.",
    keyFeatures: [
      "High accuracy electronic weighing indicator with tare function",
      "Heavy-duty low-profile stainless steel weighing platform",
      "Stainless steel roller conveyor (~15 feet / modular layout) for easy drum gliding",
      "Dramatically reduces operator fatigue and eliminates back strain",
      "Waterproof and chemical-resistant electronics for washdown durability"
    ],
    applications: [
      "Colour recipe weighing and dye dispensing",
      "Drum transfer between dispensing, mixing, and straining",
      "Ergonomic colour shop workflow automation"
    ],
    specs: [
      { label: "Conveyor Length", value: "Approx 15 feet (modular design)" },
      { label: "Conveyor Rollers", value: "Stainless Steel free-rolling rollers" },
      { label: "Scale Display", value: "High-precision digital readout with tare" }
    ]
  },

  // ================= CATEGORY 3: STIRRERS • MIXERS • AGITATORS =================
  {
    id: "high-speed-stirrer",
    category: "stirrers-mixers",
    categoryName: "Stirrers • Mixers • Agitators",
    name: "High Speed Stirrer (0.5 HP – 30 HP)",
    tagline: "High-shear dispersion mixer for rapid paste dissolving & blending",
    image: "assets/images/high_speed_stirrer.jpg",
    badge: "High Shear",
    shortDesc: "High-velocity industrial mixer ranging from 0.5 HP to 30 HP, engineered for rapid dispersion of pigments, binders, and thickeners.",
    overview: "The V Mark High Speed Stirrer is the industrial workhorse of textile dyehouses. Delivering intensive vortex shear to break down agglomerates and achieve complete chemical dissolution in minutes.",
    keyFeatures: [
      "Power ratings available from 0.5 HP up to 30 HP for diverse batch volumes",
      "Heavy-duty solid stainless steel shaft dynamically balanced for vibration-free speed",
      "Accommodates Cowles disperser or high-shear turbine impellers",
      "Variable or direct speed configurations tailored to paste viscosity",
      "Robust bearing housing ensuring continuous industrial durability"
    ],
    applications: [
      "Pigment dispersion and paste mixing",
      "Binder and chemical dissolving",
      "Bulk textile dye preparation"
    ],
    specs: [
      { label: "Power Range", value: "0.5 HP to 30 HP" },
      { label: "Shaft Material", value: "Stainless Steel 304 / 316" },
      { label: "Impeller", value: "High-shear Cowles dissolver / Marine" },
      { label: "Mounting", value: "Stand / Flange / Mobile" }
    ]
  },
  {
    id: "stirrer-pneumatic-up-down",
    category: "stirrers-mixers",
    categoryName: "Stirrers • Mixers • Agitators",
    name: "Stirrer with Pneumatic Up-Down Arrangement",
    tagline: "Effortless pneumatic cylinder lift for quick drum exchanges",
    image: "assets/images/stirrer_pneumatic.jpg",
    badge: "Pneumatic Lift",
    shortDesc: "Industrial stirrer mounted on a smooth pneumatic lift column for effortless raising and lowering of the mixing head into barrels.",
    overview: "Designed for high-throughput colour shops where barrels must be replaced rapidly. The pneumatic cylinder raises the mixing head at the turn of a valve, clearing the barrel edge with zero operator strain.",
    keyFeatures: [
      "Smooth, controlled pneumatic elevation and descent cylinder",
      "Integrated safety limit switches prevent operation when lifted",
      "Rigid guide columns prevent lateral deflection during high-speed agitation",
      "Standard pneumatic connections with air filter-regulator unit",
      "Perfect for drums ranging from 50 Litres to 200 Litres"
    ],
    applications: [
      "Colour kitchen mixing stations",
      "Frequent batch changing and formulation testing",
      "Textile printing ink blending"
    ],
    specs: [
      { label: "Lifting Mechanism", value: "Pneumatic Cylinder with Control Valve" },
      { label: "Guide Columns", value: "Hard-chrome plated twin pillars" },
      { label: "Compatibility", value: "50L to 200L standard drums" }
    ]
  },
  {
    id: "stirrer-balance-weight",
    category: "stirrers-mixers",
    categoryName: "Stirrers • Mixers • Agitators",
    name: "Stirrer with Balance Weight Mechanism",
    tagline: "Counter-balanced manual elevation for reliable, air-free lift",
    image: "assets/images/stirrer_balance_weight.jpg",
    badge: "Counter-Balanced",
    shortDesc: "Precision counter-weighted lifting mechanism allowing easy manual height adjustment without requiring compressed air supply.",
    overview: "For operations where compressed air is unavailable or where simple mechanical reliability is preferred, the V Mark Balance Weight Stirrer uses an internal counter-balance to make lifting a heavy motor feather-light.",
    keyFeatures: [
      "Counter-balance weight system enables effortless manual raising and lowering",
      "Zero pneumatic or hydraulic power needed for elevation",
      "Self-locking height positioning clamp",
      "Robust structural steel column with long service life",
      "Low maintenance with simple mechanical pivots"
    ],
    applications: [
      "Standalone colour mixing areas",
      "Remote or auxiliary paste stations",
      "Continuous industrial blending"
    ],
    specs: [
      { label: "Lift Mechanism", value: "Mechanical Counter-balance Weight" },
      { label: "Air Requirement", value: "None (Fully mechanical)" },
      { label: "Locking", value: "Positive mechanical hand clamp" }
    ]
  },
  {
    id: "stirrer-direct-mounting-clamp",
    category: "stirrers-mixers",
    categoryName: "Stirrers • Mixers • Agitators",
    name: "Stirrer with Direct Mounting with Clamp",
    tagline: "Portable clamp-on mixer for drums, barrels, and open tanks",
    image: "assets/images/stirrer_direct_clamp.jpg",
    badge: "Clamp-On",
    shortDesc: "Portable industrial agitator equipped with a heavy-duty angle-adjustable clamp for direct attachment to drum rims or tank edges.",
    overview: "Versatile and portable, this clamp-on stirrer attaches directly to the rim of any steel or plastic drum. The adjustable swivel clamp allows precise shaft angling to eliminate stagnant dead zones and minimize air entrapment.",
    keyFeatures: [
      "Heavy duty forged steel C-clamp securely locks onto tank rims",
      "Swivel articulation allows multi-angle shaft positioning",
      "Compact, lightweight design easily moved by a single operator",
      "Stainless steel shaft and balanced marine propeller or turbine",
      "Direct motor drive ensures maximum electrical-to-mechanical efficiency"
    ],
    applications: [
      "Direct drum agitation in dye store",
      "Maintaining suspension in chemical holding tanks",
      "Batch tinting and auxiliary mixing"
    ],
    specs: [
      { label: "Mounting Type", value: "Forged Clamp-on Rim Mount" },
      { label: "Angle Adjustment", value: "Ball & socket multi-directional clamp" },
      { label: "Portability", value: "High (Easily relocatable)" }
    ]
  },
  {
    id: "stirrer-inclined-shaft",
    category: "stirrers-mixers",
    categoryName: "Stirrers • Mixers • Agitators",
    name: "Inclined Shaft Direct Mounting Stirrer",
    tagline: "Permanent angled flange mount for optimized tank vortexing",
    image: "assets/images/stirrer_inclined_shaft.jpg",
    badge: "Tank Flange",
    shortDesc: "Flange-mounted inclined shaft agitator designed for permanent installation on storage tanks to create top-to-bottom turnover.",
    overview: "Mounted at a calculated incline on vessel sidewalls or tops, the V Mark Inclined Shaft Stirrer generates a vigorous off-center vortex that continuously folds surface pigments down into the liquid without requiring internal tank baffles.",
    keyFeatures: [
      "Engineered inclined mounting geometry prevents fluid swirl and creates turnover",
      "Bolted flange mounting for permanent, leak-free tank integration",
      "Vibration-isolated motor pedestal protects tank walls",
      "Continuous-duty TEFC motor designed for 24/7 industrial duty"
    ],
    applications: [
      "Bulk thickener storage tanks (1000L / 2000L)",
      "Stock solution vessels",
      "Continuous chemical mixing tanks"
    ],
    specs: [
      { label: "Mounting", value: "Fixed Angled Flange Plate" },
      { label: "Duty Cycle", value: "Continuous 24/7 Industrial" },
      { label: "Vortex Effect", value: "Off-center turnover without baffles" }
    ]
  },
  {
    id: "laboratory-stirrer",
    category: "stirrers-mixers",
    categoryName: "Stirrers • Mixers • Agitators",
    name: "Laboratory Stirrer",
    tagline: "Benchtop precision mixer for sample matching & formula trials",
    image: "assets/images/laboratory_stirrer.jpg",
    badge: "Lab Precision",
    shortDesc: "Compact benchtop laboratory stirrer with sensitive speed control for formulation trials, strike-off samples, and dye testing.",
    overview: "Precision colorists require exact laboratory simulation before scaling up to bulk production. The V Mark Laboratory Stirrer offers micro-speed regulation and interchangeability of miniature impellers for test beakers.",
    keyFeatures: [
      "Stepless fine speed control for delicate mixing or high-shear vortexing",
      "Stable benchtop stand with vertical height locking clamp",
      "Miniature stainless steel shafts and interchangeable lab impellers",
      "Quiet, smooth motor operation suitable for laboratory environments"
    ],
    applications: [
      "Textile testing laboratories",
      "Pre-production dye and thickener recipe formulation",
      "Design studio strike-off testing"
    ],
    specs: [
      { label: "Mounting", value: "Benchtop Stand with Height Adjustment" },
      { label: "Speed Control", value: "Stepless Electronic Dial" },
      { label: "Application", value: "Lab Beakers & Small Trial Vessels" }
    ]
  },

  // ================= CATEGORY 4: WASHING PLANT =================
  {
    id: "drum-washer-machine",
    category: "washing-plant",
    categoryName: "Washing Plant",
    name: "Drum Washer Machine",
    tagline: "High-pressure automatic cleaning for paste barrels & drums",
    image: "assets/images/drum_washer_machine.jpg",
    badge: "Washing Automation",
    shortDesc: "Dedicated high-pressure washing station designed to clean colour barrels and paste drums thoroughly with minimal water consumption.",
    overview: "Manual drum washing is labour-intensive, messy, and wastes thousands of litres of clean water. The V Mark Drum Washer encloses the barrel and directs multi-directional high-pressure water jets to scrub all residues in seconds.",
    keyFeatures: [
      "Water saving: Multi-directional spray nozzles focus water only where paste adheres",
      "Labour saving: Cleans a dirty 200-litre barrel in under two minutes automatically",
      "Contained washing enclosure prevents water splashing and keeps floor dry",
      "Heavy duty stainless steel / galvanized construction prevents corrosion",
      "Drainage sump connection for water recycling or effluent treatment routing"
    ],
    applications: [
      "Colour kitchen barrel and drum cleaning",
      "Washing paste residue before refilling",
      "Textile dyehouse sanitation"
    ],
    specs: [
      { label: "Nozzle Array", value: "High-pressure multi-directional rotating jets" },
      { label: "Enclosure", value: "Splash-proof steel housing with drainage basin" },
      { label: "Water Savings", value: "Drastic reduction vs manual hose washing" }
    ]
  },
  {
    id: "rotary-screen-washing-machine",
    category: "washing-plant",
    categoryName: "Washing Plant",
    name: "Rotary Screen Washing Machine (Horizontal)",
    tagline: "Horizontal dual-action jet washing for rotary nickel screens",
    image: "assets/images/rotary_screen_washing_machine.jpg",
    badge: "Screen Washing",
    shortDesc: "Horizontal washing machine equipped with internal and external spray headers to wash residual paste from rotary screens safely.",
    overview: "After long print runs, rotary screens must be washed immediately to prevent paste drying inside the fine nickel mesh. The V Mark Horizontal Screen Washer supports the screen on smooth rollers while high-pressure nozzles clean both interior and exterior surfaces.",
    keyFeatures: [
      "Simultaneous internal and external high-pressure washing",
      "Gentle rotational support protects thin nickel mesh from denting or creasing",
      "Uniform traversing spray carriage cleans the entire screen length evenly",
      "Significantly speeds up screen turnover between color changes on the press",
      "Enclosed drainage channel guides effluent directly to drain"
    ],
    applications: [
      "Post-print rotary screen washing",
      "Fast turnaround screen cleaning between production runs",
      "Rotary printing press maintenance"
    ],
    specs: [
      { label: "Orientation", value: "Horizontal Rotational Carriage" },
      { label: "Nozzles", value: "Internal & External traversing spray headers" },
      { label: "Screen Protection", value: "Low-friction polyurethane support wheels" }
    ]
  },
  {
    id: "vertical-rotary-screen-washing-machine",
    category: "washing-plant",
    categoryName: "Washing Plant",
    name: "Vertical Rotary Screen Washing Machine",
    tagline: "Space-saving vertical tower for washing & gravity drainage",
    image: "assets/images/vertical_screen_washing_machine.jpg",
    badge: "Vertical Tower",
    shortDesc: "Vertical washing tower providing floor-space saving, natural gravity water runoff, and uniform spray cleaning for rotary screens.",
    overview: "Where floor space is premium, the V Mark Vertical Screen Washing Machine stands the screen upright. Gravity accelerates water and paste drainage down the screen, leaving zero stagnant puddles inside the cylinder.",
    keyFeatures: [
      "Compact footprint utilizes vertical space efficiently in cramped washrooms",
      "Gravity assisted wash runoff ensures faster, cleaner drainage",
      "Pneumatic or motorized vertical spray ring travels smoothly from top to bottom",
      "Quick-clamp screen holding fixture for swift loading and unloading",
      "Splash-shield enclosure keeps operators completely dry"
    ],
    applications: [
      "Compact textile print shop washhouses",
      "Rapid post-printing screen cleaning",
      "High-throughput rotary printing plants"
    ],
    specs: [
      { label: "Orientation", value: "Vertical Column / Tower" },
      { label: "Spray Ring", value: "Full-surround traversing ring" },
      { label: "Footprint", value: "Extremely compact vertical design" }
    ]
  },
  {
    id: "diaphragm-pump",
    category: "washing-plant",
    categoryName: "Washing Plant",
    name: "Air-Operated Diaphragm Pump",
    tagline: "Explosion-proof fluid pump for effluent, solvents & paste transfer",
    image: "assets/images/diaphragm_pump.jpg",
    badge: "Pumping",
    shortDesc: "Heavy-duty air-operated double diaphragm (AODD) pump for transferring wash effluents, solvents, thick paste, and slurry.",
    overview: "Air-operated diaphragm pumps are indispensable in wash plants and colour kitchens because they run dry without damage, are self-priming, and handle solids and corrosive effluents safely with no electric spark hazards.",
    keyFeatures: [
      "Pneumatically powered: inherently explosion-proof and safe around water/solvents",
      "Self-priming with high suction lift capability",
      "Can run dry indefinitely without damaging internal components",
      "Handles abrasive wash slurry, paste sediments, and chemicals with ease",
      "Simple air-valve regulator controls output volume and pressure"
    ],
    applications: [
      "Wash plant wastewater and slurry transfer",
      "Drum emptying and solvent circulation",
      "Chemical dosing in processing lines"
    ],
    specs: [
      { label: "Power Source", value: "Compressed Air (AODD)" },
      { label: "Diaphragm Material", value: "Chemical resistant PTFE / Santoprene" },
      { label: "Run-Dry Capability", value: "100% Safe dry running" }
    ]
  },
  {
    id: "screen-degreasing-stand",
    category: "washing-plant",
    categoryName: "Washing Plant",
    name: "Screen De-Greasing Stand (Rotating Roller Type)",
    tagline: "Rotating roller fixture for chemical degreasing of new screens",
    image: "assets/images/screen_degreasing_stand.jpg",
    badge: "Pre-Treatment",
    shortDesc: "Rotating roller stand tailored for applying chemical degreasing agents to rotary screens before photosensitive emulsion coating.",
    overview: "Emulsion will peel or develop pinholes if residual oil or grease remains on new nickel screens. The V Mark Screen De-Greasing Stand features rotating rollers that allow even, continuous sponge or spray application of degreasing chemicals.",
    keyFeatures: [
      "Smooth rotating rollers provide uniform screen spinning during chemical application",
      "Chemical-resistant basin catches surplus degreasing agent for recycling",
      "Adjustable roller distance supports all standard screen diameters",
      "Essential pre-treatment step for flawless coating adhesion and longevity"
    ],
    applications: [
      "Screen preparation prior to photo-emulsion coating",
      "Oil and contaminant removal on new rotary screens",
      "Engraving plant pre-treatment"
    ],
    specs: [
      { label: "Roller Mechanism", value: "Rotating Chemical-Resistant Rollers" },
      { label: "Basin", value: "Stainless Steel drainage trough" },
      { label: "Adjustment", value: "Multi-diameter roller spacing" }
    ]
  },
  {
    id: "squeegee-washing-machine",
    category: "washing-plant",
    categoryName: "Washing Plant",
    name: "Squeegee Washing Machine",
    tagline: "Dedicated automated washer for rotary squeegee blades & rods",
    image: "assets/images/squeegee_washing_machine.jpg",
    badge: "Blade Cleaning",
    shortDesc: "Specialized washing unit engineered to clean squeegee blades, magnetic rods, and colour pipes rapidly without blade damage.",
    overview: "Cleaning long squeegee blades and magnetic squeegee rods manually often results in bent blades and uneven print pressure. The V Mark Squeegee Washing Machine holds blades securely while high-pressure jets strip away dried paste.",
    keyFeatures: [
      "Accommodates full length printing squeegee blades and pipes",
      "Prevents blade warping and edge nicking caused by manual scraping",
      "High-pressure wash jets clean hard-to-reach paste channels",
      "Drastically reduces colour change downtime on printing machines"
    ],
    applications: [
      "Rotary printing press squeegee maintenance",
      "Wash plant colour change routines",
      "Magnetic rod and blade sanitation"
    ],
    specs: [
      { label: "Capacity", value: "Full length rotary squeegees & rods" },
      { label: "Jet Array", value: "Linear high-pressure spray manifold" }
    ]
  },

  // ================= CATEGORY 5: ENGRAVING ACCESSORIES & TOOLS =================
  {
    id: "multiple-rotation-hydraulic-drive-station",
    category: "accessories",
    categoryName: "Engraving Accessories",
    name: "Multiple Rotation Hydraulic Drive Station",
    tagline: "Slow rotation of wet fabric rolls ensuring uniform dyeing results",
    image: "assets/images/hydraulic_drive_station_machine.jpg",
    badge: "Hydraulic Station",
    shortDesc: "Specialized slow-rotation drive station for wet fabric rolls that eliminates gravity dye pooling, saves power, and ensures uniform dyeing.",
    overview: "Directly featured in the brochure: this multiple rotation drive station rotates wet rolls slowly and continuously to prevent dye liquid from pooling at the bottom of the roll due to gravity while awaiting fixation.",
    keyFeatures: [
      "Ensures completely uniform dyeing results across the entire fabric batch",
      "Saves significantly on power and electricity bills",
      "Virtually maintenance-free design with heavy-duty components",
      "Shortest payback period through reduced fabric rejection and power savings",
      "Capable of driving multiple rolls simultaneously"
    ],
    applications: [
      "Slow rotation of wet fabric rolls after pad dyeing",
      "Cold pad-batch (CPB) dyeing dyehouses",
      "Textile processing and finishing plants"
    ],
    specs: [
      { label: "Drive Type", value: "High-torque low-RPM Hydraulic / Geared Drive" },
      { label: "Operation", value: "Continuous slow rotation for wet batches" },
      { label: "Maintenance", value: "Virtually Maintenance-Free" },
      { label: "Benefit", value: "Eliminates side-to-center / bottom dye pooling" }
    ]
  },
  {
    id: "clear-acrylic-pipe",
    category: "accessories",
    categoryName: "Engraving Accessories",
    name: "Clear Acrylic Pipe for Screen Checking Stand",
    tagline: "High-transparency inspection tubes from 72\" up to 160\" (4m)",
    image: "assets/images/accessories/acrylic_pipe_inspection.jpg",
    badge: "Inspection Core",
    shortDesc: "Ultra-clear optical grade acrylic tubes available from 72\", 80\", 100\" up to 160\" (up to 4 metres length) for screen retouching stands.",
    overview: "Manufactured from pristine optical-grade acrylic to ensure 100% distortion-free transmission of light during screen retouching and defect inspection.",
    keyFeatures: [
      "Available lengths: 72\", 80\", 100\" up to 160\" (up to 4 metre lengths)",
      "High optical clarity without internal waves, bubbles, or scratches",
      "Uniform wall thickness ensures smooth rotation on stand rollers",
      "Impact resistant and chemically resilient to retouching lacquers"
    ],
    applications: [
      "Rotary screen inspection and retouching stands",
      "Backlit defect evaluation",
      "Textile design studio quality checks"
    ],
    specs: [
      { label: "Lengths Available", value: "72\", 80\", 100\" up to 160\" (4 Metre Length)" },
      { label: "Material", value: "High Clarity Optical Grade Acrylic" }
    ]
  },
  {
    id: "exposing-air-bag",
    category: "accessories",
    categoryName: "Engraving Accessories",
    name: "Exposing Air Bag & Complete Tube Assembly",
    tagline: "Pneumatic expanding bladder ensuring intimate film-to-screen contact",
    image: "assets/images/accessories/exposing_air_bag_tube.jpg",
    badge: "Exposure Accessory",
    shortDesc: "Complete heavy-duty exposing air bag and tube assembly engineered for uniform pneumatic expansion during screen exposure.",
    overview: "Critical accessory for rotary screen exposure machines. Inflates uniformly inside the screen to press the photo film tightly against the sensitized screen surface with zero air pockets.",
    keyFeatures: [
      "Supplied as individual air bag or complete tube assembly",
      "Tough, elastic rubber compound resistant to pinhole leaks and fatigue",
      "High-pressure airtight brass valve fittings",
      "Ensures sharp, fine-line exposure resolution with zero light undercutting"
    ],
    applications: [
      "Rotary screen exposure machines",
      "Film-to-screen pneumatic vacuum clamping"
    ],
    specs: [
      { label: "Assembly", value: "Complete tube assembly with end fittings" },
      { label: "Material", value: "High tensile seamless pneumatic rubber" }
    ]
  },
  {
    id: "coating-rings",
    category: "accessories",
    categoryName: "Engraving Accessories",
    name: "Coating Rings with Wooden / Alu Holder & Rubber Rings",
    tagline: "Precision emulsion application rings with durable edge seals",
    image: "assets/images/accessories/coating_ring_holder.jpg",
    badge: "Coating Tool",
    shortDesc: "Coating rings with ergonomic wooden or aluminium holders and replaceable coating rubber rings for manual and auto-coating machines.",
    overview: "Delivers smooth, micro-meter consistent emulsion application along the cylindrical screen contour without streaks or dripping.",
    keyFeatures: [
      "Available with premium wooden or lightweight aluminium holders",
      "High elasticity coating rubber rings available separately as replacements",
      "Precision-molded profile for uniform emulsion deposit",
      "Chemical-resistant rubber compound withstands water and solvent lacquers"
    ],
    applications: [
      "Manual and automatic rotary screen coating machines"
    ],
    specs: [
      { label: "Holder Material", value: "Hardwood or Machined Aluminium" },
      { label: "Ring Material", value: "Precision calibrated synthetic rubber" }
    ]
  },
  {
    id: "screen-cutting-drum",
    category: "accessories",
    categoryName: "Engraving Accessories",
    name: "Screen Cutting Drum",
    tagline: "Precision cylindrical mandrel for square trimming of screen edges",
    image: "assets/images/accessories/screen_cutting_drum.jpg",
    badge: "Screen Prep",
    shortDesc: "Calibrated cylindrical drum for trimming rotary screens to precise length with perfectly square, burr-free ends prior to endring fitting.",
    overview: "Uneven screen ends cause endring misalignment and premature screen breakage. The V Mark Screen Cutting Drum guides clean, perpendicular cutting.",
    keyFeatures: [
      "Accurately ground outer diameter matches standard rotary screen repeats",
      "Circumferential guide grooves for razor-sharp cutting tools",
      "Heavy duty balanced metal construction"
    ],
    applications: [
      "Trimming raw nickel screens to length",
      "Pre-endring screen prep"
    ],
    specs: [
      { label: "Diameters", value: "Standard repeats (640mm, 820mm, 914mm, etc.)" }
    ]
  },
  {
    id: "screen-handling-carrier-handle",
    category: "accessories",
    categoryName: "Engraving Accessories",
    name: "Screen Handle, Carrier & Aluminium Clamps",
    tagline: "Ergonomic screen handling tools to eliminate creasing & finger damage",
    image: "assets/images/accessories/screen_carrier.jpg",
    badge: "Handling Tools",
    shortDesc: "Set of ergonomic screen handles, two-operator carriers, and lightweight aluminium screen handling clamps for damage-free screen transit.",
    overview: "Thin nickel mesh is easily dented by finger pressure. These purpose-designed handles and clamps grip screens securely without localized stress points.",
    keyFeatures: [
      "High strength lightweight cast aluminium clamps",
      "Cushioned contact pads prevent scratching or denting",
      "Enables single or dual operator transport of long screens safely"
    ],
    applications: [
      "Moving screens between coating, climatizer, and printer",
      "Washroom and store transport"
    ],
    specs: [
      { label: "Material", value: "High-grade cast aluminium & composite grip" }
    ]
  },
  {
    id: "shaping-and-tension-rings",
    category: "accessories",
    categoryName: "Engraving Accessories",
    name: "Stainless Steel Shaping Ring & Tension Ring",
    tagline: "Precision rounding rings maintaining true screen circularity",
    image: "assets/images/accessories/ss_shaping_ring.jpg",
    badge: "Forming Rings",
    shortDesc: "Corrosion-resistant stainless steel shaping rings and calibrated tension rings to preserve cylindrical geometry during baking and handling.",
    overview: "Maintains screen circularity while handling raw mesh cylinders and prevents oval deformation during washing and drying cycles.",
    keyFeatures: [
      "High grade stainless steel construction",
      "Precision-machined tolerances for perfect circularity",
      "Smooth rounded edges prevent screen puncture"
    ],
    applications: [
      "Screen circularity retention during storage and handling",
      "Engraving plant prep"
    ],
    specs: [
      { label: "Material", value: "Stainless Steel 304" }
    ]
  },
  {
    id: "cones-and-reservoirs",
    category: "accessories",
    categoryName: "Engraving Accessories",
    name: "Cones & Reservoirs for Auto-Coating & Manual Coating",
    tagline: "Uniform emulsion reservoirs and squeegee cones for coating machines",
    image: "assets/images/accessories/cones_reservoir_auto_coating.jpg",
    badge: "Coating Hardware",
    shortDesc: "Manual coating cones, squeegees, and auto-coating emulsion reservoirs engineered for leak-free, smooth emulsion distribution.",
    overview: "Manufactured to exact tolerances to hold photo-emulsion securely and release it evenly onto the coating ring during vertical carriage motion.",
    keyFeatures: [
      "Chemical-resistant smooth composite or aluminium finish",
      "Easy to dismantle and wash with warm water",
      "Available for both manual and automated coating machines"
    ],
    applications: [
      "Rotary screen emulsion application"
    ],
    specs: [
      { label: "Types", value: "Manual Squeegee Cones / Auto-Coating Reservoirs" }
    ]
  },
  {
    id: "super-spray-gun",
    category: "accessories",
    categoryName: "Engraving Accessories",
    name: "Super Spray Gun",
    tagline: "High-atomization spray gun for precise screen developing & washing",
    image: "assets/images/accessories/super_spray_gun.jpg",
    badge: "Developing Tool",
    shortDesc: "Ergonomic high-pressure water spray gun providing finely atomized spray patterns for washout and development of exposed screens.",
    overview: "Allows screen technicians to wash out unexposed emulsion gently and accurately without damaging delicate fine halftone screens.",
    keyFeatures: [
      "Adjustable spray pattern from needle jet to fine conical fan",
      "Ergonomic trigger lock reduces hand fatigue during long wash sessions",
      "Heavy duty brass and stainless steel internal valves"
    ],
    applications: [
      "Rotary screen developing tank washout",
      "Screen retouching and precision washdown"
    ],
    specs: [
      { label: "Body", value: "Heavy-duty impact polymer & brass" }
    ]
  },
  {
    id: "specialized-industrial-lamps",
    category: "accessories",
    categoryName: "Engraving Accessories",
    name: "Metal Halide Lamp & Heating Lamp",
    tagline: "High-UV exposure lamps and thermal heating lamps for endring glueing",
    image: "assets/images/accessories/metal_halide_lamp.jpg",
    badge: "Optical & Thermal",
    shortDesc: "Metal halide lamps for SCR-70S exposing machines, inkjet exposing ink, and specialized heating lamps for endring glueing machines.",
    overview: "Genuine replacement lamps specified in the V Mark brochure to ensure exact UV spectral output for screen exposure and uniform heat for adhesive curing.",
    keyFeatures: [
      "Metal Halide Lamp for SCR-70S exposing machine delivers peak actinic UV wavelength",
      "Heating Lamp for endring glueing machine delivers rapid, uniform adhesive setting",
      "Specialized Ink for Inkjet exposing machine provides high optical density masking"
    ],
    applications: [
      "Rotary screen UV exposure units",
      "Endring adhesive curing stations"
    ],
    specs: [
      { label: "SCR-70S Lamp", value: "High-intensity metal halide UV lamp" },
      { label: "Heating Lamp", value: "Infrared thermal glueing lamp" },
      { label: "Ink", value: "High-opacity inkjet formulation" }
    ]
  }
];

// Impeller types technical catalog from brochure Page 8
const VMARK_IMPELLERS = [
  { name: "Cowles Dissolver", desc: "High-shear dispersion disc for disintegrating pigment lumps and dispersing synthetic thickeners.", speed: "High Speed (1440 - 2800 RPM)" },
  { name: "Marine Propeller", desc: "Axial flow impeller producing powerful top-to-bottom liquid circulation with minimal shear.", speed: "Medium / High Speed" },
  { name: "Axial Flow Turbine", desc: "4-blade 45° pitched turbine creating balanced axial and radial fluid motion in deep vessels.", speed: "Medium Speed (400 - 960 RPM)" },
  { name: "Anchor Agitator", desc: "Contour-hugging slow speed sweep agitator preventing paste baking or adhesion to tank walls.", speed: "Slow Speed (20 - 80 RPM)" },
  { name: "Radial Flow Impeller", desc: "Radial discharge turbine generating strong horizontal shearing currents across tank baffles.", speed: "Medium Speed" },
  { name: "High-Shear Slotted Rotor", desc: "Precision rotor-stator head for micron-level emulsion and polymer dissolution.", speed: "High Speed" }
];

// 3D Plant Layout Workflow steps based on Page 12 diagram
const VMARK_PLANT_STATIONS = [
  {
    id: "unpacking",
    num: 1,
    name: "Unpacking Trough",
    desc: "Initial inspection, unpacking, and dimensional verification of fresh rotary nickel screens.",
    action: "Incoming screen inspection & preparatory staging"
  },
  {
    id: "degreasing",
    num: 2,
    name: "Degreasing Stand",
    desc: "Rotating roller treatment station removing protective manufacturing oils and contaminants.",
    action: "Chemical cleaning with rotating roller support"
  },
  {
    id: "auto-coating",
    num: 3,
    name: "Auto Coating Machine",
    desc: "Vertical high-speed precision coating applying uniform photosensitive emulsion onto the screen.",
    action: "Uniform emulsion application"
  },
  {
    id: "climatizer",
    num: 4,
    name: "Lacquer Drying Climatizer",
    desc: "Climate-controlled chamber providing air-conditioned drying to stabilize the emulsion coating.",
    action: "Dust-free dehumidified thermal drying"
  },
  {
    id: "laser-exposing",
    num: 5,
    name: "Laser Exposing Machine",
    desc: "Direct digital laser imaging transferring intricate textile patterns onto the sensitized screen.",
    action: "High resolution digital pattern exposure"
  },
  {
    id: "developing",
    num: 6,
    name: "Developing Tank",
    desc: "High-pressure washout station washing away unexposed emulsion to reveal open print mesh.",
    action: "Precision spray developing & pattern opening"
  },
  {
    id: "checking-stand",
    num: 7,
    name: "Checking Stand (Acrylic Pipe)",
    desc: "Internal illuminated acrylic pipe stand for 360° visual inspection and pinhole retouching.",
    action: "Backlit quality inspection and pinhole patching"
  },
  {
    id: "endring-fixing",
    num: 8,
    name: "Endring Glueing Machine",
    desc: "High-precision concentric alignment and thermal bonding of aluminum endrings to both ends.",
    action: "Concentric endring fitting and adhesive set"
  },
  {
    id: "curing-oven",
    num: 9,
    name: "Curing Oven (Polymerizer)",
    desc: "Controlled thermal baking chamber curing the emulsion and endring adhesive permanently.",
    action: "High temperature emulsion polymerization"
  },
  {
    id: "endring-removing",
    num: 10,
    name: "Endring Removing Machine",
    desc: "Post-production reclamation station detaching endrings cleanly for reuse on future screens.",
    action: "Mechanical endring extraction for recycling"
  },
  {
    id: "laserbird-stripper",
    num: 11,
    name: "Laser Stripping Machine (Laserbird)",
    desc: "Thermal / laser lacquer stripping machine stripping cured emulsion to reclaim nickel screens.",
    action: "Complete screen reclamation and lacquer stripping"
  }
];

if (typeof window !== 'undefined') {
  window.VMARK_PRODUCTS = VMARK_PRODUCTS;
  window.VMARK_PLANT_STATIONS = VMARK_PLANT_STATIONS;
}

export { VMARK_PRODUCTS, VMARK_PLANT_STATIONS };

