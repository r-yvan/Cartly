// Fills an empty catalog with demo categories, one demo store and its products.
// Safe to re-run: everything is upserted by slug/email.
//
//   bun run db:seed
//   ADMIN_EMAIL=you@example.com bun run db:seed   # also makes that existing user an admin
//
// The demo seller gets a random password unless SEED_PASSWORD is set.
import { randomBytes } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const img = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;

const CATEGORIES = [
  { slug: "tech", name: "Tech & Audio", description: "Considered electronics for work, music and memories." },
  { slug: "furniture", name: "Furniture", description: "Pieces built to be sat on, leaned on and lived with." },
  { slug: "home", name: "Home", description: "Small things that make a room feel finished." },
  { slug: "wear", name: "Wear", description: "Clothing and footwear that gets better with age." },
  { slug: "accessories", name: "Accessories", description: "The everyday carry, done properly." },
];

// [slug, name, category, price, compareAtPrice, stock, photo id, description]
const PRODUCTS = [
  ["studio-headphones", "Studio Headphones", "tech", 189, 229, 24, "1505740420928-5e560c06d30e", "Closed-back over-ear headphones with deep, even bass and soft memory-foam cushions. Thirty hours of battery and a cable for when it runs out."],
  ["wired-monitor-headphones", "Wired Monitor Headphones", "tech", 79, null, 40, "1583394838336-acd977736f90", "Lightweight on-ear monitors with a flat, honest sound. No battery, no pairing, just plug in and listen."],
  ["instant-camera", "Instant Camera", "tech", 129, 149, 12, "1526170375885-4d8ecf77b99f", "Point, shoot and hold the photo a minute later. Fixed-focus lens, built-in flash and a self-timer for group shots."],
  ["smartwatch-series-s", "Smartwatch Series S", "tech", 249, null, 18, "1546868871-7041f2a55e12", "Heart rate, sleep and workouts on an always-on display, with a soft sport band and a battery that lasts the weekend."],
  ["lounge-armchair", "Lounge Armchair", "furniture", 420, 495, 6, "1586023492125-27b2c045efd7", "A low, deep armchair in mustard wool with slim brass legs. Firm enough to read in, soft enough to fall asleep in."],
  ["velvet-three-seater", "Velvet Three-Seater", "furniture", 1180, null, 3, "1555041469-a586c61ea9bc", "A forest-green velvet sofa on turned oak legs. Feather-wrapped cushions and a frame made from kiln-dried hardwood."],
  ["shell-dining-chair", "Shell Dining Chair", "furniture", 145, null, 30, "1592078615290-033ee584e267", "A moulded shell seat on solid beech legs with a padded cushion. Comfortable through long dinners and easy to wipe clean."],
  ["workshop-stool", "Workshop Stool", "furniture", 95, 120, 14, "1503602642458-232111445657", "A simple four-legged stool in whitewashed pine. Works at a counter, beside a bed or as a plant stand."],
  ["task-floor-lamp", "Task Floor Lamp", "home", 139, null, 20, "1507473885765-e6ed057f782c", "A steel floor lamp with an adjustable shade that puts light exactly where you need it. Matte graphite finish."],
  ["potted-succulent", "Potted Succulent", "home", 24, null, 60, "1485955900006-10f4d324d411", "A hardy haworthia in a glazed mint pot. Water it twice a month and it will forgive you for the rest."],
  ["insulated-bottle", "Insulated Bottle", "home", 32, 38, 80, "1602143407151-7111542de6e8", "Double-walled steel keeps drinks cold for a day or hot through the morning. Powder-coated so it doesn't sweat or slip."],
  ["leather-biker-jacket", "Leather Biker Jacket", "wear", 365, 430, 9, "1551028719-00167b16eac5", "Full-grain leather with an asymmetric zip and quilted lining. Stiff for the first week, yours for the next twenty years."],
  ["heavyweight-tee", "Heavyweight Tee", "wear", 38, null, 120, "1618354691373-d851c5c3a990", "A boxy black tee in 240gsm organic cotton with a small chest print. Pre-washed, so it stays the size you bought."],
  ["knit-runner", "Knit Runner", "wear", 119, 140, 35, "1491553895911-0055eca6402d", "A featherweight running shoe with a breathable knit upper and a responsive foam sole. True to size."],
  ["suede-derby", "Suede Derby", "wear", 175, null, 16, "1560343090-f0409e92791a", "Hand-finished derby shoes in teal suede with a natural leather sole. Dressed up or down, they do the talking."],
  ["minimal-watch", "Minimal Watch", "accessories", 159, 189, 22, "1523275335684-37898b6baf30", "A clean white dial on a soft silicone strap. Quartz movement, sapphire-coated glass and water resistance to 50 metres."],
  ["classic-sunglasses", "Classic Sunglasses", "accessories", 89, null, 45, "1572635196237-14b3f281503f", "Timeless black acetate frames with polarised lenses and full UV protection. Comes with a hard case."],
  ["day-backpack", "Day Backpack", "accessories", 110, 135, 28, "1553062407-98eeb64c6a62", "A water-resistant navy backpack with a padded sleeve for a 16-inch laptop and a pocket for everything else."],
];

async function main() {
  const password = process.env.SEED_PASSWORD ?? randomBytes(9).toString("base64url");
  const sellerEmail = "store@cartly.demo";

  const existingSeller = await prisma.user.findUnique({ where: { email: sellerEmail } });
  const seller =
    existingSeller ??
    (await prisma.user.create({
      data: {
        email: sellerEmail,
        name: "Northside Goods",
        role: "SELLER",
        password: await bcrypt.hash(password, 10),
        emailVerified: new Date(),
      },
    }));

  await prisma.store.upsert({
    where: { userId: seller.id },
    update: {},
    create: {
      userId: seller.id,
      name: "Northside Goods",
      slug: "northside-goods",
      description: "A small shop of well-made everyday objects.",
      email: sellerEmail,
    },
  });

  const categoryIds = {};
  for (const category of CATEGORIES) {
    const saved = await prisma.category.upsert({ where: { slug: category.slug }, update: category, create: category });
    categoryIds[category.slug] = saved.id;
  }

  let created = 0;
  // Oldest first so the first products in the list appear as the newest arrivals.
  for (const [slug, name, category, price, compareAtPrice, quantity, photo, description] of [...PRODUCTS].reverse()) {
    if (await prisma.product.findUnique({ where: { slug } })) continue;
    await prisma.product.create({
      data: {
        slug,
        name,
        description,
        price,
        compareAtPrice,
        quantity,
        status: "ACTIVE",
        categoryId: categoryIds[category],
        sellerId: seller.id,
        images: { create: [{ url: img(photo), altText: name }] },
      },
    });
    created++;
  }

  console.log(`Seeded ${CATEGORIES.length} categories and ${created} new products.`);
  if (!existingSeller) console.log(`Demo seller: ${sellerEmail} / ${password}`);

  if (process.env.ADMIN_EMAIL) {
    const email = process.env.ADMIN_EMAIL.trim().toLowerCase();
    const { count } = await prisma.user.updateMany({ where: { email }, data: { role: "ADMIN" } });
    console.log(count ? `${email} is now an admin.` : `No user with email ${email} yet. Sign up first, then re-run.`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
