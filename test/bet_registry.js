var chai = require("chai");
var expect = chai.expect;
var Web3latest = require('web3');
var web3 = new Web3latest();

const BetKernel = artifacts.require("BetKernel");
const BetOracle = artifacts.require("BetOracle");
const BetPayments = artifacts.require("BetPayments");
const BetTerms = artifacts.require("BetTerms");
const BetRegistry = artifacts.require("BetRegistry");
// Bet Payments Proxy
const ERC20PaymentProxy = artifacts.require("ERC20PaymentProxy");
const DummyToken = artifacts.require("DummyToken");
// BetTerms Proxy
const OwnerBased = artifacts.require("OwnerBased");
// BetOracle Proxy
const OwnerBasedOracle = artifacts.require("OwnerBasedOracle");

contract("Bet Registry Test", async (accounts) => {
    var betKernel;
    var betOracle;
    var betPayments;
    var betTerms;
    var betRegistry;
    var betHash;
    // Bet Payments
    var erc20PaymentProxy;
    var token;
    // Bet Terms
    var ownerBased;
    var termsHash;
    // Bet Oracle
    var ownerBasedOracle;

    const CONTRACT_OWNER = accounts[0];

    const BETTER_1 = accounts[1];
    const BETTER_2 = accounts[2];
    const WINNER_1 = accounts[3];

    before(async () => {
        betKernel = await BetKernel.new();
        betPayments = await BetPayments.new();
        betOracle = await BetOracle.new();
        betTerms = await BetTerms.new();

        betRegistry = await BetRegistry.new(
            betKernel.address,
            betPayments.address,
            betOracle.address,
            betTerms.address
        );
        // Setting bet payments
        erc20PaymentProxy = await ERC20PaymentProxy.new();
        token = await DummyToken.new(
            "DummyToken",
            "DMT",
            10,
            10
        );       
        await token.setBalance(BETTER_1, 5);
        await token.setBalance(BETTER_2, 5);
        // Setting the terms
        ownerBased = await OwnerBased.new();
        termsHash = await ownerBased.getTermsHash.call();
        // Setting the oracle
        ownerBasedOracle = await OwnerBasedOracle.new();
        
    });

    it("should have set the proper addresses", async () => {
        const kernelAddress = await betRegistry.betKernel.call();
        const paymentsAddress = await betRegistry.betPayments.call();
        const oracleAddress = await betRegistry.betOracle.call();
        const termsAddress = await betRegistry.betTerms.call();
        expect(
            kernelAddress
        ).to.be.equal(betKernel.address);
        expect(
            paymentsAddress
        ).to.be.equal(betPayments.address);
        expect(
            oracleAddress
        ).to.be.equal(betOracle.address);
        expect(
            termsAddress
        ).to.be.equal(betTerms.address);
    });

    it("should be able to create a bet witht the proper hash", async () => {
        betHash = await betRegistry.createBet.call(
            erc20PaymentProxy.address,
            token.address,
            ownerBasedOracle.address,
            ownerBased.address,
            termsHash,
            1 // Salt
        );
        await betRegistry.createBet(
            erc20PaymentProxy.address,
            token.address,
            ownerBasedOracle.address,
            ownerBased.address,
            termsHash,
            1 // Salt
        );

    });

    it("should return the data of the bet", async () => {
        expect(
            await betRegistry.getBetCreator.call(betHash)
        ).to.be.equal(CONTRACT_OWNER);
    });
});