import { prisma } from "./prisma";

export type Coach = {
  id: string;
  name: string;
  specialty: string;
  bio: string;
  image: string;
};

export async function getCoaches(): Promise<Coach[]> {
  const rows = await prisma.coach.findMany({ where: { isActive: true } });
  return rows.map((c) => ({
    id: c.id,
    name: c.name,
    specialty: c.specialty,
    bio: c.bio,
    image: c.imageUrl,
  }));
}
