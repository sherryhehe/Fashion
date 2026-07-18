/**
 * SelectModal
 * Lightweight, dependency-free dropdown/select built on React Native's Modal.
 * Renders a tappable field that opens a bottom-sheet list of options.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  FlatList,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
} from 'react-native';

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectModalProps {
  label?: string;
  placeholder?: string;
  value: string | null;
  options: SelectOption[];
  onSelect: (value: string) => void;
  disabled?: boolean;
}

const SelectModal: React.FC<SelectModalProps> = ({
  label,
  placeholder = 'Select an option',
  value,
  options,
  onSelect,
  disabled,
}) => {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View>
      <TouchableOpacity
        style={[styles.field, disabled && styles.fieldDisabled]}
        onPress={() => !disabled && setOpen(true)}
        activeOpacity={0.7}
      >
        <Text style={[styles.fieldText, !selected && styles.placeholder]}>
          {selected ? selected.label : placeholder}
        </Text>
        <Text style={styles.chevron}>▾</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableWithoutFeedback onPress={() => setOpen(false)}>
          <View style={styles.backdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.sheet}>
                {label ? <Text style={styles.sheetTitle}>{label}</Text> : null}
                <FlatList
                  data={options}
                  keyExtractor={(item) => item.value}
                  style={styles.list}
                  renderItem={({ item }) => {
                    const isSel = item.value === value;
                    return (
                      <TouchableOpacity
                        style={styles.option}
                        onPress={() => {
                          onSelect(item.value);
                          setOpen(false);
                        }}
                      >
                        <Text style={[styles.optionText, isSel && styles.optionTextSelected]}>
                          {item.label}
                        </Text>
                        {isSel ? <Text style={styles.check}>✓</Text> : null}
                      </TouchableOpacity>
                    );
                  }}
                  ListEmptyComponent={
                    <Text style={styles.empty}>No options available</Text>
                  }
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F2F2F7',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
  },
  fieldDisabled: { opacity: 0.6 },
  fieldText: { fontSize: 15, color: '#1C1C1E', flex: 1 },
  placeholder: { color: '#8E8E93' },
  chevron: { fontSize: 14, color: '#8E8E93', marginLeft: 8 },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    paddingBottom: 24,
    maxHeight: '70%',
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  list: { paddingHorizontal: 8 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  optionText: { fontSize: 16, color: '#1C1C1E' },
  optionTextSelected: { color: '#007AFF', fontWeight: '600' },
  check: { fontSize: 16, color: '#007AFF' },
  empty: { textAlign: 'center', color: '#8E8E93', padding: 24 },
});

export default SelectModal;
