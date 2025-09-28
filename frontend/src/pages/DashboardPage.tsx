import { useAuth } from '@/features/auth/auth-context';
import { useQuery } from '@tanstack/react-query';
import { listItems } from '@/features/items/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';

export const DashboardPage = () => {
  const { user } = useAuth();
  const { data: items = [], isLoading } = useQuery({ queryKey: ['items'], queryFn: listItems });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Welcome</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-700">
            Hello <span className="font-semibold">{user?.email}</span>! You are signed in as{' '}
            <span className="font-semibold">{user?.role}</span>.
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Recent Items</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-slate-500">Loading your items…</p>
          ) : items.length === 0 ? (
            <p className="text-slate-500">No items yet. Create your first item from the Items tab.</p>
          ) : (
            <ul className="space-y-2">
              {items.slice(0, 5).map((item) => (
                <li key={item.id} className="rounded-md border border-slate-200 bg-white px-4 py-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-700">{item.name}</span>
                    <span className="text-xs text-slate-500">
                      {format(new Date(item.created_at), 'PP p')}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
