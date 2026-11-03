import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.testimonial.createMany({
    data: [
      {
        name: "Budi Santoso",
        title: "Kepala Desa Alenggo",
        quote:
          "Program PPM dari PT Stargate Pasific Resource sangat membantu peningkatan ekonomi warga desa kami.",
        imageUrl: "/avatar-placeholder.svg",
      },
      {
        name: "Siti Aminah",
        title: "Ketua Kelompok UMKM Teras Pangan Alenggo",
        quote:
          "Berkat pendampingan dan pelatihan, produk UMKM kami kini bisa dipasarkan lebih luas.",
        imageUrl: "/avatar-placeholder.svg",
      },
    ],
  });

  await prisma.category.createMany({
    data: [
      { name: "Pendidikan", type: "PPM", order: 1 },
      { name: "Kesehatan", type: "PPM", order: 2 },
      { name: "Peningkatan Pendapatan Rill", type: "PPM", order: 3 },
      { name: "Kemandirian Ekonomi", type: "PPM", order: 4 },
      { name: "Sosial Budaya", type: "PPM", order: 5 },
      { name: "Lingkungan", type: "PPM", order: 6 },
      { name: "Kelembagaan Masyarakat", type: "PPM", order: 7 },
      { name: "Infrastruktur", type: "PPM", order: 8 },
    ],
  });
  const ppmCategory = await prisma.category.findFirstOrThrow({
    where: { name: "Pendidikan", type: "PPM" },
  });
  const csrCategory = await prisma.category.create({
    data: { name: "Lingkungan", type: "CSR" },
  });

  await prisma.post.createMany({
    data: [
      {
        title: "Bantuan Beasiswa untuk Pelajar Desa Alenggo",
        slug: "bantuan-beasiswa-pelajar-desa-alenggo",
        content: "<p>Konten artikel PPM contoh.</p>",
        thumbnailUrl: "/image-placeholder.svg",
        categoryId: ppmCategory.id,
        viewCount: 152,
      },
      {
        title: "Penanaman 1000 Pohon Mangrove",
        slug: "penanaman-1000-pohon-mangrove",
        content: "<p>Konten artikel CSR contoh.</p>",
        thumbnailUrl: "/image-placeholder.svg",
        categoryId: csrCategory.id,
        viewCount: 98,
      },
    ],
  });

  const binaanGroup = await prisma.binaanGroup.create({
    data: { name: "Teras Pangan Alenggo" },
  });

  await prisma.product.createMany({
    data: [
      {
        name: "Keripik Singkong",
        groupId: binaanGroup.id,
        flavor: "Original",
        description: "Keripik singkong renyah produksi UMKM binaan.",
        imageUrl: "/image-placeholder.svg",
        waNumber: "081234567890",
      },
      {
        name: "Sambal Teri",
        groupId: binaanGroup.id,
        flavor: "Pedas",
        description: "Sambal teri khas produksi UMKM binaan.",
        imageUrl: "/image-placeholder.svg",
        waNumber: "081234567890",
      },
    ],
  });

  await prisma.gallery.createMany({
    data: [
      { title: "Penghargaan PROPER Hijau", type: "PENGHARGAAN", imageUrl: "/image-placeholder.svg" },
    ],
  });

  const kegiatanCategory = await prisma.activityCategory.create({
    data: { name: "Pendidikan", order: 1 },
  });

  await prisma.activityPhoto.createMany({
    data: [
      { caption: "Bantuan sarana belajar", imageUrl: "/image-placeholder.svg", categoryId: kegiatanCategory.id, order: 1 },
      { caption: "Kunjungan sekolah binaan", imageUrl: "/image-placeholder.svg", categoryId: kegiatanCategory.id, order: 2 },
    ],
  });

  console.log("Seed completed.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
