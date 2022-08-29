import * as fs from "fs";

export const sleep = (ms: number) => {
  console.log(`Waiting ${ms} ms`);
  return new Promise((b) => {
    setTimeout(b, ms);
  });
};

export const getRandomInt = (min: number, max: number): number => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const readFile = (srcPath: fs.PathOrFileDescriptor) => {
  return new Promise<string>((resolve, reject) => {
    fs.readFile(srcPath, "utf8", (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

export const writeFile = (savePath: fs.PathOrFileDescriptor, data: string) => {
  return new Promise<void>((resolve, reject) => {
    fs.writeFile(savePath, data, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};
