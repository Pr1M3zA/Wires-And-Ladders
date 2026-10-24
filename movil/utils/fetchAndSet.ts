import ApiClient from "@/utils/apiClient";
import Toast from 'react-native-toast-message';

const errorMsg = (data: any): string => {
   if (data && typeof data === 'object' && 'message' in data) return data.message;
   return 'Respuesta inesperada del servidor';
};

export const getBoardElements = async (idboard: number, apiURL: string, setBoards: Function, setTiles: Function, setShortcuts: Function) => {

   const apiClient = new ApiClient(apiURL || '');

   await apiClient.get(`game/boards/${idboard}`)
      .then(response => response.json())
      .then(data => {
         if (data && typeof data === 'object' && !Array.isArray(data)) {
            setBoards(data);
         } else if (Array.isArray(data) && data.length === 1) {
            setBoards(data[0]);
         } else {
            Toast.show({ type: 'error', text1: 'Error (Get Board)', text2: errorMsg(data) });
            setBoards(null);
         }
      })
      .catch(error => { Toast.show({ type: 'error', text1: 'Error (Get Board)', text2: error.message }) });

   await apiClient.get(`game/tiles/${idboard}`)
      .then(response => response.json())
      .then(data => {
         if (Array.isArray(data)) {
            setTiles(data);
         } else {
            Toast.show({ type: 'error', text1: 'Error (Get Tiles)', text2: errorMsg(data) });
            setTiles([]);
         }
      })
      .catch(error => { Toast.show({ type: 'error', text1: 'Error (Get Tiles)', text2: error.message }) });

   await apiClient.get(`game/shortcuts/${idboard}`)
      .then(response => response.json())
      .then(data => {
         if (Array.isArray(data)) {
            setShortcuts(data);
         } else {
            Toast.show({ type: 'error', text1: 'Error (Get Shortcuts)', text2: errorMsg(data) });
            setShortcuts([]);
         }
      })
      .catch(error => { Toast.show({ type: 'error', text1: 'Error (Get Shortcuts)', text2: error.message }) });

}

export const getAllBoards = async (
   apiURL: string,
   token: string,
   setBoards: Function,
   setTiles?: Function,
   setShortcuts?: Function
) => {
   const apiClient = new ApiClient(apiURL || '');
   const requests: Promise<any>[] = [
      apiClient.get(`game/boards`, token)
         .then(response => response.json())
         .then(data => {
            if (Array.isArray(data)) {
               setBoards(data);
            } else {
               Toast.show({ type: 'error', text1: 'Error (Get All Boards)', text2: errorMsg(data) });
               setBoards([]);
            }
         })
         .catch(error => { Toast.show({ type: 'error', text1: 'Error (Get All Boards)', text2: error.message }) })
   ];

   if (setTiles) {
      requests.push(
         apiClient.get(`game/tiles`, token)
            .then(response => response.json())
            .then(data => {
               if (Array.isArray(data)) {
                  setTiles(data);
               } else {
                  Toast.show({ type: 'error', text1: 'Error (Get All Tiles)', text2: errorMsg(data) });
                  setTiles([]);
               }
            })
            .catch(error => { Toast.show({ type: 'error', text1: 'Error (Get All Tiles)', text2: error.message }) })
      );
   }

   if (setShortcuts) {
      requests.push(
         apiClient.get(`game/shortcuts`, token)
            .then(response => response.json())
            .then(data => {
               if (Array.isArray(data)) {
                  setShortcuts(data);
               } else {
                  Toast.show({ type: 'error', text1: 'Error (Get All Shortcuts)', text2: errorMsg(data) });
                  setShortcuts([]);
               }
            })
            .catch(error => { Toast.show({ type: 'error', text1: 'Error (Get All Shortcuts)', text2: error.message }) })
      );
   }

   await Promise.all(requests);
}


export const getDices = async (apiUrl: string, setDices: Function) => {
   const apiClient = new ApiClient(apiUrl || '');
   await apiClient.get(`sync/dices`)
      .then(response => response.json())
      .then(data => {
         if (Array.isArray(data)) {
            setDices(data);
         } else {
            Toast.show({ type: 'error', text1: 'Error (Get Dices)', text2: errorMsg(data) });
            setDices([]);
         }
      })
      .catch(error => { Toast.show({ type: 'error', text1: 'Error (Get Dices)', text2: error.message }) });
}

export const getTileTypes = async (apiUrl: string, setTileTypes: Function) => {
   const apiClient = new ApiClient(apiUrl || '');
   await apiClient.get(`sync/tile-types`)
      .then(response => response.json())
      .then(data => {
         if (Array.isArray(data)) {
            setTileTypes(data);
         } else {
            Toast.show({ type: 'error', text1: 'Error (Get TileTypes)', text2: errorMsg(data) });
            setTileTypes([]);
         }
      })
      .catch(error => { Toast.show({ type: 'error', text1: 'Error (Get TileTypes)', text2: error.message }) });
}

export const getCustomSubtopics = async (apiUrl: string, token: string, setCustomSubtopics: Function) => {
   const apiClient = new ApiClient(apiUrl || '');
   await apiClient.get(`education/custom-subtopics`, token)
      .then(response => response.json())
      .then(data => {
         if (Array.isArray(data)) {
            setCustomSubtopics(data);
         } else {
            Toast.show({ type: 'error', text1: 'Error (Get Custom Subtopics)', text2: errorMsg(data) });
            setCustomSubtopics([]);
         }
      })
      .catch(error => { Toast.show({ type: 'error', text1: 'Error (Get Custom Subtopics)', text2: error.message }) });
}

export const getCustomSubtopicById = async (
   apiUrl: string,
   idSubtopic: number,
   idUser: number,
   setCustomSubtopic: Function
) => {
   const apiClient = new ApiClient(apiUrl || '');
   await apiClient.get(`education/custom-subtopics/${idSubtopic}/${idUser}`)
      .then(response => response.json())
      .then(data => {
         if (Array.isArray(data) && data.length > 0) {
            setCustomSubtopic(data[0]);
         } else if (data && typeof data === 'object' && !Array.isArray(data) && 'id_subtopic' in data) {
            setCustomSubtopic(data);
         } else {
            setCustomSubtopic(null);
         }
      })
      .catch(error => {
         Toast.show({ type: 'error', text1: 'Error (Get Custom Subtopic)', text2: error.message });
         setCustomSubtopic(null);
      });
}

export const getInfoAndQuestions = async (apiUrl: string, idSubtopic: number, setEducationData: Function) => {
   const apiClient = new ApiClient(apiUrl || '');
   await apiClient.get(`education/info-and-questions/${idSubtopic}`)
      .then(response => response.json())
      .then(data => {
         if (Array.isArray(data)) {
            setEducationData(data);
         } else {
            Toast.show({ type: 'error', text1: 'Error (Get Info & Questions)', text2: errorMsg(data) });
            setEducationData([]);
         }
      })
      .catch(error => { Toast.show({ type: 'error', text1: 'Error (Get Info & Questions)', text2: error.message }) });
}
