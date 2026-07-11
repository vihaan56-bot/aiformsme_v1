import React, { useState, useEffect } from 'react';
import { Sparkles, Megaphone, Copy, Check, RefreshCw, Send, AlertCircle } from 'lucide-react';

export default function SocialMediaStudio({ activeBusiness, userToken, prefillData }) {
  const [offer, setOffer] = useState('');
  const [product, setProduct] = useState('');
  const [discount, setDiscount] = useState('');
  const [audience, setAudience] = useState('');
  const [tone, setTone] = useState('Excited');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [outputs, setOutputs] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  // Prefill hook from Command Center insights
  useEffect(() => {
    if (prefillData) {
      if (prefillData.offer) setOffer(prefillData.offer);
      if (prefillData.product) setProduct(prefillData.product);
    }
  }, [prefillData]);

  const handleGenerateAll = async (e) => {
    e.preventDefault();
    if (!offer.trim() || !product.trim()) return;

    setLoading(true);
    setError('');
    setOutputs(null);

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken || 'session-local-onboard'}`
        },
        body: JSON.stringify({
          taskType: 'SOCIAL_CONTENT',
          businessId: activeBusiness?.id || 'sandbox_biz',
          input: {
            businessName: activeBusiness?.businessName || 'Our Business',
            offer: offer.trim(),
            product: product.trim(),
            discount: discount.trim() || 'None',
            targetAudience: audience.trim() || 'General Local Customers',
            tone: tone
          }
        })
      });

      const data = await response.json();
      if (data.success && data.parsed) {
        setOutputs(data.parsed);
      } else {
        throw new Error(data.message || 'Generation failed.');
      }
    } catch (err) {
      console.error(err);
      setError("We couldn't generate the marketing campaigns right now. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (key, text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="animate-slide-up" style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: '30px', alignItems: 'stretch' }}>
      
      {/* Configuration Form */}
      <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>Social Media Studio</h3>
          <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', marginTop: '4px' }}>
            Draft cross-channel promotional copy for your local business campaigns.
          </p>
        </div>

        {error && (
          <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', color: '#f87171', fontSize: '0.78rem', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleGenerateAll} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))' }}>Promo Offer Name *</label>
            <input
              type="text"
              required
              value={offer}
              onChange={(e) => setOffer(e.target.value)}
              placeholder="e.g. Monsoon Special Treat / Weekend Flash Sale"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                padding: '10px',
                color: 'white',
                fontSize: '0.82rem',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))' }}>Product / Service *</label>
            <input
              type="text"
              required
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              placeholder="e.g. Sourdough Breads / Bridal Makeovers"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                padding: '10px',
                color: 'white',
                fontSize: '0.82rem',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))' }}>Discount / Coupon (Optional)</label>
            <input
              type="text"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              placeholder="e.g. 15% OFF / Buy 1 Get 1 Free"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                padding: '10px',
                color: 'white',
                fontSize: '0.82rem',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))' }}>Target Audience (Optional)</label>
            <input
              type="text"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="e.g. Local neighborhood families / Gym goers"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                padding: '10px',
                color: 'white',
                fontSize: '0.82rem',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))' }}>Outreach Tone</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                padding: '10px',
                color: 'white',
                fontSize: '0.82rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="Excited" style={{ background: '#0a0f1e' }}>🎉 Excited / Catchy</option>
              <option value="Professional" style={{ background: '#0a0f1e' }}>💼 Professional & Elegant</option>
              <option value="Direct" style={{ background: '#0a0f1e' }}>⚡ Urgency / Short</option>
              <option value="Friendly" style={{ background: '#0a0f1e' }}>❤️ Warm & Relatable</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading || !offer.trim() || !product.trim()}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '12px',
              marginTop: '10px',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)',
              border: 'none',
              color: 'white'
            }}
          >
            {loading ? (
              <>
                <RefreshCw size={16} className="animate-spin" style={{ marginRight: '8px' }} />
                Writing copy packages...
              </>
            ) : (
              <>
                Generate Outreach Campaigns <Sparkles size={16} style={{ marginLeft: '6px' }} />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Outputs Display */}
      <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', background: '#070a13', border: '1px solid rgba(255,255,255,0.04)' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Megaphone size={16} style={{ color: 'hsl(var(--secondary-light))' }} />
          Outreach Campaign Materials
        </h4>

        {!outputs ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(var(--text-muted))', fontSize: '0.85rem', fontStyle: 'italic', border: '1px dashed rgba(255,255,255,0.06)', borderRadius: '10px' }}>
            Set parameters on the left and click Generate to produce content.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', flex: 1 }}>
            
            {/* Instagram Card */}
            <div className="glass-panel" style={{ padding: '16px', background: 'rgba(255,255,255,0.01)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#f43f5e' }}>📸 Instagram Copy</span>
                <p style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.4', margin: '8px 0 0 0', whiteSpace: 'pre-wrap' }}>
                  {outputs.instagram}
                </p>
              </div>
              <button 
                onClick={() => handleCopy('ig', outputs.instagram)}
                className="btn-outline" 
                style={{ padding: '6px 12px', fontSize: '0.75rem', alignSelf: 'flex-end', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {copiedKey === 'ig' ? <Check size={12} style={{ color: '#22c55e' }} /> : <Copy size={12} />}
                {copiedKey === 'ig' ? 'Copied' : 'Copy'}
              </button>
            </div>

            {/* WhatsApp Card */}
            <div className="glass-panel" style={{ padding: '16px', background: 'rgba(255,255,255,0.01)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#22c55e' }}>💬 WhatsApp Blast</span>
                <p style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.4', margin: '8px 0 0 0', whiteSpace: 'pre-wrap' }}>
                  {outputs.whatsapp}
                </p>
              </div>
              <button 
                onClick={() => handleCopy('wa', outputs.whatsapp)}
                className="btn-outline" 
                style={{ padding: '6px 12px', fontSize: '0.75rem', alignSelf: 'flex-end', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {copiedKey === 'wa' ? <Check size={12} style={{ color: '#22c55e' }} /> : <Copy size={12} />}
                {copiedKey === 'wa' ? 'Copied' : 'Copy'}
              </button>
            </div>

            {/* Facebook Card */}
            <div className="glass-panel" style={{ padding: '16px', background: 'rgba(255,255,255,0.01)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#3b82f6' }}>👥 Facebook Post</span>
                <p style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.4', margin: '8px 0 0 0', whiteSpace: 'pre-wrap' }}>
                  {outputs.facebook}
                </p>
              </div>
              <button 
                onClick={() => handleCopy('fb', outputs.facebook)}
                className="btn-outline" 
                style={{ padding: '6px 12px', fontSize: '0.75rem', alignSelf: 'flex-end', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {copiedKey === 'fb' ? <Check size={12} style={{ color: '#22c55e' }} /> : <Copy size={12} />}
                {copiedKey === 'fb' ? 'Copied' : 'Copy'}
              </button>
            </div>

            {/* Poster Headline Card */}
            <div className="glass-panel" style={{ padding: '16px', background: 'rgba(255,255,255,0.01)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#eab308' }}>🖼️ Shop Poster Header</span>
                <p style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.4', margin: '8px 0 0 0', fontWeight: 'bold' }}>
                  {outputs.poster}
                </p>
              </div>
              <button 
                onClick={() => handleCopy('poster', outputs.poster)}
                className="btn-outline" 
                style={{ padding: '6px 12px', fontSize: '0.75rem', alignSelf: 'flex-end', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {copiedKey === 'poster' ? <Check size={12} style={{ color: '#22c55e' }} /> : <Copy size={12} />}
                {copiedKey === 'poster' ? 'Copied' : 'Copy'}
              </button>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}
