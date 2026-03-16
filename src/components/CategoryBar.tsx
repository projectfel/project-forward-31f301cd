import { categorias } from "@/data/mockData";

interface CategoryBarProps {
  categoriaAtiva: string | null;
  onCategoriaChange: (cat: string | null) => void;
}

const CategoryBar = ({ categoriaAtiva, onCategoriaChange }: CategoryBarProps) => {
  return (
    <section className="mx-auto max-w-6xl px-4 mt-8">
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => onCategoriaChange(null)}
          className={`flex shrink-0 flex-col items-center gap-1.5 rounded-2xl px-4 py-3 transition-all duration-200 ${
            !categoriaAtiva
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-card text-card-foreground border hover:bg-secondary"
          }`}
        >
          <span className="text-xl">🏪</span>
          <span className="text-xs font-medium">Todos</span>
        </button>
        {categorias.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onCategoriaChange(cat.nome)}
            className={`flex shrink-0 flex-col items-center gap-1.5 rounded-2xl px-4 py-3 transition-all duration-200 ${
              categoriaAtiva === cat.nome
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-card text-card-foreground border hover:bg-secondary"
            }`}
          >
            <span className="text-xl">{cat.icone}</span>
            <span className="text-xs font-medium">{cat.nome}</span>
          </button>
        ))}
      </div>
    </section>
  );
};

export default CategoryBar;
