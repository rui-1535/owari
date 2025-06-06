import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { dbPromise } from '../db';

interface AddTaskProps {
  onTaskAdded: () => void;
  labels: Array<{ name: string; color: string }>;
}

const AddTask: React.FC<AddTaskProps> = ({ onTaskAdded, labels }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const db = await dbPromise;
    const task = {
      title,
      description,
      status: 'not_started' as const,
      labels: selectedLabels,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.add('tasks', task);

    setTitle('');
    setDescription('');
    setSelectedLabels([]);
    setIsOpen(false);
    onTaskAdded();
  };

  const toggleLabel = (labelName: string) => {
    setSelectedLabels(prev =>
      prev.includes(labelName)
        ? prev.filter(name => name !== labelName)
        : [...prev, labelName]
    );
  };

  return (
    <div className="fixed bottom-4 right-4">
      {!isOpen ? (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(true)}
          className="bg-primary-light dark:bg-primary-dark text-white p-4 rounded-full shadow-lg"
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
              d="M12 4v16m8-8H4"
            />
          </svg>
        </motion.button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-96"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">タイトル</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">説明</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">ラベル</label>
              <div className="flex flex-wrap gap-2">
                {labels.map((label) => (
                  <motion.button
                    key={label.name}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleLabel(label.name)}
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
        </motion.div>
      )}
    </div>
  );
};

export default AddTask; 