import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Truck, 
  HelpCircle, 
  Settings, 
  Send, 
  Mic, 
  MicOff,
  RefreshCw, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Box,
  ArrowRight,
  User,
  Menu,
  X,
  MessageCircle,
  Plus,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  ThumbsUp,
  Sparkles,
  Undo2,
  BarChart3,
  Bell,
  UserCheck,
  Activity,
  Key
} from 'lucide-react';

// Avatar logo — uses the generated AI avatar photo with a circular clip and glow ring
function AvatarLogo({ className = "h-10 w-10", ringSize = 2 }) {
  return (
    <div
      className={`${className} relative shrink-0 rounded-full`}
      style={{
        background: 'linear-gradient(135deg, #4F46E5, #06B6D4)',
        padding: ringSize,
      }}
    >
      {/* Soft outer glow */}
      <div
        style={{
          position: 'absolute',
          inset: -2,
          borderRadius: '9999px',
          background: 'linear-gradient(135deg, rgba(79,70,229,0.35), rgba(6,182,212,0.35))',
          filter: 'blur(6px)',
          zIndex: 0,
        }}
      />
      <img
        src="/avatar-circle.jpg"
        alt="Mohammad Wasim — CarePilot AI"
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '9999px',
          objectFit: 'cover',
          objectPosition: 'center top',
          display: 'block',
          position: 'relative',
          zIndex: 1,
        }}
      />
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState('chat'); // Chat is primary
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userId, setUserId] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  // Backend connection status: 'connecting' | 'connected' | 'error'
  const [backendStatus, setBackendStatus] = useState('connecting');
  // Welcome splash screen — shown once on first load
  const [showWelcome, setShowWelcome] = useState(true);

  // The ADK backend base URL — loads from environment variable or falls back based on host origin
  const ADK_BASE = import.meta.env.VITE_API_URL || (
    window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:8080'
      : (window.location.hostname.match(/^\d+\.\d+\.\d+\.\d+$/)
        ? `http://${window.location.hostname}:8080`
        : window.location.origin)
  );
  
  // Refs to guarantee up-to-date values across asynchronous event handlers
  const userIdRef = useRef('');
  const sessionIdRef = useRef('');
  const isInitializing = useRef(false);

  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  // Recent Chat History
  const [chatSessions, setChatSessions] = useState([
    { id: '1', title: 'Order Tracking #345678', date: 'Just now', messages: [] },
    { id: '2', title: 'Refund Policy & Window', date: '2 hours ago', messages: [
      { role: 'user', text: 'How long do refunds take?', sender: 'You' },
      { role: 'agent', text: 'Once processed, credits will appear on your bank statement or card balance within 3-5 business days depending on your financial institution.', sender: 'CarePilot AI' }
    ] },
    { id: '3', title: 'Shipping rates info', date: 'Yesterday', messages: [
      { role: 'user', text: 'What are your shipping rates?', sender: 'You' },
      { role: 'agent', text: 'Standard shipping is $4.99, and is free for orders over $50. Standard delivery takes 3-5 business days.', sender: 'CarePilot AI' }
    ] }
  ]);
  const [selectedSessionId, setSelectedSessionId] = useState('1');

  // Tracking page state
  const [trackingNumber, setTrackingNumber] = useState('');
  const [hasSearchedTracking, setHasSearchedTracking] = useState(false);
  const [searchedNum, setSearchedNum] = useState('');

  // Returns & Refunds state
  const [returnOrderNum, setReturnOrderNum] = useState('');
  const [returnReason, setReturnReason] = useState('Wrong size');
  const [isReturnSubmitted, setIsReturnSubmitted] = useState(false);

  // FAQ page state
  const [faqSearch, setFaqSearch] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [activeFaqCategory, setActiveFaqCategory] = useState('all');

  // Settings State
  const [profileName, setProfileName] = useState('Mohammad Wasim');
  const [profileEmail, setProfileEmail] = useState('mohdwasim.tech@gmail.com');
  const [profileRole, setProfileRole] = useState('Founder & AI Developer');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifBrowser, setNotifBrowser] = useState(false);

  const chatEndRef = useRef(null);

  // High Fidelity Hackathon Demo Data Specifications
  const demoTrackingData = {
    'CP123456': {
      orderId: 'ORD-776251',
      trackingNum: 'CP123456',
      status: 'Delivered',
      location: 'Front Door Porch - Seattle, WA',
      destination: 'San Francisco, CA',
      delivery: 'July 16, 2026 at 2:30 PM',
      courier: 'CarePilot Express Logistics',
      orderDate: 'July 12, 2026',
      lastUpdate: 'July 16, 2026 at 2:35 PM',
      weight: '1.8 lbs',
      method: 'Standard Express Ground',
      timeline: [
        { time: 'July 16, 2026 - 2:30 PM', desc: 'Package delivered and photo confirmation uploaded.' },
        { time: 'July 16, 2026 - 8:45 AM', desc: 'Out for delivery on local route vehicle.' },
        { time: 'July 15, 2026 - 11:20 PM', desc: 'Arrived at destination transit sorting facility.' },
        { time: 'July 12, 2026 - 4:00 PM', desc: 'Order received and package prepared for pickup.' }
      ]
    },
    'CP234567': {
      orderId: 'ORD-991823',
      trackingNum: 'CP234567',
      status: 'In Transit',
      location: 'Central Distribution Center - Dallas, TX',
      destination: 'Austin, TX',
      delivery: 'July 20, 2026 (Estimated)',
      courier: 'CarePilot Express Logistics',
      orderDate: 'July 15, 2026',
      lastUpdate: 'July 18, 2026 at 10:14 AM',
      weight: '3.5 lbs',
      method: 'Premium Air Express',
      timeline: [
        { time: 'July 18, 2026 - 10:14 AM', desc: 'Departed Dallas Distribution Center.' },
        { time: 'July 17, 2026 - 2:10 PM', desc: 'Scanned at regional processing depot.' },
        { time: 'July 15, 2026 - 10:00 AM', desc: 'Order processed by merchant.' }
      ]
    },
    'CP345678': {
      orderId: 'ORD-882736',
      trackingNum: 'CP345678',
      status: 'Out for Delivery',
      location: 'Local Delivery Vehicle - Seattle, WA',
      destination: 'Seattle, WA',
      delivery: 'July 18, 2026 (Today by 8:00 PM)',
      courier: 'CarePilot Express Logistics',
      orderDate: 'July 14, 2026',
      lastUpdate: 'July 18, 2026 at 7:30 AM',
      weight: '2.2 lbs',
      method: 'Local Next-Day Express',
      timeline: [
        { time: 'July 18, 2026 - 7:30 AM', desc: 'Out for delivery on local route courier.' },
        { time: 'July 17, 2026 - 9:00 PM', desc: 'Sorted and loaded onto local van.' },
        { time: 'July 14, 2026 - 11:30 AM', desc: 'Order details confirmed.' }
      ]
    },
    'CP456789': {
      orderId: 'ORD-445512',
      trackingNum: 'CP456789',
      status: 'Delayed',
      location: 'Weather Hold Facility - Chicago, IL',
      destination: 'Boston, MA',
      delivery: 'July 21, 2026 (Updated)',
      courier: 'CarePilot Express Logistics',
      orderDate: 'July 13, 2026',
      lastUpdate: 'July 18, 2026 at 1:05 PM',
      weight: '4.1 lbs',
      method: 'Standard Ground Shipping',
      timeline: [
        { time: 'July 18, 2026 - 1:05 PM', desc: 'Held due to severe storm disruptions in Chicago.' },
        { time: 'July 16, 2026 - 4:30 PM', desc: 'Scanned at Chicago logistics transit hub.' },
        { time: 'July 13, 2026 - 9:00 AM', desc: 'Package pickup confirmed by courier.' }
      ]
    },
    'CP567890': {
      orderId: 'ORD-332115',
      trackingNum: 'CP567890',
      status: 'Return Initiated',
      location: 'Return Processing Dropoff - New York, NY',
      destination: 'Return Processing Facility - Newark, NJ',
      delivery: 'July 23, 2026 (Return In Transit)',
      courier: 'CarePilot Express Logistics',
      orderDate: 'July 10, 2026',
      lastUpdate: 'July 17, 2026 at 11:20 AM',
      weight: '1.2 lbs',
      method: 'Prepaid Return Service',
      timeline: [
        { time: 'July 17, 2026 - 11:20 AM', desc: 'Prepaid shipping label scanned at dropoff partner.' },
        { time: 'July 16, 2026 - 5:00 PM', desc: 'Return authorization requested and approved.' }
      ]
    },
    'CP678901': {
      orderId: 'ORD-115267',
      trackingNum: 'CP678901',
      status: 'Refund Completed',
      location: 'Processing Bank - San Francisco, CA',
      destination: 'Cardholder Bank Account',
      delivery: 'Refund posted on July 17, 2026',
      courier: 'CarePilot Express Logistics',
      orderDate: 'July 08, 2026',
      lastUpdate: 'July 17, 2026 at 4:55 PM',
      weight: '2.0 lbs',
      method: 'Original Payment Refund',
      timeline: [
        { time: 'July 17, 2026 - 4:55 PM', desc: 'Merchant credit posted to original payment method.' },
        { time: 'July 15, 2026 - 2:00 PM', desc: 'Returned item inspected and credit approved.' },
        { time: 'July 13, 2026 - 10:15 AM', desc: 'Returned package received at depot.' }
      ]
    }
  };

  // Initialize session
  useEffect(() => {
    initSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scroll to bottom of chat
  useEffect(() => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  }, [messages, isTyping]);

  const initSession = async () => {
    if (isInitializing.current) return;
    isInitializing.current = true;
    setBackendStatus('connecting');

    const generatedUid = "user-" + Math.random().toString(36).substring(2, 11);
    setUserId(generatedUid);

    // Retry up to 5 times with exponential backoff (1s, 2s, 3s, 4s, 5s)
    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        const res = await fetch(`${ADK_BASE}/apps/app/users/${generatedUid}/sessions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ state: {} })
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setSessionId(data.id);
        setBackendStatus('connected');
        isInitializing.current = false;
        return; // success — exit retry loop
      } catch (err) {
        console.warn(`[CarePilot] Session init attempt ${attempt}/5 failed:`, err.message);
        if (attempt < 5) {
          await new Promise(resolve => setTimeout(resolve, attempt * 1000));
        } else {
          console.error('[CarePilot] All session init attempts failed. Backend unreachable.');
          setBackendStatus('error');
          isInitializing.current = false;
        }
      }
    }
  };

  const handleResetSession = async () => {
    if (confirm("Are you sure you want to reset your conversation history?")) {
      setMessages([]);
      isInitializing.current = false;
      await initSession();
      alert("Conversation history has been reset.");
    }
  };

  const switchSession = (session) => {
    setSelectedSessionId(session.id);
    setMessages(session.messages);
    setActiveTab('chat');
    setIsMobileMenuOpen(false);
  };

  const createNewSession = async () => {
    const newId = (chatSessions.length + 1).toString();
    const newSession = {
      id: newId,
      title: `New Support Case #${newId}`,
      date: 'Just now',
      messages: []
    };
    setChatSessions([newSession, ...chatSessions]);
    setSelectedSessionId(newId);
    setMessages([]);
    isInitializing.current = false;
    await initSession();
    setActiveTab('chat');
  };

  const submitPrompt = (text) => {
    setActiveTab('chat');
    setTimeout(() => {
      handleSendMessage(text);
    }, 100);
  };

  const handleSendMessage = async (textToSend) => {
    const message = textToSend || inputMessage;
    const trimmed = message.trim();
    if (!trimmed) return;

    if (!textToSend) {
      setInputMessage('');
    }

    const userMsg = { role: 'user', text: trimmed, sender: 'You' };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsTyping(true);

    // Update active session transcript in the left sidebar list
    setChatSessions(prev => prev.map(s => s.id === selectedSessionId ? { ...s, messages: updatedMessages } : s));

    // Ensure session is initialized by resolving refs (waits up to 3 seconds if needed)
    let currentUserId = userIdRef.current;
    let currentSessionId = sessionIdRef.current;

    if (!currentSessionId || !currentUserId) {
      for (let i = 0; i < 30; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        currentUserId = userIdRef.current;
        currentSessionId = sessionIdRef.current;
        if (currentUserId && currentSessionId) break;
      }
    }

    if (!currentSessionId || !currentUserId) {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        role: 'agent',
        text: "Session is still initializing. Please wait a second and try again.",
        sender: 'CarePilot AI'
      }]);
      return;
    }

    let agentResponseText = '';

    try {
      const response = await fetch(`${ADK_BASE}/run_sse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          app_name: 'app',
          user_id: currentUserId,
          session_id: currentSessionId,
          new_message: {
            role: 'user',
            parts: [{ text: trimmed }]
          },
          streaming: true
        })
      });

      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }

      setIsTyping(false);
      const initialAgentState = [...updatedMessages, { role: 'agent', text: '', sender: 'CarePilot AI' }];
      setMessages(initialAgentState);

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let _hasFaqChunks = false;

      const updateAgentMessage = (text) => {
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: 'agent',
            text: text,
            sender: 'CarePilot AI'
          };
          // Sync with sidebar session list
          setChatSessions(sessions => sessions.map(s => s.id === selectedSessionId ? { ...s, messages: updated } : s));
          return updated;
        });
      };

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const event = JSON.parse(line.substring(6));
              const path = event.nodeInfo?.path || event.node_info?.path || '';
              const author = event.author || '';
              
              // Only process nodes related to faq_agent or the final save_agent_response
              const isFaqNode = author === 'faq_agent' || path.includes('faq_agent');
              const isFinalNode = author === 'save_agent_response' || path.includes('save_agent_response');
              
              if (isFaqNode) {
                const text = event.content?.parts?.[0]?.text;
                if (text) {
                  _hasFaqChunks = true;
                  agentResponseText += text;
                  updateAgentMessage(agentResponseText);
                }
              } else if (isFinalNode) {
                const finalOutput = event.output || '';
                if (finalOutput) {
                  agentResponseText = finalOutput;
                  updateAgentMessage(agentResponseText);
                }
              }
            } catch (e) {
              console.error("Error parsing event:", e);
            }
          }
        }
      }

      if (!agentResponseText) {
        updateAgentMessage("I'm sorry, I encountered a connection issue while processing your request. Please try again.");
      }

    } catch (err) {
      console.error(err);
      setIsTyping(false);
      setMessages(prev => [...prev, {
        role: 'agent',
        text: "Oops! We encountered an error connecting to CarePilot AI. Please check that the local server is running and try again.",
        sender: 'CarePilot AI'
      }]);
    }
  };

  const handleMicClick = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Speech recognition is not supported in this browser. Try Chrome or Safari.");
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    recognition.onstart = () => {
      setIsListening(true);
    };
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputMessage(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => {
      setIsListening(false);
    };
    recognition.onend = () => {
      setIsListening(false);
    };
    recognition.start();
  };

  const handleTrackingSearch = (e) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;
    setSearchedNum(trackingNumber.trim());
    setHasSearchedTracking(true);
  };

  const launchDemoTracking = (num) => {
    setTrackingNumber(num);
    setSearchedNum(num);
    setHasSearchedTracking(true);
    setActiveTab('tracking');
  };

  const handleTryQuestionClick = (q) => {
    setActiveTab('chat');
    setShowWelcome(false);
    // Small delay so tab switches first, then auto-send
    setTimeout(() => handleSendMessage(q), 80);
  };

  const handleStartDemoAction = () => {
    setShowWelcome(false);
    setActiveTab('chat');
    setTimeout(() => handleSendMessage('Track my shipment CP345678'), 100);
  };

  const handleReturnSubmit = (e) => {
    e.preventDefault();
    if (!returnOrderNum.trim()) return;
    setIsReturnSubmitted(true);
  };

  const parseInlineMarkdown = (text) => {
    // Split by ** for bold
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, pIdx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={pIdx} className="font-extrabold text-[#F8FAFC]">{part.slice(2, -2)}</strong>;
      }
      // Split by * for italics
      const subparts = part.split(/(\*.*?\*)/g);
      return subparts.map((subpart, sIdx) => {
        if (subpart.startsWith('*') && subpart.endsWith('*')) {
          return <em key={sIdx} className="italic text-[#CBD5E1]">{subpart.slice(1, -1)}</em>;
        }
        // Split by ` for inline code
        const codeParts = subpart.split(/(`.*?`)/g);
        return codeParts.map((cPart, cIdx) => {
          if (cPart.startsWith('`') && cPart.endsWith('`')) {
            return <code key={cIdx} className="bg-[#0F172A] text-[#06B6D4] px-1.5 py-0.5 rounded font-mono text-xs font-semibold">{cPart.slice(1, -1)}</code>;
          }
          return cPart;
        });
      });
    });
  };

  const renderMessageText = (text) => {
    if (!text) return null;
    
    // Split by code blocks ```
    const parts = text.split(/(```[\s\S]*?```)/g);
    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const codeContent = part.slice(3, -3).trim();
        const firstLineEnd = codeContent.indexOf('\n');
        let lang = '';
        let code = codeContent;
        if (firstLineEnd !== -1) {
          const potentialLang = codeContent.substring(0, firstLineEnd).trim();
          if (potentialLang && potentialLang.length < 15) {
            lang = potentialLang;
            code = codeContent.substring(firstLineEnd + 1);
          }
        }
        return (
          <div key={index} className="my-3 rounded-xl overflow-hidden border border-white/8 font-mono text-xs shadow-md">
            {lang && (
              <div className="bg-[#0F172A]/60 px-4 py-2 text-[10px] font-bold text-[#CBD5E1] uppercase tracking-wider border-b border-white/8 flex justify-between items-center">
                <span>{lang}</span>
                <span className="text-[9px] lowercase font-normal text-[#94A3B8]">syntax highlighted</span>
              </div>
            )}
            <pre className="bg-[#1E293B] text-[#F8FAFC] p-4 overflow-x-auto">
              <code>{code}</code>
            </pre>
          </div>
        );
      }
      
      const lines = part.split('\n');
      return lines.map((line, lIdx) => {
        // Parse list items starting with '-' or '*'
        const listMatch = line.match(/^(\s*)([-*+]|\d+\.)\s+(.*)/);
        if (listMatch) {
          const indent = listMatch[1].length * 4;
          const _bullet = listMatch[2];
          const rest = listMatch[3];
          
          return (
            <div key={lIdx} style={{ paddingLeft: `${indent + 12}px` }} className="flex gap-2 my-1 items-start text-[14.5px] leading-relaxed">
              <span className="text-[#4F46E5] font-extrabold select-none">•</span>
              <span className="flex-grow">{parseInlineMarkdown(rest)}</span>
            </div>
          );
        }

        return (
          <p key={lIdx} className="my-1.5 min-h-[1.2em] leading-relaxed text-[14.5px]">
            {parseInlineMarkdown(line)}
          </p>
        );
      });
    });
  };

  const faqs = [
    { category: 'shipping', q: 'What are your standard shipping charges?', a: 'Standard shipping is $4.99 flat-rate. All orders over $50 qualify for free shipping. Standard delivery takes 3-5 business days.' },
    { category: 'shipping', q: 'Do you offer express or next-day delivery?', a: 'Yes! Express delivery (1-2 business days) is available for $12.99. Next-day delivery is $19.99 and must be placed before 12:00 PM local time.' },
    { category: 'shipping', q: 'Do you ship internationally?', a: 'We currently ship to all 50 US states and Canada. International shipping to the UK, Australia, and Europe is planned for Q4 2026.' },
    { category: 'shipping', q: 'How do I track my shipment?', a: 'Go to the Order Tracking tab and enter your tracking number (e.g. CP345678). You can also ask the AI chat: "Track my shipment CP345678" and get a live status update.' },
    { category: 'shipping', q: 'What happens if my package is delayed?', a: 'If your order is delayed beyond the estimated delivery date, our AI agent will automatically flag it and issue a delivery guarantee credit of $5 to your account within 24 hours.' },
    { category: 'cancellation', q: 'Can I cancel my order?', a: 'You can cancel within 2 hours of placing the order. After that, the package may already be picked up. Contact our AI Chat immediately with your order ID for instant cancellation.' },
    { category: 'cancellation', q: 'What if I ordered the wrong item?', a: 'No worries! If you ordered the wrong item, you can initiate a return within 30 days of delivery. Go to Returns & Refunds and use your order number. We cover return shipping costs.' },
    { category: 'refunds', q: 'How long does a refund take?', a: 'Refunds are processed within 2 business days once the return is received. Credits appear on your bank statement within 3-5 business days depending on your card issuer.' },
    { category: 'refunds', q: 'How do I request a refund?', a: 'Visit the Returns & Refunds tab, enter your order number, select a reason, and click Generate Return Label. A prepaid label is emailed to you instantly.' },
    { category: 'refunds', q: 'Will I receive a full refund?', a: 'Yes — if the item is returned undamaged and within 30 days, you receive a 100% refund including any taxes paid. Items damaged by the customer may receive a partial refund.' },
    { category: 'refunds', q: 'Can I get a refund without returning the item?', a: 'In cases of incorrect or defective items, we may issue a full refund without requiring a return. Provide a photo of the issue via our AI Chat and our team reviews within 1 business day.' },
    { category: 'shipping', q: 'What carriers do you use?', a: 'CarePilot Express Logistics is our primary carrier. We also partner with FedEx and UPS for express and next-day options depending on your region.' },
    { category: 'cancellation', q: 'Is there a restocking fee for returns?', a: 'No restocking fees, ever. Returns are completely free within 30 days of delivery. We also cover the prepaid return shipping label at no cost to you.' }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.q.toLowerCase().includes(faqSearch.toLowerCase()) ||
                          faq.a.toLowerCase().includes(faqSearch.toLowerCase());
    const matchesCategory = activeFaqCategory === 'all' || faq.category === activeFaqCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate delivery timeline steps based on status
  const getStepperStatus = (status) => {
    switch (status) {
      case 'Delivered':
      case 'Refund Completed':
        return 4;
      case 'Out for Delivery':
        return 3;
      case 'In Transit':
      case 'Delayed':
        return 2;
      case 'Return Initiated':
        return 1;
      default:
        return 0;
    }
  };

  // ─── WELCOME SPLASH SCREEN ───────────────────────────────────────────────────
  if (showWelcome) {
    const DEMO_PROMPTS = [
      'Where is my order?', 'Track my shipment', 'Return my package',
      'Refund my order', 'Shipping charges', 'Delivery time',
      'Cancel my order', 'Express delivery'
    ];
    const DEMO_KEYS = [
      { code: 'CP123456', status: 'Delivered',         color: 'text-[#10B981]', bg: 'bg-[#10B981]/10 border-[#10B981]/20' },
      { code: 'CP234567', status: 'In Transit',        color: 'text-[#4F46E5]', bg: 'bg-[#4F46E5]/10 border-[#4F46E5]/20' },
      { code: 'CP345678', status: 'Out For Delivery',  color: 'text-[#06B6D4]', bg: 'bg-[#06B6D4]/10 border-[#06B6D4]/20' },
      { code: 'CP456789', status: 'Delayed',           color: 'text-[#EF4444]', bg: 'bg-[#EF4444]/10 border-[#EF4444]/20' },
      { code: 'CP567890', status: 'Return Initiated',  color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/10 border-[#F59E0B]/20' },
      { code: 'CP678901', status: 'Refund Completed',  color: 'text-[#10B981]', bg: 'bg-[#10B981]/10 border-[#10B981]/20' },
    ];
    return (
      <div className="min-h-screen w-screen bg-[#0F172A] text-white overflow-y-auto font-sans animate-fade-in">
        {/* Top brand bar */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-white/8 bg-[#111827]/60 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <AvatarLogo className="h-9 w-9" ringSize={2} />
            <span className="font-outfit font-extrabold text-lg tracking-tight">CarePilot AI</span>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold border ${
              backendStatus === 'connected' ? 'bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]' :
              backendStatus === 'error'     ? 'bg-[#EF4444]/10 border-[#EF4444]/30 text-[#EF4444]' :
                                              'bg-[#F59E0B]/10 border-[#F59E0B]/30 text-[#F59E0B]'
            }`}>
              <span className={`h-2 w-2 rounded-full ${
                backendStatus === 'connected' ? 'bg-[#10B981] animate-pulse' :
                backendStatus === 'error'     ? 'bg-[#EF4444]' : 'bg-[#F59E0B] animate-pulse'
              }`} />
              {backendStatus === 'connected' ? '🟢 ADK Backend Connected' :
               backendStatus === 'error'     ? '🔴 Backend Offline' : '🟡 Connecting...'}
            </div>
            <button
              onClick={() => setShowWelcome(false)}
              className="px-4 py-2 text-xs font-bold text-[#CBD5E1] hover:text-white border border-white/10 hover:border-white/30 rounded-xl transition-all duration-150 cursor-pointer"
            >Skip Intro →</button>
          </div>
        </div>

        {/* Hero */}
        <div className="max-w-5xl mx-auto px-6 pt-16 pb-10 text-center">
          <div className="flex justify-center mb-8">
            <AvatarLogo className="h-24 w-24" ringSize={3} />
          </div>
          <div className="inline-flex items-center gap-2 bg-[#4F46E5]/10 border border-[#4F46E5]/30 text-[#A5B4FC] text-[11px] font-extrabold px-4 py-2 rounded-full mb-6 uppercase tracking-wider">
            <span className="h-1.5 w-1.5 rounded-full bg-[#4F46E5] animate-pulse" />
            Powered by Google ADK · Gemini 2.5 Flash
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold font-outfit tracking-tight mb-4 bg-gradient-to-r from-white via-[#A5B4FC] to-[#06B6D4] bg-clip-text text-transparent leading-tight">
            Welcome to CarePilot AI
          </h1>
          <p className="text-lg font-semibold text-[#CBD5E1] mb-3">Your Intelligent Customer Support Agent</p>
          <p className="text-sm text-[#94A3B8] max-w-2xl mx-auto leading-relaxed mb-10">
            CarePilot AI is a production-ready AI customer support platform built on Google ADK.
            It handles <strong className="text-white">Order Tracking</strong>, <strong className="text-white">Shipping Information</strong>, <strong className="text-white">Returns</strong>,{' '}
            <strong className="text-white">Refunds</strong>, <strong className="text-white">Delivery Status</strong>, and <strong className="text-white">FAQs</strong> — all powered by a real Gemini LLM agent.
          </p>

          {/* Primary CTA */}
          <button
            onClick={handleStartDemoAction}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-[#4F46E5] to-[#06B6D4] hover:from-[#2563EB] hover:to-[#0891B2] text-white font-extrabold text-base px-10 py-4 rounded-2xl shadow-2xl shadow-[#4F46E5]/30 transition-all duration-200 hover:-translate-y-1 active:translate-y-0 cursor-pointer mb-4"
          >
            <span>🚀 Start Demo</span>
            <ArrowRight className="h-5 w-5" />
          </button>
          <p className="text-[11px] text-[#94A3B8] mb-14">Automatically sends: <span className="font-mono text-[#06B6D4]">&quot;Track my shipment CP345678&quot;</span> — just watch the AI respond.</p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-16">
            {['📦 Order Tracking', '🚚 Shipping Info', '↩️ Returns', '💳 Refunds', '📍 Delivery Status', '❓ FAQs'].map(f => (
              <span key={f} className="bg-[#1E293B] border border-white/8 text-[#CBD5E1] text-xs font-bold px-4 py-2 rounded-full">{f}</span>
            ))}
          </div>
        </div>

        {/* Demo Credentials + Prompts */}
        <div className="max-w-5xl mx-auto px-6 pb-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Demo Tracking Numbers */}
          <div className="bg-[#1E293B] border border-white/8 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <Key className="h-4.5 w-4.5 text-[#4F46E5]" />
              <h3 className="text-sm font-extrabold text-white">Demo Credentials</h3>
            </div>
            <p className="text-[11px] text-[#94A3B8] mb-5">Click any tracking number to instantly load it in the Order Tracking tab.</p>
            <div className="grid grid-cols-2 gap-3">
              {DEMO_KEYS.map(({ code, status, color, bg }) => (
                <button
                  key={code}
                  onClick={() => { launchDemoTracking(code); setShowWelcome(false); }}
                  className={`border rounded-xl p-3 text-left hover:scale-[1.02] transition-all duration-150 cursor-pointer ${bg}`}
                >
                  <div className="font-mono text-xs font-extrabold text-white mb-1">{code}</div>
                  <div className={`text-[10px] font-bold ${color}`}>{status}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Demo Prompts */}
          <div className="bg-[#1E293B] border border-white/8 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4.5 w-4.5 text-[#06B6D4]" />
              <h3 className="text-sm font-extrabold text-white">Quick Demo Prompts</h3>
            </div>
            <p className="text-[11px] text-[#94A3B8] mb-5">Click any chip — it auto-sends directly to the AI agent.</p>
            <div className="flex flex-wrap gap-2">
              {DEMO_PROMPTS.map(p => (
                <button
                  key={p}
                  onClick={() => handleTryQuestionClick(p)}
                  className="bg-[#0F172A] hover:bg-[#4F46E5]/20 border border-white/8 hover:border-[#4F46E5]/40 text-[#CBD5E1] hover:text-white text-[11px] font-bold px-4 py-2 rounded-full transition-all duration-150 cursor-pointer"
                >
                  {p}
                </button>
              ))}
            </div>

            {/* How it works */}
            <div className="mt-6 border-t border-white/8 pt-5">
              <p className="text-[11px] font-extrabold text-white uppercase tracking-wider mb-3">How It Works</p>
              <div className="flex flex-col gap-2">
                {[
                  ['1', 'Click 🚀 Start Demo or any prompt chip'],
                  ['2', 'AI agent classifies intent via Gemini 2.5'],
                  ['3', 'Routes to FAQ, Tracking, or Refund node'],
                  ['4', 'Returns a clean, real AI response'],
                ].map(([n, t]) => (
                  <div key={n} className="flex items-start gap-3">
                    <span className="h-5 w-5 rounded-full bg-[#4F46E5]/20 text-[#4F46E5] text-[10px] font-extrabold flex items-center justify-center shrink-0">{n}</span>
                    <span className="text-[11px] text-[#CBD5E1] font-medium">{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* About footer */}
        <div className="border-t border-white/8 bg-[#111827]/60">
          <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <AvatarLogo className="h-10 w-10" ringSize={2} />
              <div>
                <p className="text-sm font-extrabold text-white">Mohammad Wasim</p>
                <p className="text-[11px] text-[#06B6D4] font-bold">Founder & AI Developer</p>
              </div>
            </div>
            <div className="flex gap-3 flex-wrap justify-center">
              {['Google ADK', 'Gemini 2.5 Flash', 'FastAPI', 'React', 'Vite'].map(t => (
                <span key={t} className="text-[10px] font-bold text-[#94A3B8] bg-[#1E293B] border border-white/8 px-3 py-1.5 rounded-full">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden font-sans bg-[#0F172A] text-[#F8FAFC] animate-fade-in">
      
      {/* 1. Left Sidebar Navigation */}
      <aside className={`w-72 bg-[#111827] flex flex-col p-6 border-r border-white/8 shrink-0 z-30 transition-transform duration-350 ease-in-out fixed md:relative h-full ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        
        {/* Mobile menu close header */}
        <div className="flex justify-between items-center mb-6 md:hidden">
          <span className="font-bold text-xs uppercase tracking-wider text-[#CBD5E1]">Navigation</span>
          <button onClick={() => setIsMobileMenuOpen(false)} className="p-1.5 text-[#CBD5E1] hover:text-white rounded-lg hover:bg-white/5 transition-all duration-150">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Logo Section */}
        <div className="flex items-center gap-3.5 mb-2">
          <AvatarLogo className="h-10 w-10" ringSize={2} />
          <span className="font-outfit font-extrabold text-xl tracking-tight bg-gradient-to-r from-white to-[#CBD5E1] bg-clip-text text-transparent">
            CarePilot AI
          </span>
        </div>
        <p className="text-[11px] font-semibold text-[#CBD5E1]/65 mb-6">
          Your Intelligent Customer Support Agent
        </p>

        {/* Create Case btn */}
        <button 
          onClick={createNewSession}
          disabled={backendStatus !== 'connected'}
          className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-[#4F46E5] to-[#2563EB] hover:from-[#2563EB] hover:to-[#4F46E5] text-white rounded-xl text-xs font-bold shadow-md shadow-[#4F46E5]/10 transition-all duration-150 mb-6 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>New Support Case</span>
        </button>

        {/* Navigation Section */}
        <nav className="flex flex-col gap-1.5 mb-6">
          <div className="text-[10px] uppercase tracking-wider text-[#94A3B8]/50 font-bold mb-1 px-3">
            Main Menu
          </div>
          
          <button 
            onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 border-l-2 cursor-pointer ${activeTab === 'dashboard' ? 'bg-[#4F46E5]/10 text-white border-[#4F46E5] shadow-[inset_4px_0_12px_rgba(79,70,229,0.15)]' : 'text-[#CBD5E1] border-transparent hover:bg-white/3 hover:text-white'}`}
          >
            <LayoutDashboard className="h-4.5 w-4.5" />
            <span>Dashboard</span>
          </button>
          
          <button 
            onClick={() => { setActiveTab('chat'); setIsMobileMenuOpen(false); }}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 border-l-2 cursor-pointer ${activeTab === 'chat' ? 'bg-[#4F46E5]/10 text-white border-[#4F46E5] shadow-[inset_4px_0_12px_rgba(79,70,229,0.15)]' : 'text-[#CBD5E1] border-transparent hover:bg-white/3 hover:text-white'}`}
          >
            <MessageSquare className="h-4.5 w-4.5" />
            <span>AI Chat</span>
          </button>
          
          <button 
            onClick={() => { setActiveTab('tracking'); setIsMobileMenuOpen(false); }}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 border-l-2 cursor-pointer ${activeTab === 'tracking' ? 'bg-[#4F46E5]/10 text-white border-[#4F46E5] shadow-[inset_4px_0_12px_rgba(79,70,229,0.15)]' : 'text-[#CBD5E1] border-transparent hover:bg-white/3 hover:text-white'}`}
          >
            <Truck className="h-4.5 w-4.5" />
            <span>Order Tracking</span>
          </button>

          <button 
            onClick={() => { setActiveTab('returns'); setIsMobileMenuOpen(false); }}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 border-l-2 cursor-pointer ${activeTab === 'returns' ? 'bg-[#4F46E5]/10 text-white border-[#4F46E5] shadow-[inset_4px_0_12px_rgba(79,70,229,0.15)]' : 'text-[#CBD5E1] border-transparent hover:bg-white/3 hover:text-white'}`}
          >
            <Undo2 className="h-4.5 w-4.5" />
            <span>Returns & Refunds</span>
          </button>
          
          <button 
            onClick={() => { setActiveTab('faq'); setIsMobileMenuOpen(false); }}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 border-l-2 cursor-pointer ${activeTab === 'faq' ? 'bg-[#4F46E5]/10 text-white border-[#4F46E5] shadow-[inset_4px_0_12px_rgba(79,70,229,0.15)]' : 'text-[#CBD5E1] border-transparent hover:bg-white/3 hover:text-white'}`}
          >
            <HelpCircle className="h-4.5 w-4.5" />
            <span>FAQ</span>
          </button>

          <button 
            onClick={() => { setActiveTab('analytics'); setIsMobileMenuOpen(false); }}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 border-l-2 cursor-pointer ${activeTab === 'analytics' ? 'bg-[#4F46E5]/10 text-white border-[#4F46E5] shadow-[inset_4px_0_12px_rgba(79,70,229,0.15)]' : 'text-[#CBD5E1] border-transparent hover:bg-white/3 hover:text-white'}`}
          >
            <BarChart3 className="h-4.5 w-4.5" />
            <span>Analytics</span>
          </button>
          
          <button 
            onClick={() => { setActiveTab('about'); setIsMobileMenuOpen(false); }}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 border-l-2 cursor-pointer ${activeTab === 'about' ? 'bg-[#4F46E5]/10 text-white border-[#4F46E5] shadow-[inset_4px_0_12px_rgba(79,70,229,0.15)]' : 'text-[#CBD5E1] border-transparent hover:bg-white/3 hover:text-white'}`}
          >
            <User className="h-4.5 w-4.5" />
            <span>About</span>
          </button>

          <button 
            onClick={() => { setActiveTab('settings'); setIsMobileMenuOpen(false); }}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 border-l-2 cursor-pointer ${activeTab === 'settings' ? 'bg-[#4F46E5]/10 text-white border-[#4F46E5] shadow-[inset_4px_0_12px_rgba(79,70,229,0.15)]' : 'text-[#CBD5E1] border-transparent hover:bg-white/3 hover:text-white'}`}
          >
            <Settings className="h-4.5 w-4.5" />
            <span>Settings</span>
          </button>
        </nav>

        {/* Chat History Section */}
        <div className="flex flex-col gap-2 overflow-y-auto max-h-40 scrollbar-thin mb-3">
          <div className="text-[10px] uppercase tracking-wider text-[#94A3B8]/50 font-bold mb-1 px-3">
            Recent Cases
          </div>
          {chatSessions.map((session) => (
            <button 
              key={session.id}
              onClick={() => switchSession(session)}
              className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs text-left font-bold transition-all duration-150 cursor-pointer ${selectedSessionId === session.id ? 'bg-white/8 text-white' : 'text-[#CBD5E1]/60 hover:bg-white/3 hover:text-white'}`}
            >
              <MessageCircle className="h-3.5 w-3.5 shrink-0 text-[#94A3B8]" />
              <div className="truncate flex-grow">{session.title}</div>
            </button>
          ))}
        </div>

        {/* Hackathon Demo Panel */}
        <div className="flex flex-col gap-2 p-3 bg-white/4 border border-white/8 rounded-xl text-xs text-[#CBD5E1] mb-3 shrink-0 font-sans">
          <div className="text-[10px] uppercase tracking-wider text-[#06B6D4] font-bold">
            🏆 Hackathon Demo Panel
          </div>
          <div className="text-[11px] leading-relaxed text-[#94A3B8]">
            Copy any demo tracking number below to test tracking or chat:
          </div>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {['CP345678', 'CP123456', 'CP234567'].map((num) => (
              <button
                key={num}
                onClick={() => {
                  navigator.clipboard.writeText(num);
                  alert(`Copied tracking number: ${num}`);
                }}
                className="px-2 py-1 bg-white/5 hover:bg-[#06B6D4]/20 border border-white/10 hover:border-[#06B6D4]/40 rounded text-[10px] font-bold text-white transition-all cursor-pointer"
                title="Click to copy"
              >
                📋 {num}
              </button>
            ))}
          </div>
        </div>

        {/* Live Status Connection */}
        <div className="flex flex-col gap-1.5 px-4 py-3 bg-white/2 border border-white/8 rounded-xl text-[11px] text-[#CBD5E1] mb-4 shrink-0 font-sans">
          <div className="flex items-center gap-2">
            <div className={`h-2.5 w-2.5 rounded-full shadow-md ${
              backendStatus === 'connected' ? 'bg-[#10B981] shadow-[#10B981]/50 animate-pulse' :
              backendStatus === 'error'     ? 'bg-[#EF4444] shadow-[#EF4444]/50' :
                                              'bg-[#F59E0B] shadow-[#F59E0B]/50 animate-pulse'
            }`} />
            <span className="font-bold">
              {backendStatus === 'connected' ? '🟢 ADK Backend Connected' :
               backendStatus === 'error'     ? '🔴 Backend Offline — Run agents-cli playground' :
                                              '🟡 Connecting to ADK...'}
            </span>
          </div>
          {backendStatus === 'connected' && (
            <div className="flex items-center gap-2 pl-4">
              <div className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
              <span className="font-bold text-[#10B981]">🤖 AI Agent Online</span>
            </div>
          )}
        </div>

        {/* Profile Footer */}
        <div className="flex items-center gap-3 pt-4 border-t border-white/8 shrink-0 hover:bg-white/3 p-2 rounded-xl transition-all duration-200 group cursor-pointer">
          <div className="relative">
            <div className="h-10 w-10 rounded-full overflow-hidden ring-2 ring-[#4F46E5]/60 transition-transform duration-200 group-hover:scale-105 shrink-0">
              <img
                src="/avatar-circle.jpg"
                alt="Mohammad Wasim"
                className="w-full h-full object-cover object-top"
              />
            </div>
            {/* Green Online Status Dot */}
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-[#10B981] border-2 border-[#111827] shadow-sm animate-pulse" />
          </div>
          <div className="flex flex-col flex-grow min-w-0">
            <span className="text-xs font-bold text-white truncate">{profileName}</span>
            <span className="text-[10px] text-[#06B6D4] font-bold tracking-wide">{profileRole}</span>
            <span className="text-[9px] text-[#94A3B8] font-medium truncate">{profileEmail}</span>
          </div>
        </div>
      </aside>

      {/* 2. Main Workspace */}
      <main className="flex-grow flex flex-col h-screen overflow-hidden bg-[#0F172A]">
        
        {/* Header bar */}
        <header className="h-[72px] border-b border-white/8 bg-[#111827]/40 backdrop-blur-md px-6 md:px-10 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-4">
            {/* Hamburger for mobile */}
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-1.5 text-[#CBD5E1] hover:text-white hover:bg-white/5 rounded-lg md:hidden cursor-pointer">
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-base font-extrabold text-white capitalize font-outfit tracking-wide flex items-center gap-2">
              {activeTab === 'returns' ? 'Returns & Refunds' :
               activeTab === 'chat' ? 'AI Support Chat' :
               activeTab === 'about' ? 'About CarePilot AI' :
               activeTab}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-[11px] text-[#CBD5E1] font-bold bg-[#1E293B] border border-white/8 px-3 py-1.5 rounded-lg select-none">
              Client UID: <span className="font-mono text-[#4F46E5] font-extrabold">{userId ? userId.substring(5) : '—'}</span>
            </div>
            <div className="text-[11px] text-[#CBD5E1] font-bold bg-[#1E293B] border border-white/8 px-3 py-1.5 rounded-lg select-none hidden sm:flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${backendStatus === 'connected' ? 'bg-[#10B981]' : backendStatus === 'error' ? 'bg-[#EF4444]' : 'bg-[#F59E0B] animate-pulse'}`} />
              <span>{backendStatus === 'connected' ? 'ADK Connected' : backendStatus === 'error' ? 'Backend Offline' : 'Connecting...'}</span>
              {sessionId && <span className="font-mono text-[#10B981] font-extrabold ml-1">{sessionId.substring(0,8)}</span>}
            </div>
          </div>
        </header>

        {/* Scrollable View Area */}
        <div className="flex-grow overflow-y-auto flex flex-col">
          
          {/* Dashboard View */}
          {activeTab === 'dashboard' && (
            <div className="p-6 md:p-10 flex flex-col gap-8 max-w-6xl mx-auto w-full animate-fade-in">
              
              {/* Splash/Hero with Start Demo Button */}
              <div className="bg-gradient-to-r from-[#4F46E5]/20 via-[#2563EB]/10 to-[#0F172A] border border-white/8 rounded-3xl p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 shadow-lg shadow-[#4F46E5]/5">
                <div className="max-w-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-5 w-5 text-[#06B6D4]" />
                    <span className="text-[10px] font-extrabold text-[#06B6D4] uppercase tracking-wider">Judges Portal Active</span>
                  </div>
                  <h2 className="text-xl font-extrabold text-white tracking-tight font-outfit">
                    Interactive Agent Playground
                  </h2>
                  <p className="text-xs text-[#CBD5E1] mt-1 font-semibold leading-relaxed">
                    Instantly load the active support context query sequence. Evaluates the classifier, FAQ, and SQL caching nodes on the ADK graph.
                  </p>
                </div>
                
                <button 
                  onClick={handleStartDemoAction}
                  className="bg-gradient-to-r from-[#4F46E5] to-[#2563EB] hover:from-[#2563EB] hover:to-[#4F46E5] text-white font-extrabold text-xs px-6 py-4 rounded-xl shadow-lg shadow-[#4F46E5]/20 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 cursor-pointer"
                >
                  <span>🚀 Start Demo</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* 1. Open Tickets */}
                <div className="bg-[#1E293B] border border-white/8 p-6 rounded-2xl shadow-sm hover:translate-y-[-2px] hover:shadow-md transition-all duration-200">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-bold text-[#CBD5E1] uppercase tracking-wider">Open Tickets</span>
                    <span className="text-[10px] font-bold text-[#10B981] bg-[#10B981]/10 px-2.5 py-0.5 rounded-full flex items-center gap-0.5">
                      <TrendingUp className="h-3 w-3" />
                      +12%
                    </span>
                  </div>
                  <div className="text-2xl font-extrabold text-white">12 active</div>
                  <p className="text-[10px] text-[#94A3B8] mt-2 font-medium">92% automated without handoff</p>
                </div>
                
                {/* 2. Resolved Today */}
                <div className="bg-[#1E293B] border border-white/8 p-6 rounded-2xl shadow-sm hover:translate-y-[-2px] hover:shadow-md transition-all duration-200">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-bold text-[#CBD5E1] uppercase tracking-wider">Resolved Today</span>
                    <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
                  </div>
                  <div className="text-2xl font-extrabold text-white">136 cases</div>
                  <p className="text-[10px] text-[#94A3B8] mt-2 font-medium">Resolution Target: 90% SLA</p>
                </div>
                
                {/* 3. Average Response Time */}
                <div className="bg-[#1E293B] border border-white/8 p-6 rounded-2xl shadow-sm hover:translate-y-[-2px] hover:shadow-md transition-all duration-200">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-bold text-[#CBD5E1] uppercase tracking-wider">Avg Response Time</span>
                    <Clock className="h-4 w-4 text-[#4F46E5]" />
                  </div>
                  <div className="text-2xl font-extrabold text-white">1.18s</div>
                  <p className="text-[10px] text-[#94A3B8] mt-2 font-medium">Includes classifier route latency</p>
                </div>
                
                {/* 4. Customer Satisfaction */}
                <div className="bg-[#1E293B] border border-white/8 p-6 rounded-2xl shadow-sm hover:translate-y-[-2px] hover:shadow-md transition-all duration-200">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-bold text-[#CBD5E1] uppercase tracking-wider">CSAT Survey Rating</span>
                    <ThumbsUp className="h-4 w-4 text-[#F59E0B]" />
                  </div>
                  <div className="text-2xl font-extrabold text-white">4.92 / 5.0</div>
                  <p className="text-[10px] text-[#94A3B8] mt-2 font-medium">Based on 124 voter feedbacks</p>
                </div>
              </div>

              {/* Hackathon Demo Credentials Grid */}
              <div className="bg-[#1E293B] border border-white/8 rounded-2xl p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <Key className="h-5 w-5 text-[#4F46E5]" />
                  <h3 className="text-sm font-bold text-white">Demo Credentials & Tracking Keys</h3>
                </div>
                <p className="text-xs text-[#CBD5E1] mb-6 font-semibold">
                  For judges testing the platform: Click any mock tracking number below to automatically populate, navigate, and execute the tracking simulation.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.keys(demoTrackingData).map((code) => {
                    const status = demoTrackingData[code].status;
                    let badgeColor = 'bg-[#4F46E5]/10 text-[#4F46E5] border-[#4F46E5]/20';
                    if (status === 'Delivered' || status === 'Refund Completed') {
                      badgeColor = 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20';
                    } else if (status === 'Delayed') {
                      badgeColor = 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20';
                    } else if (status === 'Return Initiated') {
                      badgeColor = 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20';
                    }

                    return (
                      <div 
                        key={code}
                        onClick={() => launchDemoTracking(code)}
                        className="bg-[#0F172A]/60 border border-white/8 hover:border-[#4F46E5] p-4 rounded-xl flex flex-col gap-2 transition-all duration-150 cursor-pointer group"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-xs font-extrabold text-white group-hover:text-[#4F46E5]">{code}</span>
                          <span className={`text-[9px] font-extrabold border px-2 py-0.5 rounded-full ${badgeColor}`}>
                            {status}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#CBD5E1] font-medium">Click to audit shipment trail</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Try Demo Questions & Charts Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Visual Chart - Left/Center */}
                <div className="bg-[#1E293B] border border-white/8 rounded-2xl p-6 shadow-sm lg:col-span-2 flex flex-col gap-6">
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1">
                      Hourly Conversation Traffic
                    </h3>
                    <p className="text-xs text-[#94A3B8]">Total query volumes handled by the decision router node.</p>
                  </div>
                  
                  {/* Inline CSS-based graph bar chart */}
                  <div className="h-56 flex items-end justify-between gap-3 pt-6 border-b border-white/8 pb-2">
                    {[
                      { hr: '09:00', val: 32 },
                      { hr: '10:00', val: 56 },
                      { hr: '11:00', val: 89 },
                      { hr: '12:00', val: 124 },
                      { hr: '13:00', val: 98 },
                      { hr: '14:00', val: 148 },
                      { hr: '15:00', val: 110 },
                      { hr: '16:00', val: 85 }
                    ].map((item, idx) => (
                      <div key={idx} className="flex-grow flex flex-col items-center gap-2 group">
                        <div className="text-[10px] font-bold text-[#4F46E5] opacity-0 group-hover:opacity-100 transition-opacity duration-150 mb-1">
                          {item.val}
                        </div>
                        <div 
                          style={{ height: `${(item.val / 150) * 100}%` }}
                          className="w-full bg-[#4F46E5]/20 hover:bg-[#4F46E5] rounded-lg transition-all duration-200 cursor-pointer min-h-[10px]"
                        />
                        <span className="text-[10px] font-semibold text-[#CBD5E1]/60 mt-2 shrink-0">{item.hr}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions Panel - Right Column */}
                <div className="bg-[#1E293B] border border-white/8 rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <HelpCircle className="h-4.5 w-4.5 text-[#4F46E5]" />
                      <h3 className="text-sm font-bold text-white">Try Demo Prompts</h3>
                    </div>
                    <p className="text-xs text-[#94A3B8]">Click any prompt to instantly pre-fill it in the AI Chat console.</p>
                  </div>

                  <div className="flex flex-col gap-2">
                    {[
                      { label: 'Where is my order?', q: 'Where is my order?' },
                      { label: 'Track my shipment', q: 'Track my shipment' },
                      { label: 'Return my package', q: 'Return my package' },
                      { label: 'Refund my order', q: 'Refund my order' },
                      { label: 'Shipping charges', q: 'Shipping charges' },
                      { label: 'Cancel my order', q: 'Cancel my order' },
                      { label: 'Delivery time', q: 'What is the delivery time?' },
                      { label: 'Express shipping', q: 'Tell me about express shipping' }
                    ].map((item) => (
                      <button 
                        key={item.label}
                        onClick={() => handleTryQuestionClick(item.q)}
                        className="w-full py-2.5 bg-[#0F172A] hover:bg-[#4F46E5]/10 text-[#CBD5E1] hover:text-white font-bold text-[11px] rounded-xl flex items-center justify-between px-4 border border-white/8 hover:border-[#4F46E5]/20 transition-all duration-150 cursor-pointer"
                      >
                        <span>{item.label}</span>
                        <ArrowRight className="h-3.5 w-3.5 text-[#4F46E5]" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Activity Feed */}
              <div className="bg-[#1E293B] border border-white/8 rounded-2xl p-6 shadow-sm">
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-white mb-1">
                    Workflow Activity Stream
                  </h3>
                  <p className="text-xs text-[#94A3B8]">Recent actions processed by the customer support workflow graph.</p>
                </div>

                <div className="flex flex-col gap-4">
                  {[
                    { node: 'save_query', desc: 'Query transaction log saved to SQL database cache.', time: '1m ago', type: 'system' },
                    { node: 'classifier_agent', desc: 'Intent classification verified as: shipping related (Confidence: 0.98).', time: '12m ago', type: 'llm' },
                    { node: 'faq_agent', desc: 'Identified matching document for return rates. Sent text block.', time: '38m ago', type: 'llm' },
                    { node: 'decline_node', desc: 'Declined unrelated query with polite standard message.', time: '1h ago', type: 'system' }
                  ].map((activity, idx) => (
                    <div key={idx} className="flex justify-between items-center py-3 border-b border-white/8 last:border-b-0">
                      <div className="flex items-center gap-3">
                        <div className={`h-2 w-2 rounded-full ${activity.type === 'llm' ? 'bg-[#4F46E5]' : 'bg-[#10B981]'}`} />
                        <div>
                          <span className="text-xs font-bold text-white font-mono">{activity.node}</span>
                          <p className="text-[11px] text-[#94A3B8] mt-0.5">{activity.desc}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-[#94A3B8]/60 shrink-0">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* AI Chat View */}
          {activeTab === 'chat' && (
            <div className="flex-grow flex flex-col h-full overflow-hidden bg-[#0F172A]">
              
              {/* Chat Message feed container */}
              <div className="flex-grow overflow-y-auto px-4 md:px-10 py-8 flex flex-col gap-6">
                
                {messages.length === 0 ? (
                  /* Empty chat onboarding */
                  <div className="m-auto max-w-2xl w-full flex flex-col items-center px-4 py-8 animate-fade-in">
                    <AvatarLogo className="h-20 w-20 mb-6" ringSize={3} />
                    <h2 className="text-2xl font-extrabold tracking-tight text-white font-outfit mb-2 text-center">
                      👋 Welcome to CarePilot AI
                    </h2>
                    <p className="text-xs font-semibold text-[#4F46E5] uppercase tracking-wider mb-4">Your Intelligent Customer Support Agent</p>
                    <p className="text-sm text-[#CBD5E1] leading-relaxed max-w-lg text-center mb-8 font-medium">
                      I can help you track orders, check shipping status, process returns, and answer FAQs — all powered by Google ADK and Gemini AI.
                    </p>

                    {backendStatus !== 'connected' && (
                      <div className="mb-6 flex items-center gap-2 bg-[#F59E0B]/10 border border-[#F59E0B]/20 text-[#F59E0B] text-xs font-bold px-4 py-3 rounded-xl">
                        <span className="h-2 w-2 rounded-full bg-[#F59E0B] animate-pulse" />
                        Connecting to ADK backend — responses will begin shortly...
                      </div>
                    )}

                    {/* Try asking */}
                    <p className="text-[11px] font-extrabold text-[#94A3B8] uppercase tracking-wider mb-3">💬 Try asking:</p>
                    <div className="flex flex-wrap justify-center gap-2 mb-8">
                      {[
                        'Where is my order?',
                        'Track my shipment CP345678',
                        'Refund my order',
                        'What are shipping charges?',
                        'Cancel my order',
                        'Return my package',
                      ].map(prompt => (
                        <button
                          key={prompt}
                          disabled={backendStatus !== 'connected'}
                          onClick={() => handleSendMessage(prompt)}
                          className="bg-[#1E293B] hover:bg-[#4F46E5]/20 border border-white/8 hover:border-[#4F46E5]/40 text-[#CBD5E1] hover:text-white text-[11px] font-bold px-4 py-2.5 rounded-full transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>

                    {/* Quick action cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
                      <button
                        disabled={backendStatus !== 'connected'}
                        onClick={() => submitPrompt('Where is my order?')}
                        className="bg-[#1E293B] border border-white/8 p-4 rounded-2xl text-left hover:border-[#4F46E5] hover:-translate-y-1 shadow-sm transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <div className="h-9 w-9 rounded-xl bg-[#4F46E5]/10 text-[#4F46E5] flex items-center justify-center mb-3">
                          <Truck className="h-4.5 w-4.5" />
                        </div>
                        <span className="text-xs font-bold text-white block mb-0.5">Track Your Order</span>
                        <span className="text-[10px] text-[#94A3B8]">Get real-time delivery status</span>
                      </button>
                      <button
                        disabled={backendStatus !== 'connected'}
                        onClick={() => submitPrompt('Return my package')}
                        className="bg-[#1E293B] border border-white/8 p-4 rounded-2xl text-left hover:border-[#4F46E5] hover:-translate-y-1 shadow-sm transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <div className="h-9 w-9 rounded-xl bg-[#06B6D4]/10 text-[#06B6D4] flex items-center justify-center mb-3">
                          <Undo2 className="h-4.5 w-4.5" />
                        </div>
                        <span className="text-xs font-bold text-white block mb-0.5">Return a Package</span>
                        <span className="text-[10px] text-[#94A3B8]">Start a return or refund</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Messages List - ChatGPT-style list */
                  <div className="max-w-3xl mx-auto w-full flex flex-col gap-8">
                    {messages.map((msg, idx) => (
                      <div 
                        key={idx}
                        className={`flex gap-5 w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                          
                          {/* Avatar icon */}
                          <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 shadow-sm overflow-hidden ${msg.role === 'user' ? 'bg-gradient-to-tr from-slate-500 to-slate-600' : 'ring-2 ring-[#4F46E5]/50'}`}>
                            {msg.role === 'user' 
                              ? <User className="h-4.5 w-4.5 text-white" /> 
                              : <img src="/avatar-circle.jpg" alt="CarePilot AI" className="w-full h-full object-cover object-top" />}
                          </div>

                          {/* Bubble wrapper */}
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-[#CBD5E1] px-1 select-none capitalize">{msg.sender}</span>
                            <div className={`px-5 py-3.5 rounded-2xl shadow-sm text-sm border ${msg.role === 'user' ? 'bg-[#4F46E5] border-[#4F46E5]/30 text-white rounded-tr-none' : 'bg-[#1E293B] border-white/8 text-[#F8FAFC] rounded-tl-none'}`}>
                              {renderMessageText(msg.text)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Typing bubble indicator */}
                    {isTyping && (
                      <div className="flex gap-4 max-w-[70%] self-start flex-row">
                        <div className="h-9 w-9 rounded-full overflow-hidden ring-2 ring-[#4F46E5]/50 shrink-0 shadow-sm">
                          <img src="/avatar-circle.jpg" alt="CarePilot AI" className="w-full h-full object-cover object-top" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-[#CBD5E1] px-1 select-none">CarePilot AI</span>
                          <div className="px-5 py-4 rounded-2xl bg-[#1E293B] border border-white/8 rounded-tl-none shadow-sm flex items-center justify-center">
                            <div className="flex gap-1.5 items-center justify-center px-1.5">
                              <div className="h-2 w-2 bg-[#4F46E5] rounded-full animate-bounce [animation-delay:-0.3s]" />
                              <div className="h-2 w-2 bg-[#4F46E5] rounded-full animate-bounce [animation-delay:-0.15s]" />
                              <div className="h-2 w-2 bg-[#4F46E5] rounded-full animate-bounce" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                )}
              </div>

              {/* Chat Input panel */}
              <div className="bg-[#111827]/40 backdrop-blur-md border-t border-white/8 px-6 md:px-10 py-6 shrink-0 z-10">
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                  className="max-w-3xl mx-auto flex gap-3 items-end bg-[#1E293B] border border-white/8 rounded-2xl p-2 focus-within:ring-4 focus-within:ring-[#4F46E5]/15 focus-within:border-[#4F46E5] transition-all duration-150"
                >
                  <textarea 
                    rows={1}
                    disabled={backendStatus !== 'connected'}
                    value={inputMessage}
                    onChange={(e) => {
                      setInputMessage(e.target.value);
                      // Auto-resize textarea
                      e.target.style.height = 'auto';
                      e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                        // Reset textarea height after send
                        e.target.style.height = 'auto';
                      }
                    }}
                    placeholder={
                      backendStatus === 'error'
                        ? 'Backend offline — start agents-cli playground'
                        : backendStatus === 'connecting'
                        ? 'Connecting to ADK backend...'
                        : isListening
                        ? 'Listening... Speak now'
                        : 'Ask CarePilot AI support...'
                    }
                    className="flex-grow min-h-[44px] max-h-[120px] bg-transparent text-sm font-medium border-0 focus:outline-none focus:ring-0 text-white placeholder-[#94A3B8] px-3 py-2.5 resize-none leading-relaxed"
                  />
                  
                  {/* Microphone speech recognition trigger */}
                  <button 
                    type="button"
                    disabled={backendStatus !== 'connected'}
                    onClick={handleMicClick}
                    className={`h-11 w-11 rounded-xl flex items-center justify-center border transition-all duration-150 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${isListening ? 'bg-[#EF4444] border-[#EF4444] text-white animate-pulse' : 'bg-[#0F172A] border-white/8 text-[#CBD5E1] hover:bg-white/5 hover:text-white'}`}
                  >
                    {isListening ? <MicOff className="h-4.5 w-4.5" /> : <Mic className="h-4.5 w-4.5" />}
                  </button>

                  <button 
                    type="submit"
                    disabled={backendStatus !== 'connected' || !inputMessage.trim()}
                    className="h-11 w-11 bg-[#4F46E5] hover:bg-[#2563EB] text-white rounded-xl flex items-center justify-center shadow-md transition-all duration-150 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Send className="h-4.5 w-4.5" />
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Order Tracking View */}
          {activeTab === 'tracking' && (
            <div className="p-10 flex flex-col gap-6 max-w-4xl animate-fade-in mx-auto w-full">
              <div className="bg-[#1E293B] border border-white/8 rounded-2xl p-8 shadow-sm">
                <h3 className="font-outfit font-extrabold text-xl mb-2 text-white">Track shipment status</h3>
                <p className="text-xs text-[#CBD5E1] mb-6 font-semibold">
                  Query the courier transaction database using your unique tracking identifier.
                </p>

                <form onSubmit={handleTrackingSearch} className="flex gap-3 mb-8 max-w-md">
                  <input 
                    type="text" 
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter Order ID (e.g. CP123456)"
                    className="flex-grow h-12 border border-white/8 bg-[#0F172A] text-white rounded-xl px-4 text-sm font-semibold focus:outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10 font-mono"
                  />
                  <button 
                    type="submit"
                    className="bg-gradient-to-r from-[#4F46E5] to-[#2563EB] hover:from-[#2563EB] hover:to-[#4F46E5] text-white font-bold text-xs px-6 rounded-xl shadow-md transition-all duration-150 cursor-pointer"
                  >
                    Search Database
                  </button>
                </form>

                {/* Empty State / Not Searched */}
                {!hasSearchedTracking && (
                  <div className="flex flex-col items-center justify-center py-12 border border-dashed border-white/8 rounded-2xl bg-[#0F172A]/40">
                    <Box className="h-12 w-12 text-[#94A3B8] stroke-[1.5] mb-4 animate-pulse" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">No Query Submitted</h4>
                    <p className="text-[11px] text-[#CBD5E1] mt-1 font-semibold">Input a valid parcel ID number above to run diagnostics.</p>
                  </div>
                )}

                {/* Tracking Progress Result */}
                {hasSearchedTracking && (
                  <div className="animate-fade-in">
                    {demoTrackingData[searchedNum] ? (
                      /* Display Demo Data */
                      <div>
                        {/* Stepper tracker */}
                        <div className="flex justify-between items-center relative mt-6 px-4">
                          <div className="absolute top-4 left-[10%] right-[10%] h-[2px] bg-white/8 z-0" />
                          
                          {/* Connector Line Fill width based on stepper status */}
                          <div 
                            style={{ 
                              width: getStepperStatus(demoTrackingData[searchedNum].status) === 4 ? '80%' :
                                     getStepperStatus(demoTrackingData[searchedNum].status) === 3 ? '55%' :
                                     getStepperStatus(demoTrackingData[searchedNum].status) === 2 ? '25%' : '0%' 
                            }} 
                            className="absolute top-4 left-[10%] h-[2px] bg-[#10B981] z-0 transition-all duration-500" 
                          />

                          <div className="flex flex-col items-center gap-2 z-10">
                            <div className="h-9 w-9 rounded-full bg-[#10B981] text-white flex items-center justify-center text-xs font-bold shadow-md shadow-[#10B981]/20">✓</div>
                            <span className="text-[10px] font-bold text-white">Order Placed</span>
                          </div>
                          
                          <div className="flex flex-col items-center gap-2 z-10">
                            <div className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold shadow-md ${
                              getStepperStatus(demoTrackingData[searchedNum].status) >= 2 
                                ? 'bg-[#10B981] text-white shadow-md shadow-[#10B981]/20' 
                                : 'bg-[#0F172A] border-2 border-white/8 text-[#CBD5E1]/40'
                            }`}>
                              {getStepperStatus(demoTrackingData[searchedNum].status) >= 2 ? '✓' : '2'}
                            </div>
                            <span className="text-[10px] font-bold text-white">Shipped</span>
                          </div>
                          
                          <div className="flex flex-col items-center gap-2 z-10">
                            <div className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold shadow-md ${
                              getStepperStatus(demoTrackingData[searchedNum].status) >= 3 
                                ? 'bg-[#10B981] text-white shadow-md shadow-[#10B981]/20' 
                                : getStepperStatus(demoTrackingData[searchedNum].status) === 2
                                ? 'bg-[#4F46E5]/10 border-2 border-[#4F46E5] text-[#4F46E5] shadow-md shadow-[#4F46E5]/20'
                                : 'bg-[#0F172A] border-2 border-white/8 text-[#CBD5E1]/40'
                            }`}>
                              {getStepperStatus(demoTrackingData[searchedNum].status) >= 3 ? '✓' : '●'}
                            </div>
                            <span className="text-[10px] font-bold text-white">In Transit</span>
                          </div>
                          
                          <div className="flex flex-col items-center gap-2 z-10">
                            <div className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold ${
                              getStepperStatus(demoTrackingData[searchedNum].status) === 4 
                                ? 'bg-[#10B981] text-white shadow-md shadow-[#10B981]/20' 
                                : 'bg-[#0F172A] border-2 border-white/8 text-[#CBD5E1]/45'
                            }`}>
                              {getStepperStatus(demoTrackingData[searchedNum].status) === 4 ? '✓' : '○'}
                            </div>
                            <span className="text-[10px] font-bold text-[#CBD5E1]/60">Delivered</span>
                          </div>
                        </div>

                        {/* High Fidelity Stats Grid */}
                        <div className="bg-[#0F172A] border border-white/8 p-6 rounded-2xl mt-10">
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            
                            <div>
                              <span className="text-[10px] uppercase font-bold tracking-wider text-[#CBD5E1]/50 block mb-0.5">Order ID</span>
                              <p className="text-xs font-bold text-white font-mono">{demoTrackingData[searchedNum].orderId}</p>
                            </div>
                            
                            <div>
                              <span className="text-[10px] uppercase font-bold tracking-wider text-[#CBD5E1]/50 block mb-0.5">Tracking Code</span>
                              <p className="text-xs font-bold text-white font-mono">{searchedNum}</p>
                            </div>
                            
                            <div>
                              <span className="text-[10px] uppercase font-bold tracking-wider text-[#CBD5E1]/50 block mb-0.5">Courier Carrier</span>
                              <p className="text-xs font-bold text-white">{demoTrackingData[searchedNum].courier}</p>
                            </div>
                            
                            <div>
                              <span className="text-[10px] uppercase font-bold tracking-wider text-[#CBD5E1]/50 block mb-0.5">Current Location</span>
                              <p className="text-xs font-bold text-white">{demoTrackingData[searchedNum].location}</p>
                            </div>
                            
                            <div>
                              <span className="text-[10px] uppercase font-bold tracking-wider text-[#CBD5E1]/50 block mb-0.5">Destination City</span>
                              <p className="text-xs font-bold text-white">{demoTrackingData[searchedNum].destination}</p>
                            </div>

                            <div>
                              <span className="text-[10px] uppercase font-bold tracking-wider text-[#CBD5E1]/50 block mb-0.5">Estimated Delivery</span>
                              <p className="text-xs font-bold text-white">{demoTrackingData[searchedNum].delivery}</p>
                            </div>
                            
                            <div>
                              <span className="text-[10px] uppercase font-bold tracking-wider text-[#CBD5E1]/50 block mb-0.5">Current status</span>
                              <span className="inline-block mt-0.5 text-[10px] font-extrabold text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded-md border border-[#10B981]/25">
                                {demoTrackingData[searchedNum].status}
                              </span>
                            </div>

                            <div>
                              <span className="text-[10px] uppercase font-bold tracking-wider text-[#CBD5E1]/50 block mb-0.5">Package Weight</span>
                              <p className="text-xs font-bold text-white">{demoTrackingData[searchedNum].weight}</p>
                            </div>

                            <div>
                              <span className="text-[10px] uppercase font-bold tracking-wider text-[#CBD5E1]/50 block mb-0.5">Shipping Method</span>
                              <p className="text-xs font-bold text-white">{demoTrackingData[searchedNum].method}</p>
                            </div>

                            <div className="sm:col-span-2 md:col-span-3 border-t border-white/8 pt-4 mt-2">
                              <span className="text-[10px] uppercase font-bold tracking-wider text-[#CBD5E1]/50 block mb-2">Shipment timeline audit logs</span>
                              
                              <div className="flex flex-col gap-3 font-sans">
                                {demoTrackingData[searchedNum].timeline.map((log, lIdx) => (
                                  <div key={lIdx} className="flex gap-4 text-xs font-medium">
                                    <span className="font-mono text-[#4F46E5] shrink-0 w-36">{log.time}</span>
                                    <span className="text-[#CBD5E1]">{log.desc}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Display Not Recognized Fallback Warning */
                      <div className="mt-6 border border-[#EF4444]/20 bg-[#EF4444]/5 p-6 rounded-2xl animate-fade-in flex gap-4 items-start">
                        <AlertCircle className="h-5 w-5 text-[#EF4444] shrink-0 mt-0.5 animate-bounce" />
                        <div>
                          <h4 className="text-xs font-bold text-[#EF4444] uppercase tracking-wider mb-1">Unrecognized Tracking Key</h4>
                          <p className="text-xs text-[#CBD5E1] leading-relaxed font-semibold">
                            This is a demo environment. Please use one of the sample tracking numbers shown on the Dashboard.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Returns & Refunds View */}
          {activeTab === 'returns' && (
            <div className="p-10 flex flex-col gap-6 max-w-4xl animate-fade-in mx-auto w-full">
              <div className="bg-[#1E293B] border border-white/8 rounded-2xl p-8 shadow-sm">
                <h3 className="font-outfit font-extrabold text-xl mb-2 text-white">Initiate prepaid return</h3>
                <p className="text-xs text-[#CBD5E1] mb-6 font-semibold">
                  Generate return authorization codes and download shipping labels.
                </p>

                <form onSubmit={handleReturnSubmit} className="flex flex-col gap-4 max-w-md">
                  <div>
                    <label className="text-[10px] font-bold text-[#CBD5E1]/65 uppercase tracking-wider block mb-1">Order / Parcel Number</label>
                    <input 
                      type="text" 
                      value={returnOrderNum}
                      onChange={(e) => setReturnOrderNum(e.target.value)}
                      placeholder="e.g. CP123456"
                      className="w-full h-12 border border-white/8 bg-[#0F172A] text-white rounded-xl px-4 text-xs font-semibold focus:outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-[#CBD5E1]/65 uppercase tracking-wider block mb-1">Reason for Return</label>
                    <select 
                      value={returnReason}
                      onChange={(e) => setReturnReason(e.target.value)}
                      className="w-full h-12 border border-white/8 bg-[#0F172A] text-white rounded-xl px-4 text-xs font-bold focus:outline-none focus:border-[#4F46E5]"
                    >
                      <option value="Wrong size">Wrong item size</option>
                      <option value="Item damaged">Item damaged upon delivery</option>
                      <option value="Changed mind">Changed mind / Refund requested</option>
                      <option value="Defective">Defective electronic component</option>
                    </select>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-3.5 bg-gradient-to-r from-[#4F46E5] to-[#2563EB] hover:from-[#2563EB] hover:to-[#4F46E5] text-white font-bold text-xs rounded-xl shadow-md mt-2 cursor-pointer transition-all duration-150"
                  >
                    Generate Return Labels
                  </button>
                </form>

                {/* Return Result Success Card */}
                {isReturnSubmitted && (
                  <div className="mt-8 border border-[#10B981]/20 bg-[#10B981]/5 p-6 rounded-2xl animate-fade-in flex gap-4 items-start">
                    <CheckCircle2 className="h-5 w-5 text-[#10B981] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-[#10B981] uppercase tracking-wider mb-1">Return Request Approved</h4>
                      <p className="text-xs text-[#CBD5E1] leading-relaxed font-semibold">
                        Prepaid label generated: <strong className="font-mono text-white">CP-RET-98271</strong>. The print-friendly document has been dispatched to your email.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* FAQ View */}
          {activeTab === 'faq' && (
            <div className="p-10 flex flex-col gap-6 max-w-4xl animate-fade-in mx-auto w-full">
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="text-xl font-extrabold text-white tracking-tight font-outfit mb-1">
                    Frequently Asked Policies
                  </h2>
                  <p className="text-xs text-[#CBD5E1] font-semibold">
                    Read the automated resolution rules and delivery conditions.
                  </p>
                </div>

                {/* Category filters */}
                <div className="flex gap-2">
                  {[
                    { id: 'all', label: 'All Articles' },
                    { id: 'shipping', label: 'Shipping' },
                    { id: 'cancellation', label: 'Cancellations' },
                    { id: 'refunds', label: 'Refunds' }
                  ].map((cat) => (
                    <button 
                      key={cat.id}
                      onClick={() => setActiveFaqCategory(cat.id)}
                      className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all duration-150 cursor-pointer ${activeFaqCategory === cat.id ? 'bg-[#4F46E5]/10 border-[#4F46E5] text-white' : 'bg-[#1E293B] border-white/8 text-[#CBD5E1] hover:text-white'}`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* FAQ search input */}
                <div className="relative max-w-md">
                  <Search className="absolute left-4 top-3.5 h-4.5 w-4.5 text-[#CBD5E1]/50" />
                  <input 
                    type="text" 
                    value={faqSearch}
                    onChange={(e) => setFaqSearch(e.target.value)}
                    placeholder="Search query keywords..."
                    className="w-full h-12 border border-white/8 bg-[#1E293B] text-white rounded-xl pl-12 pr-4 text-xs font-semibold focus:outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10 shadow-sm"
                  />
                </div>

                {/* FAQ List */}
                <div className="flex flex-col gap-4">
                  {filteredFaqs.map((faq, idx) => {
                    const isExpanded = expandedFaq === idx;
                    return (
                      <div 
                        key={idx}
                        className="bg-[#1E293B] border border-white/8 rounded-xl overflow-hidden shadow-sm hover:border-[#4F46E5]/30 transition-all duration-150"
                      >
                        <button 
                          onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                          className="w-full px-6 py-5 text-left flex justify-between items-center font-bold text-white text-xs hover:bg-white/3 cursor-pointer"
                        >
                          <span>{faq.q}</span>
                          {isExpanded ? <ChevronUp className="h-4.5 w-4.5 text-[#CBD5E1]" /> : <ChevronDown className="h-4.5 w-4.5 text-[#CBD5E1]" />}
                        </button>
                        {isExpanded && (
                          <div className="px-6 pb-6 pt-2 text-xs text-[#CBD5E1] leading-relaxed border-t border-white/8 bg-[#0F172A]/20 font-medium">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {filteredFaqs.length === 0 && (
                    <div className="text-center py-12 text-[#CBD5E1] font-medium">
                      No matching policy articles catalogued.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Analytics View */}
          {activeTab === 'analytics' && (
            <div className="p-6 md:p-10 flex flex-col gap-8 max-w-6xl mx-auto w-full animate-fade-in font-sans">
              <div>
                <h2 className="text-xl font-extrabold text-white tracking-tight font-outfit mb-1">
                  Router Analytics & CSAT Performance
                </h2>
                <p className="text-xs text-[#CBD5E1] font-semibold">
                  Review resolution ratios and conversation metrics over standard intervals.
                </p>
              </div>

              {/* Top row distributions */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* 1. Categorization stats */}
                <div className="bg-[#1E293B] border border-white/8 rounded-2xl p-6 shadow-sm flex flex-col gap-6 lg:col-span-1">
                  <div>
                    <h3 className="text-sm font-bold text-white">Intent Classification Share</h3>
                    <p className="text-xs text-[#94A3B8]">Ratio of routed domains in session history.</p>
                  </div>

                  <div className="flex flex-col gap-4">
                    {[
                      { label: 'Order Shipping & Rates', pct: 42, color: 'bg-[#4F46E5]' },
                      { label: 'Product Return Requests', pct: 28, color: 'bg-indigo-400' },
                      { label: 'Cancellation Queries', pct: 18, color: 'bg-[#10B981]' },
                      { label: 'General Decline/Fallback', pct: 12, color: 'bg-slate-500' }
                    ].map((topic, idx) => (
                      <div key={idx} className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-xs font-bold text-[#CBD5E1]">
                          <span>{topic.label}</span>
                          <span className="text-white">{topic.pct}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#0F172A] rounded-full overflow-hidden">
                          <div style={{ width: `${topic.pct}%` }} className={`h-full ${topic.color} rounded-full`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Volume Timeline area chart */}
                <div className="bg-[#1E293B] border border-white/8 rounded-2xl p-6 shadow-sm flex flex-col gap-6 lg:col-span-2">
                  <div>
                    <h3 className="text-sm font-bold text-white">Daily Ticket Metrics</h3>
                    <p className="text-xs text-[#94A3B8]">Number of workflow execution instances triggered.</p>
                  </div>

                  <div className="h-56 flex items-end justify-between gap-4 pt-6 border-b border-white/8 pb-2">
                    {[
                      { label: 'Mon', val: 120 },
                      { label: 'Tue', val: 145 },
                      { label: 'Wed', val: 168 },
                      { label: 'Thu', val: 152 },
                      { label: 'Fri', val: 189 },
                      { label: 'Sat', val: 94 },
                      { label: 'Sun', val: 78 }
                    ].map((item, idx) => (
                      <div key={idx} className="flex-grow flex flex-col items-center gap-2 group">
                        <div className="text-[10px] font-bold text-[#4F46E5] opacity-0 group-hover:opacity-100 transition-opacity duration-150 mb-1">
                          {item.val}
                        </div>
                        <div 
                          style={{ height: `${(item.val / 200) * 100}%` }}
                          className="w-full bg-[#4F46E5]/20 hover:bg-[#4F46E5] rounded-lg transition-all duration-200 cursor-pointer min-h-[10px]"
                        />
                        <span className="text-[10px] font-semibold text-[#CBD5E1] mt-2 shrink-0">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom row KPIs */}
              <div className="bg-[#1E293B] border border-white/8 rounded-2xl p-8 shadow-sm">
                <h3 className="text-sm font-bold text-white mb-6">Service Level Agreement Indexes</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-[#CBD5E1] uppercase tracking-wider">First Contact Resolution</span>
                    <span className="text-2xl font-extrabold text-[#10B981]">98.2%</span>
                    <p className="text-[10px] text-[#CBD5E1] mt-2 leading-relaxed">Queries resolved on initial routing sequence.</p>
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-[#CBD5E1] uppercase tracking-wider">Avg Session Duration</span>
                    <span className="text-2xl font-extrabold text-white">2.4m</span>
                    <p className="text-[10px] text-[#CBD5E1] mt-2 leading-relaxed">Average duration of user interaction loops.</p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-[#CBD5E1] uppercase tracking-wider">SLA compliance</span>
                    <span className="text-2xl font-extrabold text-[#4F46E5]">99.8%</span>
                    <p className="text-[10px] text-[#CBD5E1] mt-2 leading-relaxed">Node execution latency below threshold.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* About View */}
          {activeTab === 'about' && (
            <div className="p-6 md:p-10 flex flex-col gap-8 max-w-4xl mx-auto w-full animate-fade-in">
              {/* Hero */}
              <div className="bg-gradient-to-br from-[#4F46E5]/20 via-[#2563EB]/10 to-[#0F172A] border border-white/8 rounded-3xl p-8 flex flex-col sm:flex-row gap-8 items-center">
                <AvatarLogo className="h-24 w-24 shrink-0" ringSize={3} />
                <div>
                  <p className="text-[11px] font-extrabold text-[#06B6D4] uppercase tracking-wider mb-2">Project Creator & Developer</p>
                  <h2 className="text-2xl font-extrabold font-outfit text-white mb-1">Mohammad Wasim</h2>
                  <p className="text-sm font-bold text-[#A5B4FC] mb-3">Founder & AI Developer</p>
                  <p className="text-xs text-[#94A3B8] leading-relaxed max-w-lg">
                    Built CarePilot AI as a full-stack AI customer support platform demonstrating production-grade agentic AI using Google ADK, FastAPI, React, and Gemini 2.5 Flash.
                  </p>
                  <p className="text-xs text-[#CBD5E1] mt-2 font-medium">📧 mohdwasim.tech@gmail.com</p>
                </div>
              </div>

              {/* Project Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-[#1E293B] border border-white/8 rounded-2xl p-6">
                  <h3 className="text-sm font-extrabold text-white mb-4 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[#4F46E5]" />
                    About CarePilot AI
                  </h3>
                  <p className="text-xs text-[#CBD5E1] leading-relaxed mb-4">
                    CarePilot AI is a production-ready AI customer support platform that uses a multi-agent workflow graph to automatically classify, route, and respond to customer queries.
                  </p>
                  <div className="flex flex-col gap-2">
                    {[
                      '📦 Order tracking with real-time status',
                      '🚚 Shipping rates and delivery estimates',
                      '↩️ Automated return label generation',
                      '💳 Refund processing and status tracking',
                      '❓ Instant FAQ resolution via RAG',
                      '🚫 Graceful decline for off-topic queries',
                    ].map(f => (
                      <div key={f} className="text-xs text-[#94A3B8] font-medium flex items-start gap-2">
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#1E293B] border border-white/8 rounded-2xl p-6">
                  <h3 className="text-sm font-extrabold text-white mb-4 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-[#06B6D4]" />
                    Technology Stack
                  </h3>
                  <div className="flex flex-col gap-3">
                    {[
                      { name: 'Google ADK',        desc: 'Agent Development Kit — multi-agent workflow graph', color: 'text-[#4F46E5]' },
                      { name: 'Gemini 2.5 Flash',  desc: 'LLM powering classifier + FAQ agent nodes',        color: 'text-[#06B6D4]' },
                      { name: 'FastAPI',            desc: 'Python backend with SSE streaming support',         color: 'text-[#10B981]' },
                      { name: 'React + Vite',       desc: 'Frontend SPA with real-time SSE message parsing',   color: 'text-[#F59E0B]' },
                      { name: 'Google AI Studio',   desc: 'API key-based Gemini access (no Vertex needed)',    color: 'text-[#A5B4FC]' },
                    ].map(({ name, desc, color }) => (
                      <div key={name} className="flex gap-3 items-start">
                        <span className={`text-xs font-extrabold ${color} w-32 shrink-0`}>{name}</span>
                        <span className="text-[11px] text-[#94A3B8]">{desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ADK Architecture */}
              <div className="bg-[#1E293B] border border-white/8 rounded-2xl p-6">
                <h3 className="text-sm font-extrabold text-white mb-4 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-[#4F46E5]" />
                  ADK Workflow Architecture
                </h3>
                <div className="flex flex-wrap gap-3 items-center justify-center py-4">
                  {[
                    { name: 'save_query', color: 'bg-[#1E293B] border-[#10B981]/40 text-[#10B981]' },
                    { name: '→', color: 'text-[#94A3B8]', plain: true },
                    { name: 'classifier_agent', color: 'bg-[#1E293B] border-[#4F46E5]/40 text-[#4F46E5]' },
                    { name: '→', color: 'text-[#94A3B8]', plain: true },
                    { name: 'route_query', color: 'bg-[#1E293B] border-[#06B6D4]/40 text-[#06B6D4]' },
                    { name: '→', color: 'text-[#94A3B8]', plain: true },
                    { name: 'faq_agent', color: 'bg-[#1E293B] border-[#A5B4FC]/40 text-[#A5B4FC]' },
                    { name: '→', color: 'text-[#94A3B8]', plain: true },
                    { name: 'save_agent_response', color: 'bg-[#1E293B] border-[#10B981]/40 text-[#10B981]' },
                  ].map((node, i) => node.plain
                    ? <span key={i} className={`text-lg font-bold ${node.color}`}>{node.name}</span>
                    : <span key={i} className={`border text-[10px] font-mono font-bold px-3 py-1.5 rounded-lg ${node.color}`}>{node.name}</span>
                  )}
                </div>
                <p className="text-[11px] text-[#94A3B8] text-center mt-2">Real ADK nodes running on Gemini 2.5 Flash — no mocking, no placeholders.</p>
              </div>

              {/* Demo CTA */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleStartDemoAction}
                  className="flex-1 py-4 bg-gradient-to-r from-[#4F46E5] to-[#06B6D4] hover:from-[#2563EB] hover:to-[#0891B2] text-white font-extrabold text-sm rounded-2xl shadow-lg transition-all duration-200 hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
                >
                  🚀 Start Demo
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setShowWelcome(true)}
                  className="flex-1 py-4 bg-[#1E293B] hover:bg-white/5 border border-white/8 text-[#CBD5E1] hover:text-white font-bold text-sm rounded-2xl transition-all duration-150 cursor-pointer"
                >
                  ← Back to Welcome Screen
                </button>
              </div>
            </div>
          )}

          {/* Settings View */}
          {activeTab === 'settings' && (
            <div className="p-10 flex flex-col gap-6 max-w-4xl animate-fade-in mx-auto w-full">
              <div className="bg-[#1E293B] border border-white/8 rounded-2xl p-8 shadow-sm flex flex-col gap-8">
                
                {/* Profile Settings */}
                <div>
                  <h3 className="font-outfit font-extrabold text-base mb-4 text-white flex items-center gap-2">
                    <UserCheck className="h-4.5 w-4.5 text-[#4F46E5]" />
                    <span>Operator Profile</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
                    <div>
                      <label className="text-[10px] font-bold text-[#CBD5E1]/65 uppercase tracking-wider block mb-1">Display Name</label>
                      <input 
                        type="text" 
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="w-full h-11 border border-white/8 bg-[#0F172A] text-white rounded-xl px-4 text-xs font-semibold focus:outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[#CBD5E1]/65 uppercase tracking-wider block mb-1">Operator Role</label>
                      <input 
                        type="text" 
                        value={profileRole}
                        onChange={(e) => setProfileRole(e.target.value)}
                        className="w-full h-11 border border-white/8 bg-[#0F172A] text-white rounded-xl px-4 text-xs font-semibold focus:outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[#CBD5E1]/65 uppercase tracking-wider block mb-1">Email Address</label>
                      <input 
                        type="email" 
                        value={profileEmail}
                        onChange={(e) => setProfileEmail(e.target.value)}
                        className="w-full h-11 border border-white/8 bg-[#0F172A] text-white rounded-xl px-4 text-xs font-semibold focus:outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10"
                      />
                    </div>
                  </div>
                </div>

                {/* Notifications & Language Settings */}
                <div className="border-t border-white/8 pt-6">
                  <h3 className="font-outfit font-extrabold text-base mb-4 text-white flex items-center gap-2">
                    <Bell className="h-4.5 w-4.5 text-[#4F46E5]" />
                    <span>System Preferences</span>
                  </h3>
                  <div className="flex flex-col gap-4 max-w-md">
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <span className="text-xs font-bold text-white block">Email Digests</span>
                        <span className="text-[10px] text-[#CBD5E1] font-medium">Receive conversation summaries via email</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={notifEmail}
                        onChange={(e) => setNotifEmail(e.target.checked)}
                        className="h-5 w-5 rounded bg-[#0F172A] border-white/8 text-[#4F46E5] focus:ring-[#4F46E5] cursor-pointer"
                      />
                    </div>
                    <div className="flex items-center justify-between py-2 border-t border-white/8">
                      <div>
                        <span className="text-xs font-bold text-white block">Browser Audio</span>
                        <span className="text-[10px] text-[#CBD5E1] font-medium">Play tone alerts on incoming SSE events</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={notifBrowser}
                        onChange={(e) => setNotifBrowser(e.target.checked)}
                        className="h-5 w-5 rounded bg-[#0F172A] border-white/8 text-[#4F46E5] focus:ring-[#4F46E5] cursor-pointer"
                      />
                    </div>
                    <div className="flex flex-col gap-1 border-t border-white/8 pt-4">
                      <label className="text-[10px] font-bold text-[#CBD5E1]/65 uppercase tracking-wider block mb-1">Interface Language</label>
                      <select 
                        value={selectedLanguage}
                        onChange={(e) => setSelectedLanguage(e.target.value)}
                        className="h-11 border border-white/8 bg-[#0F172A] text-white rounded-xl px-4 text-xs font-bold focus:outline-none focus:border-[#4F46E5]"
                      >
                        <option value="en">English (US)</option>
                        <option value="es">Español (ES)</option>
                        <option value="fr">Français (FR)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Connection Controls */}
                <div className="pt-6 border-t border-white/8">
                  <h3 className="font-outfit font-extrabold text-base mb-4 text-white flex items-center gap-2">
                    <Activity className="h-4.5 w-4.5 text-[#4F46E5]" />
                    <span>State & Cache Operations</span>
                  </h3>
                  <div className="flex flex-col gap-6">
                    <div>
                      <span className="text-[10px] font-bold text-[#CBD5E1]/65 uppercase tracking-wider block mb-1">State Storage</span>
                      <span className="text-xs font-semibold text-[#10B981] flex items-center gap-1.5 mt-1">
                        <span className="h-2 w-2 rounded-full bg-[#10B981]" />
                        SQL database cache synced
                      </span>
                    </div>

                    <button 
                      onClick={handleResetSession}
                      className="w-48 bg-[#EF4444] hover:bg-red-600 text-white font-bold text-xs py-3.5 rounded-xl shadow-md transition-all duration-150 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      <span>Reset Cache & History</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
