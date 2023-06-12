const { cardanocliJs } = require("./cardanocli");
const walletName  = "TransferNFT";

const utxos = cardanocliJs.wallet(walletName).balance().utxo;
const balance = cardanocliJs.wallet(walletName).balance().value.lovelace;


console.log(utxos)
console.log("Balance: " + (balance / 1000000) + " ADA")

// console.log(utxos[0].value.lovelace)
