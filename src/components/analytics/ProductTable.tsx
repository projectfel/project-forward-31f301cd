/**
 * ProductTable
 * Shows top 20 products ranked by views with conversion metrics.
 */
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface ProductData {
  product_id: string;
  product_name: string;
  price: number;
  views: number;
  add_to_carts: number;
  sales: number;
  conversion_rate: number;
}

interface ProductTableProps {
  products: ProductData[];
}

export default function ProductTable({ products }: ProductTableProps) {
  if (products.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        <p>Nenhum dado de produto disponível</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[30px]">#</TableHead>
            <TableHead>Produto</TableHead>
            <TableHead className="text-right">Views</TableHead>
            <TableHead className="text-right">Carrinho</TableHead>
            <TableHead className="text-right">Vendas</TableHead>
            <TableHead className="text-right">Conversão</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((p, idx) => (
            <TableRow key={p.product_id}>
              <TableCell className="font-medium text-muted-foreground">
                {idx + 1}
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium text-sm truncate max-w-[200px]">{p.product_name}</p>
                  <p className="text-xs text-muted-foreground">
                    R$ {p.price.toFixed(2).replace(".", ",")}
                  </p>
                </div>
              </TableCell>
              <TableCell className="text-right tabular-nums">{p.views}</TableCell>
              <TableCell className="text-right tabular-nums">{p.add_to_carts}</TableCell>
              <TableCell className="text-right tabular-nums">{p.sales}</TableCell>
              <TableCell className="text-right">
                <Badge
                  variant={p.conversion_rate >= 5 ? "default" : "secondary"}
                  className="tabular-nums"
                >
                  {p.conversion_rate}%
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
