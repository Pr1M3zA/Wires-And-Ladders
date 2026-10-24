import { FC, useEffect, useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import Icon from '@expo/vector-icons/Feather';
import { useContextProvider } from '@/utils/ContextProvider';
import { getAllBoards } from '@/utils/fetchAndSet';
import { loadLocalAllBoards, loadLocalTiles, loadLocalShortcuts } from '@/utils/dbOffline';
import BoardCard from '@/components/BoardCard';
import type { BoardType, TileType, ShortCutType } from '@/utils/types';

interface BoardSelectorProps {
	isModalVisible: boolean;
	handleModalClose: (selectedId?: number) => void;
	currentBoardId: number;
}

interface BoardWithElements {
	board: BoardType;
	tiles: TileType[];
	shortcuts: ShortCutType[];
}

const BoardSelector: FC<BoardSelectorProps> = ({ isModalVisible, handleModalClose, currentBoardId }) => {
	const { apiURL, token, isApiConnected, isDarkMode, fontScale } = useContextProvider();
	const [boardsData, setBoardsData] = useState<BoardWithElements[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (!isModalVisible) {
			setBoardsData([]);
			return;
		}

		const loadBoards = async () => {
			setIsLoading(true);
			try {
				if (isApiConnected) {
					let boards: BoardType[] = [];
					let allTiles: TileType[] = [];
					let allShortcuts: ShortCutType[] = [];

					await getAllBoards(
						apiURL,
						token,
						(data: BoardType[]) => { boards = data; },
						(data: TileType[]) => { allTiles = data; },
						(data: ShortCutType[]) => { allShortcuts = data; }
					);

					if (boards.length === 0) {
						setBoardsData([]);
						return;
					}

					const boardsWithElements: BoardWithElements[] = boards.map((board) => ({
						board,
						tiles: allTiles
							.filter((t) => t.id_board === board.id)
							.sort((a, b) => a.num_tile - b.num_tile),
						shortcuts: allShortcuts.filter((s) => s.id_board === board.id),
					}));

					setBoardsData(boardsWithElements);
				} else {
					const boards = await loadLocalAllBoards();

					if (boards.length === 0) {
						setBoardsData([]);
						return;
					}

					const boardsWithElements: BoardWithElements[] = await Promise.all(
						boards.map(async (board) => {
							const tiles = await loadLocalTiles(board.id);
							const shortcuts = await loadLocalShortcuts(board.id);
							return { board, tiles, shortcuts };
						})
					);

					setBoardsData(boardsWithElements);
				}
			} catch (error) {
				console.log('BoardSelector load error:', error);
			} finally {
				setIsLoading(false);
			}
		};

		loadBoards();
	}, [isModalVisible, isApiConnected]);

	const handleSelectBoard = (boardId: number) => {
		handleModalClose(boardId);
	};

	const renderRows = () => {
		const rows: BoardWithElements[][] = [];
		for (let i = 0; i < boardsData.length; i += 2) {
			rows.push(boardsData.slice(i, i + 2));
		}
		return rows.map((row, rowIdx) => (
			<View key={`row-${rowIdx}`} style={styles.cardsRow}>
				{row.map((item) => (
					<View key={item.board.id} style={styles.cardCell}>
						<BoardCard
							board={item.board}
							tiles={item.tiles}
							shortcuts={item.shortcuts}
							isDarkMode={isDarkMode}
							fontScale={fontScale}
							isCurrentBoard={item.board.id === currentBoardId}
							onPress={() => handleSelectBoard(item.board.id)}
						/>
					</View>
				))}
				{row.length === 1 && <View style={styles.cardCell} />}
			</View>
		));
	};

	return (
		<Modal animationType="slide" transparent={true} visible={isModalVisible} onRequestClose={() => handleModalClose()}>
			<View style={styles.modalCenteredView}>
				<View style={[styles.modalView, { backgroundColor: isDarkMode ? '#1F3344' : 'white', borderColor: isDarkMode ? '#3C709A' : '#6599C3' }]}>
					<View style={styles.headerRow}>
						<Text style={[styles.modalTitle, { color: isDarkMode ? '#578BB6' : '#365C80', fontSize: 20 * fontScale }]}>
							Selecciona un Tablero
						</Text>
						<TouchableOpacity onPress={() => handleModalClose()}>
							<Icon name='x' size={28} color={isDarkMode ? '#578BB6' : '#6599C3'} />
						</TouchableOpacity>
					</View>

					{isLoading ? (
						<View style={styles.loadingContainer}>
							<ActivityIndicator size="large" color={isDarkMode ? '#578BB6' : '#6599C3'} />
							<Text style={{ color: isDarkMode ? '#578BB6' : '#365C80', textAlign: 'center', marginTop: 12 }}>
								Cargando tableros...
							</Text>
						</View>
					) : boardsData.length === 0 ? (
						<Text style={{ color: isDarkMode ? '#578BB6' : '#365C80', textAlign: 'center', marginVertical: 20 }}>
							No hay tableros disponibles
						</Text>
					) : (
						<ScrollView style={{ maxHeight: 420 }} nestedScrollEnabled={true}>
							{renderRows()}
						</ScrollView>
					)}
				</View>
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	modalCenteredView: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: 'rgba(0,0,0,0.5)',
	},
	modalView: {
		margin: 20,
		borderRadius: 20,
		padding: 20,
		alignItems: "stretch",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.35,
		shadowRadius: 10,
		elevation: 8,
		width: '92%',
		maxWidth: 420,
		borderWidth: 1,
	},
	headerRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 12,
	},
	modalTitle: {
		fontWeight: '700',
		flex: 1,
	},
	cardsRow: {
		flexDirection: 'row',
		gap: 8,
		marginBottom: 10,
	},
	cardCell: {
		flex: 1,
	},
	loadingContainer: {
		paddingVertical: 40,
		alignItems: 'center',
	},
});

export default BoardSelector;
