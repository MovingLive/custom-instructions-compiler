import { useEffect, useState } from "react";

import { Clipboard, Download, Loader2 } from "lucide-react";

import FileTree from "./FileTree";

import ReactMarkdown from "react-markdown";

import {
  autoSelectBasicFiles,
  filterEmptyFolders,
  getAllFolderPaths,
  getBasePath,
  processTree,
  TreeNode,
} from "./utils";

export default function WorkspaceSection() {
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [filename, setFilename] = useState("copilot-instructions.md");
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const [previewCopied, setPreviewCopied] = useState(false);

  useEffect(() => {
    loadLocalFiles();
  }, []);

  const loadLocalFiles = async () => {
    try {
      setLoading(true);

      setError("");

      const basePath = getBasePath();
      const response = await fetch(`${basePath}/file-list.json`);
      const items = await response.json();
      const processedTree = processTree(items);
      const filteredTree = filterEmptyFolders(processedTree);

      if (filteredTree.length === 0) {
        throw new Error("Aucun fichier markdown trouvé");
      }

      const newSelected = new Set<string>();
      autoSelectBasicFiles(filteredTree, newSelected);

      // Étendre tous les dossiers
      const allFolderPaths = getAllFolderPaths(filteredTree);
      setExpanded(new Set(allFolderPaths));
      setTreeData(filteredTree);
      setSelectedFiles(newSelected);
    } catch (err: any) {
      setError(err.message || "Échec du chargement des fichiers locaux");

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

  const handleFilePreview = async (path: string) => {
    if (previewFile === path) {
      setPreviewFile(null);
      setPreviewContent(null);
      return;
    }

    try {
      const basePath = getBasePath();

      const response = await fetch(`${basePath}/${path}`);

      const content = await response.text();

      setPreviewFile(path);

      setPreviewContent(content);
    } catch {
      setPreviewContent("Impossible de charger le contenu du fichier");
    }
  };

  const handleFileEdit = (path: string) => {
    const basePath = getBasePath();

    const githubUrl = `https://github.com/MovingLive/custom-instructions-compiler/edit/main/${basePath}/${path}`;

    window.open(githubUrl, "_blank");
  };

  const handlePreviewCopy = () => {
    if (previewContent) {
      navigator.clipboard.writeText(previewContent);

      setPreviewCopied(true);

      setTimeout(() => setPreviewCopied(false), 1000);
    }
  };

  const downloadSelectedFiles = async () => {
    try {
      setLoading(true);
      setError("");
      const basePath = getBasePath();
      const fileContents = await Promise.all(
        Array.from(selectedFiles).map(async (path) => {
          const response = await fetch(`${basePath}/${path}`);
          const content = await response.text();
          return `${content}`;
        })
      );

      const combinedContent = fileContents.join("");

      const blob = new Blob([new TextEncoder().encode(combinedContent)], {
        type: "text/markdown; charset=utf-8",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
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
    <div className="flex">
      <div className="w-1/2 pr-4">
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Select and compile custom instructions.
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
              onFilePreview={handleFilePreview}
              onFileEdit={handleFileEdit}
              expanded={expanded}
              onFileHover={() => {}}
              setExpanded={setExpanded}
              previewFile={previewFile || ""}
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

      {previewContent && (
        <div className="w-1/2 pl-4">
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600 dark:text-gray-300">Preview</p>

            <button
              onClick={handlePreviewCopy}
              className={`p-1 bg-transparent ${
                previewCopied
                  ? "text-green-500"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              } transition-colors`}
              aria-label="Copy preview to clipboard"
            >
              <Clipboard className="w-4 h-4 inline-block" />
            </button>
          </div>

          <div className="border dark:border-gray-700 rounded-lg p-4 mb-6 max-h-[60vh] overflow-y-auto">
            <ReactMarkdown className="text-sm text-gray-500 dark:text-gray-400 whitespace-pre-wrap">
              {previewContent}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
