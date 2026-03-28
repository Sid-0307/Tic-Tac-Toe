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
    <div className="fixed inset-0 bg-navy-900 flex items-center justify-center p-4">
      {/* Ambient glow background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-400 rounded-full opacity-5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal-500 rounded-full opacity-5 blur-3xl" />
      </div>

      {/* Grid background pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,206,201,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,206,201,0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative w-full max-w-sm animate-fade-in">
        {/* Decorative X O symbols */}
        <div className="absolute -top-16 -left-8 text-7xl font-black text-teal-400 opacity-10 select-none">
          X
        </div>
        <div className="absolute -top-12 -right-8 text-7xl font-black text-teal-500 opacity-10 select-none">
          O
        </div>

        {/* Card */}
        <div className="bg-navy-800 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-500/20 to-teal-400/10 px-6 py-5 border-b border-white/5">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center">
                <span className="text-teal-400 font-black text-lg leading-none">✕</span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center">
                <span className="text-teal-400 font-black text-lg leading-none">○</span>
              </div>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight mt-2">
              Tic‑Tac‑Toe
            </h1>
            <p className="text-white/50 text-sm mt-0.5">Real-time multiplayer</p>
          </div>

          {/* Form */}
          <div className="px-6 py-6">
            <form onSubmit={handleSubmit}>
              <label className="block text-sm font-semibold text-white/70 mb-3 uppercase tracking-wider">
                Who are you?
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
                  w-full px-4 py-3.5 rounded-xl
                  bg-navy-900 border border-white/10
                  text-white placeholder-white/30
                  focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/40
                  transition-all duration-200 text-base font-medium
                "
              />

              {error && (
                <p className="mt-2 text-red-400 text-sm font-medium">{error}</p>
              )}

              <button
                id="continue-btn"
                type="submit"
                className="
                  mt-5 w-full py-3.5 rounded-xl font-bold text-base
                  bg-gradient-to-r from-teal-500 to-teal-400
                  text-navy-900 hover:from-teal-400 hover:to-teal-300
                  transform transition-all duration-200
                  hover:scale-[1.02] hover:shadow-lg hover:shadow-teal-500/25
                  active:scale-[0.98]
                  focus:outline-none focus:ring-2 focus:ring-teal-500/50
                "
              >
                Continue →
              </button>
            </form>

            <p className="mt-4 text-center text-white/30 text-xs">
              You'll be matched with a random opponent
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
