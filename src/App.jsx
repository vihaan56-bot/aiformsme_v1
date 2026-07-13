import React, { useState, useEffect } from 'react';
import { Bot, Sparkles, LayoutDashboard, Terminal, BadgeDollarSign, Compass, ArrowRight, Users, MessageSquare, Megaphone, Settings, LogOut, Loader } from 'lucide-react';
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

// Onboarding & CommandCenter Sub-modules
import OnboardingFlow from './components/OnboardingFlow';
import CommandCenter from './components/CommandCenter';
import LeadsManager from './components/LeadsManager';
import FollowUpAgent from './components/FollowUpAgent';
import SocialMediaStudio from './components/SocialMediaStudio';
import ReviewResponder from './components/ReviewResponder';
import InvoiceAssistant from './components/InvoiceAssistant';

import { db, auth, isFirebaseConfigured } from './firebase';
import { collection, onSnapshot, query, where, getDocs } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';


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

  // Business Profile & Command Center state
  const [activeBusiness, setActiveBusiness] = useState(null);
  const [activeDashTab, setActiveDashTab] = useState('command_center');
  const [promoPrefill, setPromoPrefill] = useState(null);
  
  // Track user websites to restrict dashboard access before launch
  const [userWebsites, setUserWebsites] = useState([]);

  const fetchUserWebsites = async () => {
    if (!user) {
      setUserWebsites([]);
      return;
    }
    try {
      let list = [];
      if (db) {
        if (user.uid) {
          const qUid = query(collection(db, 'websites'), where('ownerId', '==', user.uid));
          const snapUid = await getDocs(qUid);
          snapUid.forEach(docSnap => {
            list.push({ id: docSnap.id, ...docSnap.data() });
          });
        }
        if (list.length === 0 && user.email) {
          const qEmail = query(collection(db, 'websites'), where('ownerEmail', '==', user.email));
          const snapEmail = await getDocs(qEmail);
          snapEmail.forEach(docSnap => {
            list.push({ id: docSnap.id, ...docSnap.data() });
          });
        }
      } else {
        const stored = JSON.parse(localStorage.getItem('aiformsme_websites') || '{}');
        list = Object.values(stored).filter(w => w.ownerId === user.uid || w.ownerEmail === user.email);
      }
      setUserWebsites(list);
      
      // Enforce the website builder tab if they haven't launched any sites yet
      if (list.length === 0) {
        setActiveDashTab('website');
      }
    } catch (err) {
      console.warn('[WEBSITES FETCH ERROR]:', err);
    }
  };

  useEffect(() => {
    if (authInitialized) {
      fetchUserWebsites();
    }
  }, [user, authInitialized]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [businessLoaded, setBusinessLoaded] = useState(false);

  // Free Trial State
  const [showPromoBanner, setShowPromoBanner] = useState(true);
  const [selectedTrial, setSelectedTrial] = useState(null);

  // Responsive hook
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [authInitialized, setAuthInitialized] = useState(false);

  // Listen to Firebase Auth state
  useEffect(() => {
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          firebaseUser.getIdToken().then(token => {
            const userData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
              role: 'Client Operator',
              token: token
            };
            setUser(userData);
            localStorage.setItem('aiformsme_user', JSON.stringify(userData));
            setAuthInitialized(true);
          });
        } else {
          const localUser = localStorage.getItem('aiformsme_user');
          if (localUser && !localUser.includes('session-local-') && !localUser.includes('session-jwt-')) {
            setUser(null);
            localStorage.removeItem('aiformsme_user');
          }
          setAuthInitialized(true);
        }
      });
      return () => unsubscribe();
    } else {
      setAuthInitialized(true);
    }
  }, []);

  // Load Business Profile
  useEffect(() => {
    if (!authInitialized) return;

    if (!user) {
      setActiveBusiness(null);
      setBusinessLoaded(true);
      return;
    }

    async function loadBusinessProfile() {
      setBusinessLoaded(false);
      let foundBiz = null;
      
      try {
        if (db) {
          try {
            // 1. Try fetching business by Firebase Auth UID
            if (user.uid) {
              const qUid = query(collection(db, 'businesses'), where('ownerId', '==', user.uid));
              const snapUid = await getDocs(qUid);
              if (!snapUid.empty) {
                const docRef = snapUid.docs[0];
                foundBiz = { id: docRef.id, ...docRef.data() };
              }
            }

            // 2. Try fetching business by Email (legacy backward compatibility)
            if (!foundBiz && user.email) {
              const qEmail = query(collection(db, 'businesses'), where('ownerId', '==', user.email));
              const snapEmail = await getDocs(qEmail);
              if (!snapEmail.empty) {
                const docRef = snapEmail.docs[0];
                foundBiz = { id: docRef.id, ...docRef.data() };
              }
            }
          } catch (firestoreErr) {
            console.warn('[FIRESTORE PROFILE FETCH WARNING]:', firestoreErr);
          }
        }
        
        // 3. Fallback to LocalStorage profile
        if (!foundBiz) {
          const local = localStorage.getItem('aiformsme_business_config');
          if (local) {
            const parsed = JSON.parse(local);
            if (parsed.ownerId === user.uid || parsed.ownerId === user.email) {
              foundBiz = parsed;
            }
          }
        }

        setActiveBusiness(foundBiz);
      } catch (err) {
        console.error('Error in loadBusinessProfile:', err);
      } finally {
        setBusinessLoaded(true);
      }
    }

    loadBusinessProfile();
  }, [user, authInitialized]);

  const handleChooseTrial = (serviceId) => {
    setSelectedTrial(serviceId);
    setCurrentTab('dashboard');
    setActiveDashTab('website');
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('aiformsme_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    if (auth) {
      signOut(auth).catch(err => console.error(err));
    }
    setUser(null);
    localStorage.removeItem('aiformsme_user');
    localStorage.removeItem('aiformsme_business_config');
    setActiveBusiness(null);
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
          <li className={`nav-link ${currentTab === 'pricing' ? 'active' : ''}`} onClick={() => navigateTo('pricing')}>
            Savings Pricing
          </li>
          <li className={`nav-link ${currentTab === 'dashboard' ? 'active' : ''}`} onClick={() => navigateTo('dashboard')}>
            Dashboard
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
              <ChatbotDemo onAddLead={handleAddLead} currentUser={user} onTriggerLogin={() => setShowAuthModal(true)} onWebsiteLaunched={fetchUserWebsites} />
            </div>
          </section>
        )}

        {currentTab === 'pricing' && (
          <section className="section-padding">
            <PricingCalculator onDeploy={() => handleChooseTrial('chatbot')} />
          </section>
        )}

        {currentTab === 'dashboard' && (
          <section className="section-padding" style={{ paddingBottom: isMobile ? '90px' : '40px' }}>
            {!user ? (
              <div className="glass-panel animate-slide-up" style={{ padding: '40px', textAlign: 'center', maxWidth: '500px', margin: '40px auto' }}>
                <Bot size={48} style={{ color: 'hsl(var(--primary-light))', marginBottom: '16px' }} />
                <h3 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '10px' }}>Access your AI Command Center</h3>
                <p style={{ fontSize: '0.88rem', color: 'hsl(var(--text-muted))', marginBottom: '24px' }}>
                  Sign in or register to set up your AI employee, capture leads, manage payment reminders, and see analytics.
                </p>
                <button className="btn-primary" onClick={() => setShowAuthModal(true)} style={{ width: '100%', justifyContent: 'center' }}>
                  Sign In to Workspace
                </button>
              </div>
            ) : !businessLoaded ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: '16px' }}>
                <Loader className="animate-spin" size={32} style={{ color: 'hsl(var(--primary))' }} />
                <span style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>Retrieving business workspace...</span>
              </div>
            ) : !activeBusiness ? (
              <OnboardingFlow currentUser={user} onComplete={(biz) => setActiveBusiness(biz)} />
            ) : (
              <div className="dashboard-grid-layout" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '240px 1fr', gap: '30px', alignItems: 'stretch' }}>
                {(() => {
                  const hasNoWebsites = userWebsites.length === 0;
                  return (
                    <>
                      {/* Desktop Sidebar Navigation */}
                      {!isMobile && (
                        <aside className="glass-panel" style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', justifySelf: 'stretch', gap: '8px', background: 'rgba(5, 8, 20, 0.45)', height: 'fit-content' }}>
                          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px', marginBottom: '12px' }}>
                            <h4 style={{ fontSize: '0.82rem', fontWeight: '700', color: 'hsl(var(--secondary-light))', textTransform: 'uppercase', margin: 0 }}>
                              {activeBusiness.businessName}
                            </h4>
                            <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))' }}>AI Operator Workspace</span>
                          </div>

                          {hasNoWebsites && (
                            <div style={{ padding: '10px 12px', background: 'rgba(6, 182, 212, 0.05)', border: '1px solid rgba(6, 182, 212, 0.2)', borderRadius: '6px', fontSize: '0.7rem', color: 'hsl(var(--primary-light))', marginBottom: '12px', lineHeight: '1.4' }}>
                              🚀 Launch your AI website below to unlock other dashboard workspaces!
                            </div>
                          )}

                          <button 
                            onClick={() => {
                              if (hasNoWebsites) {
                                alert("🔒 Setup Required: Please launch your business website first using the AI Website Builder below to unlock Command Center metrics.");
                                return;
                              }
                              setActiveDashTab('command_center');
                            }}
                            style={{
                              padding: '10px 12px',
                              background: activeDashTab === 'command_center' ? 'hsl(var(--primary) / 0.15)' : 'none',
                              border: 'none',
                              borderRadius: '6px',
                              color: activeDashTab === 'command_center' ? 'hsl(var(--primary-light))' : 'hsl(var(--text-secondary))',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              textAlign: 'left',
                              cursor: hasNoWebsites ? 'not-allowed' : 'pointer',
                              opacity: hasNoWebsites ? 0.4 : 1,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              transition: 'all 0.2s'
                            }}
                          >
                            <LayoutDashboard size={16} /> Command Center {hasNoWebsites && "🔒"}
                          </button>

                          <button 
                            onClick={() => {
                              if (hasNoWebsites) {
                                alert("🔒 Setup Required: Please launch your business website first using the AI Website Builder below to unlock Leads Manager.");
                                return;
                              }
                              setActiveDashTab('leads');
                            }}
                            style={{
                              padding: '10px 12px',
                              background: activeDashTab === 'leads' ? 'hsl(var(--primary) / 0.15)' : 'none',
                              border: 'none',
                              borderRadius: '6px',
                              color: activeDashTab === 'leads' ? 'hsl(var(--primary-light))' : 'hsl(var(--text-secondary))',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              textAlign: 'left',
                              cursor: hasNoWebsites ? 'not-allowed' : 'pointer',
                              opacity: hasNoWebsites ? 0.4 : 1,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              transition: 'all 0.2s'
                            }}
                          >
                            <Users size={16} /> Leads Manager {hasNoWebsites && "🔒"}
                          </button>

                          <button 
                            onClick={() => {
                              if (hasNoWebsites) {
                                alert("🔒 Setup Required: Please launch your business website first using the AI Website Builder below to unlock Follow-ups.");
                                return;
                              }
                              setActiveDashTab('followups');
                            }}
                            style={{
                              padding: '10px 12px',
                              background: activeDashTab === 'followups' ? 'hsl(var(--primary) / 0.15)' : 'none',
                              border: 'none',
                              borderRadius: '6px',
                              color: activeDashTab === 'followups' ? 'hsl(var(--primary-light))' : 'hsl(var(--text-secondary))',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              textAlign: 'left',
                              cursor: hasNoWebsites ? 'not-allowed' : 'pointer',
                              opacity: hasNoWebsites ? 0.4 : 1,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              transition: 'all 0.2s'
                            }}
                          >
                            <MessageSquare size={16} /> Follow-ups {hasNoWebsites && "🔒"}
                          </button>

                          <button 
                            onClick={() => {
                              if (hasNoWebsites) {
                                alert("🔒 Setup Required: Please launch your business website first using the AI Website Builder below to unlock AI Marketing Studio.");
                                return;
                              }
                              setActiveDashTab('marketing');
                            }}
                            style={{
                              padding: '10px 12px',
                              background: activeDashTab === 'marketing' ? 'hsl(var(--primary) / 0.15)' : 'none',
                              border: 'none',
                              borderRadius: '6px',
                              color: activeDashTab === 'marketing' ? 'hsl(var(--primary-light))' : 'hsl(var(--text-secondary))',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              textAlign: 'left',
                              cursor: hasNoWebsites ? 'not-allowed' : 'pointer',
                              opacity: hasNoWebsites ? 0.4 : 1,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              transition: 'all 0.2s'
                            }}
                          >
                            <Sparkles size={16} /> AI Marketing Studio {hasNoWebsites && "🔒"}
                          </button>

                          <button 
                            onClick={() => {
                              if (hasNoWebsites) {
                                alert("🔒 Setup Required: Please launch your business website first using the AI Website Builder below to unlock Review Responder.");
                                return;
                              }
                              setActiveDashTab('reviews');
                            }}
                            style={{
                              padding: '10px 12px',
                              background: activeDashTab === 'reviews' ? 'hsl(var(--primary) / 0.15)' : 'none',
                              border: 'none',
                              borderRadius: '6px',
                              color: activeDashTab === 'reviews' ? 'hsl(var(--primary-light))' : 'hsl(var(--text-secondary))',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              textAlign: 'left',
                              cursor: hasNoWebsites ? 'not-allowed' : 'pointer',
                              opacity: hasNoWebsites ? 0.4 : 1,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              transition: 'all 0.2s'
                            }}
                          >
                            <Terminal size={16} /> Review Responder {hasNoWebsites && "🔒"}
                          </button>

                          <button 
                            onClick={() => {
                              if (hasNoWebsites) {
                                alert("🔒 Setup Required: Please launch your business website first using the AI Website Builder below to unlock Payments Tracker.");
                                return;
                              }
                              setActiveDashTab('payments');
                            }}
                            style={{
                              padding: '10px 12px',
                              background: activeDashTab === 'payments' ? 'hsl(var(--primary) / 0.15)' : 'none',
                              border: 'none',
                              borderRadius: '6px',
                              color: activeDashTab === 'payments' ? 'hsl(var(--primary-light))' : 'hsl(var(--text-secondary))',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              textAlign: 'left',
                              cursor: hasNoWebsites ? 'not-allowed' : 'pointer',
                              opacity: hasNoWebsites ? 0.4 : 1,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              transition: 'all 0.2s'
                            }}
                          >
                            <BadgeDollarSign size={16} /> Payments Tracker {hasNoWebsites && "🔒"}
                          </button>

                          <button 
                            onClick={() => setActiveDashTab('website')}
                            style={{
                              padding: '10px 12px',
                              background: activeDashTab === 'website' ? 'hsl(var(--primary) / 0.15)' : 'none',
                              border: 'none',
                              borderRadius: '6px',
                              color: activeDashTab === 'website' ? 'hsl(var(--primary-light))' : 'hsl(var(--text-secondary))',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              textAlign: 'left',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              transition: 'all 0.2s',
                              borderTop: '1px solid rgba(255,255,255,0.05)',
                              marginTop: '8px',
                              paddingTop: '12px'
                            }}
                          >
                            <Bot size={16} /> AI Website Builder
                          </button>

                          <button 
                            onClick={() => setActiveDashTab('wizard')}
                            style={{
                              padding: '10px 12px',
                              background: activeDashTab === 'wizard' ? 'hsl(var(--primary) / 0.15)' : 'none',
                              border: 'none',
                              borderRadius: '6px',
                              color: activeDashTab === 'wizard' ? 'hsl(var(--primary-light))' : 'hsl(var(--text-secondary))',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              textAlign: 'left',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              transition: 'all 0.2s'
                            }}
                          >
                            <Compass size={16} /> Bottleneck Audit
                          </button>

                          <button 
                            onClick={() => {
                              if (hasNoWebsites) {
                                alert("🔒 Setup Required: Please launch your business website first using the AI Website Builder below to unlock Onboarding Settings.");
                                return;
                              }
                              setActiveDashTab('settings');
                            }}
                            style={{
                              padding: '10px 12px',
                              background: activeDashTab === 'settings' ? 'hsl(var(--primary) / 0.15)' : 'none',
                              border: 'none',
                              borderRadius: '6px',
                              color: activeDashTab === 'settings' ? 'hsl(var(--primary-light))' : 'hsl(var(--text-secondary))',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              textAlign: 'left',
                              cursor: hasNoWebsites ? 'not-allowed' : 'pointer',
                              opacity: hasNoWebsites ? 0.4 : 1,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              transition: 'all 0.2s'
                            }}
                          >
                            <Settings size={16} /> Onboarding Settings {hasNoWebsites && "🔒"}
                          </button>
                        </aside>
                      )}
                    </>
                  );
                })()}

                {/* Dashboard Workspace panel */}
                <div className="dashboard-view-panel" style={{ flex: 1 }}>
                  {activeDashTab === 'command_center' && (
                    <CommandCenter 
                      activeBusiness={activeBusiness} 
                      onNavigateToTab={(tab, data) => {
                        setActiveDashTab(tab);
                        if (data) setPromoPrefill(data);
                      }}
                      userToken={user?.token}
                    />
                  )}

                  {activeDashTab === 'leads' && (
                    <LeadsManager 
                      activeBusiness={activeBusiness} 
                      userToken={user?.token}
                      onLeadUpdate={() => {}}
                    />
                  )}

                  {activeDashTab === 'followups' && (
                    <FollowUpAgent 
                      activeBusiness={activeBusiness} 
                      userToken={user?.token}
                    />
                  )}

                  {activeDashTab === 'marketing' && (
                    <SocialMediaStudio 
                      activeBusiness={activeBusiness} 
                      userToken={user?.token}
                      prefillData={promoPrefill}
                    />
                  )}

                  {activeDashTab === 'reviews' && (
                    <ReviewResponder 
                      activeBusiness={activeBusiness} 
                      userToken={user?.token}
                    />
                  )}

                  {activeDashTab === 'payments' && (
                    <InvoiceAssistant 
                      activeBusiness={activeBusiness} 
                      userToken={user?.token}
                      onInvoiceChange={() => {}}
                    />
                  )}

                  {activeDashTab === 'website' && (
                    <div className="glass-panel" style={{ padding: '30px', background: 'rgba(10, 15, 30, 0.4)' }}>
                      <ChatbotDemo onAddLead={handleAddLead} currentUser={user} onTriggerLogin={() => setShowAuthModal(true)} onWebsiteLaunched={fetchUserWebsites} />
                    </div>
                  )}

                  {activeDashTab === 'wizard' && (
                    <ConsultationWizard />
                  )}

                  {activeDashTab === 'settings' && (
                    <div className="glass-panel animate-slide-up" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>AI Employee Configuration</h3>
                      <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>Modify your business profile settings and active AI Employee configurations below.</p>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                        <div><strong>Business Name:</strong> {activeBusiness.businessName}</div>
                        <div style={{ marginTop: '8px' }}><strong>Category:</strong> {activeBusiness.businessType}</div>
                        <div style={{ marginTop: '8px' }}><strong>Active AI Responsibilities:</strong>
                          <ul style={{ paddingLeft: '20px', marginTop: '6px', fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>
                            {activeBusiness.aiResponsibilities?.map(r => <li key={r}>{r.replace('_', ' ')}</li>)}
                          </ul>
                        </div>
                      </div>

                      <button 
                        className="btn-outline" 
                        onClick={() => {
                          if (confirm('Re-running onboarding will let you update your business details. Proceed?')) {
                            setActiveBusiness(null);
                          }
                        }}
                        style={{ alignSelf: 'flex-start' }}
                      >
                        Reset Profile & Re-run Onboarding
                      </button>
                    </div>
                  )}

                </div>

              </div>
            )}

            {/* Mobile Bottom Sticky Navigation Overlay */}
            {isMobile && user && activeBusiness && (
              <div style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                width: '100%',
                backgroundColor: 'rgba(10, 15, 30, 0.95)',
                backdropFilter: 'blur(16px)',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                padding: '8px 0',
                zIndex: 9999,
                boxShadow: '0 -4px 20px rgba(0,0,0,0.5)'
              }}>
                <button 
                  onClick={() => {
                    const hasNoWebsites = userWebsites.length === 0;
                    if (hasNoWebsites) {
                      alert("🔒 Setup Required: Please launch your business website first using the AI Website Builder to unlock Command Center metrics.");
                      return;
                    }
                    setActiveDashTab('command_center');
                  }}
                  style={{ background: 'none', border: 'none', color: activeDashTab === 'command_center' ? 'hsl(var(--primary-light))' : 'hsl(var(--text-muted))', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '0.65rem', opacity: userWebsites.length === 0 ? 0.4 : 1 }}
                >
                  <LayoutDashboard size={18} />
                  <span>Center {userWebsites.length === 0 && "🔒"}</span>
                </button>
                <button 
                  onClick={() => {
                    const hasNoWebsites = userWebsites.length === 0;
                    if (hasNoWebsites) {
                      alert("🔒 Setup Required: Please launch your business website first using the AI Website Builder to unlock Leads Manager.");
                      return;
                    }
                    setActiveDashTab('leads');
                  }}
                  style={{ background: 'none', border: 'none', color: activeDashTab === 'leads' ? 'hsl(var(--primary-light))' : 'hsl(var(--text-muted))', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '0.65rem', opacity: userWebsites.length === 0 ? 0.4 : 1 }}
                >
                  <Users size={18} />
                  <span>Leads {userWebsites.length === 0 && "🔒"}</span>
                </button>
                <button 
                  onClick={() => {
                    const hasNoWebsites = userWebsites.length === 0;
                    if (hasNoWebsites) {
                      alert("🔒 Setup Required: Please launch your business website first using the AI Website Builder to unlock AI Marketing Studio.");
                      return;
                    }
                    setActiveDashTab('marketing');
                  }}
                  style={{ background: 'none', border: 'none', color: activeDashTab === 'marketing' ? 'hsl(var(--primary-light))' : 'hsl(var(--text-muted))', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '0.65rem', opacity: userWebsites.length === 0 ? 0.4 : 1 }}
                >
                  <Sparkles size={18} />
                  <span>AI Studio {userWebsites.length === 0 && "🔒"}</span>
                </button>
                <button 
                  onClick={() => {
                    const hasNoWebsites = userWebsites.length === 0;
                    if (hasNoWebsites) {
                      alert("🔒 Setup Required: Please launch your business website first using the AI Website Builder to unlock Follow-ups.");
                      return;
                    }
                    setActiveDashTab('followups');
                  }}
                  style={{ background: 'none', border: 'none', color: activeDashTab === 'followups' ? 'hsl(var(--primary-light))' : 'hsl(var(--text-muted))', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '0.65rem', opacity: userWebsites.length === 0 ? 0.4 : 1 }}
                >
                  <MessageSquare size={18} />
                  <span>Followup {userWebsites.length === 0 && "🔒"}</span>
                </button>
                <button 
                  onClick={() => {
                    const hasNoWebsites = userWebsites.length === 0;
                    if (hasNoWebsites) {
                      setActiveDashTab('website');
                      return;
                    }
                    setActiveDashTab(prev => 
                      prev === 'website' ? 'payments' : prev === 'payments' ? 'settings' : prev === 'settings' ? 'website' : 'website'
                    );
                  }}
                  style={{ background: 'none', border: 'none', color: ['website', 'payments', 'settings'].includes(activeDashTab) ? 'hsl(var(--primary-light))' : 'hsl(var(--text-muted))', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '0.65rem' }}
                >
                  <Settings size={18} />
                  <span>{userWebsites.length === 0 ? 'Website' : ['website', 'payments', 'settings'].includes(activeDashTab) ? activeDashTab.charAt(0).toUpperCase() + activeDashTab.slice(1) : 'More'}</span>
                </button>
              </div>
            )}

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
