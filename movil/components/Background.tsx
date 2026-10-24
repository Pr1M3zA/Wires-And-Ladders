import { Path, G, Defs, Use, Rect, Pattern } from 'react-native-svg';
import React, { FC, memo } from 'react';

interface BackgroundProps {
    width: number; height: number; patternWidth: number; patternHeight: number;
    colors: { color1: string; color2: string; color3: string; }
    svgPath1: string; svgPath2: string;
}

const Background: FC<BackgroundProps> = props => {
    return (
        <G>
            <Defs>
                <Pattern id={"background"} patternUnits="userSpaceOnUse" width={props.patternWidth} height={props.patternHeight}>
                    <Rect width={props.patternWidth} height={props.patternHeight} fill={props.colors.color1} />
                    <Path d={props.svgPath1} fill={props.colors.color2} />
                    <Path d={props.svgPath2} fill={props.colors.color3} />
                </Pattern>
            </Defs>
            <Rect fill="url(#background)" x="0" y="0" width={props.width} height={props.height} />
        </G>
    )
}

export default memo(Background);
