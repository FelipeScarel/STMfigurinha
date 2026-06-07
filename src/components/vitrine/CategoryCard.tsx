import Link from "next/link";
import { Card } from "@/components/ui/card";

type Category = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
};

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link href={`/categorias/${category.slug}`}>
      <Card className="group h-full overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-1 text-center p-4">
        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
          {category.imageUrl ? (
            <img src={category.imageUrl} alt={category.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            "🎴"
          )}
        </div>
        <h3 className="font-medium text-sm group-hover:text-primary transition-colors">
          {category.name}
        </h3>
      </Card>
    </Link>
  );
}
