import React from 'react';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  questionTheme?: string;
  questionText?: string;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  questionTheme = "Hardware",
  questionText = "¿Qué componente utilizaban las computadoras de la primera generación para procesar datos?"
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center font-primary">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-[#00000060]" 
        onClick={onClose}
      ></div>

      {/* Modal Card */}
      <div className="relative w-[500px] bg-[var(--white)] rounded-2xl shadow-[0_20px_60px_#00000030] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex flex-col p-[28px_28px_20px_28px] gap-5">
          <div className="flex items-center justify-center w-[56px] h-[56px] bg-[#FEF2F2] rounded-full text-[var(--option2)]">
            {/* Trash/Warning Icon */}
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div className="flex flex-col gap-1.5">
            <h2 className="text-[20px] font-bold text-[var(--text-primary)]">Eliminar Pregunta</h2>
            <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
              Esta acción no se puede deshacer. Por favor confirma que deseas eliminar la siguiente pregunta:
            </p>
          </div>
        </div>

        <div className="h-[1px] w-full bg-[var(--border-subtle)]"></div>

        {/* Question Preview */}
        <div className="flex flex-col bg-[#F8FAFC] p-[20px_28px] gap-2 border-y border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[var(--primary)]"></div>
            <span className="text-[13px] font-bold text-[var(--text-primary)]">{questionTheme}</span>
          </div>
          <p className="text-[13px] font-semibold text-[var(--text-primary)] pl-4">
            {questionText}
          </p>
        </div>

        <div className="h-[1px] w-full bg-[var(--border-subtle)]"></div>

        {/* Footer Actions */}
        <div className="flex justify-end items-center p-[20px_28px_24px_28px] gap-3">
          <button 
            onClick={onClose}
            className="flex items-center justify-center h-[44px] px-6 bg-[var(--white)] border border-[var(--border-subtle)] text-[var(--text-secondary)] rounded-lg font-semibold text-[14px] hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={onConfirm}
            className="flex items-center justify-center h-[44px] px-6 bg-[var(--option2)] text-[var(--white)] rounded-lg font-bold text-[14px] shadow-[0_4px_12px_#E05C5C40] hover:opacity-90 transition-opacity"
          >
            Sí, eliminar
          </button>
        </div>

      </div>
    </div>
  );
};

export default DeleteModal;
