import { Link } from "react-router-dom";
import { Shield, Heart, Truck } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t bg-card mt-16">
      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Features bar */}
        <div className="grid grid-cols-3 gap-4 mb-8 pb-8 border-b border-border/50">
          <div className="flex flex-col items-center text-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">Compra Segura</p>
              <p className="text-[10px] text-muted-foreground">Seus dados protegidos</p>
            </div>
          </div>
          <div className="flex flex-col items-center text-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
              <Truck className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">Entrega Rápida</p>
              <p className="text-[10px] text-muted-foreground">Direto do bairro pra você</p>
            </div>
          </div>
          <div className="flex flex-col items-center text-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--success))]/10">
              <Heart className="h-5 w-5 text-[hsl(var(--success))]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">Comércio Local</p>
              <p className="text-[10px] text-muted-foreground">Apoie seu bairro</p>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
          <div className="text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-sm font-black text-primary-foreground">E</span>
              </div>
              <span className="font-bold text-foreground">O Entorno</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Conectando você aos melhores mercados do bairro
            </p>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link to="/termos" className="hover:text-foreground transition-colors">
              Termos de Uso
            </Link>
            <Link to="/privacidade" className="hover:text-foreground transition-colors">
              Privacidade
            </Link>
          </div>
        </div>
        <div className="mt-6 border-t border-border/50 pt-4 text-center text-[10px] text-muted-foreground uppercase tracking-wider">
          <p>
            Plataforma de intermediação de informações e anúncios — A responsabilidade pela qualidade e entrega é exclusiva dos parceiros.
          </p>
          <p className="mt-2">© 2026 O Entorno. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
