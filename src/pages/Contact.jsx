import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MagneticButton } from '../components/Layout';
import { ChevronDown, MessageCircle, FileText, Phone, Send, CheckCircle2 } from 'lucide-react';
import usePageMeta from '../hooks/usePageMeta';

gsap.registerPlugin(ScrollTrigger);

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="border-b border-primary/10 py-6">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left focus:outline-none"
      >
        <h3 className={`font-outfit font-bold text-xl md:text-2xl transition-colors \${isOpen ? 'text-accent' : 'text-primary'}`}>
          {question}
        </h3>
        <ChevronDown className={`w-6 h-6 text-primary transition-transform duration-300 \${isOpen ? 'rotate-180 text-accent' : ''}`} />
      </button>
      <div 
        className={`grid transition-all duration-300 ease-in-out \${isOpen ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <p className="font-sans text-foreground/70 font-light leading-relaxed pb-2">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
};

const ContactForm = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', interest: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle, sending, sent, error

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setStatus('sent');
        setFormData({ name: '', email: '', phone: '', interest: '', message: '' });
      } else {
        // Fallback to mailto if API not available
        const subject = encodeURIComponent(`Healing Hearts Inquiry - ${formData.interest || 'General'}`);
        const body = encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone || 'Not provided'}\nInterest: ${formData.interest || 'Not specified'}\n\n${formData.message}`);
        window.location.href = `mailto:hello@healingheartscourse.com?subject=${subject}&body=${body}`;
        setStatus('sent');
      }
    } catch {
      // Fallback to mailto
      const subject = encodeURIComponent(`Healing Hearts Inquiry - ${formData.interest || 'General'}`);
      const body = encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone || 'Not provided'}\nInterest: ${formData.interest || 'Not specified'}\n\n${formData.message}`);
      window.location.href = `mailto:hello@healingheartscourse.com?subject=${subject}&body=${body}`;
      setStatus('sent');
    }
  };

  if (status === 'sent') {
    return (
      <div className="bg-white rounded-[3rem] p-12 md:p-16 shadow-xl border border-primary/5 text-center">
        <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-6" />
        <h3 className="font-outfit font-bold text-3xl text-primary mb-4">Message Sent</h3>
        <p className="font-sans text-foreground/70 font-light text-lg mb-8">Thank you for reaching out. We'll be in touch within 24 hours.</p>
        <button onClick={() => setStatus('idle')} className="text-accent font-semibold hover:text-primary transition-colors underline underline-offset-4">
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-[3rem] p-8 md:p-12 shadow-xl border border-primary/5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block font-outfit font-bold text-sm text-primary mb-2">Your Name *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-5 py-4 rounded-2xl bg-[#F7F6F2] border border-primary/10 font-sans text-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
            placeholder="Jeff & Trisha"
          />
        </div>
        <div>
          <label className="block font-outfit font-bold text-sm text-primary mb-2">Email Address *</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-5 py-4 rounded-2xl bg-[#F7F6F2] border border-primary/10 font-sans text-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block font-outfit font-bold text-sm text-primary mb-2">Phone (Optional)</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-5 py-4 rounded-2xl bg-[#F7F6F2] border border-primary/10 font-sans text-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
            placeholder="(555) 123-4567"
          />
        </div>
        <div>
          <label className="block font-outfit font-bold text-sm text-primary mb-2">I'm Interested In</label>
          <select
            value={formData.interest}
            onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
            className="w-full px-5 py-4 rounded-2xl bg-[#F7F6F2] border border-primary/10 font-sans text-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all appearance-none"
          >
            <option value="">Select an option...</option>
            <option value="Full Program">The Full Healing Hearts Program</option>
            <option value="Conflict Rescue Kit">The Conflict Rescue Kit</option>
            <option value="Communication Mastery">Communication Mastery Toolkit</option>
            <option value="Physician Marriages">Physician Marriage Track</option>
            <option value="Free Consultation">Free 20-Minute Call</option>
            <option value="Other">Something Else</option>
          </select>
        </div>
      </div>
      <div className="mb-8">
        <label className="block font-outfit font-bold text-sm text-primary mb-2">Your Message *</label>
        <textarea
          required
          rows={5}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="w-full px-5 py-4 rounded-2xl bg-[#F7F6F2] border border-primary/10 font-sans text-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all resize-none"
          placeholder="Tell us a little about where you are and what you're looking for..."
        />
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="font-sans text-foreground/50 text-sm font-light">Your information is always kept private.</p>
        <MagneticButton
          className="bg-accent text-background px-10 py-4 rounded-full text-base font-medium shadow-xl flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          {status === 'sending' ? 'Sending...' : 'Send Message'}
        </MagneticButton>
      </div>
    </form>
  );
};

export default function Contact() {
  usePageMeta('Contact Us', 'Get in touch with the Healing Hearts team. Schedule a free consultation or send us a message.');
  const containerRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      // Reveal animations
      gsap.fromTo('.reveal-el', 
        { y: 30, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 1.2, stagger: 0.15, ease: 'power3.out' }
      );
      
      const cards = gsap.utils.toArray('.contact-card');
      cards.forEach((card, i) => {
        gsap.fromTo(card,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%"
            }
          }
        )
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const faqs = [
    {
      q: "Is this therapy?",
      a: "No. We’re a coaching program, not a licensed therapy practice. Our content is clinically informed—grounded in research from Gottman, polyvagal theory, and attachment science—but we’re not providing clinical treatment. If one or both of you are dealing with untreated mental health conditions, active addiction, or domestic violence, we strongly encourage professional therapy as a first step."
    },
    {
      q: "Is this a Christian program?",
      a: "Our faith shapes everything we do. But if you’re picturing someone quoting Bible verses at you while ignoring the real-world complexity of your marriage, that’s not us. We integrate faith the way it was designed to work—as a foundation for grace, accountability, and hope. Couples of all faith backgrounds have found our program valuable."
    },
    {
      q: "Do we both have to participate?",
      a: "Ideally, yes. This program is built for couples. That said, we’ve seen remarkable things happen when even one partner begins doing the work. When you change your patterns, the dynamics of the relationship have to shift. If your spouse is hesitant, start yourself. Change is contagious."
    },
    {
      q: "How long does the full program take?",
      a: "The complete Healing Hearts program is designed for 32 weeks—8 modules, roughly one month each. But this isn’t a race. Some couples sit with a module for six weeks because it’s touching something deep. We’d rather you go slow and integrate than rush through and forget."
    },
    {
      q: "What if we’re already in a good place?",
      a: "Some of our most enthusiastic couples came in with strong marriages that they wanted to make extraordinary. The frameworks we teach—understanding your nervous system, recognizing patterns, building a shared emotional language—these aren’t crisis tools. They’re life tools. Think of it as preventive medicine for your relationship."
    }
  ];

  return (
    <div ref={containerRef} className="w-full bg-background pt-32 md:pt-48 pb-24">
      
      {/* Contact Header */}
      <section className="relative w-full max-w-6xl mx-auto mb-32 rounded-[3.5rem] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=2574&auto=format&fit=crop" 
            alt="Personable consultation" 
            className="w-full h-[500px] object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-transparent"></div>
        </div>

        <div className="relative z-10 px-6 py-24 md:py-32 text-center">
            <p className="reveal-el font-sans text-primary/60 tracking-widest uppercase text-sm mb-6">Get Started</p>
            <h1 className="reveal-el font-drama italic text-5xl md:text-7xl lg:text-8xl text-primary leading-tight mb-8">
            You're here because something matters.
            </h1>
            <p className="reveal-el font-sans text-foreground/80 md:text-xl leading-relaxed font-light mx-auto max-w-2xl bg-background/50 backdrop-blur-sm p-4 rounded-xl">
            That takes courage. Whether you’re barely holding on or just want to build something deeper than what you have, we’re honored that you’re considering this work.
            </p>
        </div>
      </section>

      {/* 3 Ways to Begin */}
      <section className="bg-[#F7F6F2] py-24 rounded-[4rem] mb-32 mx-4 md:mx-6">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-outfit font-bold text-4xl text-primary">Three Ways to Begin</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="contact-card bg-background p-10 rounded-[2.5rem] shadow-sm border border-primary/5 text-center flex flex-col items-center hover:-translate-y-2 transition-transform duration-500">
              <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mb-6 text-primary">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="font-outfit font-bold text-2xl text-primary mb-4">1. Free Resource</h3>
              <p className="font-sans text-foreground/70 font-light leading-relaxed mb-8 flex-grow">
                Start with our 90-Second Wave guide. No commitment. Just genuinely useful tools you can try tonight.
              </p>
              <a href="#contact-form" className="text-accent font-semibold hover:text-primary transition-colors underline underline-offset-4">Get a Free Download</a>
            </div>

            <div className="contact-card bg-primary text-background p-10 rounded-[2.5rem] shadow-xl text-center flex flex-col items-center hover:-translate-y-2 transition-transform duration-500">
              <div className="w-16 h-16 bg-background/10 rounded-full flex items-center justify-center mb-6 text-background">
                <MessageCircle className="w-8 h-8" />
              </div>
              <h3 className="font-outfit font-bold text-2xl mb-4">2. Choose a Package</h3>
              <p className="font-sans text-background/80 font-light leading-relaxed mb-8 flex-grow">
                Browse our standalone packages and pick the one that speaks to where you are right now.
              </p>
               <Link to="/programs" className="text-accent font-semibold hover:text-background transition-colors underline underline-offset-4">View Our Programs</Link>
            </div>

            <div className="contact-card bg-background p-10 rounded-[2.5rem] shadow-sm border border-primary/5 text-center flex flex-col items-center hover:-translate-y-2 transition-transform duration-500">
              <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mb-6 text-primary">
                <Phone className="w-8 h-8" />
              </div>
              <h3 className="font-outfit font-bold text-2xl text-primary mb-4">3. Book a Call</h3>
              <p className="font-sans text-foreground/70 font-light leading-relaxed mb-8 flex-grow">
                Schedule a free 20-minute call with our team. We’ll listen to where you are and help you find the right path.
              </p>
               <a href="mailto:hello@healingheartscourse.com?subject=Free%20Consultation%20Request" className="text-accent font-semibold hover:text-primary transition-colors underline underline-offset-4">Schedule a Free Call</a>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact-form" className="max-w-4xl mx-auto px-6 mb-32">
        <div className="text-center mb-12">
          <h2 className="font-outfit font-bold text-4xl text-primary mb-4">Send Us a Message</h2>
          <p className="font-sans text-foreground/70 font-light text-lg">We read every message and respond within 24 hours.</p>
        </div>
        <ContactForm />
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-6 mb-32">
        <div className="text-center mb-16">
          <h2 className="font-outfit font-bold text-4xl text-primary mb-4">Frequently Asked Questions</h2>
        </div>
        <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-xl border border-primary/5">
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.q} answer={faq.a} />
          ))}
        </div>
        
        <div className="mt-16 text-center">
           <p className="font-sans text-foreground/70 text-lg mb-6">Still Have Questions?</p>
           <a href="mailto:hello@healingheartscourse.com" className="font-drama italic text-3xl md:text-5xl text-primary hover:text-accent transition-colors">
              hello@healingheartscourse.com
           </a>
        </div>
      </section>

    </div>
  );
}
