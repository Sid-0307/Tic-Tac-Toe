import React, { useState } from 'react';

interface NicknameModalProps {
  onSubmit: (nickname: string) => void;
}

export const NicknameModal: React.FC<NicknameModalProps> = ({ onSubmit }) => {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      setError('Please enter a nickname.');
      return;
    }
    if (trimmed.length < 2) {
      setError('Nickname must be at least 2 characters.');
      return;
    }
    if (trimmed.length > 16) {
      setError('Nickname must be 16 characters or less.');
      return;
    }
    setError('');
    onSubmit(trimmed);
  };

  return (
    <div className="fixed inset-0 bg-ebony-950 flex items-center justify-center p-4">

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-bumble-500 rounded-full opacity-[0.03] blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-white rounded-full opacity-[0.02] blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative w-full max-w-sm animate-fade-in">

        <div className="bg-ebony-900 border border-white/5 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl">

          <div className="px-6 pt-8 pb-4">
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              Tic<span className="text-bumble-500">Tac</span>Toe
            </h1>
            <p className="text-white/40 text-sm mt-1 font-medium">Real-time multiplayer</p>
          </div>


          <div className="px-6 py-6 pb-8">
            <form onSubmit={handleSubmit}>
              <label className="block text-xs font-bold text-white/50 mb-3 uppercase tracking-widest">
                Player Profile
              </label>

              <input
                id="nickname-input"
                type="text"
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  setError('');
                }}
                placeholder="Enter your nickname"
                maxLength={16}
                autoFocus
                className="
                  w-full px-5 py-4 rounded-xl
                  bg-ebony-950 border border-white/5
                  text-white placeholder-white/20
                  focus:outline-none focus:border-bumble-500/50 focus:ring-1 focus:ring-bumble-500/30
                  transition-all duration-300 text-base font-medium shadow-inner
                "
              />

              {error && (
                <p className="mt-2 text-crimson-400 text-sm font-medium">{error}</p>
              )}

              <button
                id="continue-btn"
                type="submit"
                className="
                  mt-6 w-full py-4 rounded-xl font-bold text-base tracking-wide
                  bg-bumble-500 text-ebony-950
                  hover:bg-bumble-400
                  transform transition-all duration-300
                  hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,183,0,0.3)]
                  active:scale-[0.98]
                  focus:outline-none focus:ring-2 focus:ring-bumble-500/50
                "
              >
                Continue <span className="text-ebony-800 ml-1">→</span>
              </button>
            </form>

            <p className="mt-5 text-center text-white/30 text-xs font-medium">
              You will be matched automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
