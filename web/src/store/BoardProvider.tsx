import { createContext, useContext, useState, type ReactNode } from 'react';
import type { BoardType, DiceType, EffectType, ShortCutType, TileType, PlayingUserType } from '../utils/types';

// Define the shape of your context data
interface BoardContextProps {
  boards: BoardType[];
  setBoards: (boards: BoardType[]) => void;
  tiles: TileType[];
  setTiles: (tiles: TileType[]) => void;
  tileTypes: EffectType[];
  setTileTypes: (tileTypes: EffectType[]) => void;
  shortcuts: ShortCutType[];
  setShortcuts: (shortcuts: ShortCutType[]) => void;
  dices: DiceType[];
  setDices: (dices: DiceType[]) => void;
  playingUsers: PlayingUserType[];
  setPlayingUsers: (playingUsers: PlayingUserType[]) => void;

}

// Create context with an initial undefined value for safety
const BoardContext = createContext<BoardContextProps | undefined>(undefined);

// Custom hook for easier consumption and null-checking
export const useBoardContext = () => {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

interface Props { children: ReactNode; }

export const BoardProvider = ({ children }: Props) => {
  const [boards, setBoards] = useState<BoardType[]>([]);
  const [tiles, setTiles] = useState<TileType[]>([]);
  const [tileTypes, setTileTypes] = useState<EffectType[]>([]);
  const [shortcuts, setShortcuts] = useState<ShortCutType[]>([]);
  const [dices, setDices] = useState<DiceType[]>([]);
  const [playingUsers, setPlayingUsers] = useState<PlayingUserType[]>([{ id: 1, username: 'JLMeza', profile_image: null, socketId: '123' }]);


  return (
    <BoardContext.Provider value={{
      boards, setBoards, tiles, setTiles, tileTypes, setTileTypes, shortcuts, setShortcuts,
      dices, setDices, playingUsers, setPlayingUsers
    }}>
      {children}
    </BoardContext.Provider>
  );
};
