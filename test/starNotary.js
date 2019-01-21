//import 'babel-polyfill';
const StarNotary = artifacts.require("./starNotary.sol");

let instance;
let accounts;

contract("StarNotary", async accs => {
  accounts = accs;
  instance = await StarNotary.deployed();
});

it("can Create a Star", async () => {
  let tokenId = 1;
  await instance.createStar("Awesome Star!", tokenId, { from: accounts[0] });
  assert.equal(await instance.tokenIdToStarInfo.call(tokenId), "Awesome Star!");
});

it("lets user1 put up their star for sale", async () => {
  let user1 = accounts[1];
  let starId = 2;
  let starPrice = web3.toWei(0.01, "ether");
  await instance.createStar("awesome star", starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it("lets user1 get the funds after the sale", async () => {
  let user1 = accounts[1];
  let user2 = accounts[2];
  let starId = 3;
  let starPrice = web3.toWei(0.01, "ether");
  await instance.createStar("awesome star", starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  let balanceOfUser1BeforeTransaction = web3.eth.getBalance(user1);
  await instance.buyStar(starId, { from: user2, value: starPrice });
  let balanceOfUser1AfterTransaction = web3.eth.getBalance(user1);
  assert.equal(
    balanceOfUser1BeforeTransaction.add(starPrice).toNumber(),
    balanceOfUser1AfterTransaction.toNumber()
  );
});

it("lets user2 buy a star, if it is put up for sale", async () => {
  let user1 = accounts[1];
  let user2 = accounts[2];
  let starId = 4;
  let starPrice = web3.toWei(0.01, "ether");
  await instance.createStar("awesome star", starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  let balanceOfUser1BeforeTransaction = web3.eth.getBalance(user2);
  await instance.buyStar(starId, { from: user2, value: starPrice });
  assert.equal(await instance.ownerOf.call(starId), user2);
});

it("lets user2 buy a star and decreases its balance in ether", async () => {
  let user1 = accounts[1];
  let user2 = accounts[2];
  let starId = 5;
  let starPrice = web3.toWei(0.01, "ether");
  await instance.createStar("awesome star", starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  let balanceOfUser1BeforeTransaction = web3.eth.getBalance(user2);
  const balanceOfUser2BeforeTransaction = web3.eth.getBalance(user2);
  await instance.buyStar(starId, {
    from: user2,
    value: starPrice,
    gasPrice: 0
  });
  const balanceAfterUser2BuysStar = web3.eth.getBalance(user2);
  assert.equal(
    balanceOfUser2BeforeTransaction.sub(balanceAfterUser2BuysStar),
    starPrice
  );
});

describe("check star owner", () => {
  it("star has the rightful owner", async function() {
    defaultUser = accounts[0];
    let starId = 6;
    await instance.createStar("awesome star", starId, {
      from: defaultUser
    });
    var owner = await instance.ownerOf.call(starId);

    assert.equal(owner, defaultUser);
  });
});
// Write Tests for:

// 1) The token name and token symbol are added properly.
// 2) 2 users can exchange their stars.
// 3) Stars Tokens can be transferred from one address to another.

describe("The token name and token symbol are added properly", () => {
  it("Check token name equal to Star Notary", async function() {
    let tokenName = await instance.name.call();

    assert.equal(tokenName, "Star Notary");
  });
  it("Check token symbol equal to SNY", async function() {
    let tokenName = await instance.symbol.call();

    assert.equal(tokenName, "SNY");
  });
});

it("Stars Tokens can be transferred from one address to another", async function() {
  let account1 = accounts[0];
  let account2 = accounts[1];
  let starId = 9;
  await instance.createStar("Awesome Star!", starId, { from: account1 });
  await instance.transferStar(account2, starId, { from: account1 });

  assert.equal(await instance.ownerOf.call(starId), account2);
});

it("let 2 users exchange their stars", async () => {
  let account1 = accounts[1];
  let account2 = accounts[2];
  let account3 = accounts[3];
  let starId1 = 10;
  let starId2 = 11;
  await instance.createStar("Awesome Star1!", starId1, { from: account1 });
  await instance.createStar("Awesome Star2!", starId2, { from: account2 });

  await instance.approve(account3, starId1, { from: account1 });
  await instance.approve(account3, starId2, { from: account2 });

  await instance.exchangeStars(account1, account2, starId1, starId2, {
    from: account3
  });

  let ownerStarId2 = await instance.ownerOf(starId2);
  let ownerStarId1 = await instance.ownerOf(starId1);
  expect([ownerStarId2, ownerStarId1]).to.deep.equal([account1, account2]);
});
