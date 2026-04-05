export type EduData = {
   id: number,
   generation: number, 
   theme: string, 
   information: string, 
   question: string, 
   answer_1: string, 
   answer_2: string, 
   answer_3: string, 
   answer_4: string, 
   answer_ok: number
}

export type EduDataStore = {
   eduDatas: EduData[];
   selectedEduDataId: number;
   token: string;
}

export const initialEducationStore: EduDataStore = {
   eduDatas: [
   ],
   selectedEduDataId: -1,
   token: ''
}



