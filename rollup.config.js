import fs from "fs";
import path from "path";
import typescript from "@rollup/plugin-typescript";

const taskModulePath = path.resolve(__dirname, "./src/task");
const taskModule = fs.readdirSync(taskModulePath).map((fileName) => `${taskModulePath}/${fileName}`);

const commonConfig = {
  output: {
    dir: "dist",
    format: "iife",
  },
  plugins: [typescript()],
};

const finalConfig = [...taskModule].map((filePath) => {
  return {
    input: filePath,
    ...commonConfig,
  };
});

export default finalConfig;
