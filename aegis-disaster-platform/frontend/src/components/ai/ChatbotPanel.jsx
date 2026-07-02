import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, ChevronRight, Minimize2, Maximize2, Siren } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { operationsService } from '../../services/operationsService';

// ── Offline-capable AI engine — no auth, no backend required ──
function getLocalAIResponse(input) {
  const text = input.toLowerCase();

  if (text.includes('flood') || text.includes('water') || text.includes('drown') || text.includes('river')) {
    return {
      type: 'flood',
      emoji: '🌊',
      urgency: 'critical',
      message: "Flood emergency detected. Take these steps immediately:",
      steps: [
        'Move to the highest floor or rooftop NOW — do not wait.',
        'Do NOT walk or drive through flood water — even 15 cm can knock you down.',
        'Turn off electricity at the main breaker if safe.',
        'Call emergency services: 112 / 911.',
        'Wave a bright cloth from a window to signal rescuers.',
        'Nearest shelter: Use the Shelters tab to find the closest.',
      ]
    };
  }

  if (text.includes('fire') || text.includes('smoke') || text.includes('burn') || text.includes('flame')) {
    return {
      type: 'fire',
      emoji: '🔥',
      urgency: 'critical',
      message: "Fire emergency! Act NOW:",
      steps: [
        'GET OUT immediately — do not stop for belongings.',
        'If clothes catch fire: STOP, DROP, ROLL.',
        'Stay low and crawl under smoke — smoke kills faster than flames.',
        'Feel doors for heat with the back of your hand before opening.',
        'Once outside, do NOT go back in for any reason.',
        'Call 112 / 911 from a safe location.',
      ]
    };
  }

  if (text.includes('earthquake') || text.includes('quake') || text.includes('tremor') || text.includes('shake')) {
    return {
      type: 'earthquake',
      emoji: '🪨',
      urgency: 'high',
      message: "Earthquake protocol — act immediately:",
      steps: [
        'DROP to hands and knees immediately.',
        'COVER your head and neck with your arms. Get under a sturdy table if close.',
        'HOLD ON until shaking stops.',
        'Stay away from windows, exterior walls, and anything that can fall.',
        'If outdoors, move away from buildings, power lines, and trees.',
        'After shaking: check for injuries, gas leaks, and structural damage.',
      ]
    };
  }

  if (text.includes('cyclone') || text.includes('hurricane') || text.includes('typhoon') || text.includes('storm')) {
    return {
      type: 'cyclone',
      emoji: '🌀',
      urgency: 'high',
      message: "Cyclone / Storm emergency guidance:",
      steps: [
        'Evacuate to a designated shelter if authorities advise — do NOT wait.',
        'Move away from coastal areas, rivers, and low-lying ground.',
        'Secure or bring inside any loose outdoor items.',
        'Stay away from windows during the storm — interior rooms are safest.',
        'After the storm: beware of downed power lines and flood water.',
        'Do NOT use candles — use flashlights if power is out.',
      ]
    };
  }

  if (text.includes('landslide') || text.includes('mudslide') || text.includes('mud')) {
    return {
      type: 'landslide',
      emoji: '⛰️',
      urgency: 'critical',
      message: "Landslide warning — evacuate immediately:",
      steps: [
        'Move AWAY from the slide path as fast as possible — do not try to outrun it.',
        'Head uphill and to the sides — not downhill.',
        'If trapped: curl into a ball and protect your head.',
        'Listen for unusual sounds (cracking trees, rocks rumbling).',
        'After slide: avoid the slide area — secondary slides are common.',
        'Report your location to emergency services: 112.',
      ]
    };
  }

  if (text.includes('sos') || text.includes('trapped') || text.includes('help') || text.includes('stuck') || text.includes('rescue')) {
    return {
      type: 'sos',
      emoji: '🆘',
      urgency: 'critical',
      message: "SOS detected — immediate action steps:",
      steps: [
        'Use the SOS button in this app to alert authorities with your GPS location.',
        'Call emergency services: 112 / 911 if you have signal.',
        'If no signal: send an SMS — it requires less bandwidth.',
        'Signal rescuers: use a mirror, flashlight, or brightly colored cloth.',
        'Stay in place if safe — it is easier for rescuers to find you.',
        'Conserve phone battery — turn off Wi-Fi and reduce screen brightness.',
      ]
    };
  }

  if (text.includes('shelter') || text.includes('evacuation') || text.includes('where') || text.includes('refuge')) {
    return {
      type: 'shelter',
      emoji: '🏛️',
      urgency: 'moderate',
      message: "Shelter and evacuation guidance:",
      steps: [
        'Open the Shelters tab in this app to see live capacity and locations.',
        'Choose the nearest shelter with OPEN status and medical availability.',
        'Bring ID documents, medications, and 3 days of water/food if possible.',
        'Use official evacuation routes only — follow authority directions.',
        'Register your presence at the shelter so family can find you.',
        'If roads are blocked, contact authorities via Chat or SOS.',
      ]
    };
  }

  if (text.includes('missing') || text.includes('lost') || text.includes('found')) {
    return {
      type: 'missing',
      emoji: '🔍',
      urgency: 'moderate',
      message: "Missing person guidance:",
      steps: [
        'Go to the Missing Persons tab to file or search a report.',
        'Provide a clear description: name, age, last location, clothing.',
        'Contact local authorities and hospitals immediately.',
        'Share photos on community groups to widen the search.',
        'Check all nearby shelters — many separated people end up there.',
        'Do not give up — keep checking the Missing Persons registry regularly.',
      ]
    };
  }

  // Default
  return {
    type: 'general',
    emoji: '🛡️',
    urgency: 'low',
    message: "Aegis AI is ready to help. Try asking about:",
    steps: [
      '"I am trapped in a flood" — for flood guidance.',
      '"Fire in my building" — for fire emergency steps.',
      '"Earthquake happening" — for earthquake protocol.',
      '"Where is the nearest shelter?" — for evacuation info.',
      '"I need SOS help" — for rescue coordination.',
      '"Someone is missing" — for missing person reporting.',
    ]
  };
}

