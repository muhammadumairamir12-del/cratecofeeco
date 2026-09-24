// ---------------------------------------------------------------
// Sample catalogue — used to seed Firestore on first run, and as an
// offline fallback if Firestore can't be reached.
// ---------------------------------------------------------------
const SAMPLE_PRODUCTS = [
  { name: "House Espresso", category: "Coffee", price: 3.25, icon: "cup", imageUrl: "images/espresso.jpg", desc: "A short, sweet shot of our house blend.", inStock: true },
  { name: "Americano", category: "Coffee", price: 3.75, icon: "cup", imageUrl: "images/americano.jpg", desc: "Espresso lengthened with hot water.", inStock: true },
  { name: "Cappuccino", category: "Coffee", price: 4.50, icon: "cup", imageUrl: "images/cappuccino.jpg", desc: "Equal parts espresso, milk, and foam.", inStock: true },
  { name: "Cortado", category: "Coffee", price: 4.25, icon: "cup", imageUrl: "images/latte.jpg", desc: "Espresso cut with a little warm milk.", inStock: true },
  { name: "Coffee Flight", category: "Coffee", price: 12.00, icon: "cup", imageUrl: "images/pourover.jpg", desc: "Eight small cups, from black to milky, to taste the bar.", inStock: true },
  { name: "Iced Latte", category: "Coffee", price: 5.25, icon: "cup", imageUrl: "images/iced.jpg", desc: "Espresso poured over ice and cold milk.", inStock: true },
  { name: "Iced Mocha", category: "Coffee", price: 5.50, icon: "cup", imageUrl: "images/mocha.jpg", desc: "Chocolate, espresso, and milk over ice.", inStock: true },
  { name: "Cold Brew", category: "Coffee", price: 4.75, icon: "cup", imageUrl: "images/coldbrew.jpg", desc: "Overnight brew over ice, with a splash of milk.", inStock: true },
  { name: "Butter Croissant", category: "Bakery", price: 3.95, icon: "pastry", imageUrl: "images/croissant.jpg", desc: "Laminated butter dough, baked this morning.", inStock: true },
  { name: "Pain au Chocolat", category: "Bakery", price: 4.50, icon: "pastry", imageUrl: "images/pain.jpg", desc: "Dark chocolate batons in a flaky pastry.", inStock: true },
  { name: "Cinnamon Roll", category: "Bakery", price: 4.75, icon: "pastry", imageUrl: "images/cinnamon.jpg", desc: "Brown-butter swirl and cream-cheese icing.", inStock: false },
  { name: "Chocolate Chip Cookie", category: "Bakery", price: 2.75, icon: "cookie", imageUrl: "images/cookie.jpg", desc: "Crisp edge, chewy centre, sea salt.", inStock: true },
  { name: "Sea Salt Brownie", category: "Bakery", price: 3.50, icon: "cookie", imageUrl: "images/brownie.jpg", desc: "Dense chocolate square with a salt finish.", inStock: true },
  { name: "Pastry Basket", category: "Bakery", price: 14.00, icon: "pastry", imageUrl: "images/syrup.jpg", desc: "A share of croissants and a coffee for the table.", inStock: true },
  { name: "Chocolate Drip Cake", category: "Cakes", price: 34.00, icon: "cake", imageUrl: "images/cake.jpg", desc: "Whole chocolate cake, enough for the table.", inStock: true },
  { name: "Black Forest Cake", category: "Cakes", price: 36.00, icon: "cake2", imageUrl: "images/banana.jpg", desc: "Chocolate layers, cherries, and cream.", inStock: true },
  { name: "House Blend Beans", category: "To take home", price: 16.00, icon: "bottle", imageUrl: "images/beans.jpg", desc: "250g of our Loughton house espresso blend.", inStock: true }
];

const LEGACY_PRODUCT_NAMES = new Set([
  "Dark Chocolate Fudge Cake", "Zesty Lemon Drizzle Cake", "Spiced Carrot Cake",
  "Double Chocolate Cookie", "Oat & Honey Cookie", "Classic Chocolate Chip",
  "Vanilla Bean Syrup", "Salted Caramel Syrup", "Hazelnut Syrup"
]);

const DEFAULT_SETTINGS = {
  address: "42 High Road, Loughton, IG10 1AB",
  phone: "020 7946 0991",
  whatsapp: "020 7946 0991",
  email: "hello@cratecoffee.co",
  instagram: "https://www.instagram.com/cratecoffeeco",
  tiktok: "https://www.tiktok.com/@cratecoffeeco",
  mapEmbed: "https://www.google.com/maps?q=42+High+Road+Loughton&output=embed",
  hours: [
    { day: "Monday – Friday", time: "7:00 AM – 6:00 PM" },
    { day: "Saturday", time: "8:00 AM – 5:00 PM" },
    { day: "Sunday", time: "9:00 AM – 4:00 PM" }
  ],
  places: [
    { name: "Loughton Station", note: "Central line · about a 4 minute walk" },
    { name: "Epping Forest", note: "A short walk north of High Road" },
    { name: "Debden", note: "One stop toward London" },
    { name: "Theydon Bois", note: "The next stop toward Epping" },
    { name: "High Road", note: "Shops along the parade outside the door" }
  ],
  aboutText: "Crate Coffee Co pours on High Road in Loughton. We started with three wooden crates and a borrowed espresso machine, and we still pull every shot in the shop — then bake the croissants, cookies, and cakes that sit beside the cups."
};

function formatPrice(v){
  const n = Number(v);
  const amount = Number.isFinite(n) ? n : 0;
  return '$' + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ---------------------------------------------------------------
// Firestore helpers — every function has a safe local fallback so the
// demo still renders if Firestore is empty, offline, or rules block reads.
// ---------------------------------------------------------------
function withTimeout(promise, ms){
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))
  ]);
}

async function fetchProducts(){
  try{
    const snap = await withTimeout(db.collection(COLLECTIONS.products).orderBy('category').get(), 4000);
    if (snap.empty) return SAMPLE_PRODUCTS.map((p, i) => ({ id: 'sample-' + i, ...p }));
    const live = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    const legacyHits = live.filter(p => LEGACY_PRODUCT_NAMES.has(p.name) && !p.imageUrl).length;
    if (legacyHits >= 3) return SAMPLE_PRODUCTS.map((p, i) => ({ id: 'sample-' + i, ...p }));
    return live;
  }catch(e){
    console.warn('Falling back to sample products:', e.message);
    return SAMPLE_PRODUCTS.map((p, i) => ({ id: 'sample-' + i, ...p }));
  }
}

async function fetchSettings(){
  try{
    const doc = await db.collection(COLLECTIONS.settings).doc('general').get();
    if (doc.exists) {
      const saved = doc.data();
      const address = saved.address || '';
      if (/islamabad|f-7 markaz/i.test(address)) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...saved, places: saved.places || DEFAULT_SETTINGS.places };
    }
    return DEFAULT_SETTINGS;
  }catch(e){
    console.warn('Falling back to default settings:', e.message);
    return DEFAULT_SETTINGS;
  }
}

async function seedDemoData(){
  const batch = db.batch();
  SAMPLE_PRODUCTS.forEach(p => {
    const ref = db.collection(COLLECTIONS.products).doc();
    batch.set(ref, p);
  });
  const settingsRef = db.collection(COLLECTIONS.settings).doc('general');
  batch.set(settingsRef, DEFAULT_SETTINGS);
  await batch.commit();
}

async function placeOrder(order){
  const ref = await db.collection(COLLECTIONS.orders).add({
    ...order,
    status: 'Received',
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  return ref.id;
}
