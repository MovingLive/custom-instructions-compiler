import { ArrowRight, Cog, Download, FileCheck, Github, Link, Loader2 } from 'lucide-react';
import { Octokit } from 'octokit';
import { useState } from 'react';
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
  const [darkMode, setDarkMode] = useState(false);

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
      const { owner, repo } = parseGitHubUrl(repoUrl);

      const { data: { tree } } = await octokit.request('GET /repos/{owner}/{repo}/git/trees/{tree_sha}', {
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
            const content = decodeURIComponent(escape(atob(data.content)));
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
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-black'}`}>
      <div className="max-w-4xl mx-auto p-6">
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          <div className="flex items-center mb-8">
            <Github className={`w-8 h-8 ${darkMode ? 'text-gray-300' : 'text-gray-700'} mr-3`} />
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Custom Instructions Compiler
            </h1>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="ml-auto px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>

          {/* Process Steps */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
            <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4`}>How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                  <Link className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-sm font-medium">1. Enter Repository URL</p>
              </div>
              <div className="hidden md:flex items-center justify-center">
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                  <FileCheck className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-sm font-medium">2. Select MD Files</p>
              </div>
              <div className="hidden md:flex items-center justify-center">
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-2">
                  <Download className="w-6 h-6 text-yellow-600" />
                </div>
                <p className="text-sm font-medium">3. Download Instructions</p>
              </div>
              <div className="hidden md:flex items-center justify-center">
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                  <Cog className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-sm font-medium">4. Activate in Settings</p>
              </div>
            </div>
            <div className={`mt-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} font-mono`}>To activate Custom Instructions in VS Code:</p>
              <code className={`block mt-2 text-xs ${darkMode ? 'bg-gray-600' : 'bg-gray-100'} p-2 rounded`}>
                "github.copilot.chat.codeGeneration.useInstructionFiles": true
              </code>
            </div>
          </div>

          {/* Main Content */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <div className="mb-6">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="Enter GitHub repository URL"
                  className={`flex-1 px-4 py-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none`}
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
                <div className={`border ${darkMode ? 'border-gray-700' : ''} rounded-lg p-4 mb-6 max-h-[60vh] overflow-y-auto`}>
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
    </div>
  );
}

export default App;