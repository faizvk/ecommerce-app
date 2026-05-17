/**
 * Shared catalog data + image helpers used by both seed scripts.
 *
 * - scripts/seedProducts.js       — destructive: wipes and reseeds the entire
 *                                   products collection.
 * - scripts/seedProductsExtend.js — non-destructive: migrates legacy category
 *                                   keys onto the canonical set, then tops up
 *                                   each canonical category to 30 items.
 *
 * Keeping the catalog in one place stops the two scripts from drifting.
 */

import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

/* ─────────────────────────  ENV LOADER  ───────────────────────── */
export function loadEnv() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const backendRoot = path.resolve(__dirname, "..");
  const candidates = [".env", "ecommerce-app.env", ".env.local"];
  const envPath = candidates
    .map((f) => path.join(backendRoot, f))
    .find((p) => fs.existsSync(p));

  if (envPath) {
    dotenv.config({ path: envPath });
    console.log(`→ Loaded env from: ${path.basename(envPath)}`);
  } else {
    dotenv.config();
  }
}

/* ─────────────────────────  IMAGE HELPERS  ───────────────────────── */
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const STOPWORDS = new Set([
  "pro", "plus", "mini", "max", "series", "elite", "premium", "wireless", "smart",
  "classic", "vintage", "genuine", "pure", "fresh", "cordless", "electric", "ultra",
  "slim", "digital", "and", "with", "the", "of", "a", "an", "high", "for", "in",
  "on", "by", "ml", "lt", "kg", "gm", "pc", "pcs", "set", "pack", "fit", "size",
  "made", "from", "rich", "best", "top", "new", "free", "full", "natural",
]);

const KEYWORD_OVERRIDES = {
  electronics: {
    "Smart Home Hub": "speaker,smarthome",
    "USB-C 7-in-1 Hub": "usb,hub",
    "Smart Bulbs (Pack of 4)": "lightbulb,led",
    "Smart Wi-Fi Plug (Pack of 2)": "smartplug",
    "VR Headset for Mobile": "vr,headset",
  },
  fashion: {
    "Cotton T-Shirts (Pack of 3)": "tshirt",
    "Crewneck Basic T-Shirt": "tshirt",
    "Track Suit Set (2pc)": "tracksuit",
  },
  home: {
    "Smart Wi-Fi Thermostat": "thermostat",
    "Tower Fan Bladeless": "fan,tower",
    "Ceiling Fan with LED Light": "fan,ceiling",
    "Vacuum Sealer Machine": "vacuum,sealer",
    "Hand Mixer with Stand": "mixer,kitchen",
    "Belgian Waffle Maker": "waffle",
    "Cold-Press Slow Juicer": "juicer",
    "Memory Foam Pillows (Pair)": "pillow,bed",
  },
  beauty: {
    "Eau de Parfum (50ml)": "perfume",
    "Liquid Foundation SPF 25": "foundation,makeup",
    "Hyaluronic Acid Serum": "skincare,serum",
    "Retinol Night Serum": "serum,skincare",
  },
  sports: {
    "Yoga Mat 6mm (Anti-Slip)": "yogamat",
    "Adjustable Dumbbells 24kg": "dumbbell",
    "Resistance Bands Set": "resistance,band",
    "Cricket Bat (English Willow)": "cricket,bat",
  },
  books: {
    "Atomic Habits": "book,reading",
    "The Psychology of Money": "book,finance",
    "Sapiens: A Brief History": "book,history",
    "Ikigai": "book",
  },
  grocery: {
    "Pure Cow's Ghee (500g)": "ghee,butter",
    "Fresh Curd / Yogurt (500g)": "yogurt,curd",
    "Basmati Rice (5kg)": "rice,basmati",
    "Whole Wheat Flour (5kg)": "flour,wheat",
  },
};

function extractKeyword(name) {
  const cleaned = name
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/[^\w\s-]/g, " ")
    .replace(/\d+\.?\d*\s*(g|gm|kg|ml|l|w|inch|in|cm|mm|hz|fps|cup|oz)\b/gi, " ")
    .replace(/\d+/g, " ")
    .split(/[\s-]+/)
    .map((w) => w.trim())
    .filter((w) => w && w.length >= 3 && !STOPWORDS.has(w));
  return cleaned.slice(-2).join(",");
}

export function buildImagesFor(category, index, name) {
  const overrides = KEYWORD_OVERRIDES[category] || {};
  const productKw = overrides[name] || extractKeyword(name);
  const catKw = slug(category).replace("-", ",");
  const tags = productKw || catKw;
  return [
    `https://loremflickr.com/800/800/${tags}?lock=${index * 7 + 11}`,
    `https://loremflickr.com/800/800/${tags}?lock=${index * 7 + 23}`,
  ];
}

/* ─────────────────────────  CATALOGS (30 per category)  ─────────────────────────
 * Tuple format: [name, description, mrp (costPrice), sellingPrice (salePrice)]
 * Price convention: costPrice = MRP/list, salePrice = customer-facing (lower).
 */

