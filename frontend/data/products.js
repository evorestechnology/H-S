/**
 * @BACKEND_TEAM - INTEGRATION INSTRUCTIONS:
 * This file currently serves as a mock database for the MVP.
 * 
 * To switch to a real-time production backend:
 * 1. Remove this file entirely or keep it for fallback testing.
 * 2. In `src/pages/Home.jsx`, `CategoryPage.jsx`, and `ProductDetailPage.jsx`:
 *    - Replace `import { products } from '../data/products';` with your API fetch logic.
 *    - Example: `const { data: products } = useQuery('products', fetchProducts);`
 * 3. The API should return an array of objects matching this exact schema:
 *    {
 *      id: String,
 *      name: String,
 *      category: String (tshirts, hoodies, sweatpants, shorts, sweatshirts),
 *      price: Number,
 *      images: Array<String> (URLs),
 *      description: String,
 *      fit: String,
 *      sizes: Array<String>,
 *      colors: Array<String>,
 *      isNew: Boolean,
 *      isBestSeller: Boolean
 *    }
 */
export const products = [
  // --- T-SHIRTS (10 Items) ---
  {
    id: "ts-1", name: "Boxy Graphic Tee // Vol 1", category: "tshirts", price: 45.00,
    images: [
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop"
    ],
    description: "Vintage wash boxy fit t-shirt with signature high-density H&S print.", fit: "Oversized", sizes: ["S", "M", "L"], colors: ["Washed Black", "Off-White"], isNew: false, isBestSeller: true,
  },
  {
    id: "ts-2", name: "Essential Heavyweight Blank Tee", category: "tshirts", price: 35.00,
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop"
    ],
    description: "280gsm thick cotton blank tee. The perfect drop shoulder silhouette.", fit: "Oversized", sizes: ["S", "M", "L", "XL"], colors: ["Black", "White"], isNew: false, isBestSeller: true,
  },
  {
    id: "ts-3", name: "Distressed Logo Tee", category: "tshirts", price: 50.00,
    images: [
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop"
    ],
    description: "Subtle distressing on the hem and collar with a faded puff print logo.", fit: "Regular", sizes: ["M", "L", "XL"], colors: ["Vintage Black"], isNew: true, isBestSeller: false,
  },
  {
    id: "ts-4", name: "Cropped Baby Tee", category: "tshirts", price: 40.00,
    images: [
      "https://images.unsplash.com/photo-1554568218-0f1715e72254?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop"
    ],
    description: "A tight, cropped fit for the perfect Y2K streetwear look.", fit: "Slim", sizes: ["S", "M"], colors: ["White"], isNew: true, isBestSeller: true,
  },
  {
    id: "ts-5", name: "Acid Wash oversized Tee", category: "tshirts", price: 48.00,
    images: [
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop"
    ],
    description: "Hand-treated acid wash finish, meaning no two shirts are exactly alike.", fit: "Oversized", sizes: ["S", "M", "L", "XL"], colors: ["Acid Grey"], isNew: false, isBestSeller: false,
  },
  {
    id: "ts-6", name: "Minimalist Typo Tee", category: "tshirts", price: 42.00,
    images: [
      "https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop"
    ],
    description: "Clean typography on the chest. 100% organic cotton.", fit: "Regular", sizes: ["S", "M", "L", "XL"], colors: ["White", "Black"], isNew: false, isBestSeller: false,
  },
  {
    id: "ts-7", name: "Longline Layering Tee", category: "tshirts", price: 38.00,
    images: [
      "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop"
    ],
    description: "Extended curved hem designed specifically to peek out under hoodies.", fit: "Slim", sizes: ["M", "L", "XL"], colors: ["White"], isNew: false, isBestSeller: false,
  },
  {
    id: "ts-8", name: "Reversible Inside-Out Tee", category: "tshirts", price: 55.00,
    images: [
      "https://images.unsplash.com/photo-1564859228273-274232fdb516?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop"
    ],
    description: "Exposed seams and reversible design for dual styling options.", fit: "Oversized", sizes: ["S", "M", "L"], colors: ["Black/Grey"], isNew: true, isBestSeller: false,
  },
  {
    id: "ts-9", name: "Mock Neck Short Sleeve", category: "tshirts", price: 45.00,
    images: [
      "https://images.unsplash.com/photo-1505022610485-0249ba5b3675?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop"
    ],
    description: "Elevated mock neck collar in a heavy jersey fabric.", fit: "Regular", sizes: ["S", "M", "L", "XL"], colors: ["Black"], isNew: true, isBestSeller: false,
  },
  {
    id: "ts-10", name: "Waffle Knit Tee", category: "tshirts", price: 52.00,
    images: [
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop"
    ],
    description: "Textured waffle knit fabric providing warmth and unique drape.", fit: "Oversized", sizes: ["M", "L", "XL"], colors: ["Off-White"], isNew: false, isBestSeller: true,
  },

  // --- HOODIES (10 Items) ---
  {
    id: "hd-1", name: "Oversized Heavyweight Hoodie", category: "hoodies", price: 85.00,
    images: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop"
    ],
    description: "Ultra-premium 450gsm cotton. Dropped shoulders. The essential streetwear hoodie.", fit: "Oversized", sizes: ["S", "M", "L", "XL"], colors: ["Black", "Heather Grey", "White"], isNew: true, isBestSeller: true,
  },
  {
    id: "hd-2", name: "Faded Zip-Up Hoodie", category: "hoodies", price: 95.00,
    images: [
      "https://images.unsplash.com/photo-1614676471928-2ed0ad1061a4?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop"
    ],
    description: "Vintage wash zip-up with a chunky two-way silver zipper.", fit: "Regular", sizes: ["S", "M", "L", "XL"], colors: ["Washed Black"], isNew: false, isBestSeller: true,
  },
  {
    id: "hd-3", name: "Cropped Raw Hem Hoodie", category: "hoodies", price: 75.00,
    images: [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop"
    ],
    description: "Boxy, cropped fit with a raw cut hem that naturally rolls over time.", fit: "Oversized", sizes: ["S", "M", "L"], colors: ["Grey Marl"], isNew: true, isBestSeller: false,
  },
  {
    id: "hd-4", name: "Tech-Fleece Pullover", category: "hoodies", price: 110.00,
    images: [
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop"
    ],
    description: "Modern tech fabric blending warmth with structural rigidity.", fit: "Slim", sizes: ["M", "L", "XL"], colors: ["Jet Black"], isNew: false, isBestSeller: false,
  },
  {
    id: "hd-5", name: "Graphic Patchwork Hoodie", category: "hoodies", price: 120.00,
    images: [
      "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop"
    ],
    description: "Deconstructed patchwork panels with embroidered H&S detailing.", fit: "Oversized", sizes: ["M", "L", "XL"], colors: ["Multi-Black"], isNew: true, isBestSeller: true,
  },
  {
    id: "hd-6", name: "Double-Layered Hoodie", category: "hoodies", price: 135.00,
    images: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop"
    ],
    description: "Two hoodies sewn into one. Incredibly heavy, built for the deep winter.", fit: "Oversized", sizes: ["L", "XL"], colors: ["Black/Grey"], isNew: false, isBestSeller: false,
  },
  {
    id: "hd-7", name: "Sleeveless Boxy Hoodie", category: "hoodies", price: 65.00,
    images: [
      "https://images.unsplash.com/photo-1512413914421-4f1b45281ea8?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop"
    ],
    description: "Raw cut armholes on a heavy terry fleece base. Perfect for layering.", fit: "Regular", sizes: ["S", "M", "L"], colors: ["Black"], isNew: false, isBestSeller: false,
  },
  {
    id: "hd-8", name: "French Terry Lightweight Hoodie", category: "hoodies", price: 70.00,
    images: [
      "https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop"
    ],
    description: "A lighter alternative for spring/summer evenings. Loopback interior.", fit: "Slim", sizes: ["S", "M", "L", "XL"], colors: ["White"], isNew: true, isBestSeller: false,
  },
  {
    id: "hd-9", name: "Balaclava Mask Hoodie", category: "hoodies", price: 105.00,
    images: [
      "https://images.unsplash.com/photo-1614676471928-2ed0ad1061a4?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop"
    ],
    description: "Features a built-in ninja-style face covering in the hood.", fit: "Regular", sizes: ["M", "L", "XL"], colors: ["Black"], isNew: true, isBestSeller: true,
  },
  {
    id: "hd-10", name: "Contrast Stitch Hoodie", category: "hoodies", price: 90.00,
    images: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop"
    ],
    description: "Heavy black fleece with stark white contrast overlock stitching.", fit: "Oversized", sizes: ["S", "M", "L", "XL"], colors: ["Black/White"], isNew: false, isBestSeller: false,
  },

  // --- SWEATPANTS (10 Items) ---
  {
    id: "sp-1", name: "Signature Heavy Sweatpants", category: "sweatpants", price: 75.00,
    images: [
      "https://images.unsplash.com/photo-1616781296061-6831d102e3b2?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop"
    ],
    description: "Tapered heavyweight sweatpants for everyday comfort. Match with the heavyweight hoodie.", fit: "Slim", sizes: ["S", "M", "L"], colors: ["Black", "Heather Grey"], isNew: false, isBestSeller: true,
  },
  {
    id: "sp-2", name: "Baggy Parachute Pants", category: "sweatpants", price: 85.00,
    images: [
      "https://images.unsplash.com/photo-1584865288642-42078afe6942?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop"
    ],
    description: "Nylon-blend oversized parachute pants with adjustable toggle cuffs.", fit: "Oversized", sizes: ["S", "M", "L", "XL"], colors: ["Black"], isNew: true, isBestSeller: true,
  },
  {
    id: "sp-3", name: "Flared Sweatpants", category: "sweatpants", price: 80.00,
    images: [
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop"
    ],
    description: "Fitted through the thigh and flared at the ankle. A modern Y2K staple.", fit: "Slim", sizes: ["S", "M", "L"], colors: ["Black"], isNew: true, isBestSeller: false,
  },
  {
    id: "sp-4", name: "Cargo Sweatpants", category: "sweatpants", price: 95.00,
    images: [
      "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop"
    ],
    description: "Fleece sweats featuring dual 3D cargo pockets and a relaxed straight leg.", fit: "Regular", sizes: ["M", "L", "XL"], colors: ["Washed Black"], isNew: false, isBestSeller: true,
  },
  {
    id: "sp-5", name: "Straight Leg Lounge Pants", category: "sweatpants", price: 70.00,
    images: [
      "https://images.unsplash.com/photo-1616781296061-6831d102e3b2?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop"
    ],
    description: "Minimalist straight leg cut with no elastic at the hem so it stacks perfectly over sneakers.", fit: "Regular", sizes: ["S", "M", "L", "XL"], colors: ["Heather Grey"], isNew: false, isBestSeller: false,
  },
  {
    id: "sp-6", name: "Distressed Knee Sweats", category: "sweatpants", price: 85.00,
    images: [
      "https://images.unsplash.com/photo-1584865288642-42078afe6942?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop"
    ],
    description: "Heavy distressing and blown-out knees for a grunge aesthetic.", fit: "Oversized", sizes: ["M", "L", "XL"], colors: ["Vintage Black"], isNew: true, isBestSeller: false,
  },
  {
    id: "sp-7", name: "Tech-Fleece Joggers", category: "sweatpants", price: 105.00,
    images: [
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop"
    ],
    description: "Tapered tech fabric joggers with waterproof zippers.", fit: "Slim", sizes: ["S", "M", "L", "XL"], colors: ["Jet Black"], isNew: false, isBestSeller: false,
  },
  {
    id: "sp-8", name: "Acid Wash Joggers", category: "sweatpants", price: 85.00,
    images: [
      "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop"
    ],
    description: "Unique acid wash treatment. Matches the acid wash oversized tee.", fit: "Regular", sizes: ["S", "M", "L"], colors: ["Acid Grey"], isNew: false, isBestSeller: false,
  },
  {
    id: "sp-9", name: "Terry Cloth Beach Pants", category: "sweatpants", price: 65.00,
    images: [
      "https://images.unsplash.com/photo-1616781296061-6831d102e3b2?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop"
    ],
    description: "Ultra-breathable terry cloth fabric, cut loose for summer evenings.", fit: "Oversized", sizes: ["S", "M", "L", "XL"], colors: ["White"], isNew: true, isBestSeller: false,
  },
  {
    id: "sp-10", name: "Reversible Sweatpants", category: "sweatpants", price: 95.00,
    images: [
      "https://images.unsplash.com/photo-1584865288642-42078afe6942?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop"
    ],
    description: "Fleece on one side, looped terry with exposed seams on the other.", fit: "Regular", sizes: ["M", "L", "XL"], colors: ["Black"], isNew: true, isBestSeller: true,
  },

  // --- SHORTS (10 Items) ---
  {
    id: "sh-1", name: "Utility Cargo Shorts", category: "shorts", price: 65.00,
    images: [
      "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop"
    ],
    description: "Relaxed fit cargo shorts with multi-pocket detailing and adjustable waist.", fit: "Regular", sizes: ["S", "M", "L", "XL"], colors: ["Black", "Olive"], isNew: true, isBestSeller: false,
  },
  {
    id: "sh-2", name: "Mesh Basketball Shorts", category: "shorts", price: 45.00,
    images: [
      "https://images.unsplash.com/photo-1533654499145-2c8c3e80ebbe?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop"
    ],
    description: "Heavyweight double-layer mesh with a 5-inch inseam. Above-the-knee fit.", fit: "Regular", sizes: ["S", "M", "L", "XL"], colors: ["Black", "White"], isNew: true, isBestSeller: true,
  },
  {
    id: "sh-3", name: "Raw Hem Sweat Shorts", category: "shorts", price: 50.00,
    images: [
      "https://images.unsplash.com/photo-1616781296061-6831d102e3b2?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop"
    ],
    description: "Cut from our 450gsm hoodie fabric. Raw edges and long drawstrings.", fit: "Oversized", sizes: ["S", "M", "L"], colors: ["Heather Grey"], isNew: false, isBestSeller: true,
  },
  {
    id: "sh-4", name: "Nylon Track Shorts", category: "shorts", price: 55.00,
    images: [
      "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop"
    ],
    description: "Water-repellent crinkle nylon with zip pockets.", fit: "Slim", sizes: ["M", "L", "XL"], colors: ["Black"], isNew: false, isBestSeller: false,
  },
  {
    id: "sh-5", name: "Denim Jorts", category: "shorts", price: 85.00,
    images: [
      "https://images.unsplash.com/photo-1533654499145-2c8c3e80ebbe?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop"
    ],
    description: "Extreme oversized baggy denim shorts that hit below the knee. Y2K skater style.", fit: "Oversized", sizes: ["S", "M", "L", "XL"], colors: ["Washed Black"], isNew: true, isBestSeller: true,
  },
  {
    id: "sh-6", name: "Carpenter Shorts", category: "shorts", price: 75.00,
    images: [
      "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop"
    ],
    description: "Heavy canvas cotton shorts with a hammer loop and utility pockets.", fit: "Regular", sizes: ["M", "L", "XL"], colors: ["Black"], isNew: true, isBestSeller: false,
  },
  {
    id: "sh-7", name: "Terry Towel Shorts", category: "shorts", price: 45.00,
    images: [
      "https://images.unsplash.com/photo-1616781296061-6831d102e3b2?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop"
    ],
    description: "Plush towel fabric with an elastic waist. Vacation essential.", fit: "Slim", sizes: ["S", "M", "L"], colors: ["White"], isNew: false, isBestSeller: false,
  },
  {
    id: "sh-8", name: "Double Knee Work Shorts", category: "shorts", price: 80.00,
    images: [
      "https://images.unsplash.com/photo-1533654499145-2c8c3e80ebbe?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop"
    ],
    description: "Reinforced front panels and heavy rivets. Built to last forever.", fit: "Regular", sizes: ["S", "M", "L", "XL"], colors: ["Washed Black"], isNew: false, isBestSeller: false,
  },
  {
    id: "sh-9", name: "Ribbed Biker Shorts", category: "shorts", price: 35.00,
    images: [
      "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop"
    ],
    description: "Form-fitting seamless ribbed shorts. Unisex styling.", fit: "Slim", sizes: ["S", "M"], colors: ["Black"], isNew: true, isBestSeller: false,
  },
  {
    id: "sh-10", name: "Faded Acid Wash Shorts", category: "shorts", price: 55.00,
    images: [
      "https://images.unsplash.com/photo-1616781296061-6831d102e3b2?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop"
    ],
    description: "Matching shorts for the acid wash collection. Soft terry interior.", fit: "Oversized", sizes: ["S", "M", "L", "XL"], colors: ["Acid Grey"], isNew: false, isBestSeller: false,
  },

  // --- SWEATSHIRTS (10 Items) ---
  {
    id: "sw-1", name: "Minimalist Zip-Up Sweatshirt", category: "sweatshirts", price: 90.00,
    images: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop"
    ],
    description: "Clean lines, hidden zipper, supreme comfort. The ultimate layering piece.", fit: "Regular", sizes: ["M", "L", "XL"], colors: ["Black"], isNew: false, isBestSeller: false,
  },
  {
    id: "sw-2", name: "Oversized Crewneck", category: "sweatshirts", price: 75.00,
    images: [
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop"
    ],
    description: "Classic drop-shoulder crewneck without a hood. Perfect drape.", fit: "Oversized", sizes: ["S", "M", "L", "XL"], colors: ["Heather Grey", "Black"], isNew: true, isBestSeller: true,
  },
  {
    id: "sw-3", name: "Vintage Wash Sweatshirt", category: "sweatshirts", price: 85.00,
    images: [
      "https://images.unsplash.com/photo-1614676471928-2ed0ad1061a4?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop"
    ],
    description: "Heavily washed for a faded look and soft hand-feel from day one.", fit: "Regular", sizes: ["S", "M", "L", "XL"], colors: ["Faded Black"], isNew: false, isBestSeller: true,
  },
  {
    id: "sw-4", name: "Knit Mock-Neck Sweater", category: "sweatshirts", price: 110.00,
    images: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop"
    ],
    description: "Chunky knit cotton sweater with an elevated mock-neck design.", fit: "Oversized", sizes: ["M", "L", "XL"], colors: ["Off-White"], isNew: true, isBestSeller: false,
  },
  {
    id: "sw-5", name: "Cropped Crewneck", category: "sweatshirts", price: 65.00,
    images: [
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop"
    ],
    description: "Boxy and cropped to hit right at the waistline.", fit: "Slim", sizes: ["S", "M", "L"], colors: ["Black"], isNew: true, isBestSeller: false,
  },
  {
    id: "sw-6", name: "Distressed Grunge Sweatshirt", category: "sweatshirts", price: 95.00,
    images: [
      "https://images.unsplash.com/photo-1614676471928-2ed0ad1061a4?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop"
    ],
    description: "Intentional holes, frayed cuffs, and collar distressing.", fit: "Oversized", sizes: ["S", "M", "L", "XL"], colors: ["Black"], isNew: false, isBestSeller: true,
  },
  {
    id: "sw-7", name: "Half-Zip Pullover", category: "sweatshirts", price: 88.00,
    images: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop"
    ],
    description: "Y2K inspired half-zip collar with custom metal hardware.", fit: "Regular", sizes: ["M", "L", "XL"], colors: ["Grey"], isNew: true, isBestSeller: false,
  },
  {
    id: "sw-8", name: "Inside-Out Crewneck", category: "sweatshirts", price: 80.00,
    images: [
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop"
    ],
    description: "Exposed overlock seams give an industrial aesthetic.", fit: "Oversized", sizes: ["S", "M", "L", "XL"], colors: ["Washed Black"], isNew: false, isBestSeller: false,
  },
  {
    id: "sw-9", name: "Fleece Lined Sweater", category: "sweatshirts", price: 100.00,
    images: [
      "https://images.unsplash.com/photo-1614676471928-2ed0ad1061a4?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop"
    ],
    description: "The warmest piece we make. Ultra-thick fleece lining.", fit: "Regular", sizes: ["L", "XL"], colors: ["Black"], isNew: true, isBestSeller: true,
  },
  {
    id: "sw-10", name: "Graphic Logo Crew", category: "sweatshirts", price: 75.00,
    images: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop"
    ],
    description: "Bold H&S logo across the back in cracked vintage plastisol ink.", fit: "Oversized", sizes: ["S", "M", "L", "XL"], colors: ["White"], isNew: false, isBestSeller: false,
  }
];
