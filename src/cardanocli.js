const os = require("os");
const path = require("path");
const fetch = require("sync-fetch");
const CardanocliJs = require("cardanocli-js");

const shelleyGenesisPath = __dirname + "/mainnet-shelley-genesis.json";

exports.cardanocliJs = new CardanocliJs({ shelleyGenesisPath });