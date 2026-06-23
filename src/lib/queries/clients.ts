import { supabase } from '@/lib/supabase';
import type { Client } from '@/types/models';
import type { Database } from '@/types/database';
import type { PaginationParams, PaginatedResult } from './shared';
import { handleSupabaseError, paginationRange } from './shared';
import { mapClient, type ClientRow } from './mappers';

type ClientInsert = Database['public']['Tables']['clients']['Insert'];
type ClientUpdate = Database['public']['Tables']['clients']['Update'];

export async function getClients(
  params: PaginationParams = {}
): Promise<PaginatedResult<Client>> {
  const { from, to } = paginationRange(params);

  const { data, error, count } = await supabase
    .from('clients')
    .select('id, name, email, phone', { count: 'exact' })
    .range(from, to)
    .order('name');

  if (error) handleSupabaseError(error);

  return {
    data: ((data ?? []) as ClientRow[]).map(mapClient),
    count: count ?? 0,
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 50,
  };
}

export async function createClient(
  client: Omit<Client, 'id'>
): Promise<Client> {
  const insertPayload: ClientInsert = {
    name: client.name,
    email: client.email,
    phone: client.phone,
  };

  const { data, error } = await supabase
    .from('clients')
    .insert(insertPayload)
    .select('id, name, email, phone')
    .single();

  if (error) handleSupabaseError(error);
  return mapClient(data as unknown as ClientRow);
}

export async function updateClient(
  id: string,
  changes: Partial<Omit<Client, 'id'>>
): Promise<Client> {
  const updatePayload: ClientUpdate = {
    ...(changes.name !== undefined && { name: changes.name }),
    ...(changes.email !== undefined && { email: changes.email }),
    ...(changes.phone !== undefined && { phone: changes.phone }),
  };

  const { data, error } = await supabase
    .from('clients')
    .update(updatePayload)
    .eq('id', id)
    .select('id, name, email, phone')
    .single();

  if (error) handleSupabaseError(error);
  return mapClient(data as unknown as ClientRow);
}

export async function deleteClient(id: string): Promise<void> {
  const { error } = await supabase.from('clients').delete().eq('id', id);
  if (error) handleSupabaseError(error);
}
