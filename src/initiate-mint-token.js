const { initateMint } = require("./mint-token");

async function main(){

    // CHANGE THIS //
    const amount = 10000;
    const receiver = "addr1qxjv6vz3794dwm5nsy9dalhsynx2vaqksxrlm5ahhv39me227y7yh66450vszly6205te5v282r92002cmd4aqdzdm0qrgzp8u";

    const txHash = await initateMint(amount, receiver);
    console.log("Token Minted, TxHash: " + txHash);

}

main()