export const ELECTRONICS = [
  ["Wireless Bluetooth Earbuds Pro", "Crystal-clear audio with active noise cancellation. 30-hour battery with charging case. IPX5 sweat resistant. Touch controls and dual-device pairing.", 2999, 1499],
  ["Smart Watch Series 7", "Fitness tracker with heart rate monitoring, SpO2, sleep tracking, and 50+ sport modes. 1.7\" AMOLED display, 7-day battery life, IP68 water resistant.", 7999, 4499],
  ["Portable Bluetooth Speaker", "20W rich stereo sound with deep bass. 24-hour playtime, IPX7 waterproof, party mode pairs two speakers. Built-in mic for hands-free calls.", 4499, 2299],
  ["Noise-Cancelling Headphones", "Premium over-ear headphones with hybrid ANC. 40-hour battery, plush memory foam cushions, foldable design with carry case.", 8999, 4999],
  ["Wireless Charging Pad 15W", "Fast charge for Qi-enabled phones. Slim aluminium body with non-slip surface. LED indicator and over-heat protection.", 1499, 799],
  ["Smartphone Flagship 5G", "6.7\" AMOLED 120Hz display. 50MP triple camera with OIS. Snapdragon processor, 12GB RAM, 256GB storage. 5000mAh with 65W fast charge.", 79999, 49999],
  ["Smart Home Hub", "Voice-controlled home automation. Compatible with Alexa, Google Assistant. Controls lights, plugs, and 200+ smart devices.", 5999, 3299],
  ["Fitness Tracker Band", "Slim lightweight band with heart-rate, step counter, calories, sleep stages. 14-day battery, water resistant 5ATM.", 2999, 1499],
  ["Wireless Gaming Mouse", "16000 DPI optical sensor, 70-hour battery, RGB lighting. Programmable buttons and lightweight 78g design for esports.", 4999, 2499],
  ["USB-C 7-in-1 Hub", "HDMI 4K, USB-C PD 100W, 2x USB 3.0, SD/microSD card reader, RJ45 Ethernet. Aluminium build, plug-and-play.", 2999, 1799],
  ["Power Bank 20000mAh", "Triple output (2x USB-A, 1x USB-C PD). 22.5W fast charge, LED battery display, charges phones 4-5 times.", 2499, 1399],
  ["Bluetooth Soundbar 2.1", "120W output with built-in subwoofer. HDMI ARC, optical, AUX, USB inputs. Movie/Music/News modes with deep bass.", 12999, 7499],
  ["Smart Bulbs (Pack of 4)", "16M color RGB+W LED bulbs. Wi-Fi controlled via app, schedules, music sync, voice control. E27 base, 9W each.", 2999, 1799],
  ["Mini Drone with HD Camera", "Compact foldable drone with 1080p camera, 3-axis gimbal stabilization. 25-min flight, GPS return-home, beginner-friendly.", 8999, 5499],
  ["Wireless Slim Keyboard", "Low-profile chiclet keys, multi-device pairing (Bluetooth + 2.4GHz). 18-month battery, backlit keys, quiet typing.", 3499, 1999],
  ["Smart Video Doorbell", "1080p HD camera with night vision, 2-way audio, motion detection. Wi-Fi connected with mobile alerts. Battery or wired.", 6999, 3999],
  ["4K Action Camera", "Ultra HD 60fps recording, image stabilization. 30m waterproof case, Wi-Fi sharing, comes with mounts and accessories.", 8999, 5499],
  ["E-Reader 7\" with Backlight", "Anti-glare e-ink display, adjustable warm light, 16GB storage holds thousands of books. Weeks of battery life.", 9999, 6999],
  ["Sport Wireless Earbuds", "Secure ear-hooks for running, Bluetooth 5.3, 36-hour combined playtime. IP67 dustproof and waterproof.", 2999, 1599],
  ["RGB Mechanical Keyboard", "Hot-swappable switches, full RGB lighting, anti-ghosting. Detachable USB-C cable, programmable macros, gaming-grade build.", 7499, 3999],
  ["Bluetooth Selfie Stick Tripod", "Extends to 100cm. Wireless remote, fits all phones, 360° rotation, foldable for travel. Tripod stand for hands-free shots.", 1499, 799],
  ["VR Headset for Mobile", "Universal fit for 4.5–6.7\" phones. Adjustable lenses, breathable foam padding, immersive 360° viewing for movies and games.", 2499, 1299],
  ["Wireless Lapel Microphone", "Plug-and-play wireless mic for content creators. 25-hour battery, 100m range, noise reduction. Compatible with iPhone, Android, cameras.", 4999, 2499],
  ["Smart Wi-Fi Plug (Pack of 2)", "Control any plugged-in device from your phone. Schedule, timer, energy monitor. Works with Alexa & Google Home.", 1999, 999],
  ["Phone Tripod with Ring Light", "10\" LED ring light with 3 colour modes, 10 brightness levels. Adjustable tripod stand, phone holder, perfect for selfies & vlogs.", 3499, 1999],
  ["Wireless Game Controller", "Compatible with PC, Android, iOS. Bluetooth + USB-C wired. Hall effect joysticks, 16-hour battery, vibration feedback.", 4999, 2999],
  ["Webcam 1080p Full HD", "Auto-focus, dual mics with noise cancellation, 90° wide angle. Plug-and-play USB, privacy shutter, Zoom/Teams ready.", 3999, 2199],
  ["Smart Body Scale", "Bluetooth scale measuring 13 metrics including BMI, body fat, muscle mass. Syncs with fitness apps, supports 16 users.", 2499, 1399],
  ["Ultra-Slim Laptop 14\"", "Intel Core i5, 16GB RAM, 512GB SSD. 14\" Full HD IPS display, fingerprint reader, 12-hour battery. Aluminium chassis, 1.3kg.", 79999, 54999],
  ["External SSD 1TB", "USB-C 3.2 Gen 2, 1050 MB/s read/write. Pocket-sized, shock-resistant, AES 256-bit encryption.", 12999, 8499],
];

