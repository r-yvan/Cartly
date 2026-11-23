"use client";

import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { LoadState, PageHeader, TableCard } from "@/components/dashboard";
import { Avatar } from "@/components/navbar";
import { Select } from "@/components/ui";
import { api } from "@/lib/fetcher";
import { useApi } from "@/lib/use-api";
import { formatDate } from "@/lib/utils";

type User = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
  createdAt: string;
  _count: { orders: number; products: number };
};

const ROLES = { USER: "Buyer", SELLER: "Seller", ADMIN: "Admin" };

export default function AdminUsers() {
  const { data: session } = useSession();
  const { data: users, loading, error, reload } = useApi<User[]>("/api/admin/users");

  const setRole = async (user: User, role: string) => {
    try {
      await api("/api/admin/users", { method: "PUT", body: { userId: user.id, role } });
      toast.success(`${user.name ?? user.email} is now ${ROLES[role as keyof typeof ROLES].toLowerCase()}`);
      reload();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <>
      <PageHeader eyebrow="Admin" title="Users" />
      <LoadState loading={loading} error={error} onRetry={reload} />
      {users && (
        <TableCard head={["User", "Joined", "Orders", "Products", "Role"]}>
          {users.map((user) => (
            <tr key={user.id}>
              <td>
                <div className="flex items-center gap-3">
                  <Avatar name={user.name ?? user.email} image={user.image} className="shrink-0" />
                  <div className="min-w-0">
                    <p className="max-w-52 truncate font-bold">{user.name ?? "No name"}</p>
                    <p className="max-w-52 truncate text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
              </td>
              <td className="whitespace-nowrap text-muted-foreground">{formatDate(user.createdAt)}</td>
              <td>{user._count.orders}</td>
              <td>{user._count.products}</td>
              <td>
                <Select
                  value={user.role}
                  disabled={user.id === session?.user?.id}
                  title={user.id === session?.user?.id ? "You can't change your own role" : undefined}
                  onChange={(e) => setRole(user, e.target.value)}
                  aria-label={`Role of ${user.name ?? user.email}`}
                  className="h-10 w-32 rounded-full px-3 text-sm font-bold"
                >
                  {Object.entries(ROLES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </Select>
              </td>
            </tr>
          ))}
        </TableCard>
      )}
    </>
  );
}
