export function add(...numbers) {
  return numbers.reduce((result, number) => {
    return result + number;
  }, 0);
}

export function deserialize(value) {
  // Check for non-serializable objects first
  if (typeof value !== "object") {
    // Check for timestamp syntax
    if (/^t:\d+$/.test(value)) {
      const timestamp = parseInt(value.slice(2), 10);
      return convertTimestampToDDMMYYYY(timestamp);
    }

    return value;
  }

  // Perform deserialization
  return Object.keys(value).reduce((result, key) => {
    const matches = key.match(/^(\w+)(\d+)_(\w+)$/);

    // Keys that don't match the pattern should just be used as-is
    if (!matches || matches.length < 4) {
      result[key] = value[key];
      return result;
    }

    const [matchResult, arrayKey, arrayIndexStr, subKey] = matches;
    const arrayIndex = parseInt(arrayIndexStr, 10);

    // Initialise the properties, if not already created
    if (!result[arrayKey]) {
      result[arrayKey] = [];
    }
    if (!result[arrayKey][arrayIndex]) {
      result[arrayKey][arrayIndex] = {};
    }

    // Deserialize the values, being sure not to lose any existing results
    result[arrayKey][arrayIndex] = {
      ...result[arrayKey][arrayIndex],
      [subKey]: deserialize(value[key])
    };

    return result;
  }, {});
}

export function listToObject(list) {
  return list.reduce((result, item) => {
    const { name, value } = item;

    result[name] = dereferenceValue(value);

    return result;
  }, {});
}

export function objectToList(obj) {
  return Object.keys(obj).reduce((result, key) => {
    const value = obj[key];

    result.push({
      name: key,
      value: dereferenceValue(value)
    });

    return result;
  }, []);
}

function dereferenceValue(value) {
  if (typeof value === "object") {
    if (Array.isArray(value)) {
      return [...value];
    } else {
      return { ...value };
    }
  }

  return value;
}

function convertTimestampToDDMMYYYY(timestamp) {
  const date = new Date(timestamp);

  let month = date.getMonth() + 1;
  if (month < 10) {
    month = `0${month}`;
  }

  return `${date.getDate()}/${month}/${date.getFullYear()}`;
}
