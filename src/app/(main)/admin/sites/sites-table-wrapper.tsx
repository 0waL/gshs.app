"use client";

import dynamic from "next/dynamic";
import type { RelatedSite } from "@prisma/client";

const SitesTable = dynamic(() => import("./sites-table").then((m) => m.SitesTable), { ssr: false });

export function SitesTableWrapper({ initialSites }: { initialSites: RelatedSite[] }) {
    return <SitesTable initialSites={initialSites} />;
}
