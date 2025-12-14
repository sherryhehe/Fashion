import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import BottomSheet from './BottomSheet';
import { icons } from '../assets/icons';
import { useBrands } from '../hooks/useBrands';
import { useProducts } from '../hooks/useProducts';

interface FiltersProps {
  onApplyFilters?: (filters: any) => void;
  productsData?: any[]; // Optional: Products data for calculating dynamic counts
}

const Filters: React.FC<FiltersProps> = ({ onApplyFilters, productsData }) => {
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedDiscount, setSelectedDiscount] = useState<string | null>(null);
  const [selectedSortBy, setSelectedSortBy] = useState('Low Price to High');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string | null>(null);
  
  // Fetch brands from API
  const { data: brandsData } = useBrands();
  const brands = brandsData?.data?.map((brand: any) => ({
    name: brand.name,
    id: brand._id || brand.id,
  })) || [];

  // Fetch all products to calculate discount counts and price ranges dynamically
  const { data: allProductsData } = useProducts({ limit: 1000, status: 'active' });
  const allProducts = productsData || allProductsData?.data || [];
  
  // Calculate discount counts dynamically from products
  const discounts = useMemo(() => {
    const discountThresholds = [20, 40, 60];
    return discountThresholds.map((threshold) => {
      const count = allProducts.filter((product: any) => {
        const discount = product.discount || (product.originalPrice && product.price < product.originalPrice 
          ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
          : 0);
        return discount >= threshold;
      }).length;
      return {
        label: `${threshold}% (${count})`,
        value: threshold.toString(),
      };
    });
  }, [allProducts]);

  // Calculate price ranges dynamically from products
  const priceRanges = useMemo(() => {
    if (allProducts.length === 0) {
      // Default ranges if no products
      return [
        { label: 'Under 10k', value: '10k', maxPrice: 10000 },
        { label: 'Under 20k', value: '20k', maxPrice: 20000 },
        { label: 'Under 50k', value: '50k', maxPrice: 50000 },
      ];
    }
    
    const prices = allProducts.map((p: any) => p.price).filter((p: number) => p > 0 && !isNaN(p));
    if (prices.length === 0) {
      return [
        { label: 'Under 10k', value: '10k', maxPrice: 10000 },
        { label: 'Under 20k', value: '20k', maxPrice: 20000 },
        { label: 'Under 50k', value: '50k', maxPrice: 50000 },
      ];
    }
    
    const maxPrice = Math.max(...prices);
    
    // Create sensible price ranges based on actual product prices
    // Use fixed ranges: 10k, 20k, 50k, or dynamic if max price is higher
    const ranges = [
      { label: 'Under 10k', value: '10k', maxPrice: 10000 },
      { label: 'Under 20k', value: '20k', maxPrice: 20000 },
    ];
    
    if (maxPrice > 20000) {
      ranges.push({ label: 'Under 50k', value: '50k', maxPrice: 50000 });
    }
    
    // If max price is above 50k, add a "All" option or higher range
    if (maxPrice > 50000) {
      const nextRange = Math.ceil(maxPrice / 100000) * 100000; // Round up to nearest 100k
      ranges.push({
        label: `Under ${(nextRange / 1000).toFixed(0)}k`,
        value: `range-${nextRange}`,
        maxPrice: nextRange,
      });
    }
    
    return ranges;
  }, [allProducts]);

  const handleApplyFilters = () => {
    // Find selected price range max price
    const selectedRange = priceRanges.find(r => r.value === selectedPriceRange);
    const maxPrice = selectedRange?.maxPrice || undefined;
    
    const filters = {
      brands: selectedBrands,
      discount: selectedDiscount,
      sortBy: selectedSortBy,
      minPrice: selectedPriceRange, // Price range button value (e.g., '10k', '20k', '50k')
      maxPrice: maxPrice,
    };
    
    onApplyFilters?.(filters);
    setIsBottomSheetVisible(false);
  };
  
  const handlePriceRangeSelect = (range: string) => {
    setSelectedPriceRange(selectedPriceRange === range ? null : range);
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const handleDiscountSelect = (discount: string) => {
    setSelectedDiscount(discount === selectedDiscount ? null : discount);
  };

  const handleSortBySelect = (sortBy: string) => {
    setSelectedSortBy(sortBy);
  };

  // Discounts and price ranges are now calculated dynamically above

  const sortByOptions = [
    'Low Price to High',
    'High to Low',
    'New Arrivals',
  ];

  const renderDottedLine = () => (
    <View style={styles.dottedLine}/>
  );

  const renderCheckbox = (isChecked: boolean) => (
    <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
      {isChecked && <Text style={styles.checkmark}>✓</Text>}
    </View>
  );

  const renderRadioButton = (isSelected: boolean) => (
    <View style={[styles.radioButton, isSelected && styles.radioButtonSelected]}>
      {isSelected && <View style={styles.radioButtonInner} />}
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setIsBottomSheetVisible(true)}
      >
        <Image source={icons.filter} style={styles.filterIcon} />
      </TouchableOpacity>

      <BottomSheet
        visible={isBottomSheetVisible}
        onClose={() => setIsBottomSheetVisible(false)}
        enablePanDownToClose
        enableBackdropToClose

      >
          {/* Filters Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Filters</Text>
          </View>
          {renderDottedLine()}

        
            {/* Select Price Range */}
            <Text style={styles.sectionTitle}>Select Price Range</Text>
            <View style={styles.priceRangeButtons}>
              {priceRanges.map((range) => (
                <TouchableOpacity
                  key={range.value}
                  style={[styles.priceButton, selectedPriceRange === range.value && styles.priceButtonSelected]}
                  onPress={() => handlePriceRangeSelect(range.value)}
                >
                  <Text style={[styles.priceButtonText, selectedPriceRange === range.value && styles.priceButtonTextSelected]}>
                    {range.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {renderDottedLine()}

            {/* Select Brands */}
            <Text style={styles.sectionTitle}>Select Brands</Text>
            <View style={styles.brandList}>
              {brands.map((brand) => (
                <TouchableOpacity
                  key={brand.id}
                  style={styles.checkboxContainer}
                  onPress={() => toggleBrand(brand.name)}
                >
                  {renderCheckbox(selectedBrands.includes(brand.name))}
                  <Text style={styles.checkboxLabel}>{brand.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.viewMoreButton}>
              <Text style={styles.viewMoreText}>View More</Text>
              <Text style={styles.viewMoreIcon}>▼</Text>
            </TouchableOpacity>
            {renderDottedLine()}

            {/* Discount */}
            <Text style={styles.sectionTitle}>Discount</Text>
            <View style={styles.discountList}>
              {discounts.map((discount) => (
                <TouchableOpacity
                  key={discount.value}
                  style={styles.checkboxContainer}
                  onPress={() => handleDiscountSelect(discount.value)}
                >
                  {renderCheckbox(selectedDiscount === discount.value)}
                  <Text style={styles.checkboxLabel}>{discount.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {renderDottedLine()}

            {/* Sort By */}
            <Text style={styles.sectionTitle}>Sort By</Text>
            <View style={styles.sortByList}>
              {sortByOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={styles.radioContainer}
                  onPress={() => handleSortBySelect(option)}
                >
                  {renderRadioButton(selectedSortBy === option)}
                  <Text style={styles.radioLabel}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {renderDottedLine()}

          {/* Apply Filters Button */}
          <TouchableOpacity
            style={styles.applyFiltersButton}
            onPress={handleApplyFilters}
          >
            <Text style={styles.applyFiltersButtonText}>Apply Filters</Text>
          </TouchableOpacity>
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Container for the filter button
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
  filterButtonText: {
    fontSize: 16,
    color: '#2C2C2E',
    fontWeight: '500',
  },

  // Bottom Sheet Content Styles
  bottomSheetContent: {
    flex:1
  },
  header: {
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C2C2E',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  // Dotted Line Styles
  dottedLine: {
    height: 1,
    marginVertical: 16,
    position: 'relative',
    backgroundColor: '#E5E5E7',

  },


  // Section Title Styles
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2E',
    marginBottom: 12,
  },

  // Product Type Dropdown Styles
  dropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  dropdownText: {
    fontSize: 16,
    color: '#2C2C2E',
  },
  dropdownIcon: {
    fontSize: 12,
    color: '#8E8E93',
  },

  // Price Range Styles
  priceRangeButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  priceButton: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  priceButtonText: {
    fontSize: 14,
    color: '#2C2C2E',
    fontWeight: '500',
  },
  priceButtonSelected: {
    backgroundColor: '#2C2C2E',
  },
  priceButtonTextSelected: {
    color: '#FFFFFF',
  },
  priceSliderContainer: {
    marginBottom: 16,
  },
  priceSliderTrack: {
    height: 4,
    backgroundColor: '#E5E5E7',
    borderRadius: 2,
    position: 'relative',
  },
  priceSliderSelectedTrack: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: 4,
    width: '70%',
    backgroundColor: '#2C2C2E',
    borderRadius: 2,
  },
  priceSliderThumb: {
    position: 'absolute',
    top: -6,
    left: '70%',
    width: 16,
    height: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#2C2C2E',
  },

  // Checkbox Styles
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#E5E5E7',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#2C2C2E',
    borderColor: '#2C2C2E',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#2C2C2E',
    flex: 1,
  },

  // Brand List Styles
  brandList: {
    marginBottom: 12,
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 16,
  },
  viewMoreText: {
    fontSize: 16,
    color: '#2C2C2E',
    marginRight: 8,
  },
  viewMoreIcon: {
    fontSize: 12,
    color: '#8E8E93',
  },

  // Discount List Styles
  discountList: {
    marginBottom: 16,
  },

  // Radio Button Styles
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E5E5E7',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#2C2C2E',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2C2C2E',
  },
  radioLabel: {
    fontSize: 16,
    color: '#2C2C2E',
    flex: 1,
  },

  // Sort By List Styles
  sortByList: {
    marginBottom: 16,
  },

  // Apply Filters Button Styles
  applyFiltersButton: {
    backgroundColor: '#2C2C2E',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyFiltersButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Filters;
