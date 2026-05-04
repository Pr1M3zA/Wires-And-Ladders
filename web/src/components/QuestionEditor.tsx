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

// --- Main Page Component ---

export const QuestionEditor: React.FC = () => {
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
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 p-8 gap-6 overflow-y-auto">
        {/* Top Bar */}
        <div className="flex justify-between items-center w-full">
          <div className="flex flex-col gap-1">
            <h1 className="text-[24px] font-bold text-[var(--text-primary)]">Editar Pregunta</h1>
            <p className="text-[13px] text-[var(--text-secondary)]">1ª Generación • Modificar contenido existente</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center justify-center h-[44px] px-5 bg-[var(--white)] border border-[var(--border-subtle)] text-[var(--text-secondary)] rounded-lg font-semibold text-[14px] hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button className="flex items-center justify-center h-[44px] px-5 bg-[var(--primary)] text-[var(--white)] rounded-lg font-semibold text-[14px] shadow-[0_4px_12px_#5B9BD540] hover:opacity-90 transition-opacity">
              Guardar Cambios
            </button>
          </div>
        </div>

        {/* Form Card */}
        <div className="flex flex-col bg-[var(--white)] rounded-xl border border-[var(--border-subtle)] shadow-[0_2px_8px_#0000000A] p-[28px_32px] gap-6 w-full">
          
          {/* Theme & Generation Selectors */}
          <div className="flex gap-4 w-full">
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-[12px] font-semibold text-[var(--text-secondary)]">Tema Principal</label>
              <select className="w-full h-[44px] px-3 border border-[var(--border-subtle)] rounded-lg text-[14px] focus:outline-none focus:border-[var(--primary)] bg-white appearance-none">
                <option>Hardware de Computadoras</option>
                <option>Lenguajes de Programación</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-[12px] font-semibold text-[var(--text-secondary)]">Generación Asignada</label>
              <select className="w-full h-[44px] px-3 border border-[var(--border-subtle)] rounded-lg text-[14px] focus:outline-none focus:border-[var(--primary)] bg-white appearance-none">
                <option>1ª Generación</option>
                <option>2ª Generación</option>
              </select>
            </div>
          </div>

          {/* Context Information */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-[12px] font-semibold text-[var(--text-secondary)]">Información de Contexto</label>
            <textarea 
              className="w-full h-[80px] p-3 border border-[var(--border-subtle)] rounded-lg text-[14px] focus:outline-none focus:border-[var(--primary)] resize-none"
              defaultValue="Las computadoras de esta generación usaban tubos de vacío para procesar información."
            ></textarea>
          </div>

          {/* Question Statement */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-[12px] font-semibold text-[var(--text-secondary)]">Enunciado de la Pregunta</label>
            <input 
              type="text"
              className="w-full h-[44px] px-3 border border-[var(--border-subtle)] rounded-lg text-[14px] font-semibold focus:outline-none focus:border-[var(--primary)]"
              defaultValue="¿Qué componente utilizaban las computadoras de la primera generación para procesar datos?"
            />
          </div>

          {/* Answers Section */}
          <div className="flex flex-col gap-3 w-full mt-2">
            <h3 className="text-[13px] font-bold text-[var(--text-primary)]">Respuestas</h3>
            <div className="grid grid-cols-2 gap-4">
              
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-[var(--text-secondary)] flex items-center gap-2">
                  <input type="radio" name="correctAnswer" value="1" className="accent-[var(--primary)]" />
                  Opción 1
                </label>
                <input 
                  type="text" 
                  className="w-full h-[44px] px-3 border border-[var(--border-subtle)] rounded-r-lg rounded-l-sm border-l-[4px] border-l-[var(--primary)] text-[14px] focus:outline-none"
                  defaultValue="Transistores"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-[var(--text-secondary)] flex items-center gap-2">
                  <input type="radio" name="correctAnswer" value="2" className="accent-[var(--option2)]" />
                  Opción 2
                </label>
                <input 
                  type="text" 
                  className="w-full h-[44px] px-3 border border-[var(--border-subtle)] rounded-r-lg rounded-l-sm border-l-[4px] border-l-[var(--option2)] text-[14px] focus:outline-none"
                  defaultValue="Chips de silicio"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-[var(--text-secondary)] flex items-center gap-2">
                  <input type="radio" name="correctAnswer" value="3" defaultChecked className="accent-[var(--option3)]" />
                  Opción 3
                </label>
                <input 
                  type="text" 
                  className="w-full h-[44px] px-3 border border-[var(--border-subtle)] rounded-r-lg rounded-l-sm border-l-[4px] border-l-[var(--option3)] text-[14px] font-semibold focus:outline-none"
                  defaultValue="Tubos de vacío"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-[var(--text-secondary)] flex items-center gap-2">
                  <input type="radio" name="correctAnswer" value="4" className="accent-[var(--option4)]" />
                  Opción 4
                </label>
                <input 
                  type="text" 
                  className="w-full h-[44px] px-3 border border-[var(--border-subtle)] rounded-r-lg rounded-l-sm border-l-[4px] border-l-[var(--option4)] text-[14px] focus:outline-none"
                  defaultValue="Circuitos integrados"
                />
              </div>

            </div>
            
            {/* Correct Indicator Banner */}
            <div className="flex items-center p-[12px_16px] mt-2 rounded-lg border border-[var(--option3)] bg-[#F0FDF4] text-[var(--option3)]">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span className="text-[13px] font-semibold">Respuesta correcta seleccionada: Opción 3 — Tubos de vacío</span>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default QuestionEditor;
