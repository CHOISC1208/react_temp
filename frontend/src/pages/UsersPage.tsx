import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createUser, deleteUser, listUsers, updateUser } from '@/features/users/api';
import type { CreateUserInput } from '@/features/users/schemas';
import { createUserSchema, userRoleSchema } from '@/features/users/schemas';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table';
import { useAuth } from '@/features/auth/auth-context';
import { toast } from 'sonner';

const roleOptions = userRoleSchema.options;

export const UsersPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({ queryKey: ['users'], queryFn: listUsers, enabled: user?.role === 'admin' });

  const form = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { email: '', password: '', role: 'user' },
  });

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      toast.success('User created');
      form.reset({ email: '', password: '', role: 'user' });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: () => toast.error('Failed to create user'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => updateUser(id, { role }),
    onSuccess: () => {
      toast.success('User updated');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: () => toast.error('Failed to update user'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      toast.success('User deleted');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: () => toast.error('Failed to delete user'),
  });

  const onSubmit = (values: CreateUserInput) => {
    createMutation.mutate(values);
  };

  if (user?.role !== 'admin') {
    return <p className="text-slate-600">Only administrators can manage users.</p>;
  }

  return (
    <div className="space-y-6">
      <form className="grid gap-4 rounded-md border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...form.register('email')} />
          {form.formState.errors.email && <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>}
        </div>
        <div className="space-y-2 md:col-span-1">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" {...form.register('password')} />
          {form.formState.errors.password && <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>}
        </div>
        <div className="space-y-2 md:col-span-1">
          <Label htmlFor="role">Role</Label>
          <select
            id="role"
            className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
            {...form.register('role')}
          >
            {roleOptions.map((option) => (
              <option value={option} key={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-4">
          <Button type="submit" disabled={createMutation.isLoading}>
            {createMutation.isLoading ? 'Creating…' : 'Create user'}
          </Button>
        </div>
      </form>
      <div className="rounded-md border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <p className="p-4 text-slate-500">Loading users…</p>
        ) : users.length === 0 ? (
          <p className="p-4 text-slate-500">No users found.</p>
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>Email</TH>
                <TH>Role</TH>
                <TH>Created</TH>
                <TH className="text-right">Actions</TH>
              </TR>
            </THead>
            <TBody>
              {users.map((u) => (
                <TR key={u.id}>
                  <TD>{u.email}</TD>
                  <TD>
                    <select
                      className="h-9 rounded-md border border-slate-300 px-2 text-sm"
                      value={u.role}
                      onChange={(event) => {
                        const nextRole = event.target.value as (typeof roleOptions)[number];
                        if (nextRole !== u.role) {
                          updateMutation.mutate({ id: u.id, role: nextRole });
                        }
                      }}
                    >
                      {roleOptions.map((option) => (
                        <option value={option} key={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </TD>
                  <TD>{new Date(u.created_at).toLocaleString()}</TD>
                  <TD className="text-right">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteMutation.mutate(u.id)}
                      disabled={deleteMutation.isPending}
                    >
                      Delete
                    </Button>
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
