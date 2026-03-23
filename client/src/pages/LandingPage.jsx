import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'

// Image URLs from the provided HTML mockups
const HERO_BG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBau1AIdhT11oGK38mI71ZJItf9CW-66Vf4izBu5EFTLIOhEATPyS4gVhn-g39IsymG9u6gr13AT5GUqs4eIxDqPknWxlzkfVE5H8sgFCjz9TtRvfm3unrqD8lw68M8Ldz3hoLGQYgn2bJJyyTNNO88STn-ElzUg2aO4X2vW4tOReqxVwfS5aHPIrvlXBd-B59rIgrJzWjdCgGzlt1UUkX4CJk-IsGwInWDM8lcZosEn6fXCpOkZL3G9Z-f0Eg6b92lYs1hw-MKpEg'
const GALLERY_1 = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrQmhp46oU0auD4_UF92velT4eplTt9CJ4uI9R4nJEH8iunZaNl6iUTwBTUODd-El36J1ySA5eZ6_fMYxgvLUkwmJIXYlapMTN_snkjnbAwtbE6VSMmxFUC3g8R6jxeNYAQzFrZow9s8EUEGaWDhCBk0BItbqOpl4f7017DHF1L84hqpy9y4m6BEELyhrDkI8JyZ7UN0w9hJ7CgvPHozi_FhZni8v0Uv8_6z3qJlRh4v4l6HZ5E5cviT5Wm3_Mrrw8hgLqBQRNGmI'
const GALLERY_2 = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAAPDsLeE1ZjnrVFjypEZA5eea8UejYjabVsVzrTr-mCE1lGIou6J86kW0AjibarnG0IjojRv2e32SXGz7gxKq3j84QgTrpB9McucpLZ44YEk7R4wgMEHT-D3zfFI7FoNfuw45i34854qSIxIz6-JH-NBXbfdS2CZEN2BKBCxs7kGyQPPQrr8DuyDBi8FvoPaep4PqSQdxuuAwhhcW_-GojaVa120wkxZJnX0QDdYWdIFOrMkfk1CBZIp71GjRNCXEzQtJzHtJfvF4'
const GALLERY_3 = 'https://lh3.googleusercontent.com/aida-public/AB6AXuATL1o2mwLnwTOXFYmg_z3hIi6xG7G1NXKk0xN_2qt2_F2fGogLhfVO5QjWKPUF8SwnQe2MooFHjMhm5xnQubwmgfPCkyWGhvVmkO2h7djSvhNmQQGtZXQv-A6iljm5hGGlUyQ10iOMe1-PNzPKJjUymrput4qbr-YXFlOfh-23Nm6dS3Xwp2U6mDtk5rEql9brooBO8vmdlvZtWruy8hDhKdpMlK8Ga_0aUD33BPtmJQrddq7q2iqk6q_MCPp4EXIPinvtH6aZzwM'
const STEP2_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuA9bZDK4JatNaefVw2LZrQ3wpnhx9dg5l7HomJnTsKnwH3g3tq3hW66YDO3Q2g5_xJRET701Jm4nq0lczF0Yd8BgujuHHzS8qhNGKMFolWZ6FS90yY9cPJn2EwPK8bovm9l049AGGAiNKojLTKsRdvbd58LgVqxLcnnPvFdJPXIUekxR37mkJfT8Ixqqobwuww1HOZnaOYAzlSiYOSsIjZqIhoRMspUEmgU8Yu2ij9D8MKJias_Jc_hyolEV9KQO4A-mEhRf0G_8Pc'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.15, duration: 0.6, ease: 'easeOut' } }),
}

