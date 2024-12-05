export interface TreeNode {
  path: string;

  type: "file" | "tree";

  children?: TreeNode[];
}

export const getAllFolderPaths = (nodes: TreeNode[]): string[] => {
  const paths: string[] = [];

  nodes.forEach((node) => {
    if (node.type === "tree") {
      paths.push(node.path);

      if (node.children) {
        paths.push(...getAllFolderPaths(node.children));
      }
    }
  });

  return paths;
};

export const hasMarkdownFiles = (node: TreeNode): boolean => {
  if (node.type === "file") {
    return node.path.endsWith(".md");
  }

  return node.children?.some((child) => hasMarkdownFiles(child)) ?? false;
};

export const filterEmptyFolders = (nodes: TreeNode[]): TreeNode[] => {
  return nodes

    .map((node) => {
      if (node.type === "tree") {
        const filteredChildren = filterEmptyFolders(node.children || []);

        return {
          ...node,

          children: filteredChildren,
        };
      }

      return {
        ...node,

        type: "file",
      };
    })

    .filter((node) => {
      if (node.type === "file") {
        return node.path.endsWith(".md");
      }

      return hasMarkdownFiles(node);
    });
};

export const autoSelectBasicFiles = (
  nodes: TreeNode[],
  selected: Set<string>
) => {
  nodes.forEach((node) => {
    if (
      node.type === "file" &&
      node.path.toLowerCase().includes("basic") &&
      node.path.endsWith(".md")
    ) {
      selected.add(node.path);
    }

    if (node.children) {
      autoSelectBasicFiles(node.children, selected);
    }
  });
};

export const processTree = (items: any[]): TreeNode[] => {
  const nodes: { [key: string]: TreeNode } = {};

  const result: TreeNode[] = [];

  items.forEach((item) => {
    if (!item.path.endsWith(".md") && item.type !== "tree") return;

    const parts = item.path.split("/");

    let currentPath = "";

    parts.forEach((part: string, index: number) => {
      const parentPath = currentPath;

      currentPath = currentPath ? `${currentPath}/${part}` : part;

      if (!nodes[currentPath]) {
        const node: TreeNode = {
          path: currentPath,

          type: index === parts.length - 1 ? item.type : "tree",

          children: [],
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

export const getBasePath = () => {
  const isProd = window.location.hostname === 'movinglive.github.io';
  return isProd
    ? "/custom-instructions-compiler/custom-instructions-lib"
    : "/custom-instructions-lib";
};
