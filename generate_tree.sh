#!/bin/bash

# Function to generate tree structure
generate_tree() {
    local dir="$1"
    local prefix="$2"
    local is_last="$3"
    
    local files=()
    local dirs=()
    
    # Skip node_modules and .git
    if [[ "$dir" == *"node_modules"* ]] || [[ "$dir" == *".git"* ]]; then
        return
    fi
    
    # Read directory contents
    while IFS= read -r -d '' item; do
        local basename=$(basename "$item")
        if [[ -d "$item" ]]; then
            dirs+=("$item")
        else
            files+=("$item")
        fi
    done < <(find "$dir" -maxdepth 1 -not -path "$dir" -print0 2>/dev/null | sort -z)
    
    local total=$((${#dirs[@]} + ${#files[@]}))
    local count=0
    
    # Print directories first
    for d in "${dirs[@]}"; do
        count=$((count + 1))
        local basename=$(basename "$d")
        local is_last_item=$((count == total))
        
        if [[ $is_last_item -eq 1 ]]; then
            echo "${prefix}└── ${basename}/ 📁"
            generate_tree "$d" "${prefix}    " 1
        else
            echo "${prefix}├── ${basename}/ 📁"
            generate_tree "$d" "${prefix}│   " 0
        fi
    done
    
    # Then print files
    for f in "${files[@]}"; do
        count=$((count + 1))
        local basename=$(basename "$f")
        local is_last_item=$((count == total))
        
        if [[ $is_last_item -eq 1 ]]; then
            echo "${prefix}└── ${basename} 📄"
        else
            echo "${prefix}├── ${basename} 📄"
        fi
    done
}

echo "planora.ai/"
generate_tree "." ""
