import React, { useState, useEffect } from 'react';
import { Sparkles, BadgeDollarSign, Calendar, Plus, Eye, Copy, Check, RefreshCw, Send, AlertCircle, Trash2, Loader } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

export default function InvoiceAssistant({ activeBusiness, userToken, onInvoiceChange }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form State
  const [custName, setCustName] = useState('');
  const [invNum, setInvNum] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('Pending');

  // AI Reminder states
  const [actioningId, setActioningId] = useState(null);
  const [reminderTexts, setReminderTexts] = useState({});
  const [copiedId, setCopiedId] = useState(null);

  const loadInvoices = async () => {
    if (!activeBusiness?.id) return;
    setLoading(true);
    try {
      let fetched = [];
      if (db) {
        const q = query(collection(db, 'invoices'), where('businessId', '==', activeBusiness.id));
        const snap = await getDocs(q);
        snap.forEach(d => fetched.push({ id: d.id, ...d.data() }));
      } else {
        const stored = JSON.parse(localStorage.getItem('aiformsme_invoices') || '[]');
        fetched = stored.filter(i => i.businessId === activeBusiness.id);
      }

      // Check for overdue status based on current date
      const today = new Date();
      const updated = fetched.map(inv => {
        let paymentStatus = inv.paymentStatus;
        if (paymentStatus === 'Pending') {
          const due = new Date(inv.dueDate);
          if (due < today) {
            paymentStatus = 'Overdue';
          }
        }
        return {
          ...inv,
          paymentStatus
        };
      });

      setInvoices(updated);
    } catch (err) {
      console.error('[INVOICES LOAD ERROR]:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, [activeBusiness]);

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    if (!custName.trim() || !invNum.trim() || !amount || !dueDate) return;

    const newInvoice = {
      businessId: activeBusiness.id,
      customerName: custName.trim(),
      invoiceNumber: invNum.trim(),
      amount: parseFloat(amount),
      invoiceDate: new Date().toISOString().slice(0, 10),
      dueDate: dueDate,
      paymentStatus: status,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    try {
      if (db) {
        const docRef = await addDoc(collection(db, 'invoices'), newInvoice);
        newInvoice.id = docRef.id;
      } else {
        const stored = JSON.parse(localStorage.getItem('aiformsme_invoices') || '[]');
        newInvoice.id = `inv_${Date.now()}`;
        localStorage.setItem('aiformsme_invoices', JSON.stringify([newInvoice, ...stored]));
      }

      setInvoices(prev => [newInvoice, ...prev]);
      setShowAddForm(false);
      setCustName('');
      setInvNum('');
      setAmount('');
      setDueDate('');
      setStatus('Pending');

      if (onInvoiceChange) onInvoiceChange();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStatus = async (invoice, newStatus) => {
    try {
      if (db) {
        await updateDoc(doc(db, 'invoices', invoice.id), { paymentStatus: newStatus });
      } else {
        const stored = JSON.parse(localStorage.getItem('aiformsme_invoices') || '[]');
        const idx = stored.findIndex(i => i.id === invoice.id);
        if (idx !== -1) {
          stored[idx].paymentStatus = newStatus;
          localStorage.setItem('aiformsme_invoices', JSON.stringify(stored));
        }
      }

      setInvoices(prev => prev.map(i => i.id === invoice.id ? { ...i, paymentStatus: newStatus } : i));
      if (onInvoiceChange) onInvoiceChange();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteInvoice = async (invoiceId) => {
    if (!confirm('Delete this invoice?')) return;
    try {
      if (db) {
        await deleteDoc(doc(db, 'invoices', invoiceId));
      } else {
        const stored = JSON.parse(localStorage.getItem('aiformsme_invoices') || '[]');
        const updated = stored.filter(i => i.id !== invoiceId);
        localStorage.setItem('aiformsme_invoices', JSON.stringify(updated));
      }
      setInvoices(prev => prev.filter(i => i.id !== invoiceId));
      if (onInvoiceChange) onInvoiceChange();
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateReminder = async (invoice) => {
    setActioningId(invoice.id);
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken || 'session-local-onboard'}`
        },
        body: JSON.stringify({
          taskType: 'PAYMENT_REMINDER',
          businessId: activeBusiness.id,
          input: {
            customerName: invoice.customerName,
            invoiceNumber: invoice.invoiceNumber,
            amount: `₹${invoice.amount}`,
            dueDate: invoice.dueDate
          }
        })
      });

      const resData = await response.json();
      if (resData.success) {
        setReminderTexts(prev => ({ ...prev, [invoice.id]: resData.text }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActioningId(null);
    }
  };

  const handleCopyReminder = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenWhatsApp = (text) => {
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Calculate stats
  const totalOverdue = invoices
    .filter(i => i.paymentStatus === 'Overdue')
    .reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Overdue Total Banner */}
      {totalOverdue > 0 && (
        <div style={{
          padding: '20px 24px',
          background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.03) 100%)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          borderRadius: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#ef4444' }}>Outstanding balance overdue</span>
            <h3 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#f87171', margin: '4px 0 0 0' }}>
              ₹{totalOverdue.toLocaleString('en-IN')} Payment Overdue
            </h3>
          </div>
          <span style={{ fontSize: '0.8rem', color: '#f87171', background: 'rgba(239, 68, 68, 0.1)', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold' }}>
            Action required
          </span>
        </div>
      )}

      {/* Title block */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>Invoice tracking</h3>
          <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', marginTop: '4px' }}>
            Track client outstanding balances and draft polite auto-reminders.
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddForm(prev => !prev)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={16} /> {showAddForm ? 'Hide Form' : 'Log Invoice'}
        </button>
      </div>

      {/* Log Invoice Form */}
      {showAddForm && (
        <form onSubmit={handleCreateInvoice} className="glass-panel" style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))' }}>Customer Name</label>
            <input
              type="text"
              required
              value={custName}
              onChange={(e) => setCustName(e.target.value)}
              placeholder="e.g. Rahul Gupta"
              style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '8px 12px', color: 'white', fontSize: '0.82rem' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))' }}>Invoice #</label>
            <input
              type="text"
              required
              value={invNum}
              onChange={(e) => setInvNum(e.target.value)}
              placeholder="e.g. INV-1024"
              style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '8px 12px', color: 'white', fontSize: '0.82rem' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))' }}>Amount (₹)</label>
            <input
              type="number"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 2500"
              style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '8px 12px', color: 'white', fontSize: '0.82rem' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))' }}>Due Date</label>
            <input
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '8px 12px', color: 'white', fontSize: '0.82rem' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))' }}>Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '8px 12px', color: 'white', fontSize: '0.82rem', cursor: 'pointer' }}
            >
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
            </select>
          </div>

          <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-end', justifyContent: 'center', height: '36px' }}>
            Log Invoice
          </button>
        </form>
      )}

      {/* Invoices List */}
      {loading ? (
        <div style={{ padding: '40px 0', textAlign: 'center' }}>
          <Loader className="animate-spin" size={24} style={{ color: 'hsl(var(--primary))' }} />
        </div>
      ) : invoices.length === 0 ? (
        <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', color: 'hsl(var(--text-muted))', fontSize: '0.85rem' }}>
          No invoices registered. Click "Log Invoice" to begin.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {invoices.map(inv => {
            const reminderText = reminderTexts[inv.id];
            const isWorking = actioningId === inv.id;

            return (
              <div key={inv.id} className="glass-panel" style={{ padding: '20px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Invoice Main Line */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: '700', margin: 0 }}>
                      Invoice #{inv.invoiceNumber} — {inv.customerName}
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', display: 'flex', gap: '12px', marginTop: '4px' }}>
                      <span>Due: {inv.dueDate}</span>
                      <span>Amount: <strong>₹{inv.amount.toLocaleString('en-IN')}</strong></span>
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.65rem',
                      fontWeight: '700',
                      backgroundColor: inv.paymentStatus === 'Paid' ? 'rgba(34,197,94,0.1)' : inv.paymentStatus === 'Overdue' ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.04)',
                      color: inv.paymentStatus === 'Paid' ? '#22c55e' : inv.paymentStatus === 'Overdue' ? '#f87171' : 'white',
                      border: `1px solid ${inv.paymentStatus === 'Paid' ? '#22c55e33' : inv.paymentStatus === 'Overdue' ? '#ef444433' : 'rgba(255,255,255,0.08)'}`
                    }}>
                      {inv.paymentStatus}
                    </span>

                    {inv.paymentStatus !== 'Paid' && (
                      <button 
                        onClick={() => handleToggleStatus(inv, 'Paid')}
                        className="btn-outline" 
                        style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                      >
                        Mark Paid
                      </button>
                    )}

                    <button 
                      onClick={() => handleDeleteInvoice(inv.id)}
                      style={{ background: 'none', border: 'none', color: 'rgba(239,68,68,0.6)', cursor: 'pointer' }}
                      title="Delete Invoice"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Overdue AI Reminder box */}
                {inv.paymentStatus === 'Overdue' && (
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.05)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {!reminderText ? (
                      <button 
                        onClick={() => handleGenerateReminder(inv)}
                        disabled={isWorking}
                        className="btn-primary" 
                        style={{ alignSelf: 'flex-start', fontSize: '0.75rem', padding: '6px 12px', background: 'hsl(var(--accent) / 0.1)', color: 'hsl(var(--accent))', border: '1px solid hsl(var(--accent) / 0.3)' }}
                      >
                        {isWorking ? <Loader className="spin-loader" size={12} /> : <Sparkles size={12} style={{ marginRight: '6px' }} />}
                        Generate Polite Reminder
                      </button>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <p style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.4', margin: 0, fontStyle: 'italic' }}>
                          "{reminderText}"
                        </p>
                        <div style={{ display: 'flex', gap: '8px', alignSelf: 'flex-end' }}>
                          <button 
                            onClick={() => handleCopyReminder(inv.id, reminderText)}
                            className="btn-outline" 
                            style={{ padding: '4px 8px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            {copiedId === inv.id ? <Check size={10} style={{ color: '#22c55e' }} /> : <Copy size={10} />}
                            {copiedId === inv.id ? 'Copied' : 'Copy'}
                          </button>
                          <button 
                            onClick={() => handleOpenWhatsApp(reminderText)}
                            className="btn-primary" 
                            style={{ padding: '4px 8px', fontSize: '0.7rem', background: '#22c55e', border: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Send size={10} /> Send WhatsApp
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
