// קוד עזר שיוזרק לתוך הלשונית premium
export const premiumContent = `
        {activeTab === 'premium' && (
          <div className="space-y-4">
            {/* Global Takeover */}
            <motion.div variants={itemVariants} className="bg-gradient-to-br from-amber-500/10 to-emerald-500/10 border border-amber-500/30 p-5 rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 bg-amber-500 text-black text-[10px] font-black uppercase rounded-bl-2xl">High Demand</div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black text-xl shadow-[0_0_20px_rgba(251,191,36,0.5)]">
                  <FaCrown />
                </div>
                <div>
                  <h3 className="font-black text-xl text-amber-400">Global Takeover</h3>
                  <p className="text-xs text-white/60">Pin your drop to the top of EVERY user's feed for 1 hour.</p>
                </div>
              </div>
              <button className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-3 rounded-xl transition-colors">
                Purchase - $4.99
              </button>
            </motion.div>

            {/* God Mode Subscription */}
            <motion.div variants={itemVariants} className="bg-black border border-emerald-500/50 p-5 rounded-3xl relative">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full border-2 border-emerald-500 flex items-center justify-center text-emerald-400 text-xl">
                  <FaGem />
                </div>
                <div>
                  <h3 className="font-black text-xl text-emerald-400">God Mode</h3>
                  <p className="text-xs text-white/60">Immunity to sabotage, custom pulse colors, and a VIP badge.</p>
                </div>
              </div>
              <button className="w-full bg-transparent border-2 border-emerald-500 text-emerald-400 hover:bg-emerald-500 hover:text-black font-black py-3 rounded-xl transition-all">
                Subscribe - $9.99/mo
              </button>
            </motion.div>
          </div>
        )}
`;
