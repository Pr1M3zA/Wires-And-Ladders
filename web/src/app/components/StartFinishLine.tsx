
type StartFinishLineProps = {
   pos: { x: number; y: number; };
   size: { width: number; height: number; }
   color: { fill: string, border: string, }
   //tileType: number;
   //titleText: string;
}

const StartFinishLine: React.FC<StartFinishLineProps> = (props) => {
   //const { tileTypes } = useContextProvider();
   const squareSide = props.size.height / 3;
   const numSquareInLine = ~~(props.size.width / squareSide) + 1;
   const adjustedWidth = numSquareInLine * squareSide;


   return (
      <g style={{ zIndex: 0 }} width={adjustedWidth} height={props.size.height}>
         <rect x={props.pos.x} y={props.pos.y} width={adjustedWidth} height={props.size.height} stroke={props.color.border} strokeWidth={2} fill="none" />
         {/* Arreglo de numeros para pintar los cuadritos */}
         {Array.from({ length: numSquareInLine }, (_, i) => i).map(col => {
            return (
               <g key={col}>
                  <rect x={props.pos.x + col * squareSide} y={props.pos.y} width={squareSide} height={squareSide} fill={col % 2 === 0 ? props.color.fill : 'white'} />
                  <rect x={props.pos.x + col * squareSide} y={props.pos.y + squareSide} width={squareSide} height={squareSide} fill={col % 2 !== 0 ? props.color.fill : 'white'} />
                  <rect x={props.pos.x + col * squareSide} y={props.pos.y + squareSide * 2} width={squareSide} height={squareSide} fill={col % 2 === 0 ? props.color.fill : 'white'} />
               </g>
            );
         })}
         {/*
         <SvgText x={props.pos.x + adjustedWidth / 2} y={props.pos.y + squareSide*2} textAnchor="middle" fontSize={60} fill={tileTypes[props.tileType].color_border} fontFamily="Jomhuria_400Regular" letterSpacing={20}>
            {props.titleText}
         </SvgText>
         */}
      </g>
   )
};
/*
const styles = StyleSheet.create({
   titleContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#6599C3',
      width: '100%',
      height: '100%',
   },
   title: {
      fontFamily: 'Jomhuria_400Regular',
      fontSize: 25,
      includeFontPadding: false,
      textAlignVertical: 'center',
      textAlign: 'center',
      color: 'red',
      letterSpacing: 10,
   }
})
*/
export default StartFinishLine;