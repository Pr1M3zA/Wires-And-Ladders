import { useEffect, useState, useMemo, useCallback } from "react";
import HexTile from "./components/HexTile.tsx";
import StartFinishLine from "./components/StartFinishLine.tsx";
import useEducationStore from "../store/education/useEducationStore.ts";
import { useBoardContext } from "../store/BoardProvider.tsx";
import useBoardApiFetchs from "../hooks/useBoardApiFetchs.ts";
import Dice from "./components/Dice.tsx";
import Ladder from "./components/Ladder.tsx";
import Wire from "./components/Wire.tsx";
import Player from "./components/Player.tsx";
import type { TileType, ShortCutType } from "../utils/types.ts";

const wireScaleColor = { fill: 'green', border: 'black' };
const ladderColor = { base: 'sandybrown', rung: 'saddlebrown' };

const Board = () => {
   const { state } = useEducationStore()
   const { tileTypes, tiles, shortcuts, boards } = useBoardContext()
   const [idBoard, setIdBoard] = useState(1)
   const [hexTiles, setHexTiles] = useState<TileType[]>([])
   const [wires, setWires] = useState<ShortCutType[]>([])
   const [ladders, setLadders] = useState<ShortCutType[]>([])
   //const [allShortcuts, setAllShortcuts] = useState<ShortCutType[]>([])
   const { dbGetEffectTypes, dbGetTiles, dbGetShortcuts, dbGetBoards } = useBoardApiFetchs();

   const allTilesCoords = useMemo(() => hexTiles.map(b => ({ x: b.pos_x, y: b.pos_y })), [hexTiles]);

   useEffect(() => {
      setHexTiles(tiles.filter((item) => item.id_board === idBoard).sort((a, b) => a.num_tile - b.num_tile))
      setWires(shortcuts.filter(item => item.from_tile > item.to_tile).map(wire => ({ ...wire, type: 'wire' })))
      setLadders(shortcuts.filter(item => item.to_tile > item.from_tile).map(ladder => ({ ...ladder, type: 'ladder' })))
      //setAllShortcuts([...wires, ...ladders])
   }, [idBoard, tiles, shortcuts]);

   const fetchData = async () => {
      await dbGetBoards()
      await dbGetEffectTypes()
      await dbGetTiles()
      await dbGetShortcuts()
      setIdBoard(boards[0].id)
   }

   useEffect(() => {
      fetchData()
   }, []);

   const stableOnMoveComplete = useCallback((tile: number, id: number) => {
      console.log('Player ', id, ' moved to tile ', tile);
   }, []);


   if (!state.token) return null
   if (hexTiles.length === 0) return null
   return (
      <div>
         <svg viewBox="0 0 600 1500">
            <g transform="scale(0.5)">
               {hexTiles.map((item, index) => {
                  if (item.effect_name === 'Inicio' || item.effect_name === 'Meta')
                     return (
                        <StartFinishLine key={index} pos={{ x: item.pos_x, y: item.pos_y }} size={{ width: 400 - item.pos_x, height: item.radius }}
                           color={{ fill: tileTypes[item.tile_type].color_fill, border: tileTypes[item.tile_type].color_border }}
                        />);
                  else
                     return (<HexTile {...item} key={index} />);
               })}
               <Dice initialValue={4} position={{ x: 350, y: 400 }} scale={1} lineWidth={2}
                  colors={{ faceUpColor: 'steelblue', faceLeftColor: 'yellow', faceRightColor: 'green', line: 'white', dots: 'red' }}
                  isAnimated={true}
                  onSpinComplete={(value) => console.log('Dice rolled:', value)}
               />
               {wires.map((wire, index) => {
                  return (
                     <Wire key={index} width={10} scaleColor={wireScaleColor}
                        from={{ x: hexTiles[wire.from_tile].pos_x, y: hexTiles[wire.from_tile].pos_y }}
                        to={{ x: hexTiles[wire.to_tile].pos_x, y: hexTiles[wire.to_tile].pos_y }}
                     />)
               })}
               {ladders.map((ladder, index) => {
                  return (
                     <Ladder key={index} scale={1} color={ladderColor}
                        from={{ x: hexTiles[ladder.from_tile].pos_x, y: hexTiles[ladder.from_tile].pos_y }}
                        to={{ x: hexTiles[ladder.to_tile].pos_x, y: hexTiles[ladder.to_tile].pos_y }}
                     />)
               })}
               <Player
                  key={`player-1`}
                  playerId={1} targetTile={99} initialTile={80} scale={0.8} playerIndex={1}
                  color={{ fill: "red", border: "darkred", eyes: "white" }}
                  onMoveComplete={stableOnMoveComplete}
                  tilesCoords={allTilesCoords}
               />
            </g>
         </svg>
      </div>

   )
}

export default Board