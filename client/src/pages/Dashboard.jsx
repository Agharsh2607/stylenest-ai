import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import Sidebar from '../components/Sidebar'

const PLACEHOLDER_IMAGES = {
  before: [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDWI8I-MFCSS4BoQKnpvV1_ifc80izARE3n5eNxRs0HiqFcjEbgabBqQ6T4quWBS8ouOmnvgwIUDPHLoJohdAtEdXY7fVd1ATPLuZrmIlbdp71kzcRvi5DXKFB8sqo_8JmTr6UYX4emn3uuOZ9idmTVwnhkwgen1DgH5lZrHMg3DPnw47fOzOf4FIp_WdLzfcASiHJhEDhfPNSMX9bvVzWXoPWjtNh10tKKmevRLbT37h1kcoP6xRrFxpybrar829X1YUkBLhhxstQ',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCbP9SQsxm_BbDpOyb6RdMDCGAmTrwE3OZFm9ADtthW8w6ShmG_g2n677pmD10pxlJTGSImVahnlJcLv7F0h6t1znlzwwJ85vIIVvDuy7m8VzUfsmHZH151r5_Qf-nQyeIHjBSUCPncup4fCNCxs_FQptGsa_jGIs12mSfYGD9V_cA7x3iPxktvVvgw9rIOOjBXjg7yfRSqEGEf1xUtOAxZ2fFGFwl-GQ6uVNczH3RCKfG5i0O8Kq-0UGUwBPE2qSrBjicmyj946JI',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDM1C966O-ycQMR32t-dyJDXIHfZI5sq6kYiUK7EKvqOnU7yrzVpme-TgvG5-wbJlpyDyBdHa6PdntwsS8O2jl7hw7ohfv2t2FTWGSXAJlFDK5rt0lSDMh4DCNhvGldwD-KUh3dd65Dj77rgu3PlbiwmMHQWrNZVLMGJ4nxjRcY8ZszYXfvL3fav6Vsnw2f15u2sD46nYYIY3kr9Cv8R6GiUlGh_nm3fDFXO5flTu7R63DQZvItmlbNVs-qy9rdDntRO6REI-Z86b4',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuD8Y36Jd7hHNvBaBTaK_IFD2XVkpeFhxnFvauhpblEHD2VP9VV0FV6kGsSCaAM4hl3wjxg5oDhkUCHF38nEsaIc575p8m5YNARIh9Q9s3of69dFZNSuw-KUAAJiWggRJW43ylbl5__8QaGz-BKOqYjIC_cWD_tsYUjBsse-448xyNH6bBo7jH9QesjO4GGtGx5f3V2PEukr67mS_Km7kOwSgWA7N6r8832tAxhrIb7c0qF3ucNGtEJkmaKIz90eblXoAl4cdm5xyPE',
  ],
  after: [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuD_jY8BBoUKvi-Tb8J8zmu8f1VnjW--XYEy8lxKOFuIUBxojD6fOeEi-2PX1I2LVmy6KM-CnxXSQ_FuXryngD8lVRlFIQTeh0HIDVfOGqVxQzSQTueygp3SKTRsA005nmNTPuiViQKY_rb3rvrkEc3MgwXiwz-2-lEQxwLmRuQt_e5J8_KqwYI2yJNsoUyvrThvrXVcy6OxJfTNN0L13vD948kYegjFrvEFLevREI5XOl_Jm2qKFoWOjIv7TOuSoyrJe0XZkSUqi3A',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDZIfE_nzV7YT-1f8YIEuGTGQhuf6tGX3_ojV0bQES_K8cNSx_iHDrk15O_splAizgSHFZePDJeqojBWO5LeVcVCus0ULTenakWvclsV7Poq7LIPEmUMZZq1IWZbr9NNNu__tcqYM0mQZmz5qFoUlc_AYauASjrtmOtZX4-aQGlMPkLQ9DQ45l_4Kbnjentvdgkq9D9MZPYSywO0cWSCPerXks3C5Bu4ffxZgR20_xkNF1NTVKowKTVAgw7Pd53RsdvQXfpQsI8J5E',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAb9z06QOL5l555PAzmJZNQvtdlGCaqvXEIaNYNwIdvJtUtO9pKTE7JCD_PsAdU6fG60j3DNaECzSb4pi8yCPapFgwWDlI_EfRg6G32irBUbudd8Js1RF9lP-JxQQ8CDGHWX6X27DhS9lOWBVArNedhX7WsPVlUkw2d5VR0xMbvevHwnP1Ne-Q5UO6RixgfLLbVMAwevHpzX9q58OaAK0Cjxge_yhficezvZsxP5MvARC2X1KWhrKmXxFrOvqXyjoJgq9EAx60w-g4',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBqX_3RRyYPL2AVrOMeLHEx3LeXpmFB1PzSYoiX9TesyQtcFKdXaeArxOnXbFedH-oHt4NFpJq9EKtJztXMAugAncUHHcjk4s2fD9LfFCe1gnM45Oxd5Lj0_pz9ifRCIixi2vx8cJOa2rWdMFjG_dZn7NX6b28VpTZp286eMSDlcn38LJ9wmEw9esVlUH6M-BkBc3zqtR553XyA9yZ3icMFEUEvcQU7OL0qY4p2HPWnU9MxS7NArcFROtOKowZlBJ8JCAdcDHuV6JY',
  ],
}

