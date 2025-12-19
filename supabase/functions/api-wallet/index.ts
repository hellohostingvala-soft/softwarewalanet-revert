import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  jsonResponse,
  errorResponse,
  validateRequired,
  createAuditLog,
} from "../_shared/utils.ts";
import { withAuth, RequestContext } from "../_shared/middleware.ts";

serve(async (req: Request) => {
  const url = new URL(req.url);
  const path = url.pathname.replace("/api/wallet", "");

  // GET /wallet/balance
  if (path === "/balance" && req.method === "GET") {
    return withAuth(req, [], async ({ supabaseAdmin, user }) => {
      const { data: wallet } = await supabaseAdmin
        .from("wallets")
        .select("*")
        .eq("user_id", user.userId)
        .single();

      if (!wallet) {
        // Create wallet if doesn't exist
        const { data: newWallet } = await supabaseAdmin.from("wallets").insert({
          user_id: user.userId,
          balance: 0,
          currency: "INR",
        }).select().single();

        return jsonResponse({
          wallet_id: newWallet.wallet_id,
          balance: 0,
          currency: "INR",
          pending: 0,
        });
      }

      // Get pending transactions
      const { data: pending } = await supabaseAdmin
        .from("transactions")
        .select("amount")
        .eq("wallet_id", wallet.wallet_id)
        .eq("type", "pending");

      const pendingAmount = pending?.reduce((sum: number, t: any) => sum + t.amount, 0) || 0;

      return jsonResponse({
        wallet_id: wallet.wallet_id,
        balance: wallet.balance,
        currency: wallet.currency,
        pending: pendingAmount,
      });
    }, { module: "wallet", action: "balance" });
  }

  // POST /wallet/add
  if (path === "/add" && req.method === "POST") {
    return withAuth(req, ["super_admin", "admin", "finance_manager"], async ({ supabaseAdmin, body, user }) => {
      const validation = validateRequired(body, ["user_id", "amount", "reference"]);
      if (validation) return errorResponse(validation);

      if (body.amount <= 0) return errorResponse("Amount must be positive");

      const { data: wallet } = await supabaseAdmin
        .from("wallets")
        .select("*")
        .eq("user_id", body.user_id)
        .single();

      if (!wallet) return errorResponse("Wallet not found", 404);

      const newBalance = wallet.balance + body.amount;

      await supabaseAdmin
        .from("wallets")
        .update({ balance: newBalance })
        .eq("wallet_id", wallet.wallet_id);

      await supabaseAdmin.from("transactions").insert({
        wallet_id: wallet.wallet_id,
        type: body.type || "credit",
        amount: body.amount,
        reference: body.reference,
        related_user: user.userId,
        related_role: user.role,
      });

      return jsonResponse({
        message: "Funds added",
        new_balance: newBalance,
      });
    }, { module: "wallet", action: "add" });
  }

  // POST /wallet/withdraw
  if (path === "/withdraw" && req.method === "POST") {
    return withAuth(req, [], async ({ supabaseAdmin, body, user }) => {
      const validation = validateRequired(body, ["amount"]);
      if (validation) return errorResponse(validation);

      if (body.amount <= 0) return errorResponse("Amount must be positive");

      const { data: wallet } = await supabaseAdmin
        .from("wallets")
        .select("*")
        .eq("user_id", user.userId)
        .single();

      if (!wallet) return errorResponse("Wallet not found", 404);
      if (wallet.balance < body.amount) return errorResponse("Insufficient balance", 400);

      // Create payout request
      const { data: payout, error } = await supabaseAdmin.from("payout_requests").insert({
        user_id: user.userId,
        amount: body.amount,
        status: "pending",
        payment_method: body.payment_method || "bank_transfer",
      }).select().single();

      if (error) return errorResponse(error.message, 400);

      // Deduct from wallet (hold)
      await supabaseAdmin
        .from("wallets")
        .update({ balance: wallet.balance - body.amount })
        .eq("wallet_id", wallet.wallet_id);

      await supabaseAdmin.from("transactions").insert({
        wallet_id: wallet.wallet_id,
        type: "withdrawal_pending",
        amount: -body.amount,
        reference: `Payout request ${payout.payout_id}`,
        related_user: user.userId,
      });

      return jsonResponse({
        message: "Withdrawal request submitted",
        payout_id: payout.payout_id,
        amount: body.amount,
        status: "pending",
      });
    }, { module: "wallet", action: "withdraw" });
  }

  // POST /wallet/transfer
  if (path === "/transfer" && req.method === "POST") {
    return withAuth(req, ["super_admin", "admin", "finance_manager"], async ({ supabaseAdmin, body, user }) => {
      const validation = validateRequired(body, ["from_user_id", "to_user_id", "amount", "reference"]);
      if (validation) return errorResponse(validation);

      if (body.amount <= 0) return errorResponse("Amount must be positive");

      // Get both wallets
      const { data: fromWallet } = await supabaseAdmin
        .from("wallets")
        .select("*")
        .eq("user_id", body.from_user_id)
        .single();

      const { data: toWallet } = await supabaseAdmin
        .from("wallets")
        .select("*")
        .eq("user_id", body.to_user_id)
        .single();

      if (!fromWallet || !toWallet) return errorResponse("One or both wallets not found", 404);
      if (fromWallet.balance < body.amount) return errorResponse("Insufficient balance in source wallet", 400);

      // Perform transfer
      await supabaseAdmin
        .from("wallets")
        .update({ balance: fromWallet.balance - body.amount })
        .eq("wallet_id", fromWallet.wallet_id);

      await supabaseAdmin
        .from("wallets")
        .update({ balance: toWallet.balance + body.amount })
        .eq("wallet_id", toWallet.wallet_id);

      // Log transactions
      await supabaseAdmin.from("transactions").insert([
        {
          wallet_id: fromWallet.wallet_id,
          type: "transfer_out",
          amount: -body.amount,
          reference: body.reference,
          related_user: body.to_user_id,
        },
        {
          wallet_id: toWallet.wallet_id,
          type: "transfer_in",
          amount: body.amount,
          reference: body.reference,
          related_user: body.from_user_id,
        },
      ]);

      return jsonResponse({
        message: "Transfer completed",
        amount: body.amount,
      });
    }, { module: "wallet", action: "transfer" });
  }

  // GET /wallet/transactions
  if (path === "/transactions" && req.method === "GET") {
    return withAuth(req, [], async ({ supabaseAdmin, user }) => {
      const { data: wallet } = await supabaseAdmin
        .from("wallets")
        .select("wallet_id")
        .eq("user_id", user.userId)
        .single();

      if (!wallet) return jsonResponse({ transactions: [] });

      const urlParams = new URL(req.url);
      const page = parseInt(urlParams.searchParams.get("page") || "1");
      const limit = parseInt(urlParams.searchParams.get("limit") || "50");

      const { data: transactions, count } = await supabaseAdmin
        .from("transactions")
        .select("*", { count: "exact" })
        .eq("wallet_id", wallet.wallet_id)
        .order("timestamp", { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      return jsonResponse({
        transactions: transactions?.map((t: any) => ({
          id: t.transaction_id,
          type: t.type,
          amount: t.amount,
          reference: t.reference,
          timestamp: t.timestamp,
        })) || [],
        pagination: { page, limit, total: count || 0 },
      });
    }, { module: "wallet", action: "transactions" });
  }

  return errorResponse("Not found", 404);
});
