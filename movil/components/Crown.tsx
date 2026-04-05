import { FC, memo } from 'react';
import { G, Circle, Path, Defs, RadialGradient, Stop } from 'react-native-svg'

type Point = { x: number; y: number };
interface crownProps {
   pos: Point
   scale: number,
   gradientColor: { from: string; to: string; }
}

const Crown: FC<crownProps> = (props) => {
   return (
      <G x={props.pos.x} y={props.pos.y} scale={props.scale}>
         <Defs>
            <RadialGradient id="grad1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
               <Stop offset="0%" stopColor={props.gradientColor.to} />
               <Stop offset="100%" stopColor={props.gradientColor.from} />
            </RadialGradient>
         </Defs>
         {/* Crown shape based on a simple polygon with circles on top for jewels (370 x 265)*/}
         <Path d="M85 265 H285 L345 60 L245 165 L185 50 L125 165 L25 60 Z" fill="url(#grad1)" />
         <Circle cx="358" cy="38" r="12" fill="url(#grad1)" />
         <Circle cx="12" cy="38" r="12" fill="url(#grad1)" />
         <Circle cx="185" cy="12" r="12" fill="url(#grad1)" />
      </G>
   );
}

export default memo(Crown);