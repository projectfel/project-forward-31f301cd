import { Award, Gift, TrendingUp } from "lucide-react";

const LoyaltyBanner = () => {
  return (
    <section className="mx-auto max-w-6xl px-4 mt-12">
      <div className="relative overflow-hidden rounded-2xl bg-primary p-6 sm:p-8">
        {/* Decorative circles */}
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary-foreground/5" />
        <div className="absolute -left-4 -bottom-4 h-24 w-24 rounded-full bg-primary-foreground/5" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-foreground/10 shrink-0">
            <Award className="h-7 w-7 text-accent" />
          </div>

          <div className="flex-1">
            <h3 className="text-xl font-bold text-primary-foreground">
              Programa Entorno Fidelidade
            </h3>
            <p className="mt-1 text-sm text-primary-foreground/70">
              Ganhe pontos a cada compra e troque por recompensas exclusivas nos mercados do bairro.
            </p>
          </div>

          <div className="flex gap-6">
            <div className="text-center">
              <div className="flex items-center gap-1 text-accent">
                <Gift className="h-4 w-4" />
                <span className="text-xl font-bold text-primary-foreground">10x</span>
              </div>
              <p className="text-[10px] text-primary-foreground/60 uppercase tracking-wider">Recompensas</p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1 text-accent">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xl font-bold text-primary-foreground">2%</span>
              </div>
              <p className="text-[10px] text-primary-foreground/60 uppercase tracking-wider">Cashback</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoyaltyBanner;
