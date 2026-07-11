import React, { useState, useEffect } from 'react';
import { Sparkles, Users, Filter, ArrowUpDown, ChevronRight, MessageSquare, AlertCircle, Plus, Eye, Trash2 } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';

export default function LeadsManager({ activeBusiness, userToken, onLeadUpdate }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all'); // all, hot, warm, cold, followup
  const [sortBy, setSortBy] = useState('score'); // score, date
  const [selectedLead, setSelectedLead] = useState(null);
  const [loadingAIReason, setLoadingAIReason] = useState(false);
  const [aiError, setAiError] = useState('');

  // Local calculation of deterministic lead score & signals
  const calculateLeadScore = (lead) => {
    let score = 0;
    const signals = [];
    const noteLower = (lead.note || '').toLowerCase();

    // Signal 1: Pricing Inquiries (+20)
    if (noteLower.includes('price') || noteLower.includes('pricing') || noteLower.includes('cost') || noteLower.includes('quote') || noteLower.includes('how much')) {
      score += 20;
      signals.push({ type: 'PRICING_ENQUIRY', points: 20 });
    }

    // Signal 2: Availability Inquiries (+20)
    if (noteLower.includes('hour') || noteLower.includes('open') || noteLower.includes('address') || noteLower.includes('when') || noteLower.includes('time')) {
      score += 20;
      signals.push({ type: 'AVAILABILITY_ENQUIRY', points: 20 });
    }

    // Signal 3: Booking Intent / Appointments (+30)
    if (noteLower.includes('book') || noteLower.includes('appoint') || noteLower.includes('schedule') || noteLower.includes('callback') || noteLower.includes('visit') || noteLower.includes('reserve')) {
      score += 30;
      signals.push({ type: 'BOOKING_INTENT', points: 30 });
    }

    // Signal 4: Contact details provided (+15)
    const hasEmail = lead.email && lead.email !== 'N/A' && lead.email.includes('@');
    const hasPhone = lead.phone && lead.phone !== 'N/A' && lead.phone.length >= 7;
    if (hasEmail || hasPhone) {
      score += 15;
      signals.push({ type: 'CONTACT_DETAILS', points: 15 });
    }

    // Signal 5: Engagement (active inquiries) (+15)
    if (noteLower.length > 25) {
      score += 15;
      signals.push({ type: 'ENGAGEMENT', points: 15 });
    }

    // Clamp score
    score = Math.min(100, Math.max(0, score));

    // Temperature mapping
    let temperature = 'COLD';
    if (score >= 75) temperature = 'HOT';
    else if (score >= 40) temperature = 'WARM';

    return { score, temperature, signals };
  };

  // Load Leads Scoped to Business
  const loadLeadsData = async () => {
    if (!activeBusiness?.id) return;
    setLoading(true);
    try {
      let fetchedLeads = [];

      if (db) {
        const q = query(collection(db, 'leads'), where('businessId', '==', activeBusiness.id));
        const snap = await getDocs(q);
        snap.forEach(docSnap => {
          fetchedLeads.push({ id: docSnap.id, ...docSnap.data() });
        });
      } else {
        // Fallback LocalStorage Mirror for offline sandbox testing
        const stored = JSON.parse(localStorage.getItem('aiformsme_leads') || '[]');
        fetchedLeads = stored.filter(l => l.businessId === activeBusiness.id);
      }

      // Compute lead scores and format records
      const scoredLeads = fetchedLeads.map(l => {
        const scoring = calculateLeadScore(l);
        return {
          ...l,
          score: l.score !== undefined ? l.score : scoring.score,
          temperature: l.temperature !== undefined ? l.temperature : scoring.temperature,
          scoringSignals: l.scoringSignals || scoring.signals
        };
      });

      setLeads(scoredLeads);
    } catch (err) {
      console.error('[LEADS ERROR]:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeadsData();
  }, [activeBusiness]);

  // Request AI reasoning summary and recommended next action from secure backend
  const fetchLeadAIReasoning = async (lead) => {
    if (lead.scoringReasons && lead.recommendedAction) {
      setSelectedLead(lead);
      return;
    }

    setLoadingAIReason(true);
    setAiError('');
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken || 'session-local-onboard'}`
        },
        body: JSON.stringify({
          taskType: 'FOLLOW_UP', // Uses follow-up draft engine to generate reasoning context
          businessId: activeBusiness.id,
          input: {
            customerName: lead.name,
            reason: `Analyze lead score of ${lead.score}% (${lead.temperature}). Primary query: ${lead.note}. List 2 primary reasons and a single recommendation.`
          }
        })
      });

      const resData = await response.json();
      if (resData.success) {
        // Parse recommendation and details
        const aiDraftText = resData.text;
        const reasons = [
          lead.score >= 75 ? 'Indicated strong booking/callback intent.' : 'Expressed initial pricing curiosity.',
          lead.phone && lead.phone !== 'N/A' ? 'Left a verified direct telephone contact.' : 'Incomplete contact details left.'
        ];
        const recommendation = aiDraftText.substring(0, 100);

        const updatedLead = {
          ...lead,
          scoringReasons: reasons,
          recommendedAction: recommendation
        };

        // Write reasoning back to Firestore
        if (db) {
          try {
            await updateDoc(doc(db, 'leads', lead.id), {
              scoringReasons: reasons,
              recommendedAction: recommendation
            });
          } catch (dErr) {
            console.error('Failed to update lead document reasoning:', dErr);
          }
        } else {
          try {
            const allLeads = JSON.parse(localStorage.getItem('aiformsme_leads') || '[]');
            const idx = allLeads.findIndex(al => al.id === lead.id || al.date === lead.date);
            if (idx !== -1) {
              allLeads[idx].scoringReasons = reasons;
              allLeads[idx].recommendedAction = recommendation;
              localStorage.setItem('aiformsme_leads', JSON.stringify(allLeads));
            }
          } catch(e){}
        }

        // Mirror in local state
        setLeads(prev => prev.map(pl => pl.id === lead.id ? updatedLead : pl));
        setSelectedLead(updatedLead);
      } else {
        throw new Error('Backend failed to process reasoning.');
      }
    } catch (err) {
      console.error(err);
      setAiError('Failed to generate AI insights for this lead. Showing local analytics reasoning instead.');
      // Local fallback reasoning
      const localFallback = {
        ...lead,
        scoringReasons: [
          lead.score >= 40 ? 'Pricing or availability inquiry detected.' : 'Inquiry details were extremely short.',
          'Saved to CRM database.'
        ],
        recommendedAction: `Contact ${lead.name} to confirm their details and offer scheduling assistance.`
      };
      setSelectedLead(localFallback);
    } finally {
      setLoadingAIReason(false);
    }
  };

  const handleDeleteLead = async (leadId) => {
    if (!confirm('Are you sure you want to delete this lead record?')) return;
    try {
      if (db) {
        await deleteDoc(doc(db, 'leads', leadId));
      } else {
        const stored = JSON.parse(localStorage.getItem('aiformsme_leads') || '[]');
        const updated = stored.filter(l => l.id !== leadId && l.date !== leadId); // match fallback
        localStorage.setItem('aiformsme_leads', JSON.stringify(updated));
      }
      setLeads(prev => prev.filter(l => l.id !== leadId));
      if (selectedLead && (selectedLead.id === leadId || selectedLead.date === leadId)) {
        setSelectedLead(null);
      }
      if (onLeadUpdate) onLeadUpdate();
    } catch (err) {
      console.error(err);
    }
  };

  // Filter & Sort Pipeline
  const processedLeads = leads
    .filter(l => {
      if (filterType === 'hot') return l.temperature === 'HOT';
      if (filterType === 'warm') return l.temperature === 'WARM';
      if (filterType === 'cold') return l.temperature === 'COLD';
      if (filterType === 'followup') return l.followUpNeeded || l.temperature === 'HOT';
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'score') return b.score - a.score;
      return new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt);
    });

  return (
    <div className="animate-slide-up" style={{ display: 'grid', gridTemplateColumns: selectedLead ? '1.1fr 0.9fr' : '1fr', gap: '30px', alignItems: 'stretch' }}>
      
      {/* Leads Table Container */}
      <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>Lead scoring pipeline</h3>
            <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', marginTop: '4px' }}>
              Deterministic scoring and status tracking for customer inquiries.
            </p>
          </div>
          
          {/* Controls */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '4px 8px', gap: '8px' }}>
              <Filter size={14} style={{ color: 'hsl(var(--text-muted))' }} />
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                style={{ background: 'none', border: 'none', color: 'white', fontSize: '0.78rem', outline: 'none', cursor: 'pointer' }}
              >
                <option value="all" style={{ background: '#0a0f1e' }}>All Temperatures</option>
                <option value="hot" style={{ background: '#0a0f1e' }}>🔥 HOT</option>
                <option value="warm" style={{ background: '#0a0f1e' }}>🟡 WARM</option>
                <option value="cold" style={{ background: '#0a0f1e' }}>🔵 COLD</option>
                <option value="followup" style={{ background: '#0a0f1e' }}>Follow-up Suggested</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '4px 8px', gap: '8px' }}>
              <ArrowUpDown size={14} style={{ color: 'hsl(var(--text-muted))' }} />
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ background: 'none', border: 'none', color: 'white', fontSize: '0.78rem', outline: 'none', cursor: 'pointer' }}
              >
                <option value="score" style={{ background: '#0a0f1e' }}>Sort: Score</option>
                <option value="date" style={{ background: '#0a0f1e' }}>Sort: Newest</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>
            <LoaderComponent />
          </div>
        ) : processedLeads.length === 0 ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'hsl(var(--text-muted))', fontStyle: 'italic', fontSize: '0.85rem' }}>
            No leads match the selected filter criteria.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <th style={{ padding: '12px 10px', color: 'hsl(var(--text-muted))' }}>Name</th>
                  <th style={{ padding: '12px 10px', color: 'hsl(var(--text-muted))' }}>Rating Badge</th>
                  <th style={{ padding: '12px 10px', color: 'hsl(var(--text-muted))' }}>Score</th>
                  <th style={{ padding: '12px 10px', color: 'hsl(var(--text-muted))' }}>Primary Inquiry</th>
                  <th style={{ padding: '12px 10px', color: 'hsl(var(--text-muted))', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {processedLeads.map(l => (
                  <tr key={l.id || l.date} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', verticalAlign: 'middle' }}>
                    <td style={{ padding: '14px 10px', fontWeight: '600' }}>{l.name}</td>
                    <td style={{ padding: '14px 10px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        backgroundColor: l.temperature === 'HOT' ? 'rgba(239,68,68,0.1)' : l.temperature === 'WARM' ? 'rgba(234,179,8,0.1)' : 'rgba(59,130,246,0.1)',
                        color: l.temperature === 'HOT' ? '#f87171' : l.temperature === 'WARM' ? '#fde047' : '#60a5fa',
                        border: `1px solid ${l.temperature === 'HOT' ? '#ef444433' : l.temperature === 'WARM' ? '#eab30833' : '#3b82f633'}`
                      }}>
                        {l.temperature === 'HOT' ? '🔥 HOT' : l.temperature === 'WARM' ? '🟡 WARM' : '🔵 COLD'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 10px', fontWeight: '700', color: 'hsl(var(--primary-light))' }}>
                      {l.score}/100
                    </td>
                    <td style={{ padding: '14px 10px', color: 'hsl(var(--text-secondary))', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {l.note}
                    </td>
                    <td style={{ padding: '14px 10px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button 
                          className="btn-outline" 
                          onClick={() => fetchLeadAIReasoning(l)}
                          style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Eye size={12} /> View AI
                        </button>
                        <button 
                          onClick={() => handleDeleteLead(l.id || l.date)}
                          style={{ padding: '4px 8px', border: 'none', background: 'none', color: '#f87171', cursor: 'pointer' }}
                          title="Delete Lead"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Right Column: AI Reasoning Drawer */}
      {selectedLead && (
        <div className="glass-panel animate-slide-up" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '24px', background: '#070a13', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '16px' }}>
            <div>
              <span className="badge" style={{ marginBottom: '8px' }}>Scoring Analytics Report</span>
              <h4 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0 }}>{selectedLead.name}</h4>
              <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Phone: {selectedLead.phone || 'N/A'} | Email: {selectedLead.email || 'N/A'}</span>
            </div>
            <button 
              onClick={() => setSelectedLead(null)}
              style={{ background: 'none', border: 'none', color: 'hsl(var(--text-muted))', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              Close
            </button>
          </div>

          {/* Scored Signals List */}
          <div>
            <h5 style={{ fontSize: '0.85rem', fontWeight: '700', color: 'white', marginBottom: '12px' }}>Deterministic Scoring Signals</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {selectedLead.scoringSignals?.map((sig, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', fontFamily: 'monospace' }}>{sig.type}</span>
                  <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#22c55e' }}>+{sig.points} pts</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Reasoning Summary */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px' }}>
            <h5 style={{ fontSize: '0.85rem', fontWeight: '700', color: 'white', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={14} style={{ color: 'hsl(var(--primary-light))' }} />
              AI Reasoning explanation
            </h5>
            
            {loadingAIReason ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'hsl(var(--text-muted))', fontSize: '0.8rem' }}>
                <LoaderComponent size={14} /> Generating reasoning...
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {aiError && (
                  <span style={{ fontSize: '0.7rem', color: '#fde047' }}>{aiError}</span>
                )}
                <ul style={{ paddingLeft: '18px', margin: 0, display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.4' }}>
                  {selectedLead.scoringReasons?.map((r, idx) => (
                    <li key={idx}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Recommended Next Action */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px' }}>
            <h5 style={{ fontSize: '0.85rem', fontWeight: '700', color: 'white', marginBottom: '8px' }}>Recommended action:</h5>
            <p style={{
              padding: '12px 16px',
              background: 'rgba(6, 182, 212, 0.05)',
              border: '1px solid rgba(6, 182, 212, 0.15)',
              borderRadius: '8px',
              fontSize: '0.8rem',
              color: 'hsl(var(--primary-light))',
              lineHeight: '1.4',
              margin: 0
            }}>
              {selectedLead.recommendedAction || 'No recommendations computed yet. View AI analysis to populate.'}
            </p>
          </div>

        </div>
      )}

    </div>
  );
}

function LoaderComponent({ size = 20 }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .spin-loader { animation: spin 1s linear infinite; }
      `}} />
      <svg className="spin-loader" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
        <circle cx="12" cy="12" r="10" strokeDasharray="30 10" />
      </svg>
    </div>
  );
}
