import React from 'react';
import { Link, FileCheck, Download, Cog, ArrowRight } from 'lucide-react';

export default function ProcessSteps() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-colors">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">How It Works</h2>
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-2">
            <Link className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-sm font-medium dark:text-gray-200">1. Enter Repository URL</p>
        </div>
        <div className="hidden md:flex items-center justify-center">
          <ArrowRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
        </div>
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-2">
            <FileCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-sm font-medium dark:text-gray-200">2. Select MD Files</p>
        </div>
        <div className="hidden md:flex items-center justify-center">
          <ArrowRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
        </div>
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-2">
            <Download className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-sm font-medium dark:text-gray-200">3. Download Instructions</p>
        </div>
        <div className="hidden md:flex items-center justify-center">
          <ArrowRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
        </div>
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mb-2">
            <Cog className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
          <p className="text-sm font-medium dark:text-gray-200">4. Activate in Settings</p>
        </div>
      </div>
      <div className="mt-4 bg-gray-50 dark:bg-gray-700 rounded-lg p-4 transition-colors">
        <p className="text-sm text-gray-600 dark:text-gray-300 font-mono">To activate Custom Instructions in VS Code:</p>
        <code className="block mt-2 text-xs bg-gray-100 dark:bg-gray-600 p-2 rounded dark:text-gray-200">
          "github.copilot.chat.codeGeneration.useInstructionFiles": true
        </code>
      </div>
    </div>
  );
}