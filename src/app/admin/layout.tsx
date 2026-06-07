import Link from "next/link";
import { redirect } from "next/navigation";
import {
  LayoutDashboard, ShoppingBag, Package, Tags, Percent, Ticket, Star, ChevronLeft,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

const sidebarLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingBag },
  { href: "/admin/produtos", label: "Produtos", icon: Package },
  { href: "/admin/categorias", label: "Categorias", icon: Tags },
  { href: "/admin/cupons", label: "Cupons", icon: Ticket },
  { href: "/admin/promocoes", label: "Promoções", icon: Percent },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if ((session.user as { role: string }).role !== "admin") redirect("/");

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-muted/20 p-4">
        <div className="mb-6">
          <Link href="/admin" className="flex items-center gap-2 font-bold text-lg">
            <Star className="h-5 w-5 text-primary fill-primary" />
            Admin
          </Link>
        </div>
        <nav className="space-y-1 flex-1">
          {sidebarLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>
        <Button variant="ghost" size="sm" asChild className="mt-auto">
          <Link href="/">
            <ChevronLeft className="mr-1 h-4 w-4" /> Voltar à Loja
          </Link>
        </Button>
      </aside>

      {/* Mobile nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background">
        <nav className="flex justify-around p-2">
          {sidebarLinks.slice(0, 5).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex flex-col items-center gap-1 p-2 text-[10px] text-muted-foreground"
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
