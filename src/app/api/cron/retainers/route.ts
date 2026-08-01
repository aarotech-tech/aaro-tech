import { NextResponse } from "next/server";
import { financeService } from "@/modules/finance/services";

export async function GET(req: Request) {
  // In a production app, verify a secret token or header here to ensure only the cron job can trigger this
  try {
    const result = await financeService.processRetainerBilling();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Failed to process retainer billing:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  return GET(req);
}
