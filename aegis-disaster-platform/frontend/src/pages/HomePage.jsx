import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import {
  AlertTriangle, Bot, Brain, CheckCircle, Map, MessageCircle,
  Radio, Shield, Siren, Star, Users, Warehouse, Zap,
  ArrowRight, Globe, Lock, Activity, Phone
} from 'lucide-react';
import { motion } from 'framer-motion';

const FEATURES = [
  { icon: Siren,         title: 'SOS Emergency System',    desc: 'One-tap panic alerts with GPS dispatch and real-time authority notification streams.',        badge: 'Core' },
  { icon: Map,           title: 'Live Disaster Maps',      desc: 'Interactive Leaflet maps with danger zones, safe corridors, shelter pins, and team tracking.',  badge: 'Live' },
  { icon: Brain,         title: 'AI Risk Intelligence',    desc: 'Simulated disaster scoring from rainfall, wind speed, and seismic sensor feeds.',              badge: 'AI' },
  { icon: MessageCircle, title: 'Encrypted Chat Rooms',    desc: 'Role-based real-time messaging between victims, field helpers, and command authorities.',       badge: 'Real-Time' },
  { icon: Warehouse,     title: 'Smart Shelter Logistics', desc: 'Live occupancy, food stock days, and medical supply status for every evacuation centre.',      badge: 'Live' },
  { icon: Bot,           title: 'AI Emergency Chatbot',    desc: 'Instant survival guidance for floods, fires, and earthquakes — works fully offline.',          badge: 'AI' },
  { icon: Radio,         title: 'Alert Broadcast System',  desc: 'Multi-severity push alerts to targeted role groups with real-time notification feeds.',         badge: 'Core' },
  { icon: Users,         title: 'Missing Persons Registry',desc: 'File and track missing person reports with status cycling and family reunification tools.',     badge: 'Core' },
];

const PLANS = [
  {
    name: 'Community',
    price: 'Free',
    period: 'forever',
    description: 'For NGOs and small response teams getting started.',
    color: 'border-slate-200',
    badge: null,
    features: [
      'Up to 50 users',
      'SOS & basic alerts',
      'Live maps & shelters',
      'Community chat rooms',
      'Missing persons registry',
    ],
    cta: 'Get Started Free',
    ctaStyle: 'border border-slate-300 text-slate-700 hover:bg-slate-50',
  },
  {
    name: 'Response',
    price: '$49',
    period: '/month',
    description: 'For government departments and mid-size response agencies.',
    color: 'border-indigo-500 shadow-xl shadow-indigo-100',
    badge: 'Most Popular',
    features: [
      'Unlimited users',
      'AI risk prediction engine',
      'Drone telemetry module',
      'Advanced analytics dashboard',
      'Real-time WebRTC comms',
      'Priority alert broadcasts',
      'Cloudinary media uploads',
    ],
    cta: 'Start 14-day Trial',
    ctaStyle: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200',
  },
  {
    name: 'Command',
    price: '$199',
    period: '/month',
    description: 'For national disaster management authorities and multi-region deployments.',
    color: 'border-slate-200',
    badge: 'Enterprise',
    features: [
      'Everything in Response',
      'Multi-region deployment',
      'Dedicated account manager',
      'SLA uptime guarantee',
      'Custom integrations & API',
      'On-premise option',
      'Satellite + sensor feeds',
    ],
    cta: 'Contact Sales',
    ctaStyle: 'border border-slate-800 text-slate-800 hover:bg-slate-900 hover:text-white',
  },
];

const TESTIMONIALS = [
  {
    name: 'Major R. Sharma',
    role: 'Disaster Response Authority',
    avatar: 'RS',
    text: 'Aegis reduced our coordination time by 60%. The live SOS feed and AI risk scores gave our field commanders real decision advantage during the monsoon floods.',
    stars: 5,
    color: 'from-indigo-600 to-violet-700',
  },
  {
    name: 'Priya Nair',
    role: 'NGO Field Coordinator',
    avatar: 'PN',
    text: 'The missing persons module and shelter tracking let our volunteers update statuses from the field instantly. Families were reunited faster than ever.',
    stars: 5,
    color: 'from-teal-600 to-emerald-700',
  },
  {
    name: 'David Chen',
    role: 'Emergency Management Officer',
    avatar: 'DC',
    text: 'We converted the web app to an APK and distributed it to all field teams. Offline AI chatbot was a lifesaver when towers went down.',
    stars: 5,
    color: 'from-rose-600 to-red-700',
  },
];

const STATS = [
  { value: '2.4M+',   label: 'SOS Incidents Managed'   },
  { value: '180+',    label: 'Agencies Deployed'        },
  { value: '99.97%',  label: 'Uptime SLA'               },
  { value: '<800ms',  label: 'Real-Time Alert Latency'  },
];

const TRUST = [
  { icon: Lock,     label: 'SOC 2 Type II'       },
  { icon: Shield,   label: 'End-to-End Encrypted' },
  { icon: Globe,    label: 'GDPR Compliant'       },
  { icon: Activity, label: '99.97% Uptime'        },
];

