import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'

const HERO_BG = 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1920&q=100'
const GALLERY_1 = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800'
const GALLERY_2 = 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800'
const GALLERY_3 = 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800'
const STEP2_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuA9bZDK4JatNaefVw2LZrQ3wpnhx9dg5l7HomJnTsKnwH3g3tq3hW66YDO3Q2g5_xJRET701Jm4nq0lczF0Yd8BgujuHHzS8qhNGKMFolWZ6FS90yY9cPJn2EwPK8bovm9l049AGGAiNKojLTKsRdvbd58LgVqxLcnnPvFdJPXIUekxR37mkJfT8Ixqqobwuww1HOZnaOYAzlSiYOSsIjZqIhoRMspUEmgU8Yu2ij9D8MKJias_Jc_hyolEV9KQO4A-mEhRf0G_8Pc'

// Reusable variants
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: 'easeOut' },
  }),
}

const fadeLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

const fadeRight = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

const scaleUp = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: 'easeOut' } },
}

export default function LandingPage() {
  const { user } = useAuth()

  return (
    <div className="bg-surface text-on-surface font-body antialiased selection:bg-primary/20 selection:text-primary">

      {/* ─── Hero Section ─── */}
      <section id="hero" className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Background with slow zoom */}
        <motion.div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${HERO_BG})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
          initial={{ scale: 1 }}
          animate={{ scale: 1.05 }}
          transition={{ duration: 8, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' }}
        />
        {/* Separate overlay — does NOT affect image quality */}
        <div className="absolute inset-0 z-0 bg-black/30" />

        <div className="container mx-auto px-8 md:px-12 relative z-10">
          {/* Glassmorphism card: fade in + slide up */}
          <motion.div
            className="max-w-3xl p-8 md:p-16"
            style={{
              background: 'rgba(245,240,235,0.75)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              border: '1px solid rgba(255,255,255,0.5)',
              borderRadius: '24px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease: 'easeOut' }}
          >
            {/* Badge */}
            <motion.span
              className="inline-block px-4 py-1.5 bg-primary/10 rounded-full text-xs font-bold tracking-widest uppercase mb-6"
              style={{ color: '#B8860B' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0, duration: 0.5 }}
            >
              Experience the future
            </motion.span>

            {/* Heading */}
            <motion.h1
              className="text-5xl md:text-7xl font-headline font-extrabold tracking-tighter leading-[1.1] mb-6"
              style={{ color: '#1a1a1a' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
            >
              Redesign Your Space with AI
            </motion.h1>

            {/* Subtext */}
            <motion.p
              className="text-xl font-light leading-relaxed mb-10 max-w-xl"
              style={{ color: '#3d3d3d' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6, ease: 'easeOut' }}
            >
              Upload a photo, generate new styles, and customize your room in interactive 3D. Precision-crafted interiors at your fingertips.
            </motion.p>

            {/* Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6, ease: 'easeOut' }}
            >
              <motion.div
                whileHover={{
                  boxShadow: '0 0 24px 6px rgba(139,115,85,0.45)',
                  scale: 1.03,
                }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="rounded-xl"
              >
                <Link
                  to={user ? '/workspace' : '/auth'}
                  className="bg-primary-gradient text-white px-10 py-5 rounded-xl font-headline font-extrabold text-lg flex items-center justify-center gap-3 shadow-xl shadow-primary/30 transition-all"
                >
                  Start Designing <span className="material-symbols-outlined">arrow_forward</span>
                </Link>
              </motion.div>
              <a
                href="#steps"
                className="bg-white/80 backdrop-blur-md text-on-surface px-10 py-5 rounded-xl font-headline font-extrabold text-lg flex items-center justify-center gap-3 transition-all hover:bg-white"
              >
                Learn More
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── How it Works (Bento Grid) ─── */}
      <section id="steps" className="py-32 px-8 bg-surface">
        <div className="max-w-screen-2xl mx-auto">
          {/* Section title */}
          <motion.div
            className="text-center mb-20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={fadeUp}
          >
            <h2 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tight mb-4">Magic in Three Steps</h2>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Step 1 — slide from LEFT */}
            <motion.div
              className="md:col-span-4 bg-surface-container-low p-10 rounded-xl relative overflow-hidden group"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={fadeLeft}
              whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.12)' }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-8 transition-transform group-hover:scale-110">
                  <span className="material-symbols-outlined text-primary text-3xl">upload_file</span>
                </div>
                <h3 className="text-2xl font-headline font-bold mb-4">01. Upload</h3>
                <p className="text-on-surface-variant font-light leading-relaxed">Simply snap a photo of your existing room. Our AI instantly analyzes dimensions, lighting, and architectural features.</p>
              </div>
            </motion.div>

            {/* Step 2 — slide from BOTTOM */}
            <motion.div
              className="md:col-span-8 bg-surface-container-highest/50 p-10 rounded-xl relative overflow-hidden group"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={fadeUp}
              whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.12)' }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
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

            {/* Step 3 — slide from RIGHT */}
            <motion.div
              className="md:col-span-7 bg-inverse-surface p-10 rounded-xl relative overflow-hidden group"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={fadeRight}
              whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.18)' }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
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

            {/* CTA Card — scale up */}
            <motion.div
              className="md:col-span-5 bg-surface-container-low p-10 rounded-xl flex flex-col justify-between border border-primary/5"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={scaleUp}
            >
              <div>
                <h3 className="text-2xl font-headline font-bold mb-4">Ready to start?</h3>
                <p className="text-on-surface-variant font-light mb-8">Join over 10,000 homeowners and designers using StyleNest AI to revolutionize their living spaces.</p>
              </div>
              <motion.div
                whileHover={{ backgroundPosition: '200% center' }}
                className="relative overflow-hidden rounded-xl"
              >
                <Link
                  to={user ? '/workspace' : '/auth'}
                  className="block w-full py-4 text-primary font-headline font-bold border border-primary rounded-xl hover:bg-primary hover:text-white transition-all text-center relative z-10"
                >
                  Explore Gallery
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Showcase Gallery ─── */}
      <section className="py-32 bg-surface-container-low">
        <div className="max-w-screen-2xl mx-auto px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="max-w-2xl">
              {/* Heading fade-up */}
              <motion.h2
                className="text-4xl font-headline font-extrabold tracking-tight mb-6"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                variants={fadeUp}
              >
                Stunning Transformations
              </motion.h2>
              <motion.p
                className="text-on-surface-variant font-light text-lg"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                variants={fadeUp}
                custom={1}
              >
                See how our AI turns mundane spaces into curated architectural masterpieces with a single click.
              </motion.p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[
              { img: GALLERY_1, title: 'Modern Living Room', sub: 'Living Room • Contemporary' },
              { img: GALLERY_2, title: 'Minimal Bedroom', sub: 'Bedroom • Scandinavian' },
              { img: GALLERY_3, title: 'Luxury Kitchen', sub: 'Kitchen • Modern' },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                className="group"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                variants={fadeUp}
                custom={idx}
              >
                <motion.div
                  className="relative rounded-2xl overflow-hidden aspect-[4/3] shadow-xl"
                  whileHover={{ scale: 1.04 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  <img
                    alt={item.title}
                    className="w-full h-full object-cover"
                    src={item.img}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-5 left-5 text-white">
                    <p className="font-headline font-bold text-lg leading-tight">{item.title}</p>
                    <p className="text-sm text-white/75 mt-0.5">{item.sub}</p>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="py-24 px-8">
        <motion.div
          className="max-w-5xl mx-auto rounded-xl bg-primary-gradient p-12 md:p-24 text-center text-white relative overflow-hidden"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={scaleUp}
        >
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-headline font-extrabold tracking-tight mb-8">Ready to reinvent your reality?</h2>
            <p className="text-xl text-white/80 font-light mb-12 max-w-2xl mx-auto">Take the first step towards a home that truly reflects your soul.</p>
            <Link to={user ? '/workspace' : '/auth'} className="inline-block bg-white text-primary px-12 py-5 rounded-xl font-headline font-extrabold text-lg shadow-xl hover:bg-surface transition-all">
              Start Designing Now
            </Link>
          </div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        </motion.div>
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