export const FASHION = [
  ["Classic White Sneakers", "Versatile leather sneakers with cushioned insoles and rubber soles. Goes with everything from jeans to chinos. Unisex.", 2999, 1799],
  ["Vintage Denim Jacket", "Mid-wash 100% cotton denim jacket. Two chest pockets, button-front, classic relaxed fit. Layers over hoodies and tees.", 3999, 2299],
  ["Leather Crossbody Bag", "Compact full-grain leather bag with adjustable strap. Two zip compartments, fits phone, wallet, keys. Perfect day-out companion.", 4499, 2499],
  ["Cotton T-Shirts (Pack of 3)", "Pre-shrunk 180gsm combed cotton. Crew neck, side seams, tagless. Black/Grey/White included. Everyday essential.", 1499, 899],
  ["Slim-Fit Stretch Jeans", "Mid-rise dark wash with subtle stretch for comfort. 5-pocket styling, fades naturally. Pair with sneakers or boots.", 2999, 1799],
  ["Hooded Sweatshirt", "Heavyweight 350gsm cotton-blend hoodie. Kangaroo pocket, drawcord hood, ribbed cuffs. Soft brushed inside.", 2499, 1399],
  ["Knit Sweater Pullover", "Cozy ribbed-knit sweater in a relaxed fit. Crew neck, soft acrylic blend, perfect for cooler evenings.", 2999, 1699],
  ["Lightweight Running Shoes", "Breathable mesh upper, energy-return foam midsole. 8mm heel drop, suits daily running 5-15km. Available in 3 colours.", 4999, 2999],
  ["Wool Beanie Hat", "100% merino wool beanie. One-size, soft and warm without being itchy. Perfect for winter walks and morning runs.", 999, 599],
  ["Aviator Sunglasses", "Polarised UV400 lenses, lightweight metal frame. Anti-reflective coating, ideal for driving and outdoor sports.", 2499, 1299],
  ["Bifold Leather Wallet", "Slim full-grain leather wallet with 6 card slots, ID window, and bill pocket. RFID-blocking technology.", 1999, 999],
  ["Analog Wristwatch", "Stainless steel case, sapphire-coated mineral glass, genuine leather strap. Japanese movement, 30m water resistant.", 5999, 3499],
  ["Cotton Polo Shirt", "Pique cotton polo with mother-of-pearl buttons. Classic 3-button placket, ribbed collar and cuffs. Office-to-weekend.", 1999, 1199],
  ["Slim Chino Trousers", "Premium cotton-blend chinos in a tapered fit. Hand pockets, back welt pockets, hidden coin pocket. Wrinkle-resistant.", 2999, 1799],
  ["Canvas Backpack 25L", "Heavy-duty waxed canvas with leather trims. Padded laptop sleeve fits 15\" laptop, bottle holder, anti-theft back pocket.", 3499, 1999],
  ["Suede Loafers", "Hand-stitched suede loafers with leather lining. Cushioned insole, flexible sole. Slip-on style, dress-down formal.", 4499, 2799],
  ["Striped Polo (Cotton)", "Heritage striped pique polo. Slim-fit, breathable, button placket. Goes with shorts, jeans, or chinos.", 2299, 1399],
  ["Oversized Hoodie", "Drop-shoulder relaxed-fit hoodie in heavyweight cotton-fleece. Roomy hood, kangaroo pocket. Streetwear staple.", 2999, 1699],
  ["Cargo Shorts", "Knee-length cotton-twill shorts with 6 pockets. Adjustable waist tab, durable for travel and outdoor activities.", 1999, 1199],
  ["Crewneck Basic T-Shirt", "Soft-touch 100% combed cotton, GSM 200. Pre-shrunk, retains shape after wash. Available in 8 colours.", 799, 499],
  ["Linen Shirt (Long Sleeve)", "100% pure linen with breathable weave. Mandarin collar, button-down placket. Ideal for summer.", 2999, 1799],
  ["Bomber Jacket", "Classic flight bomber with ribbed collar, cuffs, and hem. Two side pockets, sleeve zip pocket. Polyester-shell, quilted lining.", 4499, 2599],
  ["Slim Fit Suit Trousers", "Wrinkle-resistant wool-blend trousers. Flat front, no break, side adjustors. Office-ready and travel-friendly.", 3999, 2499],
  ["Flannel Plaid Shirt", "Brushed cotton flannel in classic plaid. Relaxed fit, pearl snap buttons, two chest pockets. Perfect for layering.", 2299, 1399],
  ["Genuine Leather Belt", "Top-grain leather belt with brushed-steel buckle. 35mm width, fits jeans and trousers. Adjustable.", 1499, 799],
  ["Beach Flip-Flops", "Cushioned EVA sole with toe-post style straps. Quick-dry, anti-slip tread. Lightweight for travel and beach.", 699, 399],
  ["Knit Cardigan", "Mid-weight V-neck cardigan with shell buttons. Soft cotton blend, slim ribbed cuffs and hem.", 2999, 1699],
  ["Athletic Joggers", "Tapered fit performance joggers. Moisture-wicking fabric, zip side pockets, elastic cuff. Gym to lounge.", 2299, 1399],
  ["Trench Coat", "Mid-length water-repellent trench. Storm flap, double-breasted buttons, belt with buckle. Classic outerwear.", 6999, 4499],
  ["Track Suit Set (2pc)", "Matching jacket and joggers in soft-touch poly-blend. Athletic stripe down sleeves and legs. Slim modern fit.", 3999, 2399],
];

