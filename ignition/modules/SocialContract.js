const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("SocialContractModule", (m) => {
  const socialContract = m.contract("SocialContract");

  return { socialContract };
});