const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("PostContractModule", (m) => {
  const postContract = m.contract("PostContract");

  return { postContract };
});