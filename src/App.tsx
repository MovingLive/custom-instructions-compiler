import React, { useState } from 'react';
import { Github, Moon, Sun } from 'lucide-react';
import RemoteSection from './components/RemoteSection';
import WorkspaceSection from './components/WorkspaceSection';
import ProcessSteps from './components/ProcessSteps';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const [activeTab, setActiveTab] = useState('workspace');

  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-md transition-colors">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Github className="w-10 h-10 text-gray-700 dark:text-gray-200 mr-4" />
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                Custom Instructions Compiler
              </h1>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun className="w-6 h-6 text-gray-700 dark:text-gray-200" />
              ) : (
                <Moon className="w-6 h-6 text-gray-700 dark:text-gray-200" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <ProcessSteps />
        
        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex">
              <button
                onClick={() => setActiveTab('workspace')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'workspace'
                    ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Workspace Instructions
              </button>
              <button
                onClick={() => setActiveTab('remote')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'remote'
                    ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Remote Repository
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {activeTab === 'workspace' ? <WorkspaceSection /> : <RemoteSection />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;