import { execSync } from 'child_process';
export const runNpxCommand = commandName => {
  try {
    const output = execSync(` ${commandName}`, { encoding: 'utf-8' });
    return output.trim();
  } catch (error) {
    console.error(error.stderr.toString().trim());
    throw error;
  }
};
