import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { dbPromise } from '../db';

interface LabelManagerProps {
  labels: Array<{ name: string; color: string }>;
  onLabelAdded: () => void;
}

const LabelManager: React.FC<LabelManagerProps> = ({ labels, onLabelAdded }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('#E5E7EB');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabelName.trim()) return;

    const db = await dbPromise;
    await db.add('labels', {
      name: newLabelName,
      color: newLabelColor,
    });

    setNewLabelName('');
    setNewLabelColor('#E5E7EB');
    setIsOpen(false);
    onLabelAdded();
  };

  const handleDelete = async (labelName: string) => {
    const db = await dbPromise;
    await db.delete('labels', labelName);
    onLabelAdded();
  };

  return (
    <div className="fixed top-4 right-4">
      {!isOpen ? (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="bg-gray-200 dark:bg-gray-700 p-2 rounded-lg shadow-lg"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
        </motion.button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-80"
        >
          <h2 className="text-xl font-semibold mb-4">ラベル管理</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">ラベル名</label>
              <input
                type="text"
                value={newLabelName}
                onChange={(e) => setNewLabelName(e.target.value)}
                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">色</label>
              <input
                type="color"
                value={newLabelColor}
                onChange={(e) => setNewLabelColor(e.target.value)}
                className="w-full h-10 rounded-lg"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-light dark:bg-primary-dark text-white rounded-lg hover:opacity-90"
              >
                追加
              </button>
            </div>
          </form>

          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">既存のラベル</h3>
            <div className="space-y-2">
              {labels.map((label) => (
                <motion.div
                  key={label.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: label.color }}
                    />
                    <span>{label.name}</span>
                  </div>
                  <button
                    onClick={() => handleDelete(label.name)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default LabelManager; 