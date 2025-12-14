import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: '#000',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  headerRight: {
    width: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    padding: 20,
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  changePhotoButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  changePhotoText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  formSection: {
    marginBottom: 24,
  },
  disabledInput: {
    backgroundColor: '#F5F5F5',
    color: '#999',
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    marginTop: -12,
    marginBottom: 16,
    marginLeft: 4,
  },
  buttonSection: {
    marginBottom: 16,
  },
  loadingIndicator: {
    marginTop: 12,
  },
  changePasswordLink: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  changePasswordText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    textDecorationLine: 'underline',
  },
});

