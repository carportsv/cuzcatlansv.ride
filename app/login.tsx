import { useAuth } from '@/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Alert,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import CountryPicker, { Country, getCallingCode } from 'react-native-country-picker-modal';
import ModalVerificacion from '../app/ModalVerificacion';
import GoogleSignInButton from '../src/services/GoogleSignInButton';

const dropDown = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAi0lEQVRYR+3WuQ6AIBRE0eHL1T83FBqU5S1szdiY2NyTKcCAzU/Y3AcBXIALcIF0gRPAsehgugDEXnYQrUC88RIgfpuJ+MRrgFmILN4CjEYU4xJgFKIa1wB6Ec24FuBFiHELwIpQxa0ALUId9wAkhCmuBdQQ5ngP4I9wxXsBDyJ9m+8y/g9wAS7ABW4giBshQZji3AAAAABJRU5ErkJggg==";

interface CustomPhoneInputProps {
  defaultValue?: string;
  defaultCode?: string;
  layout?: 'first' | 'second';
  onChangeFormattedText?: (text: string) => void;
  containerStyle?: ViewStyle;
  textContainerStyle?: ViewStyle;
  textInputProps?: TextInputProps;
  codeTextStyle?: TextStyle;
  disabled?: boolean;
  withShadow?: boolean;
  withDarkTheme?: boolean;
  autoFocus?: boolean;
  placeholder?: string;
  disableArrowIcon?: boolean;
  flagButtonStyle?: ViewStyle;
  renderDropdownImage?: React.ReactNode;
  countryPickerProps?: any;
  filterProps?: any;
  countryPickerButtonStyle?: ViewStyle;
}

// Componente PhoneInput actualizado
const CustomPhoneInput = React.forwardRef<TextInput, CustomPhoneInputProps>(({
  defaultValue = '',
  defaultCode = 'SV',
  layout = 'first',
  onChangeFormattedText,
  containerStyle,
  textContainerStyle,
  textInputProps = {},
  codeTextStyle = {},
  disabled = false,
  withShadow = false,
  withDarkTheme = false,
  autoFocus = false,
  placeholder = 'Phone Number',
  disableArrowIcon = false,
  flagButtonStyle,
  renderDropdownImage,
  countryPickerProps = {},
  filterProps = {},
  countryPickerButtonStyle,
}, ref) => {
  const [phoneNumber, setPhoneNumber] = useState(defaultValue);
  const [countryCode, setCountryCode] = useState<Country['cca2']>(defaultCode as Country['cca2']);
  const [modalVisible, setModalVisible] = useState(false);
  const [callingCode, setCallingCode] = useState('');

  React.useEffect(() => {
    const loadCallingCode = async () => {
      const code = await getCallingCode(countryCode);
      setCallingCode(code);
    };
    loadCallingCode();
  }, [countryCode]);

  const handleChangeText = (text: string) => {
    setPhoneNumber(text);
    if (onChangeFormattedText) {
      onChangeFormattedText(text);
    }
  };

  const onSelect = (country: Country) => {
    setCountryCode(country.cca2);
    setCallingCode(country.callingCode[0]);
  };

  // Métodos de validación
  const isValidNumber = (number: string) => {
    const phoneNumber = number.replace(/\D/g, '');
    return phoneNumber.length >= 8;
  };

  const getNumberAfterPossiblyEliminatingZero = () => {
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    const formattedNumber = `+${callingCode}${cleanNumber}`;
    return {
      formattedNumber,
      number: cleanNumber,
      countryCode: countryCode,
      callingCode: callingCode
    };
  };

  // Exponer métodos al ref
  React.useImperativeHandle(ref, () => ({
    isValidNumber,
    getNumberAfterPossiblyEliminatingZero,
    ...(ref as any)?.current
  }));

  return (
    <View style={[styles.phoneContainer, containerStyle]}>
      <TouchableOpacity
        style={[styles.flagButton, flagButtonStyle, countryPickerButtonStyle]}
        onPress={() => setModalVisible(true)}
        disabled={disabled}
      >
        <CountryPicker
          onSelect={onSelect}
          withEmoji
          withFilter
          withFlag
          filterProps={filterProps}
          countryCode={countryCode}
          withCallingCode
          disableNativeModal={disabled}
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          {...countryPickerProps}
        />
        {!disableArrowIcon && (
          <Image
            source={{ uri: dropDown }}
            resizeMode="contain"
            style={styles.dropDownImage}
          />
        )}
      </TouchableOpacity>
      <View style={[styles.textContainer, textContainerStyle]}>
        {callingCode && (
          <Text style={[styles.codeText, codeTextStyle]}>{`+${callingCode}`}</Text>
        )}
        <TextInput
          ref={ref}
          style={[styles.textInput, textInputProps.style]}
          value={phoneNumber}
          onChangeText={handleChangeText}
          placeholder={placeholder}
          editable={!disabled}
          autoFocus={autoFocus}
          keyboardType="number-pad"
          {...textInputProps}
        />
      </View>
    </View>
  );
});

