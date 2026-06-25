import { useCallback } from 'react';
import type { ReactNode } from 'react';
import type { AppData } from '@/types/models';
import type { DataAction } from '@/types/actions';
import { DataContext } from '@/lib/DataContext';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useClients } from '@/hooks/useClients';
import { useProducts } from '@/hooks/useProducts';
import { useQuotations } from '@/hooks/useQuotations';
import { useOrders } from '@/hooks/useOrders';

function AuthenticatedDataProvider({ children }: { children: ReactNode }) {
  const clientsHook = useClients();
  const productsHook = useProducts();
  const quotationsHook = useQuotations();
  const ordersHook = useOrders();

  const data: AppData = {
    clients: clientsHook.clients,
    products: productsHook.products,
    quotations: quotationsHook.quotations,
    orders: ordersHook.orders,
  };

  const dispatch = useCallback(
    (action: DataAction) => {
      switch (action.type) {
        case 'CLIENT_CREATE':
          clientsHook.createClient(action.payload);
          break;

        case 'CLIENT_UPDATE':
          clientsHook.updateClient(action.payload.id, action.payload.changes);
          break;

        case 'CLIENT_DELETE':
          clientsHook.deleteClient(action.payload.id);
          break;

        case 'QUOTATION_CREATE':
          quotationsHook.createQuotation({ ...action.payload, number: '' });
          break;

        case 'QUOTATION_UPDATE':
          quotationsHook.updateQuotation(action.payload.id, action.payload.changes);
          break;

        case 'QUOTATION_APPROVE':
          quotationsHook.approveQuotation(action.payload.id);
          break;

        case 'QUOTATION_REJECT':
          quotationsHook.rejectQuotation(action.payload.id);
          break;

        case 'ORDER_CREATE':
          ordersHook.createOrder({ ...action.payload, number: '' });
          break;

        case 'ORDER_CREATE_FROM_QUOTATION': {
          const quotation = quotationsHook.quotations.find(
            (q) => q.id === action.payload.quotationId
          );
          if (!quotation) break;

          ordersHook.createOrderFromQuotation(action.payload.quotationId, {
            number: '',
            clientId: quotation.clientId,
            sellerId: quotation.sellerId,
            lines: quotation.lines,
            total: quotation.total,
            status: 'activo',
            notes: quotation.notes,
            dueDate: action.payload.dueDate,
          });
          break;
        }

        case 'ORDER_MARK_DELIVERED':
          ordersHook.markOrderDelivered(action.payload.id);
          break;

        case 'VARIANT_ADD':
          productsHook.addVariant(action.payload.productId, action.payload.variant);
          break;

        case 'VARIANT_UPDATE_STOCK':
          productsHook.updateVariantStock(
            action.payload.variantId,
            action.payload.stock
          );
          break;

        case 'PRODUCT_CREATE':
          productsHook.createProduct(
            action.payload.name,
            action.payload.category,
            action.payload.variants
          );
          break;

        case 'PRODUCT_DELETE':
          productsHook.deleteProduct(action.payload.id);
          break;

        case 'VARIANT_DELETE':
          productsHook.deleteVariant(action.payload.productId, action.payload.variantId);
          break;

        case 'DEPOSIT_ADD':
          ordersHook.addDeposit(action.payload.orderId, action.payload.deposit);
          break;

        case 'DEPOSIT_REMOVE':
          ordersHook.removeDeposit(action.payload.orderId, action.payload.depositId);
          break;

        case 'STOCK_DEDUCT':
          // Stock deduction is handled server-side via ORDER_CREATE_FROM_QUOTATION
          // No direct hook method needed for this action in Supabase mode
          break;
      }
    },
    [clientsHook, productsHook, quotationsHook, ordersHook]
  );

  return (
    <DataContext.Provider value={{ data, dispatch }}>
      {children}
    </DataContext.Provider>
  );
}

const emptyData: AppData = {
  clients: [],
  products: [],
  quotations: [],
  orders: [],
};

const noopDispatch = () => {};

export function SupabaseDataProvider({ children }: { children: ReactNode }) {
  const { state } = useSupabaseAuth();

  if (!state.isAuthenticated) {
    return (
      <DataContext.Provider value={{ data: emptyData, dispatch: noopDispatch }}>
        {children}
      </DataContext.Provider>
    );
  }

  return <AuthenticatedDataProvider>{children}</AuthenticatedDataProvider>;
}
