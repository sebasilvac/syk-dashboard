import type { AppData } from '@/types/models';
import type { DataAction } from '@/types/actions';
import { deductStock } from '@/lib/stockValidation';
import { calculateSubtotal, calculateDocumentTotal } from '@/lib/calculateTotals';

/**
 * Genera un número secuencial con prefijo y padding.
 * Ejemplo: padNumber('COT', 3) → 'COT-003'
 */
function padNumber(prefix: string, count: number): string {
  return `${prefix}-${String(count).padStart(3, '0')}`;
}

/**
 * Reducer principal para el estado de datos de la aplicación.
 * Implementa actualizaciones inmutables para cotizaciones, pedidos e inventario.
 *
 * Valida: Requerimientos 5.4, 6.1, 6.3, 6.4, 8.3, 9.2, 11.1, 11.2
 */
export function dataReducer(state: AppData, action: DataAction): AppData {
  const now = new Date().toISOString();

  switch (action.type) {
    case 'QUOTATION_CREATE': {
      const number = padNumber('COT', state.quotations.length + 1);
      const newQuotation = {
        ...action.payload,
        id: crypto.randomUUID(),
        number,
        createdAt: now,
        updatedAt: now,
      };
      return {
        ...state,
        quotations: [...state.quotations, newQuotation],
      };
    }

    case 'QUOTATION_UPDATE': {
      const { id, changes } = action.payload;
      return {
        ...state,
        quotations: state.quotations.map((q) =>
          q.id === id ? { ...q, ...changes, updatedAt: now } : q
        ),
      };
    }

    case 'QUOTATION_APPROVE': {
      const { id } = action.payload;
      return {
        ...state,
        quotations: state.quotations.map((q) =>
          q.id === id ? { ...q, status: 'aprobada' as const, updatedAt: now } : q
        ),
      };
    }

    case 'QUOTATION_REJECT': {
      const { id } = action.payload;
      return {
        ...state,
        quotations: state.quotations.map((q) =>
          q.id === id ? { ...q, status: 'rechazada' as const, updatedAt: now } : q
        ),
      };
    }

    case 'ORDER_CREATE': {
      const number = padNumber('PED', state.orders.length + 1);
      const newOrder = {
        ...action.payload,
        id: crypto.randomUUID(),
        number,
        deposits: action.payload.deposits ?? [],
        createdAt: now,
        updatedAt: now,
      };
      return {
        ...state,
        orders: [...state.orders, newOrder],
      };
    }

    case 'ORDER_CREATE_FROM_QUOTATION': {
      const { quotationId, dueDate } = action.payload;
      const quotation = state.quotations.find((q) => q.id === quotationId);
      if (!quotation) return state;

      const number = padNumber('PED', state.orders.length + 1);
      const total = calculateDocumentTotal(quotation.lines);
      const lines = quotation.lines.map((line) => ({
        ...line,
        subtotal: calculateSubtotal(line.quantity, line.unitPrice),
      }));

      const newOrder = {
        id: crypto.randomUUID(),
        number,
        clientId: quotation.clientId,
        sellerId: quotation.sellerId,
        lines,
        total,
        status: 'activo' as const,
        notes: quotation.notes,
        dueDate,
        quotationId,
        deposits: [],
        createdAt: now,
        updatedAt: now,
      };

      // Deduct stock for all lines in the order
      const stockItems = quotation.lines.map((line) => ({
        variantId: line.variantId,
        quantity: line.quantity,
      }));
      const updatedProducts = deductStock(state.products, stockItems);

      return {
        ...state,
        orders: [...state.orders, newOrder],
        products: updatedProducts,
      };
    }

    case 'ORDER_MARK_DELIVERED': {
      const { id } = action.payload;
      return {
        ...state,
        orders: state.orders.map((o) =>
          o.id === id ? { ...o, status: 'entregado' as const, updatedAt: now } : o
        ),
      };
    }

    case 'VARIANT_ADD': {
      const { productId, variant } = action.payload;
      const newVariant = {
        ...variant,
        id: crypto.randomUUID(),
      };
      return {
        ...state,
        products: state.products.map((p) =>
          p.id === productId
            ? { ...p, variants: [...p.variants, newVariant] }
            : p
        ),
      };
    }

    case 'VARIANT_UPDATE_STOCK': {
      const { productId, variantId, stock } = action.payload;
      return {
        ...state,
        products: state.products.map((p) =>
          p.id === productId
            ? {
                ...p,
                variants: p.variants.map((v) =>
                  v.id === variantId ? { ...v, stock } : v
                ),
              }
            : p
        ),
      };
    }

    case 'STOCK_DEDUCT': {
      const { items } = action.payload;
      return {
        ...state,
        products: deductStock(state.products, items),
      };
    }

    case 'CLIENT_CREATE': {
      const newClient = {
        ...action.payload,
        id: crypto.randomUUID(),
      };
      return {
        ...state,
        clients: [...state.clients, newClient],
      };
    }

    case 'CLIENT_UPDATE': {
      const { id, changes } = action.payload;
      return {
        ...state,
        clients: state.clients.map((c) =>
          c.id === id ? { ...c, ...changes } : c
        ),
      };
    }

    case 'CLIENT_DELETE': {
      const { id } = action.payload;
      return {
        ...state,
        clients: state.clients.filter((c) => c.id !== id),
      };
    }

    case 'DEPOSIT_ADD': {
      const { orderId, deposit } = action.payload;
      const newDeposit = {
        ...deposit,
        id: crypto.randomUUID(),
      };
      return {
        ...state,
        orders: state.orders.map((o) =>
          o.id === orderId
            ? { ...o, deposits: [...o.deposits, newDeposit], updatedAt: now }
            : o
        ),
      };
    }

    case 'DEPOSIT_REMOVE': {
      const { orderId, depositId } = action.payload;
      return {
        ...state,
        orders: state.orders.map((o) =>
          o.id === orderId
            ? { ...o, deposits: o.deposits.filter((d) => d.id !== depositId), updatedAt: now }
            : o
        ),
      };
    }

    case 'PRODUCT_CREATE': {
      const { name, category, variants } = action.payload;
      const newProduct = {
        id: crypto.randomUUID(),
        name,
        category,
        variants: variants.map((v) => ({
          ...v,
          id: crypto.randomUUID(),
        })),
      };
      return {
        ...state,
        products: [...state.products, newProduct],
      };
    }

    case 'PRODUCT_DELETE': {
      const { id } = action.payload;
      return {
        ...state,
        products: state.products.filter((p) => p.id !== id),
      };
    }

    case 'VARIANT_DELETE': {
      const { productId, variantId } = action.payload;
      return {
        ...state,
        products: state.products.map((p) =>
          p.id === productId
            ? { ...p, variants: p.variants.filter((v) => v.id !== variantId) }
            : p
        ),
      };
    }

    default:
      return state;
  }
}
