// Replaced JSON.parse/stringify with structuredClone for significantly better performance
const deepClone = (obj) => typeof structuredClone === "function" ? structuredClone(obj) : JSON.parse(JSON.stringify(obj));

export const setIn = (obj, path, value) => {
    const result = deepClone(obj);
    let current = result;
    
    for (let i = 0; i < path.length - 1; i++) {
        const key = path[i];
        if (current[key] === undefined || current[key] === null) {
            current[key] = typeof path[i + 1] === 'number' ? [] : {};
        }
        current = current[key];
    }
    
    current[path[path.length - 1]] = value;
    return result;
};

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
        current[targetKey] = []; 
    }
    
    current[targetKey].push(value);
    return result;
};

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