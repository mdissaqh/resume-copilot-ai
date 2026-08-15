const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

/**
 * Safely sets a value at a deeply nested path.
 * @param {Object} obj - The state object
 * @param {Array} path - Array of keys, e.g., ['personalInfo', 'links', 0, 'url']
 * @param {any} value - The value to set
 */
export const setIn = (obj, path, value) => {
    const result = deepClone(obj);
    let current = result;
    
    for (let i = 0; i < path.length - 1; i++) {
        const key = path[i];
        if (current[key] === undefined || current[key] === null) {
            // If the next key is a number, initialize an array; otherwise an object
            current[key] = typeof path[i + 1] === 'number' ? [] : {};
        }
        current = current[key];
    }
    
    current[path[path.length - 1]] = value;
    return result;
};

/**
 * Safely pushes an item into a deeply nested array.
 * @param {Object} obj - The state object
 * @param {Array} path - Array of keys pointing to the array, e.g., ['personalInfo', 'links']
 * @param {any} value - The item to append
 */
export const pushIn = (obj, path, value) => {
    const result = deepClone(obj);
    let current = result;
    
    for (let i = 0; i < path.length - 1; i++) {
        const key = path[i];
        if (current[key] === undefined || current[key] === null) {
            current[key] = typeof path[i + 1] === 'number' ? [] : {};
        }
        current = current[key];
    }
    
    const targetKey = path[path.length - 1];
    if (!Array.isArray(current[targetKey])) {
        current[targetKey] = []; // Initialize as array if it doesn't exist
    }
    
    current[targetKey].push(value);
    return result;
};

/**
 * Safely removes an item from a deeply nested array by index.
 * @param {Object} obj - The state object
 * @param {Array} path - Array of keys pointing to the array, e.g., ['projects']
 * @param {number} index - The index of the item to remove
 */
export const removeIn = (obj, path, index) => {
    const result = deepClone(obj);
    let current = result;
    
    for (let i = 0; i < path.length - 1; i++) {
        const key = path[i];
        if (current[key] === undefined || current[key] === null) {
            return result;
        }
        current = current[key];
    }
    
    const targetKey = path[path.length - 1];
    if (Array.isArray(current[targetKey])) {
        current[targetKey].splice(index, 1);
    }
    
    return result;
};