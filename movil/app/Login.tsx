import { useContextProvider } from '@/utils/ContextProvider';
import Icon from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator, Dimensions } from 'react-native';
import Svg, { Circle, G, Rect } from 'react-native-svg';
import Toast from 'react-native-toast-message';
import BottomDesign from '@/components/BottomDesign';
import Cube from '@/components/Cube';
import * as UIElements from '@/utils/ui-elements.json';
import { getHour } from '@/utils/utils';

export default function Login() {
   const router = useRouter();
   //const [layoutBottom, setLayoutBottom] = useState({x: 0, y: 0, width: 0, height: 0});
   const [showForgotPassword, setShowForgotPassword] = useState(false);
   const [isPasswordVisible, setIsPasswordVisible] = useState(false);
   const [identifier, setIdentifier] = useState('');
   const [password, setPassword] = useState('');
   const [loading, setLoading] = useState(false);
   const { setToken, apiURL, userRow, isDarkMode, fontScale } = useContextProvider();

   const loginUser = async () => {
      try {
         const InitCallHour = new Date();
         //console.log(`Login: API: ${apiURL}/login: Inicio llamada a las ${getHour(InitCallHour)}`)
         setLoading(true);
         const response = await fetch(apiURL + '/login', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               identifier: identifier,
               password: password,
            }),
         });
         const res = await response.json();
         const EndCallHour = new Date();
         //console.log(`API: ${apiURL}/login: Respuesta obtenida a las ${getHour(EndCallHour)}`)
         if (res.hasOwnProperty('token')) {
            setToken(res.token);
            if (userRow.is_admin)
               Toast.show({ type: 'info', text1: 'Login', text2: `API GET: Respuesta en ${EndCallHour.getTime() - InitCallHour.getTime()} ms`, position: "bottom", visibilityTime: 5000 });
            else
               Toast.show({ type: 'success', text1: 'Correcto', text2: `Acceso concedido`, position: 'top', visibilityTime: 2000 });
            router.replace('/Lobby');
         } else if (res.hasOwnProperty('message')) {
            Toast.show({ type: 'error', text1: 'Error', text2: `${res.message}`, position: 'top', visibilityTime: 3000 });
         }
      } catch (error) {
         Toast.show({ type: 'error', text1: 'Error', text2: `${error}`, position: 'top', visibilityTime: 3000 });
      }
      finally {
         setLoading(false);
      }
   }

   const sendCode = async () => {
      setLoading(true);
      await fetch(apiURL + '/send-reset-code', {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
         },
         body: JSON.stringify({
            identifier: identifier,
         }),
      })
         .then(response => response.json())
         .then(data => {
            //console.log(data)
            if (data.hasOwnProperty('email')) {
               Toast.show({ type: 'success', text1: 'Correcto', text2: `Código enviado a ${data.email}`, position: 'top', visibilityTime: 3000 });
               router.replace({
                  pathname: '/VerifyCode',
                  params: { identifier: identifier }
               });
            }
            else
               Toast.show({ type: 'error', text1: 'Error', text2: `${data.message}`, position: 'top', visibilityTime: 30 })
         })
         .catch(error => Toast.show({ type: 'error', text1: 'Error', text2: `${error}`, position: 'top', visibilityTime: 3000 }));
      setLoading(false);
   }


   return (
      <View style={[styles.container, { backgroundColor: isDarkMode ? '#3C709A' : '#6599c3' }]}>
         <View style={[styles.topBarContainer, { backgroundColor: isDarkMode ? '#1F3344' : 'white' }]}>
         </View>
         <View style={[styles.topContainer, { backgroundColor: isDarkMode ? '#1F3344' : 'white' }]}>
            <View style={[styles.backContainer, { backgroundColor: isDarkMode ? '#1F3344' : 'white' }]}>
               <TouchableOpacity onPress={() => router.back()} style={{ padding: 10 }}>
                  <Icon name='arrow-left' size={40} color={'#6599C3'} />
               </TouchableOpacity>
            </View>
            <View style={[styles.titleContainer, { backgroundColor: isDarkMode ? '#1F3344' : 'white' }]}>
               <Svg height='100%' width='100%'>
                  <G x={Dimensions.get('window').width * 0.7 / 2 - 88} y={0} scale={1}>
                     <Cube
                        x={0} y={0} scale={1}
                        colors={{
                           faceUp: isDarkMode ? '#3C709A' : '#6599c3',
                           faceLeft: isDarkMode ? '#578BB6' : '#78bdf6',
                           faceRight: isDarkMode ? '#578BB6' : '#78bdf6',
                           line: isDarkMode ? '#A7CFEB' : 'white'
                        }}
                        lineWidth={2}
                     />
                     {UIElements.start.circles.map((item, index) => {
                        item.fill = isDarkMode ? "#BFDEF7" : 'white';
                        return (<Circle {...item} key={index} />)
                     })}
                     <Rect x={0} y={105} width={275} height={40} fill={isDarkMode ? '#1F3344' : 'white'}></Rect>
                  </G>
               </Svg>
               <Text style={[styles.titleText, { color: isDarkMode ? '#578BB6' : '#6599c3' }]}>Bienvenido</Text>
            </View>
            <View style={styles.emptyContainer}></View>
         </View>

         {/* Conditional rendering based on showForgotPassword */}
         {!showForgotPassword ? (
            // Login Form
            <>
               <View style={[styles.fieldsContainer, { backgroundColor: isDarkMode ? '#1F3344' : 'white' }]}>
                  <TextInput placeholder="Usuario / Correo electrónico" placeholderTextColor={'#365C80'} value={identifier} onChangeText={setIdentifier} onEndEditing={() => setIdentifier(prev => prev.trim())}
                     style={[styles.fieldInput, identifier.length > 0 ? styles.fieldFilled : styles.fieldEmpty, { borderColor: isDarkMode ? '#A7CFEB' : '#294270', color: isDarkMode ? '#A7CFEB' : '#365C80', fontSize: 12 * fontScale }]}
                  />
                  <View style={[styles.fieldInput, styles.fieldPassword, { borderColor: isDarkMode ? '#A7CFEB' : '#294270' }]}>
                     <TextInput secureTextEntry={!isPasswordVisible} placeholder="Contraseña" placeholderTextColor={'#365C80'} value={password} onChangeText={setPassword}
                        style={[{ flex: 1, color: isDarkMode ? '#A7CFEB' : '#365C80', fontSize: 12 * fontScale }, password.length > 0 ? styles.fieldFilled : styles.fieldEmpty]}
                     />
                     <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                        <Icon name={isPasswordVisible ? 'eye-off' : 'eye'} size={24} color={'#6599C3'} />
                     </TouchableOpacity>
                  </View>

                  <TouchableOpacity style={styles.forgotPassButton} onPress={() => setShowForgotPassword(true)}>
                     <Text style={[styles.forgotPassText, { fontSize: 12 * fontScale, color: isDarkMode ? '#578BB6' : '#365C80' }]}>¿Olvidaste tu contraseña?</Text>
                  </TouchableOpacity>
               </View>

               <View style={[styles.buttonContainer, { backgroundColor: isDarkMode ? '#1F3344' : 'white' }]}>
                  {loading && (<ActivityIndicator size='large' color="#6599C3" />)}
                  {!loading && (
                     <TouchableOpacity style={[styles.loginButton, { backgroundColor: isDarkMode ? '#3C709A' : '#6599C3' }]} onPress={loginUser}>
                        <Text style={[styles.loginText, { fontSize: 20 * fontScale, color: isDarkMode ? '#1F3344' : 'white' }]}>Entrar</Text>
                     </TouchableOpacity>)}
               </View>
            </>
         ) : (
            // Forgot Password - Enter Identifier Form
            <>
               <View style={[styles.fieldsContainer, { backgroundColor: isDarkMode ? '#1F3344' : 'white' }]}>
                  <Text style={[styles.forgotPassTitle, { color: isDarkMode ? '#578BB6' : '#365C80' }]}>Recuperar Contraseña</Text>
                  <Text style={[styles.forgotPassDescription, { fontSize: 12 * fontScale, color: isDarkMode ? '#578BB6' : '#365C80' }]}>
                     Ingresa tu nombre de usuario o correo electrónico para recibir un código de verificación.
                  </Text>
                  <TextInput placeholder="Usuario / Correo electrónico" placeholderTextColor={'#365C80'} value={identifier} onChangeText={setIdentifier} onEndEditing={() => setIdentifier(prev => prev.trim())}
                     style={[styles.fieldInput, identifier.length > 0 ? styles.fieldFilled : styles.fieldEmpty, { borderColor: isDarkMode ? '#578BB6' : '#294270', color: isDarkMode ? 'white' : '#365C80', fontSize: 12 * fontScale }]}></TextInput>
               </View>
               <View style={[styles.buttonContainer, { backgroundColor: isDarkMode ? '#1F3344' : 'white' }]}>
                  {loading && (<ActivityIndicator size='large' color="#6599C3" />)}
                  {!loading && (<TouchableOpacity style={[styles.loginButton, { backgroundColor: isDarkMode ? '#3C709A' : '#6599C3' }]} onPress={sendCode}>
                     <Text style={[styles.loginText, { fontSize: 14 * fontScale, color: isDarkMode ? '#1F3344' : 'white' }]}>Enviar Código</Text>
                     <Icon name={'mail'} size={24} color={isDarkMode ? '#1F3344' : 'white'} />
                  </TouchableOpacity>)}
                  <TouchableOpacity style={styles.forgotPassButton} onPress={() => setShowForgotPassword(false)}>
                     <Text style={[styles.forgotPassText, { fontSize: 12 * fontScale, color: isDarkMode ? '#578BB6' : '#365C80' }]}>Volver a Iniciar Sesión</Text>
                  </TouchableOpacity>
               </View>
            </>
         )}
         <BottomDesign allowRanking={false} />
      </View>
   )
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
      alignItems: 'center',
   },
   topBarContainer: {
      flex: 5,
      width: '100%',
      height: '100%',
   },
   titleContainer: {
      flex: 65,
      height: '100%',
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
   },
   topContainer: {
      flex: 25,
      flexDirection: 'row',
   },
   titleText: {
      fontSize: 55,
      color: '#6599c3',
      fontFamily: 'Jomhuria_400Regular',
      position: 'absolute',
      top: 80,
      textAlign: 'center',
   },
   fieldsContainer: {
      height: '100%',
      width: '100%',
      flex: 30,
      paddingHorizontal: '7%',
      justifyContent: 'center',
      rowGap: 30,
      columnGap: 10,

   },
   buttonContainer: {
      flex: 20,
      height: '100%',
      width: '100%',
      paddingHorizontal: '10%',
      justifyContent: 'flex-start',
      gap: 50,
   },
   backContainer: {
      flex: 15
   },
   emptyContainer: {
      flex: 15
   },
   fieldInput: {
      borderWidth: 1.3,
      borderStyle: 'solid',
      borderRadius: 10,
      paddingHorizontal: 10,
   },
   fieldPassword: {
      borderWidth: 1.3,
      flexDirection: 'row',
      alignItems: 'center',
   },
   fieldFilled: {
      fontFamily: 'Manrope_600SemiBold',
   },
   fieldEmpty: {
      fontFamily: 'Manrope_400Regular'
   },
   loginButton: {
      alignSelf: 'center',
      width: '70%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-evenly',
      borderRadius: 10,
      paddingInline: 10,
   },
   loginText: {
      fontFamily: 'Manrope_800ExtraBold'
   },
   forgotPassButton: {
      marginTop: -10,
      alignSelf: 'flex-end',
   },
   forgotPassText: {
      fontFamily: 'Manrope_800ExtraBold',
      borderBottomColor: '#365C80',
      borderBottomWidth: 2
   },
   forgotPassTitle: {
      fontSize: 24,
      fontFamily: 'Manrope_700Bold',
      textAlign: 'center',
   },
   forgotPassDescription: {
      fontFamily: 'Manrope_400Regular',
      textAlign: 'center',
   }
})