const DEMO_DESIGNS = [
  { id: '1', title: 'Pacific Penthouse', style: 'Modern Luxury', date: 'Jan 12, 2024', beforeIdx: 0, afterIdx: 0 },
  { id: '2', title: 'Loft Studio', style: 'Scandi Minimal', date: 'Jan 08, 2024', beforeIdx: 1, afterIdx: 1 },
  { id: '3', title: 'The Oak Kitchen', style: 'Mid-Century', date: 'Jan 02, 2024', beforeIdx: 2, afterIdx: 2 },
  { id: '4', title: 'Velvet Retreat', style: 'Art Deco', date: 'Dec 28, 2023', beforeIdx: 3, afterIdx: 3 },
]

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  // In a real app, you'd fetch designs from Supabase. Using demo data for showcase.
  const [designs] = useState(DEMO_DESIGNS)

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar active="designs" />
      <main className="ml-64 flex-1 min-h-screen pb-20">
        {/* Header */}
        <header className="sticky top-0 z-30 flex justify-between items-center w-full px-12 py-8 bg-white/70 backdrop-blur-xl">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-on-surface font-headline">
              Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}
            </h1>
            <p className="text-secondary mt-1">Ready to create your next masterpiece?</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-all">
              <span className="material-symbols-outlined text-on-surface">notifications</span>
            </button>
          </div>
        </header>

        {/* Designs Grid */}
        <section className="px-12 mt-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold font-headline text-on-surface">My Designs</h2>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-surface-container-low rounded-full text-xs font-bold text-secondary flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">filter_list</span>
                All Categories
              </button>
              <button className="px-4 py-2 bg-surface-container-low rounded-full text-xs font-bold text-secondary flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">sort</span>
                Recent
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {/* New Design Card */}
            <motion.button
              onClick={() => navigate('/workspace')}
              className="group relative aspect-[4/5] rounded-xl border-2 border-dashed border-outline-variant/30 flex flex-col items-center justify-center gap-4 hover:border-primary/50 transition-all bg-surface-container-low/50 hover:bg-surface-container-low"
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-primary text-3xl">add</span>
              </div>
              <div className="text-center">
                <p className="font-headline font-bold text-on-surface">New Design</p>
                <p className="text-xs text-secondary mt-1">Start from a blank canvas</p>
              </div>
            </motion.button>

            {/* Design Cards */}
            {designs.map((design, idx) => (
              <motion.div
                key={design.id}
                className="group bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <div className="absolute inset-0 flex">
                    <div className="w-1/2 relative overflow-hidden border-r-2 border-white/20">
                      <img className="w-full h-full object-cover" alt="Before" src={PLACEHOLDER_IMAGES.before[design.beforeIdx]} />
                      <div className="absolute top-2 left-2 bg-black/40 backdrop-blur-md px-2 py-1 rounded text-[10px] text-white font-bold">BEFORE</div>
                    </div>
                    <div className="w-1/2 relative overflow-hidden">
                      <img className="w-full h-full object-cover" alt="After" src={PLACEHOLDER_IMAGES.after[design.afterIdx]} />
                      <div className="absolute top-2 right-2 bg-primary/80 backdrop-blur-md px-2 py-1 rounded text-[10px] text-white font-bold">AFTER</div>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <button
                      onClick={() => navigate('/result')}
                      className="w-10 h-10 rounded-full bg-white text-primary flex items-center justify-center hover:scale-110 transition-transform"
                    >
                      <span className="material-symbols-outlined">visibility</span>
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-headline font-bold text-on-surface">{design.title}</h3>
                      <p className="text-xs text-secondary mt-0.5">{design.date}</p>
                    </div>
                    <span className="px-3 py-1 bg-secondary-container rounded-full text-[10px] font-bold text-on-secondary-container tracking-wider uppercase">
                      {design.style}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-surface-container">
                    <div className="flex gap-2">
                      <button className="p-2 text-secondary hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-sm">download</span>
                      </button>
                      <button className="p-2 text-secondary hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-sm">share</span>
                      </button>
                    </div>
                    <button className="p-2 text-secondary hover:text-error transition-colors">
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className="px-12 mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-xl bg-surface-container-low border border-outline-variant/10">
            <span className="material-symbols-outlined text-primary mb-4">auto_fix</span>
            <p className="text-xs font-bold text-secondary uppercase tracking-widest">Render Credits</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-headline font-extrabold">248</span>
              <span className="text-secondary text-sm">/ 500</span>
            </div>
            <div className="w-full bg-surface-container h-1.5 rounded-full mt-4">
              <div className="bg-primary h-full rounded-full w-[49.6%]" />
            </div>
          </div>
          <div className="p-8 rounded-xl bg-surface-container-low border border-outline-variant/10">
            <span className="material-symbols-outlined text-primary mb-4">star</span>
            <p className="text-xs font-bold text-secondary uppercase tracking-widest">Active Projects</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-headline font-extrabold">12</span>
              <span className="text-secondary text-sm">this month</span>
            </div>
            <p className="text-xs text-primary mt-4 font-bold">+15% from last month</p>
          </div>
          <div className="p-8 rounded-xl bg-inverse-surface text-inverse-on-surface">
            <span className="material-symbols-outlined text-primary-fixed mb-4">workspace_premium</span>
            <p className="text-xs font-bold opacity-70 uppercase tracking-widest">Pro Status</p>
            <h4 className="text-xl font-headline font-bold mt-2">Elite Designer</h4>
            <p className="text-xs opacity-60 mt-1">Next tier: Master Curator (8 designs left)</p>
            <button className="mt-6 w-full py-2 bg-primary-fixed text-on-primary-fixed rounded-full text-xs font-bold hover:scale-105 transition-transform">
              View Achievement Path
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}
