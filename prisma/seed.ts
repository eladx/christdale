import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = ["Rings", "Bars", "Parallettes", "Grip", "Bands"];

const products: {
  name: string;
  slug: string;
  category: string;
  price: number;
  stockCount: number;
  description: string;
  imageUrl: string;
  images?: string[];
}[] = [
  {
    name: "Wooden Gymnastic Rings",
    slug: "wooden-gymnastic-rings",
    category: "Rings",
    price: 1490,
    stockCount: 12,
    description:
      "Beechwood rings with adjustable numbered straps. Built for dips, muscle-ups, and support holds.",
    imageUrl:
      "https://images.unsplash.com/photo-1517344368193-41552b6ad3f5?q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1517344368193-41552b6ad3f5?q=80&w=800",
      "https://images.unsplash.com/photo-1598289431512-b97b0917affc?q=80&w=800",
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800",
    ],
  },
  {
    name: "Doorway Pull-Up Bar",
    slug: "doorway-pull-up-bar",
    category: "Bars",
    price: 990,
    stockCount: 20,
    description:
      "No-screw doorway bar rated to 100kg. Multi-grip design for wide, narrow, and neutral pulls.",
    imageUrl:
      "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80&w=800",
  },
  {
    name: "Aluminum Parallettes (Pair)",
    slug: "aluminum-parallettes",
    category: "Parallettes",
    price: 1290,
    stockCount: 8,
    description:
      "Low-profile parallettes for L-sits, planche progressions, and handstand work.",
    imageUrl:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800",
      "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80&w=800",
    ],
  },
  {
    name: "Liquid Chalk 100ml",
    slug: "liquid-chalk",
    category: "Grip",
    price: 350,
    stockCount: 40,
    description:
      "Long-lasting grip for bar and ring work. No cloud, no mess, no chalk tray needed.",
    imageUrl:
      "https://images.unsplash.com/photo-1517832606299-7ae9b720a186?q=80&w=800",
  },
  {
    name: "Resistance Band Set",
    slug: "resistance-band-set",
    category: "Bands",
    price: 890,
    stockCount: 0,
    description:
      "Five-band set for assisted pull-ups, mobility work, and progressive overload without weights.",
    imageUrl:
      "https://images.unsplash.com/photo-1598289431512-b97b0917affc?q=80&w=800",
  },
  {
    name: "Steel Pull-Up Bar Station",
    slug: "steel-pull-up-station",
    category: "Bars",
    price: 4990,
    stockCount: 5,
    description:
      "Freestanding station for pull-ups, dips, and knee raises. Powder-coated steel frame.",
    imageUrl:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800",
      "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80&w=800",
      "https://images.unsplash.com/photo-1517344368193-41552b6ad3f5?q=80&w=800",
    ],
  },
];

const coaches = [
  {
    name: "Dale Esteban",
    specialty: "Calisthenics Fundamentals & Skill Progressions",
    bio: "Coaches beginners through their first pull-up and intermediate athletes toward muscle-ups, handstands, and levers. Programming built around consistency over intensity.",
    imageUrl:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800",
  },
  {
    name: "Coach Placeholder",
    specialty: "Mobility & Injury Prevention",
    bio: "Focuses on joint prep and mobility work so training stays sustainable long-term. Add a real bio and photo before launch.",
    imageUrl:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800",
  },
];

async function main() {
  console.log("Seeding categories…");
  const categoryRecords = await Promise.all(
    categories.map((name) =>
      prisma.category.upsert({
        where: { slug: name.toLowerCase() },
        update: {},
        create: { name, slug: name.toLowerCase() },
      })
    )
  );
  const categoryBySlug = Object.fromEntries(
    categoryRecords.map((c) => [c.name, c.id])
  );

  console.log("Seeding products…");
  for (const p of products) {
    const data = {
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.price,
      imageUrl: p.imageUrl,
      images: p.images ?? [],
      stockCount: p.stockCount,
      categoryId: categoryBySlug[p.category],
    };
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: data,
      create: data,
    });
  }

  console.log("Seeding coaches…");
  for (const c of coaches) {
    const existing = await prisma.coach.findFirst({
      where: { name: c.name },
    });
    if (!existing) {
      await prisma.coach.create({ data: c });
    }
  }

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });