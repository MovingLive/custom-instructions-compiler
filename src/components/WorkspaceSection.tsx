import React, { useState, useEffect } from 'react';
import { Download, Loader2 } from 'lucide-react';
import FileTree from './FileTree';

interface TreeNode {
  path: string;
  type: 'file' | 'tree';
  children?: TreeNode[];
}

export default function WorkspaceSection() {
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [filename, setFilename] = useState('copilot-instructions.md');
  
  const getAllFolderPaths = (nodes: TreeNode[]): string[] => {
    const paths: string[] = [];
    nodes.forEach(node => {
      if (node.type === 'tree') {
        paths.push(node.path);
        if (node.children) {
          paths.push(...getAllFolderPaths(node.children));
        }
      }
    });
    return paths;
  };

  const hasMarkdownFiles = (node: TreeNode): boolean => {
    if (node.type === 'file') {
      return node.path.endsWith('.md');
    }
    return node.children?.some(child => hasMarkdownFiles(child)) ?? false;
  };

  const filterEmptyFolders = (nodes: TreeNode[]): TreeNode[] => {
    return nodes
      .map(node => {
        if (node.type === 'tree') {
          const filteredChildren = filterEmptyFolders(node.children || []);
          return {
            ...node,
            children: filteredChildren,
          };
        }
        return node;
      })
      .filter(node => {
        if (node.type === 'file') {
          return node.path.endsWith('.md');
        }
        return hasMarkdownFiles(node);
      });
  };

  const autoSelectBasicFiles = (nodes: TreeNode[], selected: Set<string>) => {
    nodes.forEach(node => {
      if (node.type === 'file' && node.path.toLowerCase().includes('basic') && node.path.endsWith('.md')) {
        selected.add(node.path);
      }
      if (node.children) {
        autoSelectBasicFiles(node.children, selected);
      }
    });
  };

  useEffect(() => {
    loadWorkspaceFiles();
  }, []);

  const loadWorkspaceFiles = async () => {
    try {
      setLoading(true);
      setError('');

      // Simulate workspace file structure for lib directory
      const workspaceTree: TreeNode[] = [{
        path: 'lib',
        type: 'tree',
        children: [
          {
            path: 'lib/react.md',
            type: 'file'
          },
          {
            path: 'lib/typescript.md',
            type: 'file'
          },
          {
            path: 'lib/basic-setup.md',
            type: 'file'
          },
          {
            path: 'lib/best-practices',
            type: 'tree',
            children: [
              {
                path: 'lib/best-practices/coding-standards.md',
                type: 'file'
              },
              {
                path: 'lib/best-practices/basic-guidelines.md',
                type: 'file'
              }
            ]
          }
        ]
      }];

      const filteredTree = filterEmptyFolders(workspaceTree);
      const newSelected = new Set<string>();
      autoSelectBasicFiles(filteredTree, newSelected);

      // Expand all folders
      const allFolderPaths = getAllFolderPaths(filteredTree);
      setExpanded(new Set(allFolderPaths));

      setTreeData(filteredTree);
      setSelectedFiles(newSelected);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (path: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(path)) {
      newSelected.delete(path);
    } else {
      newSelected.add(path);
    }
    setSelectedFiles(newSelected);
  };

  const downloadSelectedFiles = async () => {
    try {
      setLoading(true);
      setError('');

      // Simulate reading workspace files
      const fileContents = Array.from(selectedFiles).map(path => {
        // This is a placeholder. In a real implementation, you would read the actual file contents
        return `# File: ${path}\n\nThis is the content of ${path}`;
      });

      const combinedContent = fileContents.join('\n\n---\n\n');
      const blob = new Blob([new TextEncoder().encode(combinedContent)], {
        type: 'text/markdown; charset=utf-8'
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Select and compile custom instructions from your workspace's 'lib' directory.
      </p>

      {error && (
        <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <div className="border dark:border-gray-700 rounded-lg p-4 mb-6 max-h-[60vh] overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-500 dark:text-gray-400" />
          </div>
        ) : treeData.length > 0 ? (
          <FileTree
            data={treeData}
            selectedFiles={selectedFiles}
            onFileSelect={handleFileSelect}
            expanded={expanded}
            setExpanded={setExpanded}
          />
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No markdown files found in the workspace.
          </p>
        )}
      </div>

      <div className="flex justify-end items-center gap-4">
        <input
          type="text"
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
          placeholder="Filename"
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
        />
        <button
          onClick={downloadSelectedFiles}
          disabled={loading || selectedFiles.size === 0}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400 dark:disabled:bg-green-500"
        >
          <Download className="w-5 h-5" />
          Generate Custom Instructions
        </button>
      </div>
    </div>
  );
}