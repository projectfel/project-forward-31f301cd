import { MapPin, ShoppingCart, User, LogOut, LogIn, Package, LayoutDashboard, ShieldCheck, Mic } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const { itemCount, setIsOpen } = useCart();
  const { user, role, signOut, loading } = useAuth();
  const { toast } = useToast();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-md">
            <span className="text-lg font-black text-primary-foreground">E</span>
          </div>
          <div className="hidden sm:block">
            <span className="text-lg font-bold text-foreground leading-none">O Entorno</span>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Marketplace de Bairro</p>
          </div>
        </Link>

        <div className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-sm">
          <MapPin className="h-3.5 w-3.5 text-primary" />
          <span className="text-secondary-foreground text-xs font-medium hidden sm:inline">Lagoa Azul — Boa Esperança</span>
          <span className="text-secondary-foreground text-xs font-medium sm:hidden">Lagoa Azul</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Voice shopping - only show if logged in */}
          {!loading && user && (
            <Link
              to="/compra-voz"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              title="Lista Inteligente"
            >
              <Mic className="h-5 w-5" />
            </Link>
          )}
          {!loading && (
            user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                    <User className="h-5 w-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="px-2 py-1.5">
                    <p className="text-xs text-muted-foreground truncate max-w-[180px]">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/compra-voz" className="cursor-pointer">
                      <Mic className="h-4 w-4 mr-2" />
                      Lista Inteligente
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/meus-pedidos" className="cursor-pointer">
                      <Package className="h-4 w-4 mr-2" />
                      Meus Pedidos
                    </Link>
                  </DropdownMenuItem>
                  {(role === "admin" || role === "moderator") && (
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="cursor-pointer">
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Painel do Lojista
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {role === "admin" && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="cursor-pointer">
                        <ShieldCheck className="h-4 w-4 mr-2" />
                        Administração
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={async () => {
                      await signOut();
                      toast({ title: "Você saiu da sua conta." });
                    }}
                    className="text-destructive cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login" className="flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Entrar</span>
              </Link>
            )
          )}
          <button onClick={() => setIsOpen(true)} className="relative flex h-10 w-10 items-center justify-center rounded-xl hover:bg-secondary transition-colors">
            <ShoppingCart className="h-5 w-5 text-foreground" />
            {itemCount > 0 && (
              <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent p-0 text-[10px] text-accent-foreground border-2 border-background">
                {itemCount}
              </Badge>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
