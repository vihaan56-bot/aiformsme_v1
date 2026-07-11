import React, { useState, useEffect } from 'react';
import { Sparkles, CheckSquare, MessageSquare, AlertCircle, Phone, ArrowRight, Loader, XCircle, Check } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';

export default function FollowUpAgent({ activeBusiness, userToken }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  // Identify Warm/Hot leads requiring follow-ups
  useEffect(() => {
    if (!activeBusiness?.id) return;

    async function loadFollowUpData() {
      setLoading(true);
      try {
        let leadsList = [];
        let existingFollowups = [];

        if (db) {
          // Fetch leads
          const leadsQ = query(collection(db, 'leads'), where('businessId', '==', activeBusiness.id));
          const snap = await getDocs(leadsQ);
          snap.forEach(d => leadsList.push({ id: d.id, ...d.data() }));

          // Fetch follow-ups
          const followUpsQ = query(collection(db, 'followUps'), where('businessId', '==', activeBusiness.id));
          const fSnap = await getDocs(followUpsQ);
          fSnap.forEach(d => existingFollowups.push(d.data()));
        } else {
          // Fallback localStorage mirror
          leadsList = JSON.parse(localStorage.getItem('aiformsme_leads') || '[]').filter(l => l.businessId === activeBusiness.id);
          existingFollowups = JSON.parse(localStorage.getItem('aiformsme_followups') || '[]').filter(f => f.businessId === activeBusiness.id);
        }

        // Filter leads meeting trigger rules
        const suggestedList = [];
        const todayStr = new Date().toISOString().slice(0, 10);

        for (const lead of leadsList) {
          // Rule 1: Pricing inquiry and no booking/followup within 24h
          const isHot = lead.temperature === 'HOT';
          const isWarm = lead.temperature === 'WARM';

          if (isHot || isWarm) {
            const triggerType = 'PRICING_INQUIRY_NO_BOOKING';
            // Dedupe key checks: businessId + leadId + triggerType + triggerWindow (today)
            const dedupeKey = `${activeBusiness.id}_${lead.id || lead.date}_${triggerType}_${todayStr}`;
            
            const alreadyExists = existingFollowups.some(f => f.dedupeKey === dedupeKey);
            if (alreadyExists) continue;

            // Generate initial mock draft immediately to populate the screen
            const initialDraft = `Hi ${lead.name} 👋 Just checking in to see if you have any questions about our prices at ${activeBusiness.businessName}. We have some slots open this week! 😊`;

            suggestedList.push({
              id: lead.id || lead.date,
              leadId: lead.id || lead.date,
              customerName: lead.name,
              phone: lead.phone || '',
              email: lead.email || '',
              note: lead.note,
              triggerType,
              reason: isHot 
                ? 'High booking intent lead; pricing query left without scheduling.' 
                : 'Customer asked about availability but did not book.',
              aiDraft: initialDraft,
              dedupeKey,
              status: 'suggested'
            });
          }
        }

        setSuggestions(suggestedList);
      } catch (err) {
        console.error('[FOLLOWUP AGENT LOAD ERROR]:', err);
      } finally {
        setLoading(false);
      }
    }

    loadFollowUpData();
  }, [activeBusiness]);

  // Request backend to regenerate draft message
  const handleRegenerateDraft = async (sugg) => {
    setActioningId(sugg.id);
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken || 'session-local-onboard'}`
        },
        body: JSON.stringify({
          taskType: 'FOLLOW_UP',
          businessId: activeBusiness.id,
          input: {
            customerName: sugg.customerName,
            reason: `Asked about ${sugg.note}. Draft a warm WhatsApp message invitation.`
          }
        })
      });

      const resData = await response.json();
      if (resData.success) {
        setSuggestions(prev => prev.map(s => s.id === sugg.id ? { ...s, aiDraft: resData.text } : s));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActioningId(null);
    }
  };

  const handleEditStart = (sugg) => {
    setEditingId(sugg.id);
    setEditText(sugg.aiDraft);
  };

  const handleEditSave = (id) => {
    setSuggestions(prev => prev.map(s => s.id === id ? { ...s, aiDraft: editText } : s));
    setEditingId(null);
  };

  const handleApproveAndSend = async (sugg) => {
    setActioningId(sugg.id);
    const finalRecord = {
      businessId: activeBusiness.id,
      leadId: sugg.leadId,
      triggerType: sugg.triggerType,
      reason: sugg.reason,
      aiDraft: sugg.aiDraft,
      status: 'approved',
      dedupeKey: sugg.dedupeKey,
      suggestedAt: new Date(),
      sentAt: new Date()
    };

    try {
      if (db) {
        await addDoc(collection(db, 'followUps'), finalRecord);
      } else {
        const stored = JSON.parse(localStorage.getItem('aiformsme_followups') || '[]');
        localStorage.setItem('aiformsme_followups', JSON.stringify([finalRecord, ...stored]));
      }

      // Remove from active suggestions list
      setSuggestions(prev => prev.filter(s => s.id !== sugg.id));

      // Redirect to WhatsApp Link with encoded pre-filled text
      const cleanPhone = sugg.phone.replace(/[^0-9]/g, '');
      const encodedMsg = encodeURIComponent(sugg.aiDraft);
      const whatsappUrl = cleanPhone 
        ? `https://wa.me/${cleanPhone}?text=${encodedMsg}`
        : `https://wa.me/?text=${encodedMsg}`;
      
      window.open(whatsappUrl, '_blank');
    } catch (err) {
      console.error('Approve and send failed:', err);
    } finally {
      setActioningId(null);
    }
  };

  const handleDismiss = async (sugg) => {
    setActioningId(sugg.id);
    const finalRecord = {
      businessId: activeBusiness.id,
      leadId: sugg.leadId,
      triggerType: sugg.triggerType,
      reason: sugg.reason,
      aiDraft: sugg.aiDraft,
      status: 'dismissed',
      dedupeKey: sugg.dedupeKey,
      suggestedAt: new Date(),
      sentAt: null
    };

    try {
      if (db) {
        await addDoc(collection(db, 'followUps'), finalRecord);
      } else {
        const stored = JSON.parse(localStorage.getItem('aiformsme_followups') || '[]');
        localStorage.setItem('aiformsme_followups', JSON.stringify([finalRecord, ...stored]));
      }

      setSuggestions(prev => prev.filter(s => s.id !== sugg.id));
    } catch (err) {
      console.error(err);
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>AI Follow-up Assistant</h3>
        <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', marginTop: '4px' }}>
          Approve and copy AI-generated follow-up outreach messages for warm/hot leads.
        </p>
      </div>

      {loading ? (
        <div style={{ padding: '40px 0', textAlign: 'center' }}>
          <Loader className="animate-spin" size={24} style={{ color: 'hsl(var(--primary))' }} />
        </div>
      ) : suggestions.length === 0 ? (
        <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', color: 'hsl(var(--text-muted))', fontSize: '0.85rem' }}>
          ☀️ No follow-up recommendations needed today. All active leads are engaged.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {suggestions.map(s => {
            const isEditing = editingId === s.id;
            const isWorking = actioningId === s.id;

            return (
              <div 
                key={s.id} 
                className="glass-panel" 
                style={{
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  borderLeft: '4px solid hsl(var(--primary))',
                  background: 'rgba(255,255,255,0.01)'
                }}
              >
                
                {/* Header Information */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span className="badge badge-cyan" style={{ marginBottom: '6px' }}>AI Follow-up Suggested</span>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: '700', margin: 0 }}>Customer: {s.customerName}</h4>
                    <p style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))', margin: '4px 0 0 0' }}>
                      <strong>Reason:</strong> {s.reason}
                    </p>
                  </div>
                  {s.phone && (
                    <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Phone size={12} /> {s.phone}
                    </span>
                  )}
                </div>

                {/* Draft Content Card */}
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                  {isEditing ? (
                    <textarea 
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      style={{
                        width: '100%',
                        minHeight: '80px',
                        background: 'rgba(15,23,42,0.9)',
                        color: 'white',
                        border: '1px solid hsl(var(--primary))',
                        borderRadius: '6px',
                        padding: '10px',
                        fontSize: '0.82rem',
                        outline: 'none',
                        resize: 'vertical'
                      }}
                    />
                  ) : (
                    <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-primary))', lineHeight: '1.5', margin: 0, fontStyle: 'italic' }}>
                      "{s.aiDraft}"
                    </p>
                  )}
                </div>

                {/* Actions Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  
                  {/* Left edit controls */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {isEditing ? (
                      <>
                        <button 
                          className="btn-primary" 
                          onClick={() => handleEditSave(s.id)}
                          style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Check size={12} /> Save
                        </button>
                        <button 
                          className="btn-outline" 
                          onClick={() => setEditingId(null)}
                          style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          className="btn-outline" 
                          onClick={() => handleEditStart(s)}
                          disabled={isWorking}
                          style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                        >
                          Edit Draft
                        </button>
                        <button 
                          className="btn-outline" 
                          onClick={() => handleRegenerateDraft(s)}
                          disabled={isWorking}
                          style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          {isWorking ? <Loader className="animate-spin" size={12} /> : 'Regenerate'}
                        </button>
                      </>
                    )}
                  </div>

                  {/* Right approve controls */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => handleDismiss(s)}
                      disabled={isWorking}
                      className="btn-outline"
                      style={{ padding: '6px 12px', fontSize: '0.78rem', borderColor: 'rgba(239, 68, 68, 0.2)', color: '#f87171' }}
                    >
                      Dismiss
                    </button>
                    <button 
                      onClick={() => handleApproveAndSend(s)}
                      disabled={isWorking || isEditing}
                      className="btn-primary"
                      style={{
                        padding: '6px 16px',
                        fontSize: '0.78rem',
                        background: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)',
                        border: 'none',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {isWorking ? <Loader className="animate-spin" size={12} /> : <CheckSquare size={14} />}
                      Approve & Send
                    </button>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
