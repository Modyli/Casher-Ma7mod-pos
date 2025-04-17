import React, { useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function POS() {
  const [barcode, setBarcode] = useState("");
  const [cart, setCart] = useState([]);
  const [scanner, setScanner] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleAddByBarcode = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/products/${barcode}`);
      const product = res.data;
      setCart([...cart, product]);
      setError("");
    } catch (err) {
      setError("Product not found");
    }
    setBarcode("");
  };

  const handleStartScanner = () => {
    if (scanner) return;
    const newScanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
    newScanner.render(
      async (decodedText) => {
        setBarcode(decodedText);
        await handleAddByBarcode();
        newScanner.clear();
        setScanner(null);
      },
      (error) => console.warn(error)
    );
    setScanner(newScanner);
  };

  const handleCheckout = async () => {
    try {
      const total = cart.reduce((sum, item) => sum + item.price, 0);
      await axios.post("http://localhost:5000/api/sales", { items: cart, total });
      setCart([]);
      setSuccess("Sale recorded successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to record sale");
    }
  };

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="p-4 max-w-xl mx-auto space-y-4">
      <Card>
        <CardContent className="space-y-2 p-4">
          <h2 className="text-xl font-bold">Barcode Scanner</h2>
          <Input
            placeholder="Enter barcode manually"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddByBarcode()}
          />
          <Button onClick={handleAddByBarcode}>Add</Button>
          <Button onClick={handleStartScanner}>Scan with Camera</Button>
          {error && <p className="text-red-600">{error}</p>}
          {success && <p className="text-green-600">{success}</p>}
          <div id="reader" className="mt-4" />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h2 className="text-xl font-bold mb-2">Cart</h2>
          {cart.map((item, idx) => (
            <div key={idx} className="flex justify-between border-b py-1">
              <span>{item.name}</span>
              <span>{item.price} LE</span>
            </div>
          ))}
          <div className="flex justify-between font-bold mt-2">
            <span>Total</span>
            <span>{total} LE</span>
          </div>
          <Button className="mt-4 w-full" onClick={handleCheckout} disabled={cart.length === 0}>
            Complete Sale
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
