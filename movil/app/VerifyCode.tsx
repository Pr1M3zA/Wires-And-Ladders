import { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator, Keyboard, Switch } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import Icon from '@expo/vector-icons/MaterialIcons';
import { useContextProvider } from '@/utils/ContextProvider';
import BottomDesign from '@/components/BottomDesign';

export default function VerifyCode() {
   const router = useRouter();
   const params = useLocalSearchParams<{ identifier: string }>();
   const { apiURL, isDarkMode, fontScale } = useContextProvider();

   const identifier = params.identifier; // Username or Email
   const [code, setCode] = useState('');
   const [loading, setLoading] = useState(false);

   const verifyCode = async () => {
      Keyboard.dismiss(); // Hide keyboard
      setLoading(true);
      await fetch(apiURL + '/verify-reset-code', {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
         },
         body: JSON.stringify({
            identifier: identifier,
            code: code,
         }),
      })
         .then(response => response.json())
         .then(data => {
            if (data.hasOwnProperty('token')) {
               Toast.show({ type: 'success', text1: 'Correcto', text2: 'Código verificado con éxito.', position: 'top', visibilityTime: 2000 });
               router.replace({
                  pathname: '/ResetPassword',
                  params: { verificationToken: data.token } // 
               });
            }
            else
               Toast.show({ type: 'error', text1: 'Error', text2: `${data.message}`, position: 'top', visibilityTime: 3000 });
         })
         .catch(error => Toast.show({ type: 'error', text1: 'Error', text2: `${error}`, position: 'top', visibilityTime: 3000 }));
      setLoading(false);
   }



   return (
      <View style={[styles.container, { backgroundColor: isDarkMode ? '#3C709A' : '#6599c3' }]}>
         <View style={[styles.topBarContainer, { backgroundColor: isDarkMode ? '#1F3344' : 'white' }]}></View>
         <View style={[styles.topContainer, { backgroundColor: isDarkMode ? '#1F3344' : 'white' }]}>
            <View style={styles.backContainer}>
               <TouchableOpacity onPress={() => router.back()} style={{ padding: 10 }}>
                  <Icon name='close' size={40} color={'#6599C3'} />
               </TouchableOpacity>
            </View>
            <View style={styles.titleContainer}>
               <Text style={[styles.titleText, { color: isDarkMode ? '#578BB6' : '#6599c3' }]}>Verificar Código</Text>
            </View>
            <View style={styles.emptyContainer}>

            </View>
         </View>

         <View style={[styles.contentContainer, { backgroundColor: isDarkMode ? '#1F3344' : 'white' }]}>
            <Text style={[styles.descriptionText, { fontSize: 16 * fontScale, color: isDarkMode ? '#578BB6' : '#365C80' }]}>
               Hemos enviado un código de 5 letras mayúsculas a tu correo electrónico.
               Por favor, ingrésalo a continuación:
            </Text>

            <View style={styles.singleCodeInputContainer}>
               <TextInput
                  style={[styles.singleCodeInputBox, { color: isDarkMode ? 'white' : '#365C80', fontSize: 30 * fontScale }]}
                  value={code}
                  onChangeText={(text) => setCode(text.toUpperCase())} // Convertir a mayúsculas directamente
                  maxLength={5}
                  keyboardType="default"
                  autoCapitalize="characters" // Asegura mayúsculas
                  textAlign="center"
                  caretHidden={true} // Hide cursor
               />
            </View>

            <TouchableOpacity style={styles.resendButton}>
               <Text style={[styles.resendText, { fontSize: 14 * fontScale, color: isDarkMode ? '#578BB6' : '#365C80' }]}>Reenviar Código</Text>
            </TouchableOpacity>

         </View>

         <View style={[styles.buttonContainer, { backgroundColor: isDarkMode ? '#1F3344' : 'white' }]}>
            {loading && code.length !== 5 && (<ActivityIndicator size='large' color="#6599C3" />)}
            {!loading && code.length === 5 && (
               <TouchableOpacity style={[styles.verifyButton, { backgroundColor: isDarkMode ? '#3C709A' : '#6599C3' }]} onPress={verifyCode} disabled={code.length !== 5}>
                  <Text style={[styles.verifyText, { fontSize: 18 * fontScale, color: isDarkMode ? '#1F3344' : 'white' }]}>Verificar</Text>
               </TouchableOpacity>)}
         </View>

         <BottomDesign allowRanking={false} />

      </View>
   )
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
   },
   topBarContainer: {
      flex: 5,
   },
   topContainer: {
      flex: 15,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 10,
   },
   backContainer: {
      flex: 10,
      justifyContent: 'center',
   },
   titleContainer: {
      flex: 30,
      alignItems: 'center',
   },
   titleText: {
      fontSize: 28,
      fontFamily: 'Manrope_700Bold',
      textAlign: 'center',
   },
   emptyContainer: {
      flex: 10,
   },
   contentContainer: {
      flex: 60,
      paddingHorizontal: '7%',
      justifyContent: 'center',
      alignItems: 'center',
      rowGap: 30,
   },
   descriptionText: {
      fontFamily: 'Manrope_400Regular',
      textAlign: 'center',
      marginBottom: 20,
   },
   singleCodeInputContainer: {
      width: '100%',
      maxWidth: 300,
      alignItems: 'center',
   },
   singleCodeInputBox: {
      width: '80%',
      height: 60,
      borderWidth: 2,
      borderColor: '#6599C3',
      borderRadius: 8,
      letterSpacing: 10, // Espacio entre letras para simular casillas
      paddingHorizontal: 10, // Añadir padding horizontal
      fontFamily: 'Manrope_800ExtraBold',
      padding: 0, // Remove default padding
      textAlignVertical: 'center', // Center text vertically
   },
   resendButton: {
      marginTop: 10,
   },
   resendText: {
      fontFamily: 'Manrope_800ExtraBold',
      borderBottomColor: '#365C80',
      borderBottomWidth: 1, // Slightly thinner underline
   },
   buttonContainer: {
      flex: 15, // Button area
      paddingHorizontal: '10%',
      justifyContent: 'center',
      backgroundColor: '#FFFFFF',
   },
   verifyButton: {
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
      paddingVertical: 12, // Adjusted padding
   },
   buttonDisabled: { // Estilo para botón deshabilitado
      backgroundColor: '#B0C4DE',
      borderColor: '#B0C4DE',
   },
   verifyText: {
      fontFamily: 'Manrope_800ExtraBold',
   },
});