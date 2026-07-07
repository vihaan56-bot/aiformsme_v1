import React, { useState, useEffect } from 'react';
import { Bot, Sparkles, LayoutDashboard, Terminal, BadgeDollarSign, Compass, ArrowRight } from 'lucide-react';
import Hero from './components/Hero';
import ServiceCatalog from './components/ServiceCatalog';
import ChatbotDemo from './components/ChatbotDemo';
import PricingCalculator from './components/PricingCalculator';
import ConsultationWizard from './components/ConsultationWizard';
import Dashboard from './components/Dashboard';
import AuthPortal from './components/AuthPortal';
import FloatingAssistant from './components/FloatingAssistant';
import PromoBanner from './components/PromoBanner';
import GeneratedWebsite from './components/GeneratedWebsite';
import DonationPanel from './components/DonationPanel';
import SEOLandingPage from './components/SEOLandingPage';
import useSEO from './hooks/useSEO';
import { db, isFirebaseConfigured } from './firebase';
import { collection, onSnapshot } from 'firebase/firestore';

export default function App() {
  const [currentTab, setCurrentTab] = useState('home'); // home, demos, pricing, dashboard, wizard, landing
  const [currentSlug, setCurrentSlug] = useState(null); // Custom website slug
  const [landingSlug, setLandingSlug] = useState(null); // SEO Landing page slug
  const [activeDemo, setActiveDemo] = useState('chatbot'); // chatbot, voice, training
  
  // App Shared State to connect components
  const [leadsCount, setLeadsCount] = useState(0); // Starts with 0 leads in production
  const [calls, setCalls] = useState([]);
  const [trainingPassed, setTrainingPassed] = useState(false);

  // Authentication State
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('aiformsme_user') || 'null'));
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Free Trial State
  const [showPromoBanner, setShowPromoBanner] = useState(true);
  const [selectedTrial, setSelectedTrial] = useState(null);

  const handleChooseTrial = (serviceId) => {
    setSelectedTrial(serviceId);
    setCurrentTab('demos');
    setActiveDemo(serviceId);
    
    // Smooth scroll to demo workspace
    setTimeout(() => {
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }, 100);
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('aiformsme_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('aiformsme_user');
  };

  const handleAddLead = (newLead) => {
    setLeadsCount(prev => prev + 1);
  };

  const handleAddCall = (newCall) => {
    setCalls(prev => [newCall, ...prev]);
  };

  const handleCompleteTraining = () => {
    setTrainingPassed(true);
  };

  // Parse path and query parameters to resolve current tab or website slug
  const getRouteFromPath = () => {
    // 1. Check for `page` query parameter (helpful for forwarded domains with masking)
    const params = new URLSearchParams(window.location.search);
    const pageParam = params.get('page');
    if (pageParam && pageParam.trim()) {
      return { tab: null, slug: pageParam.trim(), landingSlug: null };
    }

    // 2. Fall back to pathname check
    const cleanPath = window.location.pathname.replace(/^\//, '').trim();
    if (!cleanPath) return { tab: 'home', slug: null, landingSlug: null };
    
    const validTabs = ['home', 'demos', 'pricing', 'dashboard', 'wizard'];
    const landingPages = [
      'ai-for-small-business',
      'ai-consulting-msme',
      'ai-for-indian-businesses',
      'ai-chatbot-for-business',
      'ai-automation-for-business'
    ];

    if (validTabs.includes(cleanPath)) {
      return { tab: cleanPath, slug: null, landingSlug: null };
    }
    if (landingPages.includes(cleanPath)) {
      return { tab: 'landing', slug: null, landingSlug: cleanPath };
    }
    return { tab: null, slug: cleanPath, landingSlug: null };
  };

  useEffect(() => {
    // Initial path resolution
    const route = getRouteFromPath();
    if (route.slug) {
      setCurrentSlug(route.slug);
      setCurrentTab(null);
      setLandingSlug(null);
    } else if (route.landingSlug) {
      setCurrentTab('landing');
      setLandingSlug(route.landingSlug);
      setCurrentSlug(null);
    } else {
      setCurrentTab(route.tab || 'home');
      setCurrentSlug(null);
      setLandingSlug(null);
    }

    const handlePopState = () => {
      const r = getRouteFromPath();
      if (r.slug) {
        setCurrentSlug(r.slug);
        setCurrentTab(null);
        setLandingSlug(null);
      } else if (r.landingSlug) {
        setCurrentTab('landing');
        setLandingSlug(r.landingSlug);
        setCurrentSlug(null);
      } else {
        setCurrentTab(r.tab || 'home');
        setCurrentSlug(null);
        setLandingSlug(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Listen to Firestore leads count and localStorage fallback
  useEffect(() => {
    const updateLocalLeadsCount = () => {
      try {
        const stored = JSON.parse(localStorage.getItem('aiformsme_leads') || '[]');
        setLeadsCount(stored.length);
      } catch (err) {
        console.error(err);
      }
    };

    updateLocalLeadsCount();

    let unsubscribe = null;
    if (isFirebaseConfigured && db) {
      try {
        const q = collection(db, 'leads');
        unsubscribe = onSnapshot(q, (snapshot) => {
          setLeadsCount(snapshot.size || 0);
        }, (err) => {
          console.error('[FIREBASE LISTENER] Failed:', err);
        });
      } catch (err) {
        console.error(err);
      }
    }

    window.addEventListener('aiformsme_lead_added', updateLocalLeadsCount);

    return () => {
      if (unsubscribe) unsubscribe();
      window.removeEventListener('aiformsme_lead_added', updateLocalLeadsCount);
    };
  }, []);

  // Nav helper using pushState
  const navigateTo = (tab, pageSlug = null) => {
    if (tab === 'landing' && pageSlug) {
      setCurrentTab('landing');
      setLandingSlug(pageSlug);
      setCurrentSlug(null);
      window.history.pushState(null, '', `/${pageSlug}`);
    } else {
      setCurrentTab(tab);
      setCurrentSlug(null);
      setLandingSlug(null);
      const path = tab === 'home' ? '/' : `/${tab}`;
      window.history.pushState(null, '', path);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Direct demo port
  const selectDemo = (demoId) => {
    setCurrentTab('demos');
    setCurrentSlug(null);
    setLandingSlug(null);
    setActiveDemo(demoId);
    window.history.pushState(null, '', '/demos');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Dynamic SEO configurations for main tabs
  const tabSEOConfigs = {
    home: {
      title: 'AI for Small Businesses & MSMEs - Automation & Chatbot Solutions | AIForMSME',
      description: 'AIForMSME provides custom AI chatbots, automation tools, and AI consulting for small businesses and MSMEs. Automate lead generation, customer service, and operations.',
      keywords: 'AI for Small Business, AI for MSMEs, AI Chatbot for Business, AI Automation for Business, AI Consulting for MSMEs, AI for SMEs, AI for Indian Businesses, Business AI Solutions',
      canonicalUrl: 'https://aiformsme.co.in/',
      schema: {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "AIForMSME",
        "url": "https://aiformsme.co.in",
        "logo": "https://aiformsme.co.in/favicon.svg",
        "description": "AIForMSME provides custom chatbot, voice response, and AI training solutions to help Micro, Small, and Medium Enterprises automate operations and grow revenue.",
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "customer support",
          "email": "support@aiformsme.co.in"
        }
      }
    },
    demos: {
      title: 'Interactive AI Sandbox: Chatbot & Website Generator - AIForMSME',
      description: 'Test-drive our custom AI chatbot, automated voice assistant, and live website generator. See how AI chatbot for business can capture leads and automate support.',
      keywords: 'AI Chatbot for Business, AI Automation, Interactive AI Demo, MSME Chatbot, AI Website Generator',
      canonicalUrl: 'https://aiformsme.co.in/demos',
      schema: {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "MSMEChat Interactive Sandbox & Demo",
        "provider": {
          "@type": "Organization",
          "name": "AIForMSME"
        },
        "description": "Test-drive customer engagement chatbots and launch customized business websites in seconds.",
        "areaServed": "IN"
      }
    },
    pricing: {
      title: 'Affordable AI Pricing & ROI Savings Calculator - AIForMSME',
      description: 'Calculate exactly how much your business can save by deploying customized AI solutions. View our transparent subscription pricing for small business automation.',
      keywords: 'AI for Small Business Pricing, Business AI Solutions cost, ROI calculator, MSME cost savings',
      canonicalUrl: 'https://aiformsme.co.in/pricing',
      schema: {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": "AIForMSME Business Automation Solutions",
        "description": "Customized AI chatbot, voice responder, and staff training services for small businesses.",
        "offers": {
          "@type": "AggregateOffer",
          "lowPrice": "3999",
          "priceCurrency": "INR"
        }
      }
    },
    dashboard: {
      title: 'Client Portal & AI Leads Dashboard - AIForMSME',
      description: 'Access your AI-generated leads, conversation transcripts, and integration controls. Track customer inquiries captured by your custom business chatbot.',
      keywords: 'AI Leads Dashboard, MSME client portal, CRM lead tracker',
      canonicalUrl: 'https://aiformsme.co.in/dashboard'
    },
    wizard: {
      title: 'Free AI Readiness Audit & Integration Roadmap - AIForMSME',
      description: 'Take our 1-minute questionnaire to analyze operational bottlenecks and receive a customized AI action plan and integration roadmap for your small business.',
      keywords: 'AI Consulting for MSMEs, AI Readiness Audit, Business automation roadmap',
      canonicalUrl: 'https://aiformsme.co.in/wizard',
      schema: {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "AI Readiness Audit & Consulting Wizard",
        "provider": {
          "@type": "Organization",
          "name": "AIForMSME"
        },
        "description": "Evaluate business bottlenecks and receive an automated roadmap for AI integration.",
        "areaServed": "IN"
      }
    }
  };

  const currentSEO = currentTab && tabSEOConfigs[currentTab] ? tabSEOConfigs[currentTab] : null;
  useSEO(currentSEO || {});

  if (currentSlug) {
    return (
      <GeneratedWebsite 
        slug={currentSlug} 
        onBackToPlatform={() => navigateTo('demos')} 
      />
    );
  }

  return (
    <div className="app-container">
      
      {/* Background Orbs */}
      <div className="bg-glow-container">
        <div className="bg-glow-orb orb-violet" />
        <div className="bg-glow-orb orb-cyan" />
        <div className="bg-glow-orb orb-pink" />
      </div>

      {selectedTrial && (
        <div 
          style={{
            background: 'linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)',
            color: 'white',
            padding: '8px 24px',
            fontSize: '0.8rem',
            fontWeight: '600',
            textAlign: 'center',
            letterSpacing: '0.5px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            zIndex: 100
          }}
        >
          <span>🎉 Active Trial: Your first month of <strong>{selectedTrial === 'chatbot' ? 'MSMEChat Bot' : selectedTrial === 'voice' ? 'MSMEVoice Assistant' : 'MSMETrain Staff Academy'}</strong> is 100% free!</span>
          <button 
            onClick={() => setSelectedTrial(null)} 
            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: '4px', padding: '2px 8px', fontSize: '0.7rem', cursor: 'pointer' }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-logo" onClick={() => navigateTo('home')} style={{ cursor: 'pointer' }}>
          <Sparkles size={24} style={{ color: 'hsl(var(--primary-light))' }} />
          <span>AI<span style={{ color: 'hsl(var(--secondary-light))' }}>ForMSME</span></span>
        </div>

        <ul className="nav-links">
          <li className={`nav-link ${currentTab === 'home' ? 'active' : ''}`} onClick={() => navigateTo('home')}>
            Home
          </li>
          <li className={`nav-link ${currentTab === 'demos' ? 'active' : ''}`} onClick={() => navigateTo('demos')}>
            App Demos
          </li>
          <li className={`nav-link ${currentTab === 'pricing' ? 'active' : ''}`} onClick={() => navigateTo('pricing')}>
            Savings Pricing
          </li>
          <li className={`nav-link ${currentTab === 'dashboard' ? 'active' : ''}`} onClick={() => navigateTo('dashboard')}>
            Portal Dashboard
          </li>
        </ul>

        <div className="nav-cta">
          <button className="btn-secondary" onClick={() => navigateTo('wizard')} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            Get Free Audit
          </button>
          
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div 
                style={{ 
                  fontSize: '0.85rem', 
                  color: 'hsl(var(--secondary-light))', 
                  fontWeight: '600',
                  background: 'rgba(6, 182, 212, 0.08)',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid rgba(6, 182, 212, 0.15)'
                }}
              >
                👤 {user.name}
              </div>
              <button 
                className="btn-outline" 
                onClick={handleLogout} 
                style={{ padding: '6px 12px', fontSize: '0.8rem', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#f87171' }}
              >
                Log Out
              </button>
            </div>
          ) : (
            <button 
              className="btn-primary" 
              onClick={() => setShowAuthModal(true)} 
              style={{ padding: '8px 20px', fontSize: '0.85rem' }}
            >
              Sign In
            </button>
          )}
        </div>
      </nav>

      {/* Main Section Route Switcher */}
      <main className="main-content">
        
        {currentTab === 'home' && (
          <>
            <Hero onNavigate={navigateTo} />
            <ServiceCatalog onSelectDemo={selectDemo} />
            <DonationPanel />
          </>
        )}

        {currentTab === 'demos' && (
          <section className="section-padding">
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <div className="badge" style={{ marginBottom: '12px' }}>Interactive Sandbox</div>
              <h2 style={{ fontSize: '2.2rem', marginBottom: '8px' }}>Test-Drive Our AI Chatbot & Website Generator</h2>
              <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.95rem' }}>
                Customize prompt instructions, test in the sandbox simulator, and launch your customized business website.
              </p>
            </div>

            {/* Active Demo Render */}
            <div className="glass-panel" style={{ padding: '40px', background: 'rgba(10, 15, 30, 0.4)' }}>
              <ChatbotDemo onAddLead={handleAddLead} currentUser={user} onTriggerLogin={() => setShowAuthModal(true)} />
            </div>
          </section>
        )}

        {currentTab === 'pricing' && (
          <section className="section-padding">
            <PricingCalculator onDeploy={() => handleChooseTrial('chatbot')} />
          </section>
        )}

        {currentTab === 'dashboard' && (
          <section className="section-padding">
            <Dashboard leadsCount={leadsCount} />
          </section>
        )}

        {currentTab === 'wizard' && (
          <section className="section-padding">
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <div className="badge" style={{ marginBottom: '12px' }}>AI Readiness Audit</div>
              <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Build Your Custom Integration Roadmap</h2>
              <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.95rem' }}>
                Complete a 1-minute questionnaire to analyze bottlenecks and receive a stylized action plan.
              </p>
            </div>
            <ConsultationWizard />
          </section>
        )}

        {currentTab === 'landing' && (
          <SEOLandingPage slug={landingSlug} onNavigate={navigateTo} />
        )}

      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="nav-logo">
              <Sparkles size={20} style={{ color: 'hsl(var(--primary-light))' }} />
              <span>AI<span style={{ color: 'hsl(var(--secondary-light))' }}>ForMSME</span></span>
            </div>
            <p className="footer-desc">
              Empowering Micro, Small, and Medium Enterprises to optimize operations, automate customer relations, and upskill teams through accessible AI solutions.
            </p>
          </div>
          
          <div className="footer-col">
            <h4>Solutions</h4>
            <ul className="footer-links">
              <li><span className="footer-link" onClick={() => navigateTo('landing', 'ai-for-small-business')} style={{ cursor: 'pointer' }}>AI for Small Business</span></li>
              <li><span className="footer-link" onClick={() => navigateTo('landing', 'ai-chatbot-for-business')} style={{ cursor: 'pointer' }}>AI Chatbot for Business</span></li>
              <li><span className="footer-link" onClick={() => navigateTo('landing', 'ai-automation-for-business')} style={{ cursor: 'pointer' }}>AI Automation for Business</span></li>
              <li><span className="footer-link" onClick={() => navigateTo('landing', 'ai-consulting-msme')} style={{ cursor: 'pointer' }}>AI Consulting for MSMEs</span></li>
              <li><span className="footer-link" onClick={() => navigateTo('landing', 'ai-for-indian-businesses')} style={{ cursor: 'pointer' }}>AI for Indian Businesses</span></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Resource Hub</h4>
            <ul className="footer-links">
              <li><span className="footer-link" onClick={() => navigateTo('pricing')} style={{ cursor: 'pointer' }}>ROI Calculator</span></li>
              <li><span className="footer-link" onClick={() => navigateTo('wizard')} style={{ cursor: 'pointer' }}>Consultation Audit</span></li>
              <li><span className="footer-link" onClick={() => navigateTo('dashboard')} style={{ cursor: 'pointer' }}>Client Dashboard</span></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Contact AIForMSME</h4>
            <p style={{ fontSize: '0.85rem', marginBottom: '12px', color: 'hsl(var(--text-secondary))' }}>
              Have questions? Let's connect and design customized prompt models for your team.
            </p>
            <button className="btn-secondary" onClick={() => navigateTo('wizard')} style={{ padding: '8px 16px', fontSize: '0.8rem', width: '100%', justifyContent: 'center' }}>
              Schedule Consultation
            </button>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 AIForMSME. All rights reserved. Helping small businesses leverage AI.</p>
          <div style={{ display: 'flex', gap: '16px' }}>
            <a href="#" className="footer-link">Terms of Service</a>
            <a href="#" className="footer-link">Privacy Policy</a>
          </div>
        </div>
      </footer>

      {showAuthModal && (
        <AuthPortal 
          onClose={() => setShowAuthModal(false)} 
          onLoginSuccess={handleLoginSuccess} 
        />
      )}

      <FloatingAssistant />

      {showPromoBanner && (
        <PromoBanner 
          onClose={() => setShowPromoBanner(false)} 
          onChooseTrial={handleChooseTrial} 
        />
      )}

    </div>
  );
}
