import React, { useState, useEffect } from 'react';
import { Octokit } from 'octokit';
import { Download, Github, Loader2 } from 'lucide-react';
import FileTree from './components/FileTree';

interface TreeNode {
  path: string;
  type: 'file' | 'tree';
  children?: TreeNode[];
}

function App() {
  const [repoUrl, setRepoUrl] = useState('');
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const octokit = new Octokit();

  const parseGithubUrl = (url: string) => {
    try {
      const regex = /github\.com\/([^/]+)\/([^/]+)/;
      const match = url.match(regex);
      if (!match) throw new Error('Invalid GitHub URL');
      return { owner: match[1], repo: match[2] };
    } catch (err) {
      throw new Error('Invalid GitHub URL');
    }
  };

  const buildTree = (items: any[]): TreeNode[] => {
    const root: { [key: string]: TreeNode } = {};
    
    items.forEach(item => {
      const parts = item.path.split('/');
      let current = root;
      
      parts.forEach((part: string, index: number) => {
        const path = parts.slice(0, index + 1).join('/');
        if (!current[path]) {
          current[path] = {
            path,
            type: index === parts.length - 1 ? item.type : 'tree',
            children: []
          };
        }
        if (index < parts.length - 1) {
          current = current[path].children = current[path].children || {};
        }
      });
    });

    const sortTree = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.sort((a, b) => {
        if (a.type === b.type) {
          return a.path.localeCompare(b.path);
        }
        return a.type === 'tree' ? -1 : 1;
      });
    };

    const buildArray = (obj: { [key: string]: TreeNode }): TreeNode[] => {
      return sortTree(
        Object.values(obj).map(node => ({
          ...node,
          children: node.children ? buildArray(node.children as any) : undefined
        }))
      );
    };

    return buildArray(root);
  };

  const fetchRepo = async () => {
    try {
      setLoading(true);
      setError('');
      const { owner, repo } = parseGithubUrl(repoUrl);
      
      const { data: { tree } } = await octokit.rest.git.getTree({
        owner,
        repo,
        tree_sha: 'main',
        recursive: '1'
      });

      const markdownFiles = tree.filter(item => 
        item.type === 'blob' && 
        item.path.endsWith('.md')
      );

      setTreeData(buildTree(markdownFiles));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (path: string) => {
    setSelectedFiles(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const downloadSelectedFiles = async () => {
    try {
      setLoading(true);
      const { owner, repo } = parseGithubUrl(repoUrl);
      
      const fileContents = await Promise.all(
        Array.from(selectedFiles).map(async path => {
          const { data } = await octokit.rest.repos.getContent({
            owner,
            repo,
            path
          });
          
          if ('content' in data) {
            const content = atob(data.content);
            return `# From ${path}\n\n${content}\n\n`;
          }
          return '';
        })
      );

      const compiledContent = fileContents.join('---\n\n');
      const blob = new Blob([compiledContent], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'github-instruction.md';
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-8">
            <Github className="w-8 h-8 text-gray-700 mr-3" />
            <h1 className="text-2xl font-bold text-gray-800">
              Custom Instructions Compiler
            </h1>
          </div>

          <div className="mb-6">
            <div className="flex gap-3">
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="Enter GitHub repository URL"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <button
                onClick={fetchRepo}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Load Repository'
                )}
              </button>
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>

          {treeData.length > 0 && (
            <>
              <div className="border rounded-lg p-4 mb-6 max-h-[60vh] overflow-y-auto">
                <FileTree
                  data={treeData}
                  selectedFiles={selectedFiles}
                  onFileSelect={handleFileSelect}
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={downloadSelectedFiles}
                  disabled={loading || selectedFiles.size === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400"
                >
                  <Download className="w-5 h-5" />
                  Generate Instructions
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;