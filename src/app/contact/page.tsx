'use client';

import React, { useState } from 'react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('ORDER_STATUS');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="flex flex-col w-full text-on-surface">
      {/* Top Meta Bar */}
      <div className="w-full bg-surface-container-lowest px-margin md:px-margin-desktop py-space-sm border-b border-[#262626]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm font-mono">
          <div className="flex items-center gap-space-md flex-wrap">
            <span className="font-label-sm text-label-sm text-outline tracking-widest uppercase">
              [ CLIENT CONCIERGE // ATELIER DISPATCH ]
            </span>
            <span className="hidden sm:inline text-outline-variant">|</span>
            <span className="font-label-sm text-label-sm text-primary tracking-widest uppercase">
              COMMUNICATION CHANNEL
            </span>
          </div>
          <span className="font-label-sm text-label-sm text-outline uppercase">
            RESPONSE TIME: &lt; 12 HOURS
          </span>
        </div>
      </div>

      <div className="w-full px-margin md:px-margin-desktop py-space-lg md:py-space-xl">
        <div className="max-w-4xl mx-auto flex flex-col space-y-space-xl">
          {/* Header */}
          <div className="flex flex-col space-y-space-xs border-b border-[#262626] pb-space-lg">
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-outline font-mono">
              [ DIRECT TRANSMISSION ]
            </span>
            <h1 className="font-display-xl text-display-xl uppercase tracking-tight text-primary leading-none m-0">
              CONTACT ATELIER.
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant uppercase tracking-wide mt-2">
              For sizing calibrations, custom allocation inquiries, or logistics waybill support.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-desktop">
            {/* Left Contact Form */}
            <div className="lg:col-span-8 bg-surface-container-low border border-[#262626] p-space-lg md:p-space-xl font-mono">
              {submitted ? (
                <div className="p-space-lg bg-surface-container-lowest border border-primary space-y-space-sm">
                  <span className="font-headline-md text-headline-md text-primary block font-sans">
                    [ TRANSMISSION LOGGED ]
                  </span>
                  <p className="font-body-md text-on-surface-variant font-sans">
                    Your communiqué has been registered with ticket ID{' '}
                    <span className="text-primary font-mono">#KZ-TCK-{Math.floor(1000 + Math.random() * 9000)}</span>.
                    The concierge team will review and reply within 12 operational hours.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setMessage('');
                    }}
                    className="mt-4 px-space-md py-2 bg-primary text-on-primary font-label-sm text-label-sm uppercase font-bold"
                  >
                    SEND ANOTHER INQUIRY
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-space-md">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                    <div className="flex flex-col gap-space-xs">
                      <label className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface">
                        IDENTIFIER / NAME
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="ALEXANDER VANCE"
                        className="w-full bg-surface-container-lowest border border-[#262626] focus:border-primary text-primary font-label-md text-label-md px-space-md py-space-sm outline-none transition-colors uppercase"
                      />
                    </div>
                    <div className="flex flex-col gap-space-xs">
                      <label className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface">
                        EMAIL TRANSMISSION
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="client@kaaze.com"
                        className="w-full bg-surface-container-lowest border border-[#262626] focus:border-primary text-primary font-label-md text-label-md px-space-md py-space-sm outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-space-xs">
                    <label className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface">
                      QUERY CATEGORY
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full bg-surface-container-lowest border border-[#262626] focus:border-primary text-primary font-label-md text-label-md px-space-md py-space-sm outline-none transition-colors"
                    >
                      <option value="ORDER_STATUS">01 // ORDER STATUS &amp; WAYBILL INQUIRY</option>
                      <option value="SIZING_FIT">02 // SIZING &amp; STRUCTURAL FIT ADVISORY</option>
                      <option value="ALLOCATION">03 // ARCHIVAL PRESSING ALLOCATION</option>
                      <option value="PRESS">04 // EDITORIAL &amp; PRESS INQUIRIES</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-space-xs">
                    <label className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface">
                      TRANSMISSION CONTENT
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="ENTER DETAILED LOGISTICAL SPECIFICATIONS OR QUERY..."
                      className="w-full bg-surface-container-lowest border border-[#262626] focus:border-primary text-primary font-label-md text-label-md p-space-md outline-none transition-colors font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-primary hover:bg-surface-container-lowest hover:border hover:border-primary text-surface hover:text-primary font-label-md text-label-md uppercase tracking-[0.2em] font-bold transition-all flex items-center justify-center gap-space-sm mt-2"
                  >
                    <span>DISPATCH INQUIRY</span>
                    <span className="material-symbols-outlined text-[18px]">send</span>
                  </button>
                </form>
              )}
            </div>

            {/* Right Information Aside */}
            <div className="lg:col-span-4 flex flex-col gap-space-md font-mono">
              <div className="bg-surface-container-low border border-[#262626] p-space-md space-y-space-sm">
                <span className="font-label-sm text-label-sm uppercase tracking-widest text-outline block border-b border-[#262626] pb-2">
                  [ ATELIER DIRECT DIALS ]
                </span>
                <div>
                  <span className="text-outline uppercase text-[11px] block">CONCIERGE DESK</span>
                  <span className="text-primary font-bold">concierge@kaaze.com</span>
                </div>
                <div>
                  <span className="text-outline uppercase text-[11px] block">DISPATCH TERMINAL</span>
                  <span className="text-primary font-bold">+49 30 8920 4110</span>
                </div>
                <div>
                  <span className="text-outline uppercase text-[11px] block">DISCORD PRIVATE SALON</span>
                  <span className="text-primary font-bold">discord.gg/kaaze</span>
                </div>
              </div>

              <div className="bg-surface-container-low border border-[#262626] p-space-md space-y-space-sm">
                <span className="font-label-sm text-label-sm uppercase tracking-widest text-outline block border-b border-[#262626] pb-2">
                  [ PHYSICAL NODES ]
                </span>
                <p className="text-on-surface-variant font-label-sm text-label-sm leading-relaxed">
                  BERLIN ATELIER<br />
                  TORSTRAßE 114, 10119 BERLIN<br />
                  LAT 52.5298° N // LON 13.3995° E
                </p>
                <p className="text-on-surface-variant font-label-sm text-label-sm leading-relaxed pt-2 border-t border-[#262626]">
                  TOKYO SHIZUOKA NODE<br />
                  MINATO-KU, TOKYO 106-0032<br />
                  LAT 35.6586° N // LON 139.7454° E
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
