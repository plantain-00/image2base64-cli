import * as cli from "../dist/index";

cli.run(["demo/favicon.ico"], "demo/variables.json", "demo/variables.scss", "demo/variables.less").then(() => {
    console.log("success");
});
