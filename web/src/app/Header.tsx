import { useEffect } from "react";
import useEducationStore from "../store/education/useEducationStore.ts";
import useApiFetchs from "../hooks/useApiFetchs.ts";


const Header = () => {
   const { state, setToken } = useEducationStore()
   const { dbGetUserData, user } = useApiFetchs();

   useEffect(() => {
      dbGetUserData();
   }, [state.token, dbGetUserData]);

   if(!state.token) return null
   return (
      <div className="bg-neutral-800 p-3">
         <label className="font-manrope text-white!">Bienvenido, {user?.first_name} {user?.last_name}</label>
         <button className="float-right bg-red-600 px-3 py-1 rounded-full text-white!" onClick={() => setToken('')}>
            Cerrar sesión
         </button>
      </div> 
   )
}

export default Header;