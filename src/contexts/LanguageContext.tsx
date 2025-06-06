import React, { createContext, useState, useContext } from 'react';

type Language = 'ja' | 'en' | 'zh';

export type TranslationKey = 
  | 'not_started'
  | 'in_progress'
  | 'completed'
  | 'add_task'
  | 'new_task'
  | 'title'
  | 'description'
  | 'labels'
  | 'cancel'
  | 'add'
  | 'congratulations';

type Translations = Record<Language, Record<TranslationKey, string>>;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const translations: Translations = {
  ja: {
    'not_started': '未着手',
    'in_progress': '進行中',
    'completed': '完了',
    'add_task': 'タスクを追加',
    'new_task': '新しいタスク',
    'title': 'タイトル',
    'description': '説明',
    'labels': 'ラベル',
    'cancel': 'キャンセル',
    'add': '追加',
    'congratulations': 'おめでとうございます！',
  },
  en: {
    'not_started': 'Not Started',
    'in_progress': 'In Progress',
    'completed': 'Completed',
    'add_task': 'Add Task',
    'new_task': 'New Task',
    'title': 'Title',
    'description': 'Description',
    'labels': 'Labels',
    'cancel': 'Cancel',
    'add': 'Add',
    'congratulations': 'Congratulations!',
  },
  zh: {
    'not_started': '未开始',
    'in_progress': '进行中',
    'completed': '已完成',
    'add_task': '添加任务',
    'new_task': '新任务',
    'title': '标题',
    'description': '描述',
    'labels': '标签',
    'cancel': '取消',
    'add': '添加',
    'congratulations': '恭喜！',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ja');

  const t = (key: TranslationKey): string => {
    return translations[language][key];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}; 