"use server";
import { revalidatePath } from "next/cache";
import {
  createQuote,
  finalize,
  getStore,
  saveLines,
  updatePrice,
} from "@/lib/store";
import { Line } from "@/lib/types";
import { readMessage } from "@/lib/message-intake";
type Command =
  | { type: "create"; message: string }
  | { type: "save"; id: string; lines: Line[]; revision: number }
  | { type: "finalize"; id: string; revision: number }
  | { type: "price"; sku: string; priceCents: number };
export async function act(command: Command) {
  try {
    const store = getStore();
    let id: string | undefined;
    switch (command.type) {
      case "create":
        const intake = readMessage(command.message);
        id = createQuote(
          store,
          intake.customer,
          intake.phone,
          intake.message,
        ).id;
        store.quotes.find((q) => q.id === id)!.message = intake.original;
        break;
      case "save":
        saveLines(store, command.id, command.lines, command.revision);
        break;
      case "finalize":
        finalize(store, command.id, command.revision);
        break;
      case "price":
        updatePrice(store, command.sku, command.priceCents);
        break;
      default:
        throw new Error("Acción desconocida.");
    }
    revalidatePath("/");
    revalidatePath("/cotizacion/[id]", "page");
    return { ok: true, id };
  } catch (e) {
    revalidatePath("/");
    return {
      ok: false,
      error:
        e instanceof Error
          ? e.message
          : "No se pudo guardar. Intenta de nuevo.",
    };
  }
}
