import { prisma } from "@/lib/prisma";

export async function generateUniqueSlug(userId: string, name: string): Promise<string> {
  const baseSlug = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // remove non-word chars
    .replace(/[\s_]+/g, "-") // replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ""); // strip leading/trailing hyphens

  let slug = baseSlug || "project";
  let suffix = 1;
  let isUnique = false;

  while (!isUnique) {
    const existing = await prisma.project.findUnique({
      where: {
        userId_slug: {
          userId,
          slug,
        },
      },
    });

    if (!existing) {
      isUnique = true;
    } else {
      slug = `${baseSlug}-${suffix}`;
      suffix++;
    }
  }

  return slug;
}