export const HOME = [
  ["Robot Vacuum Cleaner", "Smart mapping with LIDAR navigation. 2700Pa suction, 4-stage cleaning, mop function, 150-min runtime. App + voice control.", 39999, 24999],
  ["Air Fryer 5L Digital", "Cook with 90% less oil. 8 preset programs, 60-min timer, non-stick basket. Family-size 5L, easy to clean.", 9999, 5999],
  ["Espresso Coffee Machine", "15-bar pump, milk frother for cappuccino/latte. 1.2L water tank, removable drip tray. Café-style at home.", 24999, 15999],
  ["Stand Mixer 5.5L", "1000W tilt-head mixer with 10 speeds. Stainless steel bowl, dough hook, whisk, beater. Vintage design.", 39999, 26999],
  ["Smart Convection Microwave", "32L capacity, 10 power levels, 200+ auto-cook menu. Convection + grill + microwave. Touch panel.", 18999, 12999],
  ["4-Slice Toaster", "Extra-wide slots, 7 browning levels, defrost and bagel functions. Stainless steel finish, removable crumb tray.", 4999, 2999],
  ["Glass Electric Kettle 1.7L", "1500W rapid-boil kettle with cool-touch handle. Auto shutoff, boil-dry protection, blue LED illumination.", 2499, 1499],
  ["High-Speed Blender 1500W", "Crushes ice, makes smoothies, soup, nut butter. 6 stainless blades, 2L jar, variable speed + pulse.", 9999, 5999],
  ["HEPA Air Purifier", "True HEPA H13 + activated carbon filter. Covers 50sqm, removes 99.97% of allergens, smoke, dust. Quiet sleep mode.", 14999, 8999],
  ["Ultrasonic Humidifier 4L", "Cool-mist whisper-quiet humidifier. 30-hour runtime, 360° nozzle, auto shut-off, optional aroma diffuser.", 3999, 2299],
  ["Smart Wi-Fi Thermostat", "Learning thermostat with smart scheduling. Energy-saving, app + voice control. Compatible with most HVAC systems.", 19999, 13999],
  ["Tower Fan Bladeless", "30\" tall tower fan with 3 speeds + 3 modes (Normal/Natural/Sleep). 12-hour timer, oscillation, remote.", 8999, 5499],
  ["Ceiling Fan with LED Light", "Modern 3-blade design, integrated LED light, 6-speed remote. Energy-efficient DC motor, reversible airflow.", 7999, 4999],
  ["Vacuum Sealer Machine", "Heat-seal & vacuum-seal in one. Dry/Moist food modes, 5 vacuum levels. Includes 10 bags. Keeps food fresh 5x longer.", 5999, 3499],
  ["Hand Mixer with Stand", "5-speed hand mixer with detachable stand. 250W motor, 5 attachments: beater, whisk, dough hooks. Easy storage.", 3999, 2499],
  ["Belgian Waffle Maker", "Deep-pocket Belgian waffles. Non-stick plates, indicator lights, browning control. Folds for storage.", 4499, 2799],
  ["Cold-Press Slow Juicer", "Masticating juicer extracts max nutrients. 60 RPM, low oxidation, quiet operation. Easy to clean.", 14999, 8999],
  ["Rice Cooker 1.8L (10 cups)", "Multifunctional: rice, porridge, steam, slow cook. Non-stick inner pot, keep-warm function. Includes steaming basket.", 3999, 2299],
  ["Electric Pressure Cooker 6L", "10-in-1 multi-cooker: pressure, slow cook, steam, sauté, yogurt, rice. 13 preset programs. Stainless inner.", 9999, 5999],
  ["Non-Stick Cookware Set (5pc)", "Granite-coated 5-piece cookware: frypan, saucepan with lid, kadai, tawa. PFOA-free, induction-ready, glass lid.", 7999, 4499],
  ["Cotton Bedsheet King Size", "200 TC pure cotton printed bedsheet with 2 pillow covers. Fits 78x72\" mattress. Soft, breathable, machine-wash.", 2499, 1399],
  ["Memory Foam Pillows (Pair)", "Contour-shaped memory foam pillows for neck support. Hypoallergenic, breathable bamboo cover, removable & washable.", 3999, 2199],
  ["Microfibre Bath Towels (Set of 4)", "Quick-dry plush microfibre towels. Super absorbent, lightweight, lint-free. 70x140cm.", 1999, 999],
  ["LED Wall Mirror with Lights", "Round LED-backlit bathroom mirror. 3 color temperatures, dimmable, defogger. 24\" diameter.", 7999, 4999],
  ["Diwali String Lights (5m)", "Warm white LED string lights, 5m with 50 LEDs. 8 lighting modes, IP44 indoor/outdoor, USB-powered.", 999, 549],
  ["Modular Storage Boxes (Set of 6)", "Stackable transparent organizer boxes. Snap-lock lids, food-safe BPA-free. Kitchen, pantry, kids' toys.", 1999, 1099],
  ["Floor Lamp (Modern Tripod)", "Adjustable tripod floor lamp with linen shade. Walnut wood legs. E27 bulb compatible (sold separately).", 5999, 3499],
  ["Wall Clock (Silent Sweep)", "12\" minimalist wall clock with non-ticking quartz movement. Wooden frame, easy-to-read numerals.", 1499, 799],
  ["Bookshelf 5-Tier Wooden", "Open 5-shelf bookcase in engineered wood. Anti-tip wall anchor included. 60x180cm, walnut finish.", 9999, 5999],
  ["Door Mat (Coir Anti-Slip)", "Heavy-duty natural coir doormat with rubber backing. Traps dirt, weatherproof, easy to clean. 60x40cm.", 799, 449],
];

