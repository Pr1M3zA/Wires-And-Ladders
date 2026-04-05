import { EducationActionType } from "./EducationActions";
import type { EduDataStore, EduData } from "./EducationStore";
import type { EducationalDataAction } from "./EducationActions";

/*
type PlaylistAction = {
   type: PlaylistActionType;
   payload: unknown;
}
*/
export const EducationReducer = (state: EduDataStore, action: EducationalDataAction): EduDataStore => {
   switch (action.type) {
      case EducationActionType.SET_EDU_DATA:
         return {
            ...state,
            eduDatas: action.payload as EduDataStore['eduDatas'],
         }; 
      case EducationActionType.ADD_EDU_DATA:
         return {
            ...state,
            eduDatas: [...state.eduDatas, action.payload as EduData],
         };
      case EducationActionType.EDIT_EDU_DATA:
         return {
            ...state,  
            eduDatas: state.eduDatas.map(edu => 
               edu.id === (action.payload as EduData).id 
                  ? (action.payload as EduData) 
                  : edu
            )
         };
      case EducationActionType.REMOVE_EDU_DATA:
         return {
            ...state,
            eduDatas: state.eduDatas.filter(edu => edu.id !== (action.payload as EduData).id),
         };
      case EducationActionType.CLEAR_EDU_DATA:
         return {
            ...state,
            eduDatas: [],
            selectedEduDataId: -1,
         };
      case EducationActionType.SET_SELECTED_EDU_DATA:
         return {
            ...state,
            selectedEduDataId: action.payload as EduDataStore['selectedEduDataId'],
         };
      case EducationActionType.SET_TOKEN:
         return {
            ...state,
            token: action.payload as EduDataStore['token'],
         };
      default:
         return state;
   }

}