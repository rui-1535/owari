import React from 'react';
import { motion } from 'framer-motion';

interface FilterBarProps {
  labels: Array<{ name: string; color: string }>;
  selectedStatus: string | null;
  selectedLabels: string[];
  onStatusChange: (status: string | null) => void;
  onLabelToggle: (label: string) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  labels,
  selectedStatus,
  selectedLabels,
  onStatusChange,
  onLabelToggle,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg mb-6"
    >
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-2">ステータス</h3>
          <div className="flex space-x-2">
            {['not_started', 'in_progress', 'completed'].map((status) => (
              <motion.button
                key={status}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onStatusChange(selectedStatus === status ? null : status)}
                className={`px-3 py-1 rounded-lg text-sm ${
                  selectedStatus === status
                    ? 'bg-primary-light dark:bg-primary-dark text-white'
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}
              >
                {status === 'not_started' ? '未着手' : 
                 status === 'in_progress' ? '進行中' : 
                 status === 'completed' ? '完了' : status}
              </motion.button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-2">ラベル</h3>
          <div className="flex flex-wrap gap-2">
            {labels.map((label) => (
              <motion.button
                key={label.name}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onLabelToggle(label.name)}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedLabels.includes(label.name)
                    ? 'ring-2 ring-offset-2'
                    : ''
                }`}
                style={{ backgroundColor: label.color }}
              >
                {label.name}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FilterBar; 