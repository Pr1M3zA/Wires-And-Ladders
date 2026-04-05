import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Socket } from 'socket.io-client';
import { type BoardType, type ShortCutType, type TileType, type EffectType, type DiceType, type UserRowType, type PlayingUserType } from './types';

interface contextProps {
	token: string;
	setToken: (token: string) => void;
	idUser: number,
	setIdUser: (idUser: number) => void;
	userRow: UserRowType;
	setUserRow: (userRow: UserRowType) => void;
	playingUsers: PlayingUserType[];
	setPlayingUsers: (playingUsers: PlayingUserType[]) => void;
	defBoard: number;
	setDefBoard: (defBoard: number) => void;
	defDice: number;
	setDefDice: (defDice: number) => void;
	apiURL: string;
	setApiURL: (apiURL: string) => void;
	socketURL: string;
	setSocketURL: (socketURL: string) => void;
	socket: Socket | null;
	setSocket: (socket: Socket | null) => void;
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
	isDarkMode: boolean;
	setIsDarkMode: (isDarkMode: boolean) => void;
	fontScale: number;
	setFontScale: (fontScale: number) => void;
}
interface providerProps { children: ReactNode; }


const Context = createContext<contextProps>({
	token: '', setToken: () => { },
	idUser: 0, setIdUser: () => { },
	userRow: { id: 0, username: 'guest', first_name: 'Invitado', last_name: '', email: '', profile_image: null, is_admin: false },
	setUserRow: () => { },
	playingUsers: [], setPlayingUsers: () => { },
	apiURL: '', setApiURL: () => { },
	socketURL: '', setSocketURL: () => { },
	defBoard: 1, setDefBoard: () => { },
	defDice: 1, setDefDice: () => { },
	boards: [], setBoards: () => { },
	tiles: [], setTiles: () => { },
	tileTypes: [], setTileTypes: () => { },
	shortcuts: [], setShortcuts: () => { },
	dices: [], setDices: () => { },
	socket: null, setSocket: () => { },
	isDarkMode: false, setIsDarkMode: () => { },
	fontScale: 1, setFontScale: () => { }
});

export const ContextProvider: React.FC<providerProps> = ({ children }) => {
	const [token, setToken] = useState('');
	const [idUser, setIdUser] = useState(0);
	const [userRow, setUserRow] = useState<UserRowType>({ id: 0, username: 'guest', first_name: 'Invitado', last_name: '', email: '', profile_image: null, is_admin: false });
	const [playingUsers, setPlayingUsers] = useState<PlayingUserType[]>([]);
	const [defBoard, setDefBoard] = useState(1);
	const [defDice, setDefDice] = useState(1);
	const [socket, setSocket] = useState<Socket | null>(null);
	const [boards, setBoards] = useState<BoardType[]>([]);
	const [tiles, setTiles] = useState<TileType[]>([]);
	const [tileTypes, setTileTypes] = useState<EffectType[]>([]);
	const [shortcuts, setShortcuts] = useState<ShortCutType[]>([]);
	const [dices, setDices] = useState<DiceType[]>([]);
	const [apiURL, setApiURL] = useState('https://wires-and-ladders-api.vercel.app');
	const [socketURL, setSocketURL] = useState('https://wires-and-ladders-websocket.onrender.com');
	const [isDarkMode, setIsDarkMode] = useState(false);
	const [fontScale, setFontScale] = useState(1);

	useEffect(() => {
		const loadSettings = async () => {
			try {
				const darkMode = await AsyncStorage.getItem('isDarkMode');
				const fScale = await AsyncStorage.getItem('fontScale');
				if (darkMode !== null) setIsDarkMode(JSON.parse(darkMode));
				if (fScale !== null) setFontScale(parseFloat(fScale));
			} catch (error) {
				console.error('Error loading settings:', error);
			}
		};
		loadSettings();
	}, []);

	useEffect(() => {
		Appearance.setColorScheme(isDarkMode ? 'dark' : 'light');
		const saveDarkMode = async () => {
			try {
				await AsyncStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));
			} catch (error) {
				console.error('Error saving dark mode:', error);
			}
		};
		saveDarkMode();
	}, [isDarkMode]);

	useEffect(() => {
		const saveFontScale = async () => {
			try {
				await AsyncStorage.setItem('fontScale', fontScale.toString());
			} catch (error) {
				console.error('Error saving font scale:', error);
			}
		};
		saveFontScale();
	}, [fontScale]);

	//const apiURL = 'https://wires-and-ladders-api.vercel.app';   
	//const socketURL = 'https://wires-and-ladders-socket.onrender.com';	 

	return (
		<Context.Provider value={{
			token, setToken, idUser, setIdUser, userRow, setUserRow, playingUsers, setPlayingUsers,
			defBoard, setDefBoard, defDice, setDefDice, boards, setBoards, tiles, setTiles, shortcuts, setShortcuts, tileTypes, setTileTypes, dices, setDices,
			apiURL, socketURL, setApiURL, setSocketURL, socket, setSocket, isDarkMode, setIsDarkMode, fontScale, setFontScale
		}}>
			{children}
		</Context.Provider>
	);
}

export const useContextProvider = () => {
	return useContext(Context);
};
