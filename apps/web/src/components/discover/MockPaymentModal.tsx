import { useState } from "react";
import { X, CreditCard, Send, Landmark, Loader2, CheckCircle2 } from "lucide-react";

interface MockPaymentModalProps {
  open: boolean;
  onClose: () => void;
  surawaliName: string;
  price: number;
  onSuccess: (txnId: string) => void;
}

export function MockPaymentModal({ open, onClose, surawaliName, price, onSuccess }: MockPaymentModalProps) {
  const [method, setMethod] = useState<"card" | "upi" | "netbanking">("card");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [txnId, setTxnId] = useState("");

  // Card Form state
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");

  // UPI Form state
  const [upiId, setUpiId] = useState("");

  // Netbanking State
  const [selectedBank, setSelectedBank] = useState("SBI");

  if (!open) return null;

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic Validation
    if (method === "card") {
      if (!cardNumber || !cardExpiry || !cardCvv || !cardName) {
        alert("Please fill in all card details.");
        return;
      }
    } else if (method === "upi") {
      if (!upiId || !upiId.includes("@")) {
        alert("Please enter a valid UPI ID (e.g., username@bank).");
        return;
      }
    }

    // Sequence loader steps
    setLoading(true);
    setLoadingStep(1);

    setTimeout(() => {
      setLoadingStep(2);
      setTimeout(() => {
        setLoadingStep(3);
        setTimeout(() => {
          const generatedTxnId = `TXN_KS_${Math.floor(100000000 + Math.random() * 900000000)}`;
          setTxnId(generatedTxnId);
          setLoading(false);
          setCompleted(true);
        }, 1200);
      }, 1000);
    }, 800);
  };

  const handleFinish = () => {
    onSuccess(txnId);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/40 backdrop-blur-sm animate-soft-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-md rounded-3xl bg-surface border border-border shadow-lift overflow-hidden my-auto text-foreground animate-rise"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background">
          <div>
            <h3 className="font-semibold text-foreground text-sm">Subscribe to Surāwali</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{surawaliName}</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-surface border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-cat" />
              <div className="text-center">
                <p className="font-semibold text-sm">
                  {loadingStep === 1 && "Initiating secure transaction..."}
                  {loadingStep === 2 && "Verifying mock payment gateway..."}
                  {loadingStep === 3 && "Finalizing subscription records..."}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Please do not close this window or refresh.</p>
              </div>
            </div>
          ) : completed ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <CheckCircle2 className="h-14 w-14 text-green-500 animate-pulse" />
              <div className="text-center space-y-1">
                <p className="font-semibold text-lg">Payment Successful</p>
                <p className="text-xs text-muted-foreground">Mock transaction completed successfully.</p>
                <p className="text-[11px] bg-secondary px-3 py-1 rounded-full inline-block font-mono text-muted-foreground mt-2 border border-border">
                  ID: {txnId}
                </p>
              </div>
              <button
                onClick={handleFinish}
                className="press w-full min-h-11 rounded-btn bg-cat text-cat-foreground font-semibold text-sm hover:brightness-105 mt-4"
              >
                Go to Library
              </button>
            </div>
          ) : (
            <form onSubmit={handlePaymentSubmit} className="space-y-5">
              {/* Summary */}
              <div className="rounded-xl bg-secondary border border-border/80 p-4 flex justify-between items-center">
                <div>
                  <span className="text-xs text-muted-foreground font-semibold">Therapeutic Plan</span>
                  <p className="font-bold text-foreground text-sm mt-0.5">Monthly Subscription</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-muted-foreground font-semibold">Total Price</span>
                  <p className="font-display font-bold text-lg text-cat">₹{price}</p>
                </div>
              </div>

              {/* Payment Methods Selector */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setMethod("card")}
                  className={`press py-2 rounded-xl text-xs font-semibold border flex flex-col items-center justify-center gap-1.5 transition-all ${
                    method === "card"
                      ? "border-cat bg-cat-light/30 text-cat"
                      : "border-border bg-background hover:bg-secondary text-muted-foreground"
                  }`}
                >
                  <CreditCard className="h-4 w-4" />
                  <span>Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMethod("upi")}
                  className={`press py-2 rounded-xl text-xs font-semibold border flex flex-col items-center justify-center gap-1.5 transition-all ${
                    method === "upi"
                      ? "border-cat bg-cat-light/30 text-cat"
                      : "border-border bg-background hover:bg-secondary text-muted-foreground"
                  }`}
                >
                  <Send className="h-4 w-4" />
                  <span>UPI</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMethod("netbanking")}
                  className={`press py-2 rounded-xl text-xs font-semibold border flex flex-col items-center justify-center gap-1.5 transition-all ${
                    method === "netbanking"
                      ? "border-cat bg-cat-light/30 text-cat"
                      : "border-border bg-background hover:bg-secondary text-muted-foreground"
                  }`}
                >
                  <Landmark className="h-4 w-4" />
                  <span>Net Banking</span>
                </button>
              </div>

              {/* Payment Form Fields */}
              <div className="pt-2">
                {method === "card" && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16))}
                        placeholder="1111 2222 3333 4444"
                        className="w-full min-h-10 px-3 rounded-btn border border-border bg-background text-sm outline-none focus-visible:border-cat"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">Expiry Date</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value.slice(0, 5))}
                          placeholder="MM/YY"
                          className="w-full min-h-10 px-3 rounded-btn border border-border bg-background text-sm outline-none focus-visible:border-cat"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">CVV</label>
                        <input
                          type="password"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                          placeholder="***"
                          className="w-full min-h-10 px-3 rounded-btn border border-border bg-background text-sm outline-none focus-visible:border-cat"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">Cardholder Name</label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full min-h-10 px-3 rounded-btn border border-border bg-background text-sm outline-none focus-visible:border-cat"
                      />
                    </div>
                  </div>
                )}

                {method === "upi" && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">UPI ID</label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="username@okaxis"
                        className="w-full min-h-10 px-3 rounded-btn border border-border bg-background text-sm outline-none focus-visible:border-cat"
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-normal">
                      A mock payment request will be sent to this virtual payment address. Confirm using any UPI app.
                    </p>
                  </div>
                )}

                {method === "netbanking" && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">Select Bank</label>
                      <select
                        value={selectedBank}
                        onChange={(e) => setSelectedBank(e.target.value)}
                        className="w-full min-h-10 px-3 rounded-btn border border-border bg-background text-sm outline-none focus-visible:border-cat"
                      >
                        <option value="SBI">State Bank of India (SBI)</option>
                        <option value="HDFC">HDFC Bank</option>
                        <option value="ICICI">ICICI Bank</option>
                        <option value="Axis">Axis Bank</option>
                        <option value="Kotak">Kotak Mahindra Bank</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="press w-full min-h-11 rounded-btn bg-cat text-cat-foreground font-semibold text-sm hover:brightness-105 mt-2 flex items-center justify-center gap-1.5"
              >
                <span>Process Payment</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
