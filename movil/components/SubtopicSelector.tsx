import { FC, useEffect, useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Icon from '@expo/vector-icons/Feather';
import { useContextProvider } from '@/utils/ContextProvider';
import { getCustomSubtopics } from '@/utils/fetchAndSet';
import { loadLocalCustomSubtopics } from '@/utils/dbOffline';
import SubtopicCard from '@/components/SubtopicCard';
import type { CustomSubtopicType } from '@/utils/types';

interface SubtopicSelectorProps {
	isModalVisible: boolean,
	handleModalClose: (selectedId?: number, selectedItem?: CustomSubtopicType) => void,
}

const SubtopicSelector: FC<SubtopicSelectorProps> = ({ isModalVisible, handleModalClose }) => {
	const { apiURL, token, isApiConnected, isDarkMode, fontScale } = useContextProvider();
	const [subtopics, setSubtopics] = useState<CustomSubtopicType[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (isModalVisible && subtopics.length === 0) {
			setIsLoading(true);
			if (isApiConnected) {
				getCustomSubtopics(apiURL, token, setSubtopics)
					.finally(() => setIsLoading(false));
			} else {
				loadLocalCustomSubtopics()
					.then(setSubtopics)
					.finally(() => setIsLoading(false));
			}
		}
	}, [isModalVisible, isApiConnected]);

	const onSelectSubtopic = (item: CustomSubtopicType) => {
		handleModalClose(item.id_subtopic, item);
	};

	const renderRows = () => {
		const rows: CustomSubtopicType[][] = [];
		for (let i = 0; i < subtopics.length; i += 2) {
			rows.push(subtopics.slice(i, i + 2));
		}
		return rows.map((row, rowIdx) => (
			<View key={`row-${rowIdx}`} style={styles.cardsRow}>
				{row.map((item) => (
					<View key={item.id_subtopic} style={styles.cardCell}>
						<SubtopicCard
							item={item}
							isDarkMode={isDarkMode}
							fontScale={fontScale}
							onPress={() => onSelectSubtopic(item)}
						/>
					</View>
				))}
			</View>
		));
	};

	return (
		<Modal animationType="slide" transparent={true} visible={isModalVisible} onRequestClose={() => handleModalClose()}>
			<View style={styles.modalCenteredView}>
				<View style={[styles.modalView, { backgroundColor: isDarkMode ? '#1F3344' : 'white', borderColor: isDarkMode ? '#3C709A' : '#6599C3' }]}>
					<View style={styles.headerRow}>
						<Text style={[styles.modalTitle, { color: isDarkMode ? '#578BB6' : '#365C80', fontSize: 20 * fontScale }]}>
							Selecciona un Subtema
						</Text>
						<TouchableOpacity onPress={() => handleModalClose()}>
							<Icon name='x' size={28} color={isDarkMode ? '#578BB6' : '#6599C3'} />
						</TouchableOpacity>
					</View>

					{isLoading ? (
						<Text style={{ color: isDarkMode ? '#578BB6' : '#365C80', textAlign: 'center', marginVertical: 20 }}>
							Cargando...
						</Text>
					) : subtopics.length === 0 ? (
						<Text style={{ color: isDarkMode ? '#578BB6' : '#365C80', textAlign: 'center', marginVertical: 20 }}>
							No hay subtemas disponibles
						</Text>
					) : (
						<ScrollView style={{ maxHeight: 420 }}>
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
});

export default SubtopicSelector;