export default function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [confirmResult, setConfirmResult] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const phoneInput = useRef<any>(null);
  const router = useRouter();
  const { login, verifyCode, isAuthenticated, user } = useAuth();

  // Chequeo automático de sesión persistente
  React.useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') router.replace('/admin/admin_home');
      else if (user.role === 'driver') router.replace('/driver/driver_home');
        else router.replace('/user/user_home');
      }
  }, [isAuthenticated, user]);

  const handleSendCode = async () => {
    try {
      const isValid = phoneInput.current?.isValidNumber(phoneNumber);
      if (!isValid) {
        Alert.alert('Número inválido', 'Por favor ingresa un número válido.');
        return;
      }
      const formatted = phoneInput.current?.getNumberAfterPossiblyEliminatingZero();
      if (!formatted?.formattedNumber) {
        Alert.alert('Error', 'No se pudo obtener el número formateado.');
        return;
      }

      // Usar el servicio de autenticación real
      const confirmation = await login(formatted.formattedNumber);
      setConfirmResult(confirmation);
      setShowModal(true);
      
    } catch (error: any) {
      console.error('Error al enviar el código:', error);
      Alert.alert('Error', error.message || 'No se pudo enviar el código.');
    }
  };

  const handleVerificationSuccess = async (uid: string) => {
    try {
      // Obtener el rol del usuario desde el contexto de autenticación
      const userRole = user?.role || 'user';
      await AsyncStorage.setItem('userUID', uid);
      await AsyncStorage.setItem('userRole', userRole);
      
      // Navegar según el rol
      if (userRole === 'admin') {
        router.replace('/admin/admin_home');
      } else if (userRole === 'driver') {
        router.replace('/driver/driver_home');
      } else {
        router.replace('/user/user_home');
      }
    } catch (error) {
      console.error('Error verificando rol:', error);
      Alert.alert('Error', 'No se pudo verificar el rol del usuario.');
    }
  };

  const handleVerifyCode = async (code: string) => {
    try {
      if (!confirmResult) {
        Alert.alert('Error', 'No hay confirmación pendiente.');
        return;
      }

      await verifyCode(confirmResult, code);
      setShowModal(false);
      setConfirmResult(null);
      
      // La navegación se manejará automáticamente en el useEffect
      
    } catch (error: any) {
      console.error('Error verificando código:', error);
      Alert.alert('Error', error.message || 'Código inválido.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Text style={styles.title}>Iniciar Sesión</Text>
      <CustomPhoneInput
        ref={phoneInput}
        defaultValue={phoneNumber}
        defaultCode="SV"
        onChangeFormattedText={(text: string) => setPhoneNumber(text)}
        containerStyle={styles.phoneContainer}
        textContainerStyle={styles.textInput}
        textInputProps={{
          placeholderTextColor: '#A3A3A3',
          style: { color: '#18181B' },
        }}
        codeTextStyle={{ color: '#18181B' }}
      />
      <TouchableOpacity style={styles.button} onPress={handleSendCode}>
        <Text style={styles.buttonText}>Enviar código de verificación</Text>
      </TouchableOpacity>
      <GoogleSignInButton onSuccess={() => router.replace('/user/user_home')} />
      
      <ModalVerificacion
        visible={showModal}
        onClose={() => {
          setShowModal(false);
          setConfirmResult(null);
        }}
        onVerify={handleVerifyCode}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2563EB',
    marginBottom: 32,
  },
  phoneContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    marginBottom: 16,
  },
  flagButton: {
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropDownImage: {
    width: 12,
    height: 12,
    marginLeft: 5,
  },
  textContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  codeText: {
    fontSize: 16,
    color: '#18181B',
    marginRight: 5,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    height: 44,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#18181B',
  },
  button: {
    backgroundColor: '#2563EB',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  googleButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#2563EB',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    width: '100%',
  },
  googleButtonText: {
    color: '#2563EB',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
