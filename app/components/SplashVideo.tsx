import { useEffect, useRef, useState } from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';
import Video from 'react-native-video';

const { width, height } = Dimensions.get('window');

interface SplashVideoProps {
  onVideoEnd: () => void;
}

export default function SplashVideo({ onVideoEnd }: SplashVideoProps) {
  const videoRef = useRef<any>(null);
  const [hasError, setHasError] = useState(false);
  const [ended, setEnded] = useState(false);

  const handleVideoEnd = () => {
    if (!ended) {
      setEnded(true);
      onVideoEnd();
    }
  };

  const handleVideoError = (error: any) => {
    console.log('Video error:', error);
    setHasError(true);
    setTimeout(() => {
      if (!ended) {
        setEnded(true);
        onVideoEnd();
      }
    }, 2000);
  };

  // Timeout de seguridad - si el video no termina en 7 segundos, continuar
  useEffect(() => {
    const safetyTimeout = setTimeout(() => {
      if (!ended) {
        console.log('Safety timeout - continuing without video');
        setEnded(true);
        onVideoEnd();
      }
    }, 7000);
    return () => clearTimeout(safetyTimeout);
  }, [onVideoEnd, ended]);

  return (
    <View style={styles.container}>
      {!hasError ? (
        <Video
          ref={videoRef}
          source={require('../../assets/videos/cuzcatlansv.ride.mp4')}
          style={styles.video}
          resizeMode="contain"
          onEnd={handleVideoEnd}
          onError={handleVideoError}
          repeat={false}
          playInBackground={false}
          playWhenInactive={false}
          ignoreSilentSwitch="ignore"
          muted={false}
          volume={1.0}
          paused={false}
          rate={1.0}
        />
      ) : (
        <View style={styles.fallback}>
          <Image 
            source={require('../../assets/images/cuzcatlansv.png')}
            style={styles.fallbackImage}
            resizeMode="contain"
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2563EB', // Color de fondo de tu app
  },
  video: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  fallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2563EB',
  },
  fallbackImage: {
    width: width * 0.6, // 60% del ancho de la pantalla
    height: height * 0.3, // 30% del alto de la pantalla
  },
}); 