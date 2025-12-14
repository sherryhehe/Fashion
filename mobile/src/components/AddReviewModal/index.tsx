import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { icons } from '../../assets/icons';
import styles from './styles';

interface AddReviewModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (review: {
    rating: number;
    comment: string;
    name: string;
  }) => void;
  productName: string;
  isLoading?: boolean;
}

const AddReviewModal: React.FC<AddReviewModalProps> = ({
  visible,
  onClose,
  onSubmit,
  productName,
  isLoading = false,
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [name, setName] = useState('');

  const handleStarPress = (selectedRating: number) => {
    setRating(selectedRating);
  };

  const handleSubmit = () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a rating before submitting your review.');
      return;
    }

    if (comment.trim().length < 10) {
      Alert.alert('Comment Too Short', 'Please write at least 10 characters for your review.');
      return;
    }

    if (name.trim().length < 2) {
      Alert.alert('Name Required', 'Please enter your name.');
      return;
    }

    onSubmit({
      rating,
      comment: comment.trim(),
      name: name.trim(),
    });

    // Reset form
    setRating(0);
    setComment('');
    setName('');
  };

  const handleClose = () => {
    // Reset form when closing
    setRating(0);
    setComment('');
    setName('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Review</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Image source={icons.backArrow} style={styles.closeIcon} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Product Info */}
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{productName}</Text>
            </View>

            {/* Rating Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Rating *</Text>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => handleStarPress(star)}
                    style={styles.starButton}
                  >
                    <Image
                      source={icons.star}
                      style={[
                        styles.starIcon,
                        star <= rating && styles.filledStar
                      ]}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              {rating > 0 && (
                <Text style={styles.ratingText}>
                  {rating === 1 && 'Poor'}
                  {rating === 2 && 'Fair'}
                  {rating === 3 && 'Good'}
                  {rating === 4 && 'Very Good'}
                  {rating === 5 && 'Excellent'}
                </Text>
              )}
            </View>

            {/* Name Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Name *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your name"
                value={name}
                onChangeText={setName}
                maxLength={50}
              />
            </View>

            {/* Comment Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Review *</Text>
              <TextInput
                style={[styles.textInput, styles.commentInput]}
                placeholder="Share your experience with this product..."
                value={comment}
                onChangeText={setComment}
                multiline
                numberOfLines={4}
                maxLength={500}
                textAlignVertical="top"
              />
              <Text style={styles.characterCount}>{comment.length}/500</Text>
            </View>
          </ScrollView>

          {/* Footer Buttons */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={handleSubmit}
              disabled={isLoading || rating === 0 || comment.trim().length < 10 || name.trim().length < 2}
            >
              <Text style={styles.submitButtonText}>
                {isLoading ? 'Submitting...' : 'Submit Review'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AddReviewModal;
