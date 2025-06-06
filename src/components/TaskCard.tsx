import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';

interface TaskCardProps {
  task: {
    id: number;
    title: string;
    description: string;
    status: 'not_started' | 'in_progress' | 'completed';
    labels: string[];
  };
  index: number;
  labels: Array<{ name: string; color: string }>;
  isDragging: boolean;
  onDelete: (id: number) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, index, labels, isDragging, onDelete }) => {
  const { t } = useLanguage();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not_started':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Draggable draggableId={task.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 mb-2 rounded-lg relative ${
              snapshot.isDragging ? 'animate-shake' : ''
            } ${
              isDragging ? 'opacity-50' : ''
            }`}
            style={{
              backgroundColor: snapshot.isDragging ? '#E5E7EB' : '#F3F4F6',
            }}
          >
            <button
              onClick={() => onDelete(task.id)}
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500 transition-colors"
              aria-label="Delete task"
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
            <h3 className="font-medium pr-8">{task.title}</h3>
            <p className="text-sm opacity-75 mt-1">{task.description}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>
                {t(task.status)}
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </Draggable>
  );
};

export default TaskCard; 