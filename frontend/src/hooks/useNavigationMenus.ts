import { useEffect, useState } from "react";
import { getApiBaseUrl } from "@/lib/apiBase";
import { resolveNavUrl } from "@/lib/resolveNavUrl";
import { homeHref, toAppPath } from "@/lib/appBase";

export type NavLinkItem = {
  id: number;
  label: string;
  href: string;
  openInNewTab: boolean;
};

const FALLBACK: NavLinkItem[] = [
  { id: 0, label: "Stay", href: toAppPath("/stay"), openInNewTab: false },
  {
    id: 0,
    label: "Experiences",
    href: homeHref("#experiences"),
    openInNewTab: false,
  },
  { id: 0, label: "Dining", href: homeHref("#dining"), openInNewTab: false },
  { id: 0, label: "About Us", href: homeHref("#about"), openInNewTab: false },
  { id: 0, label: "Contact", href: toAppPath("/contact"), openInNewTab: false },
];

type ApiRow = {
  id: number;
  label: string;
  url: string;
  open_in_new_tab?: boolean;
};

export function useNavigationMenus(): NavLinkItem[] {
  const [links, setLinks] = useState<NavLinkItem[]>(FALLBACK);

  useEffect(() => {
    const base = getApiBaseUrl();

    fetch(`${base}/navigation-menus`, { headers: { Accept: "application/json" } })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((body: { data?: ApiRow[] }) => {
        const rows = body.data ?? [];
        if (rows.length === 0) return;
        setLinks(
          rows.map((row) => ({
            id: row.id,
            label: row.label,
            href: resolveNavUrl(row.url),
            openInNewTab: Boolean(row.open_in_new_tab),
          })),
        );
      })
      .catch(() => {
        /* keep fallback */
      });
  }, []);

  return links;
}
