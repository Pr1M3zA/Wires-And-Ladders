import { useContext, useMemo } from "react";
import { EducationContext } from "./EducationContext";
import type { EduDataStore } from "./EducationStore";
import { EducationActionType } from "./EducationActions";

const useEducationStore = () => {
  const context = useContext(EducationContext);

  if (!context) {
    throw new Error("useEducationStore must be used within a EducationProvider");
  }

  const [state, dispatch] = context;
  const selectedEduData = useMemo(() => {
    if(state.selectedEduDataId === -1) return null;
    return state.eduDatas.find(ed => ed.id === state.selectedEduDataId) || null;
  }, [state.selectedEduDataId, state.eduDatas]);

  const setEducationalData = (eduDatas: EduDataStore["eduDatas"]) => {
    dispatch({
      type: EducationActionType.SET_EDU_DATA,
      payload: eduDatas,
    });
  };

  const addEducationalData = (eduData: EduDataStore["eduDatas"][number]) => {
    dispatch({
      type: EducationActionType.ADD_EDU_DATA,
      payload: eduData,
    });
  };

  const removeEducationalData = (eduData: EduDataStore["eduDatas"][number]) => {
    dispatch({
      type: EducationActionType.REMOVE_EDU_DATA,
      payload: eduData,
    });
  };
  
  const editEducationalData = (eduData: EduDataStore["eduDatas"][number]) => {
    dispatch({
      type: EducationActionType.EDIT_EDU_DATA,
      payload: eduData,
    });
  };  

  const clearEducationalData = () => {
    dispatch({
      type: EducationActionType.CLEAR_EDU_DATA,
    });
  };

  const setSelectedEduDataId = (eduDataId: EduDataStore["selectedEduDataId"]) => {
    dispatch({
      type: EducationActionType.SET_SELECTED_EDU_DATA,
      payload: eduDataId,
    });
  };

  const setToken = (token: EduDataStore["token"]) => {
    dispatch({
      type: EducationActionType.SET_TOKEN,
      payload: token,
    });
  };



  return {
    state,
    setEducationalData, clearEducationalData,
    addEducationalData, removeEducationalData, editEducationalData,
    setSelectedEduDataId, selectedEduData,
    setToken
  };
};

export default useEducationStore;