import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  imageGrid: {
    marginTop: 20,
    marginBottom: 20,
    gap: 8,
  },
  topImageContainer: {
    marginBottom: 8,
  },
  topImage: {
    height: 180,
  },
  middleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  leftColumn: {
    flex: 1,
    gap: 8,
    width: '50%',
  },
  rightColumn: {
    flex: 1,
  },
  middleImage: {
    height: 85,
  },
  rightImage: {
    height: 178, // Same height as left column (85 + 85 + 8 gap)
  },
  bottomRow: {
    flexDirection: 'row',
    gap: 8,
  },
  bottomImage: {
    flex: 1,
    height: 100,
  },
  placeholderImage: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  mainImage: {
    height: '100%',
    width: '100%',
    resizeMode: 'cover',
  },
  contentSection: {
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  startButton: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginBottom: 40,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
