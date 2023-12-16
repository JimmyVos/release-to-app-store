import fs from 'fs';
import util from 'util';

const readFileAsync = util.promisify(fs.readFile);

export const encodedKey = (data: Record<string, string>): string => {
  try {
    return Buffer.from(JSON.stringify(data), 'utf8').toString('base64');
  } catch (error) {
    console.error('encodedKey error', error);
    throw new Error('encodedKey error');
  }
};

export const decodeKey = (data: string): Record<string, string> => {
  try {
    return JSON.parse(Buffer.from(data, 'base64').toString('utf8'));
  } catch (error) {
    console.error('decodeKey error', error);
    throw new Error('decodeKey error');
  }
};

export const readJSONFile = async (filePath: string): Promise<Record<string, string>> => {
  try {
    const data = await readFileAsync(filePath, 'utf8');
    const jsonData = JSON.parse(data);
    return jsonData;
  } catch (error) {
    console.error('Error reading or parsing JSON', error);
    throw new Error('Error reading or parsing JSON');
  }
};
