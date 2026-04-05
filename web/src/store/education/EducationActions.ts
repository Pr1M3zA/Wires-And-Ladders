import type { EduDataStore  } from "./EducationStore";

export enum EducationActionType {
   ADD_EDU_DATA = 'ADD_EDUCATIONAL_DATA',
   REMOVE_EDU_DATA = 'REMOVE_EDUCATIONAL_DATA',
   EDIT_EDU_DATA = 'EDIT_EDUCATIONAL_DATA',
   SET_SELECTED_EDU_DATA = 'SET_SELECTED_EDUCATIONAL_DATA',
   CLEAR_EDU_DATA = 'CLEAR_EDUCATIONAL_DATA',
   SET_EDU_DATA = 'SET_EDUCATIONAL_DATA',
   SET_TOKEN = 'SET_TOKEN',
}

export type SetEducationalDataAction = {
   type: EducationActionType.SET_EDU_DATA;
   payload: EduDataStore['eduDatas'];
}

export type AddEducationalDataAction = {
   type: EducationActionType.ADD_EDU_DATA;
   payload: EduDataStore['eduDatas'][number];
}

export type RemoveEducationalDataAction = {
   type: EducationActionType.REMOVE_EDU_DATA;
   payload: EduDataStore['eduDatas'][number];
}

export type EditEducationalDataAction = {
   type: EducationActionType.EDIT_EDU_DATA;
   payload: EduDataStore['eduDatas'][number];
}


export type ClearEducationalDataAction = {
   type: EducationActionType.CLEAR_EDU_DATA;
}

export type SetSelectedEducationalDataAction = {
   type: EducationActionType.SET_SELECTED_EDU_DATA;
   payload: EduDataStore['selectedEduDataId'];
}

export type SetTokenAction = {
   type: EducationActionType.SET_TOKEN;
   payload: EduDataStore['token'];
}

export type EducationalDataAction = 
   SetEducationalDataAction | 
   AddEducationalDataAction | 
   RemoveEducationalDataAction | 
   EditEducationalDataAction | 
   ClearEducationalDataAction |
   SetSelectedEducationalDataAction |
   SetTokenAction;