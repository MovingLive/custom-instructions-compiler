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
}

const FileTree: React.FC<FileTreeProps> = ({ data, selectedFiles, onFileSelect }) => {
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());

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
          className={`flex items-center py-1 px-2 hover:bg-gray-100 rounded cursor-pointer ${
            isSelected && !isFolder ? 'bg-blue-50' : ''
          }`}
          style={{ paddingLeft: `${level * 1.5}rem` }}
          onClick={() => isFolder ? toggleFolder(node.path) : onFileSelect(node.path)}
        >
          {isFolder ? (
            <>
              <span className="mr-1">
                {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              </span>
              <Folder size={18} className="mr-2 text-yellow-500" />
            </>
          ) : (
            <>
              <span className="w-[18px] mr-1" />
              <File size={18} className="mr-2 text-gray-500" />
            </>
          )}
          <span className="text-sm">{node.path.split('/').pop()}</span>
          {!isFolder && (
            <input
              type="checkbox"
              className="ml-auto"
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
};

export default FileTree;