import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createItem, deleteItem, listItems, updateItem } from '@/features/items/api';
import type { CreateItemInput, Item } from '@/features/items/schemas';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createItemSchema } from '@/features/items/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table';
import { toast } from 'sonner';

export const ItemsPage = () => {
  const queryClient = useQueryClient();
  const { data: items = [], isLoading } = useQuery({ queryKey: ['items'], queryFn: listItems });
  const form = useForm<CreateItemInput>({
    resolver: zodResolver(createItemSchema),
    defaultValues: { name: '' },
  });

  const createMutation = useMutation({
    mutationFn: createItem,
    onSuccess: () => {
      toast.success('Item created');
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
    onError: () => toast.error('Failed to create item'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => updateItem(id, { name }),
    onSuccess: () => {
      toast.success('Item updated');
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
    onError: () => toast.error('Failed to update item'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteItem(id),
    onSuccess: () => {
      toast.success('Item deleted');
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
    onError: () => toast.error('Failed to delete item'),
  });

  const onSubmit = (values: CreateItemInput) => {
    createMutation.mutate(values);
  };

  const onEdit = (item: Item) => {
    const name = window.prompt('Update item name', item.name);
    if (name && name !== item.name) {
      updateMutation.mutate({ id: item.id, name });
    }
  };

  return (
    <div className="space-y-6">
      <form className="flex flex-col gap-3 rounded-md border border-slate-200 bg-white p-4 shadow-sm md:flex-row" onSubmit={form.handleSubmit(onSubmit)}>
        <Input placeholder="Item name" {...form.register('name')} />
        <Button type="submit" disabled={createMutation.isLoading}>
          {createMutation.isLoading ? 'Creating…' : 'Add Item'}
        </Button>
      </form>
      <div className="rounded-md border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <p className="p-4 text-slate-500">Loading items…</p>
        ) : items.length === 0 ? (
          <p className="p-4 text-slate-500">No items yet.</p>
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>Name</TH>
                <TH>Created</TH>
                <TH className="text-right">Actions</TH>
              </TR>
            </THead>
            <TBody>
              {items.map((item) => (
                <TR key={item.id}>
                  <TD>{item.name}</TD>
                  <TD>{new Date(item.created_at).toLocaleString()}</TD>
                  <TD className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => onEdit(item)}>
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteMutation.mutate(item.id)}
                        disabled={deleteMutation.isPending}
                      >
                        Delete
                      </Button>
                    </div>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </div>
    </div>
  );
};
