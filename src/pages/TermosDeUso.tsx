import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const TermosDeUso = () => {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Link>

      <h1 className="text-2xl font-bold text-foreground mb-6">Termos de Uso</h1>

      <div className="space-y-6 text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">1. Sobre a Plataforma</h2>
          <p>
            O Entorno é uma <strong className="text-foreground">Plataforma de Intermediação de Informações e Anúncios</strong> que 
            conecta supermercados locais aos consumidores do bairro. A plataforma não realiza vendas diretas, 
            não manipula produtos e não é responsável pela logística de entrega.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">2. Responsabilidades</h2>
          <p>
            Cada supermercado parceiro é o único responsável pela separação, qualidade, 
            precificação e entrega dos produtos anunciados em sua vitrine digital. 
            O Entorno fornece exclusivamente a "vitrine" e o "ponto de contato" entre as partes.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">3. Funcionamento</h2>
          <p>
            Os pedidos são finalizados diretamente via WhatsApp entre o consumidor e o supermercado, 
            sem intermediação financeira da plataforma. Os preços, disponibilidade e condições de entrega 
            são definidos exclusivamente pelo supermercado parceiro.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">4. Dados Pessoais</h2>
          <p>
            A plataforma coleta apenas dados necessários para a navegação e melhoria da experiência. 
            Nenhum dado financeiro é processado pela plataforma.
          </p>
        </section>
      </div>
    </main>
  );
};

export default TermosDeUso;
