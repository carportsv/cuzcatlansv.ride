import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useEffect } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

const WEB_CLIENT_ID = '570692523770-biobs3j5fadlb0h8ahqc0j7k7jrj66zt7.apps.googleusercontent.com';

export default function GoogleSignInButton({ onSuccess }: { onSuccess?: (token: string) => void }) {
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: WEB_CLIENT_ID,
    androidClientId: WEB_CLIENT_ID, // Puedes poner el clientId de Android si lo tienes, si no, usa el web
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (onSuccess && authentication?.accessToken) {
        onSuccess(authentication.accessToken);
      } else {
        Alert.alert('Éxito', 'Autenticación con Google exitosa');
      }
    }
  }, [response]);

  return (
    <TouchableOpacity
      style={[styles.googleButton, !request && styles.disabled]}
      onPress={() => promptAsync()}
      disabled={!request}
      activeOpacity={0.7}
    >
      <View style={styles.innerContainer}>
        <Image source={require('../../assets/images/google_sig.png')} style={styles.googleLogo} />
        <Text style={styles.googleButtonText}>Continuar con Google</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
    marginTop: 8,
    marginBottom: 8,
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleLogo: {
    width: 24,
    height: 24,
    marginRight: 12,
    resizeMode: 'contain',
  },
  googleButtonText: {
    color: '#2563EB',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabled: {
    opacity: 0.5,
  },
}); 