export const BEAUTY = [
  ["Hyaluronic Acid Serum", "Intense hydration serum with 2% hyaluronic acid. Plumps fine lines, locks in moisture. Suits all skin types. 30ml.", 1499, 899],
  ["Vitamin C Face Serum", "Brightening 10% vitamin C serum with vitamin E. Reduces dark spots, evens skin tone. Lightweight, fast-absorbing. 30ml.", 1799, 999],
  ["Retinol Night Serum", "0.5% encapsulated retinol with squalane. Smooths fine lines and texture overnight. Build-up tolerance gradually. 30ml.", 2499, 1499],
  ["Moisturising Day Cream SPF 30", "Lightweight daily moisturiser with broad-spectrum SPF 30. Vitamin B5, no white cast, non-greasy. 50ml.", 1999, 1199],
  ["Niacinamide 10% Serum", "Pore-minimising serum with 10% niacinamide + 1% zinc. Controls oil, blurs blemishes. Fragrance-free. 30ml.", 999, 549],
  ["Eau de Parfum (50ml)", "Long-lasting unisex parfum. Top notes of bergamot, heart of jasmine, dry-down of amber and musk. 50ml glass bottle.", 4999, 2999],
  ["Liquid Foundation SPF 25", "24-hour wear medium-coverage foundation with SPF 25. Available in 12 shades. Buildable, dewy finish. 30ml.", 1799, 999],
  ["Matte Liquid Lipstick", "Velvet-matte finish lipstick, lightweight, kiss-proof. Vitamin E enriched. Available in 18 shades.", 799, 449],
  ["Eyeshadow Palette (12 Shades)", "Pigmented matte + shimmer eyeshadows. Long-wear formula, smooth blending. Cruelty-free, vegan.", 1999, 1199],
  ["Volumizing Mascara (Waterproof)", "Waterproof lengthening + volumising mascara. Conditioned with castor oil. Smudge-proof, easy to remove.", 899, 499],
  ["Sulfate-Free Shampoo (400ml)", "Gentle sulfate-free shampoo with argan oil. Adds shine without stripping. Safe for coloured and curly hair.", 899, 549],
  ["Deep Conditioning Hair Mask (250g)", "Intensive 5-min hair mask with keratin, coconut, and shea butter. Repairs damage, smooths frizz, adds gloss.", 1199, 699],
  ["Anti-Dandruff Shampoo (200ml)", "Pyrithione zinc + tea tree oil shampoo for flake-free scalp. Gentle daily use. Soothes itchiness.", 549, 349],
  ["Argan Hair Oil (100ml)", "Cold-pressed Moroccan argan oil. Tames frizz, adds shine, protects from heat. Lightweight, non-greasy.", 699, 449],
  ["Sheet Face Mask (Box of 10)", "Korean-style hydrating sheet masks: hyaluronic, vitamin C, snail mucin, aloe, charcoal varieties. 10 pack.", 999, 599],
  ["Body Lotion with Shea (400ml)", "24-hour moisturising body lotion with shea butter and vitamin E. Light, non-sticky, dermatologist-tested.", 699, 399],
  ["Foaming Face Wash (150ml)", "Daily gentle foaming face wash with green tea. Removes dirt and oil without drying. pH balanced.", 449, 269],
  ["Lip Balm Trio (SPF 15)", "Triple pack of moisturising lip balms with SPF 15. Vanilla, rose, mint flavours. With beeswax and vitamin E.", 599, 349],
  ["Sunscreen SPF 50 Gel (75ml)", "Lightweight invisible-finish gel sunscreen. Broad-spectrum SPF 50 PA+++. Non-comedogenic, water-resistant.", 799, 499],
  ["Body Wash (Coconut · 500ml)", "Sulfate-free moisturising body wash with coconut milk. Creamy lather, leaves skin soft and lightly scented.", 599, 349],
  ["Hair Straightener (Ceramic)", "Floating ceramic plates with ionic technology. 5 temperature settings up to 230°C. 60-sec heat-up, swivel cord.", 3499, 1999],
  ["Hair Curling Wand (32mm)", "Tourmaline-ceramic barrel for shiny, frizz-free curls. 6 heat settings up to 210°C. Includes heat-resistant glove.", 2999, 1799],
  ["Electric Trimmer (Beard)", "Cordless beard trimmer with 20 length settings (0.5–10mm). 90-min runtime, USB-C charging, washable head.", 2499, 1399],
  ["Facial Cleansing Brush", "Silicone facial brush with 2 zones — deep cleansing + anti-aging. 8 intensities, USB-rechargeable, IP67 waterproof.", 3499, 1999],
  ["Makeup Brush Set (12 pcs)", "Synthetic-bristle professional brush kit: face, eye, contour, blender. Includes faux-leather case.", 1999, 1199],
  ["Nail Polish Set (6 Shades)", "Long-wear gel-effect nail polish set. 6 trendy shades, quick-dry formula, chip-resistant, vegan.", 999, 549],
  ["Compact Makeup Mirror with LED", "Travel mirror with built-in dimmable LED lights. 1x + 7x magnification, USB-rechargeable.", 1499, 899],
  ["Eyebrow Shaping Kit", "Complete brow kit: tweezers, brush, scissor, stencils, gel, powder duo, brow razor. Beginner-friendly.", 1299, 699],
  ["Body Scrub (Coffee · 200g)", "Exfoliating coffee body scrub with cocoa butter. Smooths skin, fights cellulite, reveals glow. Vegan.", 799, 449],
  ["Perfume Gift Set (3x 25ml)", "Discovery set of 3 mini perfumes — floral, woody, fresh. Perfect for travel or trying scents before committing.", 2499, 1499],
];

