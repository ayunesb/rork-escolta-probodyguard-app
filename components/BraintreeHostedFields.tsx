import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import Colors from '@/constants/colors';
import { ENV } from '@/config/env';

interface BraintreeHostedFieldsProps {
  clientToken: string;
  onSuccess: (nonce: string, cardDetails: CardDetails) => void;
  onError: (error: string) => void;
  onReady?: () => void;
}

export interface CardDetails {
  cardType: string;
  lastFour: string;
  lastTwo: string;
}

export interface BraintreeHostedFieldsHandle {
  submitPayment: () => void;
}

const BraintreeHostedFields = forwardRef<BraintreeHostedFieldsHandle, BraintreeHostedFieldsProps>(
  ({ clientToken, onSuccess, onError, onReady }, ref) => {
    const webViewRef = useRef<WebView>(null);
    const [loading, setLoading] = useState(true);
    const [pageLoaded, setPageLoaded] = useState(false);
    
    const hostedFieldsUrl = `${ENV.API_URL}/payments/hosted-fields-page`;
    
    console.log('[BraintreeHostedFields] Component mounted');
    console.log('[BraintreeHostedFields] URL:', hostedFieldsUrl);
    
    useEffect(() => {
      // Initialize hosted fields once page is loaded
      if (pageLoaded && clientToken) {
        console.log('[BraintreeHostedFields] Sending initialize message');
        const message = JSON.stringify({
          action: 'initialize',
          clientToken: clientToken
        });
        
        console.log('[BraintreeHostedFields] Posting initialize message');
        webViewRef.current?.postMessage(message);
      }
    }, [pageLoaded, clientToken]);
    
    const handleMessage = (event: any) => {
      let data;
      try {
        data = JSON.parse(event.nativeEvent.data);
        console.log('[BraintreeHostedFields] Message received:', data.type);
      } catch (e) {
        console.error('[BraintreeHostedFields] Failed to parse message:', e);
        return;
      }
      
      switch (data.type) {
        case 'loaded':
          console.log('[BraintreeHostedFields] Page loaded');
          setPageLoaded(true);
          break;
          
        case 'ready':
          console.log('[BraintreeHostedFields] Braintree fields ready');
          setLoading(false);
          onReady?.();
          break;
          
        case 'success':
          console.log('[BraintreeHostedFields] Payment nonce received:', data.nonce);
          console.log('[BraintreeHostedFields] Card details:', data.details);
          onSuccess(data.nonce, data.details);
          break;
          
        case 'error':
          console.error('[BraintreeHostedFields] Error:', data.error);
          setLoading(false);
          onError(data.error);
          break;
          
        default:
          console.warn('[BraintreeHostedFields] Unknown message type:', data.type);
      }
    };
    
    const handleLoad = () => {
      console.log('[BraintreeHostedFields] WebView loaded');
    };
    
    const handleError = (syntheticEvent: any) => {
      const { nativeEvent } = syntheticEvent;
      console.error('[BraintreeHostedFields] WebView error:', nativeEvent);
      setLoading(false);
      onError('Failed to load payment form. Please check your connection.');
    };
    
    // Expose submitPayment method to parent component
    useImperativeHandle(ref, () => ({
      submitPayment: () => {
        console.log('[BraintreeHostedFields] submitPayment called');
        
        if (!pageLoaded) {
          console.error('[BraintreeHostedFields] Cannot submit - page not loaded');
          Alert.alert('Error', 'Payment form is not ready yet');
          return;
        }
        
        const message = JSON.stringify({
          action: 'submit'
        });
        
        console.log('[BraintreeHostedFields] Posting submit message');
        webViewRef.current?.postMessage(message);
      }
    }));
    
    return (
      <View style={styles.container}>
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={Colors.gold} />
          </View>
        )}
        
        <WebView
          ref={webViewRef}
          source={{ uri: hostedFieldsUrl }}
          onMessage={handleMessage}
          onLoad={handleLoad}
          onError={handleError}
          style={styles.webview}
          scrollEnabled={false}
          bounces={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={false}
          mixedContentMode="always"
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          // Allow postMessage communication
          injectedJavaScript=""
        />
      </View>
    );
  }
);

BraintreeHostedFields.displayName = 'BraintreeHostedFields';

const styles = StyleSheet.create({
  container: {
    height: 350, // Adjust based on your layout
    backgroundColor: 'transparent',
    marginVertical: 10,
  },
  webview: {
    backgroundColor: 'transparent',
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});

export default BraintreeHostedFields;
