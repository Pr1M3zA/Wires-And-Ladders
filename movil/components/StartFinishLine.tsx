import { FC, memo, useId } from "react";
import { G, Rect, Defs, Pattern } from "react-native-svg";
import { useContextProvider } from '@/utils/ContextProvider';

type StartFinishLineProps = {
	pos: { x: number; y: number; };
	size: { width: number; height: number; };
	tileType: number;
	titleText: string;
};

const StartFinishLine: FC<StartFinishLineProps> = (props) => {
	const { tileTypes } = useContextProvider();
	const tileTypeData = tileTypes.find(t => t.id === props.tileType);
	if (!tileTypeData) return null;

	const rawId = useId();
	const patternId = `sfl-m-pattern-${rawId.replace(/:/g, '')}-${Math.round(props.pos.x)}-${Math.round(props.pos.y)}`;
	const squareSide = props.size.height / 3;
	const numSquareInLine = ~~(props.size.width / squareSide) + 1;
	const adjustedWidth = numSquareInLine * squareSide;

	return (
		<G style={{ elevation: 0, zIndex: 0 }}>
			<Defs>
				<Pattern id={patternId} x={props.pos.x} y={props.pos.y} width={squareSide * 2} height={props.size.height} patternUnits="userSpaceOnUse">
					<Rect width={squareSide * 2} height={props.size.height} fill="white" />
					<Rect x={0} y={0} width={squareSide} height={squareSide} fill={tileTypeData.color_fill} />
					<Rect x={squareSide} y={squareSide} width={squareSide} height={squareSide} fill={tileTypeData.color_fill} />
					<Rect x={0} y={squareSide * 2} width={squareSide} height={squareSide} fill={tileTypeData.color_fill} />
				</Pattern>
			</Defs>

			<Rect x={props.pos.x} y={props.pos.y} width={adjustedWidth} height={props.size.height} fill={`url(#${patternId})`} stroke={tileTypeData.color_border} strokeWidth={2} />
		</G>
	);
};

export default memo(StartFinishLine);
