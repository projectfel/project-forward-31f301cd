import { Search, MapPin, Sparkles } from "lucide-react";
import heroPremium from "@/assets/hero-premium.jpg";

interface HeroSectionProps {
  busca: string;
  onBuscaChange: (value: string) => void;
}

const HeroSection = ({ busca, onBuscaChange }: HeroSectionProps) => {
  return (
    <section className="relative overflow-hidden">
      {/* Hero Image */}
      <div className="relative h-[420px] sm:h-[480px]">
        <img
          src={heroPremium}
          alt="O Entorno — Marketplace de Bairro"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/70 via-foreground/40 to-background" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
          <div className="flex items-center gap-2 rounded-full bg-primary/20 px-4 py-1.5 backdrop-blur-sm border border-primary/30 mb-4 animate-fade-in">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            <span className="text-xs font-medium text-primary-foreground">Marketplace do Bairro</span>
          </div>
          
          <h1 className="text-center text-4xl sm:text-5xl lg:text-6xl font-bold text-primary-foreground tracking-tight animate-fade-in">
            O Entorno
          </h1>
          <p className="mt-3 text-center text-base sm:text-lg text-primary-foreground/80 max-w-md animate-slide-up">
            Conectando você aos melhores mercados do seu bairro
          </p>

          {/* Location badge */}
          <div className="mt-4 flex items-center gap-1.5 text-primary-foreground/70 animate-slide-up">
            <MapPin className="h-4 w-4" />
            <span className="text-sm">Lagoa Azul — Conj. Boa Esperança</span>
          </div>

          {/* Search bar */}
          <div className="mt-6 w-full max-w-lg animate-slide-up">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar mercados, produtos ou categorias..."
                value={busca}
                onChange={(e) => onBuscaChange(e.target.value)}
                className="w-full rounded-2xl border-0 bg-card/95 backdrop-blur-md py-4 pl-12 pr-4 text-card-foreground shadow-xl placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
