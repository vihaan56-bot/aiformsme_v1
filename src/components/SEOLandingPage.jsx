import React, { useState } from 'react';
import { ArrowRight, Bot, Compass, ShieldAlert, Sparkles, HelpCircle, ChevronDown, ChevronUp, Zap, Users, ShieldCheck } from 'lucide-react';
import useSEO from '../hooks/useSEO';

export default function SEOLandingPage({ slug, onNavigate }) {
  const [openFaq, setOpenFaq] = useState(null);

  // Content catalog mapped to specific landing page SEO slugs
  const pageData = {
    'ai-for-small-business': {
      title: 'AI for Small Business & MSMEs - Automation Solutions | AIForMSME',
      description: 'Discover how tailored AI for small businesses can capture customer leads, answer inquiries 24/7, and reduce operational overhead by up to 60%.',
      keywords: 'AI for Small Business, AI for Small Businesses, AI for MSME, AI for SMEs, Business AI Solutions',
      canonicalUrl: `https://aiformsme.co.in/ai-for-small-business`,
      heading: 'Custom AI for Small Businesses & MSMEs',
      subheading: 'Deploy enterprise-grade AI automation built specifically for micro, small, and medium enterprises. Save time, cut costs, and capture leads 24/7.',
      badge: 'Small Business AI Solutions',
      faqs: [
        {
          q: 'How does AI help small businesses and MSMEs?',
          a: 'AI solves operational bottlenecks by taking over repetitive tasks. It answers customer queries instantly, schedules bookings, compiles client databases, and handles front-line messaging so your team can focus on core growth.'
        },
        {
          q: 'Is deploying AI expensive for a small business owner?',
          a: 'No! AIForMSME specializes in affordable, lightweight systems. With our sandbox simulator, you can customize and test AI models for free, and our subscription tiers are specifically designed for small enterprise budgets.'
        },
        {
          q: 'Do I need a developer or technical experience?',
          a: 'Not at all. Our platform features an interactive setup wizard and an automatic website generator. You can build, test, and launch a customized chatbot page in under 30 seconds without writing any code.'
        }
      ]
    },
    'ai-consulting-msme': {
      title: 'AI Consulting for MSMEs & Indian Businesses - AIForMSME',
      description: 'Affordable AI consulting and integration roadmaps for Indian businesses and MSMEs. Automate operations and improve local customer outreach.',
      keywords: 'AI Consulting for MSMEs, AI for Indian Businesses, AI Solutions for Small Businesses',
      canonicalUrl: `https://aiformsme.co.in/ai-consulting-msme`,
      heading: 'AI Consulting & Integration for MSMEs',
      subheading: 'Bridge the digital divide. Get expert AI consulting, identify operational bottlenecks, and generate an actionable integration roadmap.',
      badge: 'AI Consulting & Roadmap',
      faqs: [
        {
          q: 'What is an AI readiness audit?',
          a: 'It is a 1-minute diagnostic wizard that analyzes your business operations, identifies bottlenecks (like missed phone calls or delayed replies), and outputs a custom action plan and downloadable roadmap.'
        },
        {
          q: 'How does AI consulting benefit Indian MSMEs?',
          a: 'AI consulting ensures you select and deploy high-ROI tools tailored to local markets. We focus on cost-efficient API integration, customer support automation, and training local staff in prompt engineering.'
        },
        {
          q: 'What does the custom implementation plan cover?',
          a: 'It details exactly which AI bots (chat, voice, or staff training) to run, outlines a step-by-step setup timeline, specifies compliance testing parameters, and calculates estimated cost savings.'
        }
      ]
    },
    'ai-for-indian-businesses': {
      title: 'AI for Indian Businesses & Local Shops - AIForMSME',
      description: 'Affordable AI chatbots, automation tools, and CRM solutions tailored for local Indian shops, family clinics, and MSMEs. Drive customer growth and cut costs.',
      keywords: 'AI for Indian Businesses, AI Consulting for MSMEs, AI for MSME, Business AI Solutions',
      canonicalUrl: `https://aiformsme.co.in/ai-for-indian-businesses`,
      heading: 'Affordable AI Solutions for Indian Businesses',
      subheading: 'Empowering local retail shops, bakeries, medical clinics, and service providers across India with automated customer support and CRM lead capture.',
      badge: 'AI for Indian MSMEs',
      faqs: [
        {
          q: 'Can Indian shops use AI chatbots effectively?',
          a: 'Yes! Local shops and clinics experience high query volumes. AI chatbots act as a 24/7 virtual manager, taking down customer names, phone numbers, and requirements, ensuring you never miss a client lead.'
        },
        {
          q: 'Does it support Indian business workflows?',
          a: 'Absolutely. We design prompt instructions to handle local pricing models, highlight shop details, capture customer callback request data, and sync leads in real-time to your dashboard.'
        },
        {
          q: 'Is there a free trial for local vendors?',
          a: 'Yes, we run launch promotions offering your first month 100% free with no credit card required. You can test our interactive chatbot simulator in the sandbox today.'
        }
      ]
    },
    'ai-chatbot-for-business': {
      title: 'AI Chatbot for Business: 24/7 Support & Lead Gen - AIForMSME',
      description: 'Boost conversion rates with an AI chatbot for business. Capture client inquiries, schedule appointments, and launch a custom website instantly.',
      keywords: 'AI Chatbot for Business, AI Automation for Business, AI for Small Business',
      canonicalUrl: `https://aiformsme.co.in/ai-chatbot-for-business`,
      heading: 'Custom AI Chatbots for Business Operations',
      subheading: 'Capture lead details, answer customer FAQs, and generate a fully functional website with embedded chat in 30 seconds.',
      badge: 'AI Chatbot Solutions',
      faqs: [
        {
          q: 'How does the business AI chatbot capture leads?',
          a: 'The chatbot greets visitors on your website, answers questions about your services using your custom prompt rules, prompts for contact info, and saves prospects instantly to your lead panel.'
        },
        {
          q: 'Can I customize the chatbot rules and instructions?',
          a: 'Yes, the interactive sandbox allows you to set custom system prompts, define custom knowledge bases, and test conversational outputs in real-time before going live.'
        },
        {
          q: 'How does the instant website generator work?',
          a: 'Our simulator builds a responsive, professionally designed business landing page containing your configured chatbot. You can launch and forward subdomains instantly.'
        }
      ]
    },
    'ai-automation-for-business': {
      title: 'AI Automation for Business: Streamline Operations - AIForMSME',
      description: 'Optimize workflow efficiency with AI automation for business. Deploy conversational bots, automate databases, and train staff in prompt engineering.',
      keywords: 'AI Automation for Business, Business AI Solutions, AI Solutions for Small Businesses',
      canonicalUrl: `https://aiformsme.co.in/ai-automation-for-business`,
      heading: 'End-to-End AI Automation for Business Growth',
      subheading: 'Streamline client acquisition, automate repetitive CRM database tasks, and upskill employees to deploy modern AI tools.',
      badge: 'Business Automation',
      faqs: [
        {
          q: 'What is AI business automation?',
          a: 'It is the process of using intelligent software agents to handle tasks like customer messaging, lead management, database syncing, and staff scheduling, lowering operational costs.'
        },
        {
          q: 'How does it integrate with my existing business structure?',
          a: 'Our systems sync directly with secure databases (like Firebase or spreadsheets). You can track leads on our Client Dashboard and download consultation roadmaps.'
        },
        {
          q: 'How can I measure the ROI of business automation?',
          a: 'You can use our integrated Savings Pricing Calculator, which contrasts human labor cost estimations with automated AI runtimes based on your actual monthly volume.'
        }
      ]
    }
  };

  const currentData = pageData[slug] || pageData['ai-for-small-business'];

  // Format schema dynamically for FAQPage and Service
  const pageSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        '@id': `${currentData.canonicalUrl}#service`,
        'name': currentData.heading,
        'description': currentData.subheading,
        'provider': {
          '@type': 'Organization',
          'name': 'AIForMSME',
          'url': 'https://aiformsme.co.in',
          'logo': 'https://aiformsme.co.in/favicon.svg'
        },
        'areaServed': 'IN'
      },
      {
        '@type': 'FAQPage',
        '@id': `${currentData.canonicalUrl}#faq`,
        'mainEntity': currentData.faqs.map(faq => ({
          '@type': 'Question',
          'name': faq.q,
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': faq.a
          }
        }))
      }
    ]
  };

  // Run dynamic SEO updates
  useSEO({
    title: currentData.title,
    description: currentData.description,
    keywords: currentData.keywords,
    canonicalUrl: currentData.canonicalUrl,
    schema: pageSchema
  });

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <article className="section-padding animate-slide-up" style={{ minHeight: '90vh' }}>
      
      {/* Landing Header Hero */}
      <div style={{ maxWidth: '850px', margin: '0 auto 60px auto', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <header>
          <div className="badge animate-pulse-glow" style={{ marginBottom: '16px' }}>
            <Sparkles size={14} style={{ marginRight: '6px' }} />
            {currentData.badge}
          </div>
          <h1 style={{ fontSize: 'calc(2rem + 1.5vw)', lineHeight: '1.2', marginBottom: '16px' }} className="gradient-text">
            {currentData.heading}
          </h1>
        </header>
        <p style={{ fontSize: '1.15rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.6', maxWidth: '720px', margin: '0 auto' }}>
          {currentData.subheading}
        </p>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '12px' }}>
          <button className="btn-primary" onClick={() => onNavigate('wizard')}>
            Get Custom AI Roadmap <ArrowRight size={18} />
          </button>
          <button className="btn-secondary" onClick={() => onNavigate('demos')}>
            Try Interactive Demos
          </button>
        </div>
      </div>

      {/* Feature grid content - Semantics and structured columns */}
      <section style={{ maxWidth: '1000px', margin: '0 auto 80px auto' }}>
        <h2 style={{ fontSize: '1.8rem', textAlign: 'center', marginBottom: '40px' }}>
          Why Small Businesses Deploy <span className="gradient-text-color">AIForMSME Solutions</span>
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '30px'
        }}>
          {/* Card 1 */}
          <div className="glass-panel" style={{ padding: '24px 30px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.15)', color: 'hsl(var(--primary-light))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={20} />
            </div>
            <h3 style={{ fontSize: '1.2rem' }}>24/7 Automated Inquiries</h3>
            <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))', lineHeight: '1.6' }}>
              AI chatbots intercept incoming customers day and night. Answer FAQ questions, store phone numbers, capture custom requests, and keep clients engaged instantly.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-panel" style={{ padding: '24px 30px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.15)', color: 'hsl(var(--secondary-light))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={20} />
            </div>
            <h3 style={{ fontSize: '1.2rem' }}>Reduce Operation Costs</h3>
            <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))', lineHeight: '1.6' }}>
              Cut back on manual response efforts and missed calls. Our systems automate basic workflows, delivering up to 60% savings in customer service hours.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-panel" style={{ padding: '24px 30px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(236, 72, 153, 0.15)', color: 'hsl(var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={20} />
            </div>
            <h3 style={{ fontSize: '1.2rem' }}>Zero Coding Needed</h3>
            <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))', lineHeight: '1.6' }}>
              Built specifically for local vendors, shop operators, and clinics. Build prompt guidelines, simulate testing, and deploy live subdomains using our simplified dashboards.
            </p>
          </div>
        </div>
      </section>

      {/* Accordion FAQ Section - Optimized for SEO crawlers and rich answers */}
      <section style={{ maxWidth: '750px', margin: '0 auto 60px auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div className="badge badge-rose" style={{ marginBottom: '10px' }}>
            <HelpCircle size={14} style={{ marginRight: '6px' }} /> FAQ Hub
          </div>
          <h2 style={{ fontSize: '1.8rem' }}>Frequently Asked Questions</h2>
          <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))', marginTop: '6px' }}>
            Everything you need to know about integrating AI for business automation.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {currentData.faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div 
                key={index} 
                className="glass-panel" 
                style={{ 
                  borderRadius: '10px', 
                  overflow: 'hidden', 
                  border: isOpen ? '1px solid hsl(var(--primary) / 0.3)' : '1px solid rgba(255,255,255,0.06)',
                  transition: 'all 0.3s'
                }}
              >
                <button
                  onClick={() => toggleFaq(index)}
                  aria-expanded={isOpen}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    color: 'white',
                    padding: '20px 24px',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '16px'
                  }}
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp size={18} style={{ color: 'hsl(var(--primary-light))' }} /> : <ChevronDown size={18} style={{ color: 'hsl(var(--text-muted))' }} />}
                </button>

                {isOpen && (
                  <div style={{ 
                    padding: '0 24px 20px 24px', 
                    fontSize: '0.85rem', 
                    color: 'hsl(var(--text-secondary))', 
                    lineHeight: '1.6',
                    borderTop: '1px solid rgba(255,255,255,0.03)',
                    paddingTop: '16px'
                  }}>
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Internal link CTA Banner */}
      <section className="glass-panel" style={{ 
        maxWidth: '850px', 
        margin: '0 auto', 
        padding: '40px', 
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.7) 0%, rgba(6, 182, 212, 0.03) 100%)',
        border: '1px solid rgba(6, 182, 212, 0.2)'
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Analyze Your Business Bottlenecks in 60 Seconds</h2>
        <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))', maxWidth: '580px', margin: '0 auto 24px auto', lineHeight: '1.6' }}>
          Complete our short diagnostics wizard. Get a styled action plan and roadmap detailing how to deploy AI automation for your small business.
        </p>
        <button 
          className="btn-primary" 
          onClick={() => onNavigate('wizard')}
          style={{ background: 'linear-gradient(135deg, hsl(var(--secondary)) 0%, hsl(var(--primary)) 100%)', boxShadow: '0 4px 12px rgba(6, 182, 212, 0.3)' }}
        >
          Begin Free Audit <ArrowRight size={18} />
        </button>
      </section>

    </article>
  );
}
