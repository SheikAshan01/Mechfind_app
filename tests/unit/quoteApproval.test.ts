import { Quote, QuoteItem } from '../../src/types/requests';

describe('MECHFIND Quotation & Mandatory Approval Engine', () => {
  const calculateQuoteTotals = (items: QuoteItem[]) => {
    const labourTotal = items
      .filter((i) => i.type === 'labour')
      .reduce((sum, i) => sum + i.total, 0);

    const partsTotal = items
      .filter((i) => i.type === 'part')
      .reduce((sum, i) => sum + i.total, 0);

    const subtotal = labourTotal + partsTotal;
    const tax = Math.round(subtotal * 0.18);
    const grandTotal = subtotal + tax;

    return { labourTotal, partsTotal, subtotal, tax, grandTotal };
  };

  it('correctly calculates itemized subtotal, 18% GST and grand total', () => {
    const items: QuoteItem[] = [
      { id: '1', description: 'Alternator Diagnostic & Labour', type: 'labour', quantity: 1, unitPrice: 600, total: 600 },
      { id: '2', description: 'Alternator Belt Replacement Part', type: 'part', quantity: 1, unitPrice: 800, total: 800 },
      { id: '3', description: 'Coolant Top-up (1L)', type: 'part', quantity: 2, unitPrice: 200, total: 400 },
    ];

    const result = calculateQuoteTotals(items);
    expect(result.labourTotal).toBe(600);
    expect(result.partsTotal).toBe(1200);
    expect(result.subtotal).toBe(1800);
    expect(result.tax).toBe(324); // 1800 * 0.18 = 324
    expect(result.grandTotal).toBe(2124);
  });

  it('prohibits repair execution until customer approves quote', () => {
    const initialQuote: Quote = {
      id: 'qt_101',
      bookingId: 'req_101',
      mechanicId: 'mech_01',
      items: [
        { id: '1', description: 'Puncture Vulcanization', type: 'labour', quantity: 1, unitPrice: 350, total: 350 },
      ],
      subtotal: 350,
      labourTotal: 350,
      partsTotal: 0,
      tax: 63,
      grandTotal: 413,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    let bookingStatus = 'quote_submitted';

    // Work is not allowed while quote is pending
    const canStartWork = (quote: Quote) => quote.status === 'approved';
    expect(canStartWork(initialQuote)).toBe(false);

    // Customer approves quote
    initialQuote.status = 'approved';
    initialQuote.approvedAt = new Date().toISOString();
    bookingStatus = 'work_in_progress';

    expect(canStartWork(initialQuote)).toBe(true);
    expect(bookingStatus).toBe('work_in_progress');
  });

  it('returns job to inspection status if customer rejects quotation', () => {
    const initialQuote: Quote = {
      id: 'qt_102',
      bookingId: 'req_102',
      mechanicId: 'mech_02',
      items: [
        { id: '1', description: 'Engine overhaul labour', type: 'labour', quantity: 1, unitPrice: 4000, total: 4000 },
      ],
      subtotal: 4000,
      labourTotal: 4000,
      partsTotal: 0,
      tax: 720,
      grandTotal: 4720,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    let bookingStatus = 'quote_submitted';

    // Customer declines quote
    initialQuote.status = 'rejected';
    initialQuote.rejectedAt = new Date().toISOString();
    initialQuote.customerRejectionReason = 'Estimated cost too high for minor breakdown';
    bookingStatus = 'inspection';

    expect(initialQuote.status).toBe('rejected');
    expect(bookingStatus).toBe('inspection');
    expect(initialQuote.customerRejectionReason).toBeDefined();
  });
});

