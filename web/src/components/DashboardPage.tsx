import React from 'react';

// --- Subcomponents ---

interface NavItemProps {
  label: string;
  isActive?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ label, isActive }) => (
  <div className={`flex items-center h-[40px] px-3 rounded-lg gap-2 cursor-pointer transition-colors ${isActive ? 'bg-[#FFFFFF30]' : 'hover:bg-[#FFFFFF15]'}`}>
    <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-[var(--white)]' : 'bg-transparent'}`}></div>
    <span className={`text-[13px] ${isActive ? 'text-[var(--white)] font-semibold' : 'text-[#DDEEFF]'}`}>{label}</span>
  </div>
);

interface QuestionCardProps {
  title: string;
  generation: string;
  info: string;
  question: string;
  options: string[];
  correctIndex: number; // 0 to 3
}

const QuestionCard: React.FC<QuestionCardProps> = ({ title, generation, info, question, options, correctIndex }) => {
  const optionColors = ['var(--primary)', 'var(--option2)', 'var(--option3)', 'var(--option4)'];

  return (
    <div className="flex flex-col bg-[var(--white)] rounded-xl border border-[var(--border-subtle)] shadow-[0_2px_8px_#0000000A] w-full overflow-hidden">
      {/* Card Header */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--primary)]"></div>
          <h3 className="text-[15px] font-bold text-[var(--text-primary)]">{title}</h3>
          <span className="ml-2 px-2 py-0.5 bg-[#E8F2FA] text-[var(--primary)] text-[11px] font-semibold rounded-md">{generation}</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center justify-center w-8 h-8 rounded-md bg-[#F4F6F9] hover:bg-[#E2E8F0] text-[var(--primary)] transition-colors">
            {/* Edit Icon Placeholder */}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
          </button>
          <button className="flex items-center justify-center w-8 h-8 rounded-md bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[var(--option2)] transition-colors">
            {/* Delete Icon Placeholder */}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      </div>
      
      {/* Card Body */}
      <div className="flex flex-col p-6 gap-4">
        <div className="flex flex-col gap-2 text-[13px]">
          <p><span className="font-semibold text-[var(--text-secondary)]">Información:</span> {info}</p>
          <p><span className="font-semibold text-[var(--text-secondary)]">Pregunta:</span> <span className="font-semibold text-[var(--text-primary)]">{question}</span></p>
        </div>
        
        {/* Options */}
        <div className="flex flex-wrap items-center gap-3 mt-2">
          <span className="text-[12px] font-semibold text-[var(--text-secondary)] mr-1">Opciones:</span>
          {options.map((opt, idx) => (
            <div 
              key={idx} 
              className="flex items-center px-3 py-1.5 rounded-md bg-[var(--white)] border"
              style={{ borderColor: optionColors[idx] }}
            >
              <span className="text-[12px] font-semibold" style={{ color: optionColors[idx] }}>{idx + 1}</span>
              <span className="text-[12px] text-[var(--text-primary)] ml-2">{opt}</span>
            </div>
          ))}
          
          <div className="ml-auto flex items-center px-3 py-1.5 rounded-md bg-[#F0FDF4] border border-[var(--option3)] text-[var(--option3)]">
            <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
            <span className="text-[12px] font-bold">Correcta: {correctIndex + 1}</span>
          </div>
        </div>
      </div>
    </div>
  );
};


// --- Main Page Component ---

export const DashboardPage: React.FC = () => {
  return (
    <div className="flex w-full h-full font-primary bg-[var(--bg)]">
      {/* Sidebar */}
      <div className="flex flex-col w-[260px] h-full bg-[var(--sidebar-bg)] shrink-0">
        <div className="flex flex-col bg-[#4A87BE] p-[32px_24px_24px_24px] gap-1">
          <div className="flex items-center gap-3">
            <img src="../assets/WireLaddersIcon.png" alt="Logo" className="w-[36px] h-[36px] object-contain" />
            <span className="text-[var(--white)] font-appName text-[32px] leading-none mt-2">Wires&Ladders</span>
          </div>
          <span className="text-[#DDEEFF] text-[11px] ml-[48px]">Editor de Preguntas</span>
        </div>
        
        <div className="flex flex-col flex-1 p-[16px_12px] gap-1 overflow-y-auto">
          <span className="text-[#DDEEFF] text-[10px] font-bold tracking-[1.5px] px-3 py-2 mb-1">GENERACIONES</span>
          <NavItem label="1ª Generación" isActive={true} />
          <NavItem label="2ª Generación" />
          <NavItem label="3ª Generación" />
          <NavItem label="4ª Generación" />
          <NavItem label="5ª Generación" />
          <NavItem label="6ª Generación" />
        </div>
        
        <div className="flex flex-col p-[16px_24px_24px_24px]">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-[#FFFFFF20]">
            <div className="w-8 h-8 rounded-full bg-[var(--white)] flex items-center justify-center text-[var(--primary)] font-bold text-[14px]">P</div>
            <div className="flex flex-col">
              <span className="text-[var(--white)] text-[13px] font-semibold">Priscila Meza</span>
              <span className="text-[#DDEEFF] text-[11px]">Administrador</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 p-8 gap-6 overflow-y-auto">
        {/* Top Bar */}
        <div className="flex justify-between items-center w-full">
          <div className="flex flex-col gap-1">
            <h1 className="text-[24px] font-bold text-[var(--text-primary)]">Banco de Preguntas</h1>
            <p className="text-[13px] text-[var(--text-secondary)]">1ª Generación • Hardware de Computadoras</p>
          </div>
          <button className="flex items-center gap-2 h-[44px] px-5 bg-[var(--primary)] text-[var(--white)] rounded-lg font-semibold text-[14px] shadow-[0_4px_12px_#5B9BD540] hover:opacity-90 transition-opacity">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Agregar Pregunta
          </button>
        </div>

        {/* Cards List */}
        <div className="flex flex-col gap-4">
          <QuestionCard 
            title="Hardware"
            generation="1ª Gen"
            info="Las computadoras de esta generación usaban tubos de vacío para procesar información."
            question="¿Qué componente utilizaban las computadoras de la primera generación para procesar datos?"
            options={['Transistores', 'Chips de silicio', 'Tubos de vacío', 'Circuitos integrados']}
            correctIndex={2}
          />
          <QuestionCard 
            title="Lenguaje de Programación"
            generation="1ª Gen"
            info="Estas máquinas eran programadas en lenguaje máquina, el más bajo nivel de programación."
            question="¿Qué tipo de lenguaje de programación se usaba en esta generación?"
            options={['Java', 'Ensamblador', 'Lenguaje máquina', 'BASIC']}
            correctIndex={2}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
