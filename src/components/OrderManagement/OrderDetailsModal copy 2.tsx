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
  const handlingFee = Number(order.handling_fee || 0);

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
      headStyles: {
        fillColor: [245, 247, 250],
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 15, halign: 'center' },
        2: { cellWidth: 30, halign: 'right' },
        3: { cellWidth: 35, halign: 'right' },
      },
    });

    const y = (doc as any).lastAutoTable.finalY + 10;

    /* ---------- TOTAL BOX ---------- */
    doc.setDrawColor(220);
    doc.rect(120, y, 70, isManipur ? 40 : 34);

    doc.setFontSize(10);
    doc.text('Subtotal', 125, y + 8);
    doc.text(subTotal.toFixed(2), 185, y + 8, { align: 'right' });

    if (discount > 0) {
      doc.setTextColor(0, 128, 0);
      doc.text('Manipur Discount (10%)', 125, y + 14);
      doc.text(`-${discount.toFixed(2)}`, 185, y + 14, { align: 'right' });
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

    /* ---------- FOOTER ---------- */
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(
      'This is a computer-generated invoice. No signature required.',
      14,
      285
    );

    doc.save(`${invoiceNo}.pdf`);
  };

  /* ================= UI ================= */
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-white rounded-xl shadow-xl"
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

        {/* TOTALS */}
        <div className="p-6 space-y-2 bg-gray-50 border-b">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>{subTotal.toFixed(2)} INR</span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Manipur Discount (10%)</span>
              <span>-{discount.toFixed(2)} INR</span>
            </div>
          )}

          {isManipur ? (
            <div className="flex justify-between text-sm">
              <span>Delivery Charge</span>
              <span>{deliveryCharge.toFixed(2)} INR</span>
            </div>
          ) : (
            <p className="text-xs text-orange-600">
              Extra delivery fee may apply @ ₹120–₹150 per kg
            </p>
          )}

          <div className="flex justify-between text-sm">
            <span>Handling Fee</span>
            <span>{handlingFee.toFixed(2)} INR</span>
          </div>

          <div className="flex justify-between font-semibold text-base pt-2 border-t">
            <span>Total Payable</span>
            <span>{finalTotal.toFixed(2)} INR</span>
          </div>
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
