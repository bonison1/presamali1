import { useEffect, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Order } from './types';

interface Props {
  order: Order;
  onClose: () => void;
}

const OrderDetailsModal = ({ order, onClose }: Props) => {
  /* ================= ESC CLOSE ================= */
  useEffect(() => {
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onClose]);

  /* ================= ADDRESS FORMAT ================= */
  const address =
    order.delivery_address
      ? [
          order.delivery_address.address_line_1,
          order.delivery_address.address_line_2,
          order.delivery_address.city,
          order.delivery_address.state,
          order.delivery_address.postal_code,
        ]
          .filter(Boolean)
          .join(', ')
      : '';

  /* ================= PRICE CALC ================= */
  const subTotal = useMemo(
    () =>
      order.order_items.reduce(
        (sum, item) => sum + Number(item.quantity) * Number(item.price),
        0
      ),
    [order]
  );

  const isManipur =
    order.delivery_address?.postal_code?.startsWith('795') ?? false;

  const discount = isManipur ? Math.round(subTotal * 0.1) : 0;
  const deliveryCharge = isManipur ? 80 : 0;

  // ✅ SAFE: does NOT require Order type change
  const handlingFee = Number((order as any).handling_fee || 0);

  const finalTotal = subTotal - discount + deliveryCharge + handlingFee;

  /* ================= PDF ================= */
  const downloadInvoice = () => {
    const doc = new jsPDF('p', 'mm', 'a4');

    const invoiceNo = `INV-${order.id.slice(0, 8).toUpperCase()}`;
    const date = new Date(order.created_at).toLocaleDateString('en-IN');

    /* ---------- HEADER ---------- */
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('Presamali', 14, 18);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('presamli@gmail.com • (+91) 60098 09060', 14, 24);
    doc.text(
      'Address: Singjamei Chingamakha, Imphal, Manipur-795001',
      14,
      29
    );

    doc.text(`Invoice No: ${invoiceNo}`, 140, 18);
    doc.text(`Invoice Date: ${date}`, 140, 24);

    doc.setDrawColor(220);
    doc.line(14, 34, 196, 34);

    /* ---------- CUSTOMER ---------- */
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Billed To', 14, 44);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(order.customer.name, 14, 50);

    if (order.customer.email) doc.text(order.customer.email, 14, 56);
    if (order.customer.phone)
      doc.text(`Phone: ${order.customer.phone}`, 14, 62);

    doc.text(`Address: ${address}`, 14, 68, { maxWidth: 110 });

    /* ---------- ITEMS TABLE ---------- */
    autoTable(doc, {
      startY: 80,
      tableWidth: 160,
      margin: { left: 25 },
      head: [['Item', 'Qty', 'Rate (INR)', 'Amount (INR)']],
      body: order.order_items.map(item => {
        const qty = Number(item.quantity);
        const rate = Number(item.price);
        return [
          item.product?.name || '',
          qty.toString(),
          rate.toFixed(2),
          (qty * rate).toFixed(2),
        ];
      }),
      theme: 'plain',
      styles: { fontSize: 10, cellPadding: 6 },
      headStyles: { fillColor: [245, 247, 250], fontStyle: 'bold' },
    });

    const y = (doc as any).lastAutoTable.finalY + 10;

    /* ---------- TOTAL BOX ---------- */
    doc.rect(120, y, 70, 40);

    doc.setFontSize(10);
    doc.text('Subtotal', 125, y + 8);
    doc.text(subTotal.toFixed(2), 185, y + 8, { align: 'right' });

    if (discount > 0) {
      doc.setTextColor(0, 128, 0);
      doc.text('Manipur Discount (10%)', 125, y + 14);
      doc.text(`-${discount}`, 185, y + 14, { align: 'right' });
      doc.setTextColor(0);
    }

    if (isManipur) {
      doc.text('Delivery Charge', 125, y + 20);
      doc.text(deliveryCharge.toFixed(2), 185, y + 20, { align: 'right' });
    } else {
      doc.setFontSize(9);
      doc.text('Delivery @ ₹120–₹150 / kg', 125, y + 20);
      doc.setFontSize(10);
    }

    doc.text('Handling Fee', 125, y + 26);
    doc.text(handlingFee.toFixed(2), 185, y + 26, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.text('Total Payable', 125, y + 34);
    doc.text(finalTotal.toFixed(2), 185, y + 34, { align: 'right' });

    doc.save(`${invoiceNo}.pdf`);
  };

  /* ================= UI ================= */
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-white rounded-xl shadow-xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-lg font-semibold">
              Order #{order.id.slice(0, 8)}
            </h2>
            <div className="flex gap-4 mt-1 text-sm text-gray-500">
              <span>Status: <b>{order.status}</b></span>
              <span>Shipping: <b>{order.shipping_status}</b></span>
            </div>
          </div>
          <button onClick={onClose}>
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
          {/* CUSTOMER */}
          <section>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Customer Details
            </h3>
            <p className="font-medium">{order.customer.name}</p>
            {order.customer.email && (
              <p className="text-sm text-gray-600">
                {order.customer.email}
              </p>
            )}
            {order.customer.phone && (
              <p className="text-sm">📞 {order.customer.phone}</p>
            )}
            {order.customer.is_guest && (
              <p className="text-xs font-medium text-orange-600">
                Guest Order
              </p>
            )}
          </section>

          {/* ITEMS */}
          <section>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Items</h3>
            <div className="border rounded-lg divide-y">
              {order.order_items.map(item => (
                <div
                  key={item.id}
                  className="flex justify-between px-4 py-3 text-sm"
                >
                  <span>
                    {item.product?.name} × {item.quantity}
                  </span>
                  <span className="font-medium">
                    {(Number(item.quantity) * Number(item.price)).toFixed(2)} INR
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* TOTALS (UI UNCHANGED, VALUES UPDATED) */}
          <section className="border rounded-lg p-4 bg-gray-50 space-y-1">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{subTotal.toFixed(2)} INR</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Manipur Discount (10%)</span>
                <span>-{discount} INR</span>
              </div>
            )}

            {isManipur ? (
              <div className="flex justify-between text-sm">
                <span>Delivery Charge</span>
                <span>{deliveryCharge} INR</span>
              </div>
            ) : (
              <p className="text-xs text-orange-600">
                Extra delivery fee may apply @ ₹120–₹150 per kg
              </p>
            )}

            <div className="flex justify-between text-sm">
              <span>Handling Fee</span>
              <span>{handlingFee} INR</span>
            </div>

            <div className="flex justify-between font-semibold text-base pt-2 border-t">
              <span>Total</span>
              <span>{finalTotal.toFixed(2)} INR</span>
            </div>
          </section>

          {/* ADDRESS */}
          <section>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Delivery Address
            </h3>
            <p className="text-sm text-gray-600">{address}</p>
          </section>

          {/* COURIER */}
          <section>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Courier Information
            </h3>
            {order.courier_name ? (
              <div className="text-sm text-gray-600 space-y-1">
                <p>{order.courier_name}</p>
                <p>{order.courier_contact}</p>
                <p>Tracking ID: {order.tracking_id}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-400">Not assigned</p>
            )}
          </section>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end px-6 py-4 border-t bg-gray-50">
          <Button onClick={downloadInvoice}>
            <Download className="h-4 w-4 mr-2" />
            Download Invoice (PDF)
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
