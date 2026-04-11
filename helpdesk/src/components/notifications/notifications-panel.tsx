"use client";

import Link from "next/link";
import { useState } from "react";

import { markNotificationReadAction } from "@/app/app/notification-actions";
import type { NotificationView } from "@/lib/helpdesk-server";

type NotificationsPanelProps = {
  notifications: NotificationView[];
};

export function NotificationsPanel({ notifications }: NotificationsPanelProps) {
  const unreadNotifications = notifications.filter((notification) => !notification.read);
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full lg:max-w-md">
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/70 p-3 text-sm text-slate-300">
        <div>
          <p className="font-medium text-white">Notificaciones</p>
          <p className="text-xs text-slate-500">{unreadNotifications.length} pendientes</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="rounded-xl border border-white/10 px-3 py-2 text-xs text-slate-300 transition hover:bg-white/5"
        >
          {open ? "Cerrar" : "Abrir"}
        </button>
      </div>

      <div className={`mt-3 space-y-2 rounded-2xl border border-white/10 bg-slate-950/70 p-3 text-sm text-slate-300 ${open ? "block" : "hidden"}`}>
        {unreadNotifications.length === 0 ? (
          <p className="text-xs text-slate-500">No hay notificaciones pendientes para esta sesion.</p>
        ) : null}
        {unreadNotifications.map((notification) => (
          <div key={notification.id} className="rounded-xl border border-white/8 bg-slate-950/60 px-3 py-2">
            <Link href={notification.href} className="block">
              <p className="text-sm font-medium text-white">{notification.title}</p>
              <p className="mt-1 text-xs text-slate-400">{notification.message}</p>
            </Link>
            <form action={markNotificationReadAction} className="mt-2 flex justify-end">
              <input type="hidden" name="notificationId" value={notification.id} />
              <button
                type="submit"
                className="rounded-lg border border-white/10 px-2 py-1 text-xs text-slate-300 transition hover:bg-white/5"
              >
                Marcar revisada
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
