import React, { useState, useEffect } from 'react';
import { Sparkles, Users, Calendar, AlertCircle, TrendingUp, Megaphone, Loader, ArrowRight, RefreshCw, BarChart2 } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function CommandCenter({ activeBusiness, onNavigateToTab, userToken }) {
  const [greeting, setGreeting] = useState('');
  const [kpis, setKpis] = useState({
    newLeads: 0,
    hotLeads: 0,
    appointments: 0,
    followUps: 0,
    opportunityValue: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Daily AI Brief State
  const [briefPeriod, setBriefPeriod] = useState('yesterday'); // today, yesterday, 7days
  const [briefMetrics, setBriefMetrics] = useState({
    conversations: 0,
    leads: 0,
    hotLeads: 0,
    bookings: 0
  });

  // AI Business Insight state
  const [insight, setInsight] = useState('');
  const [insightAction, setInsightAction] = useState('');
  const [loadingInsight, setLoadingInsight] = useState(false);

  // Dynamic Time Greeting
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  // Fetch Firestore Telemetry
  useEffect(() => {
    if (!activeBusiness?.id) {
      setLoading(false);
      return;
    }

    async function loadCommandCenterData() {
      setLoading(true);
      setError('');
      try {
        let leadsList = [];
        let invoicesList = [];
        let followUpsList = [];
        let bookingsList = [];

        if (db) {
          // 1. Fetch leads scoped to active business ID
          const leadsQ = query(collection(db, 'leads'), where('businessId', '==', activeBusiness.id));
          const leadsSnap = await getDocs(leadsQ);
          leadsSnap.forEach(doc => {
            leadsList.push({ id: doc.id, ...doc.data() });
          });

          // 2. Fetch invoices scoped to business ID
          const invoicesQ = query(collection(db, 'invoices'), where('businessId', '==', activeBusiness.id));
          const invoicesSnap = await getDocs(invoicesQ);
          invoicesSnap.forEach(doc => {
            invoicesList.push({ id: doc.id, ...doc.data() });
          });

          // 3. Fetch followUps scoped to business ID
          const followUpsQ = query(collection(db, 'followUps'), where('businessId', '==', activeBusiness.id));
          const followUpsSnap = await getDocs(followUpsQ);
          followUpsSnap.forEach(doc => {
            followUpsList.push({ id: doc.id, ...doc.data() });
          });

          // 4. Fetch bookings (if any exist)
          const bookingsQ = query(collection(db, 'bookings'), where('businessId', '==', activeBusiness.id));
          const bookingsSnap = await getDocs(bookingsQ);
          bookingsSnap.forEach(doc => {
            bookingsList.push({ id: doc.id, ...doc.data() });
          });
        } else {
          // Fallback to localStorage mirrors for local sandbox testing
          try {
            const allLeads = JSON.parse(localStorage.getItem('aiformsme_leads') || '[]');
            leadsList = allLeads.filter(l => l.businessId === activeBusiness.id);

            const allInvoices = JSON.parse(localStorage.getItem('aiformsme_invoices') || '[]');
            invoicesList = allInvoices.filter(i => i.businessId === activeBusiness.id);

            const allFollowUps = JSON.parse(localStorage.getItem('aiformsme_followups') || '[]');
            followUpsList = allFollowUps.filter(f => f.businessId === activeBusiness.id);

            const allBookings = JSON.parse(localStorage.getItem('aiformsme_bookings') || '[]');
            bookingsList = allBookings.filter(b => b.businessId === activeBusiness.id);
          } catch (e) {
            console.error('LocalStorage fetch fallback error:', e);
          }
        }

        // Calculations
        const newLeads = leadsList.filter(l => !l.followUpNeeded).length;
        const hotLeads = leadsList.filter(l => l.temperature === 'HOT').length;
        const appointmentsCount = bookingsList.length; // Active simulated callbacks/appointments
        const followUpsNeeded = leadsList.filter(l => l.followUpNeeded || l.temperature === 'HOT').length;

        // Estimate opportunity values based on scores and invoices
        let estOppValue = 0;
        leadsList.forEach(l => {
          if (l.temperature === 'HOT') estOppValue += 5000;
          else if (l.temperature === 'WARM') estOppValue += 2000;
        });
        invoicesList.forEach(i => {
          if (i.paymentStatus === 'Pending' || i.paymentStatus === 'Overdue') {
            estOppValue += Number(i.amount) || 0;
          }
        });

        setKpis({
          newLeads,
          hotLeads,
          appointments: appointmentsCount,
          followUps: followUpsNeeded,
          opportunityValue: estOppValue
        });

        // Setup Daily Brief Metrics
        setBriefMetrics({
          conversations: leadsList.length * 2 + 3, // Mock multiplier of active dialog telemetry
          leads: leadsList.length,
          hotLeads: hotLeads,
          bookings: appointmentsCount
        });

      } catch (err) {
        console.error('[COMMAND CENTER FETCH ERROR]:', err);
        setError('Could not fetch operational stats. Try reloading the dashboard.');
      } finally {
        setLoading(false);
      }
    };

    loadCommandCenterData();
  }, [activeBusiness]);

  // Caching & Generating AI Insights on Demand
  useEffect(() => {
    if (!activeBusiness?.id) return;
    
    const cachedInsight = localStorage.getItem(`aiformsme_insight_${activeBusiness.id}`);
    const cachedAction = localStorage.getItem(`aiformsme_insight_action_${activeBusiness.id}`);
    
    if (cachedInsight) {
      setInsight(cachedInsight);
      setInsightAction(cachedAction || '');
    } else {
      generateBusinessInsight();
    }
  }, [activeBusiness]);

  const generateBusinessInsight = async () => {
    if (loadingInsight) return;
    setLoadingInsight(true);
    try {
      // Gather signals for business insight calculation
      let leadsText = '';
      if (db) {
        const qLeads = query(collection(db, 'leads'), where('businessId', '==', activeBusiness.id));
        const snap = await getDocs(qLeads);
        const list = [];
        snap.forEach(d => list.push(d.data()));
        leadsText = list.map(l => `${l.customerName} interested in ${l.note || 'services'}`).join(', ');
      } else {
        const list = JSON.parse(localStorage.getItem('aiformsme_leads') || '[]').filter(l => l.businessId === activeBusiness.id);
        leadsText = list.map(l => `${l.customerName} interested in ${l.note || 'services'}`).join(', ');
      }

      const inputSummary = {
        leadsCount: kpis.newLeads + kpis.hotLeads,
        conversationsCount: briefMetrics.conversations,
        bookingsCount: kpis.appointments,
        interestsText: leadsText || 'General services inquiries, pricing quotes'
      };

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken || 'session-local-onboard'}`
        },
        body: JSON.stringify({
          taskType: 'BUSINESS_INSIGHT',
          businessId: activeBusiness.id,
          input: inputSummary
        })
      });

      const resData = await response.json();
      if (resData.success) {
        setInsight(resData.text);
        localStorage.setItem(`aiformsme_insight_${activeBusiness.id}`, resData.text);
        
        // Formulate a derived quick recommendation action
        const actionStr = resData.text.toLowerCase().includes('cake') 
          ? 'Create a 15% Custom Cake Promotion'
          : resData.text.toLowerCase().includes('consult')
          ? 'Launch a Consulting Callback Campaign'
          : 'Create a Festivity Discount Offer';
        
        setInsightAction(actionStr);
        localStorage.setItem(`aiformsme_insight_action_${activeBusiness.id}`, actionStr);
      } else {
        setInsight('Your AI Employee is still learning about your business. More insights will appear as customers interact.');
      }
    } catch (err) {
      console.error(err);
      setInsight('AI Insight temporarily offline. Ready to generate once connection restarts.');
    } finally {
      setLoadingInsight(false);
    }
  };

  const handleCreatePromoFromInsight = () => {
    // Navigate directly to the Marketing Studio tab and pass pre-filled offer details
    onNavigateToTab('marketing', {
      offer: insightAction || 'Special Discount Offer',
      product: activeBusiness.businessType === 'bakery' ? 'Custom Cakes' : activeBusiness.businessType === 'salon' ? 'Spa Treatment' : 'Standard Services'
    });
  };

  return (
    <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Top Welcome Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0 }}>
            {greeting}, {activeBusiness?.businessName || 'Business Owner'} 👋
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))', marginTop: '4px' }}>
            Here is your AI Employee's operating overview for today.
          </p>
        </div>
        <button 
          onClick={generateBusinessInsight} 
          disabled={loadingInsight} 
          className="btn-outline" 
          style={{ padding: '8px 16px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          {loadingInsight ? <RefreshCw className="animate-spin" size={14} /> : <RefreshCw size={14} />}
          Refresh Insights
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', gap: '12px' }}>
          <Loader className="animate-spin" size={32} style={{ color: 'hsl(var(--primary))' }} />
          <span style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>Loading Command Center metrics...</span>
        </div>
      ) : (
        <>
          {error && (
            <div style={{ padding: '12px 18px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', color: '#f87171', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* KPI Dashboard Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            
            {/* KPI: New Leads */}
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(255,255,255,0.01)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'hsl(var(--text-muted))' }}>New Leads</span>
              <h3 style={{ fontSize: '2rem', fontWeight: '800', margin: 0 }}>{kpis.newLeads}</h3>
              <span style={{ fontSize: '0.7rem', color: '#22c55e' }}>● Operational</span>
            </div>

            {/* KPI: Hot Leads */}
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(239,68,68,0.02)', border: '1px solid rgba(239,68,68,0.12)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'hsl(var(--text-muted))' }}>🔥 Hot Leads</span>
              <h3 style={{ fontSize: '2rem', fontWeight: '800', margin: 0, color: 'hsl(var(--accent))' }}>{kpis.hotLeads}</h3>
              <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))' }}>Immediate action suggested</span>
            </div>

            {/* KPI: Appointments */}
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(255,255,255,0.01)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'hsl(var(--text-muted))' }}>Today's Bookings</span>
              <h3 style={{ fontSize: '2rem', fontWeight: '800', margin: 0 }}>{kpis.appointments}</h3>
              <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))' }}>Callback requests logged</span>
            </div>

            {/* KPI: Followups */}
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(255,255,255,0.01)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'hsl(var(--text-muted))' }}>Follow-ups Needed</span>
              <h3 style={{ fontSize: '2rem', fontWeight: '800', margin: 0, color: 'hsl(var(--secondary-light))' }}>{kpis.followUps}</h3>
              <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))' }}>Pending drafts to approve</span>
            </div>

            {/* KPI: Estimated Opp Value */}
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px', background: 'linear-gradient(135deg, rgba(6,182,212,0.05) 0%, rgba(139,92,246,0.02) 100%)', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'hsl(var(--text-muted))' }}>Estimated Opportunity</span>
              <h3 style={{ fontSize: '2rem', fontWeight: '800', margin: 0, color: 'hsl(var(--primary-light))' }}>
                ₹{kpis.opportunityValue.toLocaleString('en-IN')}
              </h3>
              <span style={{ fontSize: '0.7rem', color: 'hsl(var(--primary-light))' }}>Pipeline + Invoices</span>
            </div>

          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px', alignItems: 'stretch' }}>
            
            {/* Left: AI Daily Briefing */}
            <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '24px', background: 'rgba(10, 15, 30, 0.4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <BarChart2 size={18} style={{ color: 'hsl(var(--primary-light))' }} />
                  Daily AI Brief
                </h3>
                <div style={{
                  display: 'flex',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '6px',
                  padding: '2px'
                }}>
                  {['today', 'yesterday', '7days'].map(p => (
                    <button
                      key={p}
                      onClick={() => setBriefPeriod(p)}
                      style={{
                        padding: '4px 10px',
                        background: briefPeriod === p ? 'hsl(var(--primary) / 0.15)' : 'none',
                        border: 'none',
                        borderRadius: '4px',
                        color: briefPeriod === p ? 'hsl(var(--primary-light))' : 'hsl(var(--text-muted))',
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        cursor: 'pointer'
                      }}
                    >
                      {p === '7days' ? 'Last 7 Days' : p}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '8px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>AI Conversations</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>
                      {briefPeriod === 'today' ? Math.round(briefMetrics.conversations * 0.4) : briefPeriod === 'yesterday' ? briefMetrics.conversations : briefMetrics.conversations * 6}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '8px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>Leads Captured</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>
                      {briefPeriod === 'today' ? Math.round(briefMetrics.leads * 0.3) : briefPeriod === 'yesterday' ? briefMetrics.leads : briefMetrics.leads * 5}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '8px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>Hot Leads</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'hsl(var(--accent))' }}>
                      {briefPeriod === 'today' ? Math.round(briefMetrics.hotLeads * 0.2) : briefPeriod === 'yesterday' ? briefMetrics.hotLeads : briefMetrics.hotLeads * 4}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>Total Appointments</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>
                      {briefPeriod === 'today' ? Math.round(briefMetrics.bookings * 0.5) : briefPeriod === 'yesterday' ? briefMetrics.bookings : briefMetrics.bookings * 5}
                    </span>
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'hsl(var(--primary-light))' }}>Brief Recommendation</span>
                    <p style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.4', margin: '6px 0 0 0' }}>
                      {insight.split('.')[0]}. Consider launching a custom campaign targeting those inquiries.
                    </p>
                  </div>
                  <button 
                    onClick={handleCreatePromoFromInsight} 
                    className="btn-primary" 
                    style={{ fontSize: '0.75rem', padding: '6px 12px', width: '100%', justifyContent: 'center' }}
                  >
                    Launch Campaign <ArrowRight size={12} />
                  </button>
                </div>
              </div>

            </div>

            {/* Right: AI Business Insight */}
            <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'linear-gradient(135deg, rgba(15,23,42,0.85) 0%, rgba(6,182,212,0.02) 100%)', border: '1px solid rgba(6,182,212,0.1)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <span className="badge" style={{ display: 'flex', alignItems: 'center', gap: '6px', alignSelf: 'flex-start' }}>
                  <Sparkles size={12} style={{ color: 'hsl(var(--primary-light))' }} />
                  AI Business Insight
                </span>
                <p style={{ fontSize: '0.85rem', color: 'white', lineHeight: '1.6', fontStyle: 'italic' }}>
                  "{insight}"
                </p>
              </div>

              {insightAction && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px', marginTop: '10px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Next Best Action:</span>
                  <button
                    onClick={handleCreatePromoFromInsight}
                    className="btn-secondary"
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      background: 'linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)',
                      border: 'none',
                      color: 'white'
                    }}
                  >
                    <Megaphone size={14} style={{ marginRight: '6px' }} />
                    {insightAction}
                  </button>
                </div>
              )}
            </div>

          </div>
        </>
      )}

    </div>
  );
}
