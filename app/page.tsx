import { getStore } from "@/lib/store";
import { Desk } from "@/components/desk";
export const dynamic = "force-dynamic";
export default function Page() {
  const store = getStore();
  return (
    <Desk
      quotes={structuredClone(store.quotes)}
      catalog={structuredClone(store.catalog)}
    />
  );
}
