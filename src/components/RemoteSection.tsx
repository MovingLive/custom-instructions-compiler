import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Octokit } from 'octokit';
import FileTree from './FileTree';

interface TreeNode {
  path: string;
  type: 'file' | 'tree';
  children?: TreeNode[];
}

export default function RemoteSection() {
  const [repoUrl, setRepoUrl] = useState('');
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const octokit = new Octokit();

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

  const parseGitHubUrl = (url: string) => {
    try {
      // Support various GitHub URL formats
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      if (pathParts.length < 2) throw new Error('Invalid GitHub URL');
      return {
        owner: pathParts[0],
        repo: pathParts[1].replace('.git', '')
      };
    } catch (err) {
      throw new Error('Please enter a valid GitHub repository URL');
    }
  };

  const hasMarkdownFiles = (node: TreeNode): boolean => {
    if (node.type === 'file' || node.type === 'blob') {  // Add 'blob' type check
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
        // Convert 'blob' type to 'file' type
        return {
          ...node,
          type: 'file'
        };
      })
      .filter(node => {
        if (node.type === 'file' || node.type === 'blob') {
          return node.path.endsWith('.md');
        }
        if (node.type === 'tree') {
          return node.children && node.children.length > 0;
        }
        return false;
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

  const fetchRepo = async () => {
    if (!repoUrl.trim()) {
      setError('Please enter a repository URL');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setTreeData([]);
      const { owner, repo } = parseGitHubUrl(repoUrl);

      // First, try to get the default branch
      const { data: repoData } = await octokit.request('GET /repos/{owner}/{repo}', {
        owner,
        repo,
      });

      const defaultBranch = repoData.default_branch;

      // Then get the tree using the default branch
      const { data: { tree } } = await octokit.request('GET /repos/{owner}/{repo}/git/trees/{tree_sha}', {
        owner,
        repo,
        tree_sha: defaultBranch,
        recursive: '1',
      });

      if (!tree || tree.length === 0) {
        throw new Error('No files found in repository');
      }

      const processTree = (items: any[]): TreeNode[] => {
        const nodes: { [key: string]: TreeNode } = {};
        const result: TreeNode[] = [];

        items.forEach(item => {
          if (!item.path.endsWith('.md') && item.type !== 'tree') return;

          const parts = item.path.split('/');
          let currentPath = '';

          parts.forEach((part: string, index: number) => {
            const parentPath = currentPath;
            currentPath = currentPath ? `${currentPath}/${part}` : part;

            if (!nodes[currentPath]) {
              const node: TreeNode = {
                path: currentPath,
                type: index === parts.length - 1 ? item.type : 'tree',
                children: []
              };
              nodes[currentPath] = node;

              if (parentPath) {
                nodes[parentPath].children?.push(node);
              } else {
                result.push(node);
              }
            }
          });
        });

        return result;
      };

      const processedTree = processTree(tree);
      const filteredTree = filterEmptyFolders(processedTree);

      if (filteredTree.length === 0) {
        throw new Error('No markdown files found in repository');
      }

      const newSelected = new Set<string>();
      autoSelectBasicFiles(filteredTree, newSelected);

      // Expand all folders
      const allFolderPaths = getAllFolderPaths(filteredTree);
      setExpanded(new Set(allFolderPaths));

      setTreeData(filteredTree);
      setSelectedFiles(newSelected);
    } catch (err: any) {
      setError(err.message || 'Failed to load repository');
      setTreeData([]);
      setSelectedFiles(new Set());
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
      const { owner, repo } = parseGitHubUrl(repoUrl);

      const fileContents = await Promise.all(
        Array.from(selectedFiles).map(async (path) => {
          const response = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
            owner,
            repo,
            path,
            headers: {
              'accept': 'application/vnd.github.v3.raw',
              'if-none-match': ''
            }
          });

          const content = await response.data;
          return `# File: ${path}\n\n${content}`;
        })
      );

      const combinedContent = fileContents.join('\n\n---\n\n');
      const blob = new Blob([new TextEncoder().encode(combinedContent)], {
        type: 'text/markdown; charset=utf-8'
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'github-instruction.md';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || 'Failed to download files');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="Enter GitHub repository URL"
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
          />
          <button
            onClick={fetchRepo}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 dark:disabled:bg-blue-500 flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading...
              </>
            ) : (
              'Load Repository'
            )}
          </button>
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>

      {treeData.length > 0 && (
        <>
          <div className="border dark:border-gray-700 rounded-lg p-4 mb-6 max-h-[60vh] overflow-y-auto">
            <FileTree
              data={treeData}
              selectedFiles={selectedFiles}
              onFileSelect={handleFileSelect}
              expanded={expanded}
              setExpanded={setExpanded}
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={downloadSelectedFiles}
              disabled={loading || selectedFiles.size === 0}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400 dark:disabled:bg-green-500"
            >
              <Download className="w-5 h-5" />
              Generate Instructions
            </button>
          </div>
        </>
      )}
    </div>
  );
}