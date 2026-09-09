import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Socket } from 'socket.io-client';
import Toast from 'react-native-toast-message';
import { isUrlActive, EXPECTED_API_RESPONSE, EXPECTED_SOCKET_RESPONSE } from './utils';
import {
	type EffectType, type DiceType, type UserRowType, type PlayingUserType,
	type EduKnowledgeAreaType, type EduDsciplinesType, type EduLevels
} from './types';

const DEFAULT_API_URL = 'https://wires-and-ladders-api.vercel.app';
const DEFAULT_SOCKET_URL = 'https://wires-and-ladders-websocket.onrender.com';

interface contextProps {
	token: string;
	setToken: (token: string) => void;
	idUser: number;
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
	tileTypes: EffectType[];
	setTileTypes: (tileTypes: EffectType[]) => void;
	dices: DiceType[];
	setDices: (dices: DiceType[]) => void;
	isDarkMode: boolean;
	setIsDarkMode: (isDarkMode: boolean) => void;
	fontScale: number;
	setFontScale: (fontScale: number) => void;
	eduKnowledgeAreas: EduKnowledgeAreaType[];
	setEduKnowledgeAreas: (eduKnowledgeAreas: EduKnowledgeAreaType[]) => void;
	eduDsciplines: EduDsciplinesType[];
	setEduDsciplines: (eduDsciplines: EduDsciplinesType[]) => void;
	eduLevels: EduLevels[];
	setEduLevels: (eduLevels: EduLevels[]) => void;
	selectSubTopic: number;
	setSelectSubTopic: (selectSubTopic: number) => void;
}
interface providerProps { children: ReactNode; }


const Context = createContext<contextProps>({
	token: '', setToken: () => { },
	idUser: 0, setIdUser: () => { },
	userRow: { id: 0, username: 'guest', first_name: 'Invitado', last_name: '', email: '', profile_image: null, is_admin: false, id_board: 1, id_dice: 1, id_subtopic: 1 },
	setUserRow: () => { },
	playingUsers: [], setPlayingUsers: () => { },
	apiURL: '', setApiURL: () => { },
	socketURL: '', setSocketURL: () => { },
	defBoard: 1, setDefBoard: () => { },
	defDice: 1, setDefDice: () => { },
	tileTypes: [], setTileTypes: () => { },
	dices: [], setDices: () => { },
	socket: null, setSocket: () => { },
	isDarkMode: false, setIsDarkMode: () => { },
	fontScale: 1, setFontScale: () => { },
	eduKnowledgeAreas: [], setEduKnowledgeAreas: () => { },
	eduDsciplines: [], setEduDsciplines: () => { },
	eduLevels: [], setEduLevels: () => { },
	selectSubTopic: 1, setSelectSubTopic: () => { }
});

