import type { EduData } from "../store/education/EducationStore";
import { MdEditNote, MdDeleteSweep  } from "react-icons/md";
import useEducationStore from "../store/education/useEducationStore.ts";
import useApiFetchs from "../hooks/useApiFetchs.ts";
import Swal from "sweetalert2";

type EducListItemProps = {
   eduItem: EduData
   onEdit: (eduItem: EduData) => void
}

const EducationListItem: React.FC<EducListItemProps> = ( props ) => {
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
      <div className="border-t-2 border-t-wireladders-dark-blue flex flex-col mx-10 py-1 mt-5">
         <div className="flex bg-wireladders-light-blue text-wireladders-dark-blue">
            <label className="w-2/12 min-w-28 text-right pr-2 font-extrabold text-lg" >Tema:</label>
            <div className="w-10/12 flex">
               <label className="w-11/12 font-bold text-lg">{props.eduItem.theme}</label>
               <div className="flex w-1/12 min-w-16 justify-between">
                  <button onClick={() => props.onEdit(props.eduItem)}>
                     <MdEditNote size={30} color="white" />
                  </button> 
                  <button className="px-2" onClick={handleRemoveEduData}>
                     <MdDeleteSweep size={30} color="white" />
                  </button> 
               </div>
            </div>
         </div>
         <div className="flex">
            <label className="w-2/12 min-w-28 text-right pr-2 font-bold" >Información:</label>
            <label className="w-10/12">{props.eduItem.information}</label>
         </div>
         <div className="flex">
            <label className="w-2/12 min-w-28 text-right pr-2 font-bold" >Pregunta:</label>
            <label className="w-10/12">{props.eduItem.question}</label>
         </div>
         <div className="flex">
            <label className="w-2/12 min-w-28 text-right pr-2 font-bold" >Opciones:</label>
            <div className="w-10/12 flex flex-col md:flex-row gap-x-2">
               <div className="w-full md:w-1/5 rounded-md bg-wireladders-blue place-content-center text-center">
                  <label className="text-sm font-bold">1: {props.eduItem.answer_1}</label>
               </div>
               <div className="w-full md:w-1/5 rounded-md bg-red-2 place-content-center text-center">
                  <label className="text-sm font-bold">2: {props.eduItem.answer_2}</label>
               </div>               
               <div className="w-full md:w-1/5 rounded-md bg-wireladders-green place-content-center text-center">
                  <label className="text-sm font-bold">3: {props.eduItem.answer_3}</label>
               </div>
               <div className="w-full md:w-1/5 rounded-md bg-wireladders-yellow place-content-center text-center">
                  <label className="text-sm font-bold">4: {props.eduItem.answer_4}</label>
               </div>
               <div className="w-full md:w-1/5 rounded-md bg-gray-600 place-content-center text-center">
                  <label className="text-sm font-bold text-white!">Correcta: {props.eduItem.answer_ok}</label>
               </div>
            </div>
         </div>
      </div>
   )
}

export default EducationListItem;