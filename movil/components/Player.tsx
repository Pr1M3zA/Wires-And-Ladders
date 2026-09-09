import React, { FC, useEffect } from 'react';
import { G, Path, Ellipse, Rect, Text as SvgText } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withTiming, Easing, runOnJS, cancelAnimation } from 'react-native-reanimated';
import { useAudioPlayer } from 'expo-audio';
import { useContextProvider } from '@/utils/ContextProvider';
import runningEffectSrc from '@/assets/sounds/cartoon-running-footsteps.mp3';

interface playerProps {
	playerId: number; // ID del jugador para identificarlo en el callback
	playerIndex: number; // Índice del jugador (0-5) para calcular separación en la salida
	initialTile: number; //Casilla inicial del jugador
	targetTile: number;
	scale: number;
	color: { fill: string, border: string, eyes: string };
	tilesCoords: { x: number, y: number }[]; // Array con las posiciones de todas las casillas
	onMoveComplete?: (finalIndex: number, playerId: number) => void; // Callback when animation sequence finishes
	showName?: boolean; // Mostrar el username dentro del token (default true). Pasar false para mostrarlo fuera (e.g. en el lobby).
}
const AnimatedG = Animated.createAnimatedComponent(G);
const playerIdxOffSet = [{ x: -5, y: 0 }, { x: 5, y: 0 }, { x: -3, y: -3 }, { x: 3, y: -3 }, { x: -3, y: 3 }, { x: 3, y: 3 }]



const Player: FC<playerProps> = (props) => {
	const initialPos = props.initialTile < props.tilesCoords.length ? props.tilesCoords[props.initialTile] : { x: 0, y: 0 };
	const animatedX = useSharedValue(initialPos.x);
	const animatedY = useSharedValue(initialPos.y);
	const currentTile = useSharedValue(props.initialTile);
	const isAnimating = useSharedValue(false);
	const runningEffect = useAudioPlayer(runningEffectSrc);
	const { playingUsers } = useContextProvider();

	const playerInfo = playingUsers.findIndex(p => p.id === props.playerId);

	// Calcula un desplazamiento dependiendo de si la casilla es la 0 (salida) o cualquier otra
	const getOffset = (tileIndex: number) => {
		if (tileIndex === 0) return { x: props.playerIndex * 40, y: 0 };
		return { x: -15 + playerIdxOffSet[props.playerIndex].x, y: -30 + playerIdxOffSet[props.playerIndex].y };
	};

	useEffect(() => {
		cancelAnimation(animatedX);
		cancelAnimation(animatedY);
		const fromTile = currentTile.value;
		const toTile = props.targetTile;

		const pauseSound = () => runningEffect.pause();

		if (fromTile === toTile) {
			const targetPos = props.tilesCoords[toTile];
			const offset = getOffset(toTile);
			animatedX.value = targetPos.x + offset.x;
			animatedY.value = targetPos.y + offset.y;
			currentTile.value = toTile;
			runningEffect.pause();
			return;
		}
		runningEffect.seekTo(0);
		runningEffect.play();
		const targetPos = props.tilesCoords[toTile];
		if (!targetPos) {
			console.warn('[Player] targetPos undefined', {
				toTile,
				tilesCoordsLen: props.tilesCoords.length,
				playerId: props.playerId,
				targetTile: props.targetTile,
				initialTile: props.initialTile,
			});
			return;
		}
		const targetOffset = getOffset(toTile);

		isAnimating.value = true;

		animatedX.value = withTiming(targetPos.x + targetOffset.x, { duration: 500, easing: Easing.linear });
		animatedY.value = withTiming(targetPos.y + targetOffset.y, { duration: 500, easing: Easing.linear },
			(finished) => {
				'worklet';
				isAnimating.value = false;
				if (finished) {
					currentTile.value = toTile;
					runOnJS(pauseSound)();
					if (props.onMoveComplete) runOnJS(props.onMoveComplete)(toTile, props.playerId);
				}
			}
		);
	}, [props.targetTile, props.onMoveComplete, props.playerId, props.tilesCoords]);

	const animatedGProps = useAnimatedProps(() => {
		return {
			transform: [
				{ translateX: animatedX.value },
				{ translateY: animatedY.value },
				{ scale: props.scale },
			],
		};
	});

	return (
		<AnimatedG animatedProps={animatedGProps}>
			<Path d="M18.7 42.2 C19.5 40.2 22.3 40.1 23.2 42 L23.3 42.2 L38.4 78.8 C39 80.4 37.8 82.2 36 82.2 H5.9 C4.2 82.2 3 80.5 3.6 78.9 L3.6 78.8 L18.7 42.2 Z" fill={props.color.fill} stroke={props.color.border} strokeWidth={5} />
			<Ellipse cx="23" cy="23" rx="21" ry="20" fill={props.color.fill} stroke={props.color.border} strokeWidth={5} strokeLinecap='round' strokeLinejoin='round' />
			<Ellipse rx="3" ry="5" cx="16" cy="16" fill={props.color.eyes} />
			<Ellipse rx="3" ry="5" cx="29" cy="16" fill={props.color.eyes} />
			<Rect x={-8} y={-25} width={62} height={22} rx={10} ry={10} fill={props.color.fill} stroke={props.color.border} strokeWidth={3} />
			<SvgText fill={props.color.border} stroke='none' fontSize="14" fontWeight="bold" x="23" y="-9" textAnchor="middle">
				{playerInfo !== -1 ? playingUsers[playerInfo].username.length > 10 ? playingUsers[playerInfo].username.substring(0, 10) + '...' : playingUsers[playerInfo].username : '?'}
			</SvgText>
		</AnimatedG>
	);
}

export default Player