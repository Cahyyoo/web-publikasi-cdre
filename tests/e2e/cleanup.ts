import { prisma } from "@/lib/prisma";
import { deleteUploadedImage } from "@/lib/upload";
import { E2E_PREFIX } from "./helpers";

/** Removes only what tests created: rows named with E2E_PREFIX and their photos. */
export async function removeTestData() {
  const where = { name: { startsWith: E2E_PREFIX } };
  const rows = await prisma.testimonial.findMany({ where, select: { imageUrl: true } });

  await Promise.all(rows.map((row) => deleteUploadedImage(row.imageUrl)));
  await prisma.testimonial.deleteMany({ where });
  await prisma.$disconnect();
}
