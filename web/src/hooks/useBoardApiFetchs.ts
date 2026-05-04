import { useMemo } from "react";
import HttpClient from "../utils/HttpClient.ts";
import { showToast } from "../utils/ShowToast.ts";
import { useBoardContext } from "../store/BoardProvider.tsx";

const useBoardApiFetchs = () => {
   const httpClient = useMemo(() => {
      return new HttpClient(import.meta.env.VITE_API_URL || '');
   }, []);

   const { setTileTypes, setTiles, setShortcuts, setBoards } = useBoardContext()

   const dbGetEffectTypes = async () => {
      await httpClient.get('sync/tile-types')
         .then(response => response.json())
         .then(data => setTileTypes(data))
         .catch(error => { showToast('Get Tile Types data error', error.message, 'error') });
   }

   const dbGetTiles = async () => {
      await httpClient.get('sync/tiles')
         .then(response => response.json())
         .then(data => setTiles(data))
         .catch(error => { showToast('Get Tiles data error', error.message, 'error') });
   }

   const dbGetShortcuts = async () => {
      await httpClient.get('sync/shortcuts')
         .then(response => response.json())
         .then(data => setShortcuts(data))
         .catch(error => { showToast('Get Shortcuts data error', error.message, 'error') });
   }

   const dbGetBoards = async () => {
      await httpClient.get('sync/boards')
         .then(response => response.json())
         .then(data => setBoards(data))
         .catch(error => { showToast('Get Boards data error', error.message, 'error') });
   }

   return { dbGetEffectTypes, dbGetTiles, dbGetShortcuts, dbGetBoards }

}

export default useBoardApiFetchs