import { useState } from "react";
import type { EduData } from "../../store/education/EducationStore";
import { MdSave, MdCancel, MdCheckCircle, MdInfoOutline, MdOutlineQuestionAnswer } from "react-icons/md";

type AddEditEduProps = {
   eduItem: EduData,
   onSave: (value: EduData) => void;
   onCancel: () => void;
}

const AddEditEduData: React.FC<AddEditEduProps> = (props) => {
   const [eduDataRow, setEduDataRow] = useState<EduData>(props.eduItem);
   //const colors: string[] = ["#5B9BD5", "#E05C5C", "#5CB85C", "#D4B84A"]

   const handleInputChange = (key: keyof EduData) => {
      return (event: React.ChangeEvent<HTMLInputElement>) => {
         setEduDataRow({ ...eduDataRow, [key]: event.target.value })
      }
   }

   return (
      <div className="flex flex-col mx-10 py-1 mt-5">
         <div className="flex bg-sky-100 rounded-t-md">
            <div className="flex w-full px-2 py-1">
               <input className="w-11/12 font-bold text-lg text-[#5b9bd5ff] font-manrope px-2"
                  id='theme'
                  placeholder="Componente educativo..."
                  value={eduDataRow.theme}
                  onChange={handleInputChange('theme')}
                  maxLength={30}
               />
               <div className="flex w-1/12 min-w-16 justify-between">
                  <button onClick={() => props.onSave(eduDataRow)}>
                     <MdSave size={30} color="seagreen" />
                  </button>
                  <button className="pr-2" onClick={props.onCancel}>
                     <MdCancel size={30} color="tomato" />
                  </button>
               </div>
            </div>
         </div>
         <div className="bg-white rounded-b-md">
            {/* Información relevante */}
            <div className="flex bg-slate-100 rounded-md p-3 m-3" >
               <MdInfoOutline size={24} color="#A0B0C0" />
               <input className="text-slate-400 px-2 w-full mx-1"
                  id='information'
                  placeholder="Información relevante..."
                  value={eduDataRow.information}
                  onChange={handleInputChange('information')}
                  maxLength={150}
               />
            </div>
            {/* Pregunta y respuesta correcta */}
            <div className="flex mx-3 px-3">
               <div className="flex w-9/12">
                  <MdOutlineQuestionAnswer size={24} color="#1A2B3C" />
                  <input className="text-wireladders-dark-blue font-semibold px-2 w-full"
                     id='question'
                     placeholder="Proporcione una pregunta relacionada..."
                     value={eduDataRow.question}
                     onChange={handleInputChange('question')}
                     maxLength={150}
                  />
               </div>
               <div className="w-3/12 justify-center">
                  <div className="flex gap-x-3 mx-3">
                     <div className="w-1/5">
                        <MdCheckCircle size={24} color={"green"} />
                     </div>
                     <div className={`w-1/5 rounded-full border-2 border-blue-500 ${eduDataRow.answer_ok === 1 ? 'bg-blue-500' : 'bg-white'}`}>
                        <button className="px-2 w-full content-center place-content-center" onClick={() => setEduDataRow({ ...eduDataRow, answer_ok: 1 })}>
                           <span className={`text-${eduDataRow.answer_ok === 1 ? 'white' : 'blue-500'}`} >A</span>
                        </button>
                     </div>
                     <div className={`w-1/5 rounded-full border-2 border-red-500 ${eduDataRow.answer_ok === 2 ? 'bg-red-500' : 'bg-white'}`}>
                        <button className="px-2 w-full content-center place-content-center" onClick={() => setEduDataRow({ ...eduDataRow, answer_ok: 2 })}>
                           <span className={`text-${eduDataRow.answer_ok === 2 ? 'white' : 'red-500'}`}>B</span>
                        </button>
                     </div>
                     <div className={`w-1/5 rounded-full border-2 border-green-500 ${eduDataRow.answer_ok === 3 ? 'bg-green-500' : 'bg-white'}`}>
                        <button className="px-2 w-full content-center place-content-center" onClick={() => setEduDataRow({ ...eduDataRow, answer_ok: 3 })}>
                           <span className={`text-${eduDataRow.answer_ok === 3 ? 'white' : 'green-500'}`}>C</span>
                        </button>
                     </div>
                     <div className={`w-1/5 rounded-full border-2 border-yellow-500 ${eduDataRow.answer_ok === 4 ? 'bg-yellow-500' : 'bg-white'}`}>
                        <button className="px-2 w-full content-center place-content-center" onClick={() => setEduDataRow({ ...eduDataRow, answer_ok: 4 })}>
                           <span className={`text-${eduDataRow.answer_ok === 4 ? 'white' : 'yellow-500'}`}>D</span>
                        </button>
                     </div>
                  </div>
               </div>
            </div>
            {/* Respuestas */}
            <div className="flex m-3">
               <div className="w-full flex flex-col md:flex-row gap-x-2">
                  <div className="w-full md:w-1/4 rounded-md border-2 p-2 border-blue-500 place-content-center flex">
                     <span className="text-blue-400 font-bold px-1">A</span>
                     <input className="text-sm text-wireladders-dark-blue px-1 w-full"
                        id='answer_1' placeholder="Respuesta 1..." maxLength={50}
                        value={eduDataRow.answer_1}
                        onChange={handleInputChange('answer_1')}
                     />
                  </div>
                  <div className="w-full md:w-1/4 rounded-md border-2 p-2 border-red-500 place-content-center flex">
                     <span className="text-red-500 font-bold px-1">B</span>
                     <input className="text-sm text-wireladders-dark-blue px-1 w-full"
                        id='answer_2' placeholder="Respuesta 2..." maxLength={50}
                        value={eduDataRow.answer_2}
                        onChange={handleInputChange('answer_2')}
                     />
                  </div>
                  <div className="w-full md:w-1/4 rounded-md border-2 p-2 border-emerald-500 place-content-center flex">
                     <span className="text-emerald-500 font-bold px-1">C</span>
                     <input className="text-sm text-wireladders-dark-blue px-1 w-full"
                        id='answer_3' placeholder="Respuesta 3..." maxLength={50}
                        value={eduDataRow.answer_3}
                        onChange={handleInputChange('answer_3')}
                     />
                  </div>
                  <div className="w-full md:w-1/4 rounded-md border-2 p-2 border-amber-500 place-content-center flex">
                     <span className="text-amber-500 font-bold px-1">D</span>
                     <input className="text-sm text-wireladders-dark-blue px-1 w-full"
                        id='answer_4' placeholder="Respuesta 4..." maxLength={50}
                        value={eduDataRow.answer_4}
                        onChange={handleInputChange('answer_4')}
                     />
                  </div>
               </div>
            </div>
         </div>
      </div>
   )
}

export default AddEditEduData;