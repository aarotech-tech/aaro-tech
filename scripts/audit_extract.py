import os
import json

def get_files_with_extension(root_dir, extension):
    files_list = []
    for dirpath, dirnames, filenames in os.walk(root_dir):
        if "node_modules" in dirpath or ".next" in dirpath:
            continue
        for file in filenames:
            if file.endswith(extension):
                files_list.append(os.path.join(dirpath, file).replace("\\", "/"))
    return files_list

def main():
    root = "c:/Users/suriy/Documents/aarotech"
    src = os.path.join(root, "src")
    docs = os.path.join(root, "docs")
    
    pages = get_files_with_extension(os.path.join(src, "app"), "page.tsx")
    components = get_files_with_extension(os.path.join(src, "components"), ".tsx")
    modules = get_files_with_extension(os.path.join(src, "modules"), ".ts")
    
    analysis = {
        "pages": [p.replace(src, "") for p in pages],
        "components": [c.replace(src, "") for c in components],
        "modules": [m.replace(src, "") for m in modules]
    }
    
    with open(os.path.join(root, "artifacts", "analysis.json"), "w") as f:
        json.dump(analysis, f, indent=2)

if __name__ == "__main__":
    main()
