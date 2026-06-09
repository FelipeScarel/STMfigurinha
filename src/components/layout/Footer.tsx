import Link from "next/link";
import { Star } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 font-bold text-lg mb-3">
              <Star className="h-5 w-5 text-primary fill-primary" />
              StickerShop
            </Link>
            <p className="text-sm text-muted-foreground">
              Figurinhas personalizadas e colecionáveis de alta qualidade. Expresse sua criatividade!
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Categorias</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/categorias/anime" className="hover:text-foreground transition-colors">Anime</Link></li>
              <li><Link href="/categorias/futebol" className="hover:text-foreground transition-colors">Futebol</Link></li>
              <li><Link href="/categorias/memes" className="hover:text-foreground transition-colors">Memes</Link></li>
              <li><Link href="/categorias/musica" className="hover:text-foreground transition-colors">Música</Link></li>
              <li><Link href="/categorias/games" className="hover:text-foreground transition-colors">Games</Link></li>
              <li><Link href="/categorias/empresas-marcas" className="hover:text-foreground transition-colors">Empresas</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3">Ajuda</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/personalizar" className="hover:text-foreground transition-colors">Criar Personalizada</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Como Funciona</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Tamanhos e Acabamentos</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Política de Envio</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Contato</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3">Contato</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>contato@stickershop.com.br</li>
              <li>(11) 99999-9999</li>
              <li>Seg a Sex: 9h às 18h</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} StickerShop. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
