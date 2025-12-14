import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { icons } from '../assets/icons';
import Filters from './Filters';
import { useNavigation } from '@react-navigation/native';

interface SearchFilterBarProps {
  placeholder?: string;
  onSearchChange?: (searchText: string) => void;
  onApplyFilters?: (filters: any) => void;
  onFilterPress?: () => void;
  searchValue?: string;
  showFilters?: boolean;
  showFilterButton?: boolean;
  isNavigational?: boolean;
  autoFocus?: boolean;
}

const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  autoFocus = false,
  placeholder = "Search brands, items or styles...",
  onSearchChange,
  onApplyFilters,
  onFilterPress,
  searchValue = "",
  showFilters = true,
  showFilterButton = false,
  isNavigational = false,
}) => {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState(searchValue);

  const handleSearchChange = (text: string) => {
    setSearchText(text);
    if (onSearchChange) {
      onSearchChange(text);
    }
  };

  const handleApplyFilters = (filters: any) => {
    console.log('Applied filters:', filters);
    if (onApplyFilters) {
      onApplyFilters(filters);
    }
  };

  const handleFilterPress = () => {
    if (isNavigational) {
      navigation.getParent()?.navigate('Search')
    } else if (onFilterPress) {
      onFilterPress();
    }
  };

  const handleSearchBarPress = () => {
    if (isNavigational) {
      navigation.getParent()?.navigate('Search',{
        searchText: searchValue || searchText,
        autoFocus: true,
      })
    }
  };

  return (
    <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Image source={icons.search} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={placeholder}
            placeholderTextColor="#8E8E93"
            value={searchValue || searchText}
            onChangeText={handleSearchChange}
            autoFocus={autoFocus}
            onSubmitEditing={handleSearchBarPress}
          />
        </View>
      {showFilters && !isNavigational && <Filters onApplyFilters={handleApplyFilters} />}
      {showFilterButton && (
        <TouchableOpacity style={styles.filterButton} onPress={handleFilterPress}>
          <Image source={icons.filter} style={styles.filterIcon} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginRight: 12,
  },
  searchIcon: {
    width: 18,
    height: 18,
    tintColor: '#8E8E93',
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#2C2C2E',
    height: 44,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 16,
    color: '#8E8E93',
    textAlignVertical: 'center',

  },
  filterButton: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterIcon: {
    width: 18,
    height: 18,
    tintColor: '#FFFFFF',
  },
});

export default SearchFilterBar;
