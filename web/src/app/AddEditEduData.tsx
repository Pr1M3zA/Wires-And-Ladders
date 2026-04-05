import { useState } from "react";
import type { EduData } from "../store/education/EducationStore";
import { MdSave, MdCancel } from "react-icons/md";

type AddEditEduProps = {
   eduItem: EduData,
   onSave: (value: EduData) => void;
   onCancel: () => void;
}

const AddEditEduData: React.FC<AddEditEduProps> = (props) => {
   const [eduDataRow, setEduDataRow] = useState<EduData>(props.eduItem);

   const handleInputChange = (key: keyof EduData) => {
      return (event: React.ChangeEvent<HTMLInputElement>) => {
         setEduDataRow({...eduDataRow, [key]: event.target.value})
      }  
   }   

   return (
      <div className="border-t-2 border-wireladders-dark-blue flex flex-col mx-10 py-1 bg-blue-200">
         <div className="flex bg-wireladders-dark-blue text-white! items-center">
            <label className="w-2/12 min-w-28 text-right pr-2 font-bold text-white!" >Tema:</label>
            <div className="w-10/12 flex">
               <div className="w-11/12 my-1">
                  <input className="w-48 font-bold text-lg bg-white border-2 border-wireladders-light-blue mr-2 rounded-sm px-2" 
                     id='theme'
                     placeholder="Tema educativo..."
                     value={eduDataRow.theme} 
                     onChange={handleInputChange('theme')} 
                     maxLength={30} 
                  />
               </div>
               <div className="flex w-1/12 min-w-16 justify-between">
                  <button onClick={() => props.onSave(eduDataRow)}>
                     <MdSave size={30} color="white" />
                  </button>
                  <button className="pr-2" onClick={props.onCancel}>
                      <MdCancel size={30} color="white" />
                  </button>
               </div>
            </div>
         </div>
         <div className="flex mt-1" >
            <label className="w-2/12 min-w-28 text-right pr-2 font-bold" >Información:</label>
            <input className="w-10/12 text-lg bg-white border-2 mr-2 rounded-sm px-2" 
               id='information'
               placeholder="Información educativa..."
               value={eduDataRow.information} 
               onChange={handleInputChange('information')} 
               maxLength={150} 
            />
         </div>
         <div className="flex mt-1">
            <label className="w-2/12 min-w-28 text-right pr-2 font-bold" >Pregunta:</label>
            <input className="w-10/12 text-lg bg-white border-2 mr-2 rounded-sm px-2" 
               id='question'
               placeholder="Proporcione una pregunta relacionada..."
               value={eduDataRow.question} 
               onChange={handleInputChange('question')} 
               maxLength={150} 
            />
         </div>
         <div className="flex">
            <label className="w-2/12 min-w-28 text-right pr-2 font-bold" >Opciones:</label>
            <div className="w-10/12 flex flex-col md:flex-row gap-x-2">
               <div className="w-full md:w-1/5 place-content-center text-center">
                  <input className="text-sm bg-blue-100 border-wireladders-dark-blue text-wireladders-dark-blue border-2 w-full rounded-md p-1" 
                     id='answer_1'
                     placeholder="Respuesta 1..."
                     value={eduDataRow.answer_1} 
                     onChange={handleInputChange('answer_1')}
                     maxLength={50} 
                  />
               </div>
               <div className="w-full md:w-1/5 place-content-center text-center">
                  <input className="text-sm bg-red-100 border-red-900 text-wireladders-dark-blue border-2 w-full rounded-md p-1" 
                     id='answer_2'
                     placeholder="Respuesta 2..."
                     value={eduDataRow.answer_2} 
                     onChange={handleInputChange('answer_2')} 
                     maxLength={50} 
                  />
               </div>               
               <div className="w-full md:w-1/5 place-content-center text-center">
                  <input className="text-sm bg-green-100 border-wireladders-green text-wireladders-dark-blue border-2 w-full rounded-md p-1" 
                     id='answer_3'
                     placeholder="Respuesta 3..."
                     value={eduDataRow.answer_3} 
                     onChange={handleInputChange('answer_3')} 
                     maxLength={50} 
                  />               
               </div>
               <div className="w-full md:w-1/5 place-content-center text-center">
                  <input className="text-sm bg-amber-100 border-wireladders-yellow border-2 w-full rounded-md text-wireladders-dark-blue p-1 " 
                     id='answer_4'
                     placeholder="Respuesta 4..."
                     value={eduDataRow.answer_4} 
                     onChange={handleInputChange('answer_4')} 
                     maxLength={50} 
                  />               
               </div>
               <div className="flex flex-col px-3 w-full md:w-1/5 my-1 mr-2 rounded-md bg-wireladders-dark-blue place-content-center text-center">
                  <label className="text-sm  text-white!">Correcta: {eduDataRow.answer_ok}</label>
                  <input type="range" 
                     id='answer_ok'
                     min={1} max={4} 
                     value={eduDataRow.answer_ok} 
                     onChange={handleInputChange('answer_ok')} 
                     className="w-full"
                  />
               </div>
            </div>
         </div>
      </div>      
   )
}

export default AddEditEduData;