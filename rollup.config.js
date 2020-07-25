
import {nodeResolve} from "@rollup/plugin-node-resolve";

export default {
    input: "dist/piano.js",
    output: {
        file: "dist/index.umd.js",
        format: "umd"
    },
    plugins: [nodeResolve()]
}