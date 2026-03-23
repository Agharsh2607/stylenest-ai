const Pricing = () => {
  return (
    <div className="min-h-screen pt-24 px-8" style={{ background: '#f5f0eb' }}>
      <h1 className="text-4xl font-bold text-center mb-4">Simple Pricing</h1>
      <p className="text-center text-gray-500 mb-12">Choose a plan that works for you</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">

        {/* Free Plan */}
        <div className="bg-white rounded-2xl p-8 shadow-md">
          <h2 className="text-xl font-bold mb-2">Free</h2>
          <p className="text-4xl font-bold mb-1">$0</p>
          <p className="text-gray-400 text-sm mb-6">Forever free</p>
          <ul className="space-y-3 text-sm text-gray-600 mb-8">
            <li>✓ 5 AI generations/month</li>
            <li>✓ Basic room styles</li>
            <li>✓ Image download</li>
            <li>✗ 3D view</li>
            <li>✗ Priority generation</li>
          </ul>
          <button className="w-full py-3 rounded-xl border-2 border-[#8B7355] text-[#8B7355] font-semibold hover:bg-[#8B7355] hover:text-white transition-all">
            Get Started
          </button>
        </div>

        {/* Pro Plan */}
        <div className="bg-[#8B7355] rounded-2xl p-8 shadow-xl scale-105 text-white">
          <div className="text-xs font-bold bg-white text-[#8B7355] px-3 py-1 rounded-full w-fit mb-4">MOST POPULAR</div>
          <h2 className="text-xl font-bold mb-2">Pro</h2>
          <p className="text-4xl font-bold mb-1">$12</p>
          <p className="text-white/70 text-sm mb-6">per month</p>
          <ul className="space-y-3 text-sm mb-8">
            <li>✓ 100 AI generations/month</li>
            <li>✓ All room styles</li>
            <li>✓ Image download</li>
            <li>✓ 3D view</li>
            <li>✓ Priority generation</li>
          </ul>
          <button className="w-full py-3 rounded-xl bg-white text-[#8B7355] font-semibold hover:bg-white/90 transition-all">
            Start Pro
          </button>
        </div>

        {/* Enterprise Plan */}
        <div className="bg-white rounded-2xl p-8 shadow-md">
          <h2 className="text-xl font-bold mb-2">Enterprise</h2>
          <p className="text-4xl font-bold mb-1">$49</p>
          <p className="text-gray-400 text-sm mb-6">per month</p>
          <ul className="space-y-3 text-sm text-gray-600 mb-8">
            <li>✓ Unlimited generations</li>
            <li>✓ All room styles</li>
            <li>✓ Image download</li>
            <li>✓ 3D view</li>
            <li>✓ Priority generation</li>
            <li>✓ Team collaboration</li>
            <li>✓ API access</li>
          </ul>
          <button className="w-full py-3 rounded-xl border-2 border-[#8B7355] text-[#8B7355] font-semibold hover:bg-[#8B7355] hover:text-white transition-all">
            Contact Sales
          </button>
        </div>

      </div>
    </div>
  )
}

export default Pricing
