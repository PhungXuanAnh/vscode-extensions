export const runShellCommand = async (command: string): Promise<void> => {
    const { exec } = require('child_process');

    return new Promise<void>((resolve, reject) => {
        exec(command, (error: any, _: any, stderr: any) => {
            if (error) {
                reject(error);
            }
            if (stderr) {
                reject(stderr);
            }
            resolve();
        });
    });
}