import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
    marginBottom: 32,
    textAlign: 'left',
  },
  sendButton: {
    marginTop: 8,
    marginBottom: 32,
  },
  backToLoginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backToLoginText: {
    fontSize: 14,
    color: '#666666',
  },
  backToLoginLink: {
    fontSize: 14,
    color: '#1A1A1A',
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
});
