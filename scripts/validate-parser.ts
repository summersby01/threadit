import { parseCrochetRow } from "../lib/tracker/parse-crochet-row";
import { parseKnittingRow } from "../lib/tracker/parse-knitting-row";

const knittingInputs = [
  "K10, P10",
  "K5, P5, K5",
  "P10, K10K10 P10",
  "K 10 P 10",
  "k10 p10",
  "k 10 p 10*K2, P2* 5",
  "*K2 P2* 5",
  "K2 P2 repeat 5",
  "K2 P2 x5K3, P2, K1, P4",
  "K2 P2 K2 P2",
  "K10, P5, K5K10,, P10",
  "K10 P10 P",
  "K 10 , P 10",
  "K10 ,P10",
  "k10,p10",
];

const crochetInputs = [
  "sc 6",
  "sc 10",
  "dc 12",
  "hdc 8sc 6 in MR",
  "sc6 in mr",
  "sc 6 mrinc x6",
  "inc 6",
  "2sc in each stitch",
  "sc 3, inc, sc 3",
  "sc3 inc sc3",
  "sc 2, inc x3",
  "(sc 1, inc) x6",
  "sc 1 inc repeat 6",
  "(sc, inc)*6",
  "sc6inc6",
  "sc 6 ,inc",
  "sc,sc,sc,inc",
  "incincinc",
];

function printResults(label: string, inputs: string[], parser: (input: string) => unknown) {
  console.log(`\n=== ${label} ===`);

  for (const input of inputs) {
    console.log(`\nINPUT: ${input}`);
    console.log(JSON.stringify(parser(input), null, 2));
  }
}

printResults("KNITTING", knittingInputs, parseKnittingRow);
printResults("CROCHET", crochetInputs, parseCrochetRow);
