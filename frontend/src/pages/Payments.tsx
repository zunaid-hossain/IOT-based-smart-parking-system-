import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, CircleDollarSign, CreditCard, Download, Smartphone, Wallet } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  usePayments,
  useSessions,
  useActiveSession,
  useCreatePayment,
} from "@/hooks/useParkingData";
import { formatCurrency, formatDateTime } from "@/lib/utils";

const paymentMethods = [
  { id: "bKash", label: "bKash", icon: Smartphone, color: "text-pink-500" },
  { id: "Nagad", label: "Nagad", icon: Smartphone, color: "text-orange-500" },
  { id: "Rocket", label: "Rocket", icon: Smartphone, color: "text-purple-500" },
  { id: "Card", label: "Card", icon: CreditCard, color: "text-brand-blue" },
  { id: "Cash", label: "Cash (Demo)", icon: Wallet, color: "text-success" },
];

export function Payments() {
  const { data: payments, isLoading } = usePayments();
  const activeSession = useActiveSession();
  const createPayment = useCreatePayment();
  const [selectedMethod, setSelectedMethod] = useState("bKash");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const pendingSession = activeSession?.session_status === "payment_pending" ? activeSession : null;
  const dueAmount = pendingSession?.amount ?? 0;

  const handlePay = async () => {
    if (!pendingSession) return;
    setProcessing(true);
    try {
      await createPayment.mutateAsync({
        session_id: pendingSession.id,
        amount: dueAmount,
        payment_method: selectedMethod,
        payment_status: "successful",
        paid_at: new Date().toISOString(),
        transaction_id: `TXN${Date.now()}`,
      });
      setSuccess(true);
      toast.success("Payment successful! Exit gate opening...");
      setTimeout(() => setSuccess(false), 4000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Payment failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Billing & invoices"
        title="Payments"
        description="Manage your parking payments"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total spent"
          value={formatCurrency(payments?.reduce((sum, p) => sum + p.amount, 0) ?? 0)}
          icon={CircleDollarSign}
          tone="blue"
          detail="All time"
          delay={0}
        />
        <StatCard
          label="Pending payment"
          value={pendingSession ? formatCurrency(dueAmount) : "৳ 0"}
          icon={Wallet}
          tone="orange"
          detail={pendingSession ? "1 open session" : "All settled"}
          delay={0.05}
        />
        <StatCard
          label="Transactions"
          value={String(payments?.length ?? 0)}
          icon={CreditCard}
          tone="cyan"
          detail="All payments"
          delay={0.1}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Payment form */}
        <Card className="p-6 lg:col-span-1">
          <h3 className="font-semibold">Pay parking fee</h3>

          {!pendingSession ? (
            <div className="mt-4 flex flex-col items-center gap-3 rounded-xl border border-dashed p-8 text-center">
              <CircleDollarSign size={32} className="text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No pending payment</p>
            </div>
          ) : (
            <>
              <div className="mt-4 rounded-xl bg-accent/50 p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Parking charge</span>
                  <span className="font-medium">{formatCurrency(dueAmount)}</span>
                </div>
                <div className="mt-2 border-t pt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{formatCurrency(dueAmount)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`flex w-full items-center gap-3 rounded-xl border p-3 text-sm font-medium transition-all ${
                      selectedMethod === method.id
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-input hover:border-muted-foreground/50"
                    }`}
                  >
                    <method.icon size={18} className={method.color} />
                    {method.label}
                    {selectedMethod === method.id && (
                      <Check size={16} className="ml-auto text-primary" />
                    )}
                  </button>
                ))}
              </div>

              <Button
                className="mt-4 w-full"
                size="lg"
                onClick={handlePay}
                disabled={processing}
              >
                {processing ? "Processing..." : `Pay ${formatCurrency(dueAmount)}`}
              </Button>
            </>
          )}
        </Card>

        {/* Payment success + transaction history */}
        <div className="lg:col-span-2">
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="mb-6 flex items-center gap-4 rounded-2xl border border-success/30 bg-success/10 p-4"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success text-white">
                  <Check size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-success">Payment successful!</p>
                  <p className="text-sm text-muted-foreground">Exit gate opening automatically...</p>
                </div>
                <Button variant="outline" size="sm">
                  <Download size={14} /> Invoice
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Transaction history</h3>
                <p className="text-sm text-muted-foreground">All parking and reservation payments</p>
              </div>
              <Badge variant="secondary">{payments?.length ?? 0} transactions</Badge>
            </div>

            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 rounded-xl" />
                ))}
              </div>
            ) : payments?.length === 0 ? (
              <div className="flex flex-col items-center gap-2 p-8 text-center">
                <CreditCard size={32} className="text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">No transactions yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs text-muted-foreground">
                      <th className="pb-3 font-medium">Session</th>
                      <th className="pb-3 font-medium">Date</th>
                      <th className="pb-3 font-medium">Method</th>
                      <th className="pb-3 font-medium">Amount</th>
                      <th className="pb-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments?.map((p) => (
                      <tr key={p.id} className="border-b last:border-0">
                        <td className="py-3 font-medium">Session #{p.session_id}</td>
                        <td className="py-3 text-muted-foreground">
                          {p.paid_at ? formatDateTime(p.paid_at) : "Pending"}
                        </td>
                        <td className="py-3">
                          <span className="flex items-center gap-1.5">
                            <Smartphone size={14} className="text-muted-foreground" />
                            {p.payment_method}
                          </span>
                        </td>
                        <td className="py-3 font-medium">{formatCurrency(p.amount)}</td>
                        <td className="py-3">
                          <Badge variant={p.payment_status === "successful" ? "success" : "warning"}>
                            {p.payment_status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}