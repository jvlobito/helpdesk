import Link from "next/link";

import { NotificationsPanel } from "@/components/notifications/notifications-panel";
import { getNavigationItems, getUserDisplayName } from "@/lib/auth";
import { requireAuthSession } from "@/lib/auth-server";
import { listUserNotifications } from "@/lib/helpdesk-server";

export default async function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await requireAuthSession();
  const navItems = getNavigationItems(session.user.role);
  const notifications = await listUserNotifications(session.user.id);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 py-6 lg:px-10">
      <header className="sticky top-0 z-10 mb-6 rounded-2xl border border-white/10 bg-slate-950/80 px-5 py-4 backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">HelpDesk MVP</p>
            <h1 className="text-lg font-semibold text-white">Workspace protegido por sesion</h1>
            <p className="mt-1 text-sm text-slate-400">
              {getUserDisplayName(session.user)} · {session.user.role}
            </p>
          </div>

          <div className="flex flex-col gap-3 lg:items-end">
            <NotificationsPanel notifications={notifications} />

            <nav className="flex flex-wrap gap-2 text-sm text-slate-300">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-xl border border-white/10 px-3 py-2 transition hover:bg-white/5"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <form action="/api/auth/logout" method="post">
              <button
                type="submit"
                className="rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5"
              >
                Cerrar sesion
              </button>
            </form>
          </div>
        </div>
      </header>

      {children}
    </div>
  );
}
