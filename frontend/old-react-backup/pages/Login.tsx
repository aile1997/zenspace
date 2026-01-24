import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppRoute } from '../types';
import { useApp } from '../context/AppContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { dispatch } = useApp();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      dispatch({ type: 'LOGIN', payload: { mobile: '13800138000' } });
      navigate(AppRoute.HOME);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-white relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-gray-100 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute top-40 -left-20 w-60 h-60 bg-gray-50 rounded-full blur-3xl opacity-60"></div>

      <div className="flex-1 flex flex-col items-center justify-center px-8 relative z-10">
        {/* Brand */}
        <div className="mb-12 flex flex-col items-center animate-fade-in">
          <div className="w-20 h-20 rounded-2xl bg-primary text-white flex items-center justify-center mb-6 shadow-2xl shadow-black/20 transform rotate-3">
             <span className="material-symbols-outlined text-[40px]">spa</span>
          </div>
          <h1 className="font-serif text-3xl font-medium text-primary tracking-tight mb-2">ZenSpace</h1>
          <p className="text-xs text-secondary tracking-[0.2em] uppercase">Find your flow</p>
        </div>

        {/* Input Form */}
        <div className="w-full max-w-xs flex flex-col gap-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3 border border-transparent focus-within:border-gray-200 focus-within:bg-white transition-all duration-300">
             <span className="material-symbols-outlined text-gray-400">smartphone</span>
             <input 
               type="tel" 
               placeholder="Mobile Number" 
               className="bg-transparent border-none outline-none text-sm w-full placeholder-gray-400 text-primary"
             />
          </div>
          <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3 border border-transparent focus-within:border-gray-200 focus-within:bg-white transition-all duration-300">
             <span className="material-symbols-outlined text-gray-400">lock</span>
             <input 
               type="password" 
               placeholder="Verification Code" 
               className="bg-transparent border-none outline-none text-sm w-full placeholder-gray-400 text-primary"
             />
             <button className="text-[10px] font-medium text-primary whitespace-nowrap px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 transition-colors">
               Get Code
             </button>
          </div>
        </div>
      </div>

      {/* Action Area */}
      <div className="p-8 pb-12 relative z-10 animate-fade-in" style={{ animationDelay: '0.4s' }}>
        <button 
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full bg-primary text-white h-14 rounded-2xl font-medium tracking-wide shadow-xl shadow-black/10 hover:shadow-black/20 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 active:scale-95"
        >
          {isLoading ? (
            <span className="material-symbols-outlined animate-spin">progress_activity</span>
          ) : (
            <>
              <span>Enter Space</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </>
          )}
        </button>

        <p className="text-[10px] text-center text-gray-400 mt-6">
          By entering, you agree to our <span className="underline cursor-pointer hover:text-primary">Terms</span> & <span className="underline cursor-pointer hover:text-primary">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
};

export default Login;