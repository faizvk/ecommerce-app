/**
 * Seed Products Script
 * ──────────────────────────────────────────────────────────────
 * Wipes the products collection and inserts 30 products per category
 * (150 total) with curated images, realistic pricing, and full descriptions.
 *
 * Usage:  node scripts/seedProducts.js
 *
 * Notes:
 * - Requires MONGOOSE_URI in .env
 * - Requires at least one admin user in the DB (used as sellerId)
 * - Uses Product.collection.insertMany to bypass Mongoose validators so we
 *   can store costPrice as the higher MRP and salePrice as the discounted
 *   price (matches what the frontend's strike-through UI expects).
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../model/product.model.js";
import User from "../model/user.model.js";
import { invalidateProductCache } from "../utils/productCache.js";

dotenv.config();

/* ─────────────────────────  IMAGE POOLS  ───────────────────────── */
const u = (id) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=80`;

const IMAGES = {
  electronics: [
    u("1505740420928-5e560c06d30e"), // headphones
    u("1583394838336-acd977736f90"), // earbuds
    u("1546054454-aa26e2b734c7"),    // smartwatch
    u("1542751371-adc38448a05e"),    // mechanical keyboard
    u("1527443224154-c4a3942d3acf"), // gaming mouse
    u("1558089687-f1d1e6a0cde3"),    // wireless charger
    u("1572569511254-d8f925fe2cbb"), // smart speaker
    u("1585399000684-d2f72660f092"), // phone
    u("1583863788434-e58a36330cf0"), // power bank
    u("1517336714731-489689fd1ca8"), // gadget setup
    u("1611532736597-de2d4265fba3"), // electronic device
    u("1556656793-08538906a9f8"),    // earbuds case
  ],
  fashion: [
    u("1542291026-7eec264c27ff"),    // red sneakers
    u("1542272604-787c3835535d"),    // jeans
    u("1556905055-8f358a7a47b2"),    // sweater knit
    u("1521572163474-6864f9cf17ab"), // t-shirt grey
    u("1551028719-00167b16eac5"),    // sneakers white
    u("1591047139829-d91aecb6caea"), // backpack canvas
    u("1572635196237-14b3f281503f"), // sunglasses
    u("1525507119028-ed4c629a60a3"), // shirt
    u("1521577352947-9bb58764b69a"), // hoodie
    u("1539109136881-3be0616acf4b"), // jacket
    u("1547949003-9792a18a2601"),    // watch
    u("1503341504253-dff4815485f1"), // shoes leather
  ],
  dairy: [
    u("1550583724-b2692b85b150"),    // milk bottle
    u("1559561853-08451507cbe7"),    // cheese block
    u("1571212515416-fef01fc43637"), // yogurt
    u("1628088062854-d1870b4553da"), // butter
    u("1628088062854-d1870b4553da"), // butter (alt)
    u("1542838132-92c53300491e"),    // cream
    u("1576186726115-4d51596775d1"), // dairy products
    u("1559561853-08451507cbe7"),    // cheese
    u("1486297678162-eb2a19b0a32d"), // milk glass
    u("1571835847905-26b6f8ba60de"), // yogurt cup
  ],
  technology: [
    u("1496181133206-80ce9b88a853"), // laptop on desk
    u("1593642632559-0c6d3fc62b89"), // laptop closed
    u("1547119957-637f8679db1e"),    // monitor
    u("1588702547923-7093a6c3ba33"), // keyboard monitor
    u("1517336714731-489689fd1ca8"), // gaming setup rgb
    u("1587202372775-e229f172b9d7"), // cable accessories
    u("1591488320449-011701bb6704"), // mouse rgb
    u("1623128830050-43dffd11dba7"), // ssd drive
    u("1576508302010-c8c5ed14f6e3"), // headset gaming
    u("1622653281474-04e8f4cd4d5e"), // dock station
    u("1518770660439-4636190af475"), // circuit chip
    u("1531297484001-80022131f5a1"), // tech gadgets
  ],
  homeAppliances: [
    u("1556909114-f6e7ad7d3136"),    // kitchen appliance
    u("1585515320310-259814833e62"), // microwave
    u("1601628828688-632f38a5a7d0"), // vacuum
    u("1585032226651-759b368d7246"), // coffee maker
    u("1588776814546-1ffcf47267a5"), // kitchen
    u("1610551543000-d4c5e5fcb3f3"), // air fryer
    u("1593642632823-8f785ba67e45"), // mixer
    u("1559056199-641a0ac8b55e"),    // toaster
    u("1556910108-3d9a10b6a8b5"),    // kettle
    u("1584269600464-37b1b58a9fe7"), // blender
    u("1574269909862-7e1d70bb8078"), // home appliance
    u("1581090700227-1e8e9fb1f3d4"), // smart home
  ],
};

const pickImages = (pool, idx) => {
  const a = pool[idx % pool.length];
  const b = pool[(idx + 3) % pool.length];
  return [a, b];
};

/* ─────────────────────────  PRODUCT CATALOG  ───────────────────────── */
// [name, description, mrp (costPrice), sellingPrice (salePrice)]
// Price convention: costPrice = MRP/list, salePrice = customer-facing (lower).
// Inserted via collection.insertMany to bypass schema validator.

const ELECTRONICS = [
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
  ["Bluetooth Car FM Adapter", "Stream music from phone via FM radio. Hands-free calls, 2 USB charge ports, voice assistant button, supports microSD.", 1299, 699],
  ["Cable Management Box", "Hides power strips and tangled cables. Bamboo lid, 12 ventilation holes, fits 6-outlet surge protector. Modern home office must-have.", 1799, 999],
];

const FASHION = [
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

const DAIRY = [
  ["Whole Cow's Milk (1L)", "Fresh full-cream pasteurized milk. Rich in calcium and vitamin D. Great for tea, coffee, cooking, and direct drinking.", 80, 65],
  ["Greek Yogurt Plain (500g)", "Thick, creamy strained yogurt with double protein. No added sugar. Pairs with fruit, granola, or savory dips.", 220, 180],
  ["Salted Butter (250g)", "Premium creamery butter churned from 100% pure cream. Rich flavor for spreading, baking, and cooking.", 290, 240],
  ["Cheddar Cheese Block (200g)", "Aged cheddar with sharp tangy flavor. Perfect for sandwiches, melts, and burgers. Vegetarian.", 320, 260],
  ["Cream Cheese Spread (200g)", "Smooth, mild, spreadable cream cheese. Ideal for bagels, frostings, and dips. No preservatives.", 240, 195],
  ["Mozzarella Cheese (250g)", "Fresh mild mozzarella that melts beautifully. Pizza-perfect, also great in caprese salads and lasagna.", 380, 290],
  ["Heavy Whipping Cream (500ml)", "35% milk fat, whips perfectly. Use for desserts, sauces, and soups. UHT-treated, long shelf life.", 240, 195],
  ["Cottage Cheese (300g)", "Low-fat cottage cheese with soft curds. Great protein source for breakfast, salads, and smoothies.", 199, 159],
  ["Sour Cream (250g)", "Cultured cream with tangy flavor. Ideal topping for tacos, baked potatoes, and dips.", 199, 159],
  ["Buttermilk (500ml)", "Tangy fermented buttermilk, perfect for baking pancakes, marinating chicken, or drinking chilled.", 90, 70],
  ["Skim Milk (1L)", "Fat-free pasteurized milk. All the nutrition with zero fat. Great for shakes and smoothies.", 70, 55],
  ["Almond Milk Unsweetened (1L)", "Plant-based dairy alternative made from real almonds. No added sugar, fortified with calcium and vitamins.", 220, 175],
  ["Soy Milk (1L)", "Creamy soy milk with high plant protein. Lactose-free, perfect for coffee and cereal.", 199, 159],
  ["Oat Milk Barista (1L)", "Foam-friendly oat milk that froths beautifully in coffee. Smooth, naturally sweet, plant-based.", 240, 195],
  ["Vanilla Yogurt (500g)", "Smooth vanilla-flavored yogurt with real vanilla bean. Live cultures, perfect for breakfast or dessert.", 199, 159],
  ["Strawberry Yogurt (500g)", "Creamy yogurt with real strawberry pieces. Naturally sweetened, kids love it.", 199, 159],
  ["Parmesan Cheese (200g)", "Hard aged Parmesan with deep nutty flavor. Grate over pasta, salads, soups. Vegetarian.", 480, 380],
  ["Feta Cheese (200g)", "Tangy crumbly feta in brine. Perfect for Greek salads, pizzas, and Mediterranean dishes.", 360, 290],
  ["Brie Cheese (200g)", "Soft creamy brie with edible white rind. Delicious on crackers with grapes or honey.", 590, 450],
  ["Gouda Cheese (250g)", "Smooth semi-hard Dutch cheese with mild buttery flavor. Slices well for sandwiches and burgers.", 480, 380],
  ["Ricotta Cheese (300g)", "Light, fresh ricotta with delicate sweetness. Use in lasagna, cheesecake, and stuffed pastas.", 320, 260],
  ["Sweetened Condensed Milk (400g)", "Thick sweet condensed milk in a tin. Essential for desserts, fudge, and Indian sweets.", 130, 105],
  ["Skimmed Milk Powder (500g)", "Spray-dried milk powder. Long shelf life, easy to reconstitute, great for travel and baking.", 320, 260],
  ["Pure Cow's Ghee (500g)", "Traditional clarified butter, slow-cooked from pure cow's milk. Rich aroma, perfect for cooking.", 599, 469],
  ["Fresh Paneer (200g)", "Soft Indian cottage cheese, fresh and unsalted. Perfect for tikka, curries, and grilling.", 110, 89],
  ["Sweet Lassi (500ml)", "Traditional yogurt-based drink, perfectly sweetened, ready to drink. Refreshing and probiotic.", 80, 65],
  ["Chocolate Milkshake (300ml)", "Rich chocolate flavored milk drink. Ready-to-drink, perfect for kids and on-the-go indulgence.", 70, 55],
  ["Cheese Spread Tin (200g)", "Smooth processed cheese spread. Perfect for sandwiches, crackers, and stuffing in vegetables.", 220, 175],
  ["Cheese Slices (10 pcs)", "Individually wrapped processed cheese slices. Melts in burgers and sandwiches. Kid-friendly.", 199, 159],
  ["Fresh Curd / Yogurt (500g)", "Traditional set curd, thick and tangy. Made daily from fresh whole milk. No preservatives.", 99, 79],
];

const TECHNOLOGY = [
  ["Ultra-Slim Laptop 14\"", "Intel Core i5, 16GB RAM, 512GB SSD. 14\" Full HD IPS display, fingerprint reader, 12-hour battery. Aluminium chassis, 1.3kg.", 79999, 54999],
  ["4K UHD Monitor 27\"", "27\" IPS panel, 3840x2160 resolution, 95% DCI-P3 color, USB-C 90W PD, HDMI 2.0. Height adjustable stand.", 49999, 32999],
  ["Wireless Mechanical Keyboard", "75% layout, hot-swappable mechanical switches, RGB backlit. Bluetooth + 2.4GHz + USB-C. 4000mAh battery.", 9999, 5999],
  ["Gaming Laptop 16\"", "AMD Ryzen 7, RTX 4060 8GB, 16GB DDR5, 1TB SSD. 165Hz QHD display, RGB keyboard, advanced cooling.", 159999, 109999],
  ["External SSD 1TB", "USB-C 3.2 Gen 2, 1050 MB/s read/write. Pocket-sized, shock-resistant, AES 256-bit encryption.", 12999, 8499],
  ["RGB Gaming Mouse", "Pixart 3389 sensor, 16000 DPI, 8 programmable buttons. Customizable RGB, lightweight 78g, braided cable.", 4999, 2799],
  ["Gaming Headset 7.1 Surround", "50mm drivers, virtual 7.1 surround sound. Detachable boom mic with noise cancellation. Memory foam earcups.", 6999, 3999],
  ["Curved Ultrawide Monitor 34\"", "34\" 1500R curved VA panel, 3440x1440, 144Hz, FreeSync. HDMI + DP, height/swivel/tilt adjustable.", 79999, 49999],
  ["Mini PC Desktop", "Compact form factor, AMD Ryzen 5, 16GB RAM, 512GB NVMe. Wi-Fi 6, dual HDMI, 4 USB ports. Quiet operation.", 59999, 38999],
  ["Powered USB Hub 7-Port", "7x USB 3.0 ports with individual power switches. 4A power adapter, supports BC 1.2 fast charging.", 2999, 1799],
  ["Aluminium Laptop Stand", "Ergonomic 6-level height adjustable stand. Heat-dissipating aluminium, foldable, holds up to 17\" laptops.", 2499, 1399],
  ["4K Pro Webcam", "Sony 1/2.5\" sensor, 4K 30fps, autofocus, dual stereo mics. Privacy shutter, USB-C, plug-and-play.", 9999, 6499],
  ["Studio USB Microphone", "Cardioid condenser mic with built-in shock mount. 24-bit/96kHz audio, headphone monitor jack, mute button.", 8999, 5499],
  ["Drawing Graphic Tablet", "10x6.3\" active area, 8192 levels of pen pressure, 60° tilt. Battery-free pen, 8 express keys.", 6999, 4499],
  ["Bluetooth Numeric Keypad", "Slim 22-key Bluetooth numpad. Multi-device pairing, rechargeable, perfect for finance and data work.", 2499, 1399],
  ["Surge Protector with USB", "6 sockets + 4 USB-A + 1 USB-C ports. 3000J surge protection, 1.8m cord, indicator lights, child-safe shutters.", 1999, 1199],
  ["Cable Organizer Set", "Magnetic cable management clips, sleeves, and cord winders. Tidy up your desk and TV setup.", 1499, 799],
  ["Extended XL Mouse Pad", "900x400mm desk-sized cloth mat. Smooth surface, anti-slip rubber base, water-resistant. RGB version available.", 1999, 999],
  ["Webcam Ring Light", "10\" LED ring light with adjustable color temperature. Mounts on monitor or tripod, USB-powered, 10 brightness levels.", 2999, 1799],
  ["Thunderbolt 4 Docking Station", "Single-cable connection: 4K dual display, 90W PD, Ethernet, 4x USB. Compatible with MacBook and Windows.", 24999, 16999],
  ["Laptop Cooling Pad", "5-fan adjustable cooling pad with LED. 6 height settings, USB-powered, supports up to 17\" laptops. Ergonomic.", 2999, 1599],
  ["Wireless Presenter Clicker", "Bluetooth + 2.4GHz remote with red laser pointer. 100m range, slide forward/back, blank screen mode.", 1999, 1199],
  ["Adjustable Monitor Arm", "Single-monitor desk-mount arm. Holds 17-32\" monitors up to 9kg. Full motion: tilt, swivel, rotate.", 4999, 2999],
  ["8-Port Gigabit Network Switch", "Plug-and-play 8-port Gigabit Ethernet switch. Metal case, fanless silent operation, low power.", 2499, 1499],
  ["Wi-Fi 6 Router (AX1800)", "Dual-band Wi-Fi 6, 1.8 Gbps. 4 high-gain antennas, MU-MIMO, OFDMA. Mesh-ready, parental controls.", 7999, 4999],
  ["NAS 2-Bay 4TB", "Personal cloud storage with 2x 2TB drives in RAID-1. Stream media, backup files, photos, mobile access.", 39999, 27999],
  ["HDMI Capture Card 4K", "4K60 passthrough, 1080p60 capture via USB 3.0. Plug-and-play for streaming, recording gameplay.", 5999, 3499],
  ["Stream Deck Mini (6 keys)", "6 customizable LCD keys for streaming and productivity. One-tap macros, scene switching, app launches.", 8999, 5999],
  ["18U Server Rack Cabinet", "Wall-mount 18U cabinet with glass door, lock, cooling fans. Mesh sides, cable management. Network/AV equipment.", 24999, 17999],
  ["Smart RGB LED Strip 5m", "5050 RGB LEDs, 5 meters, app-controlled with music sync. Voice control with Alexa/Google. Cuttable.", 2999, 1599],
];

const HOME_APPLIANCES = [
  ["Robot Vacuum Cleaner", "Smart mapping with LIDAR navigation. 2700Pa suction, 4-stage cleaning, mop function, 150-min runtime. App + voice control.", 39999, 24999],
  ["Air Fryer 5L Digital", "Cook with 90% less oil. 8 preset programs, 60-min timer, non-stick basket. Family-size 5L, easy to clean.", 9999, 5999],
  ["Espresso Coffee Machine", "15-bar pump, milk frother for cappuccino/latte. 1.2L water tank, removable drip tray. Café-style at home.", 24999, 15999],
  ["Stand Mixer 5.5L", "1000W tilt-head mixer with 10 speeds. Stainless steel bowl, dough hook, whisk, beater. Vintage design.", 39999, 26999],
  ["Smart Convection Microwave", "32L capacity, 10 power levels, 200+ auto-cook menu. Convection + grill + microwave. Touch panel.", 18999, 12999],
  ["4-Slice Toaster", "Extra-wide slots, 7 browning levels, defrost and bagel functions. Stainless steel finish, removable crumb tray.", 4999, 2999],
  ["Glass Electric Kettle 1.7L", "1500W rapid-boil kettle with cool-touch handle. Auto shutoff, boil-dry protection, blue LED illumination.", 2499, 1499],
  ["High-Speed Blender 1500W", "Crushes ice, makes smoothies, soup, nut butter. 6 stainless blades, 2L jar, variable speed + pulse.", 9999, 5999],
  ["6Qt Slow Cooker", "Programmable digital slow cooker with 4 heat settings. Removable ceramic pot, dishwasher safe.", 5999, 3499],
  ["HEPA Air Purifier", "True HEPA H13 + activated carbon filter. Covers 50sqm, removes 99.97% of allergens, smoke, dust. Quiet sleep mode.", 14999, 8999],
  ["Ultrasonic Humidifier 4L", "Cool-mist whisper-quiet humidifier. 30-hour runtime, 360° nozzle, auto shut-off, optional aroma diffuser.", 3999, 2299],
  ["Compact Dehumidifier 12L", "Removes up to 12L moisture/day. Ideal for 30-50sqm rooms. Auto-stop when full, drain hose included.", 19999, 12999],
  ["Smart Wi-Fi Thermostat", "Learning thermostat with smart scheduling. Energy-saving, app + voice control. Compatible with most HVAC systems.", 19999, 13999],
  ["Tower Fan Bladeless", "30\" tall tower fan with 3 speeds + 3 modes (Normal/Natural/Sleep). 12-hour timer, oscillation, remote.", 8999, 5499],
  ["Ceiling Fan with LED Light", "Modern 3-blade design, integrated LED light, 6-speed remote. Energy-efficient DC motor, reversible airflow.", 7999, 4999],
  ["Vacuum Sealer Machine", "Heat-seal & vacuum-seal in one. Dry/Moist food modes, 5 vacuum levels. Includes 10 bags. Keeps food fresh 5x longer.", 5999, 3499],
  ["Rice Cooker 1.8L (10 cups)", "Multifunctional: rice, porridge, steam, slow cook. Non-stick inner pot, keep-warm function. Includes steaming basket.", 3999, 2299],
  ["Electric Pressure Cooker 6L", "10-in-1 multi-cooker: pressure, slow cook, steam, sauté, yogurt, rice. 13 preset programs. Stainless inner.", 9999, 5999],
  ["Bread Maker Machine", "12 programs including gluten-free. 3 loaf sizes, 3 crust settings, 13-hour delay timer. Non-stick pan.", 11999, 7499],
  ["Hand Mixer with Stand", "5-speed hand mixer with detachable stand. 250W motor, 5 attachments: beater, whisk, dough hooks. Easy storage.", 3999, 2499],
  ["Food Processor 1000W", "12-cup capacity, slicing/shredding/chopping discs, dough blade, citrus juicer attachment. All in one.", 11999, 7499],
  ["Sandwich Maker (4-Slice)", "Cooks 4 sandwiches at once. Non-stick plates, indicator lights, cool-touch handles. Perfect for breakfast.", 3499, 1999],
  ["Belgian Waffle Maker", "Deep-pocket Belgian waffles. Non-stick plates, indicator lights, browning control. Folds for storage.", 4499, 2799],
  ["Cold-Press Slow Juicer", "Masticating juicer extracts max nutrients. 60 RPM, low oxidation, quiet operation. Easy to clean.", 14999, 8999],
  ["Ice Cream Maker 2L", "Compressor-free ice cream maker. Make ice cream, sorbet, frozen yogurt in 30 min. Auto-stop function.", 9999, 5999],
  ["Electric Egg Boiler", "Cook 7 eggs at once. 3 hardness settings, auto shut-off with buzzer. Includes piercing pin.", 1999, 1099],
  ["Handheld Garment Steamer", "1500W rapid heat-up in 25s. 250ml tank, 15-min runtime. Removes wrinkles from clothes, curtains, upholstery.", 3999, 2299],
  ["Cordless Steam Iron", "Cordless freedom with 250ml tank. Variable steam, anti-drip, ceramic soleplate. Auto shut-off.", 4999, 2999],
  ["Ionic Hair Dryer 2200W", "Fast-drying with negative ions for shine and frizz reduction. 3 heat + 2 speed settings, cool shot. Diffuser + concentrator.", 3499, 1999],
  ["Sonic Electric Toothbrush", "62000 vibrations/min, 5 cleaning modes, 2-min smart timer. 30-day battery, USB charging, 4 brush heads included.", 4999, 2799],
];

/* ─────────────────────────  ASSEMBLE & SEED  ───────────────────────── */
function buildDocs(catalog, category, imagePool, sellerId) {
  return catalog.map((row, i) => {
    const [name, description, costPrice, salePrice] = row;
    return {
      sellerId,
      name,
      description,
      costPrice,
      salePrice,
      category,
      stock: 8 + Math.floor(Math.random() * 90),
      image: pickImages(imagePool, i),
      deleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });
}

async function run() {
  const uri = process.env.MONGOOSE_URI;
  if (!uri) {
    console.error("✗ MONGOOSE_URI is not set in .env");
    process.exit(1);
  }

  console.log("→ Connecting to MongoDB...");
  await mongoose.connect(uri);
  console.log("✓ Connected");

  // Find an admin user to use as sellerId
  const admin = await User.findOne({ role: "admin" });
  if (!admin) {
    console.error("✗ No admin user found. Create at least one admin first.");
    process.exit(1);
  }
  console.log(`✓ Using admin: ${admin.email}`);

  // Wipe existing products
  const delResult = await Product.deleteMany({});
  console.log(`✓ Removed ${delResult.deletedCount} existing products`);

  // Build all docs
  const docs = [
    ...buildDocs(ELECTRONICS,      "electronics",      IMAGES.electronics,    admin._id),
    ...buildDocs(FASHION,          "fashion",          IMAGES.fashion,        admin._id),
    ...buildDocs(DAIRY,            "dairy",            IMAGES.dairy,          admin._id),
    ...buildDocs(TECHNOLOGY,       "technology",       IMAGES.technology,     admin._id),
    ...buildDocs(HOME_APPLIANCES,  "home appliances",  IMAGES.homeAppliances, admin._id),
  ];

  // Bypass Mongoose validators (so costPrice can be > salePrice for the strike-through UI)
  const result = await Product.collection.insertMany(docs);
  console.log(`✓ Inserted ${result.insertedCount} products`);

  // Invalidate Redis product cache so new products show up immediately
  try {
    await invalidateProductCache();
    console.log("✓ Product cache invalidated");
  } catch {
    console.log("⚠ Cache invalidation skipped (Redis unavailable)");
  }

  // Print summary
  const counts = await Product.aggregate([
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  console.log("\n📦 Product counts by category:");
  counts.forEach(({ _id, count }) => console.log(`   ${_id.padEnd(20)} ${count}`));

  await mongoose.disconnect();
  console.log("\n✓ Done. Disconnected.");
}

run().catch((err) => {
  console.error("✗ Seed failed:", err);
  process.exit(1);
});