export const ContextProvider: React.FC<providerProps> = ({ children }) => {
	const [token, setTokenState] = useState('');
	const [idUser, setIdUser] = useState(0);
	const [userRow, setUserRow] = useState<UserRowType>({ id: 0, username: 'guest', first_name: 'Invitado', last_name: '', email: '', profile_image: null, is_admin: false, id_board: 1, id_dice: 1, id_subtopic: 1 });
	const [playingUsers, setPlayingUsers] = useState<PlayingUserType[]>([]);
	const [defBoard, setDefBoard] = useState(1);
	const [defDice, setDefDice] = useState(1);
	const [socket, setSocket] = useState<Socket | null>(null);
	const [tileTypes, setTileTypes] = useState<EffectType[]>([]);
	const [dices, setDices] = useState<DiceType[]>([]);
	//const [apiURL, setApiURL] = useState(DEFAULT_API_URL); // prod (vercel)

	const [apiURL, setApiURLState] = useState('http://192.168.68.103:3000'); // dev local
	const [socketURL, setSocketURLState] = useState('http://192.168.68.103:3001'); // dev local
	//const [socketURL, setSocketURL] = useState(DEFAULT_SOCKET_URL); // prod (render)

	const [isDarkMode, setIsDarkMode] = useState(false);
	const [fontScale, setFontScale] = useState(1);

	const [eduKnowledgeAreas, setEduKnowledgeAreas] = useState<EduKnowledgeAreaType[]>([]);
	const [eduDsciplines, setEduDsciplines] = useState<EduDsciplinesType[]>([]);
	const [eduLevels, setEduLevels] = useState<EduLevels[]>([]);
	const [selectSubTopic, setSelectSubTopic] = useState(1);

	const setToken = (newToken: string) => {
		setTokenState(newToken);
		if (newToken) {
			AsyncStorage.setItem('userToken', newToken).catch(error => {
				console.error('Error saving token:', error);
			});
		} else {
			AsyncStorage.removeItem('userToken').catch(error => {
				console.error('Error removing token:', error);
			});
		}
	};

	const setApiURL = (newUrl: string) => {
		setApiURLState(newUrl);
		AsyncStorage.setItem('UrlApiDb', newUrl).catch(error => {
			console.error('Error saving apiURL:', error);
		});
	};

	const setSocketURL = (newUrl: string) => {
		setSocketURLState(newUrl);
		AsyncStorage.setItem('UrlApiSockets', newUrl).catch(error => {
			console.error('Error saving socketURL:', error);
		});
	};

	useEffect(() => {
		const loadSettings = async () => {
			try {
				const darkMode = await AsyncStorage.getItem('isDarkMode');
				const fScale = await AsyncStorage.getItem('fontScale');
				const savedToken = await AsyncStorage.getItem('userToken');
				let savedApiURL = await AsyncStorage.getItem('UrlApiDb');
				let savedSocketURL = await AsyncStorage.getItem('UrlApiSockets');
				if (darkMode !== null) setIsDarkMode(JSON.parse(darkMode));
				if (fScale !== null) setFontScale(parseFloat(fScale));
				if (savedToken !== null) setTokenState(savedToken);
				if (savedApiURL === null) {
					savedApiURL = DEFAULT_API_URL;
					await AsyncStorage.setItem('UrlApiDb', savedApiURL);
				}
				setApiURLState(savedApiURL);
				if (savedSocketURL === null) {
					savedSocketURL = DEFAULT_SOCKET_URL;
					await AsyncStorage.setItem('UrlApiSockets', savedSocketURL);
				}
				setSocketURLState(savedSocketURL);

				setApiURL('http://192.168.68.103:3000')   // temporal para pruebas (persiste)
				setSocketURL('http://192.168.68.103:3001')   // temporal para pruebas (persiste)


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

	useEffect(() => {
		const checkUrls = async () => {
			const [apiRes, sockRes] = await Promise.all([
				isUrlActive(apiURL, { expectedText: EXPECTED_API_RESPONSE }),
				isUrlActive(socketURL, { expectedText: EXPECTED_SOCKET_RESPONSE }),
			]);
			if (!apiRes.active) {
				Toast.show({ type: 'error', text1: 'API Base de Datos no responde', text2: apiRes.error ?? 'Sin respuesta', visibilityTime: 6000 });
			}
			if (!sockRes.active) {
				Toast.show({ type: 'error', text1: 'API de Sockets no responde', text2: sockRes.error ?? 'Sin respuesta', visibilityTime: 6000 });
			}
		};
		if (apiURL && socketURL) checkUrls();
	}, [apiURL, socketURL]);

	return (
		<Context.Provider value={{
			token, setToken, idUser, setIdUser, userRow, setUserRow, playingUsers, setPlayingUsers, isDarkMode, setIsDarkMode, fontScale, setFontScale,
			defBoard, setDefBoard, defDice, setDefDice, tileTypes, setTileTypes, dices, setDices,
			apiURL, socketURL, setApiURL, setSocketURL, socket, setSocket,
			eduKnowledgeAreas, setEduKnowledgeAreas, eduDsciplines, setEduDsciplines, eduLevels, setEduLevels, selectSubTopic, setSelectSubTopic
		}}>
			{children}
		</Context.Provider>
	);
}

export const useContextProvider = () => {
	return useContext(Context);
};
