"use client";

import React, { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define wallet addresses for different cryptocurrencies
const WALLETS: {
  BTC: string;
  ETH: string;
  USDT: string;
  [key: string]: string;
} = {
  BTC: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
  ETH: "0x1234567890abcdef1234567890abcdef12345678",
  USDT: "T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb",
};

const CryptoDeposit = () => {
  const userId = "123";
  const [currency, setCurrency] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCurrencyChange = (value: string) => {
    setCurrency(value);
    setError(""); // Clear any previous errors
  };

  const handleAmountChange = (e: any) => setAmount(e.target.value);

  const copyAddress = () => {
    if (!currency) return;

    const walletAddress = WALLETS[currency as keyof typeof WALLETS];
    navigator.clipboard.writeText(walletAddress);
    toast.success("Address copied to clipboard!");
  };

  const handleDeposit = async () => {
    if (!currency || !amount) {
      setError("Please select a currency and enter an amount.");
      return;
    }

    setStatus("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5001/api/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          walletAddress: WALLETS[currency], // Use the selected currency's wallet address
          amount: parseFloat(amount),
          currency,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus(data.message);
      } else {
        setError(
          data.message || "An error occurred while processing your deposit."
        );
      }
    } catch (error) {
      setError("An error occurred while processing your deposit.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-gray-100 max-w-3xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Crypto Deposit</h2>

      <Select onValueChange={handleCurrencyChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select cryptocurrency" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
          <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
          <SelectItem value="USDT">Tether (USDT)</SelectItem>
        </SelectContent>
      </Select>

      <Input
        type="number"
        placeholder="Enter amount"
        value={amount}
        onChange={handleAmountChange}
      />

      {/* Conditionally show the wallet address only after a coin is selected */}
      {currency && (
        <>
          <div className="flex items-center space-x-2">
            <Input
              type="text"
              value={WALLETS[currency]} // Show the wallet address for the selected coin
              readOnly
              className="flex-grow"
            />
            <Button onClick={copyAddress}>Copy</Button>
          </div>

          <p className="text-sm text-gray-600">
            Copy the address above and transfer the exact amount to the wallet,
            then click &quot;Complete Deposit&quot;.
          </p>
        </>
      )}

      <Button disabled={loading} onClick={handleDeposit}>
        {loading ? "Loading..." : "Complete Deposit"}
      </Button>

      {status && (
        <Alert>
          <AlertDescription>{status}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default CryptoDeposit;