export const SPORTS = [
  ["Yoga Mat 6mm (Anti-Slip)", "Eco-friendly TPE yoga mat. 6mm cushioning, double-sided non-slip, lightweight 900g. Includes carry strap.", 1999, 1199],
  ["Adjustable Dumbbells 24kg", "Pair of adjustable dumbbells, 2.5kg to 24kg per side. Quick-twist dial, compact storage. Replaces 15 weights.", 19999, 12999],
  ["Resistance Bands Set", "Set of 5 colour-coded loop bands (10-50 lb). Latex-free natural rubber, includes door anchor, handles, ankle straps, carry bag.", 1499, 799],
  ["Skipping Rope (Adjustable)", "Tangle-free PVC speed skipping rope. Ball-bearing handles, memory-foam grip, adjustable 3m length. Burns 200 cal in 10 min.", 599, 299],
  ["Foam Roller (Trigger Point)", "High-density 13x33cm foam roller with EVA grid pattern. Relieves muscle tightness, improves recovery. Up to 150kg load.", 1499, 899],
  ["Pull-Up Bar (Doorway)", "No-screw doorway pull-up bar. Fits 60-90cm doorframes, supports 150kg. 6 grip positions: chin-up, wide, narrow, push-up.", 1999, 1199],
  ["Kettlebell 12kg (Vinyl-Coated)", "Cast-iron kettlebell with vinyl coating. Wide flat base for floor protection. Smooth handle for swings, presses, snatches.", 2499, 1499],
  ["Boxing Gloves (16oz)", "Synthetic-leather boxing gloves with multi-layer foam. Velcro wrist strap, mesh palm for breathability. Heavy-bag training.", 2499, 1399],
  ["Cycling Helmet (Adult)", "Lightweight in-mold helmet, 18 vents, MIPS rotation system. Adjustable dial-fit, removable visor. ISI certified.", 3499, 1999],
  ["Sports Water Bottle (1L)", "BPA-free Tritan water bottle with flip-lock straw. Leak-proof, easy-grip texture, time-marked. Dishwasher-safe.", 699, 399],
  ["Gym Duffle Bag 40L", "Spacious 40L duffle bag with shoe compartment, wet pocket. Padded shoulder strap, water-resistant nylon, multiple pockets.", 1999, 1199],
  ["Treadmill Foldable (Home)", "Compact home treadmill, 1-12 km/h, 12 preset programs, LCD display. Folds for storage. Max user weight 110kg.", 39999, 24999],
  ["Exercise Bike (Magnetic)", "Quiet magnetic-resistance indoor cycling bike. 8 levels, LCD monitor, adjustable seat & handlebars. Tablet holder included.", 19999, 12999],
  ["Ab Wheel Roller (Dual)", "Ergonomic dual-wheel ab roller with foam handles. Knee pad included. Builds core strength, easy storage.", 999, 549],
  ["Stretching Band Set (3pc)", "3 long-loop stretching bands (light, medium, heavy). Improves flexibility, ideal for yoga, pilates, physical therapy.", 999, 549],
  ["Bicycle Front + Rear Lights (USB)", "USB-rechargeable bike light set. 200 lumens front + 30 lumens rear, IPX5 waterproof. 5 light modes, 10-hour runtime.", 1499, 799],
  ["Cricket Bat (English Willow)", "Grade 3 English willow cricket bat. SH (long handle), 1180g, 9-piece cane handle. Pre-knocked-in.", 5999, 3499],
  ["Cricket Set (Junior)", "Junior cricket kit — bat, ball, wickets, bails, stumps, carry bag. Ideal for ages 8-12. Lightweight tennis-ball bat.", 2999, 1799],
  ["Football (Size 5, FIFA Approved)", "Match-quality football with hand-stitched panels. 32-panel construction, durable PU casing. FIFA Quality Pro.", 1999, 1099],
  ["Basketball (Size 7)", "Indoor/outdoor composite leather basketball. Deep channels, soft-touch grip, regulation size 7 (29.5\").", 1799, 999],
  ["Badminton Racket (Pair)", "Lightweight aluminium-alloy badminton racket set with 3 shuttlecocks. Even-balance frame, ideal for casual play.", 1499, 799],
  ["Tennis Racket (Adult)", "Pre-strung graphite tennis racket, 27\" length, 270g. Oversized 100 sq in head for forgiveness. Includes cover.", 3499, 1999],
  ["Trekking Backpack 50L", "50L trekking backpack with rain cover, hip belt, hydration sleeve. Multiple compartments, padded back panel.", 4999, 2999],
  ["Camping Tent (3-Person)", "Lightweight 3-person dome tent, water-resistant 2000mm, easy 5-min setup. Mesh windows for ventilation. Carry bag.", 5999, 3499],
  ["Sleeping Bag (Mummy Style)", "3-season mummy sleeping bag, comfort 5°C. Polyester with hollow-fibre fill. Compression sack included. 230x80cm.", 3999, 2299],
  ["Trekking Pole (Pair)", "Aluminium adjustable trekking poles (65-135cm). Cork grips, anti-shock springs, carbide tips, removable mud baskets.", 2499, 1499],
  ["Inflatable Pool Float", "Giant flamingo pool float, 1.4m wingspan. Reinforced PVC, dual valves for fast inflation. Adult use.", 1999, 1099],
  ["Swim Goggles (Anti-Fog)", "Adult swim goggles with anti-fog UV-protection lenses. Soft silicone seal, adjustable strap. Includes nose clip + ear plugs.", 999, 499],
  ["Fitness Smart Watch", "Activity tracker with 100+ sport modes, heart-rate, SpO2, GPS-connected. 14-day battery, 5ATM waterproof.", 4999, 2999],
  ["Weight Lifting Belt", "Genuine leather weightlifting belt, 10cm wide. Double-prong roller buckle, reinforced stitching, suede inner lining.", 2499, 1499],
];