const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 glass-dark" style={{ paddingTop: 'var(--safe-top)' }}>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/40 shrink-0">
              <Shield className="text-white h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-black text-white">AEGIS</span>
              <span className="hidden xs:inline text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400 ml-2">Disaster Intel</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing"  className="hover:text-white transition-colors">Pricing</a>
            <a href="#trust"    className="hover:text-white transition-colors">Security</a>
          </div>
          <div className="flex items-center gap-2">
            <Link to={ROUTES.LOGIN}    className="px-3 py-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors">Sign In</Link>
            <Link to={ROUTES.REGISTER} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-all hover:scale-105">
              Get Access
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 text-center sm:px-6 pt-24">
        <div className="absolute inset-0 bg-animated" />
        <div className="absolute inset-0 bg-grid opacity-50" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full bg-indigo-600/8 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-violet-600/8 blur-3xl pointer-events-none" />

        <motion.div
          className="relative z-10 max-w-5xl mx-auto"
          initial="hidden" animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
        >
          <motion.div variants={fadeUp}>
            <div className="saas-badge mb-6 mx-auto w-fit">
              <span className="status-dot live" />
              Next-Gen Disaster Intelligence Platform
            </div>
          </motion.div>

          <motion.h1 variants={fadeUp} className="mb-6 text-5xl font-black leading-[1.05] tracking-tight sm:text-7xl md:text-8xl hero-glow">
            <span className="text-white">Save Lives.</span>{' '}
            <span className="text-gradient">Command</span>{' '}
            <span className="text-white">Disasters.</span>
          </motion.h1>

          <motion.p variants={fadeUp} className="mx-auto mb-10 max-w-3xl text-base leading-relaxed text-slate-400 sm:text-xl">
            Aegis is the world's most advanced real-time disaster management SaaS platform.
            Coordinate SOS dispatch, AI risk scoring, live maps, missing persons, shelter logistics,
            and field rescue — from a single command workspace.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Link
              to={ROUTES.REGISTER}
              className="flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-8 py-4 text-base font-bold shadow-2xl shadow-indigo-600/40 transition-all hover:scale-105 hover:bg-indigo-500 glow-indigo"
            >
              <Zap className="h-5 w-5" />
              Launch Platform Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to={ROUTES.LOGIN}
              className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-base font-semibold hover:bg-white/10 transition-all"
            >
              Sign In to Dashboard
            </Link>
          </motion.div>

          {/* stats strip */}
          <motion.div variants={fadeUp} className="mx-auto mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4 max-w-2xl">
            {STATS.map((s) => (
              <div key={s.label} className="glass-dark rounded-2xl p-4 text-center">
                <p className="text-2xl font-black text-white sm:text-3xl">{s.value}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
          <span className="text-[10px] uppercase tracking-widest text-slate-500">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-slate-500 to-transparent" />
        </div>
      </section>

      {/* ── TRUST STRIP ── */}
      <section id="trust" className="border-y border-white/5 bg-slate-900/60 px-4 py-6 sm:py-8">
        <div className="mx-auto max-w-5xl flex flex-wrap items-center justify-center gap-6 sm:gap-10">
          {TRUST.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2.5 text-slate-400">
              <Icon className="h-4 w-4 text-indigo-400 shrink-0" />
              <span className="text-sm font-semibold">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="px-4 py-20 sm:py-28">
        <motion.div
          className="mx-auto max-w-6xl"
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}
          variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
        >
          <motion.div variants={fadeUp} className="mb-14 text-center">
            <div className="saas-badge mx-auto w-fit mb-4">Platform Capabilities</div>
            <h2 className="text-3xl font-black text-white sm:text-5xl">Everything you need in a crisis</h2>
            <p className="mt-4 text-slate-400 max-w-2xl mx-auto">Built for life-critical operations. Every module is production-ready, real-time, and mobile-native.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f) => (
              <motion.div
                key={f.title} variants={fadeUp}
                className="group rounded-2xl border border-white/5 bg-white/[0.03] p-6 hover:bg-white/[0.07] hover:border-indigo-500/30 transition-all card-lift cursor-default"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center group-hover:bg-indigo-600/30 transition-colors">
                    <f.icon className="text-indigo-400 h-5 w-5" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-600/10 px-2 py-1 rounded-full">{f.badge}</span>
                </div>
                <h3 className="font-bold text-white text-sm mb-2">{f.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── ROLES ── */}
      <section className="bg-slate-900/40 px-4 py-20 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <div className="saas-badge mx-auto w-fit mb-4">Role-Based Access Control</div>
            <h2 className="text-3xl font-black text-white sm:text-4xl">One platform. Three command roles.</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { role: 'Victim / Civilian', color: 'from-rose-600 to-red-700',     shadow: 'shadow-red-600/20',    desc: 'Send SOS with GPS, find nearest shelters, receive live emergency alerts, track rescue status, and access survival guidance.' },
              { role: 'Helper / NGO',      color: 'from-teal-600 to-emerald-700', shadow: 'shadow-teal-600/20',   desc: 'Accept field missions, coordinate resource distribution, update volunteer availability, and track route conditions.' },
              { role: 'Authority / Admin', color: 'from-indigo-600 to-violet-700',shadow: 'shadow-indigo-600/20', desc: 'Manage command centre, publish alerts, run AI risk analysis, review analytics, and deploy rescue resources.' },
            ].map((r) => (
              <div key={r.role} className="group rounded-2xl border border-white/5 bg-white/[0.03] p-8 hover:bg-white/[0.06] transition-all">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${r.color} flex items-center justify-center mb-5 shadow-xl ${r.shadow} group-hover:scale-105 transition-transform`}>
                  <Shield className="text-white h-7 w-7" />
                </div>
                <h3 className="text-xl font-black text-white mb-3">{r.role}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            <motion.div variants={fadeUp} className="mb-14 text-center">
              <div className="saas-badge mx-auto w-fit mb-4">Transparent Pricing</div>
              <h2 className="text-3xl font-black text-white sm:text-5xl">Simple. Scalable. Serious.</h2>
              <p className="mt-4 text-slate-400 max-w-xl mx-auto">Deploy Aegis for any disaster response organisation — from community NGOs to national command centres.</p>
            </motion.div>

            <div className="grid sm:grid-cols-3 gap-6">
              {PLANS.map((plan) => (
                <motion.div
                  key={plan.name} variants={fadeUp}
                  className={`relative rounded-3xl border-2 bg-white p-8 flex flex-col ${plan.color}`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="bg-indigo-600 text-white text-xs font-black px-4 py-1.5 rounded-full shadow-lg shadow-indigo-200 whitespace-nowrap">
                        {plan.badge}
                      </span>
                    </div>
                  )}
                  <div className="mb-6">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">{plan.name}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-slate-900">{plan.price}</span>
                      <span className="text-slate-500 text-sm">{plan.period}</span>
                    </div>
                    <p className="text-slate-500 text-sm mt-2 leading-relaxed">{plan.description}</p>
                  </div>
                  <ul className="space-y-3 flex-1 mb-8">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm text-slate-700">
                        <CheckCircle className="h-4 w-4 text-indigo-500 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to={ROUTES.REGISTER}
                    className={`block w-full rounded-2xl px-4 py-3.5 text-center text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98] ${plan.ctaStyle}`}
                  >
                    {plan.cta}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="bg-slate-900/40 px-4 py-20 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <div className="saas-badge mx-auto w-fit mb-4">Trusted By Responders</div>
            <h2 className="text-3xl font-black text-white sm:text-4xl">What commanders say</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="rounded-2xl border border-white/5 bg-white/[0.03] p-6 hover:bg-white/[0.06] transition-all">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center font-black text-white text-sm shrink-0`}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{t.name}</p>
                    <p className="text-slate-500 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MOBILE APK CALLOUT ── */}
      <section className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-600/15 to-violet-600/10 p-8 sm:p-12 lg:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-grid opacity-30" />
          <div className="relative z-10">
            <Phone className="h-12 w-12 text-indigo-400 mx-auto mb-5" />
            <h2 className="mb-4 text-3xl font-black text-white sm:text-4xl">Works as a mobile app too</h2>
            <p className="text-slate-400 mb-8 max-w-xl mx-auto leading-relaxed">
              Aegis is PWA-ready and can be packaged as an Android APK or iOS app using Capacitor.
              Offline AI chatbot, GPS SOS, and mobile-optimised dashboards work without an internet connection.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to={ROUTES.REGISTER}
                className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-8 py-4 text-base font-bold shadow-2xl shadow-indigo-600/30 hover:bg-indigo-500 transition-all hover:scale-105"
              >
                <Zap className="h-5 w-5" />
                Activate Aegis
              </Link>
              <a
                href="#features"
                className="flex items-center gap-2 rounded-2xl border border-white/10 px-8 py-4 text-base font-semibold hover:bg-white/5 transition-all"
              >
                Explore Features
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-indigo-600 flex items-center justify-center">
                <Shield className="text-white h-4 w-4" />
              </div>
              <span className="font-black text-white">AEGIS</span>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400">Disaster Intel</span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-500">
              <a href="#features"  className="hover:text-slate-300 transition-colors">Features</a>
              <a href="#pricing"   className="hover:text-slate-300 transition-colors">Pricing</a>
              <a href="#trust"     className="hover:text-slate-300 transition-colors">Security</a>
              <Link to={ROUTES.LOGIN}    className="hover:text-slate-300 transition-colors">Sign In</Link>
              <Link to={ROUTES.REGISTER} className="hover:text-slate-300 transition-colors">Register</Link>
            </div>
          </div>
          <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <p>© {new Date().getFullYear()} AEGIS Disaster Intelligence Platform · All rights reserved</p>
            <p>Built for life-critical operations · SOC 2 · GDPR</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
