import React from 'react';
import { LayoutDashboard, MessageSquare, PhoneCall, Award, Users, ArrowUpRight } from 'lucide-react';

export default function Dashboard({ leadsCount }) {
  // Weekly analytics mock
  const weeklyAnalytics = [
    { day: 'Mon', count: 12 },
    { day: 'Tue', count: 18 },
    { day: 'Wed', count: 24 },
    { day: 'Thu', count: 32 },
    { day: 'Fri', count: 42 },
    { day: 'Sat', count: 15 },
    { day: 'Sun', count: 10 }
  ];

  const maxVal = Math.max(...weeklyAnalytics.map(d => d.count));
  const [sitesCount, setSitesCount] = React.useState(0);

  React.useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('aiformsme_websites') || '{}');
      setSitesCount(Object.keys(stored).length);
    } catch(e){}
  }, []);

  return (
    <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Visual Header */}
      <div>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>AIForMSME Client Dashboard</h3>
        <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>Real-time telemetry and operation statistics for your business.</p>
      </div>

      {/* Stats Counter Rows */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px'
      }}>
        
        {/* Chats stat */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'rgba(139, 92, 246, 0.1)',
            color: 'hsl(var(--primary-light))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <MessageSquare size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', textTransform: 'uppercase', fontWeight: '700' }}>Active Chats Today</span>
            <h3 style={{ fontSize: '1.6rem', marginTop: '2px' }}>{42 + (leadsCount > 2 ? leadsCount - 2 : 0)}</h3>
          </div>
        </div>

        {/* Leads stat */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'rgba(6, 182, 212, 0.1)',
            color: 'hsl(var(--secondary-light))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Users size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', textTransform: 'uppercase', fontWeight: '700' }}>Captured Leads</span>
            <h3 style={{ fontSize: '1.6rem', marginTop: '2px', color: 'hsl(var(--secondary-light))' }}>{leadsCount}</h3>
          </div>
        </div>

        {/* Launched Websites stat */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'rgba(34, 197, 94, 0.1)',
            color: '#22c55e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Award size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', textTransform: 'uppercase', fontWeight: '700' }}>Launched AI Websites</span>
            <h3 style={{ fontSize: '1.6rem', marginTop: '2px', color: '#22c55e' }}>{sitesCount}</h3>
          </div>
        </div>

      </div>

      {/* Full-width chart */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h4 style={{ fontSize: '0.95rem', color: 'white', marginBottom: '24px' }}>Weekly Inbound Chat Traffic</h4>
        
        <div style={{ 
          height: '180px', 
          display: 'flex', 
          alignItems: 'flex-end', 
          justifyContent: 'space-between',
          padding: '0 10px',
          borderBottom: '1px solid rgba(255,255,255,0.06)'
        }}>
          {weeklyAnalytics.map((item, idx) => {
            const heightPct = (item.count / maxVal) * 100;
            return (
              <div key={idx} style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                gap: '8px',
                width: '32px'
              }}>
                {/* Bar */}
                <div style={{
                  width: '100%',
                  height: `${heightPct * 1.2}px`,
                  background: 'linear-gradient(180deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.2) 100%)',
                  borderRadius: '4px 4px 0 0',
                  boxShadow: '0 0 10px hsl(var(--primary) / 0.15)',
                  transition: 'height 0.5s ease-out'
                }} />
                {/* Label */}
                <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', marginBottom: '-20px' }}>{item.day}</span>
              </div>
            );
          })}
        </div>
        
        <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>
          <span>Traffic peak: <strong>{maxVal} chats/day</strong></span>
          <span>Average response rate: <strong>100%</strong></span>
        </div>
      </div>

    </div>
  );
}