export const BOOKS = [
  ["Atomic Habits", "James Clear's bestseller on tiny changes that yield remarkable results. The proven framework for habit formation. Paperback, 320 pages.", 599, 349],
  ["The Psychology of Money", "Morgan Housel's timeless lessons on wealth, greed, and happiness. 19 short stories on how people think about money. 256 pages.", 499, 299],
  ["Sapiens: A Brief History", "Yuval Noah Harari's landmark book on how Homo sapiens came to dominate Earth. Hardcover, 464 pages.", 799, 499],
  ["Ikigai", "Japanese secret to a long and happy life. Garcia & Miralles. Slim but powerful reading. Hardcover, 208 pages.", 399, 249],
  ["Think and Grow Rich", "Napoleon Hill's classic on personal achievement and wealth-building. Distills 25 years of research. 320 pages.", 299, 179],
  ["Rich Dad Poor Dad", "Robert Kiyosaki's #1 personal finance book. Lessons from two dads — what the rich teach their kids. 336 pages.", 499, 299],
  ["The Alchemist", "Paulo Coelho's allegorical bestseller on following your dreams. Translated into 70+ languages. 208 pages.", 399, 249],
  ["Man's Search for Meaning", "Viktor Frankl's account of surviving Auschwitz and finding purpose. A psychological masterpiece. 192 pages.", 349, 199],
  ["The Subtle Art of Not Giving a F*ck", "Mark Manson's counterintuitive approach to living a good life. Direct, profane, life-changing. 224 pages.", 599, 349],
  ["12 Rules for Life", "Jordan Peterson's antidote to chaos. Practical principles for life with depth and wit. Hardcover, 448 pages.", 699, 449],
  ["Deep Work", "Cal Newport's guide to focused success in a distracted world. Rules for cultivating deep concentration. 304 pages.", 599, 349],
  ["The 7 Habits of Highly Effective People", "Stephen Covey's classic on personal effectiveness. Principle-centered approach. 432 pages.", 599, 349],
  ["Thinking, Fast and Slow", "Daniel Kahneman's groundbreaking work on the two systems that drive thought. Nobel laureate. 512 pages.", 699, 449],
  ["The Power of Now", "Eckhart Tolle's spiritual guide to enlightenment. Practical teachings on living in the present. 240 pages.", 499, 299],
  ["Becoming", "Michelle Obama's deeply personal memoir. From childhood to First Lady. Hardcover, 448 pages.", 899, 549],
  ["Educated", "Tara Westover's memoir of escaping a survivalist family and earning a PhD. 352 pages.", 599, 349],
  ["The Midnight Library", "Matt Haig's novel about a library between life and death, where each book is a different life. 304 pages.", 499, 299],
  ["Where the Crawdads Sing", "Delia Owens' atmospheric mystery and coming-of-age story set in North Carolina marshlands. 384 pages.", 499, 299],
  ["The Silent Patient", "Alex Michaelides' twisty psychological thriller — a woman who shoots her husband and never speaks again. 320 pages.", 399, 249],
  ["A Brief History of Time", "Stephen Hawking's exploration of black holes, the Big Bang, and the nature of time. 256 pages.", 599, 349],
  ["Premium Hardbound Notebook A5", "240-page dotted A5 notebook with PU leather cover. Lay-flat binding, ribbon bookmark, elastic closure, pen loop.", 999, 549],
  ["Fountain Pen with Ink Cartridges", "Polished-finish fountain pen with medium nib. Includes 6 ink cartridges (blue, black, blue-black). Gift box.", 1999, 1199],
  ["Gel Ink Pen Set (10 colours)", "Smooth-writing 0.5mm gel pen set in 10 colours. Quick-drying, fade-resistant. Perfect for journaling and study.", 499, 249],
  ["Sticky Notes Variety Pack", "12 pads of sticky notes — assorted colours and sizes. 100 sheets each. Strong adhesive, easy peel.", 399, 199],
  ["Highlighters (Pack of 6)", "Pastel-colour chisel-tip highlighters. Smear-proof on most paper. Quick-dry, no bleed-through.", 299, 149],
  ["Desk Calendar 2026", "Premium 12-month flip desk calendar with monthly art. Includes goal tracker and notes section.", 599, 349],
  ["Bookmark Set (Magnetic, 12 pcs)", "Magnetic bookmarks with literary quotes. 12 unique designs in a gift box. Folds to grip pages without falling.", 499, 249],
  ["Leather-Bound Journal A5", "Hand-bound A5 journal with full-grain leather cover and unlined cotton paper. Travel-friendly. 200 pages.", 1999, 1199],
  ["Wooden Bookends (Pair)", "Solid sheesham wood bookends with brass trim. Holds 10-15 books. Hand-finished, sold as a pair.", 1499, 849],
  ["Reading Light (Clip-On)", "USB-rechargeable clip-on book light. 3 brightness levels, 360° flexible neck. Up to 60 hours runtime.", 999, 499],
];

