import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface TodoDB extends DBSchema {
  tasks: {
    key: number;
    value: {
      id?: number;
      title: string;
      description: string;
      status: 'not_started' | 'in_progress' | 'completed';
      labels: string[];
      createdAt: Date;
      updatedAt: Date;
    };
    indexes: {
      'by-status': string;
      'by-label': string;
    };
  };
  labels: {
    key: string;
    value: {
      name: string;
      color: string;
    };
  };
}

const dbName = 'todo-app-db';
const version = 1;

export const initDB = async (): Promise<IDBPDatabase<TodoDB>> => {
  return openDB<TodoDB>(dbName, version, {
    upgrade(db) {
      const taskStore = db.createObjectStore('tasks', {
        keyPath: 'id',
        autoIncrement: true,
      });
      taskStore.createIndex('by-status', 'status');
      taskStore.createIndex('by-label', 'labels', { multiEntry: true });

      const labelStore = db.createObjectStore('labels', {
        keyPath: 'name',
      });
    },
  });
};

export const dbPromise = initDB(); 