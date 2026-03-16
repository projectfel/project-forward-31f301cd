import { Store, ShoppingBag } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useStores } from "@/hooks/useStores";

interface GlobalSearchProps {
  busca: string;
  onBuscaChange: (value: string) => void;
}

interface SearchResult {
  type: "store";
  id: string;
  name: string;
  detail: string;
  storeId: string;
}

const GlobalSearch = ({ busca, onBuscaChange }: GlobalSearchProps) => {
  const [showResults, setShowResults] = useState(false);
  const { data: stores } = useStores();

  useEffect(() => {
    if (busca.length >= 2) setShowResults(true);
    else setShowResults(false);
  }, [busca]);

  const results = useMemo<SearchResult[]>(() => {
    if (!busca || busca.length < 2 || !stores) return [];
    const query = busca.toLowerCase();
    return stores
      .filter((s) => s.name.toLowerCase().includes(query) || (s.description || "").toLowerCase().includes(query))
      .slice(0, 6)
      .map((s) => ({
        type: "store" as const,
        id: s.id,
        name: s.name,
        detail: s.address || s.neighborhood || "",
        storeId: s.id,
      }));
  }, [busca, stores]);

  if (!showResults || results.length === 0) return null;

  return (
    <div className="relative">
      <div className="fixed inset-0 z-40" onClick={() => setShowResults(false)} />
      <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-2xl border bg-card shadow-2xl overflow-hidden animate-scale-in">
        <div className="max-h-80 overflow-y-auto py-2">
          {results.map((r) => (
            <Link
              key={r.id}
              to={`/mercado/${r.storeId}`}
              onClick={() => { setShowResults(false); onBuscaChange(""); }}
              className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary">
                <Store className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-card-foreground truncate">{r.name}</p>
                <p className="text-xs text-muted-foreground truncate">{r.detail}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;
