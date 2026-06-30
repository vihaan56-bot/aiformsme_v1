import React, { useState, useEffect, useRef } from 'react';
import { Send, Settings, User, Bot, Trash2, Download, Table, CheckSquare, Globe, Layers, Palette, Plus, Trash, ExternalLink, Copy, Check } from 'lucide-react';
import { db, isFirebaseConfigured } from '../firebase';
import { collection, query, orderBy, onSnapshot, addDoc } from 'firebase/firestore';

export default function ChatbotDemo({ onAddLead }) {
  // Configuration State
  const [bizName, setBizName] = useState("Joe's Bakery");
  const [systemPrompt, setSystemPrompt] = useState("You are an friendly assistant for Joe's Bakery. Tell customers about our fresh croissants, breads, and custom wedding cakes. If they want to order or book a consultation, ask for their name, email, and description of what they want.");
  const [requireEmail, setRequireEmail] = useState(true);
  const [requirePhone, setRequirePhone] = useState(false);
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_OPENROUTER_API_KEY || "");
  const [selectedModel, setSelectedModel] = useState("openrouter/free");
  const [botTrained, setBotTrained] = useState(false);

  // Website Generator State
  const [slug, setSlug] = useState("joes_bakery");
  const [webTheme, setWebTheme] = useState("amber");
  const [webTemplate, setWebTemplate] = useState("bakery");
  const [webTitle, setWebTitle] = useState("Artisanal Breads & Delectable Pastries Baked Daily");
  const [webSubtitle, setWebSubtitle] = useState("Welcome to our bakery, where every ingredient is selected with care, and every item is baked with love.");
  const [webAbout, setWebAbout] = useState("Established in 2016, we have been a cornerstone of the neighborhood. We utilize stone-ground local grains and long fermentation processes to create sourdoughs, croissants, and sweet treats that comfort the soul.");
  const [productsList, setProductsList] = useState([
    { name: 'Sourdough Country Loaf', price: '₹150', desc: 'Naturally leavened crusty bread, baked in stone hearth.' },
    { name: 'Almond Croissant', price: '₹120', desc: 'Twice-baked flaky croissant filled with sweet almond frangipane.' },
    { name: 'Custom Birthday Cake', price: '₹1,200+', desc: 'Three layers of sponge, homemade buttercream, customized decorations.' }
  ]);
  const [enableChatBot, setEnableChatBot] = useState(true);
  
  // Website Generator UI State
  const [webLoading, setWebLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [copied, setCopied] = useState(false);

  // Sync Slug with Business Name on initial typing
  useEffect(() => {
    const defaultSlug = bizName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    setSlug(defaultSlug);
  }, [bizName]);

  // Update Template Content Defaults dynamically
  const handleTemplateChange = (tmpl) => {
    setWebTemplate(tmpl);
    if (tmpl === 'bakery') {
      setWebTitle("Artisanal Breads & Delectable Pastries Baked Daily");
      setWebSubtitle("Welcome to our bakery, where every ingredient is selected with care, and every item is baked with love.");
      setWebAbout("Established in 2016, we have been a cornerstone of the neighborhood. We utilize stone-ground local grains and long fermentation processes to create sourdoughs, croissants, and sweet treats that comfort the soul.");
      setProductsList([
        { name: 'Sourdough Country Loaf', price: '₹150', desc: 'Naturally leavened crusty bread, baked in stone hearth.' },
        { name: 'Almond Croissant', price: '₹120', desc: 'Twice-baked flaky croissant filled with sweet almond frangipane.' },
        { name: 'Custom Birthday Cake', price: '₹1,200+', desc: 'Three layers of sponge, homemade buttercream, customized decorations.' }
      ]);
      setWebTheme("amber");
    } else if (tmpl === 'services') {
      setWebTitle("Scale Your Operations. Dominate Your Market.");
      setWebSubtitle("Tailored business automation and coaching solutions designed to increase efficiency and double your sales.");
      setWebAbout("We help small and medium enterprises optimize their workflows and integrate cutting-edge AI systems. Our certified architects design custom roadmaps that eliminate bottlenecks and reduce operating costs.");
      setProductsList([
        { name: 'Operational Bottleneck Audit', price: '₹9,999', desc: 'Comprehensive review of your digital systems with a detailed roadmap.' },
        { name: 'Custom AI Chatbot Set Up', price: '₹45,000', desc: 'End-to-end configuration and CRM integration for automated sales.' },
        { name: 'Staff Prompting Workshop', price: '₹5,000/hr', desc: 'Interactive coaching sessions for teaching employees effective prompt work.' }
      ]);
      setWebTheme("breeze");
    } else if (tmpl === 'salon') {
      setWebTitle("Relax. Rejuvenate. Rediscover Your Glow.");
      setWebSubtitle("Premium beauty treatments, therapeutic massages, and organic skincare services in a serene sanctuary.");
      setWebAbout("Our boutique spa offers a peaceful escape from the hustle and bustle of daily life. Our licensed therapists use premium botanicals and advanced techniques to restore your natural balance and vitality.");
      setProductsList([
        { name: 'Signature Organic Facial', price: '₹1,999', desc: 'Deep cleansing treatment using customized botanical extracts.' },
        { name: 'Aromatherapy Swedish Massage', price: '₹2,500/hr', desc: 'Full-body relaxation therapy with lavender and chamomile essential oils.' },
        { name: 'Designer Haircut & Blowout', price: '₹1,200', desc: 'Personal consultation, nourishing wash, bespoke cut and styling.' }
      ]);
      setWebTheme("rose");
    } else if (tmpl === 'fitness') {
      setWebTitle("Unleash Your Strength. Achieve Your Apex.");
      setWebSubtitle("Premium training sessions, state-of-the-art weights, and a supportive community to power your fitness journey.");
      setWebAbout("Apex Fitness is dedicated to building sustainable fitness habits. Our certified personal trainers and high-intensity group classes are designed to push you safely past your boundaries to achieve real results.");
      setProductsList([
        { name: 'Standard Monthly Pass', price: '₹1,999/mo', desc: 'Unlimited access to gym facilities, locker rooms, and group warmups.' },
        { name: 'Elite Personal Coaching', price: '₹1,500/hr', desc: 'One-on-one tailored program design and weekly nutritional audits.' },
        { name: 'HIIT & Conditioning Class', price: '₹399/class', desc: '45-minute intense cardiovascular circuits led by group instructors.' }
      ]);
      setWebTheme("mint");
    }
  };

  const handleGenerateWebsite = async (e) => {
    e.preventDefault();
    if (!slug.trim()) return;

    setWebLoading(true);
    const siteData = {
      slug: slug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, ''),
      bizName,
      theme: webTheme,
      template: webTemplate,
      title: webTitle,
      subtitle: webSubtitle,
      about: webAbout,
      products: productsList,
      botConfig: {
        bizName,
        systemPrompt,
        requireEmail,
        requirePhone,
        selectedModel,
        apiKey
      },
      enableBot: enableChatBot
    };

    // Save to Firebase Firestore
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'websites', siteData.slug), siteData);
        console.log('[FIREBASE] Web configuration written for:', siteData.slug);
      } catch (err) {
        console.error('[FIREBASE ERROR] Firestore write failed:', err);
      }
    }

    // Backup mirror in LocalStorage
    try {
      const stored = JSON.parse(localStorage.getItem('aiformsme_websites') || '{}');
      stored[siteData.slug] = siteData;
      localStorage.setItem('aiformsme_websites', JSON.stringify(stored));
    } catch (err) {
      console.error(err);
    }

    setGeneratedUrl(`${window.location.origin}/${siteData.slug}`);
    setWebLoading(false);
    setShowSuccessModal(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddProduct = () => {
    setProductsList([...productsList, { name: 'New Item', price: '₹1,000', desc: 'Provide brief details.' }]);
  };

  const handleProductChange = (index, field, value) => {
    setProductsList(productsList.map((p, idx) => {
      if (idx === index) {
        return { ...p, [field]: value };
      }
      return p;
    }));
  };

  const handleRemoveProduct = (index) => {
    setProductsList(productsList.filter((_, idx) => idx !== index));
  };

  // Chat State
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: "Hi! Welcome to Joe's Bakery. How can I help you today? Ask about our products or place an order!" }
  ]);
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Lead Collection tracking state in current session
  const [collectedData, setCollectedData] = useState({ name: '', email: '', phone: '', note: '' });
  const [leadsList, setLeadsList] = useState([]);

  // Sync leads from Firebase Firestore or local storage fallback
  useEffect(() => {
    const syncLocalLeads = () => {
      try {
        const stored = JSON.parse(localStorage.getItem('aiformsme_leads') || '[]');
        setLeadsList(stored);
      } catch (err) {
        console.error(err);
      }
    };

    syncLocalLeads();

    let unsubscribe = null;
    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, 'leads'), orderBy('date', 'desc'));
        unsubscribe = onSnapshot(q, (snapshot) => {
          const list = [];
          snapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...docSnap.data() });
          });
          setLeadsList(list);
        }, (err) => {
          console.error('[FIRESTORE LEADS LISTENER ERROR]:', err);
        });
      } catch (err) {
        console.error(err);
      }
    }

    window.addEventListener('aiformsme_lead_added', syncLocalLeads);

    return () => {
      if (unsubscribe) unsubscribe();
      window.removeEventListener('aiformsme_lead_added', syncLocalLeads);
    };
  }, []);

  const saveCapturedLead = async (lead) => {
    if (isFirebaseConfigured && db) {
      try {
        await addDoc(collection(db, 'leads'), lead);
        console.log('[FIREBASE] Lead captured & saved:', lead.name);
      } catch (err) {
        console.error('[FIREBASE ERROR] Failed saving lead:', err);
      }
    }
    try {
      const stored = JSON.parse(localStorage.getItem('aiformsme_leads') || '[]');
      localStorage.setItem('aiformsme_leads', JSON.stringify([lead, ...stored]));
      window.dispatchEvent(new Event('aiformsme_lead_added'));
    } catch (err) {
      console.error(err);
    }
  };

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Handle system prompt adjustments -> Reset chat
  const handleConfigChange = () => {
    setMessages([
      { id: 1, sender: 'bot', text: `Chat reset. Welcome to ${bizName}! How can I help you today?` }
    ]);
    setCollectedData({ name: '', email: '', phone: '', note: '' });
    setBotTrained(true);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const userMsg = inputVal.trim();
    const updatedMessages = [...messages, { id: Date.now(), sender: 'user', text: userMsg }];
    setMessages(updatedMessages);
    setInputVal("");
    setIsTyping(true);

    if (apiKey.trim()) {
      // LIVE OPENROUTER API CHAT FLOW
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "HTTP-Referer": window.location.origin,
            "X-Title": "AIForMSME Studio",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: selectedModel,
            messages: [
              { role: "system", content: `${systemPrompt} Rules: Act strictly within this description. Do NOT hallucinate policies. Keep responses concise and focused.` },
              ...messages.map(m => ({
                role: m.sender === 'user' ? 'user' : 'assistant',
                content: m.text
              })),
              { role: "user", content: userMsg }
            ]
          })
        });

        if (!response.ok) throw new Error(`API Error: ${response.statusText} (${response.status})`);

        const data = await response.json();
        const botResponse = data.choices[0].message.content;

        const finalMessages = [...updatedMessages, { id: Date.now() + 1, sender: 'bot', text: botResponse }];
        setMessages(finalMessages);

        // Parse & Refine leads dynamically using AI on the complete conversation history
        triggerLeadGeneration(finalMessages);

      } catch (err) {
        setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: `API Request Failed: ${err.message}. Please verify your API Key and network.` }]);
      } finally {
        setIsTyping(false);
      }
    } else {
      // LOCAL SIMULATION FALLBACK FLOW
      setTimeout(() => {
        let botResponse = "";
        const textLower = userMsg.toLowerCase();
        const emailMatch = userMsg.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi);
        const hasEmail = emailMatch && emailMatch.length > 0;
        const cleanPhoneNum = userMsg.replace(/[^0-9]/g, "");
        const hasPhone = cleanPhoneNum.length >= 7 && cleanPhoneNum.length <= 15;

        if (textLower.includes("hello") || textLower.includes("hi") || textLower.includes("hey")) {
          botResponse = `Hello there! Welcome to ${bizName}. Are you looking to make a purchase, browse our items, or schedule something?`;
        } 
        else if (textLower.includes("order") || textLower.includes("buy") || textLower.includes("book") || textLower.includes("price") || textLower.includes("hire") || textLower.includes("consult")) {
          botResponse = `I'd love to help you with that! To get started, what is your name?`;
        } 
        else if (hasEmail) {
          const email = emailMatch[0];
          botResponse = `Perfect. I have recorded your email (${email}). I have logged your request. Our team will contact you shortly!`;
        }
        else if (hasPhone) {
          botResponse = `Thank you. I've noted your phone number (${userMsg}). What are details of your inquiry?`;
        }
        else if (collectedData.name === '') {
          const name = userMsg;
          setCollectedData(prev => ({ ...prev, name }));
          botResponse = `Nice to meet you, ${name}! ` + 
            (requireEmail ? `Could you please provide your email address so we can reach you?` : `Could you provide some detail on what you need?`);
        } 
        else {
          botResponse = `Got it! I've logged your request. We will get in touch with you shortly. Thank you!`;
        }

        const finalMessages = [...updatedMessages, { id: Date.now() + 1, sender: 'bot', text: botResponse }];
        setMessages(finalMessages);

        // Parse & Refine leads dynamically using local heuristics on the complete conversation history
        triggerLeadGeneration(finalMessages);
        setIsTyping(false);
      }, 1200);
    }
  };

  const getSimulatedSummary = (historyText) => {
    const textLower = historyText.toLowerCase();
    if (textLower.includes("cake") || textLower.includes("wedding")) {
      return "Wants custom wedding cake consultation";
    }
    if (textLower.includes("croissant") || textLower.includes("bread") || textLower.includes("pastry")) {
      return "Wants to order custom pastries / croissants";
    }
    if (textLower.includes("price") || textLower.includes("quote") || textLower.includes("cost")) {
      return "Requested pricing details & catalog rates";
    }
    if (textLower.includes("book") || textLower.includes("schedule") || textLower.includes("meet")) {
      return "Requested callback scheduling for consultation";
    }
    return "General business callback request";
  };

  const offlineExtractLead = (chatHistoryList) => {
    let name = "N/A";
    let email = "N/A";
    let phone = "N/A";
    let chatConcat = chatHistoryList.map(m => m.text).join(" ");
    
    // Email regex
    const emailMatch = chatConcat.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i);
    if (emailMatch) email = emailMatch[0];

    // Phone regex
    const phoneMatches = chatHistoryList.map(m => m.text.replace(/[^0-9]/g, ""));
    const phoneMatch = phoneMatches.find(p => p.length >= 7 && p.length <= 15);
    if (phoneMatch) phone = phoneMatch;

    // Clean name: find where customer answered the name question
    for (let i = 0; i < chatHistoryList.length; i++) {
      if (chatHistoryList[i].sender === 'bot') {
        const text = chatHistoryList[i].text.toLowerCase();
        if (text.includes("your name") || text.includes("who are you")) {
          let nextMsg = chatHistoryList[i + 1]?.text || "";
          if (nextMsg) {
            let cleaned = nextMsg.replace(/my name is/i, "")
                                 .replace(/i am/i, "")
                                 .replace(/this is/i, "")
                                 .trim();
            
            if (cleaned.toLowerCase().includes("name") && cleaned.toLowerCase().includes("email")) {
              const namePart = cleaned.match(/name\s+([a-zA-Z]+)/i);
              if (namePart) cleaned = namePart[1];
            } else if (cleaned.toLowerCase().includes("name")) {
              const namePart = cleaned.match(/name\s+([a-zA-Z]+)/i);
              if (namePart) cleaned = namePart[1];
            } else {
              const words = cleaned.split(/[^a-zA-Z]+/);
              const properWord = words.find(w => w.length > 2 && w[0] === w[0].toUpperCase());
              if (properWord) cleaned = properWord;
              else cleaned = words[0] || cleaned;
            }
            name = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
          }
          break;
        }
      }
    }

    if (name === "N/A" || name.toLowerCase().includes("cake") || name.toLowerCase().includes("croissant")) {
      const namePart = chatConcat.match(/name\s+([a-zA-Z]+)/i);
      if (namePart) name = namePart[1];
    }

    return {
      name: name.slice(0, 30),
      email,
      phone,
      note: getSimulatedSummary(chatConcat)
    };
  };

  const refineAllLeadFieldsWithAI = async (chatHistory, leadId) => {
    if (!apiKey.trim()) return;
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "AIForMSME Studio",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            {
              role: "system",
              content: "You are a CRM database assistant. Analyze the chat history between the customer and the AI Bot and extract structured details. Return ONLY a valid JSON object. Do not wrap in markdown tags or include any text before or after the JSON. Use N/A if not found. Keep inquiry summary under 10 words.\n\nJSON Schema:\n{\n  \"name\": \"Properly capitalized first & last name. Extract ONLY the human name, clean it of any other sentences or details (e.g. if customer says 'chesse cake 1kg Name Vihaan email...', extract 'Vihaan').\",\n  \"email\": \"Valid email address or 'N/A'\",\n  \"phone\": \"Clean formatted phone number or 'N/A'\",\n  \"inquiry\": \"One-sentence logical summary of what they want (max 10 words, e.g. 'Wants to order 1kg cheesecake').\"\n}"
            },
            {
              role: "user",
              content: `Chat history to extract:\n${chatHistory}`
            }
          ]
        })
      });

      if (!response.ok) throw new Error("API call failed");
      const resData = await response.json();
      
      let rawContent = resData.choices[0].message.content.trim();
      
      // Clean markdown code blocks if returned
      if (rawContent.startsWith("```")) {
        rawContent = rawContent.replace(/```json|```/g, "").trim();
      }

      const parsed = JSON.parse(rawContent);

      const refinedLead = {
        id: leadId,
        name: parsed.name || "N/A",
        email: parsed.email || "N/A",
        phone: parsed.phone || "N/A",
        note: parsed.inquiry || "General Inquiry",
        date: new Date().toISOString().slice(0, 16).replace('T', ' '),
        source: 'Simulator AI'
      };

      saveCapturedLead(refinedLead);

    } catch (err) {
      setLeadsList(prev => prev.map(l => {
        if (l.id === leadId) {
          const fallback = {
            id: leadId,
            name: "Customer Lead",
            email: "Check logs",
            phone: "Check logs",
            note: "AI Refinement failed",
            date: new Date().toISOString().slice(0, 16).replace('T', ' '),
            source: 'Simulator AI'
          };
          saveCapturedLead(fallback);
        }
        return l;
      }));
    }
  };

  const triggerLeadGeneration = (chatHistoryList) => {
    // Check if the history contains at least some contact information to capture
    const hasContactInfo = chatHistoryList.some(m => {
      const text = m.text.toLowerCase();
      const hasEmail = text.includes("@") && text.includes(".");
      const cleanNum = text.replace(/[^0-9]/g, "");
      const hasPhone = cleanNum.length >= 7 && cleanNum.length <= 15;
      return hasEmail || hasPhone;
    });

    if (!hasContactInfo) return; // Wait until contact info exists in the chat

    const tempLeadId = Date.now();
    const isLive = apiKey.trim() !== "";

    // Check if duplicate
    const isDuplicate = leadsList.some(l => l.name === "Extracting..." || (hasContactInfo && chatHistoryList.some(m => m.text.includes(l.email)) && l.email !== 'N/A'));
    if (isDuplicate) return;

    const initialLead = {
      id: tempLeadId,
      name: "Extracting...",
      email: "Extracting...",
      phone: "Extracting...",
      note: isLive ? "Refining with AI..." : "Parsing...",
      date: new Date().toISOString().slice(0, 16).replace('T', ' ')
    };

    setLeadsList(prev => {
      const hasInProgress = prev.some(l => l.name === "Extracting...");
      if (hasInProgress) return prev;
      return [initialLead, ...prev];
    });

    if (!isLive) {
      const parsedLead = offlineExtractLead(chatHistoryList);
      parsedLead.id = tempLeadId;
      parsedLead.date = initialLead.date;
      parsedLead.source = 'Simulator';

      saveCapturedLead(parsedLead);
    } else {
      const chatHistoryStr = chatHistoryList.map(m => `${m.sender === 'user' ? 'Customer' : 'Bot'}: ${m.text}`).join('\n');
      refineAllLeadFieldsWithAI(chatHistoryStr, tempLeadId);
    }
  };

  const clearChat = () => {
    setMessages([
      { id: 1, sender: 'bot', text: `Chat reset. Welcome to ${bizName}! How can I help you today?` }
    ]);
    setCollectedData({ name: '', email: '', phone: '', note: '' });
  };

  const downloadLeadsCSV = () => {
    const headers = 'Name,Email,Phone,Inquiry,Date\n';
    const rows = leadsList.map(l => `"${l.name}","${l.email}","${l.phone}","${l.note.replace(/"/g, '""')}","${l.date}"`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `${bizName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_leads.csv`);
    a.click();
  };

  return (
    <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', alignItems: 'stretch' }}>
        
        {/* Left Side: Bot Builder Form */}
        <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Settings style={{ color: 'hsl(var(--primary-light))' }} size={22} />
            <h3 style={{ fontSize: '1.3rem' }}>1. Customize Your Bot Instructions</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', fontWeight: '600' }}>Business Name</label>
            <input 
              type="text" 
              value={bizName} 
              onChange={(e) => {
                setBizName(e.target.value);
                setBotTrained(false);
              }} 
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                padding: '12px',
                color: 'white',
                fontSize: '0.95rem'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', fontWeight: '600' }}>System Prompts & Knowledge Base</label>
            <textarea 
              rows={4}
              value={systemPrompt} 
              onChange={(e) => {
                setSystemPrompt(e.target.value);
                setBotTrained(false);
              }} 
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                padding: '12px',
                color: 'white',
                fontSize: '0.9rem',
                lineHeight: '1.5',
                resize: 'none'
              }}
            />
            <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>
              Define the AI chatbot's personality, services/products, and constraints.
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
            <span style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', fontWeight: '600' }}>Required Lead Info</span>
            <div style={{ display: 'flex', gap: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={requireEmail} onChange={(e) => {
                  setRequireEmail(e.target.checked);
                  setBotTrained(false);
                }} />
                Capture Email
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={requirePhone} onChange={(e) => {
                  setRequirePhone(e.target.checked);
                  setBotTrained(false);
                }} />
                Capture Phone Number
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
            <span style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', fontWeight: '600' }}>Live OpenRouter Integration (Optional)</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>OpenRouter API Key</label>
              <input 
                type="password" 
                placeholder="sk-or-v1-..."
                value={apiKey} 
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setBotTrained(false);
                }} 
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  padding: '10px',
                  color: 'white',
                  fontSize: '0.85rem'
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Model Selection</label>
              <select 
                value={selectedModel} 
                onChange={(e) => {
                  setSelectedModel(e.target.value);
                  setBotTrained(false);
                }} 
                style={{
                  background: 'rgba(15,23,42,0.9)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  padding: '10px',
                  color: 'white',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              >
                <option value="openrouter/free">Auto-Select Free Model (Recommended)</option>
                <option value="meta-llama/llama-3.1-8b-instruct:free">Llama 3.1 8B (Free)</option>
                <option value="google/gemma-2-9b-it:free">Gemma 2 9B (Free)</option>
                <option value="qwen/qwen-2.5-coder-32b-instruct:free">Qwen 2.5 Coder 32B (Free)</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button 
              className="btn-primary" 
              onClick={handleConfigChange} 
              style={{ width: '100%', padding: '10px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              Deploy & Train AI Agent
            </button>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px 12px', background: 'rgba(0,0,0,0.15)', borderRadius: '6px' }}>
              {botTrained ? (
                <span style={{ color: '#4ade80', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Check size={14} /> Model trained in sandbox! Ready to launch.
                </span>
              ) : (
                <span style={{ color: '#facc15', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  ⚠️ Bot settings not deployed/trained. Click Deploy & Train.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Website Generator Configuration Card */}
        <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Globe style={{ color: 'hsl(var(--secondary-light))' }} size={22} />
            <h3 style={{ fontSize: '1.3rem' }}>2. Generate Custom Webpage</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', fontWeight: '600' }}>URL Slug</label>
              <input 
                type="text" 
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  padding: '10px',
                  color: 'white',
                  fontSize: '0.85rem'
                }}
                placeholder="e.g. joes_bakery"
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', fontWeight: '600' }}>Template Design</label>
              <select 
                value={webTemplate}
                onChange={(e) => handleTemplateChange(e.target.value)}
                style={{
                  background: 'rgba(15,23,42,0.9)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  padding: '10px',
                  color: 'white',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              >
                <option value="bakery">Bakery & Café Layout</option>
                <option value="services">Professional Consulting</option>
                <option value="salon">Spa & Beauty Salon</option>
                <option value="fitness">Fitness Studio Layout</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', fontWeight: '600' }}>Theme Accent</label>
              <select 
                value={webTheme}
                onChange={(e) => setWebTheme(e.target.value)}
                style={{
                  background: 'rgba(15,23,42,0.9)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  padding: '10px',
                  color: 'white',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              >
                <option value="amber">Warm Amber (Cozy)</option>
                <option value="mint">Emerald Mint (Fresh)</option>
                <option value="breeze">Ocean Breeze (Clean)</option>
                <option value="cyber">Cyberpunk Dark (Vibrant Neon)</option>
                <option value="rose">Rose Quartz (Elegant)</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', justifyContent: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer', marginTop: '12px' }}>
                <input type="checkbox" checked={enableChatBot} onChange={(e) => setEnableChatBot(e.target.checked)} />
                Embed Chat Bot Widget
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
            <label style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', fontWeight: '600' }}>Website Headline Banner</label>
            <input 
              type="text" 
              value={webTitle}
              onChange={(e) => setWebTitle(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                padding: '10px',
                color: 'white',
                fontSize: '0.85rem'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', fontWeight: '600' }}>Sub-headline Introduction</label>
            <input 
              type="text" 
              value={webSubtitle}
              onChange={(e) => setWebSubtitle(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                padding: '10px',
                color: 'white',
                fontSize: '0.85rem'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', fontWeight: '600' }}>Detailed About Biography</label>
            <textarea 
              rows={3}
              value={webAbout}
              onChange={(e) => setWebAbout(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                padding: '10px',
                color: 'white',
                fontSize: '0.85rem',
                lineHeight: '1.4',
                resize: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', fontWeight: '600' }}>Custom Catalog Products / Services</span>
              <button 
                type="button" 
                onClick={handleAddProduct}
                style={{ background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.25)', color: 'hsl(var(--secondary-light))', borderRadius: '4px', padding: '3px 8px', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Plus size={12} /> Add Item
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
              {productsList.map((p, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <input 
                    type="text" 
                    value={p.name} 
                    onChange={(e) => handleProductChange(idx, 'name', e.target.value)} 
                    style={{ flex: 1.5, background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.8rem', padding: '2px' }}
                    placeholder="Name"
                  />
                  <input 
                    type="text" 
                    value={p.price} 
                    onChange={(e) => handleProductChange(idx, 'price', e.target.value)} 
                    style={{ flex: 0.8, background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'hsl(var(--secondary-light))', fontSize: '0.8rem', padding: '2px', fontWeight: 'bold' }}
                    placeholder="Price"
                  />
                  <input 
                    type="text" 
                    value={p.desc} 
                    onChange={(e) => handleProductChange(idx, 'desc', e.target.value)} 
                    style={{ flex: 2, background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'hsl(var(--text-muted))', fontSize: '0.8rem', padding: '2px' }}
                    placeholder="Description"
                  />
                  <button 
                    type="button" 
                    onClick={() => handleRemoveProduct(idx)}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}
                  >
                    <Trash size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button 
            type="button"
            className="btn-secondary" 
            onClick={handleGenerateWebsite}
            disabled={!botTrained || webLoading}
            style={{ 
              width: '100%', 
              padding: '12px', 
              marginTop: '10px', 
              fontSize: '0.95rem', 
              background: botTrained ? 'linear-gradient(135deg, hsl(var(--secondary)) 0%, hsl(var(--primary)) 100%)' : '#334155', 
              border: 'none', 
              color: botTrained ? 'white' : 'hsl(var(--text-muted))', 
              fontWeight: 'bold', 
              boxShadow: botTrained ? '0 4px 15px rgba(6, 182, 212, 0.25)' : 'none',
              cursor: botTrained ? 'pointer' : 'not-allowed',
              opacity: botTrained ? 1 : 0.7
            }}
          >
            {!botTrained ? '🔒 Train Bot in Sandbox (Step 1) to Unlock Launch' : (webLoading ? 'Creating Web Assets...' : '✨ Generate & Launch Website')}
          </button>
        </div>

        {/* Success Modal */}
        {showSuccessModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(5, 7, 16, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999
          }}>
            <div className="glass-panel" style={{
              width: '450px',
              padding: '40px',
              background: 'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(139,92,246,0.05) 100%)',
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              boxShadow: 'var(--shadow-lg)'
            }}>
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e', display: 'flex', alignItems: 'center', justify_content: 'center', marginBottom: '8px' }}>
                  <Globe size={28} />
                </div>
                <h3 style={{ fontSize: '1.4rem' }}>Website Generated Successfully!</h3>
                <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>
                  Your fully interactive simulation web page has been created and synced with the Firestore database.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', fontWeight: 'bold' }}>Sandbox URL Link</label>
                <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.8rem', color: 'hsl(var(--secondary-light))', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px' }}>{generatedUrl}</span>
                  <button 
                    onClick={copyToClipboard}
                    style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    {copied ? <Check size={14} style={{ color: '#22c55e' }} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              {!isFirebaseConfigured && (
                <div style={{ background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.25)', borderRadius: '8px', padding: '12px', fontSize: '0.75rem', color: '#facc15', lineHeight: '1.4' }}>
                  ⚠️ **Demo Mode Active**: Firebase credentials are not configured in `.env`. The website is currently saved in local memory/cache. Connect Firebase to share this website link externally.
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button 
                  onClick={() => setShowSuccessModal(false)}
                  className="btn-secondary"
                  style={{ flex: 1, padding: '10px', fontSize: '0.85rem' }}
                >
                  Close Window
                </button>
                <a 
                  href={generatedUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-primary"
                  style={{ flex: 1.2, padding: '10px', fontSize: '0.85rem', justifyContent: 'center' }}
                  onClick={() => setShowSuccessModal(false)}
                >
                  Visit Website <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Right Side: Visual Mobile Simulator */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '380px',
            height: '520px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            border: '2px solid hsl(var(--primary) / 0.3)',
            boxShadow: 'var(--shadow-glow)'
          }}>
            {/* Simulator Header */}
            <div style={{ 
              background: 'linear-gradient(135deg, hsl(var(--primary) / 0.15) 0%, rgba(255,255,255,0.02) 100%)',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'hsl(var(--primary) / 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'hsl(var(--primary-light))'
                }}>
                  <Bot size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.9rem' }}>{bizName} AI</h4>
                  <span style={{ fontSize: '0.75rem', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
                    Online Agent
                  </span>
                </div>
              </div>

              <button 
                onClick={clearChat}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'hsl(var(--text-muted))',
                  cursor: 'pointer',
                  padding: '4px'
                }}
                title="Reset Chat"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {/* Chat Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  style={{ 
                    display: 'flex', 
                    flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row', 
                    gap: '8px',
                    alignItems: 'flex-end',
                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%'
                  }}
                >
                  {msg.sender === 'bot' && (
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: 'hsl(var(--primary) / 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'hsl(var(--primary-light))',
                      flexShrink: 0
                    }}>
                      <Bot size={12} />
                    </div>
                  )}
                  <div className="glass-panel" style={{
                    padding: '10px 14px',
                    fontSize: '0.85rem',
                    borderRadius: msg.sender === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                    background: msg.sender === 'user' ? 'hsl(var(--primary) / 0.15)' : 'rgba(255,255,255,0.03)',
                    border: msg.sender === 'user' ? '1px solid hsl(var(--primary) / 0.3)' : '1px solid rgba(255,255,255,0.06)'
                  }}>
                    {msg.text}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: 'hsl(var(--primary) / 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'hsl(var(--primary-light))'
                  }}>
                    <Bot size={12} />
                  </div>
                  <div className="glass-panel" style={{ padding: '8px 12px', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <span className="dot" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#fff', opacity: 0.4, animation: 'pulse 1s infinite alternate' }} />
                      <span className="dot" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#fff', opacity: 0.4, animation: 'pulse 1s infinite alternate 0.2s' }} />
                      <span className="dot" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#fff', opacity: 0.4, animation: 'pulse 1s infinite alternate 0.4s' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} style={{ display: 'flex', borderTop: '1px solid rgba(255,255,255,0.08)', padding: '10px' }}>
              <input 
                type="text" 
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Ask chatbot anything... (e.g. hello)"
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  padding: '10px',
                  color: 'white',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
              <button 
                type="submit" 
                className="btn-icon" 
                style={{ width: '36px', height: '36px', backgroundColor: 'hsl(var(--primary) / 0.2)', border: 'none', color: 'hsl(var(--primary-light))' }}
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Captured Leads Table */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Table style={{ color: 'hsl(var(--secondary-light))' }} size={22} />
            <h3 style={{ fontSize: '1.2rem' }}>Leads Captured by AI Agent (Simulation Database)</h3>
          </div>
          <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.8rem' }} onClick={downloadLeadsCSV}>
            <Download size={14} style={{ marginRight: '6px' }} /> Download Excel (CSV)
          </button>
        </div>

        <div style={{ overflowX: 'auto', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <th style={{ padding: '12px 16px' }}>Name</th>
                <th style={{ padding: '12px 16px' }}>Email</th>
                <th style={{ padding: '12px 16px' }}>Phone</th>
                <th style={{ padding: '12px 16px' }}>Inquiry Description</th>
                <th style={{ padding: '12px 16px' }}>Source</th>
                <th style={{ padding: '12px 16px' }}>Captured On</th>
              </tr>
            </thead>
            <tbody>
              {leadsList.map((lead, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: '600' }}>{lead.name}</td>
                  <td style={{ padding: '12px 16px', color: 'hsl(var(--secondary-light))' }}>{lead.email}</td>
                  <td style={{ padding: '12px 16px' }}>{lead.phone}</td>
                  <td style={{ padding: '12px 16px', color: 'hsl(var(--text-secondary))' }}>{lead.note}</td>
                  <td style={{ padding: '12px 16px', color: 'hsl(var(--primary-light))', fontWeight: '500' }}>{lead.source || 'Simulator'}</td>
                  <td style={{ padding: '12px 16px', color: 'hsl(var(--text-muted))' }}>{lead.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
