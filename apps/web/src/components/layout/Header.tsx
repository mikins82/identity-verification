import { Link } from "react-router";
import { ShoppingCart, Plane } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCartStore, selectItemCount } from "@/store/cartStore";

export function Header() {
  const itemCount = useCartStore(selectItemCount);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <Plane className="h-6 w-6" />
          <span>SkyRent</span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            to="/"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Catalog
          </Link>
          <Link to="/cart" className="relative flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <Badge variant="default" className="absolute -right-3 -top-2 h-5 w-5 rounded-full p-0 text-[10px] flex items-center justify-center">
                {itemCount}
              </Badge>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