export default function LandingPage() {
  const { user } = useAuth()

  return (
    <div className="bg-surface text-on-surface font-body antialiased selection:bg-primary/20 selection:text-primary">
      {/* ─── Navigation ─── */}
      <header className="fixed top-0 z-50 w-full bg-white/70 backdrop-blur-xl shadow-sm shadow-zinc-200/50">
        <nav className="flex justify-between items-center w-full px-8 py-4 max-w-screen-2xl mx-auto">
          <div className="text-xl font-bold tracking-tighter text-zinc-900 font-headline">StyleNest AI</div>
          <div className="hidden md:flex items-center gap-8 font-headline text-sm font-medium tracking-tight">
            <a className="text-amber-600 font-bold border-b-2 border-amber-500 pb-1" href="#hero">Home</a>
            <Link className="text-zinc-600 hover:text-zinc-900 transition-colors" to={user ? '/workspace' : '/auth'}>Workspace</Link>
            <Link className="text-zinc-600 hover:text-zinc-900 transition-colors" to={user ? '/dashboard' : '/auth'}>Dashboard</Link>
            <a className="text-zinc-600 hover:text-zinc-900 transition-colors" href="#pricing">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <Link to="/dashboard" className="bg-primary-gradient text-white px-6 py-2.5 rounded-xl font-headline font-bold text-sm transition-transform active:scale-95 shadow-lg shadow-primary/20">
                Dashboard
              </Link>
            ) : (
              <Link to="/auth" className="bg-primary-gradient text-white px-6 py-2.5 rounded-xl font-headline font-bold text-sm transition-transform active:scale-95 shadow-lg shadow-primary/20">
                Start Designing
              </Link>
            )}
          </div>
        </nav>
      </header>

      {/* ─── Hero Section ─── */}
      <section id="hero" className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img alt="Luxury modern living room" className="w-full h-full object-cover" src={HERO_BG} />
          <div className="absolute inset-0 bg-black/10" />
        </div>
        <div className="container mx-auto px-8 md:px-12 relative z-10">
          <motion.div
            className="max-w-3xl bg-surface-container-lowest/40 backdrop-blur-2xl p-8 md:p-16 rounded-xl border border-white/20 shadow-2xl"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
          >
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-bold tracking-widest uppercase mb-6">
              Experience the future
            </span>
            <h1 className="text-5xl md:text-7xl font-headline font-extrabold tracking-tighter text-on-surface leading-[1.1] mb-6">
              Redesign Your Space with AI
            </h1>
            <p className="text-xl text-on-surface-variant font-light leading-relaxed mb-10 max-w-xl">
              Upload a photo, generate new styles, and customize your room in interactive 3D. Precision-crafted interiors at your fingertips.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to={user ? '/workspace' : '/auth'}
                className="bg-primary-gradient text-white px-10 py-5 rounded-xl font-headline font-extrabold text-lg flex items-center justify-center gap-3 shadow-xl shadow-primary/30 transition-all hover:scale-[1.02]"
              >
                Start Designing <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
              <a
                href="#steps"
                className="bg-white/80 backdrop-blur-md text-on-surface px-10 py-5 rounded-xl font-headline font-extrabold text-lg flex items-center justify-center gap-3 transition-all hover:bg-white"
              >
                Learn More
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── How it Works (Bento Grid) ─── */}
      <section id="steps" className="py-32 px-8 bg-surface">
        <div className="max-w-screen-2xl mx-auto">
          <motion.div className="text-center mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tight mb-4">Magic in Three Steps</h2>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full" />
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Step 1 */}
            <motion.div className="md:col-span-4 bg-surface-container-low p-10 rounded-xl relative overflow-hidden group" initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-8 transition-transform group-hover:scale-110">
                  <span className="material-symbols-outlined text-primary text-3xl">upload_file</span>
                </div>
                <h3 className="text-2xl font-headline font-bold mb-4">01. Upload</h3>
                <p className="text-on-surface-variant font-light leading-relaxed">Simply snap a photo of your existing room. Our AI instantly analyzes dimensions, lighting, and architectural features.</p>
              </div>
            </motion.div>
            {/* Step 2 */}
            <motion.div className="md:col-span-8 bg-surface-container-highest/50 p-10 rounded-xl relative overflow-hidden group" initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1} variants={fadeUp}>
              <div className="grid md:grid-cols-2 gap-10 items-center">
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-primary-gradient text-white rounded-2xl flex items-center justify-center shadow-lg mb-8 transition-transform group-hover:scale-110">
                    <span className="material-symbols-outlined text-3xl">auto_awesome</span>
                  </div>
                  <h3 className="text-2xl font-headline font-bold mb-4">02. Generate</h3>
                  <p className="text-on-surface-variant font-light leading-relaxed">Choose from 20+ aesthetic styles—from Japandi to Brutalist—and watch our engine render a photorealistic reimagining in seconds.</p>
                </div>
                <div className="rounded-lg overflow-hidden shadow-2xl transition-transform group-hover:-translate-y-2">
                  <img alt="AI Generated Interior" className="w-full h-48 object-cover" src={STEP2_IMG} />
                </div>
              </div>
            </motion.div>
            {/* Step 3 */}
            <motion.div className="md:col-span-7 bg-inverse-surface p-10 rounded-xl relative overflow-hidden group" initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2} variants={fadeUp}>
              <div className="grid md:grid-cols-5 gap-10 items-center h-full">
                <div className="md:col-span-2 relative z-10">
                  <div className="w-16 h-16 bg-white/10 text-white rounded-2xl flex items-center justify-center backdrop-blur-lg mb-8 transition-transform group-hover:scale-110">
                    <span className="material-symbols-outlined text-3xl">view_in_ar</span>
                  </div>
                  <h3 className="text-2xl font-headline font-bold mb-4 text-white">03. Customize</h3>
                  <p className="text-white/70 font-light leading-relaxed">Interactively swap furniture, adjust color palettes, and explore your new room in a seamless 3D environment.</p>
                </div>
                <div className="md:col-span-3 h-full flex items-center">
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 w-full">
                    <div className="space-y-4">
                      <div className="h-2 w-3/4 bg-white/20 rounded" />
                      <div className="h-2 w-1/2 bg-white/20 rounded" />
                      <div className="h-8 w-full bg-primary/40 rounded-lg" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            {/* CTA Card */}
            <motion.div className="md:col-span-5 bg-surface-container-low p-10 rounded-xl flex flex-col justify-between border border-primary/5" initial="hidden" whileInView="visible" viewport={{ once: true }} custom={3} variants={fadeUp}>
              <div>
                <h3 className="text-2xl font-headline font-bold mb-4">Ready to start?</h3>
                <p className="text-on-surface-variant font-light mb-8">Join over 10,000 homeowners and designers using StyleNest AI to revolutionize their living spaces.</p>
              </div>
              <Link to={user ? '/dashboard' : '/auth'} className="w-full py-4 text-primary font-headline font-bold border border-primary rounded-xl hover:bg-primary hover:text-white transition-all text-center">
                Explore Gallery
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Showcase Gallery ─── */}
      <section className="py-32 bg-surface-container-low">
        <div className="max-w-screen-2xl mx-auto px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-4xl font-headline font-extrabold tracking-tight mb-6">Stunning Transformations</h2>
              <p className="text-on-surface-variant font-light text-lg">See how our AI turns mundane spaces into curated architectural masterpieces with a single click.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[
              { img: GALLERY_1, title: 'Nordic Sanctuary', sub: 'Living Room • Stockholm' },
              { img: GALLERY_2, title: 'Industrial Loft', sub: 'Bedroom • New York' },
              { img: GALLERY_3, title: 'Zen Kitchen', sub: 'Dining • Tokyo' },
            ].map((item, idx) => (
              <motion.div key={idx} className="group" initial="hidden" whileInView="visible" viewport={{ once: true }} custom={idx} variants={fadeUp}>
                <div className="relative rounded-xl overflow-hidden aspect-[4/5] mb-6 shadow-xl">
                  <img alt={item.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100" src={item.img} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-6 left-6 text-white opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all">
                    <p className="font-headline font-bold text-lg">{item.title}</p>
                    <p className="text-sm text-white/80">{item.sub}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section id="pricing" className="py-32 bg-white">
        <div className="max-w-screen-2xl mx-auto px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-headline font-extrabold tracking-tight mb-4">Invest in Your Home</h2>
            <p className="text-on-surface-variant font-light">Simple plans for every level of inspiration.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Explorer */}
            <motion.div className="p-10 rounded-xl bg-surface-container-low transition-all hover:translate-y-[-8px]" whileHover={{ y: -8 }}>
              <p className="font-headline font-extrabold text-sm tracking-widest uppercase text-secondary mb-8">Explorer</p>
              <div className="mb-8"><span className="text-5xl font-headline font-extrabold">$0</span><span className="text-on-surface-variant">/month</span></div>
              <ul className="space-y-4 mb-10">
                <li className="flex items-center gap-3 text-on-surface-variant"><span className="material-symbols-outlined text-primary text-sm">check_circle</span> 3 Renders per Month</li>
                <li className="flex items-center gap-3 text-on-surface-variant"><span className="material-symbols-outlined text-primary text-sm">check_circle</span> 5 Standard Styles</li>
                <li className="flex items-center gap-3 text-on-surface-variant opacity-50"><span className="material-symbols-outlined text-sm">cancel</span> High-res Export</li>
              </ul>
              <Link to="/auth" className="block w-full py-4 rounded-xl font-headline font-bold bg-white text-on-surface hover:bg-surface-container-highest transition-all text-center">Get Started</Link>
            </motion.div>
            {/* Designer (Most Popular) */}
            <motion.div className="p-10 rounded-xl bg-inverse-surface text-white relative shadow-2xl" whileHover={{ y: -8 }}>
              <div className="absolute top-0 right-10 -translate-y-1/2 bg-primary text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Most Popular</div>
              <p className="font-headline font-extrabold text-sm tracking-widest uppercase text-primary mb-8">Designer</p>
              <div className="mb-8"><span className="text-5xl font-headline font-extrabold">$29</span><span className="text-white/60">/month</span></div>
              <ul className="space-y-4 mb-10 text-white/80">
                <li className="flex items-center gap-3"><span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span> Unlimited Renders</li>
                <li className="flex items-center gap-3"><span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span> 3D Interaction Lab</li>
                <li className="flex items-center gap-3"><span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span> 4K Photorealistic Exports</li>
              </ul>
              <Link to="/auth" className="block w-full py-4 rounded-xl font-headline font-bold bg-primary-gradient text-white shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all text-center">Go Pro</Link>
            </motion.div>
            {/* Studio */}
            <motion.div className="p-10 rounded-xl bg-surface-container-low transition-all" whileHover={{ y: -8 }}>
              <p className="font-headline font-extrabold text-sm tracking-widest uppercase text-secondary mb-8">Studio</p>
              <div className="mb-8"><span className="text-5xl font-headline font-extrabold">$99</span><span className="text-on-surface-variant">/month</span></div>
              <ul className="space-y-4 mb-10">
                <li className="flex items-center gap-3 text-on-surface-variant"><span className="material-symbols-outlined text-primary text-sm">check_circle</span> Everything in Pro</li>
                <li className="flex items-center gap-3 text-on-surface-variant"><span className="material-symbols-outlined text-primary text-sm">check_circle</span> Team Collaboration</li>
                <li className="flex items-center gap-3 text-on-surface-variant"><span className="material-symbols-outlined text-primary text-sm">check_circle</span> Custom Style Training</li>
              </ul>
              <button className="w-full py-4 rounded-xl font-headline font-bold bg-white text-on-surface hover:bg-surface-container-highest transition-all">Contact Sales</button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="py-24 px-8">
        <div className="max-w-5xl mx-auto rounded-xl bg-primary-gradient p-12 md:p-24 text-center text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-headline font-extrabold tracking-tight mb-8">Ready to reinvent your reality?</h2>
            <p className="text-xl text-white/80 font-light mb-12 max-w-2xl mx-auto">Take the first step towards a home that truly reflects your soul.</p>
            <Link to={user ? '/workspace' : '/auth'} className="inline-block bg-white text-primary px-12 py-5 rounded-xl font-headline font-extrabold text-lg shadow-xl hover:bg-surface transition-all">
              Start Designing Now
            </Link>
          </div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="bg-zinc-100 w-full mt-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 px-12 py-16 max-w-screen-2xl mx-auto">
          <div className="col-span-2 md:col-span-1">
            <div className="font-headline font-bold text-zinc-900 mb-6">StyleNest AI</div>
            <p className="text-xs text-zinc-500 leading-relaxed max-w-xs">The leading AI platform for interior design, empowering everyone to create beautiful, curated living spaces.</p>
          </div>
          <div>
            <h4 className="font-headline font-bold text-xs uppercase tracking-widest text-zinc-900 mb-6">Product</h4>
            <div className="flex flex-col gap-4 text-xs text-zinc-500">
              <Link className="hover:text-amber-600 transition-colors" to="/workspace">Workspace</Link>
              <a className="hover:text-amber-600 transition-colors" href="#">Style Library</a>
              <a className="hover:text-amber-600 transition-colors" href="#">API Docs</a>
            </div>
          </div>
          <div>
            <h4 className="font-headline font-bold text-xs uppercase tracking-widest text-zinc-900 mb-6">Connect</h4>
            <div className="flex flex-col gap-4 text-xs text-zinc-500">
              <a className="hover:text-amber-600 transition-colors" href="#">Instagram</a>
              <a className="hover:text-amber-600 transition-colors" href="#">Pinterest</a>
              <a className="hover:text-amber-600 transition-colors" href="#">Contact</a>
            </div>
          </div>
          <div>
            <h4 className="font-headline font-bold text-xs uppercase tracking-widest text-zinc-900 mb-6">Legal</h4>
            <div className="flex flex-col gap-4 text-xs text-zinc-500">
              <a className="hover:text-amber-600 transition-colors" href="#">Privacy Policy</a>
              <a className="hover:text-amber-600 transition-colors" href="#">Terms of Service</a>
            </div>
          </div>
        </div>
        <div className="border-t border-zinc-200 py-8 px-12 max-w-screen-2xl mx-auto flex justify-between items-center">
          <p className="text-xs text-zinc-500">© 2024 StyleNest AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
