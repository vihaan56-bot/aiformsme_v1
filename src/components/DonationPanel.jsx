import React, { useState } from 'react';
import { Heart, DollarSign, Check, Gift, Sparkles, MessageSquare } from 'lucide-react';
import { db, isFirebaseConfigured } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function DonationPanel() {
  const [selectedAmount, setSelectedAmount] = useState(500); // Default ₹500
  const [customAmount, setCustomAmount] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [donorForm, setDonorForm] = useState({ name: '', email: '', phone: '' });
  const [processing, setProcessing] = useState(false);
  const [donationSuccess, setDonationSuccess] = useState(null);

  const presets = [
    { value: 250, label: '₹250', desc: 'Fund 1 week of tokens' },
    { value: 500, label: '₹500', desc: 'Host a vendor website' },
    { value: 1000, label: '₹1,000', desc: 'Train 5 small business owners' },
  ];

  const getFinalAmount = () => {
    if (selectedAmount === 'custom') {
      const parsed = parseInt(customAmount, 10);
      return isNaN(parsed) || parsed <= 0 ? 100 : parsed;
    }
    return selectedAmount;
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleDonateSubmit = async (e) => {
    e.preventDefault();
    const finalAmount = getFinalAmount();
    if (!donorForm.name || !donorForm.phone) return;

    setProcessing(true);

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      alert("Failed to load payment gateway libraries. Check your connection.");
      setProcessing(false);
      return;
    }

    try {
      // 1. Create order on Express backend
      const ordRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: finalAmount })
      });
      const orderData = await ordRes.json();

      if (!orderData.success) {
        throw new Error(orderData.message || "Failed to create payment transaction.");
      }

      // 2. Open Razorpay Dialog
      const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SmUWHtuEGpIsUR';
      
      const options = {
        key: keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'AIForMSME Initiative',
        description: 'Contribution to empower small businesses with AI',
        order_id: orderData.simulated ? undefined : orderData.order_id,
        handler: async function (response) {
          // Verify on backend
          const verifyRes = await fetch('/api/payment/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: orderData.order_id,
              razorpay_payment_id: response.razorpay_payment_id || 'pay_simulated',
              razorpay_signature: response.razorpay_signature || 'sig_simulated'
            })
          });
          const verifyData = await verifyRes.json();

          if (verifyData.success) {
            setDonationSuccess(response.razorpay_payment_id || 'pay_simulated');
            
            // Log as Conversion in CRM database
            const donorLead = {
              name: donorForm.name,
              email: donorForm.email || 'N/A',
              phone: donorForm.phone,
              note: `💖 DONATED TO AIForMSME: Contributed ₹${finalAmount}. TxRef: ${response.razorpay_payment_id || 'pay_simulated'}`,
              date: new Date().toISOString().slice(0, 16).replace('T', ' '),
              source: `Platform Donation`
            };

            if (isFirebaseConfigured && db) {
              try {
                await addDoc(collection(db, 'leads'), donorLead);
              } catch (err) {
                console.error(err);
              }
            }

            try {
              const storedLeads = JSON.parse(localStorage.getItem('aiformsme_leads') || '[]');
              localStorage.setItem('aiformsme_leads', JSON.stringify([donorLead, ...storedLeads]));
              window.dispatchEvent(new Event('aiformsme_lead_added'));
            } catch(e){}

            setShowCheckout(false);
            setDonorForm({ name: '', email: '', phone: '' });
          } else {
            alert(`Signature validation failed: ${verifyData.message}`);
          }
          setProcessing(false);
        },
        prefill: {
          name: donorForm.name,
          email: donorForm.email,
          contact: donorForm.phone
        },
        theme: {
          color: '#ec4899'
        }
      };

      if (orderData.simulated) {
        alert(`[DONATION SIMULATOR] Simulated order initiated for ₹${finalAmount}. Opening mock validator...`);
        setTimeout(() => {
          options.handler({
            razorpay_payment_id: `pay_sim_${Math.random().toString(36).substring(7)}`,
            razorpay_signature: `sig_sim_${Math.random().toString(36).substring(7)}`
          });
        }, 1000);
      } else {
        const rzp = new window.Razorpay(options);
        rzp.open();
      }

    } catch (err) {
      console.error(err);
      alert(`Donation checkout failed: ${err.message || err}`);
      setProcessing(false);
    }
  };

  return (
    <section className="section-padding" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '40px',
        alignItems: 'center'
      }}>
        {/* Left Column: Promotion Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <div className="badge" style={{ marginBottom: '14px', background: 'rgba(236,72,153,0.1)', color: 'hsl(var(--accent))', borderColor: 'rgba(236,72,153,0.2)' }}>
              <Heart size={13} style={{ marginRight: '5px' }} /> Support Micro Enterprises
            </div>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>
              Empower Small Businesses with <span className="gradient-text-color">Digital AI Tools</span>
            </h2>
            <p style={{ color: 'hsl(var(--text-secondary))', lineHeight: '1.6', fontSize: '1.05rem' }}>
              Your donations keep MSME chatbot hosting and AI models free and completely open for local street vendors, bakers, and family clinics. Join us in bridging the digital divide!
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(236,72,153,0.1)', color: 'hsl(var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>✓</div>
              <span style={{ fontSize: '0.9rem', color: 'hsl(var(--text-muted))' }}>100% of funds go towards OpenRouter API token calls.</span>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(236,72,153,0.1)', color: 'hsl(var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>✓</div>
              <span style={{ fontSize: '0.9rem', color: 'hsl(var(--text-muted))' }}>Free automated subdomains and CRM databases for vendors.</span>
            </div>
          </div>
        </div>

        {/* Right Column: Checkout Card */}
        <div className="glass-panel" style={{ padding: '35px', background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.5) 0%, rgba(236, 72, 153, 0.02) 100%)', border: '1px solid rgba(236, 72, 153, 0.2)' }}>
          <h3 style={{ fontSize: '1.4rem', color: 'white', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Heart size={20} style={{ color: 'hsl(var(--accent))' }} /> Choose Support Contribution
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
            {presets.map((p) => (
              <button
                key={p.value}
                onClick={() => setSelectedAmount(p.value)}
                style={{
                  background: selectedAmount === p.value ? 'rgba(236, 72, 153, 0.15)' : 'rgba(255,255,255,0.02)',
                  border: selectedAmount === p.value ? '2px solid hsl(var(--accent))' : '1px solid rgba(255,255,255,0.06)',
                  color: 'white', padding: '16px 12px', borderRadius: '10px', cursor: 'pointer',
                  textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '4px',
                  transition: 'all 0.3s'
                }}
              >
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{p.label}</span>
                <span style={{ fontSize: '0.65rem', color: 'hsl(var(--text-muted))' }}>{p.desc}</span>
              </button>
            ))}
          </div>

          <div style={{ marginBottom: '24px' }}>
            <button
              onClick={() => setSelectedAmount('custom')}
              style={{
                width: '100%',
                background: selectedAmount === 'custom' ? 'rgba(236, 72, 153, 0.15)' : 'rgba(255,255,255,0.02)',
                border: selectedAmount === 'custom' ? '2px solid hsl(var(--accent))' : '1px solid rgba(255,255,255,0.06)',
                color: 'white', padding: '14px', borderRadius: '10px', cursor: 'pointer',
                fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '12px'
              }}
            >
              Custom Contribution Amount
            </button>

            {selectedAmount === 'custom' && (
              <input
                type="number"
                min="10"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="Enter custom amount in ₹ (min ₹10)"
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(236, 72, 153, 0.3)',
                  color: 'white', padding: '12px', borderRadius: '8px', fontSize: '0.9rem'
                }}
              />
            )}
          </div>

          <button
            onClick={() => setShowCheckout(true)}
            className="btn-primary"
            style={{
              width: '100%', padding: '14px', fontSize: '1rem',
              background: 'linear-gradient(135deg, hsl(var(--accent)) 0%, hsl(var(--primary)) 100%)',
              borderColor: 'transparent', color: 'white', borderRadius: '8px', justifyContent: 'center'
            }}
          >
            Support AIForMSME (₹{getFinalAmount()})
          </button>
        </div>
      </div>

      {/* Donor Checkout Dialog overlay */}
      {showCheckout && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(5, 8, 20, 0.85)', backdropFilter: 'blur(10px)',
          zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="glass-panel" style={{
            width: '100%', maxWidth: '460px', padding: '30px', borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(236,72,153,0.04) 100%)',
            border: '1px solid rgba(236, 72, 153, 0.3)', position: 'relative',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
          }}>
            <button 
              onClick={() => setShowCheckout(false)}
              style={{
                position: 'absolute', top: '15px', right: '15px',
                background: 'none', border: 'none', color: 'hsl(var(--text-muted))',
                fontSize: '1.2rem', cursor: 'pointer'
              }}
            >
              ✕
            </button>

            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '50%',
                background: 'rgba(236,72,153,0.1)', color: 'hsl(var(--accent))',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '10px'
              }}>
                <Heart size={20} />
              </div>
              <h3 style={{ fontSize: '1.25rem', color: 'white', fontWeight: 'bold' }}>Thank You for Supporting</h3>
              <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', marginTop: '4px' }}>
                You are contributing: <strong style={{ color: 'hsl(var(--accent))' }}>₹{getFinalAmount()}</strong>
              </p>
            </div>

            <form onSubmit={handleDonateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', fontWeight: 'bold' }}>Your Name *</label>
                <input 
                  type="text" required
                  value={donorForm.name}
                  onChange={(e) => setDonorForm({ ...donorForm, name: e.target.value })}
                  placeholder="e.g. Alok Kumar"
                  style={{
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px', padding: '12px', color: 'white', fontSize: '0.85rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', fontWeight: 'bold' }}>Email Address</label>
                <input 
                  type="email"
                  value={donorForm.email}
                  onChange={(e) => setDonorForm({ ...donorForm, email: e.target.value })}
                  placeholder="e.g. alok@example.com"
                  style={{
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px', padding: '12px', color: 'white', fontSize: '0.85rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', fontWeight: 'bold' }}>Phone Number *</label>
                <input 
                  type="tel" required
                  value={donorForm.phone}
                  onChange={(e) => setDonorForm({ ...donorForm, phone: e.target.value })}
                  placeholder="e.g. 9876543210"
                  style={{
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px', padding: '12px', color: 'white', fontSize: '0.85rem'
                  }}
                />
              </div>

              <button 
                type="submit"
                disabled={processing}
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--accent)) 0%, hsl(var(--primary)) 100%)',
                  border: 'none', color: 'white', fontWeight: 'bold', fontSize: '0.9rem',
                  padding: '14px', borderRadius: '8px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  marginTop: '10px', boxShadow: '0 4px 15px rgba(236, 72, 153, 0.2)'
                }}
              >
                {processing ? 'Connecting Gateway...' : `Donate ₹${getFinalAmount()} via Razorpay`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Success Notification Dialog */}
      {donationSuccess && (
        <div style={{
          position: 'fixed', bottom: '30px', right: '30px',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white', padding: '16px 24px', borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
          display: 'flex', alignItems: 'center', gap: '12px', zIndex: 4000,
        }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex',
            alignItems: 'center', justifyContent: 'center'
          }}>
            ✓
          </div>
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold', margin: 0 }}>Thank You for Donating!</h4>
            <p style={{ fontSize: '0.75rem', opacity: 0.9, marginTop: '2px' }}>TxRef: {donationSuccess}</p>
          </div>
          <button 
            onClick={() => setDonationSuccess(null)}
            style={{
              background: 'none', border: 'none', color: 'white',
              fontSize: '1rem', cursor: 'pointer', marginLeft: '10px'
            }}
          >
            ✕
          </button>
        </div>
      )}
    </section>
  );
}
