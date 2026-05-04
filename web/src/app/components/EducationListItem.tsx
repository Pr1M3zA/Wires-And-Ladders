import type { EduData } from "../../store/education/EducationStore";
import { MdEditNote, MdDeleteOutline, MdCheckCircle, MdInfoOutline, MdOutlineQuestionAnswer } from "react-icons/md";
import useEducationStore from "../../store/education/useEducationStore.ts";
import useApiFetchs from "../../hooks/useApiFetchs.ts";
import Swal from "sweetalert2";

type EducListItemProps = {
   eduItem: EduData
   onEdit: (eduItem: EduData) => void
}

const EducationListItem: React.FC<EducListItemProps> = (props) => {
   const { removeEducationalData } = useEducationStore()
   const { dbDeleteEducationData } = useApiFetchs();

   const handleRemoveEduData = () => {
      Swal.fire({
         title: '¿Está seguro de eliminar este elemento?',
         text: "¡Esta acción no se puede deshacer!",
         icon: 'warning',
         showCancelButton: true,
         confirmButtonColor: '#d33',
         cancelButtonColor: '#3085d6',
         confirmButtonText: 'Sí, eliminar',
         cancelButtonText: 'Cancelar'
      }).then((result) => {
         if (result.isConfirmed) {
            dbDeleteEducationData(props.eduItem.id)
            removeEducationalData(props.eduItem)
         }
      });
   }
   return (
      <div className="flex flex-col mx-10 py-1 mt-5">
         {/* Componente educativo */}
         <div className="flex bg-sky-100 rounded-t-md">
            <div className="flex w-full px-2 py-1">
               <span className="w-11/12 font-bold text-lg text-[#5b9bd5ff] font-manrope">{props.eduItem.theme}</span>
               <div className="flex w-1/12 min-w-16 justify-between">
                  <button onClick={() => props.onEdit(props.eduItem)}>
                     <MdEditNote size={30} color="#5b9bd5ff" />
                  </button>
                  <button className="px-2" onClick={handleRemoveEduData}>
                     <MdDeleteOutline size={30} color="tomato" />
                  </button>
               </div>
            </div>
         </div>
         <div className="bg-white rounded-b-md">
            {/* Información relevante */}
            <div className="flex bg-slate-100 rounded-md p-3 m-3" >
               <MdInfoOutline size={24} color="#A0B0C0" />
               <span className="text-slate-400 px-2">{props.eduItem.information}</span>
            </div>
            {/* Pregunta y respuesta correcta */}
            <div className="flex mx-3 px-3">
               <div className="flex w-9/12">
                  <MdOutlineQuestionAnswer size={24} color="#1A2B3C" />
                  <span className="text-wireladders-dark-blue font-semibold px-2">{props.eduItem.question}</span>
               </div>
            </div>
            {/* Respuestas */}
            <div className="flex m-3">
               <div className="w-full flex flex-col md:flex-row gap-x-2">
                  <div className="relative w-full md:w-1/4 rounded-md border-2 p-2 border-blue-500 place-content-center">
                     <span className="text-blue-400 font-bold px-1">A</span>
                     <span className="text-sm text-wireladders-dark-blue px-1">{props.eduItem.answer_1}</span>
                     {props.eduItem.answer_ok === 1 && (<div className="absolute -top-2 -left-2 bg-white rounded-full"><MdCheckCircle size={24} color="green" /></div>)}
                  </div>
                  <div className="relative w-full md:w-1/4 rounded-md border-2 p-2 border-red-500 place-content-center">
                     <span className="text-red-500 font-bold px-1">B</span>
                     <span className="text-sm text-wireladders-dark-blue px-1">{props.eduItem.answer_2}</span>
                     {props.eduItem.answer_ok === 2 && (<div className="absolute -top-2 -left-2 bg-white rounded-full"><MdCheckCircle size={24} color="green" /></div>)}
                  </div>
                  <div className="relative w-full md:w-1/4 rounded-md border-2 p-2 border-emerald-500 place-content-center">
                     <span className="text-emerald-500 font-bold px-1">C</span>
                     <span className="text-sm text-wireladders-dark-blue px-1">{props.eduItem.answer_3}</span>
                     {props.eduItem.answer_ok === 3 && (<div className="absolute -top-2 -left-2 bg-white rounded-full"><MdCheckCircle size={24} color="green" /></div>)}
                  </div>
                  <div className="relative w-full md:w-1/4 rounded-md border-2 p-2 border-amber-500 place-content-center">
                     <span className="text-amber-500 font-bold px-1">D</span>
                     <span className="text-sm text-wireladders-dark-blue px-1">{props.eduItem.answer_4}</span>
                     {props.eduItem.answer_ok === 4 && (<div className="absolute -top-2 -left-2 bg-white rounded-full"><MdCheckCircle size={24} color="green" /></div>)}
                  </div>
               </div>
            </div>
         </div>
      </div>
   )
}

export default EducationListItem;