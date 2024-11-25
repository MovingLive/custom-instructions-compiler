import React from 'react';
import { ChevronDown, ChevronRight, File, Folder } from 'lucide-react';

interface TreeNode {
  path: string;
  type: 'file' | 'tree';
  children?: TreeNode[];
}

interface FileTreeProps {
  data: TreeNode[];
  selectedFiles: Set<string>;
  onFileSelect: (path: string) => void;
  expanded: Set<string>;
  setExpanded: React.Dispatch<React.SetStateAction<Set<string>>>;
}

const FileTree: React.FC<FileTreeProps> = ({ 
  data, 
  selectedFiles, 
  onFileSelect,
  expanded,
  setExpanded 
}) => {
  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expanded);
    if (expanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpanded(newExpanded);
  };

  const renderNode = (node: TreeNode, level: number = 0) => {
    const isFolder = node.type === 'tree';
    const isExpanded = expanded.has(node.path);
    const isSelected = selectedFiles.has(node.path);

    return (
      <div key={node.path} className="select-none">
        <div
          className={`flex items-center py-1 px-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer transition-colors ${
            isSelected && !isFolder ? 'bg-blue-50 dark:bg-blue-900' : ''
          }`}
          style={{ paddingLeft: `${level * 1.5}rem` }}
          onClick={() => isFolder ? toggleFolder(node.path) : onFileSelect(node.path)}
        >
          {isFolder ? (
            <>
              <span className="mr-1">
                {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              </span>
              <Folder size={18} className="mr-2 text-yellow-500 dark:text-yellow-400" />
            </>
          ) : (
            <>
              <span className="w-[18px] mr-1" />
              <File size={18} className="mr-2 text-gray-500 dark:text-gray-400" />
            </>
          )}
          <span className="text-sm dark:text-gray-200">{node.path.split('/').pop()}</span>
          {!isFolder && (
            <input
              type="checkbox"
              className="ml-auto accent-blue-600"
              checked={isSelected}
              onChange={() => onFileSelect(node.path)}
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
        {isFolder && isExpanded && node.children && (
          <div>
            {node.children.map((child) => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return <div className="w-full">{data.map((node) => renderNode(node))}</div>;
}

export default FileTree;