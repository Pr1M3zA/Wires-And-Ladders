import React from 'react';

export const LoginPage: React.FC = () => {
  return (
    <div className="flex w-full h-full font-primary">
      {/* Left Panel */}
      <div className="flex flex-col justify-between w-[520px] h-full bg-[var(--primary)] p-[60px_48px] text-center">
        <div className="flex flex-col items-center gap-4">
          <img src="../assets/WireLaddersIcon.png" alt="Wires&Ladders Logo" className="w-[100px] h-[100px] object-contain" />
          <h1 className="text-[var(--white)] font-appName text-[56px] leading-none">Wires&Ladders</h1>
          <p className="text-[#DDEEFF] text-[14px]">Editor de Preguntas</p>
        </div>
        
        {/* Decorative Blocks Placeholder (Color Bars) */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-1 h-[6px] w-full">
            <div className="bg-[var(--white)] h-full w-full rounded-[3px]"></div>
            <div className="bg-[var(--option2)] h-full w-full rounded-[3px]"></div>
            <div className="bg-[var(--option3)] h-full w-full rounded-[3px]"></div>
            <div className="bg-[var(--option4)] h-full w-full rounded-[3px]"></div>
          </div>
          <div className="flex gap-1 h-[6px] w-full">
            <div className="bg-[var(--white)] h-full w-full rounded-[3px]"></div>
            <div className="bg-[var(--option2)] h-full w-full rounded-[3px]"></div>
            <div className="bg-[var(--option3)] h-full w-full rounded-[3px]"></div>
            <div className="bg-[var(--option4)] h-full w-full rounded-[3px]"></div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex flex-col items-center justify-center flex-1 h-full bg-[var(--white)] p-[60px_64px]">
        <div className="flex flex-col gap-8 w-[400px]">
          {/* Header */}
          <div className="flex flex-col gap-2">
            <h2 className="text-[36px] font-bold text-[var(--text-primary)]">Bienvenido.</h2>
            <p className="text-[14px] text-[var(--text-secondary)]">Ingrese sus credenciales para continuar</p>
          </div>

          {/* Accent Bar */}
          <div className="flex gap-1 h-[4px] w-full">
            <div className="bg-[var(--primary)] h-full w-full rounded-sm"></div>
            <div className="bg-[var(--option2)] h-full w-full rounded-sm"></div>
            <div className="bg-[var(--option3)] h-full w-full rounded-sm"></div>
            <div className="bg-[var(--option4)] h-full w-full rounded-sm"></div>
          </div>

          {/* Form Fields */}
          <form className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-[var(--text-secondary)]">Usuario o Email</label>
              <input 
                type="text" 
                placeholder="Ingrese su usuario o email"
                className="w-full h-[44px] px-3 border border-[var(--border-subtle)] rounded-lg text-[14px] focus:outline-none focus:border-[var(--primary)]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-[var(--text-secondary)]">Contraseña</label>
              <input 
                type="password" 
                placeholder="Ingrese la contraseña"
                className="w-full h-[44px] px-3 border border-[var(--border-subtle)] rounded-lg text-[14px] focus:outline-none focus:border-[var(--primary)]"
              />
            </div>

            {/* Login Button */}
            <button 
              type="submit" 
              className="mt-4 w-full h-[52px] bg-[var(--primary)] text-[var(--white)] rounded-lg font-bold shadow-[0_4px_12px_#5B9BD540] hover:opacity-90 transition-opacity"
            >
              Iniciar sesión
            </button>
          </form>

          {/* Forgot Password Link */}
          <div className="flex justify-center mt-2">
            <a href="#" className="text-[13px] font-semibold text-[var(--primary)] hover:underline">
              ¿Olvidaste tu contraseña?
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
