import React, { useState } from 'react';
import { Sparkles, MessageSquare, Star, Copy, Check, RefreshCw, Send, AlertCircle } from 'lucide-react';

export default function ReviewResponder({ activeBusiness, userToken }) {
  const [customerName, setCustomerName] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [tone, setTone] = useState('Friendly');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [replyText, setReplyText] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerateReply = async (e) => {
    e.preventDefault();
    if (!reviewText.trim()) return;

    setLoading(true);
    setError('');
    setReplyText('');
    setCopied(false);

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken || 'session-local-onboard'}`
        },
        body: JSON.stringify({
          taskType: 'REVIEW_REPLY',
          businessId: activeBusiness?.id || 'sandbox_biz',
          input: {
            customerName: customerName.trim() || 'Customer',
            rating: rating,
            review: reviewText.trim(),
            tone: tone
          }
        })
      });

      const data = await response.json();
      if (data.success) {
        setReplyText(data.text);
      } else {
        throw new Error(data.message || 'Verification or processing failed.');
      }
    } catch (err) {
      console.error(err);
      setError("We couldn't generate the review reply right now. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(replyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTweakTone = (newTone) => {
    setTone(newTone);
    // Auto-trigger regenerate if there is a review text already
    if (reviewText.trim()) {
      setTimeout(() => {
        const formEl = document.getElementById('review-responder-form');
        if (formEl) formEl.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }, 100);
    }
  };

  return (
    <div className="animate-slide-up" style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', gap: '30px', alignItems: 'stretch' }}>
      
      {/* Input panel */}
      <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>Review Responder</h3>
          <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', marginTop: '4px' }}>
            Draft replies to client reviews on Google Business Profile or Facebook pages.
          </p>
        </div>

        {error && (
          <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', color: '#f87171', fontSize: '0.78rem', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}

        <form id="review-responder-form" onSubmit={handleGenerateReply} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))' }}>Customer Name (Optional)</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Amit Sharma"
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
            <label style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))' }}>Star Rating</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    color: star <= rating ? '#eab308' : 'rgba(255,255,255,0.15)',
                    transition: 'color 0.2s'
                  }}
                >
                  <Star size={24} fill={star <= rating ? 'currentColor' : 'none'} />
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))' }}>Review Text *</label>
            <textarea
              required
              rows={4}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Paste the customer's review comments here..."
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                padding: '12px',
                color: 'white',
                fontSize: '0.82rem',
                outline: 'none',
                resize: 'vertical',
                lineHeight: '1.4'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))' }}>Preferred Tone</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              {['Friendly', 'Professional', 'Short'].map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setTone(t)}
                  style={{
                    padding: '8px',
                    background: tone === t ? 'rgba(6,182,212,0.1)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${tone === t ? 'hsl(var(--primary))' : 'rgba(255,255,255,0.06)'}`,
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !reviewText.trim()}
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
                Drafting reply...
              </>
            ) : (
              <>
                Draft AI Response <Send size={14} style={{ marginLeft: '6px' }} />
              </>
            )}
          </button>

        </form>
      </div>

      {/* Output Panel */}
      <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', background: '#070a13', border: '1px solid rgba(255,255,255,0.04)' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageSquare size={16} style={{ color: 'hsl(var(--secondary-light))' }} />
          Drafted Response
        </h4>

        {!replyText ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(var(--text-muted))', fontSize: '0.85rem', fontStyle: 'italic', border: '1px dashed rgba(255,255,255,0.06)', borderRadius: '10px' }}>
            A draft response will be generated here.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', justifySelf: 'stretch', height: '100%', justifyContent: 'space-between', gap: '20px' }}>
            
            <div style={{
              background: 'rgba(255,255,255,0.01)',
              border: '1px solid rgba(255,255,255,0.04)',
              borderRadius: '8px',
              padding: '20px',
              fontSize: '0.88rem',
              color: 'hsl(var(--text-primary))',
              lineHeight: '1.6',
              fontStyle: 'italic'
            }}>
              "{replyText}"
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-outline" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => handleTweakTone('Short')}>
                  Make Shorter
                </button>
                <button className="btn-outline" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => handleTweakTone('Friendly')}>
                  Make Friendlier
                </button>
              </div>

              <button 
                onClick={handleCopy}
                className="btn-primary" 
                style={{ padding: '8px 20px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {copied ? <Check size={14} style={{ color: '#22c55e' }} /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy Reply'}
              </button>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}
