/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import {MdAddCircle} from "react-icons/md"; 
import EducationListItem from './EducationListItem.tsx';
import AddEditEduData from './AddEditEduData.tsx';
import useEducationStore from "../store/education/useEducationStore.ts";
import useApiFetchs from '../hooks/useApiFetchs.ts';

import type { EduData } from '../store/education/EducationStore.ts';


const newEduData:EduData = {id: -1, generation: 0, theme: '', information: '', question: '', answer_1: '', answer_2: '', answer_3: '', answer_4: '', answer_ok: 1}

const EducationList = () => {
   const [generation, setGeneration] = useState(1)
   const [isAdding, setIsAdding] = useState(false)
   const [addEditRowData, setAddEditRowData] = useState<EduData>(newEduData)

   const { state, addEducationalData, editEducationalData, setSelectedEduDataId, selectedEduData } = useEducationStore()
   const { dbGetEducationData, dbNewEducationData, dbEditEducationData } = useApiFetchs();   

   const handleSelectGeneration = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setGeneration(parseInt(e.target.value))
   }

   const handleSaveEduData = async (eduData: EduData) => {
      if(eduData.theme.trim() === '' || eduData.information.trim() === '' || eduData.question.trim() === '' ||
         eduData.answer_1.trim() === '' || eduData.answer_2.trim() === '' || eduData.answer_3.trim() === '' ||
         eduData.answer_4.trim() === '' ) {
            Swal.fire({
               icon: 'warning',
               title: 'Campos incompletos',
               text: 'Por favor, complete todos los campos antes de guardar.'
            });
         return;
      }
      if(eduData.id === -1) {
         const idInserted = await dbNewEducationData(eduData)
         addEducationalData({ ...eduData, id: idInserted } );
         setIsAdding(false);
      } else {
         await dbEditEducationData(eduData); 
         editEducationalData(eduData); 
         setSelectedEduDataId(-1);
      }
   }

   const handleAddEduData = () => {
      setAddEditRowData({...newEduData, generation: generation});
      setIsAdding(true);
   }

   const handleEditEduData = (editRow: EduData) => {
      setSelectedEduDataId(editRow.id);
   }   

   useEffect(() => {
      if(state.token) dbGetEducationData();
   }, [state.token]);
   
   
   if(!state.token) return null
   return (
      <div className='bg-neutral-100 w-full h-full'> 
         <div className='flex mx-10 py-1'>
            <div className='flex w-5/6 py-3'>
               <label className='px-2 font-bold' >Generación:</label>
               <select className='border-2 rounded-sm bg-white p-1' name="generation" onChange={handleSelectGeneration}>
                  <option value="1">Primera</option>
                  <option value="2" >Segunda</option>
                  <option value="3">Tercera</option>
                  <option value="4">Cuarta</option>
                  <option value="5">Quinta</option>
                  <option value="6">Sexta</option>
               </select>
            </div>

               <button className="flex min-w-8 md:w-1/6 bg-wireladders-green rounded-full my-2 justify-between" onClick={handleAddEduData} >
                  <MdAddCircle size={42} color="white" />
                  <label className="font-bold text-white! pr-5 self-center" >Agregar Nuevo</label>
               </button>
         </div>
         <div>
            {isAdding && 
               <AddEditEduData 
                  eduItem={addEditRowData}
                  onSave={handleSaveEduData}
                  onCancel={() => setIsAdding(false)}
               />
            }
            {state.eduDatas.filter(ed => ed.generation === generation).map((eduData, index) => {
               if(selectedEduData && eduData.id === selectedEduData.id) {
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
   )
}
 
export default EducationList;