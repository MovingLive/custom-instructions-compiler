import {
  ArrowRight,
  ClipboardPaste,
  Cog,
  Download,
  FileCheck,
  X,
  Clipboard,
} from "lucide-react";

import { useState } from "react";

export default function ProcessSteps() {
  const [visible, setVisible] = useState(true);

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(
      '"github.copilot.chat.codeGeneration.useInstructionFiles": true'
    );

    setCopied(true);

    setTimeout(() => setCopied(false), 1000);
  };

  if (!visible) return null;

  return (
    <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mt-4 transition-colors">
      <button
        onClick={() => setVisible(false)}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        aria-label="Close"
      >
        <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
      </button>

      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
        How It Works
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-2">
            <FileCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>

          <p className="text-sm font-medium dark:text-gray-200">
            1. Select MD Files
          </p>
        </div>

        <div className="hidden md:flex items-center justify-center">
          <ArrowRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
        </div>

        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-2">
            <Download className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>

          <p className="text-sm font-medium dark:text-gray-200">
            2. Download Instructions
          </p>
        </div>

        <div className="hidden md:flex items-center justify-center">
          <ArrowRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
        </div>

        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-2">
            <ClipboardPaste className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>

          <p className="text-sm font-medium dark:text-gray-200">
            3. Put in your .github/
          </p>
        </div>

        <div className="hidden md:flex items-center justify-center">
          <ArrowRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
        </div>

        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mb-2">
            <Cog className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>

          <p className="text-sm font-medium dark:text-gray-200">
            4. Enable it in settings.json
          </p>
        </div>
      </div>

      <div className="mt-4 bg-gray-50 dark:bg-gray-700 rounded-lg p-4 transition-colors text-center">
        <p className="text-sm text-gray-600 dark:text-gray-300 font-mono">
          To enable Custom Instructions in VS Code, update your settings.json:
        </p>

        <div className="relative">
          <code
            className={`block mt-2 text-xs p-2 rounded bg-gray-100 dark:bg-gray-600 text-gray-200`}
          >
            "github.copilot.chat.codeGeneration.useInstructionFiles": true
          </code>

          <button
            onClick={handleCopy}
            className={`absolute top-1/2 right-2 transform -translate-y-1/2 p-1 bg-transparent ${
              copied
                ? "text-green-500"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            } transition-colors`}
            aria-label="Copy to clipboard"
          >
            <Clipboard className="w-4 h-4 inline-block" />
          </button>
        </div>
      </div>
    </div>
  );
}
