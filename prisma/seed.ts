import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed...");

  // Limpar dados existentes
  await prisma.orderTimeline.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customUpload.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.promotionRule.deleteMany();
  await prisma.user.deleteMany();

  // Admin user
  const adminHash = await bcrypt.hash("admin123", 12);
  await prisma.user.create({
    data: {
      name: "Admin StickerShop",
      email: "admin@stickershop.com.br",
      passwordHash: adminHash,
      role: "admin",
    },
  });
  console.log("👤 Admin criado: admin@stickershop.com.br / admin123");

  // Cliente de teste
  const clienteHash = await bcrypt.hash("cliente123", 12);
  await prisma.user.create({
    data: {
      name: "Maria Silva",
      email: "maria@email.com",
      passwordHash: clienteHash,
      role: "cliente",
      addressStreet: "Rua das Flores",
      addressNumber: "123",
      addressDistrict: "Centro",
      addressCity: "São Paulo",
      addressState: "SP",
      addressZip: "01001-000",
    },
  });

  // Categorias
  const categories = await Promise.all([
    prisma.category.create({ data: { name: "Anime", slug: "anime", description: "Figurinhas dos melhores animes", order: 1 } }),
    prisma.category.create({ data: { name: "Futebol", slug: "futebol", description: "Times, jogadores e momentos épicos", order: 2 } }),
    prisma.category.create({ data: { name: "Memes", slug: "memes", description: "Os memes mais engraçados em forma de figurinha", order: 3 } }),
    prisma.category.create({ data: { name: "Música", slug: "musica", description: "Bandas, artistas e ícones musicais", order: 4 } }),
    prisma.category.create({ data: { name: "Games", slug: "games", description: "Personagens e momentos dos games", order: 5 } }),
    prisma.category.create({ data: { name: "Séries e Filmes", slug: "series-filmes", description: "Cenas icônicas do cinema e TV", order: 6 } }),
    prisma.category.create({ data: { name: "Empresas e Marcas", slug: "empresas-marcas", description: "Logotipos e identidade visual da sua marca em figurinhas personalizadas", order: 7 } }),
  ]);
  console.log("📁 Categorias criadas");

  // Produtos com variantes
  const productsData = [
    { name: "Naruto Uzumaki", slug: "naruto-uzumaki", basePrice: 5.90, type: "pronta", featured: true, catIdx: 0 },
    { name: "Sasuke Sharingan", slug: "sasuke-sharingan", basePrice: 6.90, type: "pronta", featured: true, catIdx: 0 },
    { name: "Goku Super Saiyajin", slug: "goku-ssj", basePrice: 7.90, type: "pronta", featured: true, catIdx: 0 },
    { name: "Neymar Jr Santos", slug: "neymar-santos", basePrice: 5.90, type: "pronta", featured: false, catIdx: 1 },
    { name: "Pelé Rei", slug: "pele-rei", basePrice: 6.90, type: "pronta", featured: true, catIdx: 1 },
    { name: "Brasil Hexa 2026", slug: "brasil-hexa-2026", basePrice: 5.90, type: "pronta", featured: false, catIdx: 1 },
    { name: "Doge Meme", slug: "doge-meme", basePrice: 4.90, type: "pronta", featured: false, catIdx: 2 },
    { name: "This is Fine", slug: "this-is-fine", basePrice: 4.90, type: "pronta", featured: true, catIdx: 2 },
    { name: "Guitarra Lendária", slug: "guitarra-lendaria", basePrice: 6.90, type: "pronta", featured: false, catIdx: 3 },
    { name: "Cyberpunk 2077", slug: "cyberpunk-2077", basePrice: 7.90, type: "pronta", featured: false, catIdx: 4 },
    { name: "Among Us Tripulante", slug: "among-us", basePrice: 4.90, type: "pronta", featured: false, catIdx: 4 },
    { name: "Stranger Things", slug: "stranger-things", basePrice: 6.90, type: "pronta", featured: false, catIdx: 5 },
  ];

  const sizes = ["5x5", "7x7", "10x10"];
  const finishes = ["brilhante", "fosco", "holografico"];

  for (const p of productsData) {
    const product = await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        description: `Figurinha colecionável ${p.name}. Acabamento premium, impressão de alta qualidade.`,
        basePrice: p.basePrice,
        categoryId: categories[p.catIdx].id,
        type: p.type,
        featured: p.featured,
        imageUrl: null, // placeholder emoji será usado
      },
    });

    // Criar variantes
    for (const size of sizes) {
      for (const finish of finishes) {
        const priceExtra = (size === "7x7" ? 1 : size === "10x10" ? 3 : 0) +
          (finish === "holografico" ? 3 : finish === "fosco" ? 1 : 0);

        await prisma.productVariant.create({
          data: {
            productId: product.id,
            size,
            finish,
            priceExtra,
            stock: Math.floor(Math.random() * 50) + 10,
          },
        });
      }
    }
  }
  console.log("📦 Produtos e variantes criados");

  // Cupons
  await prisma.coupon.create({
    data: {
      code: "STICKER20",
      type: "percentual",
      value: 20,
      minOrderValue: 30,
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-12-31"),
      maxUses: 100,
    },
  });

  await prisma.coupon.create({
    data: {
      code: "FRETEGRATIS",
      type: "valor_fixo",
      value: 15.90,
      minOrderValue: 0,
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-12-31"),
      maxUses: 50,
    },
  });
  console.log("🎫 Cupons criados: STICKER20, FRETEGRATIS");

  // Regra de promoção
  await prisma.promotionRule.create({
    data: {
      name: "Leve 5, Pague 4",
      type: "compre_x_pague_y",
      buyQty: 5,
      payQty: 4,
      applyTo: "todos",
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-12-31"),
    },
  });
  console.log("🏷️ Regra de promoção criada: Leve 5, Pague 4");

  console.log("✅ Seed concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