const URGENCY_STYLES = {
  critical: 'border-red-200 bg-red-50',
  high:     'border-amber-200 bg-amber-50',
  moderate: 'border-indigo-200 bg-indigo-50',
  low:      'border-slate-200 bg-slate-50',
};

const QUICK_PROMPTS = [
  { label: '🌊 Flood', q: 'I am caught in a flood' },
  { label: '🔥 Fire', q: 'There is a fire near me' },
  { label: '🆘 SOS', q: 'I need rescue help now' },
  { label: '🏛️ Shelter', q: 'Where is the nearest shelter?' },
];

const ChatbotPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      content: 'Hello! I am the **Aegis Emergency AI**. I provide instant survival guidance — no login required.',
      isWelcome: true,
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await operationsService.getEmergencyGuidance(text);
      const data = response.data.data;
      
      const emojiMap = { 
        flood: '🌊', fire: '🔥', earthquake: '🪨', cyclone: '🌀', 
        landslide: '⛰️', sos: '🆘', shelter: '🏛️', missing: '🔍', general: '🛡️' 
      };
      const urgencyMap = { 
        flood: 'critical', fire: 'critical', earthquake: 'high', cyclone: 'high', 
        landslide: 'critical', sos: 'critical', shelter: 'moderate', missing: 'moderate', general: 'low' 
      };
      
      setMessages(prev => [...prev, {
        role: 'bot',
        type: data.type || 'general',
        emoji: emojiMap[data.type] || '🛡️',
        urgency: urgencyMap[data.type] || 'low',
        message: data.message || 'AI guidance retrieved:',
        steps: data.guidance || []
      }]);
    } catch (err) {
      console.warn('Backend AI Guidance unavailable, using local rules-based engine:', err);
      const aiResponse = getLocalAIResponse(text);
      setMessages(prev => [...prev, { role: 'bot', ...aiResponse }]);
    } finally {
      setIsTyping(false);
    }
  };

  const panelSize = isExpanded
    ? 'h-[min(640px,calc(100vh-7rem))] w-[calc(100vw-2rem)] sm:w-[520px]'
    : 'h-[min(520px,calc(100vh-7rem))] w-[calc(100vw-2rem)] sm:w-96';

  return (
    <div className="fixed bottom-4 right-4 z-50 flex max-w-[calc(100vw-2rem)] flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className={`${panelSize} flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all duration-300`}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <Bot size={16} />
                </div>
                <div>
                  <p className="font-bold text-sm leading-none">Aegis Emergency AI</p>
                  <p className="text-[10px] text-indigo-200 mt-0.5">Instant guidance · No login needed</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsExpanded(e => !e)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                  title={isExpanded ? 'Shrink' : 'Expand'}
                >
                  {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'bot' ? (
                    <div className={`max-w-[90%] rounded-2xl rounded-tl-sm border p-4 ${URGENCY_STYLES[msg.urgency || 'low']}`}>
                      {msg.isWelcome ? (
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {msg.content.replace(/\*\*/g, '')}
                        </p>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-xl">{msg.emoji}</span>
                            <p className="text-sm font-bold text-slate-800">{msg.message}</p>
                          </div>
                          <div className="space-y-2">
                            {msg.steps?.map((step, sIdx) => (
                              <div key={sIdx} className="flex gap-2 items-start text-xs text-slate-700">
                                <span className="w-5 h-5 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-500 shrink-0 mt-0.5">
                                  {sIdx + 1}
                                </span>
                                {step}
                              </div>
                            ))}
                          </div>
                          {msg.urgency === 'critical' && (
                            <div className="mt-3 flex items-center gap-2 pt-3 border-t border-red-200">
                              <Siren size={12} className="text-red-600 animate-pulse" />
                              <span className="text-[10px] font-black text-red-600 uppercase tracking-wide">
                                Use the SOS button for live rescue dispatch
                              </span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="max-w-[80%] bg-indigo-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm">
                      {msg.content}
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-1.5">
                    <span className="text-xs text-slate-400 mr-1">Aegis AI is thinking</span>
                    {[0, 0.15, 0.3].map((d, i) => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${d}s` }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick prompts */}
            <div className="px-3 pt-2 pb-0 flex gap-1.5 overflow-x-auto shrink-0 bg-white border-t border-slate-100">
              {QUICK_PROMPTS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => sendMessage(p.q)}
                  className="shrink-0 text-[11px] font-semibold text-slate-600 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg px-3 py-1.5 transition-colors whitespace-nowrap mb-2"
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="p-3 bg-white border-t border-slate-100 shrink-0">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
                  placeholder="Describe your emergency…"
                  className="flex-1 bg-slate-100 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none text-slate-800 placeholder:text-slate-400"
                />
                <button
                  onClick={() => sendMessage(input)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-xl transition-colors shadow-md shadow-indigo-200"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(o => !o)}
        className="relative w-14 h-14 bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-2xl shadow-2xl shadow-indigo-500/40 flex items-center justify-center hover:shadow-indigo-500/60 transition-shadow"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X size={24} />
            </motion.div>
          ) : (
            <motion.div key="bot" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <Bot size={24} />
            </motion.div>
          )}
        </AnimatePresence>
        {/* Live badge */}
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping absolute" />
          <span className="w-1.5 h-1.5 bg-white rounded-full" />
        </span>
      </motion.button>
    </div>
  );
};

export default ChatbotPanel;
