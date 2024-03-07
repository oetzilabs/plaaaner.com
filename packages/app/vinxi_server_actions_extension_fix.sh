#!/bin/bash


for file in ./.vinxi/build/server-fns/_server/c_*.js; do
  if [ -f "$file" ]; then
    new_name="${file%.js}.mjs"
    echo "Renaming $file to $new_name"
    mv "$file" "$new_name"
  fi
done

echo "Files renamed successfully."

