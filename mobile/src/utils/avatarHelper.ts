/**
 * Avatar Helper Utilities
 * Functions to generate initials and handle avatar display
 */

/**
 * Generate initials from a name
 * Examples:
 * - "John Doe" -> "JD"
 * - "John" -> "J"
 * - "John Michael Doe" -> "JD"
 * - "" -> "?"
 */
export const getInitials = (name?: string | null): string => {
  if (!name || name.trim().length === 0) {
    return '?';
  }

  const trimmedName = name.trim();
  const parts = trimmedName.split(/\s+/).filter(part => part.length > 0);

  if (parts.length === 0) {
    return '?';
  }

  if (parts.length === 1) {
    // Single name - return first letter
    return parts[0].charAt(0).toUpperCase();
  }

  // Multiple names - return first letter of first and last name
  const firstInitial = parts[0].charAt(0).toUpperCase();
  const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
  return `${firstInitial}${lastInitial}`;
};

/**
 * Get a color for an avatar based on initials/name
 * Returns a consistent color based on the first character
 */
export const getAvatarColor = (name?: string | null): string => {
  if (!name || name.trim().length === 0) {
    return '#8E8E93'; // Gray for empty
  }

  const initial = name.trim().charAt(0).toUpperCase();
  const colors = [
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#45B7D1', // Blue
    '#FFA07A', // Light Salmon
    '#98D8C8', // Mint
    '#F7DC6F', // Yellow
    '#BB8FCE', // Purple
    '#85C1E2', // Sky Blue
    '#F8B739', // Orange
    '#52BE80', // Green
    '#E74C3C', // Dark Red
    '#3498DB', // Bright Blue
    '#9B59B6', // Violet
    '#1ABC9C', // Turquoise
    '#E67E22', // Dark Orange
  ];

  const index = initial.charCodeAt(0) % colors.length;
  return colors[index];
};