export const GROCERY = [
  ["Basmati Rice (5kg)", "Premium aged long-grain basmati rice. Aromatic, fluffy when cooked, ideal for biryani and pulao. 5kg pack.", 899, 649],
  ["Whole Wheat Flour (5kg)", "100% pure whole wheat chakki atta. Stone-ground, no maida added. Soft rotis. 5kg recyclable pack.", 349, 249],
  ["Toor Dal (1kg)", "Premium polished yellow toor dal. Cleaned, ready to cook. Rich in plant protein and fibre. 1kg.", 199, 149],
  ["Sunflower Oil (5L Jar)", "Refined sunflower cooking oil, light and heart-healthy. Rich in vitamin E. Pet jar for easy storage. 5L.", 1199, 899],
  ["Cold-Pressed Coconut Oil (1L)", "100% pure cold-pressed virgin coconut oil. Suitable for cooking, hair and skin care. Glass bottle, 1L.", 699, 499],
  ["Mustard Oil (1L)", "Kachi ghani cold-pressed mustard oil. Strong pungent aroma. Ideal for Indian cooking and pickling. 1L pet bottle.", 249, 179],
  ["Pure Cow's Ghee (500g)", "Traditional bilona-method cow ghee. Granular texture, rich aroma. Free from chemicals and preservatives. 500g jar.", 599, 469],
  ["Honey (Raw, 500g)", "100% pure raw multi-flora honey. Unprocessed, unfiltered, retains natural enzymes and pollen. Glass bottle.", 449, 299],
  ["Green Tea (100 Bags)", "Premium long-leaf green tea bags. Antioxidant-rich. Refreshing, zero calories. 100 individually-wrapped bags.", 599, 349],
  ["Black Coffee (Instant, 100g)", "100% Arabica freeze-dried instant coffee. Bold flavour, smooth body. Glass jar, 100g (makes ~50 cups).", 549, 349],
  ["Filter Coffee Powder (500g)", "South Indian filter coffee blend (80% coffee, 20% chicory). Rich, aromatic, perfect with hot milk. 500g.", 499, 349],
  ["Mixed Nuts Trail Mix (500g)", "Premium mix of almonds, cashews, walnuts, pistachios, raisins. Roasted, unsalted. 500g resealable pack.", 999, 699],
  ["California Almonds (500g)", "Premium whole California almonds. Crunchy, naturally sweet. Rich in vitamin E and magnesium. 500g zip-lock.", 799, 549],
  ["Whole Cashews (500g)", "W320 grade whole cashews. Plump, creamy, perfect for cooking or snacking. Premium quality, 500g pack.", 999, 699],
  ["Dates (Medjool, 500g)", "Premium Medjool dates — large, soft, naturally sweet. Pitted, ready to eat. Imported, vacuum packed. 500g.", 999, 699],
  ["Rolled Oats (1kg)", "Whole-grain rolled oats. Heart-healthy fibre, no added sugar. Perfect for breakfast and baking. 1kg pack.", 299, 199],
  ["Muesli with Fruit & Nuts (500g)", "Crunchy multigrain muesli with raisins, almonds, cranberries. High fibre, low fat. 500g.", 449, 299],
  ["Cornflakes Original (875g)", "Crispy original cornflakes. Fortified with iron and B-vitamins. Low fat. Family pack 875g.", 399, 249],
  ["Whole Milk (1L Tetra Pack)", "UHT-treated whole milk. Long shelf life, no refrigeration until opened. Rich in calcium. 1L tetra.", 90, 69],
  ["Fresh Curd / Yogurt (500g)", "Traditional set curd, thick and tangy. Made daily from fresh whole milk. No preservatives. 500g cup.", 99, 79],
  ["Paneer Block (200g)", "Soft fresh Indian cottage cheese. Made from pure cow's milk, no fillers. Perfect for tikka and curries. 200g.", 110, 89],
  ["Salted Butter (500g)", "Premium creamery butter, lightly salted. Spread on toast, melt over pancakes, or bake with. 500g.", 549, 449],
  ["Cheddar Cheese Block (200g)", "Aged sharp cheddar. Strong flavour, melts well in sandwiches and burgers. Vegetarian. 200g.", 320, 260],
  ["Tomato Ketchup (1kg)", "Classic tomato ketchup made with sun-ripened tomatoes. No artificial colours or flavours. 1kg squeeze bottle.", 199, 149],
  ["Soy Sauce (500ml)", "Naturally brewed light soy sauce. Umami-rich, perfect for stir-fries, noodles, marinades. 500ml.", 249, 179],
  ["Olive Oil Extra-Virgin (500ml)", "Cold-pressed extra-virgin olive oil from Spain. Fruity, peppery finish. Glass bottle to preserve flavour. 500ml.", 999, 699],
  ["Pasta (Penne · 1kg)", "100% durum wheat semolina pasta. Holds sauce beautifully. Cooks in 9 min. 1kg.", 249, 169],
  ["Dark Chocolate (70% Cocoa, 100g)", "Premium dark chocolate bar with 70% cocoa. Rich, smooth, slightly bitter. Vegan, gluten-free. 100g.", 349, 199],
  ["Granola Bars (Box of 10)", "Crunchy granola bars with honey, almonds, raisins. 30g each, individually wrapped. Perfect for on-the-go.", 449, 299],
  ["Sparkling Water (12 Cans)", "Naturally sourced sparkling mineral water. Zero calories, lightly carbonated. Pack of 12 × 330ml cans.", 599, 399],
];

/* Map of category-key → catalog, used for iteration. */
export const CATALOGS = {
  electronics: ELECTRONICS,
  fashion:     FASHION,
  home:        HOME,
  beauty:      BEAUTY,
  sports:      SPORTS,
  books:       BOOKS,
  grocery:     GROCERY,
};
