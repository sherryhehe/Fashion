import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Logo styles
  logoContainer: {
    marginBottom: 50,
  },
  logo: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 2,
    textAlign: 'center',
  },
  
  // Simple spinner
  spinnerContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: '#F0F0F0',
    borderTopColor: '#007AFF',
    marginBottom: 30,
  },
  
  // Message styles
  message: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  
  // Compact variant for inline loading
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  compactSpinner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#F0F0F0',
    borderTopColor: '#007AFF',
    marginRight: 12,
  },
  compactMessage: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  
  // Button loading overlay
  buttonOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  buttonSpinner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#F0F0F0',
    borderTopColor: '#007AFF',
  },
});