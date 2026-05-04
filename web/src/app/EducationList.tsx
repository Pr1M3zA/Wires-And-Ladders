/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { MdAddCircle } from "react-icons/md";
import EducationListItem from './components/EducationListItem.tsx';
import AddEditEduData from './components/AddEditEduData.tsx';
import useEducationStore from "../store/education/useEducationStore.ts";
import useApiFetchs from '../hooks/useApiFetchs.ts';
import wireladders from '../assets/wireladders-icon.svg';

import type { EduData } from '../store/education/EducationStore.ts';


const newEduData: EduData = { id: -1, generation: 0, theme: '', information: '', question: '', answer_1: '', answer_2: '', answer_3: '', answer_4: '', answer_ok: 1 }

const EducationList = () => {
   const [generation, setGeneration] = useState(1)
   const [isAdding, setIsAdding] = useState(false)
   const [addEditRowData, setAddEditRowData] = useState<EduData>(newEduData)

   const { state, setToken, addEducationalData, editEducationalData, setSelectedEduDataId, selectedEduData } = useEducationStore()
   const { dbGetEducationData, dbNewEducationData, dbEditEducationData, dbGetUserData, user } = useApiFetchs();

   useEffect(() => {
      dbGetUserData();
   }, [state.token, dbGetUserData]);

   const handleSelectGeneration = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setGeneration(parseInt(e.target.value))
   }

   const handleSaveEduData = async (eduData: EduData) => {
      if (eduData.theme.trim() === '' || eduData.information.trim() === '' || eduData.question.trim() === '' ||
         eduData.answer_1.trim() === '' || eduData.answer_2.trim() === '' || eduData.answer_3.trim() === '' ||
         eduData.answer_4.trim() === '') {
         Swal.fire({
            icon: 'warning',
            title: 'Campos incompletos',
            text: 'Por favor, complete todos los campos antes de guardar.'
         });
         return;
      }
      if (eduData.id === -1) {
         const idInserted = await dbNewEducationData(eduData)
         addEducationalData({ ...eduData, id: idInserted });
         setIsAdding(false);
      } else {
         await dbEditEducationData(eduData);
         editEducationalData(eduData);
         setSelectedEduDataId(-1);
      }
   }

   const handleAddEduData = () => {
      setAddEditRowData({ ...newEduData, generation: generation });
      setIsAdding(true);
   }

   const handleEditEduData = (editRow: EduData) => {
      setSelectedEduDataId(editRow.id);
   }

   useEffect(() => {
      if (state.token) dbGetEducationData();
   }, [state.token]);


   if (!state.token) return null
   return (
      <div className='flex bg-neutral-100 w-full h-screen overflow-hidden'>
         {/* Panel izquierdo 25% */}
         <div className='w-1/4 bg-[#5b9bd5ff] flex flex-col' >
            {/* Logo */}
            <div className='h-1/8 shrink-0 bg-[#4A87BE] flex'>
               <img className='h-full p-2' src={wireladders} alt="Logo" />
               <div className='content-center'>
                  <div className='font-title text-6xl text-white leading-none inline-block -mb-3 '>Wires&Ladders</div>
                  <div className='font-manrope text-white'>Panel educativo</div>
               </div>

            </div>
            {/* Selectors */}
            <div className='flex-1 overflow-y-auto'>
               {/* Area de conocimiento */}
               <div className='m-2' >
                  <label className='px-1 text-md text-blue-50'>Área de Conocimiento:</label>
                  <select className='border-2 border-sky-300 rounded-sm bg-blue-100 p-1 w-full' >
                     <option value="1">Ciencia y Tecnología</option>
                  </select>
               </div>
               {/* Disciplina */}
               <div className='m-2'>
                  <label className='px-1 text-md text-blue-50'>Disciplina:</label>
                  <select className='border-2 border-sky-300 rounded-sm bg-blue-100 p-1 w-full'>
                     <option value="1">Ciencias de la Computación</option>
                  </select>
               </div>
               {/* Tema */}
               <div className='m-2'>
                  <label className='px-1 text-md text-blue-50'>Tema:</label>
                  <select className='border-2 border-sky-300 rounded-sm bg-blue-100 p-1 w-full'>
                     <option value="1">Las generaciones de la computación</option>
                  </select>
               </div>
               {/* Subtema */}
               <div className='m-2'>
                  <label className='px-1 text-md text-blue-50'>Subtema:</label>
                  <select className='border-2 border-sky-300 rounded-sm bg-blue-100 p-1 w-full' name="generation" onChange={handleSelectGeneration}>
                     <option value="1">Primera Generación</option>
                     <option value="2">Segunda Generación</option>
                     <option value="3">Tercera Generación</option>
                     <option value="4">Cuarta Generación</option>
                     <option value="5">Quinta Generación</option>
                     <option value="6">Sexta Generación</option>
                  </select>
               </div>
            </div>
            {/* User */}
            <div className="h-1/8 shrink-0 p-3 flex flex-col items-end justify-center">
               <div className="text-white">{user?.first_name} {user?.last_name}</div>
               <button className="bg-red-600 px-3 py-1 rounded-full text-white mt-2" onClick={() => setToken('')}>
                  <span className='text-sm'>Cerrar sesión</span>
               </button>
            </div>
         </div>

         {/* Panel derecho 75% */}
         <div className='w-3/4 bg-gray-200 flex flex-col'>
            <div className='flex mx-10 mt-4 mb-2 justify-between items-center border-b-2 border-gray-300 pb-2 shrink-0'>
               <div className='flex items-center gap-4'>
                  <h1 className='text-2xl font-bold font-manrope text-[#4A87BE]'>Gestor de Preguntas</h1>
                  <span className='bg-[#4A87BE] text-white font-bold py-1 px-3 rounded-full'>
                     Total: {state.eduDatas.filter(ed => ed.generation === generation).length}
                  </span>
               </div>
               <button className="flex h-10 bg-wireladders-green rounded-full items-center px-1 pr-4 cursor-pointer hover:bg-green-600 transition-colors" onClick={handleAddEduData} >
                  <MdAddCircle size={34} color="white" />
                  <label className="font-bold text-white pl-2 cursor-pointer" >Agregar</label>
               </button>
            </div>

            <div className='bg-gray-300 flex-1 overflow-y-auto pb-6'>
               {isAdding &&
                  <AddEditEduData
                     eduItem={addEditRowData}
                     onSave={handleSaveEduData}
                     onCancel={() => setIsAdding(false)}
                  />
               }
               {state.eduDatas.filter(ed => ed.generation === generation).map((eduData, index) => {
                  if (selectedEduData && eduData.id === selectedEduData.id) {
                     return (
                        <AddEditEduData
                           key={index}
                           eduItem={selectedEduData}
                           onSave={handleSaveEduData}
                           onCancel={() => setSelectedEduDataId(-1)}
                        />
                     )
                  }
                  else {
                     return (
                        <EducationListItem
                           key={index}
                           eduItem={eduData}
                           onEdit={handleEditEduData}
                        />
                     )
                  }
               })}
            </div>
         </div>
      </div>
   )
}

export default EducationList;