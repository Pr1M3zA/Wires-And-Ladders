import React, { FC, useState, useEffect } from 'react';
import Svg, { G, Polygon, Circle, Rect } from 'react-native-svg';
import Animated, {
    useSharedValue,
    useAnimatedProps,
    withTiming,
    withRepeat,
    cancelAnimation,
    Easing,
} from 'react-native-reanimated';
import * as gameItems from '@/utils/gameitems.json';

type Point = { x: number; y: number };
interface diceProps {
    initialValue: number;
    onSpinComplete: (finalValue: number) => void;
    position: Point;
    scale: number;
    colors: { faceUpColor: string, faceLeftColor: string, faceRightColor: string, line: string, dots: string };
    lineWidth: number;
    isAnimated?: boolean;
    autoSpin?: boolean;
}

const AnimatedG = Animated.createAnimatedComponent(G);

const Dice: FC<diceProps> = (props) => {
    const [diceValue, setDiceValue] = useState(props.initialValue);
    const [diceRolling, setDiceRolling] = useState(false);
    const rotation = useSharedValue(0);
    const [diceDots, setDiceDots] = useState(props.isAnimated ? gameItems.diceValues[diceValue - 1] : gameItems.diceDotFaceUp[diceValue - 1]);

    useEffect(() => {
        setDiceDots(props.isAnimated ? gameItems.diceValues[diceValue - 1] : gameItems.diceDotFaceUp[diceValue - 1])
    }, [diceValue]);

    const diceClicked = () => {
        if (!diceRolling && props.isAnimated) {
            setDiceRolling(true);
            rotation.value = withRepeat(
                withTiming(360, { duration: 500, easing: Easing.linear }),
                -1,
                false
            );
        } else {
            cancelAnimation(rotation);
            setDiceRolling(false);
            const newDiceValue = Math.floor(Math.random() * 6) + 1;
            setDiceValue(newDiceValue)
            rotation.value = 0;
            props.onSpinComplete(newDiceValue)
        }
    };

    useEffect(() => {
        if (!props.autoSpin || diceRolling) return;
        const startSpin = () => {
            setDiceRolling(true);
            rotation.value = withRepeat(
                withTiming(360, { duration: 500, easing: Easing.linear }),
                -1,
                false
            );
        };
        const stopAndComplete = () => {
            cancelAnimation(rotation);
            setDiceRolling(false);
            const newDiceValue = Math.floor(Math.random() * 6) + 1;
            setDiceValue(newDiceValue);
            rotation.value = 0;
            props.onSpinComplete(newDiceValue);
        };
        const t1 = setTimeout(startSpin, 500);
        const t2 = setTimeout(stopAndComplete, 2000);
        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, [props.autoSpin]);

    const faceUp = "39,44, 0,22 39,0 78,22";
    const faceLeft = "39,44 0,22 0,70 39,92";
    const faceRight = "39,44 78,22 78,70 39,92";
    const centerX = 39;
    const centerY = 46;

    const animatedProps = useAnimatedProps(() => {
        return {
            transform: [
                { translateX: props.position.x + centerX },
                { translateY: props.position.y + centerY },
                { rotate: `${rotation.value}deg` },
                { translateX: -centerX },
                { translateY: -centerY },
                { scale: props.scale }
            ],
        };
    });

    useEffect(() => {
        return () => {
            cancelAnimation(rotation);
        };
    }, [rotation]);

    return (
        <AnimatedG animatedProps={animatedProps} >
            <Polygon points={faceUp} fill={props.colors.faceUpColor} stroke={props.colors.line} strokeWidth={props.lineWidth} onPressIn={diceClicked} />
            <Polygon points={faceLeft} fill={props.colors.faceLeftColor} stroke={props.colors.line} strokeWidth={props.lineWidth} onPressIn={diceClicked} />
            <Polygon points={faceRight} fill={props.colors.faceRightColor} stroke={props.colors.line} strokeWidth={props.lineWidth} onPressIn={diceClicked} />
            {diceDots.map((point, index) => (
                <Circle key={index} cx={point.x} cy={point.y} r={5} fill={diceRolling ? 'transparent' : props.colors.dots} />
            ))}
            <Rect x={0} y={0} width={78} height={92} fill="transparent" onPressIn={diceClicked} />
        </AnimatedG>
    );
}

export default Dice;