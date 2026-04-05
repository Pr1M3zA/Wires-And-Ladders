import {FC, memo} from 'react';
import { G, Rect, Path } from 'react-native-svg'

type Point = { x: number; y: number };
interface ribbonProps {
    pos: Point
    scale: number,
    color: { front: string; back: string; }
}

const Ribbon: FC<ribbonProps> = (props) => {
    return (
        <G x={props.pos.x} y={props.pos.y} scale={props.scale}>
            <Rect x="37" y="0" width="180" height="40" fill={props.color.front} />
            <Path d="M0 10 H36 V40 Q36 50 44 50 H0 L18 30 Z" fill={props.color.front} />
            <Path d="M219 10 H255 L238 30 L255 50 H214 Q219 50 219 40 Z" fill={props.color.front} />
            <Path d="M37 41 Q37 50 55 50 V41 Z" fill={props.color.back} />
            <Path d="M217 41 Q217 50 200 50 V41 Z" fill={props.color.back} />
        </G>
    );
}  

export default memo(Ribbon);