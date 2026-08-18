import { NextResponse } from "next/server";
import { ServerStorage } from "@/lib/serverStorage";

export async function GET() {
  try {
    const transfers = await ServerStorage.getTransfers();

    return NextResponse.json(
      {
        success: true,
        count: transfers.length,
        transfers,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch transfers" },
      { status: 500 }
    );
  }
}
